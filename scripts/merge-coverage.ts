import * as path from "path";
import { mergeCoverage, printCoverageSummary, loadNextcovConfig } from "nextcov";

async function main() {
  const config = await loadNextcovConfig(
    path.join(process.cwd(), "playwright.config.ts")
  );

  const result = await mergeCoverage({
    unitCoveragePath: "./coverage/unit/coverage-final.json",
    e2eCoveragePath: path.join(config.outputDir, "coverage-final.json"),
    outputDir: "./coverage",
    projectRoot: process.cwd(),
  });

  printCoverageSummary(result.summary, "Merged Coverage Summary");
}

main().catch(console.error);
