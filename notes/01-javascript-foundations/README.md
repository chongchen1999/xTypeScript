# Stage 01: JavaScript 基础 — 写给 C++/Python 开发者

> **前置要求**: 具备 C++/Python 编程经验，了解基本数据结构与 OOP 概念
> **预计时间**: 3–5 天
> **目标**: 以你熟悉的 C++/Python 概念为锚点，快速建立 JavaScript 心智模型

---

## 学习目标

- 理解 JS 执行模型与 C++/Python 的区别（event loop、单线程）
- 掌握闭包、解构、spread/rest
- 理解原型链与 `this` 绑定
- 了解 ES modules vs CommonJS
- 掌握迭代器和生成器

---

## 1. 变量与作用域 (Variables & Scope)

JavaScript 有三种声明变量的方式：`var`、`let`、`const`。现代代码中几乎只用 `let` 和 `const`。

**核心区别**:

| 特性 | `var` | `let` | `const` |
|------|-------|-------|---------|
| Scope | Function | Block | Block |
| Hoisting | Yes (initialized to `undefined`) | Yes (TDZ) | Yes (TDZ) |
| Re-declaration | Allowed | Not allowed | Not allowed |
| Re-assignment | Allowed | Allowed | Not allowed |

> **TDZ (Temporal Dead Zone)**: `let`/`const` 声明会被提升，但在声明语句之前访问会抛出 `ReferenceError`。这比 `var` 的隐式 `undefined` 更安全。

**与 C++ 对比**: C++ 变量默认是 block scope（和 `let`/`const` 一致）。`var` 的 function scope 在 C++ 中没有对应概念。

**与 Python 对比**: Python 使用 LEGB (Local → Enclosing → Global → Built-in) 规则，变量无需声明关键字。JS 的 `let`/`const` block scope 比 Python 更接近 C++ 的行为。

```typescript
// Block scoping — let/const are confined to the block
function scopeDemo(): void {
  if (true) {
    var x = 1;    // visible in entire function
    let y = 2;    // only visible in this if-block
    const z = 3;  // only visible in this if-block
  }
  console.log(x); // 1
  // console.log(y); // ReferenceError
  // console.log(z); // ReferenceError
}

// const prevents re-assignment, NOT mutation
const arr: number[] = [1, 2, 3];
arr.push(4);       // OK — mutating the array
// arr = [5, 6];   // Error — re-assigning the binding
```

> **最佳实践**: 默认使用 `const`，只在需要重新赋值时使用 `let`，永远不用 `var`。

---

## 2. 函数与闭包 (Functions & Closures)

JavaScript 的函数是 **first-class citizens**，可以赋值给变量、作为参数传递、从函数返回。这与 Python 类似，但比 C++（需要 `std::function` 或 function pointer）更自然。

### 函数的多种形式

```typescript
// Function declaration — hoisted to the top of the scope
function add(a: number, b: number): number {
  return a + b;
}

// Function expression — not hoisted
const subtract = function (a: number, b: number): number {
  return a - b;
};

// Arrow function — concise syntax, lexical `this`
const multiply = (a: number, b: number): number => a * b;

// IIFE (Immediately Invoked Function Expression)
// Used for creating isolated scope — like an anonymous namespace in C++
const result = (() => {
  const secret = 42;
  return secret * 2;
})();
```

### 闭包 (Closures)

闭包是指函数能「记住」并访问定义时所在作用域的变量，即使函数在该作用域之外执行。

**与 C++ 对比**: C++ lambda 需要显式声明 capture (`[&]`, `[=]`, `[x]`)。JS 闭包自动捕获所有外层变量（类似 C++ 的 `[&]`，但按引用绑定到变量本身）。

**与 Python 对比**: Python 闭包行为类似，但修改外层变量需要 `nonlocal` 关键字。JS 的 `let`/`const` 没有这个限制。

```typescript
// Factory pattern — closure captures `count`
function createCounter(initial: number = 0) {
  let count = initial;
  return {
    increment: () => ++count,
    decrement: () => --count,
    getCount: () => count,
  };
}

const counter = createCounter(10);
console.log(counter.increment()); // 11
console.log(counter.increment()); // 12
console.log(counter.getCount());  // 12
```

### 经典陷阱: 循环中的闭包

这是 JS 面试高频题，也是从 C++/Python 转过来最容易踩的坑之一：

```typescript
// BUG: var is function-scoped, all closures share the same `i`
function buggyLoop(): void {
  const fns: (() => void)[] = [];
  for (var i = 0; i < 3; i++) {
    fns.push(() => console.log(i));
  }
  fns.forEach((f) => f()); // 3, 3, 3 — not 0, 1, 2!
}

// FIX: let is block-scoped, each iteration gets its own `i`
function fixedLoop(): void {
  const fns: (() => void)[] = [];
  for (let i = 0; i < 3; i++) {
    fns.push(() => console.log(i));
  }
  fns.forEach((f) => f()); // 0, 1, 2
}
```

