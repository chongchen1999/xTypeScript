# Stage 07a: Schema 与数据层

> **前置要求**: [Stage 02: TypeScript 核心](../../02-typescript-core/notes/), [Stage 06: Effect 框架](../../06-effect-framework/notes/)
> **预计时间**: 2–3 天

---

## 学习目标

- 掌握 Zod schema 定义与运行时验证
- 理解 Drizzle ORM 的类型安全数据库操作
- 学会 Zod 与 Drizzle 的集成模式
- 了解 SQLite 特有的使用模式

---

## 一、Zod: 运行时验证 (Runtime Validation)

Zod 是 TypeScript-first 的 schema 验证库，在**运行时**校验外部数据。类比：Python `pydantic`、Rust `serde` + `validator`

### 1.1 Schema 基础 (Schema Basics)

```typescript
import { z } from "zod";

const UserInputSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  age: z.number().int().min(0).optional(),
  role: z.enum(["admin", "user", "guest"]),
  tags: z.array(z.string()).default([]),
});

// Discriminated union — requires a common discriminator field
const EventSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("click"), x: z.number(), y: z.number() }),
  z.object({ type: z.literal("keypress"), key: z.string() }),
]);

// parse() throws ZodError; safeParse() returns { success, data | error }
const result = UserInputSchema.safeParse(unknownData);
if (result.success) console.log(result.data.email);
else console.error(result.error.flatten());
```

### 1.2 类型推导 (Type Inference)

从 schema 自动推导 TypeScript 类型，避免重复定义：

```typescript
const UserSchema = z.object({
  id: z.string().uuid(), name: z.string(),
  email: z.string().email(), createdAt: z.coerce.date(),
});
type User = z.infer<typeof UserSchema>;
type UserInput = z.input<typeof UserSchema>; // before transforms
```

| 场景 | 推荐方式 |
|------|----------|
| 外部数据（API、用户输入） | `z.infer<typeof Schema>` |
| 纯内部数据结构 | 手动 `type` / `interface` |
| 数据库行类型 | 从 Drizzle schema 推导 |

### 1.3 转换与细化 (Transform & Refine)

```typescript
// .transform(): change shape during parsing
const StringToNumber = z.string().transform((v) => parseInt(v, 10));

// .refine(): custom validation
const PasswordSchema = z.string().min(8)
  .refine((v) => /[A-Z]/.test(v), { message: "Need uppercase" })
  .refine((v) => /[0-9]/.test(v), { message: "Need digit" });

// .superRefine(): cross-field validation with full error context
const SignupSchema = z.object({
  password: z.string().min(8),
  confirmPassword: z.string(),
}).superRefine((data, ctx) => {
  if (data.password !== data.confirmPassword)
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Passwords must match", path: ["confirmPassword"] });
});

// snake_case API → camelCase during parsing
const ApiResponseSchema = z.object({
  data: z.object({ user_name: z.string(), created_at: z.string() }),
}).transform((res) => ({
  userName: res.data.user_name, createdAt: new Date(res.data.created_at),
}));
```

### 1.4 品牌类型 (Branded Types)

区分结构相同但语义不同的值：

```typescript
const UserIdSchema = z.string().uuid().brand<"UserId">();
const PostIdSchema = z.string().uuid().brand<"PostId">();
type UserId = z.infer<typeof UserIdSchema>;

function getUser(id: UserId) { /* ... */ }
const userId = UserIdSchema.parse("550e8400-...");
getUser(userId);     // OK
// getUser(postId);  // Compile error — brand has zero runtime overhead
```

### 1.5 高级模式 (Advanced Patterns)

**`.pipe()`** — 串联多个 schema 转换（TS 4.1+），前一步的输出是后一步的输入：

```typescript
// String → Number → constrained Number
const PortSchema = z.string()
  .pipe(z.coerce.number())
  .pipe(z.number().int().min(1).max(65535));

PortSchema.parse("8080");   // 8080
PortSchema.parse("99999");  // ZodError: Number must be at most 65535
```

**`.passthrough()` / `.strip()`** — 控制多余属性：

```typescript
const StrictUser = z.object({ name: z.string() });
StrictUser.parse({ name: "Alice", extra: true }); // { name: "Alice" } (extra stripped by default)

const LooseUser = StrictUser.passthrough();
LooseUser.parse({ name: "Alice", extra: true }); // { name: "Alice", extra: true }

// .strict() — reject unknown keys (throws on extra)
const VeryStrict = StrictUser.strict();
VeryStrict.parse({ name: "Alice", extra: true }); // ZodError
```

**Coercion** — 自动类型转换，常用于处理 query string / form data：

