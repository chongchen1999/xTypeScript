import { Database } from "bun:sqlite";
import { drizzle }  from "drizzle-orm/bun-sqlite";
import { sqliteTable, integer, text, sql } from "drizzle-orm/sqlite-core";

export const notes = sqliteTable("notes", {
  id:        integer("id").primaryKey({ autoIncrement: true }),
  title:     text("title").notNull(),
  body:      text("body").notNull().default(""),
  status:    text("status", { enum: ["active", "archived"] }).notNull().default("active"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(sql`(unixepoch())`),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().default(sql`(unixepoch())`),
});

export type DbNote = typeof notes.$inferSelect;

const DB_PATH = process.env["DATABASE_URL"] ?? "notes.db";
const sqlite  = new Database(DB_PATH);
sqlite.run("PRAGMA journal_mode = WAL;");
sqlite.run("PRAGMA foreign_keys = ON;");

// Inline idempotent migration
sqlite.run(`
  CREATE TABLE IF NOT EXISTS notes (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    title      TEXT    NOT NULL,
    body       TEXT    NOT NULL DEFAULT '',
    status     TEXT    NOT NULL DEFAULT 'active'
               CHECK(status IN ('active','archived')),
    created_at INTEGER NOT NULL DEFAULT (unixepoch()),
    updated_at INTEGER NOT NULL DEFAULT (unixepoch())
  )
`);

export const db = drizzle(sqlite, { schema: { notes } });
