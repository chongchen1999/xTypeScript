# Stage 07c: 前端与 UI

> **前置要求**: [Stage 02: TypeScript 核心](../../02-typescript-core/notes/), [Stage 04: 异步编程](../../04-async-programming/notes/)
> **预计时间**: 4–5 天

---

## 学习目标

- 掌握 SolidJS 响应式原语
- 理解 TanStack Router 和 Query
- 学会 Tailwind CSS 原子化样式
- 了解 Tauri 桌面集成（TS 侧）

---

## 一、SolidJS: 细粒度响应式框架

SolidJS 将 JSX 直接编译为真实 DOM 操作（无 Virtual DOM），实现节点级精确更新。

### 1.1 响应式原语 (Reactive Primitives)

| 原语 | 作用 | React 对应 | Vue 对应 |
|------|------|-----------|----------|
| `createSignal` | 响应式状态 | `useState` | `ref` |
| `createMemo` | 派生计算 | `useMemo` | `computed` |
| `createEffect` | 副作用 | `useEffect` | `watch` |

**关键区别**: React hook 每次 render 重新执行；Solid 原语只运行一次，通过 signal 订阅驱动更新。

```tsx
import { createSignal, createMemo, createEffect } from "solid-js";

function Counter() {
  const [count, setCount] = createSignal(0);
  const doubled = createMemo(() => count() * 2);

  // Runs whenever count changes — no dependency array needed
  createEffect(() => {
    console.log(`Count: ${count()}, doubled: ${doubled()}`);
  });

  return (
    <div>
      <p>Count: {count()} | Doubled: {doubled()}</p>
      <button onClick={() => setCount((c) => c + 1)}>+1</button>
    </div>
  );
}
```

### 1.2 Store 与深度响应 (Stores & Deep Reactivity)

嵌套对象用 `createStore`，支持路径更新和 `produce` 风格 mutation：

```tsx
import { createStore, produce } from "solid-js/store";

interface Todo { id: number; text: string; done: boolean }

function TodoApp() {
  const [state, setState] = createStore({ todos: [] as Todo[] });

  const addTodo = (text: string) => {
    setState("todos", (prev) => [...prev, { id: Date.now(), text, done: false }]);
  };

  // produce — immer-style mutations
  const toggleTodo = (id: number) => {
    setState(produce((draft) => {
      const todo = draft.todos.find((t) => t.id === id);
      if (todo) todo.done = !todo.done;
    }));
  };

  return (
    <ul>
      <For each={state.todos}>
        {(todo) => <li onClick={() => toggleTodo(todo.id)}>{todo.text}</li>}
      </For>
    </ul>
  );
}
```

### 1.3 组件模式 (Component Patterns)

```tsx
import { Show, For, Switch, Match, createResource } from "solid-js";
import type { Component } from "solid-js";

interface User { id: number; name: string; role: "admin" | "user" }

const UserList: Component = () => {
  // createResource — built-in async data fetching
  const [users, { refetch }] = createResource<User[]>(
    async () => (await fetch("/api/users")).json()
  );

  return (
    <div>
      <button onClick={refetch}>Refresh</button>
      <Show when={!users.loading} fallback={<p>Loading...</p>}>
        <For each={users()}>
          {(user) => (
            <div>
              {user.name}
              <Switch>
                <Match when={user.role === "admin"}><span>Admin</span></Match>
                <Match when={user.role === "user"}><span>User</span></Match>
              </Switch>
            </div>
          )}
        </For>
      </Show>
    </div>
  );
};
```

### 1.4 与 React 的关键区别

| 特性 | React | SolidJS |
|------|-------|---------|
| 渲染机制 | Virtual DOM diffing | 编译为直接 DOM 操作 |
| 组件执行 | 每次状态变化重新执行 | 只执行一次 |
| Props 解构 | 安全 | **破坏响应性** |

```tsx
// ⚠️ Destructuring breaks reactivity in Solid
const Bad: Component<{ name: string }> = ({ name }) => <p>{name}</p>;

// ✅ Access props directly
const Good: Component<{ name: string }> = (props) => <p>{props.name}</p>;
```

---

## 二、TanStack: 路由与数据查询

### 2.1 TanStack Router — 类型安全路由

端到端类型安全：从路由定义到参数读取全链路推导。

```tsx
import { createRouter, createRoute, createRootRoute } from "@tanstack/solid-router";
import { z } from "zod";

const rootRoute = createRootRoute({ component: () => <Outlet /> });

const userRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "users/$userId",
  validateSearch: z.object({
    tab: z.enum(["profile", "posts"]).optional(),
  }),
  loader: async ({ params }) => fetchUser(params.userId),
  component: UserPage,
});

function UserPage() {
  const params = userRoute.useParams();   // { userId: string }
  const search = userRoute.useSearch();    // { tab?: "profile" | "posts" }
  const data = userRoute.useLoaderData();
  return <div>{data.name}'s {search.tab ?? "profile"}</div>;
}

const router = createRouter({ routeTree: rootRoute.addChildren([userRoute]) });
```

### 2.2 TanStack Query — 服务端状态管理

将服务端数据视为缓存，自动处理 loading / error / refetch / invalidation：

