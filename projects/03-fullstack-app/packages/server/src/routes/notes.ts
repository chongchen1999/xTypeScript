import { eq, desc } from "drizzle-orm";
import { Hono }     from "hono";
import { zValidator } from "@hono/zod-validator";
import { db, notes } from "@/db.js";
import { CreateNoteSchema, UpdateNoteSchema } from "@fullstack/shared";
import type { Note } from "@fullstack/shared";

export const notesRouter = new Hono();

// Converts a DB row (timestamps as Date objects) to the shared Note shape
function toNote(row: typeof notes.$inferSelect): Note {
  return {
    id:        row.id,
    title:     row.title,
    body:      row.body,
    status:    row.status,
    createdAt: row.createdAt instanceof Date ? row.createdAt.toISOString() : new Date(row.createdAt * 1000).toISOString(),
    updatedAt: row.updatedAt instanceof Date ? row.updatedAt.toISOString() : new Date(row.updatedAt * 1000).toISOString(),
  };
}

// GET /api/notes?status=active|archived|all
notesRouter.get("/", async (c) => {
  const status = c.req.query("status") ?? "active";
  const rows   = status === "all"
    ? await db.select().from(notes).orderBy(desc(notes.createdAt)).all()
    : await db.select().from(notes).where(eq(notes.status, status as "active" | "archived")).orderBy(desc(notes.createdAt)).all();
  return c.json(rows.map(toNote));
});

// GET /api/notes/:id
notesRouter.get("/:id", async (c) => {
  const id  = Number(c.req.param("id"));
  const row = await db.select().from(notes).where(eq(notes.id, id)).get();
  if (!row) return c.json({ error: `Note ${id} not found` }, 404);
  return c.json(toNote(row));
});

// POST /api/notes
notesRouter.post("/", zValidator("json", CreateNoteSchema), async (c) => {
  const data = c.req.valid("json");
  const [row] = await db.insert(notes).values(data).returning().all();
  return c.json(toNote(row!), 201);
});

// PATCH /api/notes/:id
notesRouter.patch("/:id", zValidator("json", UpdateNoteSchema), async (c) => {
  const id   = Number(c.req.param("id"));
  const data = c.req.valid("json");
  const row  = await db
    .update(notes)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(notes.id, id))
    .returning()
    .get();
  if (!row) return c.json({ error: `Note ${id} not found` }, 404);
  return c.json(toNote(row));
});

// DELETE /api/notes/:id
notesRouter.delete("/:id", async (c) => {
  const id     = Number(c.req.param("id"));
  const result = await db.delete(notes).where(eq(notes.id, id)).returning().all();
  if (result.length === 0) return c.json({ error: `Note ${id} not found` }, 404);
  return c.body(null, 204);
});
