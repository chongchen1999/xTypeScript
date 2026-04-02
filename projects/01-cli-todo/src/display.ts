import type { Todo, Priority } from "@/types.js";

const PRIORITY_COLOR: Record<Priority, string> = {
  high:   "\x1b[31m", // red
  medium: "\x1b[33m", // yellow
  low:    "\x1b[36m", // cyan
};
const STATUS_COLOR = { done: "\x1b[90m", pending: "\x1b[0m" };
const RESET = "\x1b[0m";
const BOLD  = "\x1b[1m";
const DIM   = "\x1b[2m";

function priorityLabel(p: Priority): string {
  return `${PRIORITY_COLOR[p]}${p.toUpperCase().padEnd(6)}${RESET}`;
}

export function printTodo(todo: Todo): void {
  const status    = todo.status === "done" ? `${DIM}✔${RESET}` : " ";
  const titleColor = STATUS_COLOR[todo.status];
  const date      = new Date(todo.createdAt).toLocaleDateString();
  console.log(
    ` ${status} ${BOLD}#${String(todo.id).padStart(3)}${RESET}  ` +
    `${priorityLabel(todo.priority)}  ` +
    `${titleColor}${todo.title}${RESET}  ` +
    `${DIM}${date}${RESET}`,
  );
}

export function printTodos(todos: Todo[]): void {
  if (todos.length === 0) {
    console.log(`${DIM}  (no todos)${RESET}`);
    return;
  }
  // Group by status: pending first, then done
  const pending = todos.filter(t => t.status === "pending");
  const done    = todos.filter(t => t.status === "done");

  if (pending.length > 0) {
    console.log(`\n${BOLD}Pending (${pending.length})${RESET}`);
    for (const t of pending) printTodo(t);
  }
  if (done.length > 0) {
    console.log(`\n${BOLD}Done (${done.length})${RESET}`);
    for (const t of done) printTodo(t);
  }
  console.log();
}

export function printSuccess(msg: string): void {
  console.log(`\x1b[32m✔${RESET} ${msg}`);
}

export function printError(msg: string): void {
  console.error(`\x1b[31m✖${RESET} ${msg}`);
}
