import { useParams, A } from "@solidjs/router";
import { createQuery }  from "@tanstack/solid-query";
import { Show }         from "solid-js";
import { api }          from "@/lib/api.js";

export default function ItemDetail() {
  // useParams() returns a plain object — access via property, not destructuring
  const params = useParams<{ id: string }>();

  const itemQuery = createQuery(() => ({
    queryKey: ["items", params.id],
    queryFn:  () => api.items.get(Number(params.id)),
  }));

  return (
    <main>
      <A href="/items">← Items</A>

      <Show when={itemQuery.isPending}>
        <p>Loading…</p>
      </Show>

      <Show when={itemQuery.isError}>
        <p style={{ color: "red" }}>Error: {(itemQuery.error as Error).message}</p>
      </Show>

      <Show when={itemQuery.isSuccess && itemQuery.data}>
        {(item) => (
          <article>
            <h1>{item().name}</h1>
            <Show when={item().description}>
              <p>{item().description}</p>
            </Show>
            <p>
              <small>Created: {new Date(item().createdAt).toLocaleString()}</small>
            </p>
          </article>
        )}
      </Show>
    </main>
  );
}
