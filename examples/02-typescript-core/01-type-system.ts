/**
 * Structural typing, unions, intersections, and literal types
 * Run: bun examples/02-typescript-core/01-type-system.ts
 */

// --- 1. Structural typing — duck typing with compile-time checking ---
// Unlike C++ (nominal) or Rust (nominal/trait-based), TS cares about shape, not name.
interface Point2D { x: number; y: number }

function magnitude(p: Point2D): number {
  return Math.sqrt(p.x ** 2 + p.y ** 2);
}

// Extra properties are fine — structural compatibility
const p3D = { x: 3, y: 4, z: 5 };
console.log(magnitude(p3D)); // 5 — z is ignored

// --- 2. Literal types and const narrowing ---
type Direction = "N" | "S" | "E" | "W";
type StatusCode = 200 | 201 | 400 | 404 | 500;

function move(dir: Direction, steps: number) {
  console.log(`Moving ${steps} steps ${dir}`);
}
move("N", 3);
// move("X", 1); // Error: "X" is not assignable to Direction

// `as const` freezes literals — like C++ constexpr
const CONFIG = { host: "localhost", port: 8080 } as const;
type Host = typeof CONFIG.host; // "localhost" (not just string)

// --- 3. Union types ---
type StringOrNumber = string | number;

function double(v: StringOrNumber): StringOrNumber {
  return typeof v === "string" ? v.repeat(2) : v * 2;
}
console.log(double("ab")); // "abab"
console.log(double(21));   // 42

// --- 4. Intersection types — combine multiple shapes ---
type Timestamped = { createdAt: Date; updatedAt: Date };
type WithId      = { id: string };
type Entity      = WithId & Timestamped;

const entity: Entity = {
  id: "e-1",
  createdAt: new Date("2024-01-01"),
  updatedAt: new Date(),
};
console.log(entity.id, entity.createdAt.getFullYear());

// --- 5. Discriminated union — Rust enum equivalent ---
type Shape =
  | { kind: "circle"; radius: number }
  | { kind: "rect";   w: number; h: number };

function area(s: Shape): number {
  switch (s.kind) {
    case "circle": return Math.PI * s.radius ** 2;
    case "rect":   return s.w * s.h;
  }
}
console.log(area({ kind: "circle", radius: 5 }).toFixed(2)); // "78.54"
console.log(area({ kind: "rect",   w: 4, h: 6 }));           // 24
