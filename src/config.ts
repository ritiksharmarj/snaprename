import type { AnthropicMessagesModelId } from "@ai-sdk/anthropic/internal";
import type { GoogleGenerativeAIModelId } from "@ai-sdk/google/internal";
import type { OpenAIChatModelId } from "@ai-sdk/openai/internal";
import Conf from "conf";

export const DEFAULT_PROMPT =
  "Can you create a filename for this image? Just give me the filename, no pre-amble, and no extension. Use one word.";

export type ModelId =
  | OpenAIChatModelId
  | AnthropicMessagesModelId
  | GoogleGenerativeAIModelId;

export const MODELS: { id: ModelId; provider: string }[] = [
  { id: "gpt-5-mini", provider: "openai" },
  {
    id: "claude-haiku-4-5",
    provider: "anthropic",
  },
  { id: "gemini-2.5-flash", provider: "google" },
];

interface ConfigSchema {
  apiKey: string;
  prompt: string;
  deleteOriginal: boolean;
  outputDir: string;
  model: ModelId;
}

export const config = new Conf<ConfigSchema>({
  projectName: "snaprename",
  defaults: {
    apiKey: "",
    prompt: DEFAULT_PROMPT,
    deleteOriginal: false,
    outputDir: "",
    model: "gpt-5-mini",
  },
});

export function getApiKey(): string {
  return config.get("apiKey");
}

export function setApiKey(key: string): void {
  config.set("apiKey", key);
}

export function getPrompt(): string {
  return config.get("prompt");
}

export function setPrompt(prompt: string): void {
  config.set("prompt", prompt);
}

export function getDeleteOriginal(): boolean {
  return config.get("deleteOriginal");
}

export function setDeleteOriginal(value: boolean): void {
  config.set("deleteOriginal", value);
}

export function getOutputDirectory(): string {
  return config.get("outputDir");
}

export function setOutputDirectory(value: string): void {
  config.set("outputDir", value);
}

export function hasApiKey(): boolean {
  const key = getApiKey();
  return key !== "" && key !== undefined;
}

export function getModel(): ModelId {
  return config.get("model");
}

export function setModel(model: ModelId): void {
  config.set("model", model);
}

export function getAllPreferences(): ConfigSchema {
  return {
    apiKey: getApiKey(),
    prompt: getPrompt(),
    deleteOriginal: getDeleteOriginal(),
    outputDir: getOutputDirectory(),
    model: getModel(),
  };
}
