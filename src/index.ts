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
  findScreenshots,
  getDesktopPath,
  getDownloadsPath,
  renameMultipleScreenshots,
  selectScreenshots,
} from "./utils.js";

const execAsync = promisify(exec);

const program = new Command();

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
    "-s, --select <directory>",
    "Select screenshots from directory to rename",
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
        let directory = options.select;

        // Expand tilde to home directory
        if (directory.startsWith("~/")) {
          const { homedir } = await import("node:os");
          const { join } = await import("node:path");
          directory = join(homedir(), directory.slice(2));
        }

        const screenshots = await findScreenshots(directory);

        if (screenshots.length === 0) {
          console.log(
            chalk.yellow(`\nNo screenshots found in ${directory}.\n`),
          );
          return;
        }

        const selected = await selectScreenshots(screenshots);

        if (selected.length === 0) {
          console.log(chalk.yellow("\nNo screenshots selected.\n"));
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
