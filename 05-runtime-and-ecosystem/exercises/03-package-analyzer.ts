/**
 * Exercise 05-03: Package.json Analyzer
 *
 * Implement `analyzePackageJson(content: string): PackageAnalysis`:
 * - Parses a raw package.json string
 * - Returns a structured analysis object
 *
 * Requirements:
 * - `deps`: sorted array of dependency names (from `dependencies`)
 * - `devDeps`: sorted array of dev dependency names (from `devDependencies`)
 * - `hasBunTypes`: true if `@types/bun` appears in deps or devDeps
 * - `isESM`: true if `"type"` field is `"module"`
 * - `workspaces`: array of workspace glob patterns (from `workspaces`, default [])
 * - Handle missing fields gracefully (default to empty arrays / false)
 * - Throw a descriptive error if `content` is not valid JSON
 */

export interface PackageAnalysis {
  deps: string[];
  devDeps: string[];
  hasBunTypes: boolean;
  isESM: boolean;
  workspaces: string[];
}

export function analyzePackageJson(content: string): PackageAnalysis {
  // TODO: implement
  throw new Error("Not implemented");
}

// --- manual test ---
function main() {
  // Test 1: full package.json
  const full = analyzePackageJson(JSON.stringify({
    type: "module",
    dependencies: { "express": "^4.18.0", "zod": "^3.22.0" },
    devDependencies: { "@types/bun": "latest", "typescript": "^5.0.0" },
    workspaces: ["packages/*", "apps/*"],
  }));
  console.log("Test 1:", full);
  // Expected: { deps: ["express","zod"], devDeps: ["@types/bun","typescript"],
  //             hasBunTypes: true, isESM: true, workspaces: ["packages/*","apps/*"] }

  // Test 2: minimal package.json
  const minimal = analyzePackageJson(JSON.stringify({ name: "hello" }));
  console.log("Test 2:", minimal);
  // Expected: { deps: [], devDeps: [], hasBunTypes: false, isESM: false, workspaces: [] }

  // Test 3: bun types in dependencies (not devDependencies)
  const bunInDeps = analyzePackageJson(JSON.stringify({
    dependencies: { "@types/bun": "^1.0.0", "hono": "^4.0.0" },
  }));
  console.log("Test 3:", bunInDeps);
  // Expected: hasBunTypes: true, deps: ["@types/bun","hono"]

  // Test 4: invalid JSON
  try {
    analyzePackageJson("not json");
    console.log("Test 4: FAIL — should have thrown");
  } catch (e) {
    console.log("Test 4: correctly threw:", (e as Error).message);
  }
}

main();
