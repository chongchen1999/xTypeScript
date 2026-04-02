/**
 * Solution: 05-03 Package.json Analyzer
 */

export interface PackageAnalysis {
  deps: string[];
  devDeps: string[];
  hasBunTypes: boolean;
  isESM: boolean;
  workspaces: string[];
}

export function analyzePackageJson(content: string): PackageAnalysis {
  let parsed: Record<string, unknown>;
  try {
    parsed = JSON.parse(content);
  } catch {
    throw new Error(`Invalid JSON: failed to parse package.json content`);
  }

  const deps = Object.keys((parsed.dependencies as Record<string, string>) ?? {}).sort();
  const devDeps = Object.keys((parsed.devDependencies as Record<string, string>) ?? {}).sort();
  const allDeps = [...deps, ...devDeps];

  return {
    deps,
    devDeps,
    hasBunTypes: allDeps.includes("@types/bun"),
    isESM: parsed.type === "module",
    workspaces: (parsed.workspaces as string[]) ?? [],
  };
}

// --- manual test ---
function main() {
  const full = analyzePackageJson(JSON.stringify({
    type: "module",
    dependencies: { "express": "^4.18.0", "zod": "^3.22.0" },
    devDependencies: { "@types/bun": "latest", "typescript": "^5.0.0" },
    workspaces: ["packages/*", "apps/*"],
  }));
  console.log("Test 1:", full);

  const minimal = analyzePackageJson(JSON.stringify({ name: "hello" }));
  console.log("Test 2:", minimal);

  const bunInDeps = analyzePackageJson(JSON.stringify({
    dependencies: { "@types/bun": "^1.0.0", "hono": "^4.0.0" },
  }));
  console.log("Test 3:", bunInDeps);

  try {
    analyzePackageJson("not json");
    console.log("Test 4: FAIL — should have thrown");
  } catch (e) {
    console.log("Test 4: correctly threw:", (e as Error).message);
  }
}

main();
