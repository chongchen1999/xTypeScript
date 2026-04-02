/**
 * Solution: 06-02 Service + Layer Dependency Injection
 */

import { Effect, Context, Layer, Data, Ref } from "effect";

// --- error types ---
class ValidationError extends Data.TaggedError("ValidationError")<{
  readonly field: string;
}> {}

class EmailTakenError extends Data.TaggedError("EmailTakenError")<{
  readonly email: string;
}> {}

// --- service definitions ---
class Logger extends Context.Tag("Logger")<
  Logger,
  { readonly info: (msg: string) => Effect.Effect<void> }
>() {}

class IdGen extends Context.Tag("IdGen")<
  IdGen,
  { readonly generate: () => Effect.Effect<string> }
>() {}

interface User { id: string; name: string; email: string }

class UserRepo extends Context.Tag("UserRepo")<
  UserRepo,
  {
    readonly save: (user: User) => Effect.Effect<User>;
    readonly findByEmail: (email: string) => Effect.Effect<User | null>;
  }
>() {}

// --- program ---
const registerUser = (name: string, email: string) =>
  Effect.gen(function* () {
    const logger = yield* Logger;
    const idGen  = yield* IdGen;
    const repo   = yield* UserRepo;

    if (!name.trim())  yield* Effect.fail(new ValidationError({ field: "name" }));
    if (!email.trim()) yield* Effect.fail(new ValidationError({ field: "email" }));

    const existing = yield* repo.findByEmail(email);
    if (existing) yield* Effect.fail(new EmailTakenError({ email }));

    const id = yield* idGen.generate();
    const user: User = { id, name, email };
    const saved = yield* repo.save(user);

    yield* logger.info(`User ${name} registered with id ${id}`);
    return saved;
  });

// --- live layers ---
const LoggerLive = Layer.succeed(Logger, {
  info: (msg) => Effect.sync(() => console.log(`[INFO] ${msg}`)),
});

const IdGenLive = Layer.succeed(IdGen, {
  generate: () => Effect.sync(() => crypto.randomUUID()),
});

// In-memory store using Ref
const UserRepoLive = Layer.effect(
  UserRepo,
  Effect.gen(function* () {
    const store = yield* Ref.make<User[]>([]);
    return {
      save: (user: User) =>
        Ref.update(store, (users) => [...users, user]).pipe(Effect.as(user)),
      findByEmail: (email: string) =>
        Ref.get(store).pipe(
          Effect.map((users) => users.find((u) => u.email === email) ?? null),
        ),
    };
  }),
);

const AppLive = Layer.mergeAll(LoggerLive, IdGenLive, UserRepoLive);

// --- run ---
Effect.runPromise(
  registerUser("Alice", "alice@example.com").pipe(Effect.provide(AppLive))
)
  .then(console.log)
  .catch(console.error);
