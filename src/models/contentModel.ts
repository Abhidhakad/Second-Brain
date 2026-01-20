import mongoose from "mongoose";


export enum ContentType {
    DOCUMENT = "document",
    TWEET = "tweet",
    YOUTUBE = "youtube",
    LINK = "link",
    OTHERS = "others",
}


interface IContent {
    title: string;
    description: string;
    link: string;
    tags: mongoose.Types.ObjectId[];
    type?: ContentType;
    userId: mongoose.Types.ObjectId;
    public?: boolean;   
}

// interface IContentDocument extends IContent, Document { }

const contentSchema = new mongoose.Schema<IContent>({
    title: {
        type: String,
        required: [true, "Title is required"],
        maxLength: [500, "Title can`t exceed more than 500 characters"],
        trim: true,
        index: true
    },
    description: {
        type: String,
        required: [true, "Description is required"],
        maxLength: [1000, "description can`t exceed more than 1000 characters"],
        trim: true,
    },
    link: {
        type: String,
        required: true,
        trim: true
    },
    tags: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Tag",
        },
    ],
    type: {
        type: String,
        enum: Object.values(ContentType),
        default: ContentType.OTHERS,
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: [true, "UserId is required"],
        index: true
    },
    public: {
        type: Boolean,
        default: false,
    },
}, { timestamps: true })

export default mongoose.model<IContent>("Content", contentSchema);







interface ITag extends Document {
    tagName: string
}

const TagSchema = new mongoose.Schema<ITag>({
    tagName: {
        type: String,
        unique: true,
        required: true,
        lowercase: true,
        trim: true,
    }
})

export const Tag = mongoose.model<ITag>("Tag", TagSchema);



// link schema 
interface IBrain extends Document {
    hash: string;
    userId: mongoose.Types.ObjectId;
}

export const brainSchema = new mongoose.Schema<IBrain>({
    hash: {
        type: String,
        required: true,
        trim: true,
        unique: true,
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        unique: true,
    },
},{ timestamps: true }); 

export const Brain = mongoose.model<IBrain>("Brain", brainSchema);