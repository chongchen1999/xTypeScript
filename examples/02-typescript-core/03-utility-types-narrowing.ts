/**
 * Utility types and type narrowing
 * Run: bun examples/02-typescript-core/03-utility-types-narrowing.ts
 */

// --- 1. Utility types ---
interface User {
  id: number;
  name: string;
  email: string;
  role: "admin" | "user";
  age: number;
}

type CreateUserInput  = Omit<User, "id">;
type UserPreview      = Pick<User, "id" | "name">;
type PatchUser        = Partial<Omit<User, "id">>;
type FrozenUser       = Readonly<User>;
type RoleMap          = Record<"admin" | "user", User[]>;

const preview: UserPreview = { id: 1, name: "Alice" };
const patch: PatchUser = { name: "Alice Updated", email: "new@example.com" };
console.log(preview, patch);

// Function-related utilities
async function fetchUser(id: number): Promise<User> {
  return { id, name: "Alice", email: "a@example.com", role: "user", age: 30 };
}

type FetchReturn = Awaited<ReturnType<typeof fetchUser>>; // User
type FetchParams = Parameters<typeof fetchUser>;          // [number]
console.log("FetchParams type check:", true as boolean);

// --- 2. Type narrowing — control flow analysis ---
// TS tracks types through branches automatically (Rust's match / Python's isinstance checks)

type Result<T> = { ok: true; value: T } | { ok: false; error: string };

function processResult<T>(result: Result<T>): T | string {
  if (result.ok) {
    return result.value; // TS knows this is T here
  }
  return `Error: ${result.error}`; // TS knows this is { ok: false; error: string }
}
console.log(processResult({ ok: true,  value: 42 }));
console.log(processResult({ ok: false, error: "not found" }));

// --- 3. User-defined type guards ---
interface Dog { bark(): void; breed: string }
interface Cat { meow(): void; lives: number }

function isDog(pet: Dog | Cat): pet is Dog {
  return "bark" in pet;
}

function greet(pet: Dog | Cat): void {
  if (isDog(pet)) console.log(`Good dog, ${pet.breed}!`);
  else             console.log(`You have ${pet.lives} lives left, cat.`);
}

greet({ bark: () => {}, breed: "Husky" });
greet({ meow: () => {}, lives: 9 });

// --- 4. Assertion function ---
function assertDefined<T>(value: T | null | undefined, label: string): asserts value is T {
  if (value == null) throw new Error(`${label} must not be null/undefined`);
}

const maybeUser: User | null = { id: 1, name: "Alice", email: "a@b.com", role: "user", age: 30 };
assertDefined(maybeUser, "user");
console.log(maybeUser.name.toUpperCase()); // narrowed to User
