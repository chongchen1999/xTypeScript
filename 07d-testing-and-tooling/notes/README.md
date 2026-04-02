# Stage 07d: 测试与工具链

> **前置要求**: [Stage 05: 运行时与生态系统](../../05-runtime-and-ecosystem/notes/)
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

### 1.3 覆盖率配置 (Coverage Configuration)

Vitest 内置 `v8`（快速，基于 V8 引擎）和 `istanbul`（更精确）两种 coverage provider：

```typescript
// vitest.config.ts
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    coverage: {
      provider: "v8",                          // "v8" (fast) or "istanbul" (precise)
      reporter: ["text", "html", "lcov"],      // terminal + browser + CI integration
      include: ["src/**/*.ts"],                // only measure app code
      exclude: ["**/*.test.ts", "**/*.d.ts"],  // skip tests and declarations
      thresholds: {
        branches: 80,
        functions: 80,
        lines: 80,
        statements: 80,
      },
    },
  },
});
```

```bash
vitest run --coverage              # generate report
vitest --coverage --watch          # watch mode with live coverage
```

**⚠️ 常见陷阱**：
- `v8` provider 对 async 代码可能少报分支覆盖；切换 `istanbul` 更准确
- 100% 覆盖率不等于无 bug — 关注 branch coverage 比 line coverage 更有价值
- 覆盖率文件（`coverage/`）应加入 `.gitignore`

### 1.4 测试 Effect 代码

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

Tree-sitter 是增量解析器框架，将源码解析为**具体语法树 (CST)**。
通过 `web-tree-sitter` WASM binding 可在 Node / 浏览器中使用。

### CST vs AST

| 特性 | CST (Concrete Syntax Tree) | AST (Abstract Syntax Tree) |
|------|---------------------------|---------------------------|
| 保留内容 | 所有 token（括号、逗号、空白） | 仅语义节点 |
| 用途 | 精确代码转换、格式化、高亮 | 编译、静态分析 |
| 代表工具 | Tree-sitter | TypeScript Compiler API、Babel |
| 增量更新 | ✅ 只重解析修改部分 | ❌ 通常全量重解析 |

**跨语言类比**: Python `ast` 模块产出 AST；Rust `syn` 产出 AST；C++ Clang 有完整的 CST（`-ast-dump`）。Tree-sitter 的优势在于**语言无关** + **增量解析**。

### 6.1 基础：解析与遍历

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

### 6.2 S-expression Query 语言

Tree-sitter 提供类似 CSS 选择器的 **S-expression query**，无需手动递归遍历：

```typescript
// Query: find all exported function names and their parameter lists
const query = Lang.query(`
  (export_statement
    declaration: (function_declaration
      name: (identifier) @func_name
      parameters: (formal_parameters) @params))
`);

const matches = query.matches(tree.rootNode);
for (const match of matches) {
  const name = match.captures.find((c) => c.name === "func_name")!;
  const params = match.captures.find((c) => c.name === "params")!;
  console.log(`${name.node.text}${params.node.text}`);
}
// For: export function greet(name: string) { ... }
// Output: "greet(name: string)"
```

**Query 语法要点**：
- `(node_type)` — 匹配节点类型
- `@name` — 捕获节点，命名为 `name`
- `field: (...)` — 匹配特定 field（如 `name:`、`parameters:`）
- `(node_type (child_type) @cap)` — 嵌套匹配

### 6.3 增量解析

编辑器场景下，Tree-sitter 只重解析修改区域，其余节点复用：

```typescript
// Initial parse
let tree = parser.parse(sourceCode);

// User edits line 5, col 10-15
tree.edit({
  startIndex: editStart,
  oldEndIndex: editOldEnd,
  newEndIndex: editNewEnd,
  startPosition: { row: 4, column: 10 },
  oldEndPosition: { row: 4, column: 15 },
  newEndPosition: { row: 4, column: 18 },
});

// Re-parse reuses unchanged nodes — O(log n) for small edits
tree = parser.parse(newSourceCode, tree);
```

**实际应用场景**: IDE 语法高亮、代码折叠、symbol outline、自动 rename、lint 规则

---

## ⚠️ 常见陷阱

### Vitest

1. **Mock 泄漏**: `vi.spyOn()` / `vi.fn()` 在测试间共享状态。忘记 `vi.restoreAllMocks()` 或 `afterEach(() => vi.restoreAllMocks())` 会导致测试间污染。

2. **Snapshot 脆弱性**: `toMatchSnapshot()` 对比整个对象/字符串——包含时间戳、随机 ID 的输出会导致 snapshot 每次都不同。用 `expect.any(String)` 或 `toMatchInlineSnapshot` 精确匹配关键字段。

3. **异步测试忘记 `await`**: `it("...", async () => { expect(fn()).resolves.toBe(...) })` — 若不 `await expect(...)`，Promise rejection 会被吞掉，测试假通过。

### Playwright

4. **隐式等待假设**: Playwright auto-waits for elements，但不等待 **client-side navigation**。SPA 中页面跳转后需 `await page.waitForURL("/target")` 而非假设立即可见。

5. **Network interception 顺序**: `page.route()` 按注册顺序匹配。宽泛的通配符 `**/*` 会拦截所有请求，包括资源文件。

### Turborepo

6. **缓存失效**: 修改了环境变量但忘记在 `turbo.json` 的 `globalEnv` 中声明——Turborepo 用了旧缓存的构建产物。`.env` 文件变化也需要配置 `globalDotEnv`。

### Remeda

7. **Data-first vs data-last**: `R.filter(arr, fn)` (data-first) 和 `R.filter(fn)` (data-last, for pipe) 是不同的重载。在 `R.pipe()` 中误用 data-first 会产生类型错误。

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

← [返回总索引](../../README.md)
