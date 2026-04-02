/**
 * Exercise 07c-03: Query Cache
 *
 * Build a simplified TanStack Query-like cache system.
 *
 * Implement:
 * 1. `QueryResult<T>` type with data, isStale, and fetchedAt fields
 * 2. `QueryClient` class with:
 *    - `query<T>(key, fetcher, opts?)` — returns cached data if fresh, otherwise refetches
 *    - `invalidate(key)` — marks a cached entry as stale (next query will refetch)
 *
 * Requirements:
 * - If cached data exists and is within `staleTime` ms, return it without calling fetcher
 * - If cached data is stale or missing, call fetcher and cache the result
 * - `invalidate(key)` should mark the entry as stale but not delete it
 * - `staleTime` defaults to 0 (always stale unless explicitly set)
 * - `fetchedAt` should be the timestamp when the data was last fetched
 */

export type QueryResult<T> = {
  data: T;
  isStale: boolean;
  fetchedAt: number;
};

export class QueryClient {
  query<T>(
    key: string,
    fetcher: () => Promise<T>,
    opts?: { staleTime?: number },
  ): Promise<QueryResult<T>> {
    // TODO: implement
    throw new Error("Not implemented");
  }

  invalidate(key: string): void {
    // TODO: implement
    throw new Error("Not implemented");
  }
}

// --- manual test ---
async function main() {
  const client = new QueryClient();
  let fetchCount = 0;

  const fetcher = async () => {
    fetchCount++;
    return { users: ["Alice", "Bob"] };
  };

  // First fetch — should call fetcher
  const r1 = await client.query("users", fetcher, { staleTime: 5000 });
  console.log("Result 1:", r1.data); // { users: ["Alice", "Bob"] }
  console.log("Fetch count:", fetchCount); // 1

  // Second fetch — should return cached
  const r2 = await client.query("users", fetcher, { staleTime: 5000 });
  console.log("Result 2 cached:", r2.data);
  console.log("Fetch count:", fetchCount); // still 1
  console.log("Is stale:", r2.isStale); // false

  // Invalidate and refetch
  client.invalidate("users");
  const r3 = await client.query("users", fetcher, { staleTime: 5000 });
  console.log("Result 3 after invalidate:", r3.data);
  console.log("Fetch count:", fetchCount); // 2
  console.log("Is stale:", r3.isStale); // false

  // Query with staleTime=0 (default) should always refetch
  const r4 = await client.query("users", fetcher);
  console.log("Fetch count after staleTime=0:", fetchCount); // 3
}

main();
