# Stage 05: 运行时与生态系统 (Runtime & Ecosystem)

> **前置要求**: [Stage 01: JavaScript 基础](../01-javascript-foundations/)
> **预计时间**: 2–3 天

---

## 学习目标

- 理解 Bun runtime 及其优势
- 深入掌握 ESM 模块系统
- 学会使用 Bun 进行包管理
- 理解 monorepo workspace 配置
- 掌握 AsyncLocalStorage 上下文传播机制
- 配置 tsconfig.json

---

## 1. Bun 运行时 (Bun Runtime)

Bun 是用 Zig 编写的高性能 JS/TS runtime，集成了 runtime、bundler、test runner 和 package manager。

| 特性 | Bun | Node.js | Deno |
|------|-----|---------|------|
| 语言引擎 | JavaScriptCore | V8 | V8 |
| 原生 TypeScript | ✅ | ❌ 需编译 | ✅ |
| 内置 bundler | ✅ | ❌ | ❌ |
| 内置包管理器 | ✅ | npm (独立) | ❌ |

**跨语言类比**: Rust `cargo` 也是 all-in-one 工具链，理念最相似；Python CPython→Node.js / PyPy→Bun；C++ 无统一工具链。

```bash
bun init                  # Initialize project
bun run src/index.ts      # Run TS directly
bun test                  # Built-in test runner
```

```typescript
const server = Bun.serve({
  port: 3000,
  fetch(req: Request): Response {
    const url = new URL(req.url);
    if (url.pathname === "/api/health") {
      return Response.json({ status: "ok", runtime: "bun" });
    }
    return new Response("Not Found", { status: 404 });
  },
});
console.log(`Server running at http://localhost:${server.port}`);
```

---

## 2. ESM 模块深入 (ESM Module System)

ESM 的 `import/export` 是静态声明，支持编译期分析和 tree-shaking（移除未使用代码）。

```typescript
// Static import — tree-shakeable
import { add } from "./math.ts";        // unused exports are eliminated

// Dynamic import — returns Promise, for lazy/conditional loading
const module = await import(`./formatters/${locale}.ts`);

// Import attributes
import config from "./config.json" with { type: "json" };
```

**package.json 模块配置**:

```jsonc
{
  "name": "my-lib",
  "type": "module",
  "exports": {
    ".": { "import": "./dist/index.js", "types": "./dist/index.d.ts" },
    "./utils": { "import": "./dist/utils.js", "types": "./dist/utils.d.ts" }
  }
}
```

**Barrel files** — 聚合导出，但过大会影响 tree-shaking：

```typescript
// components/index.ts
export { Button } from "./Button.ts";
export { Input } from "./Input.ts";
export type { ButtonProps, InputProps } from "./types.ts";
```

**跨语言类比**:
- **C++20 modules**: 编译期分析，`import std;` 类似 ESM 静态导入
- **Python import**: 运行时执行（类似 `require`），无 tree-shaking
- **Rust `mod`/`use`**: 静态分析，天然 dead code elimination

---

## 3. 包管理 (Package Management)

```jsonc
{
  "dependencies": {       // Runtime — shipped to production
    "effect": "^3.0.0"
  },
  "devDependencies": {    // Build/test only
    "typescript": "^5.5.0"
  },
  "peerDependencies": {   // Provided by consumer
    "react": "^18.0.0 || ^19.0.0"
  }
}
```

**SemVer**: `^1.2.3` = `>=1.2.3 <2.0.0`，`~1.2.3` = `>=1.2.3 <1.3.0`

```bash
bun install              # Install from lock file
bun add effect           # Add runtime dep
bun add -d typescript    # Add dev dep
bun remove lodash        # Remove dep
```

| 概念 | Bun | Python | Rust | C++ |
|------|-----|--------|------|-----|
| 包管理器 | bun | pip/poetry | cargo | vcpkg/conan |
| 配置文件 | package.json | pyproject.toml | Cargo.toml | vcpkg.json |
| Lock file | bun.lock | poetry.lock | Cargo.lock | — |

---

## 4. Monorepo 与 Workspace

在一个仓库管理多个包，共享配置、统一版本、简化跨包开发。

```jsonc
// root package.json
{
  "private": true,
  "workspaces": ["packages/*", "apps/*"]
}
```

**内部包引用** — 使用 `workspace:*` 协议：

```jsonc
// packages/shared/package.json
{ "name": "@myorg/shared", "exports": { ".": "./src/index.ts" } }

