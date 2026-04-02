import { Effect, Layer } from "effect";
import { Hono }          from "hono";
import { logger }        from "hono/logger";
import { cors }          from "hono/cors";
import { ItemRepositoryLive } from "@/services/item-repository.js";
import { LoggerLive }         from "@/services/logger.js";
import { itemsRouter }        from "@/routes/items.js";
import { authMiddleware }     from "@/middleware/auth.js";
import type { AppEnv }        from "@/types.js";

// Build the Effect layer (extend with more services as the app grows)
const AppLayer = Layer.mergeAll(LoggerLive, ItemRepositoryLive);

// Resolve the repository once at startup and inject via Hono context
const { ItemRepository } = await import("@/services/item-repository.js");
const repo = await Effect.runPromise(
  ItemRepository.pipe(Effect.provide(AppLayer)),
);

// --- Hono app ---
const app = new Hono<AppEnv>();

app.use("*", logger());
app.use("*", cors());

// Inject resolved services into every request context
app.use("*", async (c, next) => {
  c.set("repo",   repo);
  c.set("userId", null);
  await next();
});

app.get("/health", (c) =>
  c.json({ status: "ok", ts: Date.now() }),
);

// Protected resource routes
app.use("/api/*", authMiddleware);
app.route("/api/items", itemsRouter);

// --- Start ---
const port = Number(process.env["PORT"] ?? 3000);
const server = Bun.serve({ port, fetch: app.fetch });
console.log(`Listening on http://localhost:${server.port}`);
