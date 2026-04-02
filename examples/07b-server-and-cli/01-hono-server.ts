/**
 * Hono HTTP server with middleware and Effect integration
 * Run: bun examples/07b-server-and-cli/01-hono-server.ts
 */

import { Hono } from "hono";
import { logger } from "hono/logger";
import { cors } from "hono/cors";
import { createMiddleware } from "hono/factory";

// --- 1. Basic routing ---
const app = new Hono();

app.use("*", logger());
app.use("*", cors());

app.get("/",           (c) => c.text("Hello Hono!"));
app.get("/health",     (c) => c.json({ status: "ok", ts: Date.now() }));

// Path parameters
app.get("/users/:id", (c) => {
  const id = c.req.param("id");
  return c.json({ id, name: `User ${id}` });
});

// Query parameters
app.get("/search", (c) => {
  const q    = c.req.query("q") ?? "";
  const page = Number(c.req.query("page") ?? "1");
  return c.json({ q, page, results: [] });
});

// --- 2. Route groups ---
const api = new Hono();

api.get("/items",     (c) => c.json([{ id: 1, name: "Widget" }]));
api.post("/items",    async (c) => {
  const body = await c.req.json<{ name: string }>();
  return c.json({ id: Date.now(), name: body.name }, 201);
});
api.delete("/items/:id", (c) => c.json({ deleted: c.req.param("id") }));

app.route("/api", api);

// --- 3. Custom middleware with typed variables ---
type AuthVars = { Variables: { userId: string } };

const auth = createMiddleware<AuthVars>(async (c, next) => {
  const token = c.req.header("Authorization")?.replace("Bearer ", "");
  if (!token || token !== "valid-token") {
    return c.json({ error: "Unauthorized" }, 401);
  }
  c.set("userId", `user-from-${token}`);
  await next();
});

app.use("/protected/*", auth);
app.get("/protected/profile", (c) =>
  c.json({ userId: c.get("userId"), plan: "pro" })
);

// --- 4. Start server and run a few test requests ---
const server = Bun.serve({ port: 0, fetch: app.fetch });
const base   = `http://localhost:${server.port}`;

const r1 = await (await fetch(`${base}/health`)).json();
console.log("/health:", r1);

const r2 = await (await fetch(`${base}/users/42`)).json();
console.log("/users/42:", r2);

const r3 = await (await fetch(`${base}/search?q=typescript&page=2`)).json();
console.log("/search:", r3);

const r4 = await fetch(`${base}/protected/profile`, {
  headers: { Authorization: "Bearer valid-token" },
});
console.log("/protected/profile:", await r4.json());

const r5 = await fetch(`${base}/protected/profile`);
console.log("unauthorized:", r5.status); // 401

server.stop(true);
