/**
 * Exercise 07d-03: Pipe & Data Transform Utilities
 *
 * Build a Remeda-like `pipe` function and a set of curried data transforms.
 *
 * Requirements:
 * - `pipe(value, ...fns)` threads a value through a chain of functions (type-safe up to 6 fns via overloads)
 * - `map(fn)` returns a function that maps over an array
 * - `filter(fn)` returns a function that filters an array
 * - `groupBy(fn)` returns a function that groups array items by a string key
 * - `sortBy(fn)` returns a function that sorts an array by a numeric or string key
 * - `take(n)` returns a function that takes the first n items
 * - `unique()` returns a function that deduplicates an array (by reference / ===)
 */

// Pipe overloads for type safety
export function pipe<A, B>(value: A, fn1: (a: A) => B): B;
export function pipe<A, B, C>(value: A, fn1: (a: A) => B, fn2: (b: B) => C): C;
export function pipe<A, B, C, D>(value: A, fn1: (a: A) => B, fn2: (b: B) => C, fn3: (c: C) => D): D;
export function pipe<A, B, C, D, E>(value: A, fn1: (a: A) => B, fn2: (b: B) => C, fn3: (c: C) => D, fn4: (d: D) => E): E;
export function pipe<A, B, C, D, E, F>(value: A, fn1: (a: A) => B, fn2: (b: B) => C, fn3: (c: C) => D, fn4: (d: D) => E, fn5: (e: E) => F): F;
export function pipe<A, B, C, D, E, F, G>(value: A, fn1: (a: A) => B, fn2: (b: B) => C, fn3: (c: C) => D, fn4: (d: D) => E, fn5: (e: E) => F, fn6: (f: F) => G): G;
// TODO: implement
export function pipe(value: unknown, ...fns: Array<(arg: any) => any>): unknown {
  throw new Error("Not implemented");
}

// TODO: implement
export function map<T, U>(fn: (item: T) => U): (arr: T[]) => U[] {
  throw new Error("Not implemented");
}

// TODO: implement
export function filter<T>(fn: (item: T) => boolean): (arr: T[]) => T[] {
  throw new Error("Not implemented");
}

// TODO: implement
export function groupBy<T>(fn: (item: T) => string): (arr: T[]) => Record<string, T[]> {
  throw new Error("Not implemented");
}

// TODO: implement
export function sortBy<T>(fn: (item: T) => number | string): (arr: T[]) => T[] {
  throw new Error("Not implemented");
}

// TODO: implement
export function take<T>(n: number): (arr: T[]) => T[] {
  throw new Error("Not implemented");
}

// TODO: implement
export function unique<T>(): (arr: T[]) => T[] {
  throw new Error("Not implemented");
}

// --- manual test (run with: bun exercises/03-pipe-transform.ts) ---
interface Order {
  id: number;
  customer: string;
  amount: number;
  status: "pending" | "completed" | "cancelled";
}

const orders: Order[] = [
  { id: 1, customer: "Alice", amount: 250, status: "completed" },
  { id: 2, customer: "Bob", amount: 120, status: "pending" },
  { id: 3, customer: "Alice", amount: 80, status: "completed" },
  { id: 4, customer: "Charlie", amount: 310, status: "cancelled" },
  { id: 5, customer: "Bob", amount: 200, status: "completed" },
  { id: 6, customer: "Alice", amount: 150, status: "completed" },
  { id: 7, customer: "Bob", amount: 90, status: "completed" },
];

// Pipeline: completed orders → group by customer → show top 2 customers by name
const grouped = pipe(
  orders,
  filter<Order>((o) => o.status === "completed"),
  groupBy<Order>((o) => o.customer),
);
console.log("Grouped completed orders:", grouped);

// Pipeline: get unique customers, sorted, take first 2
const topCustomers = pipe(
  orders,
  map<Order, string>((o) => o.customer),
  unique<string>(),
  sortBy<string>((c) => c),
  take<string>(2),
);
console.log("First 2 customers (sorted):", topCustomers); // ["Alice", "Bob"]
