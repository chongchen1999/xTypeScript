import { Hono }  from "hono";
import { logger } from "hono/logger";
import { cors }   from "hono/cors";
import { notesRouter } from "@/routes/notes.js";

const app = new Hono();

app.use("*", logger());
app.use("*", cors({ origin: process.env["CLIENT_ORIGIN"] ?? "http://localhost:5173" }));

app.get("/health", (c) => c.json({ status: "ok", ts: Date.now() }));
app.route("/api/notes", notesRouter);
app.notFound((c) => c.json({ error: "Not found" }, 404));

const port = Number(process.env["PORT"] ?? 3000);
const server = Bun.serve({ port, fetch: app.fetch });
console.log(`Server listening on http://localhost:${server.port}`);
