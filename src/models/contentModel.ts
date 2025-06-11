import express from "express";
import mongoose from "mongoose";

interface IContent extends Document {
    title: string,
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
  },
})

export default mongoose.model<IContent>("Content", contentSchema);