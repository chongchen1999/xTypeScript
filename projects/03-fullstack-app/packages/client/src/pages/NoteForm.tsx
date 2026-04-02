import { useNavigate, A } from "@solidjs/router";
import { createMutation, useQueryClient } from "@tanstack/solid-query";
import { createSignal } from "solid-js";
import { api } from "@/api.js";
import type { Note } from "@fullstack/shared";

export default function NoteForm() {
  const navigate    = useNavigate();
  const queryClient = useQueryClient();

  const [title, setTitle] = createSignal("");
  const [body,  setBody]  = createSignal("");

  const createMut = createMutation(() => ({
    mutationFn: () => api.notes.create({ title: title(), body: body() }),
    onSuccess:  (note: Note) => {
      queryClient.invalidateQueries({ queryKey: ["notes"] });
      navigate(`/notes/${note.id}`);
    },
  }));

  function handleSubmit(e: Event) {
    e.preventDefault();
    if (title().trim()) createMut.mutate();
  }

  return (
    <main>
      <A href="/">← Back</A>
      <h1>New Note</h1>

      <form onSubmit={handleSubmit}>
        <input
          placeholder="Title"
          value={title()}
          onInput={(e) => setTitle(e.currentTarget.value)}
          required
          style={{ display: "block", width: "100%", "font-size": "1.2rem" }}
        />
        <textarea
          placeholder="Body (optional)"
          value={body()}
          onInput={(e) => setBody(e.currentTarget.value)}
          rows={8}
          style={{ display: "block", width: "100%", "margin-top": "0.5rem" }}
        />
        <button
          type="submit"
          disabled={createMut.isPending || !title().trim()}
          style={{ "margin-top": "0.5rem" }}
        >
          {createMut.isPending ? "Saving…" : "Create note"}
        </button>
      </form>

      {createMut.isError && (
        <p style={{ color: "red" }}>{(createMut.error as Error).message}</p>
      )}
    </main>
  );
}
