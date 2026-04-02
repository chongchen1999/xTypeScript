/**
 * Solution: 06-03 Concurrent Effects with Schedule Retry
 */

import { Effect, Schedule, Data } from "effect";

interface Item { id: string; value: number }

class FetchError extends Data.TaggedError("FetchError")<{ id: string }> {}

const fetchItem = (id: string): Effect.Effect<Item, FetchError> =>
  Math.random() < 0.3
    ? Effect.fail(new FetchError({ id }))
    : Effect.succeed({ id, value: parseInt(id, 10) * 10 });

export const processBatch = (
  ids: string[],
): Effect.Effect<{ succeeded: Item[]; failed: string[] }> => {
  // Retry policy: up to 3 retries with 50ms exponential backoff
  const retryPolicy = Schedule.exponential("50 millis").pipe(
    Schedule.compose(Schedule.recurs(3)),
  );

  // Process one item: retry then convert remaining failure to a "failed" result
  const processOne = (id: string): Effect.Effect<{ item: Item | null; id: string }> =>
    fetchItem(id).pipe(
      Effect.retry(retryPolicy),
      Effect.match({
        onSuccess: (item) => ({ item, id }),
        onFailure: () => ({ item: null, id }),
      }),
    );

  // Run up to 3 concurrently
  const processAll = Effect.all(
    ids.map(processOne),
    { concurrency: 3 },
  );

  return processAll.pipe(
    Effect.map((results) => ({
      succeeded: results.filter((r) => r.item !== null).map((r) => r.item as Item),
      failed: results.filter((r) => r.item === null).map((r) => r.id),
    })),
  );
};

// --- run ---
Effect.runPromise(processBatch(["1", "2", "3", "4", "5", "6"])).then((result) => {
  console.log("Succeeded:", result.succeeded.length);
  console.log("Failed:", result.failed);
});
