# cli-todo

Command-line todo manager built with **Bun + Yargs**. Data persists to `todos.json`.

Demonstrates: Yargs subcommands, file I/O with `Bun.file`/`Bun.write`, TypeScript discriminated unions, terminal colour output.

## Quick start

```bash
cd projects/01-cli-todo
bun install
bun start -- --help
```

Or register the binary globally:

```bash
bun link          # makes `todo` available system-wide
todo --help
```

## Commands

```
todo add <title> [-p low|medium|high]   Add a new todo
todo list        [-s pending|done|all]  List todos (filter by status or priority)
             [-p low|medium|high]
todo done <id>                          Mark a todo as done
todo remove <id>                        Permanently delete a todo
todo clear       [--done-only]          Delete all (or only completed) todos
```

### Examples

```bash
bun start -- add "Write unit tests" -p high
bun start -- add "Buy coffee" -p low
bun start -- list
bun start -- list -s pending -p high
bun start -- done 1
bun start -- list -s done
bun start -- clear --done-only
```

## Project structure

```
01-cli-todo/
├── src/
│   ├── main.ts      # Yargs CLI entry point
│   ├── store.ts     # Read/write todos.json, CRUD helpers
│   ├── display.ts   # ANSI colour output helpers
│   └── types.ts     # Todo, Priority, Status types
├── tests/
│   └── store.test.ts
├── todos.json       # Created automatically on first use
├── package.json
└── tsconfig.json
```

## Data format

```json
{
  "nextId": 3,
  "todos": [
    {
      "id": 1,
      "title": "Write unit tests",
      "priority": "high",
      "status": "done",
      "createdAt": "2025-01-01T10:00:00.000Z",
      "doneAt": "2025-01-01T11:00:00.000Z"
    }
  ]
}
```

## Running tests

```bash
bun test
```

## Learning goals

- **Modules**: `import`/`export`, `@/*` path alias with `moduleResolution: bundler`
- **Yargs**: positional args, typed `choices`, `demandOption`, chained `command`
- **File I/O**: `Bun.file().json()`, `Bun.write()`, existence check
- **TypeScript**: discriminated union (`Status`), `const` assertions on `choices`
- **Testing**: isolated test state via `TODO_DATA_DIR` env var
