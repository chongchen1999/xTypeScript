import { describe, expect, it, beforeAll } from "bun:test";

const BASE = "http://localhost:3001";

// Spin up the server for integration tests
let server: ReturnType<typeof Bun.serve>;

beforeAll(async () => {
  // Import the app and start on a test port
  // In a real project, extract app creation into a factory function
  process.env["PORT"]      = "3001";
  process.env["API_TOKEN"] = "test-token";
  await import("../src/main.js");
});

const headers = { Authorization: "Bearer test-token", "Content-Type": "application/json" };

describe("GET /health", () => {
  it("returns 200 with status ok", async () => {
    const res  = await fetch(`${BASE}/health`);
    const body = await res.json() as { status: string };
    expect(res.status).toBe(200);
    expect(body.status).toBe("ok");
  });
});

describe("GET /api/items", () => {
  it("returns 401 without auth header", async () => {
    const res = await fetch(`${BASE}/api/items`);
    expect(res.status).toBe(401);
  });

  it("returns item list with valid token", async () => {
    const res  = await fetch(`${BASE}/api/items`, { headers });
    const body = await res.json() as unknown[];
    expect(res.status).toBe(200);
    expect(Array.isArray(body)).toBe(true);
    expect(body.length).toBeGreaterThan(0);
  });
});

describe("POST /api/items", () => {
  it("creates a new item", async () => {
    const res  = await fetch(`${BASE}/api/items`, {
      method: "POST",
      headers,
      body: JSON.stringify({ name: "Sprocket", description: "A test sprocket" }),
    });
    const body = await res.json() as { id: number; name: string };
    expect(res.status).toBe(201);
    expect(body.name).toBe("Sprocket");
    expect(typeof body.id).toBe("number");
  });
});
