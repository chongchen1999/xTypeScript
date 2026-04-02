/**
 * Iterators and generators
 * Run: bun examples/01-javascript-foundations/03-iterators-generators.ts
 */

// --- 1. Custom iterable — like C++ begin()/end() or Python __iter__ ---
class Range implements Iterable<number> {
  constructor(
    private start: number,
    private end: number,
    private step = 1,
  ) {}

  [Symbol.iterator](): Iterator<number> {
    let cur = this.start;
    const { end, step } = this;
    return {
      next(): IteratorResult<number> {
        if (cur < end) {
          const value = cur;
          cur += step;
          return { value, done: false };
        }
        return { value: undefined as any, done: true };
      },
    };
  }
}

console.log([...new Range(0, 5)]);       // [0, 1, 2, 3, 4]
console.log([...new Range(0, 10, 2)]);   // [0, 2, 4, 6, 8]

// --- 2. Infinite generator — like Python's itertools.count ---
function* naturals(from = 0): Generator<number> {
  let n = from;
  while (true) yield n++;
}

function take<T>(n: number, iter: Iterable<T>): T[] {
  const result: T[] = [];
  for (const v of iter) {
    result.push(v);
    if (result.length >= n) break;
  }
  return result;
}

console.log(take(5, naturals(10))); // [10, 11, 12, 13, 14]

// --- 3. Generator pipeline (lazy transformation chain) ---
function* map<T, U>(iter: Iterable<T>, fn: (v: T) => U): Generator<U> {
  for (const v of iter) yield fn(v);
}

function* filter<T>(iter: Iterable<T>, pred: (v: T) => boolean): Generator<T> {
  for (const v of iter) if (pred(v)) yield v;
}

// Compute first 5 even squares lazily
const evenSquares = filter(
  map(naturals(1), n => n * n),
  n => n % 2 === 0,
);
console.log(take(5, evenSquares)); // [4, 16, 36, 64, 100]

// --- 4. Two-way generator communication (like coroutines in C++20) ---
function* accumulator(): Generator<number, void, number> {
  let sum = 0;
  while (true) {
    const n = yield sum; // yield current sum, receive next number
    sum += n;
  }
}

const acc = accumulator();
acc.next();      // start — reaches first yield
console.log(acc.next(10).value); // 10
console.log(acc.next(20).value); // 30
console.log(acc.next(5).value);  // 35

// --- 5. yield* delegation — like Python's yield from ---
function* flatten<T>(arrays: T[][]): Generator<T> {
  for (const arr of arrays) yield* arr;
}
console.log([...flatten([[1, 2], [3, 4], [5]])]); // [1, 2, 3, 4, 5]
