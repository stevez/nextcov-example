import React from "react";
import { beforeEach, expect, test, vi } from "vitest";
import { page } from "vitest/browser";
import { renderServer } from "vitest-plugin-rsc/nextjs/testing-library";
import Home from "../page";
import { apiState } from "../../../vitest.rsc.setup";

// Capture in-browser errors and unhandled rejections so waitFor timeouts
// don't hide the actual failure reason.
const capturedErrors: string[] = [];
beforeEach(() => {
  capturedErrors.length = 0;
  const onError = (e: ErrorEvent) => {
    capturedErrors.push(`error: ${e.message}`);
    // eslint-disable-next-line no-console
    console.error("[browser error]", e.message, e.error);
  };
  const onRejection = (e: PromiseRejectionEvent) => {
    const reason = e.reason;
    const msg =
      reason instanceof Error
        ? `${reason.name}: ${reason.message}\n${reason.stack ?? ""}`
        : String(reason);
    capturedErrors.push(`rejection: ${msg}`);
    // eslint-disable-next-line no-console
    console.error("[unhandled rejection]", msg);
  };
  window.addEventListener("error", onError);
  window.addEventListener("unhandledrejection", onRejection);
  return () => {
    window.removeEventListener("error", onError);
    window.removeEventListener("unhandledrejection", onRejection);
  };
});

const addTaskInput = () => page.getByPlaceholder("Type here").first();
const addTaskSubmit = () =>
  page.getByRole("button", { name: /^Submit$/ }).first();

test("opens the Add New Task modal when the button is clicked", async () => {
  await renderServer(<Home />);

  const addButton = page.getByRole("button", { name: /Add New Task/i });
  await expect.element(addButton).toBeVisible();

  await addButton.click();

  const modalHeading = page.getByRole("heading", { name: /Add New Task/i });
  await expect.element(modalHeading).toBeVisible();
  await expect.element(addTaskInput()).toBeVisible();
});

test.skip("adding a todo shows it after the Server Component re-renders", async () => {
  // BLOCKED under Next 16.3.2 + vitest-plugin-rsc@0.2.3.
  //
  // Symptom: `handleSubmitNewTodo` in AddTask.tsx awaits `addTodo(todo)`
  // (a Server Action). React's client stub POSTs the action via the
  // plugin's RPC, but two things break end-to-end:
  //   1. Args deserialize to `undefined` server-side, so `addTodo`'s inner
  //      fetch sends `body: undefined` (JSON.stringify(undefined) === undefined).
  //   2. React's client `fetchServerAction` throws
  //      `Cannot read properties of undefined (reading 'moduleMap')` while
  //      decoding the Flight response.
  //
  // Both symptoms point at the plugin's action RPC + moduleMap plumbing
  // needing a follow-up fix for Next 16.3.x — separate from the
  // `createFlightRouterState` arity patch (see patches/vitest-plugin-rsc+0.2.3.patch),
  // which unblocked plain Server Component rendering.
  //
  // Workaround options for now:
  //  - Test client interactions via `.browser.test.tsx` (vi.mock works there).
  //  - Test the Server Action itself as a plain async fn in a unit test.
  //  - Assert on rendered output after re-render without exercising the write.
  //
  // Re-enable once the plugin (or a local patch) handles action RPC under
  // Next 16.3.x.
  const { rerender } = await renderServer(<Home />);

  await expect.element(page.getByText("Buy milk")).toBeVisible();
  await expect
    .element(page.getByText("Ship the RFC", { exact: true }))
    .not.toBeInTheDocument();

  await page.getByRole("button", { name: /Add New Task/i }).click();
  await addTaskInput().fill("Ship the RFC");
  await addTaskSubmit().click();

  await vi.waitFor(
    () => {
      if (capturedErrors.length > 0) {
        throw new Error(
          `Browser threw before POST reached MSW:\n${capturedErrors.join("\n---\n")}`,
        );
      }
      expect(apiState.postedTasks).toHaveLength(1);
      expect(apiState.postedTasks[0].text).toBe("Ship the RFC");
    },
    { timeout: 5000, interval: 50 },
  );

  await rerender(<Home />);

  await expect.element(page.getByText("Ship the RFC")).toBeVisible();
});
