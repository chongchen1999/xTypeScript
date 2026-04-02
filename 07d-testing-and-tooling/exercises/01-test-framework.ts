/**
 * Exercise 07d-01: Mini Test Framework
 *
 * Build a tiny test framework similar to Vitest/Jest.
 * Tests are registered with `describe` and `it`, then executed with `run()`.
 *
 * Requirements:
 * - `describe(name, fn)` groups tests under a suite name
 * - `it(name, fn)` registers a test case (sync or async)
 * - `expect(actual)` returns assertion methods: toBe, toEqual, toThrow, toContain
 * - `run()` executes all collected tests and returns { passed, failed, results }
 * - toBe uses strict equality (===)
 * - toEqual uses deep structural equality
 * - toThrow catches errors from a function argument
 * - toContain checks array inclusion or substring
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

// TODO: implement
export function describe(name: string, fn: () => void): void {
  throw new Error("Not implemented");
}

// TODO: implement
export function it(name: string, fn: () => void | Promise<void>): void {
  throw new Error("Not implemented");
}

// TODO: implement
export const expect = <T>(actual: T): {
  toBe(expected: T): void;
  toEqual(expected: unknown): void;
  toThrow(msg?: string): void;
  toContain(item: unknown): void;
} => {
  throw new Error("Not implemented");
};

// TODO: implement
export async function run(): Promise<RunResult> {
  throw new Error("Not implemented");
}

// --- manual test (run with: bun exercises/01-test-framework.ts) ---
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
