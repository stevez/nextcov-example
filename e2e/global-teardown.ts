/**
 * Global Teardown for E2E Tests
 *
 * Collects and processes both client-side and server-side coverage.
 */

import * as path from 'path'
import { finalizeCoverage, loadNextcovConfig } from 'nextcov/playwright'

export default async function globalTeardown() {
  const config = await loadNextcovConfig(path.join(process.cwd(), 'playwright.config.ts'))
  await finalizeCoverage(config)
}
