import * as path from "path";
import type { FullConfig } from "@playwright/test";
import { finalizeCoverage } from "nextcov/playwright";
import { loadNextcovConfig } from "nextcov";

export default async function globalTeardown(_config: FullConfig) {
  const config = await loadNextcovConfig(
    path.join(process.cwd(), "playwright.config.ts")
  );
  await finalizeCoverage(config);
}
