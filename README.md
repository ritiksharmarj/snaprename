# SnapRename

A CLI tool to rename your screenshots with AI.

## Installation

```bash
# npm
npm install -g snaprename

# pnpm
pnpm add -g snaprename

# yarn
yarn global add snaprename
```

Or run without installing:

```bash
npx snaprename --desktop
```

## Setup

On first run, you'll be prompted to:

1. Select an AI model (GPT-5 Mini, Claude Haiku 4.5, or Gemini 2.5 Flash)
2. Enter your API key for the selected provider

## Usage

```bash
# Rename all screenshots from desktop
snaprename --desktop
snaprename -d

# Select screenshots from a directory
snaprename --select dir:~/Downloads
snaprename -s dir:~/Downloads

# Select all images (not just screenshots)
snaprename -s dir:~/Downloads,filter:all

# Open output directory
snaprename --view
snaprename -v
```

## Preferences

```bash
# View all preferences
snaprename preference

# Update model and API key
snaprename preference --model
snaprename preference -m

# Update prompt
snaprename preference --prompt
snaprename preference -p

# Toggle delete original after rename
snaprename preference --delete
snaprename preference -d

# Update output directory
snaprename preference --output
snaprename preference -o
```

## How It Works

1. Finds screenshots matching `Screenshot*.png/jpg/jpeg`
2. Sends each image to your selected AI model
3. Gets a descriptive filename from AI
4. Renames and organizes files to `~/Downloads/snaprename/YYYY-MM-DD/`

Note - Providers do not use uploaded images to train models. They said 🤞

## Requirements

- Node.js 18+
- macOS (uses `open` command for --view)
- API key from OpenAI, Anthropic, or Google

## License

MIT
