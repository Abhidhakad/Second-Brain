import { Response, Request } from "express";
import Content from "../models/contentModel"
import { Tag, Brain } from "../models/contentModel"
import mongoose, { Types } from "mongoose";
import { ContentInput, contentSchema } from "../schemas/contentSchema";
import { generateLink } from "../utils/generateHash";
import { detectLinkType } from "../utils/detectLinkType";
import { openai } from "../config/openAiConfig";
import { analyzeContentSchema } from "../schemas/contentSchema";
import { buildAnalyzePrompt } from "../utils/buildPrompt";
import { AIAnalysisResult } from "../types/ai.types";
import { AIResultSchema } from "../schemas/contentSchema"
import { mockAIResult } from "../utils/mock";




export const createContent = async (req: Request, res: Response): Promise<void> => {
  const session = await mongoose.startSession();
  try {
    const userId = req.userId;

    if (!userId) {
      res.status(403).json({ message: "Unauthorized access" });
      return;
    }
    const result = contentSchema.safeParse(req.body);
    if (!result.success) {
      res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: result.error.flatten(),
      });
      return;
    }

    const data: ContentInput = result.data;

    const linkType = detectLinkType(data.link);

    session.startTransaction();

    const tagIds: Types.ObjectId[] = []
    for (const tagName of data.tags) {
      const trimmeddTagName = tagName.trim().toLowerCase();

      const tag = await Tag.findOneAndUpdate(
        { tagName: trimmeddTagName },           // find condition
        { tagName: trimmeddTagName },           // data to insert/update
        { upsert: true, new: true, session }
      );
      tagIds.push(tag._id);
    }
    const [created] = await Content.create(
      [
        {
          title: data.title,
          description: data.description,
          link: data.link,
          tags: tagIds,
          type: linkType,
          userId: new mongoose.Types.ObjectId(req.userId),
        },
      ],
      { session }
    );

    await session.commitTransaction();
    session.endSession();

    const newContent = await Content.findById(created._id)
      .populate({
        path: "tags",
        select: "tagName",
      })
      .select("-__v")
      .lean();

    if (!newContent) {
      res.status(422).json({
        message: "Internal server error!"
      })
      return;
    }
    res.status(201).json({
      message: "Content created",
      data: newContent,
    });
  } catch (error) {
    console.error("Error creating content:", error);
    await session.abortTransaction();
    session.endSession();
    res.status(500).json({ message: "Server error" });
  }

}

export const getAllContent = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = req.userId;

    if (!userId) {
      res.status(403).json({ message: "Unauthorized access" });
      return;
    }

    const contents = await Content.find({ userId })
      .populate({
        path: "tags",
        select: "_id tagName",
      })
      .select("-__v")
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({
      data: contents,
    });

  } catch (error) {
    console.error("Error fetching content:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const deleteContent = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    const contentId = req.params.contentId;

    if (!userId) {
      res.status(403).json({ message: "Unauthorized access" });
      return;
    }
    const deletedContent = await Content.findOneAndDelete({
      _id: contentId,
      userId: userId
    });

    if (!deletedContent) {
      res.status(404).json({ message: "Content not found or unauthorized" });
      return;
    }

    res.status(200).json({ message: "Content deleted successfully" });
  } catch (error) {
    console.log("Error deleting content:", error);
    res.status(500).json({ message: "Internal server error" });
    return;
  }
}

export const shareBrain = async (req: Request, res: Response): Promise<void> => {
  try {
    const { share } = req.body;
    const userId = req.userId;
    if (!userId) {
      res.status(403).json({ message: "Unauthorized access" });
      return;
    }
    if (share === undefined) {
      res.status(400).json({ message: "Share parameter is required" });
      return;
    }
    if (share) {
      const sharedBrain = await Brain.findOne({ _id: share.brainId, userId: userId });

      if (sharedBrain) {
        res.status(200).json({ message: "Brain already shared", brainLink: sharedBrain.hash });
        return;
      } else {
        const hash = await generateLink(12);
        const newBrain = new Brain({
          userId: userId,
          hash: hash
        });
        await newBrain.save();
        res.status(201).json({ message: "Brain shared successfully", brainLink: newBrain.hash });
        return;
      }
    } else {
      await Brain.deleteOne({ userId: userId });
      res.status(200).json({ message: "Brain unshared successfully" });
      return;
    }
  } catch (error) {
    console.error("Error sharing brain:", error);
    res.status(500).json({ message: "Internal server error" });
    return;
  }
}

