/**
 * Solution: 07a-01 Zod Form Validator
 */

import { z } from "zod";

const SignupFormSchema = z
  .object({
    username: z
      .string()
      .min(3, "Username must be at least 3 characters")
      .max(20, "Username must be at most 20 characters")
      .regex(/^[a-zA-Z0-9_]+$/, "Username must be alphanumeric or underscore"),
    email: z
      .string()
      .email("Invalid email address")
      .transform((v) => v.toLowerCase()),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .refine((v) => /[A-Z]/.test(v), "Password must contain an uppercase letter")
      .refine((v) => /\d/.test(v), "Password must contain a digit"),
    confirmPassword: z.string(),
  })
  .superRefine((data, ctx) => {
    if (data.password !== data.confirmPassword) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Passwords do not match",
        path: ["confirmPassword"],
      });
    }
  });

type SignupForm = z.infer<typeof SignupFormSchema>;

type ParseResult =
  | { success: true; data: SignupForm }
  | { success: false; errors: Record<string, string[]> };

function parseSignupForm(data: unknown): ParseResult {
  const result = SignupFormSchema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  const flat = result.error.flatten();
  return { success: false, errors: flat.fieldErrors as Record<string, string[]> };
}

// --- manual tests ---
const valid = parseSignupForm({
  username: "alice_01",
  email: "ALICE@Example.COM",
  password: "Secret1!",
  confirmPassword: "Secret1!",
});
console.log("valid:", valid);

const invalid = parseSignupForm({
  username: "ab",
  email: "not-an-email",
  password: "short",
  confirmPassword: "mismatch",
});
console.log("invalid:", invalid);

const mismatch = parseSignupForm({
  username: "bob_99",
  email: "bob@test.com",
  password: "Strong1X",
  confirmPassword: "Strong1Y",
});
console.log("mismatch:", mismatch);
