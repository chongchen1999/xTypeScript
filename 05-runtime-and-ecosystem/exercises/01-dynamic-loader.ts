/**
 * Exercise 05-01: Dynamic Module Loader
 *
 * Implement `dynamicLoader<T>(modulePaths: string[]): Promise<T[]>`:
 * - Takes an array of module paths (strings)
 * - Dynamically imports each using `import()`
 * - Extracts the `default` export from each loaded module
 * - Returns only the successfully loaded defaults (skip failures)
 * - Preserves the relative order of successful imports
 *
 * Requirements:
 * - Use `import()` for dynamic ESM loading
 * - Failed imports should be silently skipped, not throw
 * - If a module has no default export, skip it
 * - Return type is `Promise<T[]>`
 */

export async function dynamicLoader<T>(
  modulePaths: string[],
): Promise<T[]> {
  // TODO: implement
  throw new Error("Not implemented");
}

// --- manual test ---
async function main() {
  const fs = await import("fs");
  const path = await import("path");
  const { fileURLToPath } = await import("url");
  const dir = path.dirname(fileURLToPath(import.meta.url));
  const tmpDir = path.join(dir, "__test_modules");

  fs.mkdirSync(tmpDir, { recursive: true });

  // Use .mjs so dynamic import() works across Node, tsx, and Bun
  fs.writeFileSync(
    path.join(tmpDir, "a.mjs"),
    "export default { name: 'moduleA' };\n",
  );
  fs.writeFileSync(
    path.join(tmpDir, "b.mjs"),
    "export default { name: 'moduleB' };\n",
  );
  fs.writeFileSync(
    path.join(tmpDir, "no-default.mjs"),
    "export const x = 42;\n",
  );

  const results = await dynamicLoader<{ name: string }>([
    path.join(tmpDir, "a.mjs"),
    path.join(tmpDir, "b.mjs"),
    path.join(tmpDir, "nonexistent.mjs"), // should be skipped
    path.join(tmpDir, "no-default.mjs"),  // should be skipped (no default)
  ]);

  console.log("Loaded:", results);
  // Expected: [{ name: 'moduleA' }, { name: 'moduleB' }]
  console.log("Count:", results.length, "(expected 2)");

  fs.rmSync(tmpDir, { recursive: true });
}

main();
