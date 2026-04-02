/**
 * Destructuring, spread, and rest parameters
 * Run: bun examples/01-javascript-foundations/02-destructuring-spread.ts
 */

// --- 1. Object destructuring with rename and defaults ---
interface ServerConfig {
  host: string;
  port?: number;
  tls?: boolean;
}

function connect({ host, port = 443, tls: secure = true }: ServerConfig) {
  console.log(`Connecting to ${host}:${port} (TLS=${secure})`);
}
connect({ host: "api.example.com" });
connect({ host: "localhost", port: 8080, tls: false });

// --- 2. Array destructuring + swap (Python: a, b = b, a) ---
let x = 1, y = 2;
[x, y] = [y, x];
console.log(x, y); // 2 1

// Ignore elements with holes
const [, second, , fourth] = [10, 20, 30, 40];
console.log(second, fourth); // 20 40

// --- 3. Rest / spread ---
function logFirst(first: string, ...rest: string[]) {
  console.log("first:", first, "rest:", rest);
}
logFirst("a", "b", "c", "d"); // first: a  rest: [b, c, d]

// Shallow merge (later keys win) — like Python's {**a, **b}
const defaults = { theme: "dark", lang: "en", debug: false };
const overrides = { lang: "zh", debug: true };
const merged = { ...defaults, ...overrides };
console.log(merged); // { theme: "dark", lang: "zh", debug: true }

// Array spread — concat without mutating originals
const head = [0];
const tail = [4, 5];
const full = [...head, 1, 2, 3, ...tail];
console.log(full); // [0, 1, 2, 3, 4, 5]

// --- 4. Nested destructuring (common in config objects) ---
const response = {
  status: 200,
  data: { user: { id: "u-1", name: "Alice" }, token: "abc123" },
};

const { data: { user: { name }, token } } = response;
console.log(name, token); // Alice abc123
