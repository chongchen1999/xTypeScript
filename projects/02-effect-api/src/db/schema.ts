import { sqliteTable, integer, text } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

export const tasks = sqliteTable("tasks", {
  id:          integer("id").primaryKey({ autoIncrement: true }),
  title:       text("title").notNull(),
  description: text("description"),
  status:      text("status", { enum: ["pending", "in_progress", "done"] })
                 .notNull()
                 .default("pending"),
  priority:    text("priority", { enum: ["low", "medium", "high"] })
                 .notNull()
                 .default("medium"),
  createdAt:   integer("created_at", { mode: "timestamp" })
                 .notNull()
                 .default(sql`(unixepoch())`),
  updatedAt:   integer("updated_at", { mode: "timestamp" })
                 .notNull()
                 .default(sql`(unixepoch())`),
});

export type Task       = typeof tasks.$inferSelect;
export type InsertTask = typeof tasks.$inferInsert;
