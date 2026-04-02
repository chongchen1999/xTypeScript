/**
 * Solution: 03-03 Type-Safe Getters
 */

// Mapped type: rename keys with template literal + Capitalize
type Getters<T> = {
  [K in keyof T as `get${Capitalize<string & K>}`]: () => T[K];
};

function makeGetters<T extends Record<string, unknown>>(obj: T): Getters<T> {
  const result = {} as Record<string, () => unknown>;

  for (const key in obj) {
    const getterName = `get${key[0].toUpperCase()}${key.slice(1)}`;
    result[getterName] = () => obj[key];
  }

  return result as Getters<T>;
}

// --- manual tests ---
const user = { name: "Alice", age: 30, active: true };
const getters = makeGetters(user);

console.log(getters.getName());   // "Alice"
console.log(getters.getAge());    // 30
console.log(getters.getActive()); // true
