/**
 * Exercise 03-02: Branded Types for a Payment System
 *
 * A payment system handles multiple currencies.
 * Without branded types, it is easy to accidentally mix up USD and EUR amounts.
 *
 * Tasks:
 *  1. Define branded types USD and EUR.
 *  2. Implement constructor functions `usd(n)` and `eur(n)`.
 *  3. Implement `addUSD`, `convertToEUR`, and `formatUSD`.
 *  4. Ensure that passing EUR to `addUSD` is a compile-time error.
 */

declare const __brand: unique symbol;
type Brand<T, B extends string> = T & { readonly [__brand]: B };

// TODO: define USD and EUR branded types
type USD = any;
type EUR = any;

// TODO: constructor functions
function usd(amount: number): USD {
  throw new Error("Not implemented");
}
function eur(amount: number): EUR {
  throw new Error("Not implemented");
}

// TODO: implement — should only accept USD
function addUSD(a: USD, b: USD): USD {
  throw new Error("Not implemented");
}

// TODO: implement — converts USD to EUR at a given rate
function convertToEUR(amount: USD, rate: number): EUR {
  throw new Error("Not implemented");
}

// TODO: implement — returns a formatted string like "$12.50"
function formatUSD(amount: USD): string {
  throw new Error("Not implemented");
}

// --- manual tests ---
const price = usd(10.5);
const tax   = usd(1.05);
const total = addUSD(price, tax);
console.log(formatUSD(total));                   // "$11.55"
console.log(convertToEUR(total, 0.92));          // EUR amount

// The following should be a TypeScript compile error:
// addUSD(price, eur(1)); // cannot pass EUR as USD
