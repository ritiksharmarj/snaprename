import { copyFile, mkdir, readdir, stat, unlink } from "node:fs/promises";
import { homedir } from "node:os";
import { basename, join } from "node:path";
import chalk from "chalk";
import ora from "ora";
import pLimit from "p-limit";
import prompts from "prompts";
import { analyzeScreenshot } from "./ai.js";
import { getDeleteOriginal, getOutputDirectory } from "./config.js";

const SCREENSHOT_PATTERN = /^Screenshot.*\.(png|jpg|jpeg)$/i;
const IMAGE_PATTERN = /\.(png|jpg|jpeg)$/i;
const CONCURRENCY_LIMIT = 5;

function getCurrentDateFolder(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

async function ensureSnaprenameFolder(baseDir: string): Promise<string> {
  const snaprenameDir = join(baseDir, "snaprename");
  const dateFolder = getCurrentDateFolder();
  const finalDir = join(snaprenameDir, dateFolder);

  try {
    await mkdir(finalDir, { recursive: true });
  } catch (error) {
    console.error(chalk.red("Error creating directory"), error);
  }

  return finalDir;
}

export async function getDesktopPath(): Promise<string> {
  return join(homedir(), "Desktop");
}

export async function getDownloadsPath(): Promise<string> {
  return join(homedir(), "Downloads");
}

export async function findScreenshots(directory: string): Promise<string[]> {
  try {
    const files = await readdir(directory);
    const screenshotsWithStats: Array<{ path: string; mtime: Date }> = [];

    for (const file of files) {
      if (SCREENSHOT_PATTERN.test(file)) {
        const filePath = join(directory, file);
        const stats = await stat(filePath);
        if (stats.isFile()) {
          screenshotsWithStats.push({ path: filePath, mtime: stats.mtime });
        }
      }
    }

    // Sort by modification time, newest first
    screenshotsWithStats.sort((a, b) => b.mtime.getTime() - a.mtime.getTime());

    return screenshotsWithStats.map((item) => item.path);
  } catch (error) {
    console.error(chalk.red(`Error reading directory: ${directory}`), error);
    return [];
  }
}

export async function findImages(directory: string): Promise<string[]> {
  try {
    const files = await readdir(directory);
    const imagesWithStats: Array<{ path: string; mtime: Date }> = [];

    for (const file of files) {
      if (IMAGE_PATTERN.test(file)) {
        const filePath = join(directory, file);
        const stats = await stat(filePath);
        if (stats.isFile()) {
          imagesWithStats.push({ path: filePath, mtime: stats.mtime });
        }
      }
    }

    // Sort by modification time, newest first
    imagesWithStats.sort((a, b) => b.mtime.getTime() - a.mtime.getTime());

    return imagesWithStats.map((item) => item.path);
  } catch (error) {
    console.error(chalk.red(`Error reading directory: ${directory}`), error);
    return [];
  }
}

export async function renameScreenshot(
  filePath: string,
  outputDir?: string,
  spinner?: ora.Ora,
): Promise<boolean> {
  const localSpinner = spinner || ora("Renaming...").start();
  const fileName = basename(filePath);

  try {
    if (!spinner) {
      localSpinner.text = `Renaming ${fileName}...`;
    }

    const newName = await analyzeScreenshot(filePath);

    if (!newName) {
      if (!spinner) {
        localSpinner.fail(
          chalk.red(`Failed to generate filename for ${fileName}`),
        );
      }
      return false;
    }

    const fileExtension = filePath.split(".").pop();
    const savedOutputDir = getOutputDirectory();
    let baseDir = outputDir || savedOutputDir || (await getDownloadsPath());

    // Expand tilde to home directory
    if (baseDir.startsWith("~/")) {
      baseDir = join(homedir(), baseDir.slice(2));
    }

    const finalDir = await ensureSnaprenameFolder(baseDir);
    const newPath = join(finalDir, `${newName}.${fileExtension}`);

    await copyFile(filePath, newPath);

    if (getDeleteOriginal()) {
      await unlink(filePath);
    }

    if (!spinner) {
      localSpinner.succeed(chalk.green(`Saved to: ${chalk.bold(newPath)}`));
    }
    return true;
  } catch (error) {
    if (!spinner) {
      localSpinner.fail(chalk.red(`Error renaming ${fileName}`));
      console.error(error);
    }
    return false;
  }
}

export async function selectScreenshots(
  screenshots: string[],
): Promise<string[]> {
  if (screenshots.length === 0) {
    return [];
  }

  const choices = screenshots.map((path) => ({
    title: basename(path),
    value: path,
  }));

  const response = await prompts(
    {
      type: "multiselect",
      name: "selected",
      message:
        "Select screenshots to rename (use space to select, enter to confirm):",
      choices: choices,
      hint: "- Space to select. Return to submit",
    },
    {
      onCancel: () => {
        console.log(chalk.yellow("\nSelection cancelled."));
        process.exit(0);
      },
    },
  );

  return response.selected || [];
}

export async function renameMultipleScreenshots(
  screenshots: string[],
  outputDir?: string,
): Promise<void> {
  const total = screenshots.length;
  console.log(chalk.blue(`\nFound ${total} screenshot(s) to rename\n`));

  const limit = pLimit(CONCURRENCY_LIMIT);
  let completed = 0;
  let successCount = 0;

  const spinner = ora(`Renaming 0/${total}...`).start();

  const updateSpinner = () => {
    spinner.text = `Renaming ${completed}/${total}...`;
  };

  const promises = screenshots.map((screenshot) =>
    limit(async () => {
      const success = await renameScreenshot(screenshot, outputDir, spinner);
      completed++;
      if (success) successCount++;
      updateSpinner();
      return success;
    }),
  );

  await Promise.all(promises);

  spinner.succeed(
    chalk.green(`Renamed ${successCount}/${total} screenshot(s)`),
  );
  console.log();
}
