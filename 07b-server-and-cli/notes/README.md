# Stage 07b: 服务端与 CLI

> **前置要求**: [Stage 04: 异步编程](../../04-async-programming/notes/), [Stage 06: Effect 框架](../../06-effect-framework/notes/)
> **预计时间**: 3–4 天

---

## 学习目标

- 掌握 **Hono** 进行 HTTP server 开发
- 理解 **Yargs** 构建 CLI 应用
- 学会 **Vercel AI SDK** 进行 LLM 集成
- 了解 **MCP SDK** 实现 Model Context Protocol

---

## 1. Hono: 轻量级 HTTP 框架

Hono 运行在 Bun / Deno / Node / Cloudflare Workers 等多种 runtime 上。
类似 Python Flask / FastAPI 或 Rust Actix-web——**声明式路由 + 中间件组合**，但类型推导更强。

### 1.1 路由基础 (Routing)

```typescript
import { Hono } from "hono";

const app = new Hono();

app.get("/", (c) => c.text("Hello Hono!"));
app.post("/users", async (c) => {
  const body = await c.req.json();
  return c.json({ id: crypto.randomUUID(), ...body }, 201);
});

// Path & query parameters
app.get("/users/:id", (c) => c.json({ id: c.req.param("id") }));
app.get("/search", (c) => {
  const q = c.req.query("q") ?? "";
  return c.json({ q, page: Number(c.req.query("page") ?? "1") });
});
```

**路由分组** 让大型项目结构更清晰：

```typescript
const users = new Hono()
  .get("/", (c) => c.json([]))
  .post("/", async (c) => c.json(await c.req.json(), 201))
  .get("/:id", (c) => c.json({ id: c.req.param("id") }));

const api = new Hono();
api.route("/users", users);
```

### 1.2 中间件 (Middleware)

```typescript
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { createMiddleware } from "hono/factory";

app.use("*", logger());
app.use("*", cors({ origin: "https://example.com" }));

// Custom auth middleware
const auth = createMiddleware<{ Variables: { userId: string } }>(async (c, next) => {
  const header = c.req.header("Authorization");
  if (!header?.startsWith("Bearer ")) return c.json({ error: "Unauthorized" }, 401);

  const userId = await verifyToken(header.slice(7));
  if (!userId) return c.json({ error: "Invalid token" }, 403);

  c.set("userId", userId);
  await next();
});

app.use("/api/*", auth);
app.get("/api/me", (c) => c.json({ userId: c.get("userId") }));
```

### 1.3 OpenAPI 集成 (OpenAPI Integration)

通过 `@hono/zod-openapi`，用 Zod schema 同时完成**请求校验 + 文档生成**：

```typescript
import { OpenAPIHono, createRoute, z } from "@hono/zod-openapi";

const UserSchema = z.object({
  id: z.string().openapi({ example: "user_123" }),
  name: z.string().min(1),
  email: z.string().email(),
});

const createUserRoute = createRoute({
  method: "post",
  path: "/users",
  request: {
    body: { content: { "application/json": { schema: UserSchema.omit({ id: true }) } } },
  },
  responses: {
    201: { content: { "application/json": { schema: UserSchema } }, description: "Created" },
  },
});

const app = new OpenAPIHono();
// Type-safe: input/output inferred from route definition
app.openapi(createUserRoute, async (c) => {
  const data = c.req.valid("json");
  return c.json({ id: crypto.randomUUID(), ...data }, 201);
});

app.doc("/openapi.json", { openapi: "3.1.0", info: { title: "API", version: "1.0.0" } });
```

### 1.4 与 Effect 集成 (Effect Integration)

把 Effect typed errors 映射为 HTTP 响应：

```typescript
import { Effect } from "effect";

class UserNotFound {
  readonly _tag = "UserNotFound";
  constructor(readonly id: string) {}
}

app.get("/users/:id", async (c) => {
  const id = c.req.param("id");
  return Effect.gen(function* () {
    const repo = yield* UserRepo;
    const user = yield* repo.findById(id);
    if (!user) return yield* Effect.fail(new UserNotFound(id));
    return user;
  }).pipe(
    Effect.provide(UserRepoLive),
    Effect.match({
      onSuccess: (u) => c.json(u),
      onFailure: (e) => c.json({ error: `User ${e.id} not found` }, 404),
    }),
    Effect.runPromise,
  );
});
```

---

## 2. Yargs: CLI 框架

类似 Python argparse / click 或 Rust clap——**命令 + 选项 + 参数**，自动生成 help。

### 2.1 命令定义 (Command Definition)

```typescript
import yargs from "yargs";
import { hideBin } from "yargs/helpers";

yargs(hideBin(process.argv))
  .scriptName("mytool")
  .command(
    "init <name>",
    "Initialize a new project",
    (y) =>
      y.positional("name", { type: "string", demandOption: true })
        .option("template", { alias: "t", choices: ["basic", "full"] as const, default: "basic" }),
    (argv) => console.log(`Creating: ${argv.name} (${argv.template})`),
  )
  .command(
    "serve",
    "Start dev server",
    (y) => y.option("port", { alias: "p", type: "number", default: 3000 }),
    (argv) => console.log(`Running on :${argv.port}`),
  )
  .demandCommand(1)
  .strict()
  .help()
  .parse();
```

