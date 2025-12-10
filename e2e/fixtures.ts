import { test as base, expect } from "@playwright/test";
import { collectClientCoverage } from "nextcov/playwright";
import { nextcov } from "../playwright.config";

const test = base.extend<{ coverage: void }>({
  coverage: [
    async ({ page }, use, testInfo) => {
      await collectClientCoverage(page, testInfo, use, nextcov);
    },
    { auto: true },
  ],
});

export { test, expect };
