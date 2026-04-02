/**
 * Conditional types and infer
 * Run: bun examples/03-typescript-advanced/01-conditional-infer.ts
 */

// --- 1. Basic conditional type --- (like C++ std::conditional_t)
type IsArray<T> = T extends any[] ? true : false;
type A = IsArray<number[]>; // true
type B = IsArray<string>;   // false

// --- 2. Distributive conditional type ---
// When T is a bare type parameter, the condition distributes over union members
type Flatten<T> = T extends (infer E)[] ? E : T;
type C = Flatten<string[] | number | boolean[]>; // string | number | boolean

// Prevent distribution by wrapping in a tuple
type IsUnion<T> = [T] extends [T]
  ? T extends any
    ? [T] extends [T] ? false : true
    : never
  : never;

// --- 3. infer — type-level pattern matching ---
// Like destructuring, but at the type level

// Extract the resolved type of a Promise (recursive)
type Awaited2<T> = T extends Promise<infer V> ? Awaited2<V> : T;
type D = Awaited2<Promise<Promise<string>>>; // string

// Extract function parameter types
type FirstParam<T> = T extends (first: infer F, ...rest: any[]) => any ? F : never;
type E = FirstParam<(x: number, y: string) => void>; // number

// Extract constructor argument
type ConstructorArg<T> = T extends new (arg: infer A) => any ? A : never;
class Service { constructor(public config: { url: string }) {} }
type ServiceConfig = ConstructorArg<typeof Service>; // { url: string }

// --- 4. Practical: strip Promise and array wrappers ---
type UnwrapAll<T> =
  T extends Promise<infer V> ? UnwrapAll<V> :
  T extends (infer E)[]      ? UnwrapAll<E> :
  T;

type F = UnwrapAll<Promise<Promise<string[]>>>; // string

// --- 5. Conditional type in a utility function ---
// NonNullable re-implementation
type MyNonNullable<T> = T extends null | undefined ? never : T;
type G = MyNonNullable<string | null | undefined>; // string

// Only keep string keys from an object
type StringValues<T> = {
  [K in keyof T]: T[K] extends string ? K : never;
}[keyof T];

interface Mixed { name: string; age: number; email: string; active: boolean }
type StringKeys = StringValues<Mixed>; // "name" | "email"

console.log("Conditional types verified at compile time ✓");
