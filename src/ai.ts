import { readFileSync } from "node:fs";
import { createOpenAI } from "@ai-sdk/openai";
import { generateText } from "ai";
import { getApiKey, getPrompt } from "./config.js";

export async function analyzeScreenshot(
  imagePath: string,
): Promise<string | null> {
  try {
    const apiKey = getApiKey();
    if (!apiKey) {
      throw new Error("API key not configured");
    }

    const openai = createOpenAI({
      apiKey: apiKey,
    });

    const imageBuffer = readFileSync(imagePath);
    const prompt = getPrompt();

    const result = await generateText({
      model: openai("gpt-4o"),
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: prompt,
            },
            {
              type: "image",
              image: imageBuffer,
            },
          ],
        },
      ],
    });

    return result.text.trim();
  } catch (error) {
    console.error("Error analyzing screenshot:", error);
    return null;
  }
}
