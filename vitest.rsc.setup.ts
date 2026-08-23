import { afterAll, afterEach, beforeAll, beforeEach } from "vitest";
import { cleanup as _cleanup, initialize } from "vitest-plugin-rsc/nextjs/testing-library";
// _cleanup intentionally unused — see afterEach note below.
import { nextRscRequestHandlers } from "vitest-plugin-rsc/nextjs/msw";
import { setupWorker } from "msw/browser";
import { http, HttpResponse } from "msw";
import "@/app/globals.css";

// Shared state that tests read and reset. The MSW handlers mutate this in
// response to real network calls from the Server Component (GET) and Server
// Action (POST) — no vi.mock needed. vi.mock doesn't work reliably against
// modules with "use server" because the plugin's action transform beats it
// to the module registry.
export const apiState: {
  todos: Array<{ id: string; text: string }>;
  postedTasks: Array<{ id: string; text: string }>;
} = {
  todos: [],
  postedTasks: [],
};

const tasksGetHandler = http.get("http://localhost:3001/tasks", () => {
  return HttpResponse.json(apiState.todos);
});

const tasksPostHandler = http.post("http://localhost:3001/tasks", async ({ request }) => {
  const raw = await request.text();
  // eslint-disable-next-line no-console
  console.log("[MSW POST /tasks] raw body:", JSON.stringify(raw), "len:", raw.length);
  let body: { id: string; text: string };
  try {
    body = raw ? (JSON.parse(raw) as { id: string; text: string }) : { id: `unknown-${Date.now()}`, text: "" };
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error("[MSW POST /tasks] JSON parse failed:", e, "raw:", raw);
    body = { id: `unparsed-${Date.now()}`, text: raw };
  }
  apiState.postedTasks.push(body);
  apiState.todos.push(body);
  return HttpResponse.json(body, { status: 201 });
});

const worker = setupWorker(
  ...nextRscRequestHandlers,
  tasksGetHandler,
  tasksPostHandler,
);

beforeAll(async () => {
  await worker.start({ quiet: true, onUnhandledRequest: "bypass" });
  initialize({ nextRscRequestsViaMsw: true });
});

afterAll(() => {
  worker.stop();
});

beforeEach(() => {
  apiState.todos = [
    { id: "task-1", text: "Buy milk" },
    { id: "task-2", text: "Write RFC" },
  ];
  apiState.postedTasks = [];
  worker.resetHandlers(
    ...nextRscRequestHandlers,
    tasksGetHandler,
    tasksPostHandler,
  );
});

afterEach(async () => {
  // DOM cleanup disabled so the last-rendered RSC DOM persists in the Vitest UI
  // iframe panel between tests (Storybook-like inspection). Re-enable with
  // `await cleanup();` if cross-test DOM leakage becomes a problem.
});
