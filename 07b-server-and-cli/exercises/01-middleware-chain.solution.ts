/**
 * Solution: 07b-01 Middleware Chain (Onion Model)
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
  return (ctx: Context) => {
    let index = -1;

    function dispatch(i: number): Promise<void> {
      // Prevent calling next() multiple times in same middleware
      if (i <= index) return Promise.reject(new Error("next() called multiple times"));
      index = i;
      if (i >= middlewares.length) return Promise.resolve();
      return middlewares[i](ctx, () => dispatch(i + 1));
    }

    return dispatch(0);
  };
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
      return;
    }
    ctx.state.userId = `user_${token}`;
    await next();
  };

  const handler: Middleware = async (ctx, _next) => {
    ctx.body = `Hello, ${ctx.state.userId}!`;
  };

  const app = compose([logger, auth, handler]);

  const ctx1 = createContext("/api/me", { authorization: "abc123" });
  await app(ctx1);
  console.log("Body:", ctx1.body);
  console.log("Logs:", logs);

  logs.length = 0;
  const ctx2 = createContext("/api/me");
  await app(ctx2);
  console.log("Body:", ctx2.body);
  console.log("Status:", ctx2.status);
  console.log("Logs:", logs);
}

main();
