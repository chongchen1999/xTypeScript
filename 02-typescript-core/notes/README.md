# Stage 02: TypeScript 核心

> **前置要求**: [Stage 01: JavaScript 基础](../../01-javascript-foundations/notes/)
> **预计时间**: 3–5 天

---

## 学习目标

- 理解 TypeScript 的 structural type system（结构化类型系统）
- 掌握 type annotations、interfaces 和 type aliases
- 学会 generics（泛型）及 generic constraints（泛型约束）
- 了解常用 utility types 并能灵活组合
- 理解 type narrowing（类型收窄）与 type guards（类型守卫）

---

## 1. 类型系统基础 (Type System Basics)

### Structural Typing vs Nominal Typing

TypeScript 采用 **structural typing**：只要结构匹配就认为类型兼容，不关心名字。
C++ / Rust 使用 **nominal typing**，要求类型名称或 trait 显式匹配。

```typescript
interface Point { x: number; y: number }

const p = { x: 1, y: 2, z: 3 };
function printPoint(pt: Point): void { console.log(`(${pt.x}, ${pt.y})`); }
printPoint(p); // OK — p has x and y, extra z is fine
```

| 特性 | TypeScript | C++ | Rust | Python |
|------|-----------|-----|------|--------|
| 匹配方式 | Structural | Nominal (templates structural) | Nominal (trait-based) | Duck typing / Protocol |

### Primitive Types & Literal Types

```typescript
// Primitives
const str: string = "hello";
const num: number = 42;
const bool: boolean = true;
const big: bigint = 100n;
const sym: symbol = Symbol("id");

// Literal types — values as types
type Direction = "up" | "down" | "left" | "right";
type DiceRoll = 1 | 2 | 3 | 4 | 5 | 6;
```

### Union & Intersection Types

```typescript
// Union: either A or B
type StringOrNumber = string | number;
function format(value: StringOrNumber): string {
  return typeof value === "string" ? value.toUpperCase() : value.toFixed(2);
}

// Intersection: both A and B
type Named = { name: string };
type Timestamped = { createdAt: Date };
type NamedTimestamped = Named & Timestamped;
```

> **类比:** C++ `std::variant` ~ union type; Rust `enum` ~ union, 同时 impl 多个 trait ~ intersection。

---

## 2. 接口与类型别名 (Interfaces vs Type Aliases)

```typescript
// Interface — object shapes and class contracts
interface User {
  id: number;
  name: string;
  email?: string;           // optional
  readonly createdAt: Date; // immutable after creation
}

// Type alias — any type expression
type ID = string | number;
type Pair<T> = [T, T];
type Callback = (data: string) => void;
```

| 场景 | 推荐 | 原因 |
|------|------|------|
| 对象形状 / class contract | `interface` | 支持 declaration merging 和 `extends` |
| Union / intersection / tuple | `type` | `interface` 不支持这些表达式 |
| 第三方库扩展 | `interface` | declaration merging 可扩展已有定义 |

### Declaration Merging（仅 interface 支持）

```typescript
interface Window { title: string }
interface Window { appVersion: string }
// Result: Window has both title and appVersion
```

### Extending

```typescript
interface Animal { name: string }
interface Dog extends Animal { breed: string }

// Equivalent with type alias
type Cat = Animal & { indoor: boolean };
```

---

## 3. 泛型 (Generics)

泛型让你编写可复用的、类型安全的代码，类似 C++ templates / Rust generics。

### Generic Functions & Constraints

```typescript
function identity<T>(value: T): T { return value; }
const n = identity(42);      // T inferred as number

// Constraints with extends — like Rust trait bounds or C++20 concepts
interface HasLength { length: number }
function logLength<T extends HasLength>(item: T): void {
  console.log(item.length);
}
logLength("hello");  // OK
logLength(42);       // Error — number has no length

// keyof constraint — type-safe property access
function getProperty<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key];
}
```

### Generic Classes & Default Parameters

```typescript
class Stack<T> {
  private items: T[] = [];
  push(item: T): void { this.items.push(item); }
  pop(): T | undefined { return this.items.pop(); }
}

// Default type parameter
interface ApiResponse<T = unknown> {
  data: T;
  status: number;
}
```

**跨语言对比:**

| 特性 | TypeScript | C++ | Rust | Python |
|------|-----------|-----|------|--------|
| 语法 | `<T>` | `template<typename T>` | `<T>` | `TypeVar('T')` |
| 约束 | `extends` | concepts (C++20) | trait bounds | `TypeVar(bound=...)` |
| 类型擦除 | 编译时擦除 | monomorphization | monomorphization / dyn | 运行时无强制 |

---

## 4. 工具类型 (Utility Types)

TypeScript 内置 utility types，用于从已有类型派生新类型。

### 常用 Utility Types

```typescript
interface User { id: number; name: string; email: string; age: number }

type PartialUser      = Partial<User>;              // all optional
type RequiredUser     = Required<PartialUser>;      // all required
type UserPreview      = Pick<User, "id" | "name">;  // select properties
type UserWithoutEmail = Omit<User, "email">;        // exclude properties
type FrozenUser       = Readonly<User>;             // all readonly
type RoleMap          = Record<"admin" | "user", boolean>; // key-value map
```

### 函数相关 Utility Types

