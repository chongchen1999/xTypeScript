/**
 * Solution: 05-02 Context Logger with AsyncLocalStorage
 */

import { AsyncLocalStorage } from "async_hooks";

interface LogContext {
  requestId: string;
}

export class ContextLogger {
  private storage = new AsyncLocalStorage<LogContext>();

  run<T>(context: LogContext, fn: () => Promise<T>): Promise<T> {
    return this.storage.run(context, fn);
  }

  private prefix(): string {
    const ctx = this.storage.getStore();
    return ctx ? `[${ctx.requestId}]` : "[no-context]";
  }

  info(msg: string): void {
    console.log(`${this.prefix()} INFO: ${msg}`);
  }

  warn(msg: string): void {
    console.log(`${this.prefix()} WARN: ${msg}`);
  }

  error(msg: string): void {
    console.log(`${this.prefix()} ERROR: ${msg}`);
  }
}

// --- manual test ---
async function main() {
  const logger = new ContextLogger();

  await Promise.all([
    logger.run({ requestId: "req-1" }, async () => {
      logger.info("start processing");
      await new Promise((r) => setTimeout(r, 50));
      logger.info("done processing");
    }),
    logger.run({ requestId: "req-2" }, async () => {
      logger.warn("something slow");
      await new Promise((r) => setTimeout(r, 30));
      logger.error("something failed");
    }),
  ]);

  logger.info("no context here");
}

main();
