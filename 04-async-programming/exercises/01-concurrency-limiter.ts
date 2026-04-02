/**
 * Exercise 04-01: Concurrent Request Limiter
 *
 * Implement `limitConcurrency(tasks, limit)`:
 * - `tasks` is an array of zero-arg async functions (thunks)
 * - `limit` is the maximum number of tasks running simultaneously
 * - Returns a Promise that resolves to an array of results in the original order
 *
 * Example: with limit=2 and 5 tasks, at most 2 run at the same time.
 *
 * This is the foundational pattern behind p-limit, Promise pools, etc.
 */

export async function limitConcurrency<T>(
  tasks: Array<() => Promise<T>>,
  limit: number,
): Promise<T[]> {
  // TODO: implement
  throw new Error("Not implemented");
}

// --- manual test ---
async function main() {
  const start = Date.now();

  const tasks = Array.from({ length: 6 }, (_, i) => async () => {
    await new Promise((r) => setTimeout(r, 100)); // each task takes 100ms
    console.log(`Task ${i} done at ${Date.now() - start}ms`);
    return i * 10;
  });

  const results = await limitConcurrency(tasks, 2);
  console.log("Results:", results); // [0, 10, 20, 30, 40, 50]
  // With limit=2: tasks 0&1 run together (~100ms), then 2&3 (~200ms), then 4&5 (~300ms)
}

main();
