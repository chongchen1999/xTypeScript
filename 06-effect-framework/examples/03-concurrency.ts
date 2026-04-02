/**
 * Effect concurrency — Fiber, Ref, Queue, Schedule
 * Run: bun examples/06-effect-framework/03-concurrency.ts
 */

import { Effect, Fiber, Ref, Queue, Schedule, Duration } from "effect";

// --- 1. Fiber — lightweight concurrent task (like Go goroutine / tokio::spawn) ---
const task = (label: string, delayMs: number) =>
  Effect.gen(function* () {
    yield* Effect.sleep(Duration.millis(delayMs));
    return `${label} done`;
  });

const fiberExample = Effect.gen(function* () {
  const t0 = Date.now();

  // Fork two tasks — they run concurrently
  const fiberA = yield* Effect.fork(task("A", 100));
  const fiberB = yield* Effect.fork(task("B", 60));

  const resultB = yield* Fiber.join(fiberB); // B finishes first
  const resultA = yield* Fiber.join(fiberA);

  console.log(resultB, resultA, `in ${Date.now() - t0}ms`);
  // "B done A done in ~100ms" (not 160ms — they ran in parallel)
});

await Effect.runPromise(fiberExample);

// --- 2. Ref — atomic shared state (like Rust's Arc<Mutex<T>> but composable) ---
const refExample = Effect.gen(function* () {
  const counter = yield* Ref.make(0);

  // Increment from 10 concurrent fibers
  const increments = Array.from({ length: 10 }, () =>
    Ref.update(counter, n => n + 1)
  );
  yield* Effect.all(increments, { concurrency: "unbounded" });

  return yield* Ref.get(counter);
});
const count = await Effect.runPromise(refExample);
console.log("Counter:", count); // 10

// --- 3. Queue — bounded producer-consumer channel (like Go channels) ---
const queueExample = Effect.gen(function* () {
  const q = yield* Queue.bounded<string>(5);
  const results: string[] = [];

  // Producer: sends 4 items then shuts down
  const producer = Effect.gen(function* () {
    for (const item of ["α", "β", "γ", "δ"]) {
      yield* Queue.offer(q, item);
      yield* Effect.sleep(Duration.millis(10));
    }
    yield* Queue.shutdown(q);
  });

  // Consumer: drain until queue is shut down
  const consumer = Effect.gen(function* () {
    while (true) {
      const item = yield* Queue.take(q);
      results.push(item);
    }
  }).pipe(Effect.catchAllCause(() => Effect.succeed(null))); // queue shutdown = normal exit

  yield* Effect.all([producer, consumer], { concurrency: "unbounded" });
  return results;
});
const items = await Effect.runPromise(queueExample);
console.log("Queue items:", items); // ["α", "β", "γ", "δ"]

// --- 4. Schedule — retry and repeat policies ---
let callCount = 0;
const flaky = Effect.gen(function* () {
  callCount++;
  if (callCount < 3) yield* Effect.fail(new Error(`Attempt ${callCount} failed`));
  return `Success on attempt ${callCount}`;
});

// Retry up to 5 times with 20ms exponential backoff
const retryPolicy = Schedule.exponential(Duration.millis(20)).pipe(
  Schedule.compose(Schedule.recurs(5)),
);

const retryResult = await Effect.runPromise(
  flaky.pipe(Effect.retry(retryPolicy))
);
console.log(retryResult); // "Success on attempt 3"
