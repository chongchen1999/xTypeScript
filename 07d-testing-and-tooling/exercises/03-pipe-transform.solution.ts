/**
 * Solution: 07d-03 Pipe & Data Transform Utilities
 */

export function pipe<A, B>(value: A, fn1: (a: A) => B): B;
export function pipe<A, B, C>(value: A, fn1: (a: A) => B, fn2: (b: B) => C): C;
export function pipe<A, B, C, D>(value: A, fn1: (a: A) => B, fn2: (b: B) => C, fn3: (c: C) => D): D;
export function pipe<A, B, C, D, E>(value: A, fn1: (a: A) => B, fn2: (b: B) => C, fn3: (c: C) => D, fn4: (d: D) => E): E;
export function pipe<A, B, C, D, E, F>(value: A, fn1: (a: A) => B, fn2: (b: B) => C, fn3: (c: C) => D, fn4: (d: D) => E, fn5: (e: E) => F): F;
export function pipe<A, B, C, D, E, F, G>(value: A, fn1: (a: A) => B, fn2: (b: B) => C, fn3: (c: C) => D, fn4: (d: D) => E, fn5: (e: E) => F, fn6: (f: F) => G): G;
export function pipe(value: unknown, ...fns: Array<(arg: any) => any>): unknown {
  return fns.reduce((acc, fn) => fn(acc), value);
}

export function map<T, U>(fn: (item: T) => U): (arr: T[]) => U[] {
  return (arr) => arr.map(fn);
}

export function filter<T>(fn: (item: T) => boolean): (arr: T[]) => T[] {
  return (arr) => arr.filter(fn);
}

export function groupBy<T>(fn: (item: T) => string): (arr: T[]) => Record<string, T[]> {
  return (arr) => {
    const result: Record<string, T[]> = {};
    for (const item of arr) {
      const key = fn(item);
      (result[key] ??= []).push(item);
    }
    return result;
  };
}

export function sortBy<T>(fn: (item: T) => number | string): (arr: T[]) => T[] {
  return (arr) => [...arr].sort((a, b) => {
    const va = fn(a), vb = fn(b);
    return va < vb ? -1 : va > vb ? 1 : 0;
  });
}

export function take<T>(n: number): (arr: T[]) => T[] {
  return (arr) => arr.slice(0, n);
}

export function unique<T>(): (arr: T[]) => T[] {
  return (arr) => [...new Set(arr)];
}

// --- manual test ---
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

const grouped = pipe(
  orders,
  filter<Order>((o) => o.status === "completed"),
  groupBy<Order>((o) => o.customer),
);
console.log("Grouped completed orders:", grouped);

const topCustomers = pipe(
  orders,
  map<Order, string>((o) => o.customer),
  unique<string>(),
  sortBy<string>((c) => c),
  take<string>(2),
);
console.log("First 2 customers (sorted):", topCustomers); // ["Alice", "Bob"]
