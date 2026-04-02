/**
 * Exercise 07d-02: Mock / Spy System
 *
 * Build a mock/spy system that wraps functions to record calls and return values.
 *
 * Requirements:
 * - `createSpy(fn?)` returns a callable SpyFn that wraps the original function
 * - SpyFn tracks: calls (array of argument tuples), returnValues, callCount
 * - `mockReturnValue(val)` overrides the return value for all subsequent calls
 * - `mockImplementation(fn)` replaces the underlying function entirely
 * - `reset()` clears all recorded calls, return values, and callCount
 * - If no `fn` is provided, the spy is a no-op that returns undefined
 */

export interface SpyFn<T extends (...args: any[]) => any> {
  (...args: Parameters<T>): ReturnType<T>;
  calls: Parameters<T>[];
  returnValues: ReturnType<T>[];
  callCount: number;
  mockReturnValue(val: ReturnType<T>): void;
  mockImplementation(fn: T): void;
  reset(): void;
}

// TODO: implement
export function createSpy<T extends (...args: any[]) => any>(fn?: T): SpyFn<T> {
  throw new Error("Not implemented");
}

// --- manual test (run with: bun exercises/02-mock-system.ts) ---
const add = createSpy((a: number, b: number) => a + b);

console.log(add(1, 2)); // 3
console.log(add(3, 4)); // 7
console.log("callCount:", add.callCount); // 2
console.log("calls:", add.calls); // [[1,2], [3,4]]
console.log("returnValues:", add.returnValues); // [3, 7]

add.mockReturnValue(42);
console.log(add(0, 0)); // 42

add.mockImplementation((a, b) => a * b);
console.log(add(3, 5)); // 15

add.reset();
console.log("after reset — callCount:", add.callCount); // 0

// Spy with no function
const noop = createSpy();
noop("hello");
console.log("noop callCount:", noop.callCount); // 1
console.log("noop returnValues:", noop.returnValues); // [undefined]
