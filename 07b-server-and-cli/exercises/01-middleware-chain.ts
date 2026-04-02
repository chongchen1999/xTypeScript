/**
 * Exercise 07b-01: Middleware Chain (Onion Model)
 *
 * Build a mini Hono/Koa-like middleware system from scratch.
 *
 * Implement:
 * 1. `Context` type with req (path, headers), status, body, and state
 * 2. `Middleware` type — async function receiving (ctx, next)
 * 3. `compose(middlewares)` — chains middlewares in onion model order:
 *    each middleware can do work before calling `await next()`, then do
 *    work after (like the layers of an onion, LIFO for the "after" phase).
 *
 * Requirements:
 * - Calling next() invokes the next middleware in the chain
 * - If a middleware does NOT call next(), the chain stops (short-circuit)
 * - next() should only advance once even if called multiple times
 * - The composed function returns a Promise<void>
 */

export type Context = {
  req: { path: string; headers: Record<string, string> };
  status: number;
  body: string;
  state: Record<string, unknown>;
};

export type Middleware = (
  ctx: Context,
  next: () => Promise<void>,
) => Promise<void>;

export function compose(
  middlewares: Middleware[],
): (ctx: Context) => Promise<void> {
  // TODO: implement
  throw new Error("Not implemented");
}

export function createContext(
  path: string,
  headers: Record<string, string> = {},
): Context {
  return {
    req: { path, headers },
    status: 200,
    body: "",
    state: {},
  };
}

// --- manual test ---
async function main() {
  const logs: string[] = [];

  const logger: Middleware = async (ctx, next) => {
    logs.push(`--> ${ctx.req.path}`);
    await next();
    logs.push(`<-- ${ctx.req.path} ${ctx.status}`);
  };

  const auth: Middleware = async (ctx, next) => {
    const token = ctx.req.headers["authorization"];
    if (!token) {
      ctx.status = 401;
      ctx.body = "Unauthorized";
      return; // short-circuit: don't call next()
    }
    ctx.state.userId = `user_${token}`;
    await next();
  };

  const handler: Middleware = async (ctx, _next) => {
    ctx.body = `Hello, ${ctx.state.userId}!`;
  };

  const app = compose([logger, auth, handler]);

  // Test 1: authenticated request
  const ctx1 = createContext("/api/me", { authorization: "abc123" });
  await app(ctx1);
  console.log("Body:", ctx1.body); // "Hello, user_abc123!"
  console.log("Logs:", logs); // ["--> /api/me", "<-- /api/me 200"]

  // Test 2: unauthenticated request
  logs.length = 0;
  const ctx2 = createContext("/api/me");
  await app(ctx2);
  console.log("Body:", ctx2.body); // "Unauthorized"
  console.log("Status:", ctx2.status); // 401
  console.log("Logs:", logs); // ["--> /api/me", "<-- /api/me 401"]
}

main();
