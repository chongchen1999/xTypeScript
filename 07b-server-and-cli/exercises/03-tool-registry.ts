/**
 * Exercise 07b-03: Type-Safe Tool Registry (MCP-like Pattern)
 *
 * Build a tool registry where each tool has a schema for input validation
 * and a typed execute function — similar to Model Context Protocol tools.
 *
 * Implement:
 * 1. `createTool<T>(def)` — creates a Tool from a definition containing:
 *    - name, description
 *    - schema with a `parse(input: unknown) => T` method (validates & returns typed input)
 *    - execute(input: T) => Promise<string>
 *
 * 2. `ToolRegistry` class with:
 *    - `register(tool)` — adds a tool (throw if duplicate name)
 *    - `call(name, input)` — finds tool, validates input via schema.parse, executes
 *    - `list()` — returns array of { name, description }
 *
 * Requirements:
 * - Wrap schema validation errors: "Validation error for tool X: ..."
 * - Wrap execution errors: "Execution error for tool X: ..."
 * - Throw "Tool not found: X" for unknown tools
 */

export interface Tool {
  name: string;
  description: string;
  call(input: unknown): Promise<string>;
}

export function createTool<T>(def: {
  name: string;
  description: string;
  schema: { parse: (input: unknown) => T };
  execute: (input: T) => Promise<string>;
}): Tool {
  // TODO: implement
  throw new Error("Not implemented");
}

export class ToolRegistry {
  // TODO: implement

  register(tool: Tool): void {
    throw new Error("Not implemented");
  }

  async call(name: string, input: unknown): Promise<string> {
    throw new Error("Not implemented");
  }

  list(): { name: string; description: string }[] {
    throw new Error("Not implemented");
  }
}

// --- manual test ---
async function main() {
  const registry = new ToolRegistry();

  // Tool 1: simple calculator
  const calcTool = createTool({
    name: "calculate",
    description: "Evaluate a simple math expression (+, -, *, /)",
    schema: {
      parse(input: unknown) {
        if (
          typeof input !== "object" || input === null ||
          !("expression" in input) ||
          typeof (input as Record<string, unknown>).expression !== "string"
        ) {
          throw new Error('Expected { expression: string }');
        }
        return input as { expression: string };
      },
    },
    execute: async ({ expression }) => {
      const allowed = /^[\d\s+\-*/().]+$/;
      if (!allowed.test(expression)) throw new Error("Invalid characters in expression");
      const result = new Function(`return (${expression})`)();
      return `Result: ${result}`;
    },
  });

  // Tool 2: greeter
  const greetTool = createTool({
    name: "greet",
    description: "Greet someone by name",
    schema: {
      parse(input: unknown) {
        if (
          typeof input !== "object" || input === null ||
          !("name" in input) ||
          typeof (input as Record<string, unknown>).name !== "string"
        ) {
          throw new Error('Expected { name: string }');
        }
        return input as { name: string };
      },
    },
    execute: async ({ name }) => `Hello, ${name}! Welcome aboard.`,
  });

  registry.register(calcTool);
  registry.register(greetTool);

  // Test 1: list tools
  console.log("Tools:", registry.list());

  // Test 2: call calculate
  console.log(await registry.call("calculate", { expression: "2 + 3 * 4" }));
  // "Result: 14"

  // Test 3: call greet
  console.log(await registry.call("greet", { name: "Alice" }));
  // "Hello, Alice! Welcome aboard."

  // Test 4: tool not found
  try {
    await registry.call("unknown", {});
  } catch (e) {
    console.log("Expected error:", (e as Error).message);
  }

  // Test 5: validation error
  try {
    await registry.call("calculate", { wrong: "field" });
  } catch (e) {
    console.log("Expected error:", (e as Error).message);
  }

  // Test 6: execution error
  try {
    await registry.call("calculate", { expression: "rm -rf /" });
  } catch (e) {
    console.log("Expected error:", (e as Error).message);
  }

  // Test 7: duplicate registration
  try {
    registry.register(calcTool);
  } catch (e) {
    console.log("Expected error:", (e as Error).message);
  }
}

main();
