import { Command } from "commander";

const program = new Command();

program
  .name("snaprename")
  .description("AI-powered screenshot renaming CLI")
  .version("1.0.0");

program.command("rename-desktop").description("Rename desktop screenshots");
// .action();

program.parse();
