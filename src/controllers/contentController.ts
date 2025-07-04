
import { Response,Request } from "express";
import Content from "../models/contentModel"
import { Tag } from "../models/contentModel"
import { Types } from "mongoose";

export const createContent = async (req:Request, res: Response) => {
    try {
        const { title, description, link, tags, type } = req.body;
        const userId = req.user?.id;
        if (!userId || !title || !link || !type || !Array.isArray(tags)) {
            res.status(400).json({ message: "Invalid input" });
            return;
        }

        const tagIds:Types.ObjectId[]=[]
        for(const tagName of tags){
            const trimmeddTagName = tagName.trim().toLowerCase();

            let tag = await Tag.findOne({tagName:trimmeddTagName});
            if(!tag){
                tag = await Tag.create({tagName:trimmeddTagName});
            }
            tagIds.push(tag._id);
        }
        const newContent = await Content.create({
            title,
            description,
            link,
            tags:tagIds,
            type,
            userId
        })
        if(!newContent){
            res.status(422).json({
                message:"Internal server error!"
            })
            return;
        }

        res.status(201).json({ message: "Content created", content: newContent });

    } catch (error) {
        console.error("Error creating content:", error);
        res.status(500).json({ message: "Server error" });
    }

}

export const getAllContent = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      res.status(403).json({ message: "Unauthorized access" });
      return;
    }

    const allContent = await Content.find({ userId: userId })

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
