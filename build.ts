import { readFileSync } from "node:fs";
import * as esbuild from "esbuild";

const packageJson = JSON.parse(readFileSync("./package.json", "utf-8"));

const isWatch = process.argv.includes("--watch");

const buildOptions: esbuild.BuildOptions = {
  entryPoints: ["src/index.ts"],
  bundle: true,
  platform: "node",
  packages: "external",
  outfile: "dist/index.js",
  format: "esm",
  define: {
    __VERSION__: JSON.stringify(packageJson.version),
  },
};

if (isWatch) {
  const ctx = await esbuild.context(buildOptions);
  await ctx.watch();
  console.log("Watching...");
} else {
  await esbuild.build(buildOptions);
  console.log("Build complete");
}
