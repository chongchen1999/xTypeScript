# Stage 07d: 测试与工具链

> **前置要求**: [Stage 05: 运行时与生态系统](../05-runtime-and-ecosystem/)
> **预计时间**: 2–3 天

---

## 学习目标

- 掌握 Vitest 单元测试
- 学会 Playwright E2E 测试
- 理解 Turborepo 任务管道
- 了解 Bun workspace monorepo 配置
- 学习 Remeda 函数式工具库
- 了解 Tree-sitter 语法解析

---

## 1. Vitest: 单元测试

Vitest 是 Vite 生态的原生测试框架，零配置即可运行 TypeScript 测试。

| TypeScript (Vitest)   | Python (pytest)        | Rust              | C++ (Google Test)  |
| --------------------- | ---------------------- | ----------------- | ------------------ |
| `describe` + `it`     | `class` + `def test_`  | `#[test] fn`      | `TEST()` macro     |
| `expect(x).toBe(y)`  | `assert x == y`        | `assert_eq!(x,y)` | `EXPECT_EQ(x, y)`  |

### 1.1 基础用法

```typescript
import { describe, it, expect, beforeEach } from "vitest";

interface User { name: string; age: number }

const isAdult = (u: User) => u.age >= 18;

describe("isAdult", () => {
  let user: User;
  beforeEach(() => { user = { name: "Alice", age: 20 }; });

  it("returns true for age >= 18", () => {
    expect(isAdult(user)).toBe(true);
  });
  it("returns false for age < 18", () => {
    user.age = 16;
    expect(isAdult(user)).toBe(false);
  });
});
```

### 1.2 Mocking 与 Snapshot

`vi.fn()` 创建 mock 函数，`vi.spyOn()` 监视调用，`toMatchSnapshot()` 自动对比快照。

```typescript
import { describe, it, expect, vi } from "vitest";

describe("fetchPosts", () => {
  it("calls API and returns data", async () => {
    const mockData = { data: [{ id: 1, title: "Hello" }] };
    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      json: () => Promise.resolve(mockData),
    } as Response);

    const res = await fetch("/api/posts");
    expect(await res.json()).toEqual(mockData);
    expect(fetch).toHaveBeenCalledWith("/api/posts");
    vi.restoreAllMocks();
  });
});
```

### 1.3 测试 Effect 代码

用 `Layer` 注入测试依赖，用 `Effect.flip` 验证错误路径。

```typescript
import { describe, it, expect } from "vitest";
import { Effect, Layer, Context } from "effect";

class UserRepo extends Context.Tag("UserRepo")<
  UserRepo,
  { readonly findById: (id: number) => Effect.Effect<string, Error> }
>() {}

const getUsername = (id: number) =>
  Effect.gen(function* () {
    const repo = yield* UserRepo;
    return yield* repo.findById(id);
  });

const TestRepo = Layer.succeed(UserRepo, {
  findById: (id) =>
    id === 1 ? Effect.succeed("Alice") : Effect.fail(new Error("Not found")),
});

describe("getUsername", () => {
  it("resolves for valid id", async () => {
    const result = await Effect.runPromise(
      getUsername(1).pipe(Effect.provide(TestRepo)),
    );
    expect(result).toBe("Alice");
  });
  it("fails for invalid id", async () => {
    const error = await Effect.runPromise(
      getUsername(999).pipe(Effect.provide(TestRepo), Effect.flip),
    );
    expect(error.message).toBe("Not found");
  });
});
```

---

## 2. Playwright: E2E 测试

Playwright 支持 Chromium / Firefox / WebKit，内置自动等待和网络拦截。

```typescript
import { test, expect } from "@playwright/test";

test("homepage loads", async ({ page }) => {
  await page.goto("https://example.com");
  await expect(page).toHaveTitle(/Example Domain/);
});

test("form submission", async ({ page }) => {
  await page.goto("/login");
  await page.getByLabel("Email").fill("user@test.com");
  await page.getByLabel("Password").fill("secret");
  await page.getByRole("button", { name: "Sign In" }).click();
  await expect(page.getByText("Welcome back")).toBeVisible();
  await page.screenshot({ path: "after-login.png" });
});
```

可用 Page Object Model 封装页面交互，提高可维护性。

---

## 3. Turborepo: 任务管道

