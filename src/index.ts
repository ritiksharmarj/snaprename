#!/usr/bin/env node

import { exec } from "node:child_process";
import { promisify } from "node:util";
import chalk from "chalk";
import { Command } from "commander";
import { getAllPreferences, hasApiKey } from "./config.js";
import {
  runSetup,
  updateApiKey,
  updateDeleteOriginal,
  updateOutputDirectory,
  updatePrompt,
} from "./setup.js";
import {
  findImages,
  findScreenshots,
  getDesktopPath,
  getDownloadsPath,
  renameMultipleScreenshots,
  selectScreenshots,
} from "./utils.js";

const execAsync = promisify(exec);

const program = new Command();

interface SelectOptions {
  directory: string;
  filter: "screenshots" | "all";
}

function parseSelectOptions(value: string): SelectOptions {
  const options: SelectOptions = {
    directory: "",
    filter: "screenshots",
  };

  const parts = value.split(",");
  for (const part of parts) {
    const [key, val] = part.split(":");
    if (key && val) {
      const trimmedKey = key.trim().toLowerCase();
      const trimmedVal = val.trim();
      if (trimmedKey === "dir" || trimmedKey === "directory") {
        options.directory = trimmedVal;
      } else if (trimmedKey === "filter") {
        options.filter =
          trimmedVal.toLowerCase() === "all" ? "all" : "screenshots";
      }
    } else if (key && !val) {
      // If no key:value format, treat as directory path
      options.directory = key.trim();
    }
  }

  return options;
}

program
  .name("snaprename")
  .description("Rename your screenshots with AI")
  .version("1.0.0");

// Check if user needs to run setup
async function ensureSetup(): Promise<void> {
  if (!hasApiKey()) {
    console.log(
      chalk.yellow("\nNo API key found. Let's set up SnapRename first.\n"),
    );
    await runSetup();
  }
}

// Main command with options
program
  .option("-d, --desktop", "Rename screenshots from desktop")
  .option(
    "-s, --select <options>",
    "Select images to rename. Format: dir:<path>,filter:<screenshots|all>",
  )
  .option("-v, --view", "Open output directory in file manager")
  .action(async (options) => {
    if (options.desktop || options.select || options.view) {
      if (options.view) {
        const outputDir = await getDownloadsPath();
        try {
          await execAsync(`open "${outputDir}"`);
          console.log(chalk.green(`\nOpened ${outputDir}\n`));
        } catch (error) {
          console.error(chalk.red("\nFailed to open directory\n"), error);
        }
        return;
      }

      await ensureSetup();

      if (options.desktop) {
        const desktopPath = await getDesktopPath();
        const screenshots = await findScreenshots(desktopPath);

        if (screenshots.length === 0) {
          console.log(chalk.yellow("\nNo screenshots found on desktop.\n"));
          return;
        }

        await renameMultipleScreenshots(screenshots);
      } else if (options.select) {
        const selectOpts = parseSelectOptions(options.select);
        let directory = selectOpts.directory;

        if (!directory) {
          console.log(
            chalk.red(
              "\nPlease provide a directory. Example: snaprename -s dir:~/Downloads,filter:all\n",
            ),
          );
          return;
        }

        // Expand tilde to home directory
        if (directory.startsWith("~/")) {
          const { homedir } = await import("node:os");
          const { join } = await import("node:path");
          directory = join(homedir(), directory.slice(2));
        }

        // Use findImages if filter is 'all', otherwise findScreenshots
        const files =
          selectOpts.filter === "all"
            ? await findImages(directory)
            : await findScreenshots(directory);

        const fileType = selectOpts.filter === "all" ? "images" : "screenshots";

        if (files.length === 0) {
          console.log(
            chalk.yellow(`\nNo ${fileType} found in ${directory}.\n`),
          );
          return;
        }

        const selected = await selectScreenshots(files);

        if (selected.length === 0) {
          console.log(chalk.yellow(`\nNo ${fileType} selected.\n`));
          return;
        }

        await renameMultipleScreenshots(selected);
      }
    } else {
      program.help();
    }
  });

// Preference command
const preferenceCommand = program
  .command("preference")
  .description("Manage preferences");

preferenceCommand
  .option("-a, --apikey", "Update API key")
  .option("-p, --prompt", "Update prompt")
  .option("-d, --delete", "Toggle delete original screenshots")
  .option("-o, --output", "Update output directory")
  .action(async (options) => {
    if (options.apikey) {
      await updateApiKey();
    } else if (options.prompt) {
      await updatePrompt();
    } else if (options.delete) {
      await updateDeleteOriginal();
    } else if (options.output) {
      await updateOutputDirectory();
    } else {
      // Show all preferences
      const prefs = getAllPreferences();
      console.log(chalk.bold.blue("\nCurrent Preferences\n"));
      console.log(chalk.gray("API Key:"), chalk.cyan(maskApiKey(prefs.apiKey)));
      console.log(chalk.gray("Prompt:"), chalk.cyan(prefs.prompt));
      console.log(
        chalk.gray("Delete Originals:"),
        chalk.cyan(prefs.deleteOriginal ? "Yes" : "No"),
      );
      console.log(
        chalk.gray("Output Directory:"),
        chalk.cyan(prefs.outputDirectory || "Default (Downloads)"),
      );
      console.log(
        chalk.gray("\nTo update, use:"),
        chalk.cyan("snaprename preference -a (or --apikey)"),
      );
      console.log(
        chalk.gray("              "),
        chalk.cyan("snaprename preference -p (or --prompt)"),
      );
      console.log(
        chalk.gray("              "),
        chalk.cyan("snaprename preference -d (or --delete)"),
      );
      console.log(
        chalk.gray("              "),
        chalk.cyan("snaprename preference -o (or --output)\n"),
      );
    }
  });

function maskApiKey(key: string): string {
  if (!key || key.length < 8) return "Not set";
  return `${key.substring(0, 4)}...${key.substring(key.length - 4)}`;
}

program.parse();
