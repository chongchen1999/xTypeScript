/**
 * Closures & `this` binding
 * Run: bun examples/01-javascript-foundations/01-closures-and-this.ts
 */

// --- 1. Factory closure — private state without a class ---
function createCounter(initial = 0) {
  let count = initial;
  return {
    increment: () => ++count,
    decrement: () => --count,
    reset: () => { count = initial; },
    get: () => count,
  };
}

const c = createCounter(10);
console.log(c.increment()); // 11
console.log(c.increment()); // 12
console.log(c.decrement()); // 11
c.reset();
console.log(c.get());       // 10

// --- 2. Closure loop trap (var vs let) ---
// C++ equivalent: capturing loop variable by reference vs by value
const byRef: (() => number)[] = [];
for (var i = 0; i < 3; i++) byRef.push(() => i);
console.log(byRef.map(f => f())); // [3, 3, 3] — all share the same `i`

const byVal: (() => number)[] = [];
for (let j = 0; j < 3; j++) byVal.push(() => j);
console.log(byVal.map(f => f())); // [0, 1, 2] — each iteration has its own `j`

// --- 3. `this` binding — dynamic vs lexical ---
class Timer {
  elapsed = 0;

  // Arrow method: `this` captured at definition time (like Python's bound method)
  tick = () => { this.elapsed++; };

  // Regular method: `this` depends on the call site
  tickRegular() { this.elapsed++; }
}

const timer = new Timer();
const tickFn = timer.tick;       // detached — but arrow keeps `this`
tickFn(); tickFn();
console.log(timer.elapsed); // 2

const tickRegular = timer.tickRegular;
try {
  tickRegular(); // TypeError in strict mode — `this` is undefined
} catch (e) {
  console.log("lost this:", (e as Error).message);
}

// Fix with explicit bind — like C++'s std::bind or Python's functools.partial
const bound = timer.tickRegular.bind(timer);
bound();
console.log(timer.elapsed); // 3