// apps/api/package.json — reference workspace packages
{ "dependencies": { "@myorg/shared": "workspace:*", "@myorg/db": "workspace:*" } }
```

```typescript
// Workspace imports look like normal package imports
import { createLogger } from "@myorg/shared";
import { connectDb } from "@myorg/db";
```

**跨语言类比**: Rust `[workspace] members` 概念几乎一致；Python 用 `pip install -e` 模拟；C++ CMake `add_subdirectory()` 类似但更复杂。

---

## 5. AsyncLocalStorage 上下文传播

在异步调用链中传递上下文（如 request ID），无需在每个函数显式传参。

```typescript
import { AsyncLocalStorage } from "node:async_hooks";

interface RequestContext {
  requestId: string;
  userId?: string;
}

const als = new AsyncLocalStorage<RequestContext>();

function getRequestId(): string {
  return als.getStore()?.requestId ?? "unknown";
}

// Each request runs in its own async context
function handleRequest(req: Request): Response {
  const ctx = { requestId: crypto.randomUUID() };
  return als.run(ctx, () => {
    processBusinessLogic();
    return new Response("OK");
  });
}

function processBusinessLogic() {
  // Context available without parameter passing — preserved across async boundaries
  console.log(`[${getRequestId()}] Processing...`);
}
```

**跨语言类比**:

| TypeScript | Python | C++ | Rust |
|-----------|--------|-----|------|
| `AsyncLocalStorage` | `contextvars.ContextVar` | `thread_local` | `tokio::task_local!` |
| 绑定异步调用链 | 绑定异步调用链 | 绑定 OS 线程 | 绑定 async task |

C++ `thread_local` 按线程隔离；JS 单线程所以按异步链隔离。Python `contextvars` 最相似。

---

## 6. tsconfig.json 配置

```jsonc
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "target": "ESNext",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "declaration": true,
    "sourceMap": true,
    "outDir": "./dist",
    // Path aliases — avoid deep relative imports
    "baseUrl": ".",
    "paths": { "@/*": ["./src/*"] },
    "types": ["bun-types"]
  },
  "include": ["src/**/*.ts"],
  "exclude": ["node_modules", "dist"]
}
```

```typescript
// Without aliases: import { db } from "../../../config/database.ts";
// With aliases:
import { db } from "@/config/database.ts";
```

**Monorepo project references** — 在子包 tsconfig 中设 `"composite": true`，消费方用 `"references": [{ "path": "../../packages/shared" }]` 实现跨包类型感知构建。

**关键选项速查**:

| 选项 | 作用 | 推荐值 |
|------|------|--------|
| `strict` | 所有严格检查 | `true` |
| `target` / `module` | 输出格式 | `ESNext` |
| `moduleResolution` | 模块解析 | `bundler` |
| `noUncheckedIndexedAccess` | 索引返回 `T \| undefined` | `true` |
| `verbatimModuleSyntax` | 强制 `import type` | `true` |

---

## 推荐资源

- [Bun 官方文档](https://bun.sh/docs) — runtime/bundler/test 一站式参考
- [Node.js ESM 文档](https://nodejs.org/api/esm.html) — ESM 规范细节
- [TypeScript tsconfig 参考](https://www.typescriptlang.org/tsconfig) — 编译选项详解

---

## 检查点

- [ ] 能从零搭建 Bun 项目并直接运行 TypeScript
- [ ] 理解 ESM 静态 vs 动态导入及 tree-shaking 原理
- [ ] 能配置 Bun workspaces 实现 monorepo
- [ ] 理解 AsyncLocalStorage 在异步链中传播上下文
- [ ] 能配置 tsconfig.json（strict、path aliases、project references）

---

## 下一步

→ [Stage 06: Effect 框架](../06-effect-framework/)
