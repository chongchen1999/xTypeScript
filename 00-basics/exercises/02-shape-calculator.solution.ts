/**
 * Solution: 00-02 Shape Calculator
 */

type Shape =
  | { kind: "circle"; radius: number }
  | { kind: "rectangle"; width: number; height: number }
  | { kind: "triangle"; base: number; height: number };

export function area(shape: Shape): number {
  switch (shape.kind) {
    case "circle":    return Math.PI * shape.radius ** 2;
    case "rectangle": return shape.width * shape.height;
    case "triangle":  return (shape.base * shape.height) / 2;
    default:
      const _exhaustive: never = shape;
      return _exhaustive;
  }
}

export function describe(shape: Shape): string {
  switch (shape.kind) {
    case "circle":    return `circle with radius ${shape.radius}`;
    case "rectangle": return `rectangle ${shape.width}×${shape.height}`;
    case "triangle":  return `triangle with base ${shape.base}, height ${shape.height}`;
    default:
      const _exhaustive: never = shape;
      return _exhaustive;
  }
}

// --- Verify ---
const shapes: Shape[] = [
  { kind: "circle", radius: 5 },
  { kind: "rectangle", width: 4, height: 6 },
  { kind: "triangle", base: 10, height: 3 },
];

for (const s of shapes) {
  console.log(`${describe(s)} → area = ${area(s).toFixed(2)}`);
}
