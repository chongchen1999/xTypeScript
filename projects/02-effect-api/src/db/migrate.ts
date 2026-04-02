import { Database } from "bun:sqlite";
import { drizzle }  from "drizzle-orm/bun-sqlite";
import * as schema  from "./schema.js";

const DB_PATH = process.env["DATABASE_URL"] ?? "tasks.db";
const sqlite  = new Database(DB_PATH);
sqlite.run("PRAGMA journal_mode = WAL;");

export const db = drizzle(sqlite, { schema });

// Inline DDL migration — in production use drizzle-kit generate + migrate
sqlite.run(`
  CREATE TABLE IF NOT EXISTS tasks (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    title       TEXT    NOT NULL,
    description TEXT,
    status      TEXT    NOT NULL DEFAULT 'pending'
                CHECK(status IN ('pending','in_progress','done')),
    priority    TEXT    NOT NULL DEFAULT 'medium'
                CHECK(priority IN ('low','medium','high')),
    created_at  INTEGER NOT NULL DEFAULT (unixepoch()),
    updated_at  INTEGER NOT NULL DEFAULT (unixepoch())
  )
`);

console.log("Migration complete: tasks table ready");
