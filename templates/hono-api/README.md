# hono-api

Production-ready Hono + Effect + Zod API template. Copy and rename to start a new service.

```bash
cp -r templates/hono-api my-api
cd my-api
bun install
bun dev
```

The server starts on port `3000` by default (set `PORT` env var to override).

## Structure

```
hono-api/
├── src/
│   ├── main.ts                    # Entry point — app wiring and server start
│   ├── types.ts                   # Hono AppEnv (typed context variables)
│   ├── errors.ts                  # Tagged Effect errors (NotFound, Validation, …)
│   ├── models/
│   │   └── item.ts                # Zod schemas + TypeScript types
│   ├── services/
│   │   ├── logger.ts              # Logger service + live layer
│   │   └── item-repository.ts     # ItemRepository service + in-memory live layer
│   ├── routes/
│   │   └── items.ts               # CRUD route handlers for /api/items
│   └── middleware/
│       └── auth.ts                # Bearer token middleware
├── tests/
│   └── items.test.ts              # Integration tests (Bun test)
├── package.json
├── tsconfig.json
└── .gitignore
```

## API endpoints

All routes under `/api/*` require `Authorization: Bearer <token>` (default token: `dev-token`).

| Method   | Path           | Description         |
|----------|----------------|---------------------|
| `GET`    | `/health`      | Health check        |
| `GET`    | `/api/items`   | List all items      |
| `GET`    | `/api/items/:id` | Get item by id    |
| `POST`   | `/api/items`   | Create item         |
| `PATCH`  | `/api/items/:id` | Update item       |
| `DELETE` | `/api/items/:id` | Delete item       |

## Patterns used

### Effect + Hono integration

Services are resolved once at startup via `Effect.runPromise` and injected
into Hono context via middleware — no runtime overhead per request:

```typescript
const repo = await Effect.runPromise(
  ItemRepository.pipe(Effect.provide(AppLayer)),
);
app.use("*", async (c, next) => { c.set("repo", repo); await next(); });
```

### Tagged errors

```typescript
export class NotFoundError extends Data.TaggedError("NotFoundError")<{
  resource: string; id: number;
}> {}

// In route handler:
Effect.catchTag("NotFoundError", (e) =>
  Effect.succeed(c.json({ error: `${e.resource} ${e.id} not found` }, 404)),
)
```

### Zod request validation

```typescript
itemsRouter.post("/", zValidator("json", CreateItemSchema), async (c) => {
  const data = c.req.valid("json"); // fully typed, already validated
  ...
});
```

## Extending the template

1. **Add a new resource**: copy `models/item.ts` + `routes/items.ts`, register in `main.ts`
2. **Swap in a real DB**: replace `ItemRepositoryLive` with a Drizzle/Prisma layer
3. **Add JWT auth**: replace the simple token check in `middleware/auth.ts`
4. **Add OpenAPI docs**: install `@hono/zod-openapi` and wrap routes with schema metadata

## Environment variables

| Variable    | Default     | Description              |
|-------------|-------------|--------------------------|
| `PORT`      | `3000`      | HTTP listen port         |
| `API_TOKEN` | `dev-token` | Bearer token for auth    |
