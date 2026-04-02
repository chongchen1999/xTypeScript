import { z } from "zod";

const STATUS   = ["pending", "in_progress", "done"]  as const;
const PRIORITY = ["low",     "medium",      "high"]   as const;

export const CreateTaskSchema = z.object({
  title:       z.string().min(1).max(200),
  description: z.string().max(1000).optional(),
  priority:    z.enum(PRIORITY).default("medium"),
});

export const UpdateTaskSchema = z.object({
  title:       z.string().min(1).max(200).optional(),
  description: z.string().max(1000).optional(),
  status:      z.enum(STATUS).optional(),
  priority:    z.enum(PRIORITY).optional(),
});

export const TaskQuerySchema = z.object({
  status:   z.enum([...STATUS, "all"] as const).default("all"),
  priority: z.enum(PRIORITY).optional(),
  limit:    z.coerce.number().int().positive().max(100).default(50),
  offset:   z.coerce.number().int().min(0).default(0),
});

export type CreateTask = z.infer<typeof CreateTaskSchema>;
export type UpdateTask = z.infer<typeof UpdateTaskSchema>;
export type TaskQuery  = z.infer<typeof TaskQuerySchema>;
