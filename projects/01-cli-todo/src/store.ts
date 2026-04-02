import path from "node:path";
import type { TodoStore, Todo, Priority } from "@/types.js";

const DATA_FILE = path.join(
  process.env["TODO_DATA_DIR"] ?? path.join(import.meta.dir, ".."),
  "todos.json",
);

const EMPTY_STORE: TodoStore = { nextId: 1, todos: [] };

export async function readStore(): Promise<TodoStore> {
  const file = Bun.file(DATA_FILE);
  if (!(await file.exists())) return structuredClone(EMPTY_STORE);
  return file.json() as Promise<TodoStore>;
}

export async function writeStore(store: TodoStore): Promise<void> {
  await Bun.write(DATA_FILE, JSON.stringify(store, null, 2));
}

// --- CRUD helpers ---

export async function addTodo(title: string, priority: Priority): Promise<Todo> {
  const store = await readStore();
  const todo: Todo = {
    id:        store.nextId++,
    title,
    priority,
    status:    "pending",
    createdAt: new Date().toISOString(),
    doneAt:    null,
  };
  store.todos.push(todo);
  await writeStore(store);
  return todo;
}

export async function listTodos(opts: {
  status?:   "pending" | "done" | "all";
  priority?: Priority;
}): Promise<Todo[]> {
  const { todos } = await readStore();
  return todos.filter(t => {
    if (opts.status && opts.status !== "all" && t.status !== opts.status) return false;
    if (opts.priority && t.priority !== opts.priority) return false;
    return true;
  });
}

export async function markDone(id: number): Promise<Todo | null> {
  const store = await readStore();
  const todo  = store.todos.find(t => t.id === id);
  if (!todo) return null;
  todo.status = "done";
  todo.doneAt = new Date().toISOString();
  await writeStore(store);
  return todo;
}

export async function removeTodo(id: number): Promise<boolean> {
  const store  = await readStore();
  const before = store.todos.length;
  store.todos  = store.todos.filter(t => t.id !== id);
  if (store.todos.length === before) return false;
  await writeStore(store);
  return true;
}

export async function clearTodos(status?: "done"): Promise<number> {
  const store  = await readStore();
  const before = store.todos.length;
  store.todos  = status === "done"
    ? store.todos.filter(t => t.status !== "done")
    : [];
  const removed = before - store.todos.length;
  await writeStore(store);
  return removed;
}
