/**
 * Exercise 07c-02: Store with Produce Pattern
 *
 * Build a simplified state store with an Immer-like `produce` updater.
 *
 * Implement:
 * 1. `createStore<T>(initial)` — returns [state, update] where state is a
 *    deep-readonly proxy and update takes a mutating function applied to a draft
 * 2. `onChange<T>(store, callback)` — subscribe to store changes
 *
 * Requirements:
 * - The returned state object should always reflect the latest data
 * - The updater creates a deep clone, applies mutations to the clone, then
 *   replaces internal state and notifies listeners
 * - onChange callbacks fire after every successful update
 * - Multiple listeners should all be notified
 * - The store proxy should read from the current internal state (not a stale copy)
 */

export function createStore<T extends object>(
  initial: T,
): [T, (updater: (draft: T) => void) => void] {
  // TODO: implement
  throw new Error("Not implemented");
}

export function onChange<T extends object>(
  store: T,
  callback: () => void,
): void {
  // TODO: implement
  throw new Error("Not implemented");
}

// --- manual test ---
function main() {
  type TodoStore = {
    todos: { id: number; text: string; done: boolean }[];
    filter: "all" | "active" | "done";
  };

  const [store, update] = createStore<TodoStore>({
    todos: [],
    filter: "all",
  });

  const logs: string[] = [];
  onChange(store, () => logs.push(`changed: ${store.todos.length} todos`));

  update((draft) => {
    draft.todos.push({ id: 1, text: "Learn signals", done: false });
  });
  console.log("After add:", store.todos.length); // 1
  console.log("Logs:", logs); // ["changed: 1 todos"]

  update((draft) => {
    draft.todos.push({ id: 2, text: "Learn stores", done: false });
    draft.todos[0].done = true;
  });
  console.log("After update:", store.todos.length); // 2
  console.log("First done:", store.todos[0].done); // true
  console.log("Logs:", logs); // ["changed: 1 todos", "changed: 2 todos"]

  update((draft) => {
    draft.filter = "active";
  });
  console.log("Filter:", store.filter); // "active"
  console.log("Logs:", logs); // 3 entries
}

main();
