import express from "express";
import { shareBrain, accessSharedBrain } from "../controllers/contentController";
import { verifyToken } from "../middlewares/authMiddleware";
const shareBrainRouter = express.Router();

shareBrainRouter.post("/share-brain", verifyToken, shareBrain);  
shareBrainRouter.get("/share-brain/:hash", accessSharedBrain);


export default shareBrainRouter;


