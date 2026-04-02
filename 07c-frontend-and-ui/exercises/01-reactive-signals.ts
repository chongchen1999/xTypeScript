/**
 * Exercise 07c-01: Reactive Signals
 *
 * Implement a minimal SolidJS-like reactive system with automatic dependency tracking.
 *
 * Requirements:
 * - `createSignal<T>(initial)` returns a [getter, setter] pair.
 * - `createEffect(fn)` runs `fn` immediately, auto-tracks which signals are read
 *   inside it, and re-runs whenever those signals change.
 * - `createMemo<T>(fn)` returns a getter that caches the result of `fn` and only
 *   re-computes when its tracked dependencies change.
 * - Use a global tracking stack so that when a getter is called inside an effect/memo,
 *   the signal knows to register that effect/memo as a subscriber.
 */

export function createSignal<T>(initial: T): [() => T, (v: T) => void] {
  // TODO: implement
  throw new Error("Not implemented");
}

export function createEffect(fn: () => void): void {
  // TODO: implement
  throw new Error("Not implemented");
}

export function createMemo<T>(fn: () => T): () => T {
  // TODO: implement
  throw new Error("Not implemented");
}

// --- manual test (run with: bun 07c-frontend-and-ui/exercises/01-reactive-signals.ts) ---
const [count, setCount] = createSignal(0);
const [name, setName] = createSignal("Alice");

const greeting = createMemo(() => `${name()} has ${count()} items`);

createEffect(() => {
  console.log("Effect:", greeting());
});
// Should log: "Effect: Alice has 0 items"

setCount(1);
// Should log: "Effect: Alice has 1 items"

setCount(2);
// Should log: "Effect: Alice has 2 items"

setName("Bob");
// Should log: "Effect: Bob has 2 items"

console.log("Memo direct read:", greeting());
// Should log: "Memo direct read: Bob has 2 items"
