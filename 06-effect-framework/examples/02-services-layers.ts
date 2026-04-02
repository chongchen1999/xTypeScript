/**
 * Effect Services and Layers — compile-time dependency injection
 * Run: bun examples/06-effect-framework/02-services-layers.ts
 */

import { Effect, Context, Layer, Ref } from "effect";

// --- 1. Define services (like Rust trait objects / C++ abstract classes) ---
class Logger extends Context.Tag("Logger")<
  Logger,
  {
    info(msg: string):  Effect.Effect<void>;
    error(msg: string): Effect.Effect<void>;
  }
>() {}

class IdGen extends Context.Tag("IdGen")<
  IdGen,
  { next(): Effect.Effect<string> }
>() {}

class Cache extends Context.Tag("Cache")<
  Cache,
  {
    get(key: string):          Effect.Effect<string | null>;
    set(key: string, val: string): Effect.Effect<void>;
  }
>() {}

// --- 2. Business logic — uses services, R parameter tracks dependencies ---
const fetchWithCache = (url: string) =>
  Effect.gen(function* () {
    const logger = yield* Logger;
    const cache  = yield* Cache;

    const cached = yield* cache.get(url);
    if (cached) {
      yield* logger.info(`Cache hit: ${url}`);
      return cached;
    }

    yield* logger.info(`Cache miss: ${url} — fetching...`);
    const data = `<data from ${url}>`;  // in real code: yield* Effect.tryPromise(...)
    yield* cache.set(url, data);
    return data;
  });
// Type: Effect<string, never, Logger | Cache>

// --- 3. Implement layers (one implementation per service) ---
const LoggerLive = Layer.succeed(Logger, {
  info:  msg => Effect.sync(() => console.log(`[INFO]  ${msg}`)),
  error: msg => Effect.sync(() => console.error(`[ERROR] ${msg}`)),
});

const IdGenLive = Layer.succeed(IdGen, {
  next: () => Effect.sync(() => crypto.randomUUID()),
});

// Cache backed by an in-memory Ref — created once, shared across all uses of Cache
const CacheLive = Layer.effect(
  Cache,
  Effect.gen(function* () {
    const store = yield* Ref.make<Record<string, string>>({});
    return {
      get: (key: string) =>
        Ref.get(store).pipe(Effect.map(m => m[key] ?? null)),
      set: (key: string, val: string) =>
        Ref.update(store, m => ({ ...m, [key]: val })),
    };
  }),
);

// --- 4. Compose layers and run ---
const AppLive = Layer.mergeAll(LoggerLive, IdGenLive, CacheLive);

const program = Effect.gen(function* () {
  const r1 = yield* fetchWithCache("/api/users");
  const r2 = yield* fetchWithCache("/api/users"); // second call hits cache
  const r3 = yield* fetchWithCache("/api/posts");
  return [r1, r2, r3];
});

const results = await Effect.runPromise(
  program.pipe(Effect.provide(AppLive))
);
console.log("Results:", results);

// --- 5. Layer dependencies — one layer can require another ---
// A DatabaseLayer might require a ConfigLayer:
//
// const DbLive = Layer.effect(
//   Database,
//   Effect.gen(function* () {
//     const config = yield* Config;           // depends on Config service
//     return createDb(config.dbUrl);
//   })
// );
// const AppWithDb = DbLive.pipe(Layer.provide(ConfigLive)); // satisfy the dependency
