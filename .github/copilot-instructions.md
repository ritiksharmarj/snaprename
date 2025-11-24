# SnapRename CLI - GitHub Copilot Instructions

## Project Overview

SnapRename is a TypeScript-based CLI tool that uses AI vision models (OpenAI GPT-4o) to intelligently rename screenshot files. It uses the Vercel AI SDK with a BYOK (bring your own key) approach.

This is the CLI version designed for developers who prefer terminal workflows.

## Tech Stack

- **Language**: TypeScript (strict mode)
- **Package Manager**: pnpm (always use pnpm, never npm or yarn)
- **CLI Framework**: Commander.js
- **AI SDK**: Vercel AI SDK with OpenAI provider (@ai-sdk/openai)
- **Config Storage**: conf package for persistent user preferences
- **User Prompts**: prompts package for interactive CLI
- **Styling**: chalk for colored terminal output
- **Spinners**: ora for loading indicators
- **Runtime**: Node.js

## Code Style and Conventions

### Naming Conventions
- Use camelCase for variables and functions
- Use PascalCase for types, interfaces, and classes
- Use kebab-case for file names
- Prefix async functions with meaningful verbs (load, fetch, save, etc.)

### Error Handling
- Always handle errors gracefully with user-friendly messages
- Use try-catch blocks for async operations
- Provide actionable error messages
- Log errors to stderr
- Show spinners with appropriate success/failure messages

### CLI Design Patterns
- Use both short flags (-d) and long options (--desktop) for all commands
- Keep commands simple and intuitive
- No emojis in output messages
- Provide helpful error messages when config is missing
- Always show progress for long operations using ora spinners
- Sort screenshots by modification time (newest first)
- Expand tilde (~) paths to full home directory paths

## File Organization

The project follows this structure:
- `src/index.ts` - Main CLI entry point with Commander.js setup
- `src/config.ts` - Configuration management using conf package
- `src/setup.ts` - Interactive setup and preference update functions
- `src/utils.ts` - Screenshot finding, selection, and renaming utilities
- `src/ai.ts` - OpenAI integration for image analysis

## Configuration Management

### Storage
All preferences are stored persistently using the `conf` package in the user's config directory.

### Config Schema
```typescript
interface ConfigSchema {
  apiKey: string;
  prompt: string;
  deleteOriginal: boolean;
  outputDirectory: string;
}
```

### Default Values
- **API Key**: Empty string (required on first run)
- **Prompt**: "Can you create a filename for this image? Just give me the filename, no pre-amble, and no extension. Use one word."
- **Delete Original**: false (keeps original screenshots by default)
- **Output Directory**: Empty string (defaults to Downloads folder)

### Output Directory Behavior
1. Check for command-line override (not currently implemented)
2. Use saved preference from config
3. Fall back to Downloads folder (`~/Downloads`)
4. All renamed files are organized in: `<outputDir>/snaprename/<YYYY-MM-DD>/`

## Main Commands

### Screenshot Renaming
- `snaprename -d` or `--desktop` - Rename all screenshots from desktop
- `snaprename -s <dir>` or `--select <directory>` - Interactively select screenshots from directory
- `snaprename -v` or `--view` - Open output directory in file manager

### Preference Management
- `snaprename preference` - View all current preferences
- `snaprename preference -a` or `--apikey` - Update OpenAI API key
- `snaprename preference -p` or `--prompt` - Update AI prompt
- `snaprename preference -d` or `--delete` - Toggle delete original screenshots
- `snaprename preference -o` or `--output` - Update default output directory

## Key Features

### Screenshot Detection
- Matches files with pattern: `/^Screenshot.*\.(png|jpg|jpeg)$/i`
- Sorts by modification time (newest first)
- Works recursively in specified directory

### Interactive Selection
- Uses `prompts` multiselect interface
- Shows basenames of screenshots
- Space to select/deselect, Enter to confirm
- Supports cancellation (Ctrl+C)

### Intelligent Renaming
- Sends screenshot to OpenAI GPT-4o with custom prompt
- Preserves original file extension
- Creates organized folder structure with date
- Shows "Renaming..." spinner during AI processing
- Option to delete originals after successful rename

### First Run Experience
- Automatically detects missing API key
- Runs interactive setup wizard
- Prompts for API key (required)
- Prompts for custom prompt (optional, uses default)
- Saves all preferences persistently

## Error Handling Patterns

- Check for API key before processing screenshots
- Validate directory paths and expand tilde paths
- Handle empty screenshot lists gracefully
- Show user-friendly error messages without emojis
- Exit gracefully on cancellation (Ctrl+C)

## Development Notes

- Use `pnpm tsc` to compile TypeScript
- Use `pnpm cli` to link globally for testing
- All file operations use Node.js built-in fs/promises
- Terminal output uses chalk without emojis
- Spinner messages are concise ("Renaming...")
- Success messages show full file paths
