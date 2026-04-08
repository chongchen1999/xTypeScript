/**
 * Exercise 00-03: Safe Parser
 *
 * Implement a type-safe `parseJSON` function that uses `unknown` instead of `any`.
 * The function should:
 * 1. Parse a JSON string
 * 2. Validate the parsed value matches the expected shape
 * 3. Return a Result type (success or failure)
 *
 * This exercise practices: unknown, type guards, discriminated unions.
 *
 * Run: bun 00-basics/exercises/03-safe-parser.ts
 */

type Result<T> =
  | { ok: true; value: T }
  | { ok: false; error: string };

interface UserRecord {
  name: string;
  age: number;
  email: string;
}

// TODO: Implement a type guard that checks if an unknown value is a valid UserRecord
function isUserRecord(value: unknown): value is UserRecord {
  throw new Error("Not implemented");
}

// TODO: Implement safe JSON parsing that returns a Result
// If JSON.parse throws, return an error result
// If the parsed value is not a UserRecord, return an error result
export function parseUserJSON(json: string): Result<UserRecord> {
  throw new Error("Not implemented");
}

// --- Verify ---
const valid = '{"name": "Alice", "age": 30, "email": "alice@example.com"}';
const invalidJSON = '{bad json}';
const wrongShape = '{"name": "Bob"}';
const wrongTypes = '{"name": "Carol", "age": "thirty", "email": "carol@example.com"}';

for (const input of [valid, invalidJSON, wrongShape, wrongTypes]) {
  const result = parseUserJSON(input);
  if (result.ok) {
    console.log(`✓ Parsed: ${result.value.name}, age ${result.value.age}`);
  } else {
    console.log(`✗ Error: ${result.error}`);
  }
}
// Expected:
// ✓ Parsed: Alice, age 30
// ✗ Error: Invalid JSON: ...
// ✗ Error: Invalid UserRecord: ...
// ✗ Error: Invalid UserRecord: ...
