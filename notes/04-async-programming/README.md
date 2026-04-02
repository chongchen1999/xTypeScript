# Stage 04: 异步编程 (Async Programming)

> **前置要求**: [Stage 01: JavaScript 基础](../01-javascript-foundations/), [Stage 02: TypeScript 核心](../02-typescript-core/)
> **预计时间**: 3–4 天

---

## 学习目标

- 深入理解 event loop 与 microtask queue
- 熟练掌握 Promise API 和 async/await 模式
- 理解 generators 和 async generators
- 学习 Web Streams API
- 掌握 AbortController 取消机制

---

## 1. 事件循环 (Event Loop)

JavaScript 是单线程的，通过 event loop 实现并发。执行优先级：**Call Stack > Microtask Queue > Task Queue**。每次 call stack 清空后，engine 先清空所有 microtasks，再取一个 macrotask。

| 特性 | TypeScript/JS | Python | C++ |
|------|--------------|--------|-----|
| 并发模型 | Single-threaded event loop | `asyncio` event loop | `std::async` (multi-threaded) |
| 调度单元 | Microtask / Macrotask | Coroutine / Task | Thread / Future |

```typescript
console.log("1: sync");
setTimeout(() => console.log("2: macrotask"), 0);
Promise.resolve().then(() => console.log("3: microtask"));
queueMicrotask(() => console.log("4: microtask"));
console.log("5: sync");
// Output: 1 -> 5 -> 3 -> 4 -> 2
```

---

## 2. Promise 深入 (Promise Deep Dive)

Promise 三种状态：**Pending → Fulfilled | Rejected**，一旦 settled 不可逆转。

| 方法 | 行为 | 失败处理 |
|------|------|---------|
| `Promise.all` | 全部成功才成功 | 任一失败立即 reject |
| `Promise.allSettled` | 等待全部完成 | 永不 reject，返回每个结果 |
| `Promise.race` | 取最先 settled 的 | 最先的 reject 则 reject |
| `Promise.any` | 取最先 fulfilled 的 | 全部失败才 reject (AggregateError) |

**跨语言对比**: C++ 用 `std::future<T>` / `std::promise<T>`，Python 用 `asyncio.Future`，Rust 用 `impl Future<Output=T>`。
关键区别：Rust 的 Future 是 lazy 的，JS 的 Promise 创建即执行。

```typescript
async function fetchAllSettled(urls: string[]) {
  const results = await Promise.allSettled(urls.map((u) => fetch(u)));

  const succeeded = results
    .filter((r): r is PromiseFulfilledResult<Response> => r.status === "fulfilled")
    .map((r) => r.value);

  const failed = results
    .filter((r): r is PromiseRejectedResult => r.status === "rejected")
    .map((r) => r.reason);

  return { succeeded, failed };
}
```

---

## 3. async/await 模式 (async/await Patterns)

### 顺序 vs 并发

```typescript
// BAD: Sequential — total time = t1 + t2
const a = await fetch("/api/users");
const b = await fetch("/api/posts");

// GOOD: Concurrent — total time = max(t1, t2)
const [a, b] = await Promise.all([fetch("/api/users"), fetch("/api/posts")]);
```

### Retry Pattern

```typescript
async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries = 3,
  baseDelay = 1000,
): Promise<T> {
  let lastError: unknown;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      if (attempt === maxRetries) break;
      // Exponential backoff with jitter
      const delay = baseDelay * 2 ** attempt + Math.random() * 1000;
      await new Promise((r) => setTimeout(r, delay));
    }
  }
  throw lastError;
}
```

### Timeout Pattern

```typescript
async function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  let timeoutId: ReturnType<typeof setTimeout>;
  const timeout = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => reject(new Error("Timed out")), ms);
  });

  try {
    return await Promise.race([promise, timeout]);
  } finally {
    clearTimeout(timeoutId!);
  }
}
```

**Top-level await**: ES2022 起可在 ES modules 中直接使用（需 `"module": "es2022"+`）。

---

## 4. 生成器与异步生成器 (Generators & Async Generators)

Generator 通过 `yield` 实现惰性求值和双向通信。Python 的 generator 语法几乎一致，Rust 通常使用 `Stream` trait 替代。

```typescript
// Two-way communication via yield
function* stateMachine(): Generator<string, void, string> {
  let input = yield "ready";
  while (input !== "quit") {
    input = yield `received: ${input}`;
  }
}

const m = stateMachine();
m.next();            // { value: "ready", done: false }
m.next("hello");     // { value: "received: hello", done: false }
m.next("quit");      // { value: undefined, done: true }
```

