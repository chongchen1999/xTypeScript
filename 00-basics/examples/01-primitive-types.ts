/**
 * Primitive types, type annotations, and type inference
 * Run: bun 00-basics/examples/01-primitive-types.ts
 */

// --- 1. Basic type annotations ---
const count: number = 42;
const pi: number = 3.14159;
const hex: number = 0xff;
const binary: number = 0b1010;

const greeting: string = "Hello, TypeScript";
const template: string = `count is ${count}`;

const isActive: boolean = true;
const isDone: boolean = false;

console.log(count, pi, hex, binary);
console.log(greeting);
console.log(template);
console.log(isActive, isDone);

// --- 2. Type inference — TS infers type from value, no annotation needed ---
let inferred = 100;         // number
let inferredStr = "hello";  // string
let inferredBool = true;    // boolean

// inferred = "oops"; // Error: Type 'string' is not assignable to type 'number'

// --- 3. null and undefined ---
let n: null = null;
let u: undefined = undefined;

// With strictNullChecks (recommended), null/undefined are separate types
let maybeNumber: number | null = null;
maybeNumber = 42;   // OK
maybeNumber = null;  // OK
// maybeNumber = "x";  // Error

// Optional chaining — safe navigation for nullable values
const user: { name: string; address?: { city: string } } = { name: "Alice" };
console.log(user.address?.city); // undefined (no error)

// Nullish coalescing — fallback only for null/undefined (not 0 or "")
const port = undefined;
const resolvedPort = port ?? 3000;
console.log(resolvedPort); // 3000

// Compare with ||: it also treats 0 and "" as falsy
const zero = 0;
console.log(zero || 3000); // 3000 (wrong if 0 is valid!)
console.log(zero ?? 3000); // 0    (correct)

// --- 4. bigint — arbitrary precision integers ---
const big: bigint = 9007199254740993n; // beyond Number.MAX_SAFE_INTEGER
console.log(big + 1n); // 9007199254740994n
// console.log(big + 1); // Error: cannot mix bigint and number

// --- 5. symbol — unique identifiers ---
const sym1: symbol = Symbol("id");
const sym2: symbol = Symbol("id");
console.log(sym1 === sym2); // false — every Symbol is unique
