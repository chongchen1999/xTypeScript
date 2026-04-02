# Stage 03: TypeScript 高级类型

> **前置要求**: [Stage 02: TypeScript 核心](../../02-typescript-core/notes/)
> **预计时间**: 4–6 天
> **难度**: ⭐⭐⭐⭐

---

## 学习目标

- 掌握条件类型 (conditional types) 与 `infer` 关键字
- 理解映射类型 (mapped types) 与模板字面量类型 (template literal types)
- 学会品牌类型 (branded types) 实现类型安全的标识符
- 掌握可辨识联合 (discriminated unions) 与穷举检查
- 理解命名空间模式：同名的类型 + 值
- 了解递归类型 (recursive types)

---

## 1. 条件类型 (Conditional Types)

语法 `T extends U ? X : Y`，类似三元运算符但作用于类型层面。C++ 有 `std::conditional<bool, T, F>`，Rust 通过 trait bound 实现约束，都不如 TS 灵活。

```typescript
type IsString<T> = T extends string ? true : false;
type A = IsString<"hello">;  // true
type B = IsString<42>;       // false
```

### 分布式条件类型 (Distributive Conditional Types)

当条件类型作用于**裸类型参数**（未被包裹的 `T`），联合类型会自动分布到每个成员上逐一求值，再合并结果。
C++ 无对应概念——`std::conditional` 不会自动拆分 variant。

```typescript
// T is "naked" — distribution happens
type ToArray<T> = T extends any ? T[] : never;
type Result = ToArray<string | number>;
//   = (string extends any ? string[] : never) | (number extends any ? number[] : never)
//   = string[] | number[]
```

**分布触发条件**：`T extends U ? X : Y` 中 `T` 必须是裸类型参数（直接使用，未被 `[]`、`{}` 等包裹）。

```typescript
// ✅ Distributed — T is naked
type IsString<T> = T extends string ? true : false;
type R1 = IsString<string | number>;  // true | false  (= boolean)

// ❌ NOT distributed — T is wrapped in tuple
type IsStringNonDist<T> = [T] extends [string] ? true : false;
type R2 = IsStringNonDist<string | number>;  // false  (union as a whole doesn't extend string)
```

**⚠️ 常见陷阱**：分布式行为导致 `never` 消失。`never` 是空联合，分布后无成员可求值，结果仍为 `never`：

```typescript
type Example<T> = T extends string ? "yes" : "no";
type R3 = Example<never>;  // never (not "yes" or "no"!)

// Fix: wrap to prevent distribution
type ExampleSafe<T> = [T] extends [string] ? "yes" : "no";
type R4 = ExampleSafe<never>;  // "yes" (never extends string)
```

**实际应用**：利用分布式行为实现 `Extract` / `Exclude`，或防止分布以处理联合类型整体。

### 重新实现 Extract / Exclude

```typescript
type MyExtract<T, U> = T extends U ? T : never;
type MyExclude<T, U> = T extends U ? never : T;

type Nums = MyExtract<string | number | boolean, number>;    // number
type NoStr = MyExclude<string | number | boolean, string>;   // number | boolean
```

---

## 2. infer 关键字 (The `infer` Keyword)

在条件类型的 `extends` 子句中声明待推断的类型变量——类型层面的"模式匹配"。

```typescript
// Extract return type
type MyReturnType<T> = T extends (...args: any[]) => infer R ? R : never;
type R1 = MyReturnType<(x: number) => boolean>;  // boolean

// Unwrap Promise (recursive)
type DeepUnwrap<T> = T extends Promise<infer V> ? DeepUnwrap<V> : T;
type P = DeepUnwrap<Promise<Promise<number>>>;  // number

// Head and Tail of a tuple
type Head<T extends any[]> = T extends [infer H, ...any[]] ? H : never;
type Tail<T extends any[]> = T extends [any, ...infer R] ? R : never;
type H = Head<[1, 2, 3]>;  // 1
type T = Tail<[1, 2, 3]>;  // [2, 3]

// Extract both args and return type simultaneously
type FuncParts<T> = T extends (...args: infer A) => infer R
  ? { args: A; return: R }
  : never;
```

---

## 3. 映射类型 (Mapped Types)

用 `in keyof` 遍历对象键，对值类型进行变换。修饰符 `+`/`-` 控制 `readonly` 和 `?`。

