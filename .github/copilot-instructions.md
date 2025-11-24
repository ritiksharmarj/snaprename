# SnapRename CLI - GitHub Copilot Instructions

## Project Overview

SnapRename is a TypeScript-based CLI tool that uses AI vision models to intelligently rename screenshot files. It supports multiple AI providers via the Vercel AI SDK with a BYOK (bring your own key) approach.

This is the CLI version of the SnapRename macOS app, designed for developers who prefer terminal workflows.

## Tech Stack

- **Language**: TypeScript (strict mode)
- **Package Manager**: pnpm (always use pnpm, never npm or yarn)
- **CLI Framework**: Commander.js
- **AI SDK**: Vercel AI SDK with multiple provider support
- **Runtime**: Node.js with tsx for development

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

### CLI Design Patterns
- Use flags/options with double dashes (--desktop, --view)
- Keep commands simple and intuitive
- Provide helpful error messages when config is missing
- Always show progress for long operations

## Configuration Management

### Default Prompt
Can you create a filename for this image? Just give me the filename, no pre-amble, and no extension. Use one word.

## Main Commands
- `snaprename --desktop` - Rename desktop screenshots
- `snaprename --select` - Rename selected screenshots
- `snaprename --view` - View screenshots (default open output dir)
- `snaprename --output <dir>` - Specify output directory (default downloads dir)
- `snaprename preference` - Manage all preferences
- `snaprename preference --apikey` - Update API key only
- `snaprename preference --prompt` - Update prompt only
