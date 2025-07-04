import mongoose from "mongoose";
import { string } from "zod";

interface IContent extends Document {
    title: string,
    description:string
    link: string,
    tags: mongoose.Types.ObjectId[];
    type?: string,
    userId: mongoose.Types.ObjectId;
}

const contentSchema = new mongoose.Schema<IContent>({
    title: {
        type: String,
        required: [true, "Title is required"],
        maxLength: [500, "Title can`t exceed more than 500 characters"],
        trim: true,
        index: true
    },
    description:{
        type: String,
        required: [true, "Description is required"],
        maxLength: [1000, "description can`t exceed more than 1000 characters"],
        trim: true,
    },
    link: {
        type: String,

    },
    tags: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Tag",
        },
    ],
    type: {
        type: String
    },
    userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: [true, "UserId is required"],
    index:true
  },
},{timestamps:true})

export default mongoose.model<IContent>("Content", contentSchema);



const TagSchema = new mongoose.Schema({
    tagName:{
        type:String,
        unique:true,
        required:true,
        lowercase:true,
        trim:true,
    }
})

export const Tag = mongoose.model("Tag",TagSchema);