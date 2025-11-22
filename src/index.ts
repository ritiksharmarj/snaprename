import { Command } from "commander";

const program = new Command();

program
  .name("snaprename")
  .description("Rename your screenshots with AI")
  .version("1.0.0");

program
  .argument("<string>", "string to log")
  .action((str: string) => console.log(`hello ${str}`));

program.parse();
