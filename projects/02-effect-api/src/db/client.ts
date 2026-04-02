import { Database }    from "bun:sqlite";
import { drizzle }     from "drizzle-orm/bun-sqlite";
import { sql }         from "drizzle-orm";
import * as schema     from "./schema.js";

const DB_PATH = process.env["DATABASE_URL"] ?? "tasks.db";

// Open (or create) the SQLite file
export const sqlite = new Database(DB_PATH);
sqlite.run("PRAGMA journal_mode = WAL;");
sqlite.run("PRAGMA foreign_keys = ON;");

export const db = drizzle(sqlite, { schema });

// Bootstrap: create the tasks table if it doesn't exist
export function bootstrap(): void {
  sqlite.run(sql`
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
  `.queryChunks.map(c => c.sql).join(""));
}
