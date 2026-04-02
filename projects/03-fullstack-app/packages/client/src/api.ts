// Type-safe API client — imports types from @fullstack/shared
// so request/response shapes stay in sync with the server.
import { ENDPOINTS } from "@fullstack/shared";
import type { Note, CreateNote, UpdateNote } from "@fullstack/shared";

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    headers: { "Content-Type": "application/json", ...init?.headers },
    ...init,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText })) as { error: string };
    throw new Error(err.error ?? `HTTP ${res.status}`);
  }
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export const api = {
  notes: {
    list:   (status: "active" | "archived" | "all" = "active") =>
              request<Note[]>(`${ENDPOINTS.notes}?status=${status}`),
    get:    (id: number)              => request<Note>(ENDPOINTS.note(id)),
    create: (data: CreateNote)        => request<Note>(ENDPOINTS.notes, {
                                           method: "POST",
                                           body:   JSON.stringify(data),
                                         }),
    update: (id: number, data: UpdateNote) => request<Note>(ENDPOINTS.note(id), {
                                               method: "PATCH",
                                               body:   JSON.stringify(data),
                                             }),
    delete: (id: number)              => request<void>(ENDPOINTS.note(id), { method: "DELETE" }),
  },
};
