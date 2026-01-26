import express, { json } from "express";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";

import { connectWithDb } from "./config/db";
import authRouter from "./routes/authRoutes";
import contentRouter from "./routes/contentRoutes";
import shareBrainRouter from "./routes/shareBrain";

dotenv.config();

const app = express();
const port = process.env.PORT || 8000;


app.use(express.json());
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}));

app.use(helmet());
app.use(morgan("dev"));
app.use(cookieParser());

// DB connection
connectWithDb().catch(err => {
  console.error("Failed to connect to DB:", err);
  process.exit(1);
});

// Routes
app.use("/api/v1/auth", authRouter);
app.use("/api/v1",contentRouter);
app.use("/api/v1",shareBrainRouter);


// Health check
app.get("/home", (req, res) => {
  res.send("Radhe Radhe");
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
