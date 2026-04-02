/**
 * Event loop, Promise combinators, and async/await patterns
 * Run: bun examples/04-async-programming/01-event-loop-promises.ts
 */

// --- 1. Execution order: sync → microtask → macrotask ---
console.log("1: sync start");

setTimeout(() => console.log("4: macrotask (setTimeout)"), 0);

Promise.resolve()
  .then(() => console.log("2: microtask (Promise.then)"))
  .then(() => console.log("3: microtask (chained)"));

console.log("1: sync end");
// Output order: 1 start → 1 end → 2 → 3 → 4

// --- 2. Promise combinators ---
async function delay(ms: number, label: string): Promise<string> {
  return new Promise(resolve => setTimeout(() => resolve(label), ms));
}

// Promise.all — fail fast (like Rust's join! macro)
const all = await Promise.all([delay(100, "A"), delay(50, "B"), delay(150, "C")]);
console.log("all:", all); // ["A", "B", "C"]

// Promise.allSettled — never rejects, collects all results
const mixed = await Promise.allSettled([
  Promise.resolve("ok"),
  Promise.reject(new Error("boom")),
  delay(50, "late"),
]);
for (const r of mixed) {
  if (r.status === "fulfilled") console.log("fulfilled:", r.value);
  else                          console.log("rejected:", r.reason.message);
}

// Promise.race — first settled wins
const first = await Promise.race([delay(200, "slow"), delay(50, "fast")]);
console.log("race:", first); // "fast"

// Promise.any — first fulfilled wins (ignores rejections until all fail)
const firstOk = await Promise.any([
  Promise.reject("err1"),
  delay(80, "second"),
  delay(50, "first_ok"),
]);
console.log("any:", firstOk); // "first_ok"

// --- 3. Sequential vs concurrent ---
const t0 = Date.now();

// Sequential: 200ms total
const seq: string[] = [];
seq.push(await delay(100, "seq-A"));
seq.push(await delay(100, "seq-B"));
console.log(`sequential: ${Date.now() - t0}ms`, seq);

// Concurrent: ~100ms total
const t1 = Date.now();
const [concA, concB] = await Promise.all([delay(100, "conc-A"), delay(100, "conc-B")]);
console.log(`concurrent: ${Date.now() - t1}ms`, [concA, concB]);
