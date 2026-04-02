import { useParams, A, useNavigate } from "@solidjs/router";
import { createQuery, createMutation, useQueryClient } from "@tanstack/solid-query";
import { Show, createSignal } from "solid-js";
import { api }  from "@/api.js";
import type { Note } from "@fullstack/shared";

export default function NoteDetail() {
  const params      = useParams<{ id: string }>();
  const navigate    = useNavigate();
  const queryClient = useQueryClient();

  const [editing, setEditing] = createSignal(false);
  const [editTitle, setEditTitle] = createSignal("");
  const [editBody,  setEditBody]  = createSignal("");

  const noteQuery = createQuery(() => ({
    queryKey: ["notes", params.id],
    queryFn:  () => api.notes.get(Number(params.id)),
  }));

  const updateMutation = createMutation(() => ({
    mutationFn: (data: { title: string; body: string }) =>
      api.notes.update(Number(params.id), data),
    onSuccess: (updated: Note) => {
      queryClient.setQueryData(["notes", params.id], updated);
      queryClient.invalidateQueries({ queryKey: ["notes"] });
      setEditing(false);
    },
  }));

  const deleteMutation = createMutation(() => ({
    mutationFn: () => api.notes.delete(Number(params.id)),
    onSuccess:  () => {
      queryClient.invalidateQueries({ queryKey: ["notes"] });
      navigate("/");
    },
  }));

  function startEdit(note: Note) {
    setEditTitle(note.title);
    setEditBody(note.body);
    setEditing(true);
  }

  return (
    <main>
      <A href="/">← Back</A>

      <Show when={noteQuery.isPending}><p>Loading…</p></Show>
      <Show when={noteQuery.isError}>
        <p style={{ color: "red" }}>{(noteQuery.error as Error).message}</p>
      </Show>

      <Show when={noteQuery.isSuccess && noteQuery.data}>
        {(note) => (
          <>
            <Show when={!editing()}>
              <h1>{note().title}</h1>
              <p style={{ "white-space": "pre-wrap" }}>{note().body}</p>
              <small>Updated: {new Date(note().updatedAt).toLocaleString()}</small>
              <br />
              <button onClick={() => startEdit(note())}>Edit</button>
              {" "}
              <button
                onClick={() => deleteMutation.mutate()}
                disabled={deleteMutation.isPending}
                style={{ color: "red" }}
              >
                Delete
              </button>
            </Show>

            <Show when={editing()}>
              <input
                value={editTitle()}
                onInput={(e) => setEditTitle(e.currentTarget.value)}
                style={{ display: "block", width: "100%", "font-size": "1.2rem" }}
              />
              <textarea
                value={editBody()}
                onInput={(e) => setEditBody(e.currentTarget.value)}
                rows={10}
                style={{ display: "block", width: "100%", "margin-top": "0.5rem" }}
              />
              <button
                onClick={() => updateMutation.mutate({ title: editTitle(), body: editBody() })}
                disabled={updateMutation.isPending}
              >
                Save
              </button>
              {" "}
              <button onClick={() => setEditing(false)}>Cancel</button>
            </Show>
          </>
        )}
      </Show>
    </main>
  );
}
