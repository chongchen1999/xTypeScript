/**
 * Exercise 03-03: Type-Safe Getters via Mapped + Template Literal Types
 *
 * Given an object type T, generate a type `Getters<T>` where each key
 * is prefixed with "get" and capitalized, and the value is a zero-arg function
 * returning the original value type.
 *
 * Example:
 *   Getters<{ name: string; age: number }>
 *   → { getName: () => string; getAge: () => number }
 *
 * Then implement a runtime function `makeGetters(obj)` that creates this object.
 */

// TODO: implement the Getters mapped type
type Getters<T> = any; // TODO

// TODO: implement the runtime function
function makeGetters<T extends Record<string, unknown>>(obj: T): Getters<T> {
  // TODO: implement
  throw new Error("Not implemented");
}

// --- manual tests ---
const user = { name: "Alice", age: 30, active: true };
const getters = makeGetters(user);

console.log(getters.getName());   // "Alice"
console.log(getters.getAge());    // 30
console.log(getters.getActive()); // true

// TypeScript should infer the return types correctly:
// getters.getName() → string
// getters.getAge()  → number
