/**
 * Exercise 07a-03: Layered Types (DB ↔ Validation ↔ API)
 *
 * Demonstrate the layered type strategy where DB rows,
 * validation inputs, and API responses each have their own
 * shape — all derived from Zod schemas.
 *
 * Requirements:
 *  - Define a `ProductRow` type representing the DB row:
 *    { id: number, name: string, priceInCents: number,
 *      category: string, createdAt: Date, updatedAt: Date }
 *  - Define `CreateProductInput` Zod schema (validates user input):
 *    name (1-200 chars), priceInCents (positive int), category (enum)
 *  - Define `UpdateProductInput` as partial of CreateProductInput
 *  - Define `ProductResponse` Zod schema (API output) that extends
 *    the row and adds `displayPrice: string` (e.g. "$12.99")
 *  - Derive TS types from the Zod schemas
 *  - Write `createProduct(raw: unknown): ProductResponse` that:
 *    1. Validates input with CreateProductInput
 *    2. Simulates DB insert (generate id, timestamps)
 *    3. Returns a ProductResponse with computed displayPrice
 */

import { z } from "zod";

const CATEGORIES = ["electronics", "clothing", "books", "food"] as const;

// --- TODO: define ProductRow type ---
type ProductRow = {
  // TODO: implement
};

// --- TODO: define CreateProductInput schema ---

// --- TODO: define UpdateProductInput schema ---

// --- TODO: define ProductResponse schema ---

// --- TODO: derive types from schemas ---

// Simulates auto-increment
let nextId = 1;

export function createProduct(raw: unknown) {
  // TODO: implement
  throw new Error("Not implemented");
}

// --- manual test ---
console.log(createProduct({ name: "TypeScript Handbook", priceInCents: 2999, category: "books" }));
console.log("---");
console.log(createProduct({ name: "Wireless Mouse", priceInCents: 4500, category: "electronics" }));
console.log("---");

try {
  createProduct({ name: "", priceInCents: -1, category: "invalid" });
} catch (e) {
  console.error("Caught:", (e as Error).message);
}
