import chalk from "chalk";
import prompts from "prompts";
import {
  DEFAULT_PROMPT,
  getDeleteOriginal,
  getOutputDirectory,
  getPrompt,
  setApiKey,
  setDeleteOriginal,
  setOutputDirectory,
  setPrompt,
} from "./config.js";

export async function runSetup(): Promise<void> {
  console.log(chalk.bold.blue("\nWelcome to SnapRename!\n"));
  console.log(chalk.gray("Let's set up your preferences to get started.\n"));

  const questions: prompts.PromptObject[] = [
    {
      type: "password",
      name: "apiKey",
      message: "Enter your OpenAI API key:",
      validate: (value: string) =>
        value.length > 0 ? true : "API key is required",
    },
    {
      type: "text",
      name: "prompt",
      message: "Enter your custom prompt (or press Enter to use default):",
      initial: DEFAULT_PROMPT,
    },
  ];

  try {
    const response = await prompts(questions, {
      onCancel: () => {
        console.log(chalk.yellow("\nSetup cancelled."));
        process.exit(0);
      },
    });

    if (response.apiKey) {
      setApiKey(response.apiKey);
    }

    if (response.prompt) {
      setPrompt(response.prompt);
    }

    console.log(chalk.green("\nConfiguration saved successfully!\n"));
    console.log(chalk.gray("You can update these preferences anytime using:"));
    console.log(chalk.cyan("  snaprename preference --apikey"));
    console.log(chalk.cyan("  snaprename preference --prompt\n"));
  } catch (error) {
    console.error(chalk.red("\nSetup failed:"), error);
    process.exit(1);
  }
}

export async function updateApiKey(): Promise<void> {
  console.log(chalk.bold.blue("\nUpdate API Key\n"));

  const response = await prompts(
    {
      type: "password",
      name: "apiKey",
      message: "Enter your new OpenAI API key:",
      validate: (value: string) =>
        value.length > 0 ? true : "API key is required",
    },
    {
      onCancel: () => {
        console.log(chalk.yellow("\nUpdate cancelled."));
        process.exit(0);
      },
    },
  );

  if (response.apiKey) {
    setApiKey(response.apiKey);
    console.log(chalk.green("\nAPI key updated successfully!\n"));
  }
}

export async function updatePrompt(): Promise<void> {
  console.log(chalk.bold.blue("\nUpdate Prompt\n"));
  console.log(chalk.gray(`Current prompt: ${getPrompt()}\n`));

  const response = await prompts(
    {
      type: "text",
      name: "prompt",
      message: "Enter your new prompt:",
      initial: getPrompt(),
      validate: (value: string) =>
        value.length > 0 ? true : "Prompt cannot be empty",
    },
    {
      onCancel: () => {
        console.log(chalk.yellow("\nUpdate cancelled."));
        process.exit(0);
      },
    },
  );

  if (response.prompt) {
    setPrompt(response.prompt);
    console.log(chalk.green("\nPrompt updated successfully!\n"));
  }
}

export async function updateDeleteOriginal(): Promise<void> {
  console.log(chalk.bold.blue("\nUpdate Delete Original Setting\n"));
  console.log(
    chalk.gray(
      `Current setting: ${getDeleteOriginal() ? "Delete originals" : "Keep originals"}\n`,
    ),
  );

  const response = await prompts(
    {
      type: "toggle",
      name: "deleteOriginal",
      message: "Delete original screenshots after renaming?",
      initial: getDeleteOriginal(),
      active: "yes",
      inactive: "no",
    },
    {
      onCancel: () => {
        console.log(chalk.yellow("\nUpdate cancelled."));
        process.exit(0);
      },
    },
  );

  if (response.deleteOriginal !== undefined) {
    setDeleteOriginal(response.deleteOriginal);
    console.log(chalk.green("\nSetting updated successfully!\n"));
  }
}

export async function updateOutputDirectory(): Promise<void> {
  console.log(chalk.bold.blue("\nUpdate Output Directory\n"));
  const currentDir = getOutputDirectory();
  console.log(
    chalk.gray(`Current directory: ${currentDir || "Default (Downloads)"}\n`),
  );

  const response = await prompts(
    {
      type: "text",
      name: "outputDirectory",
      message: "Enter output directory path (or leave empty for Downloads):",
      initial: currentDir,
    },
    {
      onCancel: () => {
        console.log(chalk.yellow("\nUpdate cancelled."));
        process.exit(0);
      },
    },
  );

  if (response.outputDirectory !== undefined) {
    setOutputDirectory(response.outputDirectory);
    console.log(chalk.green("\nOutput directory updated successfully!\n"));
  }
}
