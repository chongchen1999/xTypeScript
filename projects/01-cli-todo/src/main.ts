#!/usr/bin/env bun
import yargs      from "yargs";
import { hideBin } from "yargs/helpers";
import {
  addTodo, listTodos, markDone, removeTodo, clearTodos,
} from "@/store.js";
import { printTodos, printSuccess, printError } from "@/display.js";
import type { Priority } from "@/types.js";

const PRIORITY_CHOICES = ["low", "medium", "high"] as const;
const STATUS_CHOICES   = ["pending", "done", "all"]  as const;

yargs(hideBin(process.argv))
  .scriptName("todo")
  .usage("$0 <command> [options]")

  // ── add ──────────────────────────────────────────────────────────────────
  .command(
    "add <title>",
    "Add a new todo",
    (y) =>
      y
        .positional("title", { type: "string", demandOption: true, describe: "Todo text" })
        .option("priority", {
          alias:   "p",
          choices: PRIORITY_CHOICES,
          default: "medium" as Priority,
          describe: "Priority level",
        }),
    async (argv) => {
      const todo = await addTodo(argv.title!, argv.priority as Priority);
      printSuccess(`Added #${todo.id}: "${todo.title}" [${todo.priority}]`);
    },
  )

  // ── list ─────────────────────────────────────────────────────────────────
  .command(
    "list",
    "List todos",
    (y) =>
      y
        .option("status", {
          alias:   "s",
          choices: STATUS_CHOICES,
          default: "all" as const,
          describe: "Filter by status",
        })
        .option("priority", {
          alias:   "p",
          choices: PRIORITY_CHOICES,
          describe: "Filter by priority",
        }),
    async (argv) => {
      const todos = await listTodos({
        status:   argv.status as "pending" | "done" | "all",
        priority: argv.priority as Priority | undefined,
      });
      printTodos(todos);
    },
  )

  // ── done ─────────────────────────────────────────────────────────────────
  .command(
    "done <id>",
    "Mark a todo as done",
    (y) =>
      y.positional("id", { type: "number", demandOption: true, describe: "Todo ID" }),
    async (argv) => {
      const todo = await markDone(argv.id!);
      if (!todo) {
        printError(`Todo #${argv.id} not found`);
        process.exit(1);
      }
      printSuccess(`Marked #${todo.id} as done: "${todo.title}"`);
    },
  )

  // ── remove ───────────────────────────────────────────────────────────────
  .command(
    "remove <id>",
    "Remove a todo permanently",
    (y) =>
      y.positional("id", { type: "number", demandOption: true, describe: "Todo ID" }),
    async (argv) => {
      const ok = await removeTodo(argv.id!);
      if (!ok) {
        printError(`Todo #${argv.id} not found`);
        process.exit(1);
      }
      printSuccess(`Removed #${argv.id}`);
    },
  )

  // ── clear ─────────────────────────────────────────────────────────────────
  .command(
    "clear",
    "Remove all todos (or only completed ones)",
    (y) =>
      y.option("done-only", {
        type:     "boolean",
        default:  false,
        describe: "Only clear completed todos",
      }),
    async (argv) => {
      const n = await clearTodos(argv["done-only"] ? "done" : undefined);
      printSuccess(`Removed ${n} todo${n !== 1 ? "s" : ""}`);
    },
  )

  .demandCommand(1, "Please provide a command")
  .strict()
  .help()
  .parse();
