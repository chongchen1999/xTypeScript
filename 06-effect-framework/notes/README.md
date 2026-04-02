# Stage 06: Effect 框架

> **前置要求**: [Stage 03: TypeScript 高级](../../03-typescript-advanced/notes/), [Stage 04: 异步编程](../../04-async-programming/notes/)
> **预计时间**: 7–10 天
> **难度**: ⭐⭐⭐⭐⭐ — 整个路线中最核心的阶段

---

## 学习目标

- 理解 Effect 核心类型 `Effect<A, E, R>`，掌握 `pipe`/`flow` 组合与 `Effect.gen` 生成器模式
- 掌握 Services + Layers 依赖注入、tagged error handling、Cause 追踪
- 学习并发原语 (Fiber, Deferred, Queue, Ref)、Stream/Sink、资源管理

---

## 跨语言对比总览

| 概念 | Effect (TS) | Rust | C++ | Python |
|------|------------|------|-----|--------|
| 效果类型 | `Effect<A,E,R>` | `Result<T,E>` (eager) | — | — |
| 错误类型化 | `E` parameter | `Error` trait | `std::exception` | Exception hierarchy |
| 依赖注入 | `R` + Layer | trait objects | DI frameworks | dependency-injector |
| 资源管理 | `acquireRelease` | RAII / `Drop` | RAII | `with` statement |
| 并发 | Fiber + Queue | tokio::spawn + channels | std::thread + future | asyncio.Task + Queue |

---

## 1. Effect 核心概念 (Core Concepts)

Effect 是 TypeScript 的函数式效果系统——先 **描述** 再 **执行**，类似 Haskell IO monad。

```
Effect<A, E, R>
         │  │  └── R: Requirements (dependencies needed)
         │  └───── E: Error (known failure types)
         └──────── A: Success (result type)
```

与 Rust `Result<T,E>` 的区别：Result 是 eager 且只有两个参数；Effect 是 lazy 且多了 `R` 依赖参数。

```typescript
import { Effect } from "effect";

const succeed = Effect.succeed(42);           // Effect<number, never, never>
const fail = Effect.fail("oops");             // Effect<never, string, never>
const lazy = Effect.sync(() => Date.now());   // Effect<number, never, never>

const fetchEffect = Effect.tryPromise({
  try: () => fetch("https://api.example.com/data"),
  catch: (error) => new Error(`Fetch failed: ${error}`),
}); // Effect<Response, Error, never>

// Execution happens at the boundary
const value = Effect.runSync(Effect.succeed(42));
const result = await Effect.runPromise(fetchEffect);
```

---

## 2. 管道与组合 (Pipe & Composition)

```typescript
import { Effect, pipe, flow } from "effect";

const program = pipe(
  Effect.succeed(10),
  Effect.map((n) => n * 2),
  Effect.flatMap((n) =>
    n > 5 ? Effect.succeed(n) : Effect.fail("too small" as const)
  ),
  Effect.tap((n) => Effect.log(`Value: ${n}`)) // side-effect, value unchanged
);
// Effect<number, "too small", never>

// flow: compose functions (like pipe but returns a function)
const transform = flow(
  (n: number) => n * 2,
  (n) => `Value: ${n}`
);
// Rust equivalent: .map(|n| n * 2).and_then(|n| if n > 5 { Ok(n) } else { Err(...) })
```

---

## 3. 生成器模式 (Generator Pattern — Effect.gen)

`Effect.gen` 用 generator 语法实现命令式风格，`yield*` 遇到错误会短路——类似 Rust 的 `?` 操作符。

```typescript
import { Effect } from "effect";

const parseNumber = (s: string) =>
  isNaN(Number(s)) ? Effect.fail("not a number" as const) : Effect.succeed(Number(s));

const divide = (a: number, b: number) =>
  b === 0 ? Effect.fail("division by zero" as const) : Effect.succeed(a / b);

const program = Effect.gen(function* () {
  const a = yield* parseNumber("10");   // short-circuits on error
  const b = yield* parseNumber("2");
  const result = yield* divide(a, b);
  return result;
});
// Effect<number, "not a number" | "division by zero", never>

// Rust equivalent:
// fn program() -> Result<f64, MathError> {
//     let a = parse_number("10")?;
//     let b = parse_number("2")?;
//     Ok(divide(a, b)?)
// }
```

---

## 4. 错误处理 (Error Handling)

