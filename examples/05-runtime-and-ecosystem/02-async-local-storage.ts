/**
 * AsyncLocalStorage — context propagation across async call chains
 * Run: bun examples/05-runtime-and-ecosystem/02-async-local-storage.ts
 */

import { AsyncLocalStorage } from "node:async_hooks";

// Like Python's contextvars.ContextVar or Rust's tokio::task_local!
// C++ comparison: thread_local — but bound to async chains, not OS threads

interface RequestContext {
  requestId: string;
  userId?: string;
  startTime: number;
}

const ctx = new AsyncLocalStorage<RequestContext>();

// Helper — access context from anywhere without passing it as a parameter
function getCtx(): RequestContext {
  const store = ctx.getStore();
  if (!store) throw new Error("No request context found");
  return store;
}

// --- Business logic functions (no context parameter needed!) ---
async function fetchUserData(): Promise<{ name: string }> {
  const { requestId } = getCtx();
  console.log(`  [${requestId}] Fetching user data...`);
  await new Promise(r => setTimeout(r, 10));
  return { name: "Alice" };
}

async function logAuditEvent(action: string): Promise<void> {
  const { requestId, userId } = getCtx();
  console.log(`  [${requestId}] AUDIT: user=${userId ?? "anon"} action=${action}`);
}

async function handleRequest(id: string, userId?: string): Promise<void> {
  const context: RequestContext = {
    requestId: id,
    userId,
    startTime: Date.now(),
  };

  // Everything inside this callback shares the same context
  await ctx.run(context, async () => {
    const user = await fetchUserData();
    await logAuditEvent(`viewed profile of ${user.name}`);
    const { startTime } = getCtx();
    console.log(`  [${id}] Request completed in ${Date.now() - startTime}ms`);
  });
}

// --- Simulate concurrent requests — contexts are fully isolated ---
console.log("Handling 3 concurrent requests:");
await Promise.all([
  handleRequest("req-1", "user-abc"),
  handleRequest("req-2"),              // anonymous
  handleRequest("req-3", "user-xyz"),
]);

// Each request's context is independent — no cross-contamination
console.log("All requests handled ✓");