> **Python 中也有类似问题**: `[lambda: i for i in range(3)]` 全部返回 2。修复方式是用默认参数 `lambda i=i: i`。

---

## 3. 解构与展开 (Destructuring & Spread)

解构赋值让你从数组或对象中高效提取值。这是 JS/TS 代码中使用频率极高的语法。

**与 C++17 对比**: Structured bindings (`auto [x, y] = pair;`) 概念相似但功能更有限。

**与 Python 对比**: 非常接近 Python 的 unpacking (`a, b, *rest = [1, 2, 3, 4]`)。

```typescript
// Object destructuring with rename and default value
interface Config {
  host: string;
  port?: number;
  protocol?: string;
}

const config: Config = { host: "localhost", port: 8080 };
const { host, port = 3000, protocol: proto = "https" } = config;
// host = "localhost", port = 8080 (not 3000!), proto = "https"

// Array destructuring — swap without temp variable
let a = 1, b = 2;
[a, b] = [b, a]; // Python: a, b = b, a

// Rest parameters — like Python's *args
function sum(first: number, ...rest: number[]): number {
  return rest.reduce((acc, val) => acc + val, first);
}
console.log(sum(1, 2, 3, 4)); // 10

// Spread operator — shallow copy and merge
const defaults = { theme: "dark", lang: "en", debug: false };
const userPrefs = { lang: "zh", debug: true };
const merged = { ...defaults, ...userPrefs };
// { theme: "dark", lang: "zh", debug: true }
```

### 函数参数解构 — 实际开发中最常见的用法

```typescript
interface FetchOptions {
  url: string;
  method?: string;
  headers?: Record<string, string>;
  timeout?: number;
}

function fetchData({
  url,
  method = "GET",
  headers = {},
  timeout = 5000,
}: FetchOptions): void {
  console.log(`${method} ${url} timeout=${timeout}`);
}

fetchData({ url: "https://api.example.com/data" });
```

---

## 4. 原型链与 this (Prototypes & `this`)

JavaScript 的 OOP 基于 **原型链 (prototype chain)**，而非 C++/Python 的 class-based 继承。ES6 `class` 语法只是原型链的语法糖。

### 原型链

每个对象都有一个内部属性 `[[Prototype]]`（可通过 `Object.getPrototypeOf()` 访问）。属性查找会沿着原型链向上搜索，直到 `null`。

```typescript
class Animal {
  constructor(public name: string) {}
  speak(): string {
    return `${this.name} makes a sound`;
  }
}

class Dog extends Animal {
  speak(): string {
    return `${this.name} barks`;
  }
}

const dog = new Dog("Rex");
console.log(dog.speak()); // "Rex barks"

// Prototype chain: dog → Dog.prototype → Animal.prototype → Object.prototype → null
console.log(Object.getPrototypeOf(dog) === Dog.prototype);            // true
console.log(Object.getPrototypeOf(Dog.prototype) === Animal.prototype); // true
```

### `this` 绑定规则

这是从 C++/Python 转到 JS 时最困惑的概念之一。**`this` 的值取决于函数的调用方式，而非定义位置**。

| 规则 | 调用方式 | `this` 指向 |
|------|---------|------------|
| Default | `fn()` | `undefined` (strict) / `globalThis` |
| Implicit | `obj.fn()` | `obj` |
| Explicit | `fn.call(obj)` / `fn.apply(obj)` / `fn.bind(obj)` | `obj` |
| `new` | `new Fn()` | 新创建的对象 |
| Arrow | `() => {}` | 继承外层 `this` (lexical) |

**与 C++ 对比**: C++ 的 `this` 始终指向当前对象，不会因调用方式而改变。JS 的 `this` 是动态绑定的。

**与 Python 对比**: Python 的 `self` 是显式参数，不可能丢失绑定。JS 的 `this` 是隐式的，容易出错。

```typescript
class Timer {
  private seconds = 0;

  // BUG: regular function loses `this` when passed as callback
  startBuggy(): void {
    setInterval(function () {
      this.seconds++; // `this` is undefined or global, not Timer!
    }, 1000);
  }

  // FIX: arrow function captures lexical `this`
  startFixed(): void {
    setInterval(() => {
      this.seconds++; // `this` correctly refers to Timer instance
    }, 1000);
  }
}

// Explicit binding
function greet(this: { name: string }, greeting: string): string {
  return `${greeting}, ${this.name}`;
}

const user = { name: "Alice" };
console.log(greet.call(user, "Hi")); // "Hi, Alice"
```

> **经验法则**: 在 class 方法作为 callback 传递时，始终用 arrow function 或 `.bind(this)`。

