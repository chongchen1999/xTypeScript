/**
 * Exercise 03-01: Type Utility Toolkit
 *
 * Implement the following utility types from scratch.
 * Hint: use conditional types, infer, and mapped types.
 */

// 1. DeepReadonly<T>
//    Make every nested property readonly (not just top-level).
//    Hint: recurse into objects; leave primitives and functions untouched.
type DeepReadonly<T> = any; // TODO

// 2. UnwrapPromise<T>
//    Unwrap a Promise (or nested Promise) to its resolved type.
//    UnwrapPromise<Promise<Promise<number>>> → number
//    UnwrapPromise<string>                  → string
type UnwrapPromise<T> = any; // TODO

// 3. FlattenObject<T>
//    Given an object with one level of nesting, flatten it.
//    FlattenObject<{ a: { x: 1; y: 2 }; b: { z: 3 } }> → { x: 1; y: 2; z: 3 }
//    Hint: T[keyof T] gives the union of value types.
type FlattenObject<T extends Record<string, Record<string, unknown>>> = any; // TODO

// 4. RequireAtLeastOne<T, K>
//    Given an object type T and a union of keys K, require at least one of K to be present.
//    Example:
//      type Filter = RequireAtLeastOne<{ name?: string; age?: number; email?: string }, "name" | "email">
//      const ok: Filter  = { name: "Alice" };          // valid
//      const bad: Filter = { age: 30 };                // invalid — neither name nor email
type RequireAtLeastOne<T, K extends keyof T = keyof T> = any; // TODO

// --- type-level tests ---
type Nested = { a: { b: { c: string } }; d: number[] };
type ReadonlyNested = DeepReadonly<Nested>;
// ReadonlyNested["a"]["b"]["c"] should be string (readonly)

type P1 = UnwrapPromise<Promise<Promise<number>>>; // number
type P2 = UnwrapPromise<string>;                  // string

type Flat = FlattenObject<{ group1: { x: number; y: number }; group2: { z: string } }>;
// { x: number; y: number; z: string }

type Filter = RequireAtLeastOne<{ name?: string; age?: number; email?: string }, "name" | "email">;
const ok: Filter = { name: "Alice" };
// const bad: Filter = { age: 30 }; // should be a TS error

console.log("types OK");
