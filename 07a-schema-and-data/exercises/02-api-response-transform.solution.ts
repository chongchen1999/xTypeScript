/**
 * Solution: 07a-02 API Response Transform with Branded Types
 */

import { z } from "zod";

declare const __brand: unique symbol;
type Brand<T, B extends string> = T & { readonly [__brand]: B };
type UserId = Brand<number, "UserId">;

const UserApiResponseSchema = z
  .object({
    user_id: z.number().int().positive(),
    first_name: z.string().min(1),
    last_name: z.string().min(1),
    created_at: z.string().datetime(),
    is_active: z.union([z.boolean(), z.literal(0), z.literal(1)]),
  })
  .transform((raw) => ({
    userId: raw.user_id as UserId,
    firstName: raw.first_name,
    lastName: raw.last_name,
    createdAt: new Date(raw.created_at),
    isActive: Boolean(raw.is_active),
  }));

type UserResponse = z.output<typeof UserApiResponseSchema>;

function parseUserResponse(raw: unknown): UserResponse {
  const result = UserApiResponseSchema.safeParse(raw);
  if (!result.success) {
    const messages = result.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`);
    throw new Error(`Invalid API response:\n  ${messages.join("\n  ")}`);
  }
  return result.data;
}

// --- manual tests ---
const apiPayload = {
  user_id: 42,
  first_name: "Jane",
  last_name: "Doe",
  created_at: "2025-06-15T10:30:00Z",
  is_active: 1,
};

const user = parseUserResponse(apiPayload);
console.log(user);
console.log(user.createdAt instanceof Date); // true

try {
  parseUserResponse({ user_id: "not-a-number" });
} catch (e) {
  console.log("Caught error:", (e as Error).message);
}
