import { z } from "zod";

// ── Shared domain types ────────────────────────────────────────────────────
// This package is imported by both the server and the client,
// guaranteeing that request/response shapes are always in sync.

export const NOTE_STATUSES  = ["active", "archived"] as const;
export type  NoteStatus     = (typeof NOTE_STATUSES)[number];

export const NoteSchema = z.object({
  id:        z.number().int().positive(),
  title:     z.string().min(1).max(200),
  body:      z.string().max(10_000),
  status:    z.enum(NOTE_STATUSES).default("active"),
  createdAt: z.string(), // ISO 8601 from the server
  updatedAt: z.string(),
});

export const CreateNoteSchema = NoteSchema.omit({ id: true, createdAt: true, updatedAt: true });
export const UpdateNoteSchema = CreateNoteSchema.partial();

export type Note       = z.infer<typeof NoteSchema>;
export type CreateNote = z.infer<typeof CreateNoteSchema>;
export type UpdateNote = z.infer<typeof UpdateNoteSchema>;

// ── Shared API contract ────────────────────────────────────────────────────
// Client calls these helpers; server validates with the same schemas.

export const API_BASE = "/api";

export const ENDPOINTS = {
  notes:       `${API_BASE}/notes`,
  note:   (id: number) => `${API_BASE}/notes/${id}`,
} as const;
