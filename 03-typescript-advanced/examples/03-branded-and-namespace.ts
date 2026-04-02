/**
 * Branded types and discriminated unions (namespace pattern)
 * Run: bun examples/03-typescript-advanced/03-branded-and-namespace.ts
 */

// --- 1. Branded types — nominal typing in a structural type system ---
// Rust: struct UserId(String);  — a distinct type with zero overhead
// C++:  BOOST_STRONG_TYPEDEF(std::string, UserId)
declare const __brand: unique symbol;
type Brand<T, B extends string> = T & { readonly [__brand]: B };

type UserId  = Brand<string, "UserId">;
type OrderId = Brand<string, "OrderId">;
type USD     = Brand<number, "USD">;

const UserId  = (s: string): UserId  => s as UserId;
const OrderId = (s: string): OrderId => s as OrderId;
const usd     = (n: number): USD     => n as USD;

function getUser(id: UserId): string   { return `User(${id})`; }
function getOrder(id: OrderId): string { return `Order(${id})`; }

console.log(getUser(UserId("u-1")));    // OK
console.log(getOrder(OrderId("o-2")));  // OK
// getUser(OrderId("o-1")); // Compile error: OrderId ≠ UserId

// --- 2. Discriminated union with exhaustive check ---
type NetworkResult<T> =
  | { status: "ok";      data: T }
  | { status: "error";   code: number; message: string }
  | { status: "pending" };

function assertNever(x: never): never {
  throw new Error(`Unhandled case: ${JSON.stringify(x)}`);
}

function handleResult<T>(r: NetworkResult<T>): string {
  switch (r.status) {
    case "ok":      return `Success: ${JSON.stringify(r.data)}`;
    case "error":   return `Error ${r.code}: ${r.message}`;
    case "pending": return "Loading...";
    default:        return assertNever(r); // compile error if a case is missing
  }
}
console.log(handleResult({ status: "ok", data: { userId: "u-1" } }));
console.log(handleResult({ status: "error", code: 404, message: "Not found" }));
console.log(handleResult({ status: "pending" }));

// --- 3. Namespace pattern — same name for type and value (Effect style) ---
// One import gives you both the type annotation and the constructor/utility functions
type Option<A> =
  | { _tag: "Some"; value: A }
  | { _tag: "None" };

const Option = {
  some<A>(value: A): Option<A> { return { _tag: "Some", value }; },
  none: { _tag: "None" } as Option<never>,
  map<A, B>(opt: Option<A>, fn: (a: A) => B): Option<B> {
    return opt._tag === "Some" ? Option.some(fn(opt.value)) : Option.none;
  },
  getOrElse<A>(opt: Option<A>, fallback: A): A {
    return opt._tag === "Some" ? opt.value : fallback;
  },
};

const doubled = Option.map(Option.some(21), n => n * 2);
console.log(Option.getOrElse(doubled, 0));        // 42
console.log(Option.getOrElse(Option.none, -1));   // -1