```typescript
const QuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  active: z.coerce.boolean(),                      // "true"/"1" → true
  since: z.coerce.date(),                           // ISO string → Date
});
QuerySchema.parse({ page: "2", limit: "50", active: "true", since: "2024-01-01" });
// { page: 2, limit: 50, active: true, since: Date }
```

---

## 二、Drizzle ORM: 类型安全的数据库操作

Drizzle 特点：**SQL-like API**、零抽象开销、完整类型推导。类比：Python `SQLAlchemy`、Rust `diesel`

### 2.1 Schema 定义 (Schema Definition)

```typescript
import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { relations } from "drizzle-orm";

// SQLite has no native boolean/timestamp — Drizzle maps via mode option
export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  role: text("role", { enum: ["admin", "user", "guest"] }).notNull().default("user"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

export const posts = sqliteTable("posts", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  content: text("content"),
  authorId: text("author_id").notNull().references(() => users.id),
  published: integer("published", { mode: "boolean" }).notNull().default(false),
});

export const usersRelations = relations(users, ({ many }) => ({ posts: many(posts) }));
export const postsRelations = relations(posts, ({ one }) => ({
  author: one(users, { fields: [posts.authorId], references: [users.id] }),
}));
```

### 2.2 查询构建 (Query Building)

```typescript
import { eq, desc, count } from "drizzle-orm";
import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import * as schema from "./schema";

const db = drizzle(new Database("app.db"), { schema });

const admins = await db.select().from(schema.users).where(eq(schema.users.role, "admin"));

// Relational API — uses defined relations for nested queries
const usersWithPosts = await db.query.users.findMany({ with: { posts: true } });

await db.insert(schema.users).values({
  id: crypto.randomUUID(), name: "Alice", email: "alice@example.com",
});
await db.update(schema.users).set({ role: "admin" }).where(eq(schema.users.email, "alice@example.com"));
await db.delete(schema.posts).where(eq(schema.posts.authorId, "some-id"));

// Aggregation
const postCounts = await db.select({
  authorId: schema.posts.authorId, total: count(schema.posts.id),
}).from(schema.posts).groupBy(schema.posts.authorId);
```

### 2.3 迁移 (Migrations)

```bash
npx drizzle-kit generate   # Generate migration SQL from schema diff
npx drizzle-kit push       # Push schema directly (dev only)
npx drizzle-kit migrate    # Apply pending migrations (production)
```

工作流：修改 schema → `generate` → 检查 SQL → `migrate`

```typescript
// drizzle.config.ts
import { defineConfig } from "drizzle-kit";
export default defineConfig({
  schema: "./src/db/schema.ts", out: "./drizzle",
  dialect: "sqlite", dbCredentials: { url: "./data/app.db" },
});
```

### 2.4 高级查询 (Advanced Queries)

```typescript
import { eq, sql, desc, and, gt } from "drizzle-orm";

// Subquery
const activeAuthors = db
  .select({ authorId: schema.posts.authorId })
  .from(schema.posts)
  .where(eq(schema.posts.published, true))
  .groupBy(schema.posts.authorId);

// Raw SQL for complex expressions
const recentUsers = await db
  .select({
    name: schema.users.name,
    postCount: sql<number>`(SELECT COUNT(*) FROM posts WHERE posts.author_id = ${schema.users.id})`,
  })
  .from(schema.users)
  .where(gt(schema.users.createdAt, sql`datetime('now', '-7 days')`))
  .orderBy(desc(schema.users.createdAt));

// Batch insert with conflict handling
await db.insert(schema.users)
  .values(newUsers)
  .onConflictDoUpdate({
    target: schema.users.email,
    set: { name: sql`excluded.name` },
  });
```

### 2.5 迁移冲突处理 (Migration Conflict Resolution)

多人协作时 migration 文件可能冲突。处理策略：

```bash
# Situation: two developers both generated migrations from the same base
# Developer A: 0001_add_avatar.sql
# Developer B: 0001_add_bio.sql

# Fix: regenerate from current schema state
npx drizzle-kit generate   # Produces 0002_xxx.sql incorporating both changes

# If push fails (schema mismatch):
npx drizzle-kit push --force  # Dev only — drops and recreates (DATA LOSS)

# Production: never use --force, always review generated SQL
npx drizzle-kit generate   # Check the SQL diff
npx drizzle-kit migrate    # Apply sequentially
```

**⚠️ SQLite 限制**: SQLite 不支持 `ALTER TABLE DROP COLUMN`（3.35.0 之前）、无原生 `BOOLEAN`/`TIMESTAMP` 类型（Drizzle 通过 `mode` 选项映射）、`AUTOINCREMENT` 只能用于 `INTEGER PRIMARY KEY`。

