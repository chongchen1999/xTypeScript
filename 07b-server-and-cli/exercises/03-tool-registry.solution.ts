/**
 * Solution: 07b-03 Type-Safe Tool Registry (MCP-like Pattern)
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
  return {
    name: def.name,
    description: def.description,
    async call(input: unknown): Promise<string> {
      let parsed: T;
      try {
        parsed = def.schema.parse(input);
      } catch (e) {
        throw new Error(`Validation error for tool ${def.name}: ${(e as Error).message}`);
      }
      try {
        return await def.execute(parsed);
      } catch (e) {
        throw new Error(`Execution error for tool ${def.name}: ${(e as Error).message}`);
      }
    },
  };
}

export class ToolRegistry {
  private tools = new Map<string, Tool>();

  register(tool: Tool): void {
    if (this.tools.has(tool.name)) {
      throw new Error(`Tool already registered: ${tool.name}`);
    }
    this.tools.set(tool.name, tool);
  }

  async call(name: string, input: unknown): Promise<string> {
    const tool = this.tools.get(name);
    if (!tool) throw new Error(`Tool not found: ${name}`);
    return tool.call(input);
  }

  list(): { name: string; description: string }[] {
    return [...this.tools.values()].map(({ name, description }) => ({ name, description }));
  }
}

// --- manual test ---
async function main() {
  const registry = new ToolRegistry();

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

  console.log("Tools:", registry.list());
  console.log(await registry.call("calculate", { expression: "2 + 3 * 4" }));
  console.log(await registry.call("greet", { name: "Alice" }));

  try { await registry.call("unknown", {}); }
  catch (e) { console.log("Expected error:", (e as Error).message); }

  try { await registry.call("calculate", { wrong: "field" }); }
  catch (e) { console.log("Expected error:", (e as Error).message); }

  try { await registry.call("calculate", { expression: "rm -rf /" }); }
  catch (e) { console.log("Expected error:", (e as Error).message); }

  try { registry.register(calcTool); }
  catch (e) { console.log("Expected error:", (e as Error).message); }
}

main();
