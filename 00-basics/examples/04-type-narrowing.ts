/**
 * Type narrowing and type guards
 * Run: bun 00-basics/examples/04-type-narrowing.ts
 */

// --- 1. typeof narrowing — works for primitives ---
function double(value: string | number): string | number {
  if (typeof value === "string") {
    return value.repeat(2);  // TS knows: string
  }
  return value * 2;           // TS knows: number
}
console.log(double("ab"));  // "abab"
console.log(double(21));    // 42

// --- 2. Truthiness narrowing — filters out null/undefined/0/""/false ---
function printLength(s: string | null | undefined): void {
  if (s) {
    console.log(`length: ${s.length}`); // TS knows: string
  } else {
    console.log("no value");
  }
}
printLength("hello"); // length: 5
printLength(null);    // no value
printLength("");      // no value (careful: empty string is falsy!)

// --- 3. instanceof narrowing — works for class instances ---
class ApiError {
  constructor(public code: number, public message: string) {}
}
class NetworkError {
  constructor(public url: string, public cause: string) {}
}

function handleError(err: ApiError | NetworkError): string {
  if (err instanceof ApiError) {
    return `API Error ${err.code}: ${err.message}`;
  }
  return `Network Error at ${err.url}: ${err.cause}`;
}
console.log(handleError(new ApiError(404, "Not Found")));
console.log(handleError(new NetworkError("https://api.com", "timeout")));

// --- 4. `in` narrowing — check for property existence ---
interface Fish { swim(): void }
interface Bird { fly(): void }

function move(animal: Fish | Bird): void {
  if ("swim" in animal) {
    animal.swim();  // TS knows: Fish
  } else {
    animal.fly();   // TS knows: Bird
  }
}

// --- 5. Discriminated unions — the most powerful pattern ---
type Result<T> =
  | { ok: true; value: T }
  | { ok: false; error: string };

function parseNumber(s: string): Result<number> {
  const n = Number(s);
  if (isNaN(n)) return { ok: false, error: `"${s}" is not a number` };
  return { ok: true, value: n };
}

const r1 = parseNumber("42");
if (r1.ok) {
  console.log("parsed:", r1.value);  // TS knows: r1.value exists
} else {
  console.log("error:", r1.error);   // TS knows: r1.error exists
}

const r2 = parseNumber("abc");
if (r2.ok) {
  console.log("parsed:", r2.value);
} else {
  console.log("error:", r2.error);   // error: "abc" is not a number
}

// --- 6. Custom type guard function ---
interface Admin { role: "admin"; permissions: string[] }
interface Guest { role: "guest" }
type AppUser = Admin | Guest;

// The `user is Admin` return type tells TS this function narrows the type
function isAdmin(user: AppUser): user is Admin {
  return user.role === "admin";
}

function showDashboard(user: AppUser): void {
  if (isAdmin(user)) {
    console.log("Admin permissions:", user.permissions); // TS knows: Admin
  } else {
    console.log("Guest view");                           // TS knows: Guest
  }
}

showDashboard({ role: "admin", permissions: ["read", "write", "delete"] });
showDashboard({ role: "guest" });

// --- 7. Non-null assertion (use sparingly) ---
function getElement(id: string): HTMLElement | null {
  // In a browser environment: document.getElementById(id)
  return null; // simplified for demo
}

// const el = getElement("app")!;  // ! asserts non-null (risky if actually null)
// Prefer: const el = getElement("app"); if (el) { ... }
