/**
 * Exercise 07a-01: Form Validator with Zod
 *
 * Build a signup form schema using Zod with field-level
 * and cross-field validation.
 *
 * Requirements:
 *  - `username`: string, 3-20 chars, alphanumeric + underscore only
 *  - `email`: valid email, lowercased via .transform()
 *  - `password`: min 8 chars, must contain uppercase + digit (use .refine)
 *  - `confirmPassword`: string
 *  - Cross-field: password === confirmPassword (use .superRefine)
 *  - Export `parseSignupForm(data: unknown)` returning:
 *      { success: true, data: SignupForm }
 *    | { success: false, errors: Record<string, string[]> }
 *    with flattened field errors
 */

import { z } from "zod";

// --- TODO: define SignupFormSchema ---
const SignupFormSchema = z.object({
  // TODO: implement
  username: z.string(),
  email: z.string(),
  password: z.string(),
  confirmPassword: z.string(),
});

export type SignupForm = z.infer<typeof SignupFormSchema>;

type ParseResult =
  | { success: true; data: SignupForm }
  | { success: false; errors: Record<string, string[]> };

export function parseSignupForm(data: unknown): ParseResult {
  // TODO: implement
  throw new Error("Not implemented");
}

// --- manual test ---
const cases = [
  { username: "ab", email: "TEST@MAIL.COM", password: "weak", confirmPassword: "weak" },
  { username: "valid_user", email: "A@B.COM", password: "Strong1x", confirmPassword: "Strong1x" },
  { username: "ok_user", email: "x@y.com", password: "Strong1x", confirmPassword: "mismatch" },
];

for (const c of cases) {
  const result = parseSignupForm(c);
  console.log(JSON.stringify(result, null, 2));
  console.log("---");
}
