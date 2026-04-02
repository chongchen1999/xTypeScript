/**
 * Effect core — succeed/fail/sync/tryPromise, pipe, gen
 * Run: bun examples/06-effect-framework/01-effect-basics.ts
 */

import { Effect, pipe } from "effect";

// --- 1. Creating effects ---
// Effect<A, E, R> — lazy description, not eager like Promise
const ok   = Effect.succeed(42);                             // Effect<number, never, never>
const fail = Effect.fail("something went wrong" as const);  // Effect<never, string, never>
const sync = Effect.sync(() => Date.now());                  // Effect<number, never, never>
const lazy = Effect.suspend(() => Effect.succeed(Math.random())); // re-evaluated each run

// Effects are lazy — nothing runs until you call runSync/runPromise
const now = Effect.runSync(sync);
console.log("timestamp:", now);

// --- 2. Transforming effects with pipe ---
const program1 = pipe(
  Effect.succeed(10),
  Effect.map(n => n * 3),          // 30
  Effect.map(n => `Result: ${n}`), // "Result: 30"
);
console.log(Effect.runSync(program1)); // "Result: 30"

// flatMap — chain effects (like Rust's and_then / Result chaining)
const program2 = pipe(
  Effect.succeed(10),
  Effect.flatMap(n =>
    n > 5
      ? Effect.succeed(n * 2)
      : Effect.fail("too small" as const)
  ),
  Effect.tap(n => Effect.sync(() => console.log("side effect:", n))),
);
console.log(Effect.runSync(program2)); // side effect: 20 → 20

// --- 3. Effect.gen — imperative style (yield* = Rust's ?) ---
const gen1 = Effect.gen(function* () {
  const a = yield* Effect.succeed(10);
  const b = yield* Effect.succeed(20);
  return a + b; // 30
});
console.log(Effect.runSync(gen1)); // 30

// Short-circuit on error — exactly like Rust's ? operator
const parsePositive = (s: string) => {
  const n = Number(s);
  return isNaN(n)   ? Effect.fail(`"${s}" is not a number` as const) :
         n <= 0     ? Effect.fail(`${n} must be positive` as const)  :
                      Effect.succeed(n);
};

const gen2 = Effect.gen(function* () {
  const x = yield* parsePositive("5");    // 5
  const y = yield* parsePositive("-3");   // fails here — rest of gen doesn't run
  return x + y;
});

// runPromiseExit — get the Exit value without throwing
const exit = await Effect.runPromiseExit(gen2);
if (exit._tag === "Failure") {
  console.log("Failed with:", exit.cause); // Cause wrapping "-3 must be positive"
}

// --- 4. Error handling ---
const handled = pipe(
  gen2,
  Effect.catchAll(err => Effect.succeed(`Recovered: ${err}`)),
);
console.log(Effect.runSync(handled)); // "Recovered: -3 must be positive"