### Tagged Errors + catchTag

```typescript
import { Effect, Data } from "effect";

class UserNotFound extends Data.TaggedError("UserNotFound")<{
  readonly userId: number;
}> {}

class PermissionDenied extends Data.TaggedError("PermissionDenied")<{
  readonly action: string;
}> {}

class DatabaseError extends Data.TaggedError("DatabaseError")<{
  readonly cause: unknown;
}> {}

const getUser = (id: number): Effect.Effect<string, UserNotFound | DatabaseError> =>
  id === 1 ? Effect.succeed("Alice") : Effect.fail(new UserNotFound({ userId: id }));

const program = Effect.gen(function* () {
  const user = yield* getUser(2);
  return user;
}).pipe(
  Effect.catchTag("UserNotFound", (e) =>
    Effect.succeed(`Fallback (user ${e.userId} not found)`)
  ),
  // UserNotFound removed from error type; DatabaseError remains
  Effect.catchTags({
    DatabaseError: (e) => Effect.succeed(`DB error: ${e.cause}`),
  })
);
// Effect<string, never, never>
```

### Expected Errors vs Defects

```typescript
// Expected errors: tracked in E type parameter
const expected = Effect.fail(new UserNotFound({ userId: 1 }));

// Defects: unexpected, NOT tracked in E (like Rust panic)
const defect = Effect.die("catastrophic failure");

// Cause types: Cause.fail (expected), Cause.die (defect), Cause.interrupt (fiber cancelled)
const exit = await Effect.runPromiseExit(expected);
```

对比：Rust `thiserror` 定义枚举错误类型 + `?` 传播；C++ 用 exception 继承；Python 用 exception hierarchy + `except`。
Effect 的优势在于错误类型在编译时可追踪，且 `catchTag` 从类型中精确移除已处理的错误。

---

## 5. 服务与层 (Services & Layers)

Effect 最强大的特性——**编译时安全的依赖注入**。忘记提供依赖会直接产生类型错误。

```typescript
import { Effect, Context, Layer } from "effect";

// Define services
class UserRepo extends Context.Tag("UserRepo")<
  UserRepo,
  { readonly findById: (id: number) => Effect.Effect<string, UserNotFound> }
>() {}

class Logger extends Context.Tag("Logger")<
  Logger,
  { readonly info: (msg: string) => Effect.Effect<void> }
>() {}

// Use services — R tracks dependencies
const program = Effect.gen(function* () {
  const repo = yield* UserRepo;
  const logger = yield* Logger;
  yield* logger.info("Fetching user...");
  return yield* repo.findById(1);
});
// Effect<string, UserNotFound, UserRepo | Logger>

// Implement layers
const UserRepoLive = Layer.succeed(UserRepo, {
  findById: (id) => id === 1 ? Effect.succeed("Alice") : Effect.fail(new UserNotFound({ userId: id })),
});
const LoggerLive = Layer.succeed(Logger, {
  info: (msg) => Effect.sync(() => console.log(`[INFO] ${msg}`)),
});

// Provide dependencies — R becomes never
const runnable = program.pipe(
  Effect.provide(Layer.merge(UserRepoLive, LoggerLive))
);
// Effect<string, UserNotFound, never>
```

**层可以依赖其他层，形成依赖图**:

```typescript
class Config extends Context.Tag("Config")<Config, { readonly dbUrl: string }>() {}

const ConfigLive = Layer.succeed(Config, { dbUrl: "postgres://localhost/db" });

const UserRepoFromConfig = Layer.effect(
  UserRepo,
  Effect.gen(function* () {
    const config = yield* Config;
    return {
      findById: (id: number) => Effect.succeed(`User from ${config.dbUrl}`),
    };
  })
);

// Compose: UserRepoFromConfig needs Config, so provide it
const AppLive = Layer.merge(
  LoggerLive,
  UserRepoFromConfig.pipe(Layer.provide(ConfigLive))
);
```

对比：C++ 构造函数注入；Python `dependency-injector`；Rust trait objects。Effect 的层是编译时检查的值级组合。

---

## 6. 资源管理 (Resource Management)

`acquireRelease` 保证资源在使用后释放，即使发生错误或中断——类似 C++ RAII、Python `with`、Rust `Drop`。