export const accessSharedBrain = async (req: Request, res: Response): Promise<void> => {
  try {
    const hash = req.params.hash;
    if (!hash) {
      res.status(400).json({ message: "Invalid brain link" });
      return;
    }
    const sharedBrain = await Brain.findOne({ hash: hash });
    if (!sharedBrain) {
      res.status(404).json({ message: "Shared brain not found" });
      return;
    }

    const brainContent = await Content.find({
      userId: sharedBrain.userId,
      public: true
    })
      .populate([
        {
          path: "tags",
          select: "tagName -_id"
        },
        {
          path: "userId",
          select: "username"
        }
      ])
      .exec();


    res.status(200).json({ data: brainContent });
    return;

  } catch (error) {
    console.error("Error accessing shared brain:", error);
    res.status(500).json({ message: "Internal server error" });
    return;
  }
}

export const makeContentPublic = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.userId;
    if (!userId) {
      res.status(403).json({ message: "Unauthorized access" });
      return;
    }
    const contentId = req.params.contentId;
    if (!contentId) {
      res.status(400).json({ message: "Content ID is required" });
      return;
    }
    const makePublic = req.body.public;
    if (makePublic) {
      await Content.updateOne({ _id: contentId, userId: userId }, { public: true });
      res.status(200).json({ message: "Content made public" });
      return;
    }
    else {
      await Content.updateOne({ _id: contentId, userId: userId }, { public: false });
      res.status(200).json({ message: "Content made private" });
      return;
    }
  } catch (error) {
    console.error("Error updating content visibility:", error);
    res.status(500).json({ message: "Internal server error" });
    return;
  }
}

export const searchTags = async (req: Request, res: Response): Promise<void> => {
  try {
    const searchStr = String(req.query.searchStr || "").trim();

    if (searchStr.length < 2) {
      res.status(200).json([]);
      return;
    }

    console.log("search: ", searchStr);

    const tags = await Tag.find({
      tagName: { $regex: `^${searchStr}`, $options: "i" },
    })
      .limit(5)
      .select("_id tagName")
      .lean();

    res.status(200).json(tags);
    return;
  } catch (error) {
    console.error("Error in search tag:", error);
    res.status(500).json({ message: "Internal server error" });
    return;
  }
}

export const analyzeContent = async (req: Request, res: Response): Promise<void> => {
  try {
    const parsed = analyzeContentSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid request body" });
      return;
    }

    const { contentId } = parsed.data;

    const content = await Content.findById(contentId)
      .populate("tags", "tagName")
      .select("-type -userId -public -createdAt -updatedAt")
      .lean();


    if (!content) {
      res.status(404).json({ error: "Content not found" });
      return;
    }
    const normalizedContent = {
      title: content.title,
      description: content.description,
      link: content.link,
      tags: content.tags?.length ? content.tags.map((tag: any) => tag.tagName) : [],
    };

    // Mock AI response is used in development to avoid paid external dependency 😒
    // (Yes, this is a side-project reality 😅)

    if (process.env.AI_MODE === "mock") {
      res.json({
        success: true,
        data: mockAIResult,
        source: "mock",
      });
      return;
    }

    const prompt = buildAnalyzePrompt(normalizedContent);

    const completion = await openai.chat.completions.create(
      {
        model: "gpt-4.1-mini",
        temperature: 0.3,
        messages: [
          { role: "system", content: "You are a strict JSON-only API." },
          { role: "user", content: prompt },
        ],
      },
      { timeout: 15_000 }
    );

    const raw = completion.choices[0]?.message?.content;
    if (!raw) throw new Error("Empty AI response");

    let aiResult: AIAnalysisResult;
    try {
      aiResult = AIResultSchema.parse(JSON.parse(raw));
    } catch {
      throw new Error("Invalid JSON from AI");
    }

    res.json({
      success: true,
      data: aiResult,
    });
    return;
  } catch (error) {
    console.error("AI ERROR:", error);
    res.status(500).json({
      success: false,
      error: "AI analysis failed",
    });
    return
  }
}