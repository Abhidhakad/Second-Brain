import express from "express";
import dotenv from "dotenv";
import { connectWithDb } from "./config/db";
import authRouter from "./routes/authRoutes";

dotenv.config();

const app = express();
const port = process.env.PORT || 8000;

app.use(express.json());
connectWithDb();

app.use("/api",authRouter);






app.get("/",(req,res)=>{
    res.send("Radhe Radhe")
})

app.listen(port,()=> {
    console.log("App is listening on port ",port);
})