---

## 5. 迭代器与生成器 (Iterators & Generators)

### 迭代器协议 (Iterator Protocol)

任何实现了 `Symbol.iterator` 方法的对象都是可迭代的 (iterable)。这与 Python 的 `__iter__` / `__next__` 以及 C++ 的 `begin()` / `end()` 概念对应。

```typescript
// Custom iterable — a Range class like Python's range()
class Range implements Iterable<number> {
  constructor(
    private start: number,
    private end: number,
    private step: number = 1
  ) {}

  [Symbol.iterator](): Iterator<number> {
    let current = this.start;
    const end = this.end;
    const step = this.step;

    return {
      next(): IteratorResult<number> {
        if (current < end) {
          const value = current;
          current += step;
          return { value, done: false };
        }
        return { value: undefined, done: true };
      },
    };
  }
}

for (const n of new Range(0, 5)) {
  console.log(n); // 0, 1, 2, 3, 4
}

const nums = [...new Range(0, 10, 2)]; // [0, 2, 4, 6, 8]
```

### 生成器 (Generators)

Generator 使用 `function*` 语法和 `yield` 关键字，等价于 Python 的 generator function。

**与 Python 对比**: 几乎相同的概念和语法 (`def gen():` → `function* gen()`, `yield` → `yield`)。

**与 C++20 对比**: 类似 coroutines (`co_yield`)，但语法更简洁。

```typescript
// Infinite lazy sequence — like Python generators
function* fibonacci(): Generator<number> {
  let [a, b] = [0, 1];
  while (true) {
    yield a;
    [a, b] = [b, a + b];
  }
}

function take<T>(n: number, iter: Iterable<T>): T[] {
  const result: T[] = [];
  for (const val of iter) {
    result.push(val);
    if (result.length >= n) break;
  }
  return result;
}

console.log(take(10, fibonacci()));
// [0, 1, 1, 2, 3, 5, 8, 13, 21, 34]

// yield* delegates to another iterable — like Python's `yield from`
function* concat<T>(...iterables: Iterable<T>[]): Generator<T> {
  for (const iter of iterables) {
    yield* iter;
  }
}

console.log([...concat([1, 2], [3, 4], [5])]); // [1, 2, 3, 4, 5]
```

---

## 6. 模块系统 (Module System)

JavaScript 有两套主流模块系统。现代项目（包括所有 TypeScript 项目）推荐使用 **ES Modules**。

### ES Modules (ESM) — 推荐

```typescript
// math.ts — Named exports
export const PI = 3.14159;
export function square(x: number): number {
  return x * x;
}

// Default export — one per module
export default class Calculator {
  add(a: number, b: number): number { return a + b; }
}

// main.ts — Import
import Calculator, { PI, square } from "./math";
import * as MathUtils from "./math";          // namespace import
import { square as sq } from "./math";        // rename
```

### CommonJS (CJS) — Node.js 传统方式

```javascript
// math.js
const PI = 3.14159;
function square(x) { return x * x; }
module.exports = { PI, square };

// main.js
const { PI, square } = require("./math");
```

### 两者对比

| 特性 | ESM | CommonJS |
|------|-----|----------|
| Syntax | `import` / `export` | `require()` / `module.exports` |
| Loading | Static (compile-time) | Dynamic (runtime) |
| Tree-shaking | Yes | Limited |

**与 C++ 对比**: ESM 的 static import 类似 C++20 modules，CommonJS 更像 `#include`（运行时替换）。

**与 Python 对比**: ESM 类似 `from module import name`，但 Python import 是 runtime 的，ESM 是 static 的。

> **TypeScript 项目**: 始终使用 ESM 语法。`tsconfig.json` 中通过 `module` 选项控制编译输出格式。

---

## 推荐资源

| 资源 | 说明 |
|------|------|
| [MDN JavaScript Guide](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide) | 最权威的参考文档 |
| [JavaScript.info](https://javascript.info/) | 现代 JavaScript 教程，结构清晰 |
| [You Don't Know JS](https://github.com/getify/You-Dont-Know-JS) | 深入理解 JS 内部机制 |
| [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/) | 官方 TS 文档 |

---

## 检查点

完成以下所有项目后，进入 Stage 02：

- [ ] 能解释 `let`、`const`、`var` 的区别以及 TDZ 的含义
- [ ] 能编写闭包并正确捕获外部变量（包括循环场景）
- [ ] 能使用解构赋值处理函数参数和返回值
- [ ] 理解 arrow function 没有自己的 `this`，并能解释为什么
- [ ] 能用 `Symbol.iterator` 创建自定义可迭代对象
- [ ] 清楚 ESM 和 CommonJS 的区别，知道 TypeScript 中应该用哪种

---

## 下一步

→ [Stage 02: TypeScript 核心](../02-typescript-core/)
