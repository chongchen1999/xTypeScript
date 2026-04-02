/**
 * Bun runtime features — server, file I/O, subprocess
 * Run: bun examples/05-runtime-and-ecosystem/01-bun-runtime.ts
 */

// --- 1. Bun.file — fast file I/O ---
const tmpPath = "/tmp/bun-example.txt";
await Bun.write(tmpPath, "Hello from Bun!\nLine 2\nLine 3\n");

const file = Bun.file(tmpPath);
const text = await file.text();
console.log("File contents:");
console.log(text);
console.log("File size:", file.size, "bytes");
console.log("MIME type:", file.type);

// --- 2. Bun.spawn — run subprocesses ---
const proc = Bun.spawn(["echo", "Hello from subprocess"], {
  stdout: "pipe",
});
const output = await new Response(proc.stdout).text();
console.log("Subprocess output:", output.trim());

// --- 3. Bun built-in HTTP server ---
// (Start briefly then close — so this script doesn't hang)
const server = Bun.serve({
  port: 0, // OS picks a free port
  fetch(req: Request): Response {
    const url = new URL(req.url);

    if (url.pathname === "/health") {
      return Response.json({ status: "ok", runtime: "bun", ts: Date.now() });
    }
    if (url.pathname === "/echo") {
      return new Response(url.searchParams.get("msg") ?? "no message");
    }
    return new Response("Not Found", { status: 404 });
  },
});

const base = `http://localhost:${server.port}`;

const health = await (await fetch(`${base}/health`)).json();
console.log("Health:", health);

const echo = await (await fetch(`${base}/echo?msg=TypeScript`)).text();
console.log("Echo:", echo);

server.stop(true);
console.log("Server stopped ✓");

// --- 4. Bun.password — built-in bcrypt ---
const hash = await Bun.password.hash("super-secret");
const valid = await Bun.password.verify("super-secret", hash);
console.log("Password valid:", valid); // true
