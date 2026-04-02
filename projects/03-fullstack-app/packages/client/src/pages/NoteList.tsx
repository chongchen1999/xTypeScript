import { A }                   from "@solidjs/router";
import { createQuery, createMutation, useQueryClient } from "@tanstack/solid-query";
import { For, Show, createSignal } from "solid-js";
import { api }  from "@/api.js";
import type { Note } from "@fullstack/shared";

export default function NoteList() {
  const queryClient = useQueryClient();
  const [filter, setFilter] = createSignal<"active" | "archived" | "all">("active");

  const notesQuery = createQuery(() => ({
    queryKey: ["notes", filter()],
    queryFn:  () => api.notes.list(filter()),
  }));

  const archiveMutation = createMutation(() => ({
    mutationFn: (id: number) => api.notes.update(id, { status: "archived" }),
    onSuccess:  () => queryClient.invalidateQueries({ queryKey: ["notes"] }),
  }));

  const deleteMutation = createMutation(() => ({
    mutationFn: (id: number) => api.notes.delete(id),
    onSuccess:  () => queryClient.invalidateQueries({ queryKey: ["notes"] }),
  }));

  return (
    <main>
      <header>
        <h1>Notes</h1>
        <A href="/notes/new">+ New note</A>
      </header>

      <nav>
        <For each={["active", "archived", "all"] as const}>
          {(s) => (
            <button
              onClick={() => setFilter(s)}
              style={{ "font-weight": filter() === s ? "bold" : "normal" }}
            >
              {s}
            </button>
          )}
        </For>
      </nav>

      <Show when={notesQuery.isPending}><p>Loading…</p></Show>
      <Show when={notesQuery.isError}>
        <p style={{ color: "red" }}>{(notesQuery.error as Error).message}</p>
      </Show>

      <Show when={notesQuery.isSuccess}>
        <ul>
          <For each={notesQuery.data} fallback={<li>No notes.</li>}>
            {(note: Note) => (
              <li>
                <A href={`/notes/${note.id}`}>
                  <strong>{note.title}</strong>
                </A>
                {" "}
                <Show when={note.status === "active"}>
                  <button
                    onClick={() => archiveMutation.mutate(note.id)}
                    disabled={archiveMutation.isPending}
                  >
                    Archive
                  </button>
                </Show>
                {" "}
                <button
                  onClick={() => deleteMutation.mutate(note.id)}
                  disabled={deleteMutation.isPending}
                >
                  Delete
                </button>
              </li>
            )}
          </For>
        </ul>
      </Show>
    </main>
  );
}
