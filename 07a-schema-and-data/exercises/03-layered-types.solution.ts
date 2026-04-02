/**
 * Solution: 07a-03 Layered Type Strategy
 */

import { z } from "zod";

// DB row type (simulates Drizzle $inferSelect)
type ProductRow = {
  id: number;
  name: string;
  priceInCents: number;
  category: "electronics" | "books" | "clothing";
  createdAt: Date;
  updatedAt: Date;
};

// Validation layer: insert input
const CreateProductSchema = z.object({
  name: z.string().min(1, "Name is required").max(200),
  priceInCents: z.number().int().positive("Price must be positive"),
  category: z.enum(["electronics", "books", "clothing"]),
});
type CreateProductInput = z.infer<typeof CreateProductSchema>;

// Validation layer: update input (partial, but non-empty)
const UpdateProductSchema = CreateProductSchema.partial().refine(
  (data) => Object.values(data).some((v) => v !== undefined),
  "At least one field must be provided"
);
type UpdateProductInput = z.infer<typeof UpdateProductSchema>;

// API response layer: DB row + computed fields
const ProductResponseSchema = z
  .object({
    id: z.number(),
    name: z.string(),
    priceInCents: z.number(),
    category: z.string(),
    createdAt: z.date(),
    updatedAt: z.date(),
  })
  .transform((row) => ({
    ...row,
    displayPrice: `$${(row.priceInCents / 100).toFixed(2)}`,
  }));
type ProductResponse = z.output<typeof ProductResponseSchema>;

// Simulated auto-increment
let nextId = 1;

function createProduct(raw: unknown): ProductResponse {
  const input = CreateProductSchema.parse(raw);

  // Simulate DB insert
  const now = new Date();
  const row: ProductRow = {
    id: nextId++,
    ...input,
    createdAt: now,
    updatedAt: now,
  };

  return ProductResponseSchema.parse(row);
}

// --- manual tests ---
const product = createProduct({
  name: "TypeScript Handbook",
  priceInCents: 2999,
  category: "books",
});
console.log(product);

try {
  createProduct({ name: "" });
} catch (e) {
  console.log("Validation error:", (e as Error).message);
}

try {
  createProduct({ name: "Gadget", priceInCents: 100, category: "food" });
} catch (e) {
  console.log("Category error:", (e as Error).message);
}
