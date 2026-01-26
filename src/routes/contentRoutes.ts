import express from "express";
import {createContent, getAllContent,deleteContent,makeContentPublic,searchTags} from "../controllers/contentController";
import {verifyToken} from "../middlewares/authMiddleware"


const contentRouter = express.Router();

// content routes
contentRouter.post("/content",verifyToken,createContent);
contentRouter.get("/content",verifyToken,getAllContent);
contentRouter.delete("/content/:contentId",verifyToken,deleteContent);
contentRouter.post("/content/:contentId",verifyToken,makeContentPublic);

// Tag search route
contentRouter.get("/search-tag",verifyToken,searchTags);

export default contentRouter;