### 异步分页请求 (Async Generator)

```typescript
interface Page<T> {
  items: T[];
  nextCursor: string | null;
}

async function* paginatedFetch<T>(baseUrl: string): AsyncGenerator<T[]> {
  let cursor: string | null = null;
  do {
    const url = cursor ? `${baseUrl}?cursor=${cursor}` : baseUrl;
    const page: Page<T> = await (await fetch(url)).json();
    yield page.items;
    cursor = page.nextCursor;
  } while (cursor !== null);
}

// Consume with for-await-of
for await (const batch of paginatedFetch<User>("/api/users")) {
  console.log(`Got ${batch.length} users`);
}
```

---

## 5. Web Streams API

三种流类型：**ReadableStream**（数据源）、**WritableStream**（数据目标）、**TransformStream**（转换层）。

| 特性 | Web Streams | Node.js Streams | Rust tokio |
|------|------------|----------------|------------|
| 背压 | Built-in (pull-based) | Back-pressure events | Poll-based |
| Piping | `pipeThrough()` / `pipeTo()` | `.pipe()` | `StreamExt` combinators |

```typescript
function createJSONLParser<T>(): TransformStream<string, T> {
  let buffer = "";
  return new TransformStream<string, T>({
    transform(chunk, controller) {
      buffer += chunk;
      const lines = buffer.split("\n");
      buffer = lines.pop()!;
      for (const line of lines) {
        if (line.trim()) controller.enqueue(JSON.parse(line) as T);
      }
    },
    flush(controller) {
      if (buffer.trim()) controller.enqueue(JSON.parse(buffer) as T);
    },
  });
}

// Pipeline: fetch -> decode -> parse -> filter -> collect
const response = await fetch("/api/logs");
const errors: LogEntry[] = [];

await response.body!
  .pipeThrough(new TextDecoderStream())
  .pipeThrough(createJSONLParser<LogEntry>())
  .pipeTo(new WritableStream({
    write(entry) {
      if (entry.level === "error") errors.push(entry);
    },
  }));
```

---

## 6. 取消机制 (Cancellation with AbortController)

`AbortController` 是协作式取消机制，通过 `AbortSignal` 通知异步操作终止。

| 特性 | TypeScript | C++ (C++20) | Python |
|------|-----------|-------------|--------|
| 机制 | `AbortController` | `std::stop_token` | `asyncio.Task.cancel()` |
| 方式 | 协作式 | 协作式 | Raises `CancelledError` |

```typescript
function fetchWithTimeout(
  url: string,
  timeoutMs: number,
  externalSignal?: AbortSignal,
): Promise<Response> {
  const controller = new AbortController();

  externalSignal?.addEventListener("abort", () =>
    controller.abort(externalSignal.reason)
  );

  const timeoutId = setTimeout(
    () => controller.abort(new Error(`Timeout after ${timeoutMs}ms`)),
    timeoutMs,
  );

  return fetch(url, { signal: controller.signal })
    .finally(() => clearTimeout(timeoutId));
}

// ES2024+: built-in helpers
await fetch(url, { signal: AbortSignal.timeout(5000) });
await fetch(url, { signal: AbortSignal.any([ctrl.signal, AbortSignal.timeout(10000)]) });
```

---

## 推荐资源

- [JavaScript.info: Promises, async/await](https://javascript.info/async)
- [MDN: Using Promises](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Using_promises)
- [MDN: Streams API](https://developer.mozilla.org/en-US/docs/Web/API/Streams_API)
- [Jake Archibald: Tasks, microtasks, queues and schedules](https://jakearchibald.com/2015/tasks-microtasks-queues-and-schedules/)

---

## 检查点

- [ ] 能解释 event loop 的执行顺序（sync → microtask → macrotask）
- [ ] 清楚 `Promise.all` 与 `Promise.allSettled` 的区别
- [ ] 能实现 retry / timeout 等 async/await 模式
- [ ] 能创建和消费 async generator（如分页请求）
- [ ] 理解 `ReadableStream` / `WritableStream` / `TransformStream`
- [ ] 能使用 `AbortController` 实现请求取消

---

## 下一步

→ [Stage 05: 运行时与生态系统](../05-runtime-and-ecosystem/)