### 2.2 验证 (Validation)

```typescript
.command("deploy <env>", "Deploy to environment", (y) =>
  y.positional("env", { choices: ["staging", "production"] as const, demandOption: true })
    .option("tag", { type: "string", demandOption: true })
    .check((argv) => {
      if (argv.env === "production" && !argv.tag.match(/^v\d+\.\d+\.\d+$/))
        throw new Error("Production requires semver tags (e.g. v1.2.3)");
      return true;
    }),
  (argv) => console.log(`Deploying ${argv.tag} to ${argv.env}`),
)
```

---

## 3. Vercel AI SDK: LLM 集成

提供**统一 provider 抽象**，同一套 API 调用 OpenAI / Anthropic / Google 等。

### 3.1 Provider 抽象

```typescript
import { generateText } from "ai";
import { openai } from "@ai-sdk/openai";
import { anthropic } from "@ai-sdk/anthropic";

// Same API, different providers
const r1 = await generateText({ model: openai("gpt-4o"), prompt: "Explain generics." });
const r2 = await generateText({ model: anthropic("claude-sonnet-4-20250514"), prompt: "Explain generics." });
```

### 3.2 流式响应与工具调用 (Streaming & Tool Calling)

```typescript
import { streamText, tool } from "ai";
import { z } from "zod";

const result = streamText({
  model: openai("gpt-4o"),
  messages: [{ role: "user", content: "Weather in Tokyo?" }],
  tools: {
    getWeather: tool({
      description: "Get weather for a city",
      parameters: z.object({ city: z.string() }),
      execute: async ({ city }) => ({ city, temp: 22, condition: "sunny" }),
    }),
  },
  maxSteps: 5,
});

for await (const part of result.textStream) process.stdout.write(part);
```

在 Hono 中集成：

```typescript
app.post("/chat", async (c) => {
  const { messages } = await c.req.json();
  const result = streamText({ model: openai("gpt-4o"), messages });
  return result.toDataStreamResponse();
});
```

---

## 4. MCP SDK: Model Context Protocol

MCP 是**标准化协议**，让 LLM 以统一方式调用外部 tools 和访问 resources——"LLM 的 USB 接口"。

| 角色 | 说明 |
|------|------|
| **Host** | LLM 应用 (Claude Desktop, IDE) |
| **Client** | 由 Host 创建，与 Server 1:1 连接 |
| **Server** | 暴露 tools / resources / prompts |

Transport: **stdio** (本地) 或 **Streamable HTTP** (远程)。

### 4.1 工具定义 (Tool Definition)

```typescript
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

const server = new McpServer({ name: "file-tools", version: "1.0.0" });

server.tool(
  "read_file",
  "Read contents of a file",
  { path: z.string().describe("Absolute file path") },
  async ({ path }) => ({
    content: [{ type: "text", text: await Bun.file(path).text() }],
  }),
);

server.tool(
  "list_directory",
  "List files in a directory",
  { path: z.string(), pattern: z.string().optional() },
  async ({ path, pattern }) => ({
    content: [{ type: "text", text: JSON.stringify(
      Array.from(new Bun.Glob(pattern ?? "*").scanSync({ cwd: path })), null, 2,
    )}],
  }),
);

await server.connect(new StdioServerTransport());
```

Client 调用：

```typescript
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

const client = new Client({ name: "my-app", version: "1.0.0" });
await client.connect(new StdioClientTransport({ command: "npx", args: ["file-tools-mcp"] }));

const { tools } = await client.listTools();
const result = await client.callTool({ name: "read_file", arguments: { path: "/tmp/test.txt" } });
```

---

## 推荐资源

| 资源 | 链接 |
|------|------|
| Hono 官方文档 | [hono.dev](https://hono.dev) |
| Yargs 文档 | [yargs.js.org](https://yargs.js.org) |
| Vercel AI SDK | [sdk.vercel.ai](https://sdk.vercel.ai) |
| MCP 规范 | [modelcontextprotocol.io](https://modelcontextprotocol.io) |

---

## 检查点

- [ ] 能用 Hono 构建带中间件的 REST API
- [ ] 能在 Hono 路由中集成 OpenAPI 校验与文档
- [ ] 能用 Yargs 创建带子命令的 CLI 应用
- [ ] 能用 AI SDK 实现流式 LLM 响应
- [ ] 理解 MCP server / client 架构并能定义 tools

---

## 下一步

→ 继续其他 Stage 07 模块：
- [Stage 07a: Schema 与数据层](../../07a-schema-and-data/notes/)
- [Stage 07c: 前端与 UI](../../07c-frontend-and-ui/notes/)
- [Stage 07d: 测试与工具链](../../07d-testing-and-tooling/notes/)
