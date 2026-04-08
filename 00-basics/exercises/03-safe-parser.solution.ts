/**
 * Solution: 00-03 Safe Parser
 */

type Result<T> =
  | { ok: true; value: T }
  | { ok: false; error: string };

interface UserRecord {
  name: string;
  age: number;
  email: string;
}

function isUserRecord(value: unknown): value is UserRecord {
  if (typeof value !== "object" || value === null) return false;
  const obj = value as Record<string, unknown>;
  return (
    typeof obj.name === "string" &&
    typeof obj.age === "number" &&
    typeof obj.email === "string"
  );
}

export function parseUserJSON(json: string): Result<UserRecord> {
  let parsed: unknown;
  try {
    parsed = JSON.parse(json);
  } catch (e) {
    return { ok: false, error: `Invalid JSON: ${(e as Error).message}` };
  }

  if (!isUserRecord(parsed)) {
    return { ok: false, error: "Invalid UserRecord: missing or wrong-typed fields" };
  }

  return { ok: true, value: parsed };
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
