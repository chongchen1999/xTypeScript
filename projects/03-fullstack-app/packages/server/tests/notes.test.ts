import { describe, expect, it, beforeAll } from "bun:test";

process.env["DATABASE_URL"] = ":memory:";
process.env["PORT"]         = "3001";

// Start server before tests
beforeAll(async () => {
  await import("../src/main.js");
  // Give the server a tick to bind
  await new Promise(r => setTimeout(r, 50));
});

const BASE = "http://localhost:3001/api";
const json = (body: unknown) => ({
  method:  "POST",
  headers: { "Content-Type": "application/json" },
  body:    JSON.stringify(body),
});

describe("Notes API", () => {
  let createdId: number;

  it("POST /notes creates a note", async () => {
    const res  = await fetch(`${BASE}/notes`, json({ title: "Hello", body: "World" }));
    const note = await res.json() as { id: number; title: string };
    expect(res.status).toBe(201);
    expect(note.title).toBe("Hello");
    createdId = note.id;
  });

  it("GET /notes returns the created note", async () => {
    const res   = await fetch(`${BASE}/notes?status=all`);
    const notes = await res.json() as unknown[];
    expect(res.status).toBe(200);
    expect(notes.length).toBeGreaterThan(0);
  });

  it("GET /notes/:id returns single note", async () => {
    const res  = await fetch(`${BASE}/notes/${createdId}`);
    const note = await res.json() as { id: number };
    expect(res.status).toBe(200);
    expect(note.id).toBe(createdId);
  });

  it("PATCH /notes/:id updates title", async () => {
    const res  = await fetch(`${BASE}/notes/${createdId}`, {
      method:  "PATCH",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ title: "Updated" }),
    });
    const note = await res.json() as { title: string };
    expect(res.status).toBe(200);
    expect(note.title).toBe("Updated");
  });

  it("DELETE /notes/:id removes the note", async () => {
    const res = await fetch(`${BASE}/notes/${createdId}`, { method: "DELETE" });
    expect(res.status).toBe(204);
  });

  it("GET /notes/:id returns 404 after delete", async () => {
    const res = await fetch(`${BASE}/notes/${createdId}`);
    expect(res.status).toBe(404);
  });
});
