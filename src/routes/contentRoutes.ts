import express from "express";
import {createContent, getAllContent} from "../controllers/contentController";
import {verifyToken} from "../middlewares/authMiddleware"
const contentRouter = express.Router();


contentRouter.post("/content",verifyToken,createContent);
contentRouter.get("/content",verifyToken,getAllContent);


export default contentRouter;