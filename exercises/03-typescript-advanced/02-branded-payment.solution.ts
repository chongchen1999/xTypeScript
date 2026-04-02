/**
 * Solution: 03-02 Branded Types for a Payment System
 */

declare const __brand: unique symbol;
type Brand<T, B extends string> = T & { readonly [__brand]: B };

type USD = Brand<number, "USD">;
type EUR = Brand<number, "EUR">;

function usd(amount: number): USD {
  return amount as USD;
}
function eur(amount: number): EUR {
  return amount as EUR;
}

function addUSD(a: USD, b: USD): USD {
  return usd(a + b);
}

function convertToEUR(amount: USD, rate: number): EUR {
  return eur((amount as number) * rate);
}

function formatUSD(amount: USD): string {
  return `$${(amount as number).toFixed(2)}`;
}

// --- manual tests ---
const price = usd(10.5);
const tax   = usd(1.05);
const total = addUSD(price, tax);
console.log(formatUSD(total));          // "$11.55"
console.log(convertToEUR(total, 0.92)); // EUR ~10.626
