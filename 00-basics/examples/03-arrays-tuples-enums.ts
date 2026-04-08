/**
 * Arrays, tuples, enums, and special types
 * Run: bun 00-basics/examples/03-arrays-tuples-enums.ts
 */

// --- 1. Arrays — two equivalent syntaxes ---
const nums: number[] = [1, 2, 3, 4, 5];
const strs: Array<string> = ["a", "b", "c"];

nums.push(6);
console.log(nums); // [1, 2, 3, 4, 5, 6]

// Readonly array — prevents mutation
const frozen: readonly number[] = [1, 2, 3];
// frozen.push(4);    // Error
// frozen[0] = 99;    // Error
console.log(frozen);

// --- 2. Tuples — fixed-length array with typed positions ---
const point: [number, number] = [10, 20];
const entry: [string, number, boolean] = ["score", 95, true];

// Destructuring tuples
const [x, y] = point;
const [key, value, flag] = entry;
console.log(`(${x}, ${y})`);           // (10, 20)
console.log(key, value, flag);          // score 95 true

// Labeled tuples
type Range = [start: number, end: number];
const range: Range = [0, 100];
console.log(range);

// Tuple as function return (common for custom hooks / multi-return)
function divide(a: number, b: number): [quotient: number, remainder: number] {
  return [Math.floor(a / b), a % b];
}
const [q, r] = divide(17, 5);
console.log(`17 / 5 = ${q} remainder ${r}`); // 17 / 5 = 3 remainder 2

// --- 3. Enums ---
// Numeric enum
enum Direction {
  North,   // 0
  South,   // 1
  East,    // 2
  West,    // 3
}
console.log(Direction.North, Direction[0]); // 0, "North" (reverse mapping)

// String enum
enum LogLevel {
  Debug = "DEBUG",
  Info = "INFO",
  Warn = "WARN",
  Error = "ERROR",
}
console.log(LogLevel.Info); // "INFO"

// Modern alternative: union of string literals (preferred in many codebases)
type HttpMethod = "GET" | "POST" | "PUT" | "DELETE";
const method: HttpMethod = "GET";
// const bad: HttpMethod = "PATCH"; // Error
console.log(method);

// --- 4. Special types ---

// void — no return value
function logMessage(msg: string): void {
  console.log(`[LOG] ${msg}`);
}
logMessage("starting up");

// any — disables type checking (escape hatch, AVOID)
let risky: any = 42;
risky = "now a string";
risky = { anything: true };
// risky.nonexistent.deep.access; // No compile error! Crashes at runtime

// unknown — safe alternative to any (must check type before use)
function processValue(val: unknown): string {
  if (typeof val === "string") return val.toUpperCase();
  if (typeof val === "number") return val.toFixed(2);
  if (val instanceof Date) return val.toISOString();
  return String(val);
}
console.log(processValue("hello"));    // HELLO
console.log(processValue(3.14));       // 3.14
console.log(processValue(new Date())); // ISO string

// never — function that never returns
function fail(msg: string): never {
  throw new Error(msg);
}

// never in exhaustive switch
type Light = "red" | "yellow" | "green";
function action(light: Light): string {
  switch (light) {
    case "red":    return "stop";
    case "yellow": return "caution";
    case "green":  return "go";
    default:
      // If we add a new Light value and forget to handle it,
      // TS will error here because `light` won't be `never`
      const _exhaustive: never = light;
      return _exhaustive;
  }
}
console.log(action("red"));   // stop
console.log(action("green")); // go

// --- 5. Type assertions — "I know better than the compiler" ---
const input: unknown = "hello world";
const len = (input as string).length;
console.log(len); // 11

// Prefer type guards over assertions when possible
