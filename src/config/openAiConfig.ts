import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();

const openaiKey = process.env.OPENAI_API_KEY;

if (!openaiKey) {
  console.log("OPENAIKEY: ",openaiKey);
  throw new Error("❌ OPENAI_API_KEY not set");
}

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});
