# effect-api

REST API for task management built with **Effect + Hono + Drizzle + SQLite**.

Demonstrates: Effect `Context.Tag` services, tagged errors, `Effect.try` for wrapping sync DB calls, Hono routing with `zValidator`, Drizzle ORM with Bun SQLite.

## Quick start

```bash
cd projects/02-effect-api
bun install
bun start
```

Server listens on `http://localhost:3000`. The SQLite database (`tasks.db`) is created automatically on first run.

## API reference

| Method   | Path          | Description                             |
|----------|---------------|-----------------------------------------|
| `GET`    | `/health`     | Health check                            |
| `GET`    | `/tasks`      | List tasks (filterable, paginated)      |
| `GET`    | `/tasks/:id`  | Get task by ID                          |
| `POST`   | `/tasks`      | Create task                             |
| `PATCH`  | `/tasks/:id`  | Update task fields                      |
| `DELETE` | `/tasks/:id`  | Delete task                             |

### Query parameters for `GET /tasks`

| Parameter  | Values                          | Default     |
|------------|---------------------------------|-------------|
| `status`   | `pending` `in_progress` `done` `all` | `all`  |
| `priority` | `low` `medium` `high`           | —           |
| `limit`    | 1–100                           | 50          |
| `offset`   | ≥0                              | 0           |

### Example requests

```bash
# Create
curl -X POST http://localhost:3000/tasks \
  -H "Content-Type: application/json" \
  -d '{"title":"Write docs","priority":"high"}'

# List pending high-priority tasks
curl "http://localhost:3000/tasks?status=pending&priority=high"

# Mark done
curl -X PATCH http://localhost:3000/tasks/1 \
  -H "Content-Type: application/json" \
  -d '{"status":"done"}'

# Delete
curl -X DELETE http://localhost:3000/tasks/1
```

## Project structure

```
02-effect-api/
├── src/
│   ├── main.ts                        # App entry — layer wiring + Bun.serve
│   ├── errors.ts                      # Tagged errors: NotFoundError, DatabaseError
│   ├── db/
│   │   ├── schema.ts                  # Drizzle table definition + inferred types
│   │   ├── client.ts                  # drizzle() instance
│   │   └── migrate.ts                 # Inline DDL migration (idempotent)
│   ├── models/
│   │   └── task.ts                    # Zod schemas: CreateTask, UpdateTask, TaskQuery
│   ├── services/
│   │   └── task-repository.ts         # Effect service + Drizzle live implementation
│   └── routes/
│       └── tasks.ts                   # Hono route handlers
├── tests/
│   └── task-repository.test.ts        # Unit tests with :memory: DB
├── drizzle.config.ts
├── package.json
└── tsconfig.json
```

## Architecture walkthrough

### 1. Tagged errors

All failure cases use `Data.TaggedError`, which makes exhaustive error handling compile-time safe:

```typescript
export class NotFoundError extends Data.TaggedError("NotFoundError")<{
  resource: string; id: number;
}> {}
```

### 2. Wrapping synchronous Drizzle calls

```typescript
findById: (id) =>
  Effect.try({
    try:   () => db.select().from(tasks).where(eq(tasks.id, id)).get(),
    catch: (cause) => new DatabaseError({ cause }),
  }).pipe(
    Effect.flatMap(row =>
      row ? Effect.succeed(row)
          : Effect.fail(new NotFoundError({ resource: "Task", id })),
    ),
  ),
```

### 3. Service injection

The repository is resolved once at startup and closed over in route handlers — no per-request overhead:

```typescript
const repo = await Effect.runPromise(
  TaskRepository.pipe(Effect.provide(TaskRepositoryLive)),
);
app.route("/tasks", buildTasksRouter(repo));
```

## Running tests

```bash
bun test
# Tests use DATABASE_URL=:memory: (in-memory SQLite, no file created)
```

## Learning goals

- **Effect services + layers**: `Context.Tag`, `Layer.succeed`, `Effect.provide`
- **Error modelling**: `Data.TaggedError`, `catchTag`, `Effect.either` in tests
- **Drizzle ORM**: schema definition, type inference, SQLite queries with filters
- **Zod**: validation schemas shared between route handlers and service types
