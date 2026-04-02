/**
 * Solution: 07c-02 Store with Produce Pattern
 */

const listenerMap = new WeakMap<object, Set<() => void>>();

export function createStore<T extends object>(
  initial: T,
): [T, (updater: (draft: T) => void) => void] {
  let current = structuredClone(initial);
  const listeners = new Set<() => void>();

  // Proxy that always reads from `current`
  const proxy = new Proxy({} as T, {
    get(_target, prop, receiver) {
      return Reflect.get(current, prop, receiver);
    },
    set() {
      throw new Error("Store is readonly. Use update() instead.");
    },
    has(_target, prop) {
      return prop in current;
    },
    ownKeys() {
      return Reflect.ownKeys(current);
    },
    getOwnPropertyDescriptor(_target, prop) {
      return Reflect.getOwnPropertyDescriptor(current, prop);
    },
  });

  listenerMap.set(proxy, listeners);

  const update = (updater: (draft: T) => void): void => {
    const draft = structuredClone(current);
    updater(draft);
    current = draft;
    listeners.forEach((cb) => cb());
  };

  return [proxy, update];
}

export function onChange<T extends object>(
  store: T,
  callback: () => void,
): void {
  const listeners = listenerMap.get(store);
  if (!listeners) throw new Error("Not a store proxy");
  listeners.add(callback);
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
  console.log("After add:", store.todos.length);
  console.log("Logs:", logs);

  update((draft) => {
    draft.todos.push({ id: 2, text: "Learn stores", done: false });
    draft.todos[0].done = true;
  });
  console.log("After update:", store.todos.length);
  console.log("First done:", store.todos[0].done);
  console.log("Logs:", logs);

  update((draft) => {
    draft.filter = "active";
  });
  console.log("Filter:", store.filter);
  console.log("Logs:", logs);
}

main();