```typescript
type Nullable<T> = { [K in keyof T]: T[K] | null };
type Mutable<T> = { -readonly [K in keyof T]: T[K] };     // remove readonly
type Concrete<T> = { -readonly [K in keyof T]-?: T[K] };  // remove readonly and optional
```

### 键重映射 (Key Remapping with `as`)

TS 4.1+ 可在映射类型中重命名或过滤键：

```typescript
// Add "get" prefix to all keys
type Getters<T> = {
  [K in keyof T as `get${Capitalize<string & K>}`]: () => T[K];
};

// Filter keys by value type
type OnlyStrings<T> = {
  [K in keyof T as T[K] extends string ? K : never]: T[K];
};

type G = Getters<{ name: string; age: number }>;
// { getName: () => string; getAge: () => number }
```

### DeepReadonly

```typescript
type DeepReadonly<T> = T extends Function ? T
  : T extends object ? { readonly [K in keyof T]: DeepReadonly<T[K]> }
  : T;
```

---

## 4. 模板字面量类型 (Template Literal Types)

类型层面的字符串操作，联合类型会做笛卡尔积展开：

```typescript
type Color = "red" | "blue";
type Size  = "sm" | "lg";
type ClassName = `${Color}-${Size}`;  // "red-sm" | "red-lg" | "blue-sm" | "blue-lg"

// Built-in string manipulation types
type U = Uppercase<"hello">;         // "HELLO"
type C = Capitalize<"hello world">;  // "Hello world"
```

### 类型安全的事件发射器

结合映射类型与模板字面量，实现编译时验证的事件系统：

```typescript
type EventMap = {
  click: { x: number; y: number };
  focus: { target: string };
};

type EventHandlers<T> = {
  [K in keyof T as `on${Capitalize<string & K>}`]: (payload: T[K]) => void;
};
// { onClick: (payload: {...}) => void; onFocus: (payload: {...}) => void }

interface TypedEmitter<T extends Record<string, any>> {
  on<K extends keyof T>(event: K, handler: (payload: T[K]) => void): void;
  emit<K extends keyof T>(event: K, payload: T[K]): void;
}
```

---

## 5. 品牌类型 (Branded Types)

**问题**: 结构化类型下 `type UserId = string` 和 `type OrderId = string` 可互换。
Rust 用 newtype `struct UserId(String)` 创建真正不同的类型，C++ 有 strong typedef。

```typescript
// Generic branded type utility
declare const __brand: unique symbol;
type Brand<T, B extends string> = T & { readonly [__brand]: B };

type UserId  = Brand<string, "UserId">;
type OrderId = Brand<string, "OrderId">;

// Runtime constructor functions
function UserId(id: string): UserId { return id as UserId; }
function OrderId(id: string): OrderId { return id as OrderId; }

function getUser(id: UserId): void { /* ... */ }

getUser(UserId("u-1"));    // OK
getUser(OrderId("o-1"));   // Error! Type mismatch at compile time

// Also works for numbers — prevent mixing currencies
type USD = Brand<number, "USD">;
type EUR = Brand<number, "EUR">;
function chargeUSD(amount: USD): void { /* ... */ }
chargeUSD(42 as USD);  // OK
chargeUSD(42 as EUR);  // Error!
```

---

## 6. 可辨识联合 (Discriminated Unions)

每个成员共享一个判别属性 (discriminant)，TS 据此自动缩窄类型。
类似 Rust `enum` 关联数据、C++ `std::variant` + `std::visit`。

```typescript
type Shape =
  | { kind: "circle"; radius: number }
  | { kind: "rect"; width: number; height: number }
  | { kind: "triangle"; base: number; height: number };

// Exhaustive check — compile error if a case is missed
function assertNever(x: never): never {
  throw new Error(`Unexpected: ${x}`);
}

function area(s: Shape): number {
  switch (s.kind) {
    case "circle":   return Math.PI * s.radius ** 2;
    case "rect":     return s.width * s.height;
    case "triangle": return (s.base * s.height) / 2;
    default:         return assertNever(s);
  }
}
```

### Result 类型（类似 Rust `Result<T, E>`）

```typescript
type Result<T, E = Error> =
  | { ok: true; value: T }
  | { ok: false; error: E };

function ok<T>(value: T): Result<T, never> { return { ok: true, value }; }
function err<E>(error: E): Result<never, E> { return { ok: false, error }; }

function divide(a: number, b: number): Result<number, string> {
  return b === 0 ? err("Division by zero") : ok(a / b);
}

const r = divide(10, 3);
if (r.ok) console.log(r.value);   // number
else      console.error(r.error); // string
```

