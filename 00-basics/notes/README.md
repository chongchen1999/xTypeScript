# Stage 00: TypeScript 基础入门 — 写给 C++/Python 开发者

> **前置要求**: 具备 C++/Python 编程经验，了解基本数据类型与控制流
> **预计时间**: 1–2 天
> **目标**: 快速了解 TypeScript 是什么、如何运行，以及最基础的类型语法

---

## 学习目标

- 理解 TypeScript 与 JavaScript 的关系
- 掌握基本类型标注语法
- 理解 `interface` 与 `type` 的基本用法
- 掌握数组、元组、枚举的用法
- 理解 `any`、`unknown`、`never`、`void` 的区别
- 了解如何用 Bun 直接运行 `.ts` 文件

---

## 0. TypeScript 是什么？

TypeScript 是 JavaScript 的**超集**——所有合法的 JS 代码都是合法的 TS 代码。TS 在 JS 之上添加了**静态类型系统**，在编译期捕获类型错误，编译后生成纯 JS 运行。

**与 C++ 对比**: C++ 也是静态类型，但类型信息保留到运行时（RTTI）。TS 的类型在编译后**完全擦除**，运行时没有类型信息。

**与 Python 对比**: Python 3.5+ 的 type hints 是可选的、不强制的。TS 的类型检查是**强制的**（可配置严格程度）。

```
TypeScript → (tsc / Bun) → JavaScript → Runtime
                                         ↑
                         类型信息在此阶段被完全擦除
```

> **关键概念**: TS 类型系统是 **structural typing**（看结构/形状），不是 C++ 那种 **nominal typing**（看类名）。两个不相关的 interface，只要字段匹配就可以互换使用。

---

## 1. 环境搭建与运行

