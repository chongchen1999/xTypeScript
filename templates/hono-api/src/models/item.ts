import { z } from "zod";

export const ItemSchema = z.object({
  id:          z.number().int().positive(),
  name:        z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  createdAt:   z.date(),
});

export const CreateItemSchema = ItemSchema.omit({ id: true, createdAt: true });
export const UpdateItemSchema = CreateItemSchema.partial();

export type Item       = z.infer<typeof ItemSchema>;
export type CreateItem = z.infer<typeof CreateItemSchema>;
export type UpdateItem = z.infer<typeof UpdateItemSchema>;
