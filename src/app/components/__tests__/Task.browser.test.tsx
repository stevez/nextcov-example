import React from "react";
import { beforeEach, describe, expect, test, vi, Mock } from "vitest";
import { page } from "vitest/browser";
import { render } from "vitest-browser-react";
import Task from "../Task";
import { editTodo, deleteTodo } from "@/api/api";
import { useRouter } from "next/navigation";

vi.mock("@/api/api", () => ({
  editTodo: vi.fn(),
  deleteTodo: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: vi.fn(),
}));

describe("Task (browser)", () => {
  const mockRouter = { refresh: vi.fn() };
  const task = { id: "task-1", text: "Buy milk" };

  const renderTask = () =>
    render(
      <table>
        <tbody>
          <Task task={task} />
        </tbody>
      </table>,
    );

  beforeEach(() => {
    (useRouter as Mock).mockReturnValue(mockRouter);
    vi.clearAllMocks();
  });

  test("renders task text", async () => {
    renderTask();
    await expect.element(page.getByText("Buy milk")).toBeVisible();
  });

  test("toggles done state on checkbox click", async () => {
    renderTask();
    const checkbox = page.getByRole("checkbox");
    await checkbox.click();
    await expect
      .element(page.getByText("Buy milk"))
      .toHaveStyle({ textDecoration: "line-through" });
  });

  test("submits edited text and refreshes on Edit modal submit", async () => {
    const { container } = await renderTask();

    const iconSpans = container.querySelectorAll<HTMLSpanElement>(
      "td.flex.gap-5 > span",
    );
    iconSpans[0].click(); // Edit

    const input = page.getByPlaceholder("Type here");
    await input.fill("Buy milk and eggs");
    await page.getByRole("button", { name: "Submit" }).click();

    await vi.waitFor(() => {
      expect(editTodo).toHaveBeenCalledWith({
        id: "task-1",
        text: "Buy milk and eggs",
      });
    });
    expect(mockRouter.refresh).toHaveBeenCalled();
  });

  test("deletes task and refreshes on Delete modal confirm", async () => {
    const { container } = await renderTask();

    const iconSpans = container.querySelectorAll<HTMLSpanElement>(
      "td.flex.gap-5 > span",
    );
    iconSpans[1].click(); // Trash

    await page.getByRole("button", { name: /^Yes$/ }).click();

    await vi.waitFor(() => {
      expect(deleteTodo).toHaveBeenCalledWith("task-1");
    });
    expect(mockRouter.refresh).toHaveBeenCalled();
  });
});
