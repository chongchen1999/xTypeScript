/**
 * Solution: 04-02 Async Pipeline with Cancellation
 */

async function mockFetch(url: string, options?: { signal?: AbortSignal }): Promise<{ json(): Promise<any> }> {
  await new Promise((resolve, reject) => {
    const timer = setTimeout(resolve, 50);
    options?.signal?.addEventListener("abort", () => {
      clearTimeout(timer);
      reject(new DOMException("Aborted", "AbortError"));
    });
  });

  if (url === "/api/users") return { json: async () => ["u1", "u2", "u3", "u4", "u5"] };
  const id = url.split("/").pop();
  const active = ["u1", "u3", "u5"];
  return {
    json: async () => ({ id, name: `User ${id}`, active: active.includes(id!) }),
  };
}

export async function fetchActiveUsers(signal: AbortSignal): Promise<Array<{ id: string; name: string }>> {
  // Step 1: fetch user IDs
  const idsRes = await mockFetch("/api/users", { signal });
  const ids: string[] = await idsRes.json();

  // Step 2: fetch details concurrently, passing signal to each
  const details = await Promise.all(
    ids.map(async (id) => {
      const res = await mockFetch(`/api/users/${id}`, { signal });
      return res.json() as Promise<{ id: string; name: string; active: boolean }>;
    }),
  );

  // Step 3: filter and slice
  return details.filter((u) => u.active).slice(0, 3).map(({ id, name }) => ({ id, name }));
}

// --- manual test ---
async function main() {
  const ctrl = new AbortController();
  const users = await fetchActiveUsers(ctrl.signal);
  console.log("Active users:", users);

  const ctrl2 = new AbortController();
  setTimeout(() => ctrl2.abort(), 30);
  try {
    await fetchActiveUsers(ctrl2.signal);
  } catch (e) {
    console.log("Cancelled:", (e as Error).name); // "AbortError"
  }
}

main();
