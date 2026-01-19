
import { Response, Request } from "express";
import Content from "../models/contentModel"
import { Tag } from "../models/contentModel"
import mongoose, { Types } from "mongoose";
import { ContentInput, contentSchema } from "../schemas/contentSchema";



// const detectLinkType = (link: string): string => {
//   try {
//     const parsedUrl = new URL(link)
//     const hostName = parsedUrl.hostname;
//     if (hostName.includes("youtube.com") || hostName.includes("youtu.be")) {
//       return "youtube"
//     } else if (hostName.includes("x.com")) {
//       return "twitter";
//     } else if (hostName.includes("facebook.com")) {
//       return "facebook";
//     } else if (hostName.includes("linkedin.com")) {
//       return "linkedIn";
//     } else if (hostName.includes("github.com")) {
//       return "gitHub";
//     } else if (hostName.includes("reddit.com")) {
//       return "reddit";
//     } else {
//       return "other"
//     }
//   } catch (error) {
//     return "Invalid URL";
//   }
// }

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
   const [newContent] = await Content.create(
      [
        {
          title: data.title,
          description: data.description,
          link: data.link,
          tags: tagIds,
          type: data.type,
          userId: new mongoose.Types.ObjectId(req.userId),
        },
      ],
      { session }
    );

    await session.commitTransaction();
    session.endSession();

    if (!newContent) {
      res.status(422).json({
        message: "Internal server error!"
      })
      return;
    }

    res.status(201).json({ message: "Content created", content: newContent });

  } catch (error) {
    console.error("Error creating content:", error);
    await session.abortTransaction();
    session.endSession();
    res.status(500).json({ message: "Server error" });
  }

}

export const getAllContent = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;

    if (!userId) {
      res.status(403).json({ message: "Unauthorized access" });
      return;
    }

    const allContent = await Content.find({ userId: userId }).populate({ path: "tags", select: "tagName -_id" }).exec()

    if (allContent.length === 0) {
      res.status(404).json({ message: "No content found" });
      return;
    }
    res.status(200).json({ data: allContent });
  } catch (error) {
    console.error("Error fetching content:", error);
    res.status(500).json({ message: "Internal server error" });
    return;
  }
};
