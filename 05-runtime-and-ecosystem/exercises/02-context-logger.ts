/**
 * Exercise 05-02: Context Logger with AsyncLocalStorage
 *
 * Implement a `ContextLogger` class using Node's `AsyncLocalStorage`:
 * - `run<T>(context: { requestId: string }, fn: () => Promise<T>): Promise<T>`
 *   Executes `fn` within an async context bound to `context`.
 * - `info(msg: string): void`  — logs `[requestId] INFO: msg`
 * - `warn(msg: string): void`  — logs `[requestId] WARN: msg`
 * - `error(msg: string): void` — logs `[requestId] ERROR: msg`
 *
 * Requirements:
 * - Use `AsyncLocalStorage` from `async_hooks` (works in Bun & Node)
 * - Concurrent calls to `run()` must maintain isolated contexts
 * - If called outside a `run()` context, prefix with `[no-context]`
 */

import { AsyncLocalStorage } from "async_hooks";

interface LogContext {
  requestId: string;
}

export class ContextLogger {
  // TODO: implement

  run<T>(context: LogContext, fn: () => Promise<T>): Promise<T> {
    throw new Error("Not implemented");
  }

  info(msg: string): void {
    throw new Error("Not implemented");
  }

  warn(msg: string): void {
    throw new Error("Not implemented");
  }

  error(msg: string): void {
    throw new Error("Not implemented");
  }
}

// --- manual test ---
async function main() {
  const logger = new ContextLogger();

  // Outside any context
  logger.info("boot"); // [no-context] INFO: boot

  // Concurrent requests with isolated contexts
  await Promise.all([
    logger.run({ requestId: "req-1" }, async () => {
      logger.info("start");
      await new Promise((r) => setTimeout(r, 50));
      logger.warn("slow query");
      logger.info("done");
    }),
    logger.run({ requestId: "req-2" }, async () => {
      logger.info("start");
      await new Promise((r) => setTimeout(r, 30));
      logger.error("not found");
      logger.info("done");
    }),
  ]);

  // Expected output (order of interleaving may vary):
  // [no-context] INFO: boot
  // [req-1] INFO: start
  // [req-2] INFO: start
  // [req-2] ERROR: not found
  // [req-2] INFO: done
  // [req-1] WARN: slow query
  // [req-1] INFO: done
}

main();