---

## 三、Zod ↔ Drizzle 集成模式 (Integration Patterns)

Zod 负责**验证外部输入**，Drizzle 负责**持久化**，二者共享类型但不紧耦合。

```
API Request → Zod (validate) → Business Logic → Drizzle (persist) → Response
```

### 3.1 完整数据流示例

```typescript
import { z } from "zod";
import { eq } from "drizzle-orm";
import { users } from "./schema";
import { db } from "./database";

const CreateUserInput = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email().toLowerCase(),
  role: z.enum(["admin", "user", "guest"]).default("user"),
});
type CreateUserInput = z.infer<typeof CreateUserInput>;

async function createUser(raw: unknown) {
  const input = CreateUserInput.parse(raw);
  const existing = await db.select().from(users).where(eq(users.email, input.email));
  if (existing.length > 0) throw new Error("Email already in use");
  const [user] = await db.insert(users)
    .values({ id: crypto.randomUUID(), ...input }).returning();
  return user;
}
```

### 3.2 分层类型策略 (Layered Type Strategy)

```typescript
import { InferSelectModel, InferInsertModel } from "drizzle-orm";
type UserRow = InferSelectModel<typeof users>;    // DB layer — from Drizzle
type NewUser = InferInsertModel<typeof users>;

const UserResponseSchema = z.object({             // API layer — from Zod
  id: z.string(), name: z.string(), email: z.string(), role: z.string(),
});
type UserResponse = z.infer<typeof UserResponseSchema>;
```

**设计原则**：各层类型独立（API 输入 ≠ DB 行 ≠ API 响应），Zod 管 API 边界，Drizzle 管数据库。

---

## ⚠️ 常见陷阱

### Zod

1. **`z.infer` vs `z.input` vs `z.output`**: 有 `.transform()` 时三者不同。`z.infer` = `z.output`（转换后），`z.input`（转换前）。API 请求类型用 `z.input`，处理后类型用 `z.output`。

2. **`.optional()` vs `.nullable()` vs `.nullish()`**:
   ```typescript
   z.string().optional()   // string | undefined
   z.string().nullable()   // string | null
   z.string().nullish()    // string | null | undefined
   ```

3. **Error message 丢失**: `.refine()` 返回 `false` 时若不指定 `message`，用户看到的是泛用的 "Invalid input"——务必提供有意义的错误信息。

4. **Schema 复用陷阱**: `.extend()` 只能用于 `z.object()`；对带 `.transform()` 的 schema 用 `.extend()` 会丢失 transform。用 `.pipe()` 串联代替。

### Drizzle

1. **SQLite 类型映射**：`integer({ mode: "boolean" })` 存储为 `0/1`，直接 raw query 会看到数字而非 `true/false`。

2. **`.returning()` 支持**: SQLite 支持 `RETURNING`（3.35.0+），但 MySQL 不支持——Drizzle 会静默忽略，导致 insert 返回 `undefined`。

3. **关系查询 vs SQL 查询**: `db.query.users.findMany({ with: { posts: true } })` 使用 relational API（需定义 `relations()`）；`db.select().from(users)` 使用 SQL-like API——两者不能混用 `.where()` 语法。

---

## 推荐资源

- [Zod 官方文档](https://zod.dev) — 完整 API 参考
- [Drizzle ORM 文档](https://orm.drizzle.team) — 各数据库适配指南
- [Drizzle SQLite 指南](https://orm.drizzle.team/docs/get-started-sqlite) — SQLite 快速上手
- [Total TypeScript: Zod](https://www.totaltypescript.com/tutorials/zod) — Matt Pocock 的 Zod 教程

---

## 检查点

- [ ] 能够为复杂嵌套数据定义 Zod schema
- [ ] 能够使用 `z.infer` 从 schema 推导 TypeScript 类型
- [ ] 能够使用 `transform` 和 `refine` 进行数据转换与自定义验证
- [ ] 能够定义 Drizzle 表 schema 及表间关系
- [ ] 能够用 Drizzle 编写类型安全的 CRUD 查询
- [ ] 理解 Zod → validate → Drizzle → persist 的完整数据流

---

## 下一步

→ 继续其他 Stage 07 模块：
- [Stage 07b: 服务端与 CLI](../../07b-server-and-cli/notes/)
- [Stage 07c: 前端与 UI](../../07c-frontend-and-ui/notes/)
- [Stage 07d: 测试与工具链](../../07d-testing-and-tooling/notes/)
