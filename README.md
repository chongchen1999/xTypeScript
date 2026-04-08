# xTypeScript

面向 **C++ / Python 程序员**的 TypeScript 系统学习项目。

不假设你了解 JavaScript 生态，但假设你熟悉：静态类型、指针/引用、RAII、模板/泛型、并发原语。每个知识点都会对应说明"为什么 TS 这样设计"，以及与 C++/Python 的类比。

---

## 学习路线

```
Stage 00 → Stage 01 → Stage 02 → Stage 03 → Stage 04 → Stage 05
TS 基础入门  JS 基础    TS 核心    TS 进阶    异步编程   运行时生态

          → Stage 06 → Stage 07a → Stage 07b → 07c/07d
            Effect     Schema/数据  Server/CLI  前端/测试
```

| 阶段 | 标题                  | 预计时间   | 前置要求            |
|------|-----------------------|-----------|---------------------|
| 00   | TypeScript 基础入门   | 1–2 天    | C++/Python 经验     |
| 01   | JavaScript 基础       | 3–5 天    | Stage 00            |
| 02   | TypeScript 核心       | 3–5 天    | Stage 01            |
| 03   | TypeScript 高级       | 4–6 天    | Stage 02            |
| 04   | 异步编程              | 3–4 天    | Stage 01, 02        |
| 05   | 运行时与生态系统       | 2–3 天    | Stage 01            |
| 06   | Effect 框架           | 7–10 天   | Stage 03, 04        |
| 07a  | Schema 与数据层       | 2–3 天    | Stage 02, 06        |
| 07b  | 服务端与 CLI          | 3–4 天    | Stage 04, 06        |
| 07c  | 前端与 UI             | 4–5 天    | Stage 02, 04        |
| 07d  | 测试与工具链          | 2–3 天    | Stage 05            |

**总计：约 34–50 天**

## 快速上手

### 前置要求

- [Bun](https://bun.sh) ≥ 1.1（安装：`curl -fsSL https://bun.sh/install | bash`）

### 运行示例

```bash
# 克隆后直接运行任意示例，无需 npm install
bun 01-javascript-foundations/examples/01-closures-and-this.ts
bun 06-effect-framework/examples/03-concurrency.ts
bun 07b-server-and-cli/examples/01-hono-server.ts
```

### 做习题

```bash
# 打开习题文件，在 TODO 处填写实现
bun 03-typescript-advanced/exercises/01-type-utilities.ts

# 对照答案
bun 03-typescript-advanced/exercises/01-type-utilities.solution.ts
```

### 启动实战项目

```bash
# CLI Todo 工具
cd projects/01-cli-todo && bun install && bun start -- --help

# Effect REST API
cd projects/02-effect-api && bun install && bun start

# 全栈应用（需两个终端）
cd projects/03-fullstack-app && bun install
# 终端1：cd packages/server && bun dev
# 终端2：cd packages/client && bun dev
```

### 用模板新建项目

```bash
cp -r templates/bun-ts-starter  ~/my-project  && cd ~/my-project && bun install
cp -r templates/hono-api        ~/my-api       && cd ~/my-api    && bun install
cp -r templates/solidjs-app     ~/my-app       && cd ~/my-app    && bun install
```

---

## 项目结构

每个学习模块按 `XX-模块名/` 组织，内部包含：

```
XX-模块名/
├── notes/README.md     — 深度讲义（原理、C++/Python 对比、陷阱）
├── examples/*.ts       — 可运行示例（独立文件，bun 直接执行）
└── exercises/*.ts      — 习题（含 .solution.ts 参考答案）
```

| 模块 | notes | examples | exercises |
|------|-------|----------|-----------|
| [00-basics](00-basics/) | ✅ | 4 files | 6 files |
| [01-javascript-foundations](01-javascript-foundations/) | ✅ | 4 files | 6 files |
| [02-typescript-core](02-typescript-core/) | ✅ | 3 files | 6 files |
| [03-typescript-advanced](03-typescript-advanced/) | ✅ | 3 files | 6 files |
| [04-async-programming](04-async-programming/) | ✅ | 3 files | 6 files |
| [05-runtime-and-ecosystem](05-runtime-and-ecosystem/) | ✅ | 3 files | 6 files |
| [06-effect-framework](06-effect-framework/) | ✅ | 3 files | 6 files |
| [07a-schema-and-data](07a-schema-and-data/) | ✅ | — | 6 files |
| [07b-server-and-cli](07b-server-and-cli/) | ✅ | 3 files | 6 files |
| [07c-frontend-and-ui](07c-frontend-and-ui/) | ✅ | — | 6 files |
| [07d-testing-and-tooling](07d-testing-and-tooling/) | ✅ | — | 6 files |

### projects/ — 综合项目

| 项目 | 适合学完 | 重点 |
|------|----------|------|
| `01-cli-todo` | Stage 01–05 | Yargs、文件 I/O、模块系统 |
| `02-effect-api` | Stage 06 | Effect 服务与层、Drizzle、类型安全 CRUD |
| `03-fullstack-app` | Stage 07 | Bun workspaces、端到端类型共享、SolidJS |

### templates/ — 脚手架

`cp -r` 即用，包含最小化 `package.json`、`tsconfig.json` 和目录结构。

---

## 推荐学习顺序

1. `00-basics/` — 阅读 notes → 跑 examples → 做 exercises
2. `01-javascript-foundations/` — 阅读 notes → 跑 examples → 做 exercises
3. `02-typescript-core/` — 阅读 notes → 跑 examples → 做 exercises
4. `03-typescript-advanced/` — 阅读 notes → 做 exercises（类型体操重点）
5. `04-async-programming/` — 阅读 notes → 跑 examples → 做 exercises
6. `05-runtime-and-ecosystem/` — 阅读 notes → 跑 examples → 做 exercises
7. **实战**：完成 `projects/01-cli-todo`
8. `06-effect-framework/` — 阅读 notes → 跑 examples → 做 exercises
9. **实战**：完成 `projects/02-effect-api`
10. `07a–07d` — 阅读 notes → 跑 `07b/examples` → 做 exercises
11. **实战**：完成 `projects/03-fullstack-app`