```typescript
import { Effect } from "effect";

const makeConnection = Effect.acquireRelease(
  Effect.sync(() => {
    console.log("Opening connection");
    return { query: (sql: string) => Effect.succeed([{ id: 1 }]) };
  }),
  (conn) => Effect.sync(() => console.log("Connection closed"))
);

const program = Effect.scoped(
  Effect.gen(function* () {
    const conn = yield* makeConnection;
    return yield* conn.query("SELECT * FROM users");
    // Connection auto-closed when scope ends (LIFO order for multiple resources)
  })
);
```

---

## 7. 并发原语 (Concurrency Primitives)

### Fiber — 轻量级线程（类似 goroutine / tokio task）

```typescript
import { Effect, Fiber } from "effect";

const program = Effect.gen(function* () {
  const fiber1 = yield* Effect.fork(Effect.sleep("1 second").pipe(Effect.as("a")));
  const fiber2 = yield* Effect.fork(Effect.sleep("2 seconds").pipe(Effect.as("b")));
  const r1 = yield* Fiber.join(fiber1);
  const r2 = yield* Fiber.join(fiber2);
  return [r1, r2];
});

// Simpler: built-in parallel combinator
const parallel = Effect.all([task1, task2], { concurrency: "unbounded" });

// Interruption
const withTimeout = Effect.gen(function* () {
  const fiber = yield* Effect.fork(Effect.sleep("10 seconds"));
  yield* Effect.sleep("2 seconds");
  yield* Fiber.interrupt(fiber);
});
```

### Deferred, Ref, Queue

```typescript
import { Effect, Deferred, Ref, Queue } from "effect";

// Deferred: one-shot async variable (like C++ std::promise/future pair)
const deferredExample = Effect.gen(function* () {
  const d = yield* Deferred.make<string, never>();
  const consumer = Effect.fork(Deferred.await(d));
  yield* Effect.sleep("1 second");
  yield* Deferred.succeed(d, "Hello!");
  return yield* Fiber.join(yield* consumer);
});

// Ref: atomic mutable state (like Rust Arc<Mutex<T>> but composable)
const refExample = Effect.gen(function* () {
  const ref = yield* Ref.make(0);
  yield* Ref.update(ref, (n) => n + 1);
  return yield* Ref.get(ref); // 1
});

// Queue: bounded async producer-consumer (like Go channels)
const queueExample = Effect.gen(function* () {
  const queue = yield* Queue.bounded<number>(100);

  const producer = Effect.gen(function* () {
    for (let i = 0; i < 5; i++) {
      yield* Queue.offer(queue, i);
    }
    yield* Queue.shutdown(queue);
  });

  const consumer = Effect.gen(function* () {
    const items: number[] = [];
    while (true) {
      const item = yield* Queue.take(queue);
      items.push(item);
    }
  }).pipe(Effect.catchAll(() => Effect.succeed("done")));

  yield* Effect.all([producer, consumer], { concurrency: "unbounded" });
});
```

---

## 8. Stream 与 Sink

`Stream<A, E, R>` — 类型化的 pull-based 流，类似 Rust tokio Stream / Python async generator。

```typescript
import { Stream, Sink, Effect } from "effect";

const pipeline = Stream.fromIterable([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]).pipe(
  Stream.filter((n) => n % 2 === 0),
  Stream.map((n) => n * 10),
  Stream.take(3),
  Stream.mapEffect((n) => Effect.succeed(`Item: ${n}`))
);
const result = await Effect.runPromise(Stream.runCollect(pipeline));
// Chunk(["Item: 20", "Item: 40", "Item: 60"])

// Sinks consume streams
const sum = Stream.run(Stream.fromIterable([1, 2, 3, 4, 5]), Sink.sum); // 15
```

---

## 9. 高级模式 (Advanced Patterns)

### Schedule — 重试与重复策略

```typescript
import { Effect, Schedule } from "effect";

const reliable = unreliableEffect.pipe(
  Effect.retry(
    Schedule.exponential("100 millis").pipe(
      Schedule.compose(Schedule.recurs(5))
    )
  )
);

const poll = Effect.log("polling...").pipe(
  Effect.repeat(Schedule.spaced("5 seconds"))
);
```

### Semaphore + Cache — Rate-Limited API Client

