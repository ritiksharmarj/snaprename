import Conf from "conf";

export const DEFAULT_PROMPT =
  "Can you create a filename for this image? Just give me the filename, no pre-amble, and no extension. Use one word.";

interface ConfigSchema {
  apiKey: string;
  prompt: string;
  deleteOriginal: boolean;
  outputDirectory: string;
}

export const config = new Conf<ConfigSchema>({
  projectName: "snaprename",
  defaults: {
    apiKey: "",
    prompt: DEFAULT_PROMPT,
    deleteOriginal: false,
    outputDirectory: "",
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
  return config.get("outputDirectory");
}

export function setOutputDirectory(value: string): void {
  config.set("outputDirectory", value);
}

export function hasApiKey(): boolean {
  const key = getApiKey();
  return key !== "" && key !== undefined;
}

export function getAllPreferences(): ConfigSchema {
  return {
    apiKey: getApiKey(),
    prompt: getPrompt(),
    deleteOriginal: getDeleteOriginal(),
    outputDirectory: getOutputDirectory(),
  };
}
