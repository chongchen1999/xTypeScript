/**
 * Exercise 06-03: Concurrent Effects with Schedule Retry
 *
 * Implement a resilient batch processor:
 *
 *  `processBatch(ids)`:
 *    - For each ID, call `fetchItem(id)` (provided below, randomly fails ~30%)
 *    - Run up to 3 items concurrently (use Effect.all with concurrency limit)
 *    - Retry each failing item up to 3 times with 50ms exponential backoff
 *    - Collect results: { succeeded: Item[], failed: string[] }
 *    - The whole function should never throw — failed items after retries go to `failed`
 */

import { Effect, Schedule, Data } from "effect";

// --- mock service (do not modify) ---
interface Item { id: string; value: number }

class FetchError extends Data.TaggedError("FetchError")<{ id: string }> {}

const fetchItem = (id: string): Effect.Effect<Item, FetchError> =>
  Math.random() < 0.3
    ? Effect.fail(new FetchError({ id }))
    : Effect.succeed({ id, value: parseInt(id, 10) * 10 });

// --- TODO: implement ---
export const processBatch = (
  ids: string[],
): Effect.Effect<{ succeeded: Item[]; failed: string[] }> => {
  // TODO: implement
  throw new Error("Not implemented");
};

// --- run ---
Effect.runPromise(processBatch(["1", "2", "3", "4", "5", "6"])).then((result) => {
  console.log("Succeeded:", result.succeeded.length);
  console.log("Failed:", result.failed);
});
