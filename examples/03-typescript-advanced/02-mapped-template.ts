/**
 * Mapped types and template literal types
 * Run: bun examples/03-typescript-advanced/02-mapped-template.ts
 */

// --- 1. Basic mapped types ---
type Optional<T>  = { [K in keyof T]?: T[K] };
type Nullable<T>  = { [K in keyof T]: T[K] | null };
type Mutable<T>   = { -readonly [K in keyof T]: T[K] };    // strip readonly
type Required2<T> = { [K in keyof T]-?: T[K] };             // strip optional

interface Config {
  readonly host: string;
  readonly port?: number;
}
type MutableConfig = Mutable<Config>;       // host and port are mutable
type FullConfig    = Required2<Config>;     // port is no longer optional

// --- 2. Key remapping with `as` (TS 4.1+) ---
// Add "get" prefix — like generating getter methods in C++ with macros
type Getters<T> = {
  [K in keyof T as `get${Capitalize<string & K>}`]: () => T[K];
};

type UserGetters = Getters<{ name: string; age: number }>;
// { getName: () => string; getAge: () => number }

// Filter keys by value type — keep only optional fields
type OptionalKeys<T> = {
  [K in keyof T as undefined extends T[K] ? K : never]: T[K];
};
type OnlyOptional = OptionalKeys<{ a: string; b?: number; c?: boolean }>;
// { b?: number; c?: boolean }

// --- 3. Template literal types --- (type-level string operations)
type EventName  = "click" | "focus" | "blur";
type HandlerKey = `on${Capitalize<EventName>}`;
// "onClick" | "onFocus" | "onBlur"

// Cartesian product of two unions
type Prefix = "get" | "set";
type Resource = "User" | "Post" | "Comment";
type ApiMethod = `${Prefix}${Resource}`;
// "getUser" | "getPost" | "getComment" | "setUser" | "setPost" | "setComment"

// --- 4. Combined: type-safe event handler object ---
type EventPayloads = {
  click:  { x: number; y: number };
  submit: { form: string; data: Record<string, string> };
  error:  { message: string; code: number };
};

type EventHandlerMap = {
  [K in keyof EventPayloads as `on${Capitalize<K & string>}`]:
    (payload: EventPayloads[K]) => void;
};
// {
//   onClick:  (payload: { x: number; y: number }) => void;
//   onSubmit: (payload: { form: string; data: ... }) => void;
//   onError:  (payload: { message: string; code: number }) => void;
// }

// Runtime implementation that satisfies the type
const handlers: EventHandlerMap = {
  onClick:  ({ x, y }) => console.log(`Click at (${x}, ${y})`),
  onSubmit: ({ form })  => console.log(`Form ${form} submitted`),
  onError:  ({ message, code }) => console.error(`[${code}] ${message}`),
};

handlers.onClick({ x: 100, y: 200 });
handlers.onError({ message: "Not found", code: 404 });

console.log("Mapped + template literal types verified ✓");
