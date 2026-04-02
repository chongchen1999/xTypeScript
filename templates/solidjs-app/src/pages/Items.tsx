import { A } from "@solidjs/router";
import { createQuery, createMutation, useQueryClient } from "@tanstack/solid-query";
import { For, Show } from "solid-js";
import { api }       from "@/lib/api.js";
import type { Item } from "@/lib/api.js";

export default function Items() {
  const queryClient = useQueryClient();

  const itemsQuery = createQuery(() => ({
    queryKey: ["items"],
    queryFn:  () => api.items.list(),
  }));

  const deleteMutation = createMutation(() => ({
    mutationFn: (id: number) => api.items.delete(id),
    onSuccess:  () => queryClient.invalidateQueries({ queryKey: ["items"] }),
  }));

  return (
    <main>
      <h1>Items</h1>
      <A href="/">← Home</A>

      <Show when={itemsQuery.isPending}>
        <p>Loading…</p>
      </Show>

      <Show when={itemsQuery.isError}>
        <p style={{ color: "red" }}>Error: {(itemsQuery.error as Error).message}</p>
      </Show>

      <Show when={itemsQuery.isSuccess}>
        <ul>
          <For each={itemsQuery.data} fallback={<li>No items yet.</li>}>
            {(item: Item) => (
              <li>
                <A href={`/items/${item.id}`}>{item.name}</A>
                {" "}
                <button
                  onClick={() => deleteMutation.mutate(item.id)}
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
