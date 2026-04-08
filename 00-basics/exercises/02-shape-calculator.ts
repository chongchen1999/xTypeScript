/**
 * Exercise 00-02: Shape Calculator
 *
 * Define a discriminated union type `Shape` and implement an `area` function.
 * Shapes: circle (radius), rectangle (width, height), triangle (base, height).
 *
 * Requirements:
 * 1. Define the Shape type using a discriminated union with a `kind` field
 * 2. Implement the `area` function with exhaustive switch
 * 3. Implement a `describe` function that returns a human-readable string
 *
 * Run: bun 00-basics/exercises/02-shape-calculator.ts
 */

// TODO: Define the Shape discriminated union type

// TODO: Implement area calculation
export function area(shape: any): number {
  throw new Error("Not implemented");
}

// TODO: Implement describe — e.g. "circle with radius 5" or "rectangle 4×6"
export function describe(shape: any): string {
  throw new Error("Not implemented");
}

// --- Verify ---
const shapes = [
  { kind: "circle" as const, radius: 5 },
  { kind: "rectangle" as const, width: 4, height: 6 },
  { kind: "triangle" as const, base: 10, height: 3 },
];

for (const s of shapes) {
  console.log(`${describe(s)} → area = ${area(s).toFixed(2)}`);
}
// Expected output:
// circle with radius 5 → area = 78.54
// rectangle 4×6 → area = 24.00
// triangle with base 10, height 3 → area = 15.00
