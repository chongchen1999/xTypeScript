/**
 * Exercise 01-01: Debounce
 *
 * Implement a `debounce` function.
 * The returned function delays invoking `fn` until `delay` ms have elapsed
 * since the last invocation. Useful for search-input handlers, resize events, etc.
 *
 * Example:
 *   const search = debounce((q: string) => console.log(q), 300);
 *   search("a"); search("ab"); search("abc");
 *   // Only "abc" is logged, 300ms after the last call.
 */

export function debounce<T extends (...args: any[]) => void>(
  fn: T,
  delay: number,
): (...args: Parameters<T>) => void {
  // TODO: implement
  throw new Error("Not implemented");
}

// --- manual test (run with: bun exercises/01-javascript-foundations/01-debounce.ts) ---
const log = debounce((msg: string) => console.log("called:", msg), 100);
log("a");
log("b");
log("c"); // Only "called: c" should appear after 100ms
