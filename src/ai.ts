import { readFileSync } from "node:fs";
import { createAnthropic } from "@ai-sdk/anthropic";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createOpenAI } from "@ai-sdk/openai";
import { generateText, type LanguageModel } from "ai";
import { getApiKey, getModel, getPrompt, MODELS } from "./config.js";

function getLanguageModel(): LanguageModel {
  const apiKey = getApiKey();
  const modelId = getModel();
  const modelConfig = MODELS.find((m) => m.id === modelId);

  if (!modelConfig) {
    throw new Error(`Unknown model: ${modelId}`);
  }

  switch (modelConfig.provider) {
    case "openai": {
      const openai = createOpenAI({ apiKey });
      return openai(modelId);
    }
    case "anthropic": {
      const anthropic = createAnthropic({ apiKey });
      return anthropic(modelId);
    }
    case "google": {
      const google = createGoogleGenerativeAI({ apiKey });
      return google(modelId);
    }
    default:
      throw new Error(`Unknown provider: ${modelConfig.provider}`);
  }
}

export async function analyzeScreenshot(
  imagePath: string,
): Promise<string | null> {
  try {
    const apiKey = getApiKey();
    if (!apiKey) {
      throw new Error("API key not configured");
    }

    const model = getLanguageModel();
    const imageBuffer = readFileSync(imagePath);
    const prompt = getPrompt();

    const result = await generateText({
      model,
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
