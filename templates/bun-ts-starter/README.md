# bun-ts-starter

Minimal Bun + TypeScript project template. Copy and rename to start a new project.

```bash
cp -r templates/bun-ts-starter my-project
cd my-project
bun install
bun dev
```

## Structure

```
bun-ts-starter/
├── src/
│   └── index.ts      # Entry point
├── tests/
│   └── index.test.ts # Bun test example
├── package.json
├── tsconfig.json
└── .gitignore
```

## Scripts

| Command       | Description                        |
|---------------|------------------------------------|
| `bun dev`     | Run with `--watch` (auto-restart)  |
| `bun start`   | Run once                           |
| `bun test`    | Run all `*.test.ts` files          |
| `bun check`   | Type-check without emitting output |

## tsconfig highlights

- `"strict": true` — enables all strict checks
- `"noUncheckedIndexedAccess": true` — array index returns `T | undefined`
- `"exactOptionalPropertyTypes": true` — distinguishes `{ x?: T }` from `{ x: T | undefined }`
- `"verbatimModuleSyntax": true` — enforces `import type` for type-only imports
- `"moduleResolution": "bundler"` — correct resolution for Bun/Vite/esbuild

## Adding dependencies

```bash
bun add zod                  # runtime dependency
bun add -d @types/node       # dev-only type definitions
```
