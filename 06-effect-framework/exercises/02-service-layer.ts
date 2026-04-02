/**
 * Exercise 06-02: Service + Layer Dependency Injection
 *
 * Build a small "user registration" flow using Effect's Service/Layer system.
 *
 * Services to implement:
 *  1. Logger   — info(msg: string) logs to console
 *  2. IdGen    — generate() returns a unique string ID
 *  3. UserRepo — save(user) persists and findByEmail(email) looks up a user
 *
 * Program logic:
 *  1. Validate that name and email are non-empty (ValidationError)
 *  2. Check email is not already taken (EmailTakenError)
 *  3. Generate an ID
 *  4. Save the user
 *  5. Log "User <name> registered with id <id>"
 *  6. Return the saved user
 *
 * Then provide live implementations and run the program.
 */

import { Effect, Context, Layer, Data } from "effect";

// --- TODO: define error types ---
// class ValidationError ...
// class EmailTakenError ...

// --- TODO: define services (Context.Tag) ---
// class Logger ...
// class IdGen ...
// class UserRepo ...

// --- TODO: implement the registration program ---
const registerUser = (name: string, email: string) =>
  Effect.gen(function* () {
    // TODO: implement
    throw new Error("Not implemented");
  });

// --- TODO: implement live layers ---
// const LoggerLive = Layer.succeed(Logger, { ... });
// const IdGenLive  = Layer.succeed(IdGen, { ... });
// const UserRepoLive = ...

// --- TODO: compose layers and run ---
// const AppLive = ...
// Effect.runPromise(registerUser("Alice", "alice@example.com").pipe(Effect.provide(AppLive)))
//   .then(console.log)
//   .catch(console.error);