---

## 7. 命名空间模式 (Namespace Pattern)

同一个名字同时用作类型和值 (declaration merging)。在 Effect 生态中非常常见：
一个 import 同时获得类型和工具函数。

```typescript
// type + const with the same name
type Option<A> = { _tag: "Some"; value: A } | { _tag: "None" };

const Option = {
  some<A>(value: A): Option<A> { return { _tag: "Some", value }; },
  none: { _tag: "None" } as Option<never>,

  map<A, B>(self: Option<A>, f: (a: A) => B): Option<B> {
    return self._tag === "Some" ? Option.some(f(self.value)) : Option.none;
  },

  getOrElse<A>(self: Option<A>, fallback: () => A): A {
    return self._tag === "Some" ? self.value : fallback();
  },
};

// "Option" is both a type and a namespace of functions
const val: Option<number> = Option.some(42);
const doubled = Option.map(val, (n) => n * 2);
const result = Option.getOrElse(doubled, () => 0);
```

---

## 8. 递归类型 (Recursive Types)

类型别名可以引用自身，表示嵌套或递归数据结构：

```typescript
// JSON type — covers all valid JSON values
type Json = string | number | boolean | null | Json[] | { [key: string]: Json };

// DeepPartial — recursive optional
type DeepPartial<T> = T extends Function ? T
  : T extends object ? { [K in keyof T]?: DeepPartial<T[K]> }
  : T;

// Tree structure
interface TreeNode<T> {
  value: T;
  children: TreeNode<T>[];
}

function mapTree<T, U>(node: TreeNode<T>, fn: (v: T) => U): TreeNode<U> {
  return {
    value: fn(node.value),
    children: node.children.map((c) => mapTree(c, fn)),
  };
}

// Type-level recursion: flatten nested array type
type DeepFlatten<T> = T extends (infer E)[] ? DeepFlatten<E> : T;
type Flat = DeepFlatten<number[][][]>;  // number
```

---

## 9. const 类型参数 (const Type Parameters — TS 5.0+)

泛型函数前加 `const` 修饰符，令 TS 自动推断为 **最窄的字面量类型**——无需调用方写 `as const`。

```typescript
// Without const: T inferred as string[]
function getRoutes<T extends readonly string[]>(routes: T): T { return routes; }
const r1 = getRoutes(["home", "about"]);  // string[]

// With const: T inferred as readonly ["home", "about"]
function getRoutesConst<const T extends readonly string[]>(routes: T): T { return routes; }
const r2 = getRoutesConst(["home", "about"]);  // readonly ["home", "about"]

// Practical: type-safe config builder
function defineConfig<const T extends { name: string; features: readonly string[] }>(config: T): T {
  return config;
}
const cfg = defineConfig({ name: "app", features: ["auth", "i18n"] });
// typeof cfg = { name: "app"; features: readonly ["auth", "i18n"] }
// Without const: { name: string; features: string[] }

// Works with objects too — deep literal inference
function createEnum<const T extends Record<string, number>>(obj: T): T { return obj; }
const Status = createEnum({ Active: 1, Inactive: 0 });
// typeof Status = { Active: 1; Inactive: 0 } — not { Active: number; Inactive: number }
```

**何时使用**: 库 API 需要保留调用方传入的字面量类型时——路由定义、配置对象、枚举构造器。

---

## 推荐资源

| 资源 | 说明 |
|------|------|
| [Type Challenges](https://github.com/type-challenges/type-challenges) | 中级/高级题目专练类型体操 |
| [Total TypeScript](https://www.totaltypescript.com/) | Matt Pocock 的高级 TypeScript 教程 |
| [TypeScript GitHub Issues](https://github.com/microsoft/TypeScript/issues) | 高级类型讨论和 RFC |
| [Effect-TS](https://effect.website/) | 大量使用命名空间模式的实际项目 |

---

## 检查点

- [ ] 能编写带 `infer` 的条件类型
- [ ] 能创建带键重映射 (`as`) 的映射类型
- [ ] 能实现品牌类型防止 ID 混用
- [ ] 能使用可辨识联合 + `never` 穷举检查
- [ ] 理解命名空间模式及其在 Effect 生态中的应用
- [ ] 能编写递归类型 (DeepPartial, JSON, Tree)

---

## 下一步

→ [Stage 04: 异步编程](../../04-async-programming/notes/)
