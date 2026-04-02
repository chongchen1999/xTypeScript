/**
 * Generics — functions, classes, and constraints
 * Run: bun examples/02-typescript-core/02-generics.ts
 */

// --- 1. Generic functions --- (like C++ templates / Rust generics)
function identity<T>(value: T): T { return value; }
function first<T>(arr: T[]): T | undefined { return arr[0]; }

console.log(identity(42));       // T inferred as number
console.log(first(["a", "b"]));  // T inferred as string

// --- 2. Constraints with `extends` ---
// Like C++20 concepts or Rust trait bounds
interface Serializable { toString(): string }

function serialize<T extends Serializable>(value: T): string {
  return value.toString();
}
console.log(serialize(42));         // "42"
console.log(serialize(new Date())); // ISO date string

// keyof constraint — type-safe property access
function pluck<T, K extends keyof T>(items: T[], key: K): T[K][] {
  return items.map(item => item[key]);
}

const users = [
  { id: 1, name: "Alice", active: true },
  { id: 2, name: "Bob",   active: false },
];
console.log(pluck(users, "name"));   // ["Alice", "Bob"]
console.log(pluck(users, "active")); // [true, false]
// pluck(users, "email"); // Error — "email" not in keyof user

// --- 3. Generic class --- (like C++ template class)
class Stack<T> {
  private items: T[] = [];

  push(item: T): this { this.items.push(item); return this; }
  pop(): T {
    if (!this.items.length) throw new Error("Stack is empty");
    return this.items.pop()!;
  }
  peek(): T | undefined { return this.items.at(-1); }
  get size(): number { return this.items.length; }
}

const stack = new Stack<number>().push(1).push(2).push(3);
console.log(stack.peek()); // 3
console.log(stack.pop());  // 3
console.log(stack.size);   // 2

// --- 4. Multiple type parameters ---
function zip<A, B>(as: A[], bs: B[]): [A, B][] {
  return as.map((a, i) => [a, bs[i]]);
}
console.log(zip([1, 2, 3], ["a", "b", "c"]));
// [[1,"a"], [2,"b"], [3,"c"]]

// --- 5. Default type parameters ---
interface ApiResponse<T = unknown> {
  data: T;
  status: number;
  message?: string;
}

const res: ApiResponse<{ userId: string }> = {
  data: { userId: "u-1" },
  status: 200,
};
console.log(res.data.userId);
