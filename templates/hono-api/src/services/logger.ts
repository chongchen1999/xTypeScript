import { Context, Effect, Layer } from "effect";

// --- Logger service ---
export class Logger extends Context.Tag("Logger")<
  Logger,
  {
    info(msg: string):  Effect.Effect<void>;
    error(msg: string): Effect.Effect<void>;
    warn(msg: string):  Effect.Effect<void>;
  }
>() {}

export const LoggerLive = Layer.succeed(Logger, {
  info:  (msg) => Effect.sync(() => console.log(`[INFO]  ${msg}`)),
  error: (msg) => Effect.sync(() => console.error(`[ERROR] ${msg}`)),
  warn:  (msg) => Effect.sync(() => console.warn(`[WARN]  ${msg}`)),
});
