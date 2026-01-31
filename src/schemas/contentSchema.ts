import { z } from "zod";
import { ContentType } from "../models/contentModel";

export const analyzeContentSchema = z.object({
  contentId: z.string().min(1),
});


export const AIResultSchema = z.object({
  summary: z.string(),
  key_points: z.array(z.string()),
  importance: z.string(),
  suggested_tags: z.array(z.string()),
  actionable_insights: z.array(z.string()),
});

export const contentSchema = z.object({
  title: z.string().min(1).max(500),
  description: z.string().min(1).max(1000),
  link: z.string().url(),
  tags: z.array(z.string()),
  type: z.nativeEnum(ContentType).optional(),
});


export type ContentInput = z.infer<typeof contentSchema>;