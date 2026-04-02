/**
 * Solution: 01-03 Custom Iterator (Range)
 */

export function* range(
  startOrStop: number,
  stop?: number,
  step: number = 1,
): Generator<number> {
  // Normalize arguments — mirrors Python's range() signature
  const start = stop === undefined ? 0 : startOrStop;
  const end = stop === undefined ? startOrStop : stop;

  if (step === 0) throw new RangeError("range() step argument must not be zero");

  if (step > 0) {
    for (let i = start; i < end; i += step) yield i;
  } else {
    for (let i = start; i > end; i += step) yield i;
  }
}

// --- manual test ---
console.log([...range(5)]);           // [0, 1, 2, 3, 4]
console.log([...range(2, 7)]);        // [2, 3, 4, 5, 6]
console.log([...range(0, 10, 2)]);    // [0, 2, 4, 6, 8]
console.log([...range(5, 0, -1)]);    // [5, 4, 3, 2, 1]
console.log([...range(3, 3)]);        // []
