/**
 * Exercise 04-03: Async Generator — Log Tail
 *
 * Implement `tailLines(source, n)`:
 * - `source` is an AsyncIterable<string> that yields lines one at a time
 *   (simulates reading a log file or a streaming API)
 * - The function should return an AsyncGenerator that yields only the
 *   LAST `n` lines from the source (like `tail -n` in Unix)
 *
 * Constraint: you must buffer only `n` lines at a time (fixed memory usage).
 */

export async function* tailLines(
  source: AsyncIterable<string>,
  n: number,
): AsyncGenerator<string> {
  // TODO: implement with a circular buffer of size n
  throw new Error("Not implemented");
}

// --- mock log source (do not modify) ---
async function* mockLogSource(): AsyncIterable<string> {
  const lines = Array.from({ length: 20 }, (_, i) => `[${i}] log line ${i}`);
  for (const line of lines) {
    await new Promise((r) => setTimeout(r, 5));
    yield line;
  }
}

// --- manual test ---
async function main() {
  const tail = tailLines(mockLogSource(), 5);
  for await (const line of tail) {
    console.log(line);
  }
  // Expected output (last 5 lines):
  // [15] log line 15
  // [16] log line 16
  // [17] log line 17
  // [18] log line 18
  // [19] log line 19
}

main();
