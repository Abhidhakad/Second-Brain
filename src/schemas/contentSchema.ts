import { z } from "zod";
import { ContentType } from "../models/contentModel";


export const contentSchema = z.object({
  title: z.string().min(1).max(500),
  description: z.string().min(1).max(1000),
  link: z.string().url(),
  tags: z.array(z.string()),
  type: z.nativeEnum(ContentType).optional(),
});


export type ContentInput = z.infer<typeof contentSchema>;