import React from "react";
import { expect, test } from "vitest";
import { page } from "vitest/browser";
import { renderServer } from "vitest-plugin-rsc/nextjs/testing-library";
import RootLayout from "../layout";

// Layout lives outside the plugin's default route tree (the plugin stubs the
// layout slot when building router state), so tests never hit it via
// renderServer(<Home />). Test it directly with the layout as the root.
test("RootLayout renders children inside html/body", async () => {
  await renderServer(
    <RootLayout>
      <div data-testid="layout-child">page content</div>
    </RootLayout>,
  );

  await expect.element(page.getByTestId("layout-child")).toBeVisible();
  await expect.element(page.getByTestId("layout-child")).toHaveTextContent(
    "page content",
  );
});
