/**
 * Solution: 07c-03 Query Cache
 */

export type QueryResult<T> = {
  data: T;
  isStale: boolean;
  fetchedAt: number;
};

type CacheEntry<T = unknown> = {
  data: T;
  fetchedAt: number;
  stale: boolean;
};

export class QueryClient {
  private cache = new Map<string, CacheEntry>();

  async query<T>(
    key: string,
    fetcher: () => Promise<T>,
    opts?: { staleTime?: number },
  ): Promise<QueryResult<T>> {
    const staleTime = opts?.staleTime ?? 0;
    const entry = this.cache.get(key) as CacheEntry<T> | undefined;

    if (entry && !entry.stale && Date.now() - entry.fetchedAt < staleTime) {
      return { data: entry.data, isStale: false, fetchedAt: entry.fetchedAt };
    }

    const data = await fetcher();
    const fetchedAt = Date.now();
    this.cache.set(key, { data, fetchedAt, stale: false });
    return { data, isStale: false, fetchedAt };
  }

  invalidate(key: string): void {
    const entry = this.cache.get(key);
    if (entry) entry.stale = true;
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

  const r1 = await client.query("users", fetcher, { staleTime: 5000 });
  console.log("Result 1:", r1.data);
  console.log("Fetch count:", fetchCount);

  const r2 = await client.query("users", fetcher, { staleTime: 5000 });
  console.log("Result 2 cached:", r2.data);
  console.log("Fetch count:", fetchCount);
  console.log("Is stale:", r2.isStale);

  client.invalidate("users");
  const r3 = await client.query("users", fetcher, { staleTime: 5000 });
  console.log("Result 3 after invalidate:", r3.data);
  console.log("Fetch count:", fetchCount);

  const r4 = await client.query("users", fetcher);
  console.log("Fetch count after staleTime=0:", fetchCount);
}

main();
