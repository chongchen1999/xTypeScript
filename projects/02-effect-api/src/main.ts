import { Effect, Layer } from "effect";
import { Hono }          from "hono";
import { logger }        from "hono/logger";
import { cors }          from "hono/cors";
import { TaskRepositoryLive, TaskRepository } from "@/services/task-repository.js";
import { buildTasksRouter } from "@/routes/tasks.js";

// Initialise DB schema inline (idempotent CREATE TABLE IF NOT EXISTS)
await import("@/db/migrate.js");

// Resolve services via Effect layers
const AppLayer = TaskRepositoryLive;
const repo     = await Effect.runPromise(
  TaskRepository.pipe(Effect.provide(AppLayer)),
);

// --- Hono app ---
const app = new Hono();

app.use("*", logger());
app.use("*", cors());

app.get("/health", (c) => c.json({ status: "ok", ts: Date.now() }));
app.route("/tasks", buildTasksRouter(repo));

// 404 fallback
app.notFound((c) => c.json({ error: "Not found" }, 404));

// --- Start ---
const port = Number(process.env["PORT"] ?? 3000);
const server = Bun.serve({ port, fetch: app.fetch });
console.log(`Effect API listening on http://localhost:${server.port}`);