```typescript
function createUser(name: string, age: number): User {
  return { id: Date.now(), name, age, email: "" };
}

type Ret    = ReturnType<typeof createUser>;        // User
type Params = Parameters<typeof createUser>;        // [string, number]
type Data   = Awaited<Promise<Promise<string>>>;    // string
```

### 自定义 Utility Type

```typescript
// Make specific properties optional
type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

// Deep readonly
type DeepReadonly<T> = {
  readonly [K in keyof T]: T[K] extends object ? DeepReadonly<T[K]> : T[K];
};
```

> **组合使用:** `Readonly<Pick<User, "id" | "name">>` — 只读的用户摘要类型。

---

## 5. 类型收窄 (Type Narrowing)

Type narrowing 在代码分支中将宽类型收窄为具体类型，TS 的 control flow analysis 会自动追踪。

### 内置 Guards: typeof / instanceof / in

```typescript
// typeof
function process(value: string | number): string {
  if (typeof value === "string") return value.toUpperCase();
  return value.toFixed(2);
}

// instanceof
class ApiError extends Error {
  constructor(public statusCode: number, message: string) { super(message); }
}
function handleError(err: Error | ApiError): void {
  if (err instanceof ApiError) console.log(`HTTP ${err.statusCode}`);
}

// in operator
interface Fish { swim: () => void }
interface Bird { fly: () => void }
function move(animal: Fish | Bird): void {
  if ("swim" in animal) animal.swim();
  else animal.fly();
}
```

### User-Defined Type Guards（`is` 关键字）

```typescript
interface Cat { meow: () => void; lives: number }
interface Dog { bark: () => void; breed: string }

function isCat(pet: Cat | Dog): pet is Cat {
  return "meow" in pet;
}

function handlePet(pet: Cat | Dog): void {
  if (isCat(pet)) console.log(`Cat: ${pet.lives} lives`);
  else console.log(`Dog: ${pet.breed}`);
}
```

### Assertion Functions（`asserts` 关键字）

```typescript
function assertIsString(value: unknown): asserts value is string {
  if (typeof value !== "string") throw new Error(`Expected string`);
}

function run(input: unknown): void {
  assertIsString(input);
  console.log(input.toUpperCase()); // narrowed to string
}
```

### Discriminated Unions

通过共同的 literal type 字段区分 union 成员，类似 Rust `enum` + `match`。

```typescript
interface Circle   { kind: "circle";   radius: number }
interface Square   { kind: "square";   side: number }
type Shape = Circle | Square;

function area(s: Shape): number {
  switch (s.kind) {
    case "circle": return Math.PI * s.radius ** 2;
    case "square": return s.side ** 2;
  }
}
```

> **类比:** Rust `enum` + `match` (exhaustive); C++ `std::variant` + `std::visit`。

---

## 6. 枚举与字面量类型 (Enums & Literal Types)

### Enums

```typescript
// String enum — explicit values, better for debugging
enum LogLevel { Debug = "DEBUG", Info = "INFO", Warn = "WARN", Error = "ERROR" }

// Const enum — fully inlined at compile time, zero runtime cost
const enum HttpMethod { GET = "GET", POST = "POST", PUT = "PUT", DELETE = "DELETE" }
fetch(url, { method: HttpMethod.GET }); // compiled to: { method: "GET" }
```

### String Literal Union（推荐替代方案）

很多 TS 项目倾向用 string literal union 代替 enum——更轻量，无需 import。

```typescript
type HttpMethod = "GET" | "POST" | "PUT" | "DELETE";
type LogLevel = "debug" | "info" | "warn" | "error";
```

### Template Literal Types 简介（详见 Stage 03）

```typescript
type Color = "red" | "green" | "blue";
type Shade = "light" | "dark";
type ColorVariant = `${Shade}-${Color}`; // "light-red" | "light-green" | ...

type EventName = "click" | "scroll";
type Handler = `on${Capitalize<EventName>}`; // "onClick" | "onScroll"
```

| 特性 | TS enum | C++ `enum class` | Rust `enum` | Python `Enum` |
|------|---------|-------------------|-------------|---------------|
| 值类型 | number / string | int | 可携带数据 | any |
| Exhaustiveness | 不默认检查 | 不默认检查 | match 强制 | match (3.10+) |
| 推荐替代 | string literal union | — | — | `StrEnum` |

---

## 推荐资源

| 资源 | 说明 |
|------|------|
| [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/) | 官方手册 |
| [TypeScript Deep Dive](https://basarat.gitbook.io/typescript/) | 深入浅出 |
| [Type Challenges](https://github.com/type-challenges/type-challenges) | 类型体操，easy → extreme |
| [TypeScript Playground](https://www.typescriptlang.org/play) | 在线实验环境 |

---

## 检查点

- [ ] 能解释 structural typing vs nominal typing
- [ ] 清楚何时用 `interface` 何时用 `type`
- [ ] 能编写带 constraints 的 generic functions
- [ ] 能使用并组合 utility types（Partial, Pick, Omit, Record 等）
- [ ] 能实现自定义 type guards（`is` 和 `asserts`）
- [ ] 理解 discriminated union 的基本原理
- [ ] 了解 enum、const enum 和 string literal union 的取舍

---

## 下一步

→ [Stage 03: TypeScript 高级](../../03-typescript-advanced/notes/)
