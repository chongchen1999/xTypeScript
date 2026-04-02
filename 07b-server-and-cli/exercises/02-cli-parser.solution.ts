/**
 * Solution: 07b-02 CLI Argument Parser
 */

export interface OptionDef {
  name: string;
  alias?: string;
  type: "string" | "number" | "boolean";
  required?: boolean;
  default?: unknown;
}

export interface CommandDef {
  name: string;
  description: string;
  options: OptionDef[];
  handler: (args: Record<string, unknown>) => void;
}

export function parseArgs(argv: string[], commands: CommandDef[]): void {
  if (argv.length === 0) throw new Error("No command provided");

  const cmdName = argv[0];
  const command = commands.find((c) => c.name === cmdName);
  if (!command) throw new Error(`Unknown command: ${cmdName}`);

  // Build lookup maps for option resolution
  const byName = new Map<string, OptionDef>();
  const byAlias = new Map<string, OptionDef>();
  for (const opt of command.options) {
    byName.set(opt.name, opt);
    if (opt.alias) byAlias.set(opt.alias, opt);
  }

  const parsed: Record<string, unknown> = {};
  const tokens = argv.slice(1);

  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];
    let optDef: OptionDef | undefined;
    let value: string | undefined;

    if (token.startsWith("--")) {
      const eqIdx = token.indexOf("=");
      if (eqIdx !== -1) {
        // --name=value
        const name = token.slice(2, eqIdx);
        value = token.slice(eqIdx + 1);
        optDef = byName.get(name);
      } else {
        const name = token.slice(2);
        optDef = byName.get(name);
        if (optDef && optDef.type !== "boolean") {
          value = tokens[++i];
        }
      }
    } else if (token.startsWith("-")) {
      const alias = token.slice(1);
      optDef = byAlias.get(alias);
      if (optDef && optDef.type !== "boolean") {
        value = tokens[++i];
      }
    }

    if (!optDef) continue;

    if (optDef.type === "boolean") {
      parsed[optDef.name] = true;
    } else if (optDef.type === "number") {
      const num = Number(value);
      if (Number.isNaN(num)) throw new Error(`Option --${optDef.name} expects a number, got "${value}"`);
      parsed[optDef.name] = num;
    } else {
      parsed[optDef.name] = value;
    }
  }

  // Apply defaults and validate required
  for (const opt of command.options) {
    if (parsed[opt.name] === undefined) {
      if (opt.required) throw new Error(`Missing required option: --${opt.name}`);
      if (opt.default !== undefined) parsed[opt.name] = opt.default;
    }
  }

  command.handler(parsed);
}

// --- manual test ---
function main() {
  const addCmd: CommandDef = {
    name: "add",
    description: "Add a new todo item",
    options: [
      { name: "title", alias: "t", type: "string", required: true },
      { name: "priority", alias: "p", type: "number", default: 1 },
      { name: "verbose", alias: "v", type: "boolean", default: false },
    ],
    handler: (args) => console.log("ADD:", args),
  };

  const listCmd: CommandDef = {
    name: "list",
    description: "List all todo items",
    options: [
      { name: "limit", alias: "l", type: "number", default: 10 },
      { name: "verbose", alias: "v", type: "boolean", default: false },
    ],
    handler: (args) => console.log("LIST:", args),
  };

  console.log("--- Test 1 ---");
  parseArgs(["add", "--title", "Buy milk", "--priority", "3"], [addCmd, listCmd]);

  console.log("--- Test 2 ---");
  parseArgs(["add", "--title=Buy eggs", "-p", "2", "--verbose"], [addCmd, listCmd]);

  console.log("--- Test 3 ---");
  parseArgs(["list"], [addCmd, listCmd]);

  console.log("--- Test 4 ---");
  try {
    parseArgs(["add", "--priority", "1"], [addCmd, listCmd]);
  } catch (e) {
    console.log("Expected error:", (e as Error).message);
  }

  console.log("--- Test 5 ---");
  try {
    parseArgs(["remove"], [addCmd, listCmd]);
  } catch (e) {
    console.log("Expected error:", (e as Error).message);
  }
}

main();
