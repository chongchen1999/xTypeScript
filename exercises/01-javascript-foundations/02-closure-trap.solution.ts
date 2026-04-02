/**
 * Solution: 01-02 Closure Trap Fix
 */

export function makeAddersBuggy(): Array<() => number> {
  const adders: Array<() => number> = [];
  for (var i = 0; i < 5; i++) {
    adders.push(() => i);
  }
  return adders;
}

// --- explanation ---
// `var` is function-scoped: there is only ONE variable `i` shared by all closures.
// After the loop, `i` is 5. Every closure captures a reference to the same `i`,
// so they all return 5. This mirrors the Python gotcha:
//   [lambda: i for i in range(5)]  — all return 4

// --- fix using `let` ---
export function makeAdders(): Array<() => number> {
  const adders: Array<() => number> = [];
  for (let i = 0; i < 5; i++) {
    // `let` is block-scoped: each iteration gets its own `i` binding
    adders.push(() => i);
  }
  return adders;
}

// --- bonus one-liner ---
export const makeAddersOneLiner = (): Array<() => number> =>
  Array.from({ length: 5 }, (_, i) => () => i);

// --- manual test ---
const adders = makeAdders();
console.log(adders[0]()); // 0
console.log(adders[3]()); // 3
console.log(adders[4]()); // 4
