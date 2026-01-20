import express from "express";
import {createContent, getAllContent,deleteContent,makeContentPublic} from "../controllers/contentController";
import {verifyToken} from "../middlewares/authMiddleware"
const contentRouter = express.Router();


contentRouter.post("/content",verifyToken,createContent);
contentRouter.get("/content",verifyToken,getAllContent);
contentRouter.delete("/content/:contentId",verifyToken,deleteContent);
contentRouter.post("/content/:contentId",verifyToken,makeContentPublic);



export default contentRouter;