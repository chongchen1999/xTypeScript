/**
 * Interfaces, type aliases, and object types
 * Run: bun 00-basics/examples/02-interfaces-and-types.ts
 */

// --- 1. interface — describes an object's shape ---
interface User {
  id: number;
  name: string;
  email: string;
  age?: number;            // optional property
  readonly createdAt: Date; // cannot be re-assigned
}

const alice: User = {
  id: 1,
  name: "Alice",
  email: "alice@example.com",
  createdAt: new Date(),
};
console.log(alice.name, alice.age); // "Alice" undefined

// alice.createdAt = new Date(); // Error: Cannot assign to 'createdAt'

// --- 2. Structural typing — shape matters, not name ---
interface Point2D { x: number; y: number }
interface Vector2D { x: number; y: number }

const point: Point2D = { x: 1, y: 2 };
const vec: Vector2D = point; // OK — same structure
console.log(vec);

// Extra properties are OK when assigned via variable (not object literal)
const point3D = { x: 1, y: 2, z: 3 };
const flat: Point2D = point3D; // OK — has x and y
console.log(flat);

// --- 3. type alias — names for any type expression ---
type ID = number | string;
type Callback = (data: string) => void;
type Status = "active" | "inactive" | "banned";
type Pair<T> = [T, T];

const userId: ID = "user-123";
const status: Status = "active";
const coords: Pair<number> = [10, 20];

console.log(userId, status, coords);

// --- 4. interface extends — composition ---
interface Timestamped {
  createdAt: Date;
  updatedAt: Date;
}

interface Post extends Timestamped {
  title: string;
  body: string;
}

const post: Post = {
  title: "Hello TS",
  body: "TypeScript is great",
  createdAt: new Date(),
  updatedAt: new Date(),
};
console.log(post.title);

// --- 5. type intersection — combine types with & ---
type WithId = { id: string };
type WithName = { name: string };
type Entity = WithId & WithName & Timestamped;

const entity: Entity = {
  id: "e-1",
  name: "Test",
  createdAt: new Date(),
  updatedAt: new Date(),
};
console.log(entity.id, entity.name);

// --- 6. Function types ---
type MathOp = (a: number, b: number) => number;

const add: MathOp = (a, b) => a + b;
const mul: MathOp = (a, b) => a * b;

console.log(add(2, 3)); // 5
console.log(mul(2, 3)); // 6

// Function with object parameter (very common pattern)
interface FetchOptions {
  url: string;
  method?: "GET" | "POST" | "PUT" | "DELETE";
  timeout?: number;
}

function fetchData({ url, method = "GET", timeout = 5000 }: FetchOptions): void {
  console.log(`${method} ${url} (timeout: ${timeout}ms)`);
}

fetchData({ url: "https://api.example.com/users" });
fetchData({ url: "https://api.example.com/users", method: "POST", timeout: 10000 });
