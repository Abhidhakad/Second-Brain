import mongoose, { Document, Schema, Model } from "mongoose";
import bcrypt from "bcrypt";

interface IUser {
  username: string;
  password: string;
}


export interface IUserDocument extends IUser, Document {
  comparePassword(candidatePassword: string): Promise<boolean>;
}


const userSchema = new Schema<IUserDocument>({
  username: {
    type: String,
    unique: true,
    required: [true, "Username is required"],
    trim: true,
    maxLength: [50, "Username can’t exceed more than 50 characters"],
  },
  password: {
    type: String,
    required: [true, "Password is required"],
    minLength: [6, "Password must be at least 6 characters"],
  },
},{timestamps:true});


userSchema.pre<IUserDocument>("save", async function (next) {
  if (!this.isModified("password")) return next();
  try {
    this.password = await bcrypt.hash(this.password, 10);
    return next();
  } catch (error) {
    return next(error as any);
  }
});


userSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};


const UserModel: Model<IUserDocument> = mongoose.model<IUserDocument>(
  "User",
  userSchema
);

export default UserModel;
