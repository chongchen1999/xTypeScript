/**
 * Solution: 07d-01 Mini Test Framework
 */

interface TestResult {
  name: string;
  passed: boolean;
  error?: string;
}

interface RunResult {
  passed: number;
  failed: number;
  results: TestResult[];
}

type TestFn = () => void | Promise<void>;

const tests: { name: string; fn: TestFn }[] = [];
let currentSuite = "";

export function describe(name: string, fn: () => void): void {
  const prev = currentSuite;
  currentSuite = currentSuite ? `${currentSuite} > ${name}` : name;
  fn();
  currentSuite = prev;
}

export function it(name: string, fn: TestFn): void {
  tests.push({ name: currentSuite ? `${currentSuite} > ${name}` : name, fn });
}

function deepEqual(a: unknown, b: unknown): boolean {
  if (a === b) return true;
  if (a === null || b === null || typeof a !== "object" || typeof b !== "object") return false;
  if (Array.isArray(a) !== Array.isArray(b)) return false;

  const keysA = Object.keys(a as Record<string, unknown>);
  const keysB = Object.keys(b as Record<string, unknown>);
  if (keysA.length !== keysB.length) return false;

  return keysA.every((k) =>
    deepEqual((a as Record<string, unknown>)[k], (b as Record<string, unknown>)[k])
  );
}

export const expect = <T>(actual: T) => ({
  toBe(expected: T): void {
    if (actual !== expected) throw new Error(`Expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
  },

  toEqual(expected: unknown): void {
    if (!deepEqual(actual, expected))
      throw new Error(`Expected deep equal ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
  },

  toThrow(msg?: string): void {
    if (typeof actual !== "function") throw new Error("Expected a function for toThrow");
    try {
      (actual as Function)();
      throw new Error("Expected function to throw, but it did not");
    } catch (e: any) {
      if (msg && !e.message.includes(msg))
        throw new Error(`Expected error message to contain "${msg}", got "${e.message}"`);
    }
  },

  toContain(item: unknown): void {
    if (Array.isArray(actual)) {
      if (!actual.includes(item))
        throw new Error(`Expected array to contain ${JSON.stringify(item)}`);
    } else if (typeof actual === "string") {
      if (!actual.includes(item as string))
        throw new Error(`Expected string to contain "${item}"`);
    } else {
      throw new Error("toContain requires an array or string");
    }
  },
});

export async function run(): Promise<RunResult> {
  const results: TestResult[] = [];
  let passed = 0;
  let failed = 0;

  for (const test of tests) {
    try {
      await test.fn();
      results.push({ name: test.name, passed: true });
      passed++;
    } catch (e: any) {
      results.push({ name: test.name, passed: false, error: e.message });
      failed++;
    }
  }

  tests.length = 0;
  return { passed, failed, results };
}

// --- manual test ---
describe("Math", () => {
  it("adds numbers", () => {
    expect(1 + 2).toBe(3);
  });

  it("compares objects deeply", () => {
    expect({ a: 1, b: [2, 3] }).toEqual({ a: 1, b: [2, 3] });
  });

  it("catches throws", () => {
    expect(() => {
      throw new Error("boom");
    }).toThrow("boom");
  });

  it("checks array containment", () => {
    expect([1, 2, 3]).toContain(2);
  });

  it("should fail intentionally", () => {
    expect(1).toBe(2);
  });
});

run().then((result) => {
  console.log(`\nPassed: ${result.passed}, Failed: ${result.failed}`);
  for (const r of result.results) {
    const icon = r.passed ? "✓" : "✗";
    console.log(`  ${icon} ${r.name}${r.error ? ` — ${r.error}` : ""}`);
  }
});
