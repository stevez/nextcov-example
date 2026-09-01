import React from "react";
import { expect, test } from "vitest";
import { page } from "vitest/browser";
import { renderServer } from "vitest-plugin-rsc/nextjs/testing-library";
import Home from "../page";

test("renders todos returned from the API", async () => {
  await renderServer(<Home />);

  await expect
    .element(page.getByText("Buy milk"))
    .toBeVisible();
  await expect
    .element(page.getByText("Write RFC"))
    .toBeVisible();
});
