/**
 * Async generators, streams, and cancellation
 * Run: bun examples/04-async-programming/02-async-generators-abort.ts
 */

// --- 1. Async generator — lazy pagination (like Python async def + yield) ---
interface Page<T> { items: T[]; nextCursor: string | null }

async function* paginate<T>(
  fetchPage: (cursor: string | null) => Promise<Page<T>>,
): AsyncGenerator<T[], void> {
  let cursor: string | null = null;
  do {
    const page = await fetchPage(cursor);
    yield page.items;
    cursor = page.nextCursor;
  } while (cursor);
}

// Mock data source
let callCount = 0;
async function mockFetch(cursor: string | null): Promise<Page<number>> {
  callCount++;
  await new Promise(r => setTimeout(r, 10));
  const pages: Record<string, Page<number>> = {
    "null": { items: [1, 2, 3], nextCursor: "page2" },
    "page2": { items: [4, 5, 6], nextCursor: "page3" },
    "page3": { items: [7, 8, 9], nextCursor: null },
  };
  return pages[String(cursor)];
}

for await (const batch of paginate(mockFetch)) {
  console.log("batch:", batch);
}
console.log(`Total API calls: ${callCount}`); // 3

// --- 2. AbortController — cooperative cancellation ---
// Like C++20 std::stop_token or Python asyncio.Task.cancel()
async function fetchWithCancel(url: string, signal: AbortSignal): Promise<string> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => resolve(`data from ${url}`), 200);
    signal.addEventListener("abort", () => {
      clearTimeout(timer);
      reject(new DOMException("Request aborted", "AbortError"));
    });
  });
}

// Normal fetch
const ctrl1 = new AbortController();
const data = await fetchWithCancel("/api/data", ctrl1.signal);
console.log(data); // "data from /api/data"

// Cancelled fetch
const ctrl2 = new AbortController();
setTimeout(() => ctrl2.abort(), 50); // cancel after 50ms, before 200ms resolves
try {
  await fetchWithCancel("/api/slow", ctrl2.signal);
} catch (e) {
  if (e instanceof DOMException && e.name === "AbortError") {
    console.log("Cancelled as expected ✓");
  }
}

// --- 3. Built-in AbortSignal helpers (ES2024 / Bun) ---
try {
  const signal = AbortSignal.timeout(30); // auto-abort after 30ms
  await fetchWithCancel("/api/timeout", signal);
} catch (e) {
  console.log("Timed out:", (e as Error).name); // "TimeoutError" or "AbortError"
}
