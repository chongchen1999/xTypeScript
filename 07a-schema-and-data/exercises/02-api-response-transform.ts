/**
 * Exercise 07a-02: API Response Transform with Zod
 *
 * Parse a snake_case API response and transform it into
 * a camelCase domain object with branded types.
 *
 * Requirements:
 *  - Define a Zod schema that accepts snake_case input:
 *    { user_id: number, first_name: string, last_name: string,
 *      created_at: string (ISO), is_active: boolean | 0 | 1 }
 *  - Transform output to camelCase:
 *    { userId: UserId, firstName, lastName, createdAt: Date, isActive: boolean }
 *  - `UserId` should be a branded type (z.brand)
 *  - Export `parseUserResponse(raw: unknown)` that returns the
 *    transformed type or throws a descriptive error
 */

import { z } from "zod";

// --- TODO: define branded UserId type ---

// --- TODO: define UserResponseSchema with transform ---
const UserResponseSchema = z.object({
  // TODO: implement
});

export type UserResponse = z.infer<typeof UserResponseSchema>;

export function parseUserResponse(raw: unknown): UserResponse {
  // TODO: implement
  throw new Error("Not implemented");
}

// --- manual test ---
const raw = {
  user_id: 42,
  first_name: "Jane",
  last_name: "Doe",
  created_at: "2025-01-15T10:30:00Z",
  is_active: 1,
};

console.log(parseUserResponse(raw));

// Should throw
try {
  parseUserResponse({ user_id: "not-a-number", first_name: 123 });
} catch (e) {
  console.error("Caught:", (e as Error).message);
}
