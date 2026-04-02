/**
 * Solution: 04-03 Async Generator — Log Tail
 */

export async function* tailLines(
  source: AsyncIterable<string>,
  n: number,
): AsyncGenerator<string> {
  // Circular buffer: keep the last n lines
  const buffer: string[] = new Array(n).fill("");
  let count = 0;

  for await (const line of source) {
    buffer[count % n] = line;
    count++;
  }

  // Yield in order — starting from the oldest slot in the circular buffer
  const total = Math.min(count, n);
  const start = count >= n ? count % n : 0;

  for (let i = 0; i < total; i++) {
    yield buffer[(start + i) % n];
  }
}

// --- mock log source ---
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
  // [15] log line 15 … [19] log line 19
}

main();
