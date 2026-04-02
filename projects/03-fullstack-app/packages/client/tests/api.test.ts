import { describe, it, expect, beforeEach, mock } from "bun:test";
import { ENDPOINTS } from "@fullstack/shared";
import type { Note, CreateNote, UpdateNote } from "@fullstack/shared";

const MOCK_NOTE: Note = {
  id: 1,
  title: "Test Note",
  body: "Test body content",
  status: "active",
  createdAt: "2026-04-01T00:00:00.000Z",
  updatedAt: "2026-04-01T00:00:00.000Z",
};

function mockFetch(body: unknown, status = 200) {
  const ok = status >= 200 && status < 300;
  return mock(() =>
    Promise.resolve(
      new Response(
        status === 204 ? null : JSON.stringify(body),
        { status, headers: { "Content-Type": "application/json" } },
      ),
    ),
  );
}

// Re-import api fresh for each test so mocked fetch is picked up
async function loadApi() {
  const mod = await import("../src/api.ts");
  return mod.api;
}

describe("api.notes", () => {
  let api: Awaited<ReturnType<typeof loadApi>>;

  beforeEach(async () => {
    globalThis.fetch = mockFetch([MOCK_NOTE]) as unknown as typeof fetch;
    api = await loadApi();
  });

  it("list() sends GET with default status=active", async () => {
    const notes = await api.notes.list();
    expect(globalThis.fetch).toHaveBeenCalledTimes(1);
    const [url, init] = (globalThis.fetch as ReturnType<typeof mock>).mock.calls[0];
    expect(url).toBe(`${ENDPOINTS.notes}?status=active`);
    expect(init?.method).toBeUndefined(); // GET by default
    expect(notes).toEqual([MOCK_NOTE]);
  });

  it("list() forwards custom status filter", async () => {
    await api.notes.list("archived");
    const [url] = (globalThis.fetch as ReturnType<typeof mock>).mock.calls[0];
    expect(url).toBe(`${ENDPOINTS.notes}?status=archived`);
  });

  it("get() requests the correct note endpoint", async () => {
    globalThis.fetch = mockFetch(MOCK_NOTE) as unknown as typeof fetch;
    const note = await api.notes.get(42);
    const [url] = (globalThis.fetch as ReturnType<typeof mock>).mock.calls[0];
    expect(url).toBe(ENDPOINTS.note(42));
    expect(note).toEqual(MOCK_NOTE);
  });

  it("create() sends POST with JSON body", async () => {
    globalThis.fetch = mockFetch(MOCK_NOTE, 201) as unknown as typeof fetch;
    const payload: CreateNote = { title: "New", body: "Content", status: "active" };
    const note = await api.notes.create(payload);
    const [url, init] = (globalThis.fetch as ReturnType<typeof mock>).mock.calls[0];
    expect(url).toBe(ENDPOINTS.notes);
    expect(init?.method).toBe("POST");
    expect(JSON.parse(init?.body as string)).toEqual(payload);
    expect(note).toEqual(MOCK_NOTE);
  });

  it("update() sends PATCH with partial body", async () => {
    globalThis.fetch = mockFetch(MOCK_NOTE) as unknown as typeof fetch;
    const patch: UpdateNote = { title: "Updated Title" };
    await api.notes.update(1, patch);
    const [url, init] = (globalThis.fetch as ReturnType<typeof mock>).mock.calls[0];
    expect(url).toBe(ENDPOINTS.note(1));
    expect(init?.method).toBe("PATCH");
    expect(JSON.parse(init?.body as string)).toEqual(patch);
  });

  it("delete() sends DELETE and handles 204 No Content", async () => {
    globalThis.fetch = mockFetch(null, 204) as unknown as typeof fetch;
    const result = await api.notes.delete(1);
    const [url, init] = (globalThis.fetch as ReturnType<typeof mock>).mock.calls[0];
    expect(url).toBe(ENDPOINTS.note(1));
    expect(init?.method).toBe("DELETE");
    expect(result).toBeUndefined();
  });

  it("throws on non-ok response with server error message", async () => {
    globalThis.fetch = mockFetch({ error: "Not Found" }, 404) as unknown as typeof fetch;
    expect(api.notes.get(999)).rejects.toThrow("Not Found");
  });

  it("throws with status text fallback when body has no error field", async () => {
    globalThis.fetch = mock(() =>
      Promise.resolve(new Response("not json", { status: 500, statusText: "Internal Server Error" })),
    ) as unknown as typeof fetch;
    expect(api.notes.get(1)).rejects.toThrow("Internal Server Error");
  });
});
