import express from "express";
import { loginUserController,signUpUserController } from "../controllers/authController";
const authRouter = express.Router();

authRouter.post("/login",loginUserController);

authRouter.post("/signup",signUpUserController);

export default authRouter;
