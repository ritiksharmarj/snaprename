import chalk from "chalk";
import prompts from "prompts";
import * as Config from "./config.js";

export async function runSetup(): Promise<void> {
  console.log(chalk.bold.blue("\nWelcome to SnapRename!\n"));
  console.log(chalk.gray("Let's set up your preferences to get started.\n"));

  const modelChoices = Config.MODELS.map((m) => ({
    title: m.id,
    value: m.id,
  }));

  const questions: prompts.PromptObject[] = [
    {
      type: "select",
      name: "model",
      message: "Select an AI model:",
      choices: modelChoices,
      initial: 0,
    },
    {
      type: "password",
      name: "apiKey",
      message: (prev) => {
        const model = Config.MODELS.find((m) => m.id === prev);
        return `Enter your ${model?.provider} API key:`;
      },
      validate: (value: string) =>
        value.length > 0 ? true : "API key is required",
    },
    {
      type: "text",
      name: "prompt",
      message: "Enter your custom prompt (or press Enter to use default):",
      initial: Config.DEFAULT_PROMPT,
    },
  ];

  try {
    const response = await prompts(questions, {
      onCancel: () => {
        console.log(chalk.yellow("\nSetup cancelled."));
        process.exit(0);
      },
    });

    if (response.model) {
      Config.setModel(response.model);
    }

    if (response.apiKey) {
      Config.setApiKey(response.apiKey);
    }

    if (response.prompt) {
      Config.setPrompt(response.prompt);
    }

    console.log(chalk.green("\nConfiguration saved successfully!\n"));
    console.log(chalk.gray("Run 'snaprename --help' to get started"));
  } catch (error) {
    console.error(chalk.red("\nSetup failed:"), error);
    process.exit(1);
  }
}

export async function updatePrompt(): Promise<void> {
  console.log(chalk.bold.blue("\nUpdate Prompt\n"));
  console.log(chalk.gray(`${Config.getPrompt()}\n`));

  const response = await prompts(
    {
      type: "text",
      name: "prompt",
      message: "Enter your new prompt:",
      initial: "",
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
    Config.setPrompt(response.prompt);
    console.log(chalk.green("\nPrompt updated successfully!\n"));
  }
}

export async function updateDeleteOriginal(): Promise<void> {
  console.log(chalk.bold.blue("\nUpdate Delete Original Setting\n"));

  const response = await prompts(
    {
      type: "toggle",
      name: "deleteOriginal",
      message: "Delete original(s) after renaming?",
      initial: Config.getDeleteOriginal(),
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
    Config.setDeleteOriginal(response.deleteOriginal);
    console.log(chalk.green("\nSetting updated successfully!\n"));
  }
}

export async function updateOutputDirectory(): Promise<void> {
  console.log(chalk.bold.blue("\nUpdate Output Directory\n"));
  const currentDir = Config.getOutputDirectory();
  console.log(chalk.gray(`Current dir: ${currentDir || "~/Downloads"}\n`));

  const response = await prompts(
    {
      type: "text",
      name: "outputDir",
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

  if (response.outputDir !== undefined) {
    Config.setOutputDirectory(response.outputDir);
    console.log(chalk.green("\nOutput directory updated successfully!\n"));
  }
}

export async function updateModel(): Promise<void> {
  console.log(chalk.bold.blue("\nUpdate AI Model\n"));
  console.log(chalk.gray(`Current model: ${Config.getModel()}\n`));

  const modelChoices = Config.MODELS.map((m) => ({
    title: m.id,
    value: m.id,
  }));

  const currentIndex = Config.MODELS.findIndex(
    (m) => m.id === Config.getModel(),
  );

  const questions: prompts.PromptObject[] = [
    {
      type: "select",
      name: "model",
      message: "Select an AI model:",
      choices: modelChoices,
      initial: currentIndex >= 0 ? currentIndex : 0,
    },
    {
      type: "password",
      name: "apiKey",
      message: (prev) => {
        const model = Config.MODELS.find((m) => m.id === prev);
        return `Enter your ${model?.provider} API key:`;
      },
      validate: (value: string) =>
        value.length > 0 ? true : "API key is required",
    },
  ];

  const response = await prompts(questions, {
    onCancel: () => {
      console.log(chalk.yellow("\nUpdate cancelled."));
      process.exit(0);
    },
  });

  if (response.model && response.apiKey) {
    Config.setModel(response.model);
    Config.setApiKey(response.apiKey);
    console.log(chalk.green(`\nModel updated to ${response.model}!\n`));
  }
}