本项目使用 [Bun](https://bun.sh) 作为运行时，它原生支持 TypeScript，无需编译步骤。

```bash
# 安装 Bun
curl -fsSL https://bun.sh/install | bash

# 直接运行 .ts 文件
bun 00-basics/examples/01-primitive-types.ts
```

**与 C++ 对比**: 不需要 `g++ -o main main.cpp && ./main` 两步编译+运行，Bun 一步完成。

**与 Python 对比**: 和 `python main.py` 一样方便，但多了编译期类型检查。

---

## 2. 基本类型 (Primitive Types)

TypeScript 的基本类型直接对应 JavaScript 的原始值类型：

| TypeScript | C++ 近似 | Python 近似 | 说明 |
|-----------|----------|------------|------|
| `number` | `double` | `float` | 所有数字都是 64-bit 浮点数 |
| `string` | `std::string` | `str` | 不可变，UTF-16 编码 |
| `boolean` | `bool` | `bool` | `true` / `false` |
| `null` | `nullptr` | `None` | 明确表示"空" |
| `undefined` | (无对应) | (无对应) | 未赋值的默认状态 |
| `bigint` | (无对应) | `int` | 任意精度整数 |
| `symbol` | (无对应) | (无对应) | 全局唯一标识符 |

> **注意**: JS/TS 没有 `int` 类型。`number` 始终是浮点数。整数运算在安全范围内 (`Number.MAX_SAFE_INTEGER = 2^53 - 1`) 是精确的。

```typescript
// Type annotations — variable: Type
let count: number = 42;
let name: string = "Alice";
let active: boolean = true;

// Type inference — TS can infer the type from the initial value
let score = 100;          // inferred as `number`
let greeting = "hello";   // inferred as `string`

// null and undefined are distinct types
let absent: null = null;
let missing: undefined = undefined;
```

### `null` vs `undefined`

这是 C++/Python 开发者最困惑的点之一：JS 有**两个**"空值"。

| | `null` | `undefined` |
|--|--------|-------------|
| 含义 | 开发者明确赋值为"空" | 变量声明了但未赋值 |
| `typeof` | `"object"` (历史 bug) | `"undefined"` |
| 使用场景 | API 返回"无结果" | 可选参数的默认值 |

> **最佳实践**: 推荐统一使用 `undefined`（TS 的可选属性 `?` 默认就是 `undefined`），除非 API 明确要求 `null`。

---

## 3. 类型标注语法 (Type Annotations)

```typescript
// Variable annotation
let age: number = 25;

// Function parameter and return type
function add(a: number, b: number): number {
  return a + b;
}

// Optional parameter — appends `| undefined` to the type
function greet(name: string, title?: string): string {
  return title ? `${title} ${name}` : `Hello, ${name}`;
}

// Default parameter — type is inferred from the default value
function repeat(text: string, times = 1): string {
  return text.repeat(times);
}

// Arrow function with type annotation
const multiply = (a: number, b: number): number => a * b;
```

**与 C++ 对比**: C++ 类型写在变量前 (`int x = 1`)，TS 类型写在变量后 (`let x: number = 1`)。TS 语法更接近 Rust (`let x: i32 = 1`)。

**与 Python 对比**: Python type hint 语法几乎一样 (`x: int = 1`)，但 Python 不强制检查。

---

## 4. 对象类型：interface 与 type (Object Types)

### interface — 描述对象的形状

```typescript
interface User {
  id: number;
  name: string;
  email: string;
  age?: number;          // optional — may be undefined
  readonly joinedAt: Date; // cannot be re-assigned after creation
}

const user: User = {
  id: 1,
  name: "Alice",
  email: "alice@example.com",
  joinedAt: new Date(),
};

// user.joinedAt = new Date(); // Error: readonly
```

### type alias — 给任意类型起别名

```typescript
type ID = number | string;   // union type
type Point = { x: number; y: number };
type Callback = (data: string) => void;

// type alias can express things interface cannot
type Status = "active" | "inactive" | "banned";  // union of literals
type Pair<T> = [T, T];                            // tuple alias
```

### interface vs type — 何时用哪个？

| 场景 | 推荐 | 原因 |
|------|------|------|
| 对象/类的结构 | `interface` | 支持 `extends`、declaration merging |
| 联合类型、交叉类型 | `type` | 只有 type alias 能表达 |
| 函数类型 | `type` | 语法更清晰 |
| 通用规则 | 都可以 | 保持项目内一致即可 |

---

## 5. 数组与元组 (Arrays & Tuples)

```typescript
// Array — two equivalent syntaxes
const nums: number[] = [1, 2, 3];
const strs: Array<string> = ["a", "b", "c"];

// Tuple — fixed-length, each position has specific type
// Like C++ std::tuple or Python typing.Tuple
const point: [number, number] = [10, 20];
const entry: [string, number] = ["age", 25];

// Destructuring a tuple (common pattern for function returns)
const [key, value] = entry;

// Labeled tuples — for readability
type Range = [start: number, end: number];
const r: Range = [0, 100];

// readonly array — prevents push, pop, splice, etc.
const frozen: readonly number[] = [1, 2, 3];
// frozen.push(4); // Error: Property 'push' does not exist
```

**与 C++ 对比**: TS 数组更像 `std::vector`（动态大小），元组更像 `std::tuple`。

**与 Python 对比**: TS 数组对应 `list`，`readonly` 数组对应 `tuple`（不可变序列）。

---

## 6. 枚举 (Enums)

```typescript
// Numeric enum — auto-increments from 0
enum Direction {
  North,   // 0
  South,   // 1
  East,    // 2
  West,    // 3
}

// String enum — must assign every value explicitly
enum Color {
  Red = "#FF0000",
  Green = "#00FF00",
  Blue = "#0000FF",
}

const dir: Direction = Direction.North;
const color: Color = Color.Red;

// const enum — inlined at compile time, no runtime object
const enum HttpMethod {
  GET = "GET",
  POST = "POST",
  PUT = "PUT",
  DELETE = "DELETE",
}
// HttpMethod.GET compiles to just "GET" (no enum object in output)
```

> **现代替代方案**: 很多 TS 项目不用 enum，而是用 union of string literals：
> ```typescript
> type Direction = "N" | "S" | "E" | "W";
> ```
> 更轻量，无运行时开销，且与 TS 的 structural typing 更一致。

**与 C++ 对比**: 类似 `enum class`（scoped enum），但 string enum 在 C++ 中需要手动实现。

**与 Python 对比**: 类似 `enum.Enum`，但 TS enum 编译后是普通 JS 对象。

---

## 7. 特殊类型：any, unknown, never, void

这四个类型是 TS 类型系统的"边界"，理解它们对写好 TS 代码至关重要。

```typescript
// void — function returns nothing (like C++ void, Python -> None)
function log(msg: string): void {
  console.log(msg);
}

// any — opt out of type checking entirely (AVOID in production code)
let anything: any = 42;
anything = "hello";      // OK
anything.nonExistent();  // OK at compile time, runtime error!

// unknown — type-safe counterpart of any
// Must narrow the type before using it
let value: unknown = fetchSomething();
// value.toString(); // Error: Object is of type 'unknown'
if (typeof value === "string") {
  console.log(value.toUpperCase()); // OK — narrowed to string
}

// never — represents values that never occur
function throwError(msg: string): never {
  throw new Error(msg);
  // code after throw is unreachable
}

// never in exhaustive checks
type Shape = "circle" | "square";
function getArea(shape: Shape): number {
  switch (shape) {
    case "circle": return Math.PI;
    case "square": return 1;
    default:
      const _exhaustive: never = shape;
      return _exhaustive;
  }
}
```

### 类型安全层级

```
any (top — 接受一切，不检查任何东西)
 ↑
unknown (top — 接受一切，但使用前必须检查)
 ↑
具体类型 (string, number, User, etc.)
 ↑
never (bottom — 不可能存在的值)
```

> **经验法则**: 用 `unknown` 替代 `any`，用类型守卫 (type guard) 来收窄类型。`any` 是 TS 类型系统的"逃生舱"，应该尽量避免使用。

---

## 8. 类型守卫与类型收窄 (Type Guards & Narrowing)

TS 编译器会根据控制流自动收窄类型，这是 TS 类型系统最强大的特性之一。

```typescript
// typeof narrowing
function format(value: string | number): string {
  if (typeof value === "string") {
    return value.toUpperCase();  // TS knows: string
  }
  return value.toFixed(2);       // TS knows: number
}

// Truthiness narrowing
function printName(name: string | null | undefined): void {
  if (name) {
    console.log(name.toUpperCase()); // TS knows: string (non-null)
  }
}

// instanceof narrowing
function getTimestamp(d: Date | string): number {
  if (d instanceof Date) {
    return d.getTime();   // TS knows: Date
  }
  return Date.parse(d);   // TS knows: string
}

// in narrowing
interface Dog { bark(): void }
interface Cat { meow(): void }
function speak(pet: Dog | Cat): void {
  if ("bark" in pet) {
    pet.bark();   // TS knows: Dog
  } else {
    pet.meow();   // TS knows: Cat
  }
}
```

**与 C++ 对比**: C++ 使用 `dynamic_cast` + RTTI 进行运行时类型检查，TS 的 narrowing 是编译期分析。

**与 Python 对比**: Python 的 `isinstance()` 检查只在运行时有效。TS 的 narrowing 在编译期和运行时都有保障。

---

## 推荐资源

| 资源 | 说明 |
|------|------|
| [TypeScript 官方 Handbook](https://www.typescriptlang.org/docs/handbook/) | 最权威的入门文档 |
| [TypeScript Playground](https://www.typescriptlang.org/play) | 在线试验 TS 代码，实时查看编译输出 |
| [Bun 官方文档](https://bun.sh/docs) | Bun 运行时文档 |

---

## 检查点

完成以下所有项目后，进入 Stage 01：

- [ ] 能说出 TypeScript 和 JavaScript 的关系（超集、类型擦除）
- [ ] 能用 Bun 直接运行 `.ts` 文件
- [ ] 能为变量、函数参数、返回值添加类型标注
- [ ] 理解 `interface` 和 `type` 的基本区别
- [ ] 能使用数组类型和元组类型
- [ ] 理解 `any`、`unknown`、`never`、`void` 的区别和使用场景
- [ ] 能使用 `typeof`、`instanceof`、`in` 进行类型收窄

---

## 下一步

→ [Stage 01: JavaScript 基础](../../01-javascript-foundations/notes/)
