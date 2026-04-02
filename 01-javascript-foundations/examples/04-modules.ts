/**
 * ES Module patterns (static & dynamic import, barrel files)
 *
 * This file demonstrates import patterns in comments since Bun handles
 * module resolution at the file boundary. The focus is on the concepts.
 *
 * Run: bun examples/01-javascript-foundations/04-modules.ts
 */

// --- 1. Named vs default exports ---
// Named: import { foo, bar } from "./mod"   (tree-shakeable — bundler removes unused)
// Default: import Foo from "./mod"           (one per file)
// Namespace: import * as Mod from "./mod"    (like C++ namespace / Python import module)

// --- 2. Dynamic import — lazy / conditional loading ---
async function loadFormatter(locale: string) {
  // Module resolved at runtime — cannot be statically analyzed
  // const mod = await import(`./formatters/${locale}.ts`);
  // return mod.format;
  console.log(`Would dynamically load formatter for locale: ${locale}`);
}
await loadFormatter("zh");

// --- 3. Re-export patterns (barrel files) ---
// A barrel file (index.ts) aggregates exports from a directory:
//
//   export { Button }     from "./Button.ts";
//   export { Input }      from "./Input.ts";
//   export type { ButtonProps } from "./types.ts";
//
// Consumer:
//   import { Button, Input } from "@/components";  // instead of long relative paths

// --- 4. Import type — compile-time only, no runtime cost ---
// import type { User } from "./types.ts";  // erased completely during compilation
// Enforced by `verbatimModuleSyntax: true` in tsconfig

// --- 5. Import with attributes (JSON modules) ---
// import config from "./config.json" with { type: "json" };
// Bun supports this natively

// --- 6. `__dirname` equivalent in ESM ---
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __filename = fileURLToPath(import.meta.url);
const __dirname  = dirname(__filename);
console.log("Current file:", __filename);
console.log("Current dir: ", __dirname);
console.log("Sibling path:", join(__dirname, "03-iterators-generators.ts"));

// Bun shorthand:
console.log("Bun import.meta.dir:", import.meta.dir);
console.log("Bun import.meta.file:", import.meta.file);
