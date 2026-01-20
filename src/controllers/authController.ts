import e, { Request, Response } from "express";
import { authSchema } from "../schemas/authSchems";
import User from "../models/userModel";


export const loginUserController = async (req: Request, res: Response):Promise<void> => {
  try {
    const result = authSchema.safeParse(req.body);

    if (!result.success) {
      res.status(400).json({
        message: "Validation failed",
        errors: result.error.flatten(),
      });
      return;
    }

    const { username, password } = result.data;

    const user = await User.findOne({ username });

    if (!user || !(await user.comparePassword(password))) {
      res.status(401).json({ message: "Invalid Username or password" });
      return;
    }
    const token = await user.getAuthToken();
    res
      .cookie("token", token, {
        httpOnly: true,
        maxAge: 7 * 24 * 60 * 60 * 1000, 
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
      })
      .status(200)
      .json({ message: "Logged in Successfully" });

  } catch (error) {
    console.error("Error in login controller:", error);
    res.status(500).json({
      message: "Something went wrong. Please try again later.",
    });
    return;
  }
};

export const signUpUserController = async (req: Request, res: Response):Promise<void> => {
  try {
    const result = authSchema.safeParse(req.body);

    if (!result.success) {
      res.status(411).json({
        success: false,
        message: "Validation failed",
        errors: result.error.flatten(),
      });
      return;
    }

    const { username, password } = result.data;

    const existingUser = await User.findOne({ username });
    if (existingUser) {
      res.status(403).json({
        success: false,
        message: "User already exists",
      });
      return;
    }


    const user = new User({ username, password });
    const userData = await user.save();

    if (userData) {
      const token = await userData.getAuthToken();
      if(!token){
        res.status(405).json({
          success:false,
          message:"Auth token problem"
        })
      }
      res
        .cookie("token", token, {
          httpOnly: true,
          maxAge: 7 * 24 * 60 * 60 * 1000,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
        })
        .status(201)
        .json({ message: "User created and logged in successfully" });
    }

  } catch (error) {
    console.error("Error in signup controller:", error);
    res.status(500).json({
      message: "Something went wrong. Please try again later.",
    });
    return;
  }
};

export const logoutUserController = async (req: Request, res: Response):Promise<void> => {
  try {
    res
      .clearCookie("token", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
      })
      .status(200)
      .json({ message: "Logged out successfully" });
  } catch (error) {
    console.error("Error in logout controller:", error);
    res.status(500).json({
      message: "Something went wrong. Please try again later.",
    });
    return;
  }
};

export const changePasswordController = async (req: Request, res: Response):Promise<void> => {
  try {
    const userId = req.userId;
    const { oldPassword, newPassword } = req.body;
    if (!userId) {
      res.status(403).json({ message: "Unauthorized access" });
      return;
    }
    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }
    const isMatch = await user.comparePassword(oldPassword);
    if (!isMatch) {
      res.status(401).json({ message: "Old password is incorrect" });
      return;
    }
    user.password = newPassword;
    await user.save();
    res.status(200).json({ message: "Password changed successfully" });
  } catch (error) {
    console.error("Error in change password controller:", error);
    res.status(500).json({ message: "Something went wrong. Please try again later." });
    return;
  }
}

export const getUserProfileController = async (req: Request, res: Response):Promise<void> => {
  try {
    const userId = req.userId;
    if (!userId) {
      res.status(403).json({ message: "Unauthorized access" });
      return;
    }
    const user = await User.findById(userId).select("-password -__v");
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }
    res.status(200).json({ user });
  } catch (error) {
    console.error("Error in get user profile controller:", error);
    res.status(500).json({ message: "Something went wrong. Please try again later." }); 
    return;
  }
}

export const deleteUserController = async (req: Request, res: Response):Promise<void> => { 
  try {
    const userId = req.userId;
    if (!userId) {
      res.status(403).json({ message: "Unauthorized access" });
      return;
    }
    await User.findByIdAndDelete(userId);
    res
      .clearCookie("token", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
      })
      .status(200)
      .json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Error in delete user controller:", error);
    res.status(500).json({ message: "Something went wrong. Please try again later." });
    return;
  }
}