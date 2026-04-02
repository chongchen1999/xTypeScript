# fullstack-app

Full-stack notes app using a **Bun workspaces monorepo** with three packages:

| Package | Role | Tech |
|---------|------|------|
| `packages/shared` | Domain types + API contract | Zod, TypeScript |
| `packages/server` | REST API          | Hono, Drizzle, Bun SQLite |
| `packages/client` | SPA frontend      | SolidJS, TanStack Query, Vite |

The key idea: `@fullstack/shared` is imported by **both** server and client, so request/response types can never drift out of sync.

## Quick start

```bash
cd projects/03-fullstack-app
bun install            # installs all workspace packages at once

# Terminal 1 — start the API server (port 3000)
cd packages/server && bun dev

# Terminal 2 — start the Vite dev server (port 5173, proxies /api → :3000)
cd packages/client && bun dev
```

Open `http://localhost:5173`.

## Project structure

```
03-fullstack-app/
├── package.json                    # Workspace root
├── packages/
│   ├── shared/                     # Shared types package
│   │   └── src/index.ts            # Note, CreateNote, UpdateNote, ENDPOINTS
│   │
│   ├── server/                     # Hono API
│   │   ├── src/
│   │   │   ├── main.ts             # Entry — Hono app + Bun.serve
│   │   │   ├── db.ts               # Drizzle + inline SQLite migration
│   │   │   └── routes/notes.ts     # CRUD route handlers
│   │   └── tests/notes.test.ts     # Integration tests (:memory: DB)
│   │
│   └── client/                     # SolidJS SPA
│       ├── src/
│       │   ├── main.tsx            # App entry — Router + QueryClientProvider
│       │   ├── api.ts              # Typed fetch client (uses shared ENDPOINTS)
│       │   └── pages/
│       │       ├── NoteList.tsx    # List + archive + delete
│       │       ├── NoteDetail.tsx  # View + inline edit
│       │       └── NoteForm.tsx    # Create form
│       └── vite.config.ts
```

## Features

- **List** notes, filter by `active` / `archived` / `all`
- **Create** notes with title + body
- **Edit** notes inline (optimistic cache update via `queryClient.setQueryData`)
- **Archive** notes (soft status change)
- **Delete** notes

## API reference

All routes on `http://localhost:3000`:

| Method   | Path              | Description          |
|----------|-------------------|----------------------|
| `GET`    | `/health`         | Health check         |
| `GET`    | `/api/notes`      | List (`?status=`)    |
| `GET`    | `/api/notes/:id`  | Get note             |
| `POST`   | `/api/notes`      | Create note          |
| `PATCH`  | `/api/notes/:id`  | Update note          |
| `DELETE` | `/api/notes/:id`  | Delete note          |

## Running tests

```bash
# From the repo root
bun run test

# Or per package
cd packages/server && bun test
```

## Learning goals

- **Bun workspaces**: `workspace:*` protocol, cross-package imports
- **End-to-end type safety**: shared Zod schemas imported by both server and client
- **SolidJS**: fine-grained reactivity, `createSignal` for local state, `<Show>`/`<For>`
- **TanStack Query**: `createQuery`, `createMutation`, manual cache updates with `setQueryData`
- **Hono**: CORS, proxy setup, `zValidator`, `notFound` handler
- **Drizzle**: inline DDL migration, `eq`/`and`/`desc` query builders

## Extending the app

1. **Add tags**: add a `tags` table, extend `@fullstack/shared`, update both server and client
2. **Add search**: `LIKE` query in the server route, search input in `NoteList`
3. **Add auth**: JWT middleware in the server, login page in the client
4. **Deploy**: `vite build` for the client, `bun build --target bun src/main.ts` for the server
