import { type ContentInput } from "../schemas/contentSchema";

export const buildAnalyzePrompt = ({
    title,
    description,
    link,
    tags,
}: ContentInput
): string => {
    return `
   You are an expert knowledge assistant.
   Analyze the content below content and respond ONLY in valid JSON.
    Title: ${title}
    Link: ${link ?? "N/A"}
    Description: ${description}
    Tags: ${tags.join(", ")}
   Return JSON exactly in this shape:
{
  "summary": string,
  "key_points": string[],
  "importance": string,
  "suggested_tags": string[],
  "actionable_insights": string[]
}
`;
};