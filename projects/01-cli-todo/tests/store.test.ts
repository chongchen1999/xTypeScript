import { describe, expect, it, beforeEach, afterEach } from "bun:test";
import path from "node:path";
import * as store from "../src/store.js";

// Point the store at a temp directory so tests don't touch real data
const tmpDir = path.join(import.meta.dir, ".tmp-test");
process.env["TODO_DATA_DIR"] = tmpDir;

beforeEach(async () => {
  await Bun.write(path.join(tmpDir, "todos.json"), JSON.stringify({ nextId: 1, todos: [] }));
});

afterEach(async () => {
  const file = Bun.file(path.join(tmpDir, "todos.json"));
  if (await file.exists()) await file.delete?.();
});

describe("addTodo", () => {
  it("creates a todo with the correct fields", async () => {
    const todo = await store.addTodo("Buy milk", "low");
    expect(todo.id).toBe(1);
    expect(todo.title).toBe("Buy milk");
    expect(todo.priority).toBe("low");
    expect(todo.status).toBe("pending");
    expect(todo.doneAt).toBeNull();
  });

  it("auto-increments IDs", async () => {
    const a = await store.addTodo("A", "low");
    const b = await store.addTodo("B", "high");
    expect(b.id).toBe(a.id + 1);
  });
});

describe("listTodos", () => {
  beforeEach(async () => {
    await store.addTodo("Task A", "high");
    await store.addTodo("Task B", "low");
    await store.addTodo("Task C", "medium");
  });

  it("returns all todos when status is 'all'", async () => {
    const todos = await store.listTodos({ status: "all" });
    expect(todos.length).toBe(3);
  });

  it("filters by priority", async () => {
    const todos = await store.listTodos({ status: "all", priority: "high" });
    expect(todos.every(t => t.priority === "high")).toBe(true);
    expect(todos.length).toBe(1);
  });
});

describe("markDone", () => {
  it("marks a todo as done and sets doneAt", async () => {
    const { id } = await store.addTodo("Finish report", "medium");
    const todo   = await store.markDone(id);
    expect(todo?.status).toBe("done");
    expect(todo?.doneAt).not.toBeNull();
  });

  it("returns null for unknown id", async () => {
    const result = await store.markDone(999);
    expect(result).toBeNull();
  });
});

describe("removeTodo", () => {
  it("removes an existing todo", async () => {
    const { id } = await store.addTodo("Remove me", "low");
    const ok     = await store.removeTodo(id);
    expect(ok).toBe(true);
    const todos = await store.listTodos({ status: "all" });
    expect(todos.find(t => t.id === id)).toBeUndefined();
  });

  it("returns false for unknown id", async () => {
    expect(await store.removeTodo(999)).toBe(false);
  });
});

describe("clearTodos", () => {
  it("clears all todos", async () => {
    await store.addTodo("A", "low");
    await store.addTodo("B", "high");
    const n = await store.clearTodos();
    expect(n).toBe(2);
    expect((await store.listTodos({ status: "all" })).length).toBe(0);
  });

  it("clears only done todos when done-only", async () => {
    const { id } = await store.addTodo("Done task", "low");
    await store.addTodo("Pending task", "low");
    await store.markDone(id);
    const n = await store.clearTodos("done");
    expect(n).toBe(1);
    expect((await store.listTodos({ status: "all" })).length).toBe(1);
  });
});