```tsx
import { createQuery, createMutation, useQueryClient } from "@tanstack/solid-query";

interface Post { id: number; title: string; body: string }

function PostList() {
  const qc = useQueryClient();

  const posts = createQuery(() => ({
    queryKey: ["posts"],
    queryFn: async (): Promise<Post[]> => (await fetch("/api/posts")).json(),
    staleTime: 5 * 60_000,
  }));

  const addPost = createMutation(() => ({
    mutationFn: async (p: Omit<Post, "id">) => {
      return (await fetch("/api/posts", { method: "POST", body: JSON.stringify(p) })).json();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["posts"] }),
  }));

  return (
    <Show when={!posts.isLoading} fallback={<p>Loading...</p>}>
      <For each={posts.data}>{(p) => <article>{p.title}</article>}</For>
      <button onClick={() => addPost.mutate({ title: "New", body: "..." })}>Add</button>
    </Show>
  );
}
```

---

## 三、Tailwind CSS: 原子化 CSS

用 utility class 组合样式，减少命名负担和冲突。

### 3.1 响应式卡片示例

```tsx
function FeatureCard(props: { title: string; desc: string }) {
  return (
    <div class="flex flex-col gap-4 p-6 rounded-2xl w-full sm:w-80 lg:w-96
                bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700
                hover:shadow-lg hover:-translate-y-1 transition-all duration-200">
      <h3 class="text-lg font-semibold text-zinc-900 dark:text-zinc-100">{props.title}</h3>
      <p class="text-sm text-zinc-600 dark:text-zinc-400">{props.desc}</p>
    </div>
  );
}
```

### 3.2 条件类名与布局

```tsx
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// Merge Tailwind classes without conflicts
const cn = (...inputs: (string | undefined | false)[]) => twMerge(clsx(inputs));

function Button(props: { variant: "primary" | "ghost"; disabled?: boolean; children: any }) {
  return (
    <button
      class={cn(
        "px-4 py-2 rounded-lg font-medium transition-colors",
        props.variant === "primary" && "bg-blue-600 text-white hover:bg-blue-700",
        props.variant === "ghost" && "bg-transparent hover:bg-zinc-100",
        props.disabled && "opacity-50 cursor-not-allowed"
      )}
      disabled={props.disabled}
    >
      {props.children}
    </button>
  );
}
```

```html
<!-- Responsive grid -->
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">...</div>
```

---

## 四、Tauri: 桌面应用集成

Rust 后端 + 系统 WebView，包体 < 10 MB（Electron > 100 MB）。

| 特性 | Tauri | Electron |
|------|-------|----------|
| 后端 | Rust | Node.js |
| 渲染 | 系统 WebView | 内置 Chromium |
| 包体 | ~5–10 MB | ~100+ MB |
| 安全 | 最小权限 | 完全 Node 访问 |

### 4.1 IPC 调用 Rust 命令

```tsx
import { invoke } from "@tauri-apps/api/core";
import { open } from "@tauri-apps/plugin-dialog";
import { createSignal } from "solid-js";

interface FileStats { lines: number; words: number; bytes: number }

function FileAnalyzer() {
  const [stats, setStats] = createSignal<FileStats | null>(null);

  const analyze = async () => {
    const path = await open({ filters: [{ name: "Text", extensions: ["txt", "md"] }] });
    if (!path) return;
    // invoke calls a Rust #[tauri::command] via IPC
    setStats(await invoke<FileStats>("analyze_file", { path }));
  };

  return (
    <div>
      <button onClick={analyze}>Open File</button>
      <Show when={stats()}>
        {(s) => <p>Lines: {s().lines} | Words: {s().words}</p>}
      </Show>
    </div>
  );
}
```

### 4.2 事件系统 (Event System)

```tsx
import { listen, emit } from "@tauri-apps/api/event";
import { onCleanup, createSignal } from "solid-js";

function ProgressTracker() {
  const [progress, setProgress] = createSignal(0);

  const unlisten = listen<{ percent: number }>("download-progress", (e) => {
    setProgress(e.payload.percent);
  });

  onCleanup(async () => (await unlisten)());

  return (
    <div>
      <button onClick={() => emit("start-download", { url: "https://example.com/file.zip" })}>
        Download
      </button>
      <div class="w-full bg-zinc-200 rounded-full h-2">
        <div class="bg-blue-600 h-2 rounded-full transition-all" style={{ width: `${progress()}%` }} />
      </div>
    </div>
  );
}
```

---

## 推荐资源

| 资源 | 链接 |
|------|------|
| SolidJS 文档 | [solidjs.com](https://www.solidjs.com/) |
| TanStack Router / Query | [tanstack.com](https://tanstack.com/) |
| Tailwind CSS | [tailwindcss.com](https://tailwindcss.com/) |
| Tauri 文档 | [tauri.app](https://tauri.app/) |

---

## 检查点

- [ ] 能用 SolidJS signal 和 store 构建响应式 UI
- [ ] 理解 Solid 组件不重渲染的原因
- [ ] 能用 TanStack Router 配置类型安全路由
- [ ] 能用 Tailwind 实现响应式布局和暗色模式
- [ ] 理解 Tauri 的 IPC 模型和事件系统

---

## 下一步

→ 继续其他 Stage 07 模块：
- [Stage 07a: Schema 与数据层](../../07a-schema-and-data/notes/)
- [Stage 07b: 服务端与 CLI](../../07b-server-and-cli/notes/)
- [Stage 07d: 测试与工具链](../../07d-testing-and-tooling/notes/)