Turborepo 感知 monorepo 包依赖关系，智能调度并行任务并缓存结果。
类似 `make`（依赖图）、Rust cargo workspace builds、Python tox/nox。

```jsonc
// turbo.json — task pipeline definition
{
  "$schema": "https://turbo.build/schema.json",
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**"]
    },
    "test": {
      "dependsOn": ["build"],
      "outputs": []
    },
    "dev": {
      "cache": false,
      "persistent": true
    }
  }
}
```

```bash
turbo run build                        # build all packages (topological)
turbo run test --filter=@myorg/api     # test single package
turbo watch dev                        # watch mode
```

---

## 4. Bun Workspaces: Monorepo 配置

Bun 原生支持 workspaces，兼容 npm/yarn 协议，内部包引用 `workspace:*` 自动 symlink。

```jsonc
// Root package.json
{ "private": true, "workspaces": ["packages/*", "apps/*"] }

// apps/api/package.json
{ "dependencies": { "@myorg/shared": "workspace:*", "hono": "^4.0.0" } }
```

```bash
bun install                            # install all workspace deps
bun run --filter '@myorg/api' dev      # run script in specific package
```

---

## 5. Remeda: 函数式工具库

Remeda 是类型安全的函数式工具库，支持 data-first 和 data-last 两种调用风格。
类比：Lodash（但 tree-shakeable）、Python itertools、Rust Iterator trait。

```typescript
import * as R from "remeda";

interface Order {
  id: number; customer: string; amount: number;
  status: "pending" | "shipped" | "delivered";
}

const orders: Order[] = [
  { id: 1, customer: "Alice", amount: 250, status: "shipped" },
  { id: 2, customer: "Bob",   amount: 80,  status: "pending" },
  { id: 3, customer: "Alice", amount: 120, status: "delivered" },
  { id: 4, customer: "Bob",   amount: 300, status: "shipped" },
];

const summary = R.pipe(
  orders,
  R.filter((o) => o.status !== "pending"),
  R.groupBy((o) => o.customer),
  R.mapValues((group) => ({
    count: group.length,
    total: R.sumBy(group, (o) => o.amount),
  })),
);
// => { Alice: { count: 2, total: 370 }, Bob: { count: 1, total: 300 } }

const customers = R.pipe(orders, R.map((o) => o.customer), R.unique());
```

---

## 6. Tree-sitter: 语法解析

Tree-sitter 是增量解析器框架，将源码解析为具体语法树 (CST)。
通过 `web-tree-sitter` WASM binding 可在 Node / 浏览器中使用。

```typescript
import Parser from "web-tree-sitter";

async function parseAndExtractFunctions(code: string) {
  await Parser.init();
  const parser = new Parser();
  const Lang = await Parser.Language.load("tree-sitter-typescript.wasm");
  parser.setLanguage(Lang);

  const tree = parser.parse(code);

  // Collect all function declaration names
  const names: string[] = [];
  const walk = (n: Parser.SyntaxNode) => {
    if (n.type === "function_declaration") {
      const name = n.childForFieldName("name");
      if (name) names.push(name.text);
    }
    for (const child of n.children) walk(child);
  };
  walk(tree.rootNode);
  return names;
}

const fns = await parseAndExtractFunctions(`
  function greet(name: string) { return "hi " + name; }
  function add(a: number, b: number) { return a + b; }
`);
// => ["greet", "add"]
```

---

## 推荐资源

| 资源             | 链接                            |
| ---------------- | ------------------------------- |
| Vitest 文档      | https://vitest.dev              |
| Playwright 文档  | https://playwright.dev          |
| Turborepo 文档   | https://turbo.build             |
| Remeda 文档      | https://remedajs.com            |
| Tree-sitter 文档 | https://tree-sitter.github.io   |

---

## 检查点

- [ ] 能用 Vitest 编写含 mock 的单元测试
- [ ] 能用 test layers 测试 Effect 服务
- [ ] 能用 Playwright 编写 E2E 测试
- [ ] 能配置 Turborepo 任务管道
- [ ] 能配置 Bun workspaces 搭建 monorepo
- [ ] 能用 Remeda `pipe` 进行数据转换
- [ ] 理解 Tree-sitter AST 基础

---

## 完成！

恭喜！你已完成 TypeScript 学习路线图的所有阶段。

← [返回总索引](../README.md)
