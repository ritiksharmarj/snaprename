# SnapRename

Rename your screenshots with AI.

## Quick Start

```bash
# Install
npm install -g snaprename

# Rename desktop screenshots
snaprename -d
```

## Setup

On first run, you'll be prompted to:

1. Select an AI model (GPT-5 Mini, Claude Haiku 4.5, or Gemini 2.5 Flash)
2. Enter your API key for the selected provider

## Usage

```bash
# Rename all screenshots from desktop
snaprename -d

# Rename selected screenshots
snaprename -s ~/Downloads

# View all preferences
snaprename preference

# Show help
snaprename --help
```

## Options

| Option                | Description                     | Default  |
| --------------------- | ------------------------------- | -------- |
| `-d, --desktop`       | Rename screenshots from desktop | -        |
| `-s, --select <spec>` | Select images to rename         | Required |
| `-v, --view`          | Open output directory           | -        |

## Select Format

Select follow this pattern:

```bash
dir:<path>,filter:<screenshots|all>
```

| Option          | Description              | Example           |
| --------------- | ------------------------ | ----------------- |
| `dir:<path>`    | Directory to search      | `dir:~/Downloads` |
| `filter:<type>` | default is `screenshots` | `filter:all`      |

## Preference Options

| Option         | Description                  |
| -------------- | ---------------------------- |
| `-m, --model`  | Update AI model and API key  |
| `-p, --prompt` | Update prompt                |
| `-d, --delete` | Toggle delete original files |
| `-o, --output` | Update output directory      |

## Examples

```bash
# Select all images from downloads dir
snaprename -s "dir:~/Downloads,filter:all"

# Delete original screenshots/images
snaprename preference -d

# Open current output dir
snaprename -v
```

## How It Works

1. Finds screenshots matching `Screenshot*.png/jpg/jpeg`
2. Sends each image to your selected AI vision model
3. Gets a descriptive filename from AI
4. Renames and organizes files to e.g. `~/Downloads/snaprename/YYYY-MM-DD/`

Note - Providers do not use uploaded images to train models. They said 🤞

## Requirements

- Node.js 20+
- macOS (uses `open` command for --view)
- API key from OpenAI, Anthropic, or Google

## License

MIT