```typescript
import { Effect, Cache, Duration, Schedule, Data } from "effect";

class ApiError extends Data.TaggedError("ApiError")<{ readonly message: string }> {}

const makeApiClient = Effect.gen(function* () {
  const semaphore = yield* Effect.makeSemaphore(5);

  const cache = yield* Cache.make({
    capacity: 100,
    timeToLive: Duration.minutes(5),
    lookup: (path: string) =>
      semaphore.withPermits(1)(
        Effect.tryPromise({
          try: () => fetch(`https://api.example.com${path}`).then((r) => r.json()),
          catch: () => new ApiError({ message: "Network error" }),
        }).pipe(
          Effect.retry(Schedule.exponential("200 millis").pipe(Schedule.compose(Schedule.recurs(3))))
        )
      ),
  });

  return { get: (path: string) => cache.get(path) };
});
```

---

## 10. 性能考量 (Performance Considerations)

### Fiber 开销

Effect 的 Fiber 是协作式用户态线程，比 OS 线程轻量得多，但不是零成本：
- **创建成本**: 每个 `Effect.fork` 创建一个 Fiber 对象 + 栈帧，约数百纳秒
- **调度**: 基于 microtask，单线程内协作式切换
- **适用场景**: 数百到数千并发 Fiber 无压力；百万级并发考虑用 Stream 或 batch

```typescript
// ✅ Good: bounded concurrency
const results = yield* Effect.forEach(items, processItem, { concurrency: 20 });

// ⚠️ Caution: unbounded fork for large collections
// Each fork creates a Fiber — 1M items = 1M Fibers in memory
const fibers = yield* Effect.forEach(
  hugeList,
  (item) => Effect.fork(processItem(item)),
  { concurrency: "unbounded" }, // prefer a bounded number
);
```

### Layer 实例化

Layer 默认 **memoized** —— 同一个 Layer 引用在一次 `Effect.provide` 中只实例化一次，结果被共享。

```typescript
// DatabaseLive is constructed ONCE even if used by multiple services
const AppLive = Layer.merge(
  UserRepoLive,   // depends on DatabaseLive
  PostRepoLive,   // also depends on DatabaseLive
).pipe(Layer.provide(DatabaseLive)); // DatabaseLive built once, shared

// ⚠️ Layer.fresh() forces re-instantiation (rare — only for test isolation)
const freshDb = Layer.fresh(DatabaseLive);
```

**Layer 构建时机**: `Effect.provide(layer)` 在首次 `runPromise` 时触发构建，按依赖图拓扑排序执行。构建过程本身也是 Effect，可以失败——确保 Layer 构建中的错误有合理的处理。

### 与原生 async/await 的对比

| 场景 | Effect | 原生 async/await |
|------|--------|-----------------|
| 简单 CRUD handler | 微量开销（< 1ms） | 最快 |
| 错误类型追踪 | 编译时保证 | 无保证 |
| 依赖注入 | 零反射，编译时安全 | 需要 DI 框架 |
| 复杂并发/重试 | 声明式组合 | 手写大量模板代码 |

**经验法则**: 如果你的代码已经有 try/catch + retry + DI + logging，Effect 不会更慢——它把分散在各处的复杂度统一管理。

---

## 推荐资源

| 资源 | 说明 |
|------|------|
| [Effect 官方文档](https://effect.website) | 最权威的 API 参考和教程 |
| [Effect GitHub](https://github.com/Effect-TS/effect) | 源码和 examples 目录 |
| [Effect Discord](https://discord.gg/effect-ts) | 社区讨论和答疑 |

---

## 检查点

- [ ] 能解释 `Effect<A, E, R>` 三个类型参数的含义
- [ ] 能使用 `Effect.gen` + `yield*` 编写程序
- [ ] 能用 `Context.Tag` 定义 Service 并用 `Layer` 实现
- [ ] 能使用 `catchTag` 处理 tagged errors
- [ ] 能使用 Fiber 进行并发操作
- [ ] 能创建和消费 Stream
- [ ] 理解 `acquireRelease` 资源管理模式
- [ ] 能组合 Schedule 实现重试策略
- [ ] 能用 Semaphore 限制并发

---

## 下一步

→ **Stage 07**（选择感兴趣的方向）：
- [Stage 07a: Schema 与数据层](../../07a-schema-and-data/notes/)
- [Stage 07b: 服务端与 CLI](../../07b-server-and-cli/notes/)
- [Stage 07c: 前端与 UI](../../07c-frontend-and-ui/notes/)
- [Stage 07d: 测试与工具链](../../07d-testing-and-tooling/notes/)
