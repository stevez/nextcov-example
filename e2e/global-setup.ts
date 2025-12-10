import * as path from "path";
import { startServerCoverageAutoDetect, loadNextcovConfig } from "nextcov";

export default async function globalSetup() {
  const config = await loadNextcovConfig(
    path.join(process.cwd(), "playwright.config.ts")
  );
  await startServerCoverageAutoDetect(config);
}
