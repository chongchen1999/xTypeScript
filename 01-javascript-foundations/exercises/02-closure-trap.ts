/**
 * Exercise 01-02: Closure Trap Fix
 *
 * The function below has a classic closure-in-loop bug.
 * 1. Explain (in a comment) why all callbacks print the same value.
 * 2. Fix it using `let` (or any other correct approach).
 * 3. As a bonus, implement `makeAdders` using Array.from so it is a one-liner.
 */

// --- buggy version (do NOT modify this) ---
export function makeAddersBuggy(): Array<() => number> {
  const adders: Array<() => number> = [];
  for (var i = 0; i < 5; i++) {
    adders.push(() => i); // BUG: all closures share the same `i`
  }
  return adders;
}

// --- TODO: explain the bug ---
// Why does makeAddersBuggy()[0]() return 5 instead of 0?
// Answer: ...

// --- TODO: fix version ---
export function makeAdders(): Array<() => number> {
  // TODO: implement — adders[k]() should return k
  throw new Error("Not implemented");
}

// --- TODO: bonus one-liner using Array.from ---
export const makeAddersOneLiner = (): Array<() => number> => {
  // TODO: implement
  throw new Error("Not implemented");
};

// --- manual test ---
const adders = makeAdders();
console.log(adders[0]()); // 0
console.log(adders[3]()); // 3
console.log(adders[4]()); // 4
