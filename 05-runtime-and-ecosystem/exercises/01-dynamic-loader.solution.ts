/**
 * Solution: 05-01 Dynamic Module Loader
 */

export async function dynamicLoader<T>(
  modulePaths: string[],
): Promise<T[]> {
  const results: T[] = [];

  for (const modulePath of modulePaths) {
    try {
      const mod = await import(modulePath);
      if (mod.default !== undefined) {
        results.push(mod.default as T);
      }
    } catch {
      // Skip failed imports
    }
  }

  return results;
}

// --- manual test ---
async function main() {
  const fs = await import("fs");
  const path = await import("path");
  const { fileURLToPath } = await import("url");
  const dir = path.dirname(fileURLToPath(import.meta.url));
  const tmpDir = path.join(dir, "__test_modules");

  fs.mkdirSync(tmpDir, { recursive: true });

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
    path.join(tmpDir, "nonexistent.mjs"),
    path.join(tmpDir, "no-default.mjs"),
  ]);

  console.log("Loaded:", results);
  console.log("Count:", results.length, "(expected 2)");

  fs.rmSync(tmpDir, { recursive: true });
}

main();
