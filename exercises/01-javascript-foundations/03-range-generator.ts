/**
 * Exercise 01-03: Custom Iterator (Range)
 *
 * Implement a `range` generator function that behaves like Python's range().
 *
 * Signatures:
 *   range(stop)           → 0, 1, ..., stop-1
 *   range(start, stop)    → start, start+1, ..., stop-1
 *   range(start, stop, step) → start, start+step, ..., < stop
 *
 * Requirements:
 *   - Must be lazy (generator function)
 *   - Must handle negative step (counting down)
 *   - Yield nothing if the range is empty (e.g. range(5, 0) with default step)
 */

export function* range(
  startOrStop: number,
  stop?: number,
  step: number = 1,
): Generator<number> {
  // TODO: implement
}

// --- manual test ---
console.log([...range(5)]);           // [0, 1, 2, 3, 4]
console.log([...range(2, 7)]);        // [2, 3, 4, 5, 6]
console.log([...range(0, 10, 2)]);    // [0, 2, 4, 6, 8]
console.log([...range(5, 0, -1)]);    // [5, 4, 3, 2, 1]
console.log([...range(3, 3)]);        // []
