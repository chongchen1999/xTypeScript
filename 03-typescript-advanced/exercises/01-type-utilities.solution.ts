/**
 * Solution: 03-01 Type Utility Toolkit
 */

// 1. DeepReadonly — recurse into object types, leave primitives/functions alone
type DeepReadonly<T> = T extends (...args: any[]) => any
  ? T
  : T extends object
  ? { readonly [K in keyof T]: DeepReadonly<T[K]> }
  : T;

// 2. UnwrapPromise — recursively peel Promise<> layers
type UnwrapPromise<T> = T extends Promise<infer V> ? UnwrapPromise<V> : T;

// 3. FlattenObject — union of value types, then intersect via distributive trick
// T[keyof T] gives the union of all nested record types.
// We use UnionToIntersection to merge them.
type UnionToIntersection<U> = (U extends any ? (x: U) => void : never) extends (x: infer I) => void
  ? I
  : never;

type FlattenObject<T extends Record<string, Record<string, unknown>>> =
  UnionToIntersection<T[keyof T]>;

// 4. RequireAtLeastOne — Omit<T, K> & union of { [P in K]: T[P] }
type RequireAtLeastOne<T, K extends keyof T = keyof T> =
  Omit<T, K> & { [P in K]-?: Required<Pick<T, P>> & Partial<Omit<T, P>> }[K];

// --- type-level tests ---
type Nested = { a: { b: { c: string } }; d: number[] };
type ReadonlyNested = DeepReadonly<Nested>;

type P1 = UnwrapPromise<Promise<Promise<number>>>; // number
type P2 = UnwrapPromise<string>;                  // string

type Flat = FlattenObject<{ group1: { x: number; y: number }; group2: { z: string } }>;

type Filter = RequireAtLeastOne<{ name?: string; age?: number; email?: string }, "name" | "email">;
const ok: Filter = { name: "Alice" };

console.log("types OK");
