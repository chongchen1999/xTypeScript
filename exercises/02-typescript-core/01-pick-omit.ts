/**
 * Exercise 02-01: Implement Pick and Omit
 *
 * Re-implement the built-in utility types from scratch using mapped types.
 *
 * Do NOT use the built-in Pick / Omit — write them yourself.
 */

// --- TODO: implement MyPick ---
// MyPick<T, K> should produce an object type with only the keys in K.
// Example: MyPick<{ a: 1; b: 2; c: 3 }, "a" | "c"> → { a: 1; c: 3 }
type MyPick<T, K> = any; // TODO

// --- TODO: implement MyOmit ---
// MyOmit<T, K> should produce an object type with the keys in K removed.
// Example: MyOmit<{ a: 1; b: 2; c: 3 }, "b"> → { a: 1; c: 3 }
type MyOmit<T, K> = any; // TODO

// --- type-level tests (should not produce TS errors when implemented correctly) ---
interface User {
  id: number;
  name: string;
  email: string;
  role: "admin" | "user";
}

type UserPreview = MyPick<User, "id" | "name">;
// Expected: { id: number; name: string }

type UserWithoutEmail = MyOmit<User, "email">;
// Expected: { id: number; name: string; role: "admin" | "user" }

// These assignments should compile without errors:
const preview: UserPreview = { id: 1, name: "Alice" };
const noEmail: UserWithoutEmail = { id: 1, name: "Alice", role: "user" };

console.log(preview, noEmail);
