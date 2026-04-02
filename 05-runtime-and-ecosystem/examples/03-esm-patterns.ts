/**
 * ESM module patterns — static, dynamic, and barrel exports
 * Run: bun examples/05-runtime-and-ecosystem/03-esm-patterns.ts
 */

// --- 1. Static import analysis ---
// All static imports are resolved before any code runs.
// Tree-shaking can eliminate unused exports at build time.
//
// import { add, multiply } from "./math.ts";   // only add & multiply bundled
// import * as Math from "./math.ts";            // forces entire module to be included

// --- 2. Dynamic import — lazy loading ---
// Resolved at runtime; useful for code splitting and conditional imports.

async function loadLocale(lang: string) {
  // Simulated dynamic import (real usage would be an actual file path)
  const locales: Record<string, Record<string, string>> = {
    en: { greeting: "Hello", farewell: "Goodbye" },
    zh: { greeting: "你好",  farewell: "再见"    },
  };
  // In real code: const mod = await import(`./locales/${lang}.ts`);
  return locales[lang] ?? locales.en;
}

const zh = await loadLocale("zh");
console.log(zh.greeting); // 你好
const en = await loadLocale("en");
console.log(en.farewell); // Goodbye

// --- 3. import.meta — module-level metadata ---
console.log("File:", import.meta.file);
console.log("Dir:", import.meta.dir);
console.log("URL:", import.meta.url);

// Is this the entry point? (like Python's if __name__ == "__main__")
const isMain = import.meta.path === Bun.main;
console.log("Is main module:", isMain);

// --- 4. SemVer and package resolution ---
// package.json exports field controls what consumers can import:
//
// {
//   "exports": {
//     ".":        { "import": "./dist/index.js", "types": "./dist/index.d.ts" },
//     "./server": { "import": "./dist/server.js", "types": "./dist/server.d.ts" }
//   }
// }
//
// Consumer:
//   import { createApp } from "my-lib";          // → dist/index.js
//   import { createServer } from "my-lib/server"; // → dist/server.js

// --- 5. Circular dependency detection ---
// ESM handles cycles via live bindings — but it's best to avoid them.
// Use dependency inversion or restructure into smaller modules when cycles appear.

console.log("ESM patterns ✓");
