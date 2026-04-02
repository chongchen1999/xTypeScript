/**
 * Exercise 04-02: Async Pipeline with Cancellation
 *
 * Implement an async pipeline that:
 * 1. Fetches a list of user IDs from /api/users  (returns string[])
 * 2. For each ID, fetches the user details from /api/users/:id
 * 3. Filters to only active users
 * 4. Returns the first 3 active users
 *
 * The entire pipeline must respect an AbortSignal — if aborted at any point,
 * it should throw a DOMException with name "AbortError".
 *
 * Use the mock fetch provided below (do NOT use real fetch).
 */

// --- mock fetch (do not modify) ---
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
  const active = ["u1", "u3", "u5"]; // odd IDs are active
  return {
    json: async () => ({ id, name: `User ${id}`, active: active.includes(id!) }),
  };
}

// --- TODO: implement ---
export async function fetchActiveUsers(signal: AbortSignal): Promise<Array<{ id: string; name: string }>> {
  // TODO: implement using mockFetch
  throw new Error("Not implemented");
}

// --- manual test ---
async function main() {
  // Normal run
  const ctrl = new AbortController();
  const users = await fetchActiveUsers(ctrl.signal);
  console.log("Active users:", users); // [{id:"u1",...}, {id:"u3",...}, {id:"u5",...}]

  // Cancelled run
  const ctrl2 = new AbortController();
  setTimeout(() => ctrl2.abort(), 30); // abort after 30ms (before first fetch completes)
  try {
    await fetchActiveUsers(ctrl2.signal);
  } catch (e) {
    console.log("Cancelled:", (e as Error).name); // "AbortError"
  }
}

main();
