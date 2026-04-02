const BASE = import.meta.env["VITE_API_BASE"] ?? "/api";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "Content-Type": "application/json", ...init?.headers },
    ...init,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText })) as { error: string };
    throw new Error(err.error ?? `HTTP ${res.status}`);
  }
  // 204 No Content — return undefined cast to T
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

// --- Item API ---
export type Item = {
  id:          number;
  name:        string;
  description: string | undefined;
  createdAt:   string;
};

export type CreateItem = Pick<Item, "name" | "description">;
export type UpdateItem = Partial<CreateItem>;

export const api = {
  items: {
    list:   ()                        => request<Item[]>("/items"),
    get:    (id: number)              => request<Item>(`/items/${id}`),
    create: (data: CreateItem)        => request<Item>("/items", { method: "POST",  body: JSON.stringify(data) }),
    update: (id: number, data: UpdateItem) => request<Item>(`/items/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
    delete: (id: number)              => request<void>(`/items/${id}`, { method: "DELETE" }),
  },
};
