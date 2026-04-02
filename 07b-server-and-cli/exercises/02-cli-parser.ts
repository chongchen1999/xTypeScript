/**
 * Exercise 07b-02: CLI Argument Parser
 *
 * Build a mini CLI argument parser (like a simplified yargs).
 *
 * Implement:
 * 1. `OptionDef` — defines a CLI option with name, optional alias, type, required flag, default
 * 2. `CommandDef` — defines a command with name, description, options array, handler callback
 * 3. `parseArgs(argv, commands)` — parses argv to:
 *    - Match the first arg as a command name
 *    - Extract options supporting: --name=value, --name value, -alias value, --flag (boolean)
 *    - Coerce values to the declared type (string/number/boolean)
 *    - Apply defaults for missing optional options
 *    - Throw if a required option is missing or command is unknown
 *    - Call the matched command's handler with the parsed args
 *
 * Requirements:
 * - Boolean options: `--verbose` sets to true, no value needed
 * - Number options: coerce string to number, throw if NaN
 * - Support both `--name value` (space-separated) and `--name=value`
 * - Support alias: `-p 3` is equivalent to `--priority 3`
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
  // TODO: implement
  throw new Error("Not implemented");
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

  // Test 1: --name value style
  console.log("--- Test 1 ---");
  parseArgs(["add", "--title", "Buy milk", "--priority", "3"], [addCmd, listCmd]);
  // ADD: { title: "Buy milk", priority: 3, verbose: false }

  // Test 2: --name=value style + alias
  console.log("--- Test 2 ---");
  parseArgs(["add", "--title=Buy eggs", "-p", "2", "--verbose"], [addCmd, listCmd]);
  // ADD: { title: "Buy eggs", priority: 2, verbose: true }

  // Test 3: defaults applied
  console.log("--- Test 3 ---");
  parseArgs(["list"], [addCmd, listCmd]);
  // LIST: { limit: 10, verbose: false }

  // Test 4: missing required option
  console.log("--- Test 4 ---");
  try {
    parseArgs(["add", "--priority", "1"], [addCmd, listCmd]);
  } catch (e) {
    console.log("Expected error:", (e as Error).message);
  }

  // Test 5: unknown command
  console.log("--- Test 5 ---");
  try {
    parseArgs(["remove"], [addCmd, listCmd]);
  } catch (e) {
    console.log("Expected error:", (e as Error).message);
  }
}

main();
