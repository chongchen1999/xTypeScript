/**
 * Retry and timeout patterns
 * Run: bun examples/04-async-programming/03-retry-timeout.ts
 */

// --- 1. Retry with exponential backoff ---
// Like Rust's tokio-retry or Python's tenacity library
async function withRetry<T>(
  fn: () => Promise<T>,
  options: { maxRetries?: number; baseDelayMs?: number; onRetry?: (attempt: number, err: unknown) => void } = {},
): Promise<T> {
  const { maxRetries = 3, baseDelayMs = 100, onRetry } = options;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      if (attempt === maxRetries) throw err;
      onRetry?.(attempt + 1, err);
      // Exponential backoff: 100ms, 200ms, 400ms, ...
      const delay = baseDelayMs * 2 ** attempt;
      await new Promise(r => setTimeout(r, delay));
    }
  }
  throw new Error("unreachable");
}

// Simulate a flaky API (fails first 2 attempts)
let attempts = 0;
const flaky = () => {
  attempts++;
  if (attempts < 3) return Promise.reject(new Error(`Attempt ${attempts} failed`));
  return Promise.resolve("success");
};

const result = await withRetry(flaky, {
  onRetry: (n, e) => console.log(`Retry ${n}: ${(e as Error).message}`),
});
console.log(result); // "success" (after 2 retries)

// --- 2. Timeout wrapper ---
async function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  let tid: ReturnType<typeof setTimeout>;
  const timeout = new Promise<never>((_, reject) => {
    tid = setTimeout(() => reject(new Error(`Timed out after ${ms}ms`)), ms);
  });
  try {
    return await Promise.race([promise, timeout]);
  } finally {
    clearTimeout(tid!);
  }
}

const slow = new Promise<string>(r => setTimeout(() => r("slow result"), 500));
try {
  await withTimeout(slow, 100);
} catch (e) {
  console.log((e as Error).message); // "Timed out after 100ms"
}

// Fast operation completes before timeout
const fast = new Promise<string>(r => setTimeout(() => r("fast result"), 30));
console.log(await withTimeout(fast, 200)); // "fast result"

// --- 3. Retry + timeout combined ---
attempts = 0;
const resilient = await withRetry(
  () => withTimeout(flaky(), 1000),
  { baseDelayMs: 20, onRetry: (n) => console.log(`Combined retry ${n}`) },
);
console.log("Resilient result:", resilient);
