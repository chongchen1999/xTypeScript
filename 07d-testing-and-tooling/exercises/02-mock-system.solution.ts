/**
 * Solution: 07d-02 Mock / Spy System
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

export function createSpy<T extends (...args: any[]) => any>(
  fn?: T,
): SpyFn<T> {
  let impl: Function = fn ?? (() => undefined);
  let forcedReturn: { value: ReturnType<T> } | null = null;

  const spy = function (...args: Parameters<T>): ReturnType<T> {
    spy.calls.push(args);
    spy.callCount++;

    const result = forcedReturn !== null ? forcedReturn.value : impl(...args);
    spy.returnValues.push(result);
    return result;
  } as SpyFn<T>;

  spy.calls = [];
  spy.returnValues = [];
  spy.callCount = 0;

  spy.mockReturnValue = (val: ReturnType<T>) => {
    forcedReturn = { value: val };
  };

  spy.mockImplementation = (newFn: T) => {
    impl = newFn;
    forcedReturn = null;
  };

  spy.reset = () => {
    spy.calls = [];
    spy.returnValues = [];
    spy.callCount = 0;
    forcedReturn = null;
  };

  return spy;
}

// --- manual test ---
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

const noop = createSpy();
noop("hello");
console.log("noop callCount:", noop.callCount); // 1
console.log("noop returnValues:", noop.returnValues); // [undefined]
