# xTypeScript

面向 **C++ / Python 程序员**的 TypeScript 系统学习项目。

不假设你了解 JavaScript 生态，但假设你熟悉：静态类型、指针/引用、RAII、模板/泛型、并发原语。每个知识点都会对应说明"为什么 TS 这样设计"，以及与 C++/Python 的类比。

---

## 学习路线

```
Stage 01 → Stage 02 → Stage 03 → Stage 04 → Stage 05
JS 基础    TS 核心    TS 进阶    异步编程   运行时生态

        → Stage 06 → Stage 07a → Stage 07b → 07c/07d
          Effect     Schema/数据  Server/CLI  前端/测试
```

完整路线图及各阶段说明见 [`notes/README.md`](notes/README.md)。

---

## 目录结构

```
xTypeScript/
├── notes/                    # 各 Stage 深度讲义
│   ├── README.md             # 总索引与学习路线图
│   ├── 01-javascript-foundations/README.md
│   ├── 02-typescript-core/README.md
│   ├── 03-typescript-advanced/README.md
│   ├── 04-async-programming/README.md
│   ├── 05-runtime-and-ecosystem/README.md
│   ├── 06-effect-framework/README.md
│   ├── 07a-schema-and-data/README.md
│   ├── 07b-server-and-cli/README.md
│   ├── 07c-frontend-and-ui/README.md
│   └── 07d-testing-and-tooling/README.md
│
├── examples/                 # 可直接运行的示例代码（bun run <file>）
│   ├── 01-javascript-foundations/
│   ├── 02-typescript-core/
│   ├── 03-typescript-advanced/
│   ├── 04-async-programming/
│   ├── 05-runtime-and-ecosystem/
│   ├── 06-effect-framework/
│   └── 07b-server-and-cli/
│
├── exercises/                # 习题（TODO 形式）+ 参考答案（.solution.ts）
│   ├── 01-javascript-foundations/
│   ├── 02-typescript-core/
│   ├── 03-typescript-advanced/
│   ├── 04-async-programming/
│   └── 06-effect-framework/
│
├── projects/                 # 阶段性综合实战项目
│   ├── 01-cli-todo/          # Bun + Yargs CLI 工具
│   ├── 02-effect-api/        # Effect + Hono + Drizzle REST API
│   └── 03-fullstack-app/     # SolidJS + Hono + SQLite 全栈应用
│
└── templates/                # 可直接 cp 使用的脚手架
    ├── bun-ts-starter/       # 最小化 Bun + TypeScript 项目
    ├── hono-api/             # Hono + Effect + Zod API 服务
    └── solidjs-app/          # SolidJS + TanStack Router 前端
```

---

## 快速上手

### 前置要求

- [Bun](https://bun.sh) ≥ 1.1（安装：`curl -fsSL https://bun.sh/install | bash`）

### 运行示例

```bash
# 克隆后直接运行任意示例，无需 npm install
bun examples/01-javascript-foundations/01-closures.ts
bun examples/06-effect-framework/03-concurrency.ts
bun examples/07b-server-and-cli/01-hono-server.ts
```

### 做习题

```bash
# 打开习题文件，在 TODO 处填写实现
bun exercises/03-typescript-advanced/01-type-utilities.ts

# 对照答案
bun exercises/03-typescript-advanced/01-type-utilities.solution.ts
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

## 各模块速览

### notes/ — 深度讲义

每个 Stage 的 `README.md` 包含：
- 底层原理（V8 引擎、TS 类型系统工作方式）
- C++ / Python 对比，解释设计决策
- 常见陷阱与修正示例
- 关键要点总结

### examples/ — 可运行示例

按知识点拆分的独立 `.ts` 文件，注释只保留关键说明。`07c-frontend-and-ui` 不含 examples（浏览器环境）。

### exercises/ — 习题

每道题一个 `.ts` 文件（`// TODO` 注释），配同名 `.solution.ts` 参考答案。难度从基础工具函数到 Effect 服务架构。

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

1. 阅读 `notes/01` → 跑 `examples/01` → 做 `exercises/01`
2. 阅读 `notes/02` → 跑 `examples/02` → 做 `exercises/02`
3. 阅读 `notes/03` → 做 `exercises/03`（类型体操重点）
4. 阅读 `notes/04` → 跑 `examples/04` → 做 `exercises/04`
5. 阅读 `notes/05` → 跑 `examples/05`
6. **实战**：完成 `projects/01-cli-todo`
7. 阅读 `notes/06` → 跑 `examples/06` → 做 `exercises/06`
8. **实战**：完成 `projects/02-effect-api`
9. 阅读 `notes/07a–07d` → 跑 `examples/07b`
10. **实战**：完成 `projects/03-fullstack-app`
