# solidjs-app

SolidJS + TanStack Query + SolidJS Router frontend template. Copy and rename to start a new app.

```bash
cp -r templates/solidjs-app my-app
cd my-app
bun install
bun dev           # starts Vite dev server on http://localhost:5173
```

Expects a backend API running at `http://localhost:3000/api` (proxied by Vite in dev).
Pair with the `hono-api` template for a full-stack setup.

## Structure

```
solidjs-app/
├── index.html
├── vite.config.ts
├── tsconfig.json
├── src/
│   ├── main.tsx              # App entry — Router + QueryClientProvider
│   ├── routes.ts             # Route definitions (lazy-loaded pages)
│   ├── pages/
│   │   ├── Home.tsx
│   │   ├── Items.tsx         # List + delete with TanStack Query
│   │   ├── ItemDetail.tsx    # Detail page using route params
│   │   └── NotFound.tsx
│   └── lib/
│       ├── api.ts            # Type-safe fetch client
│       ├── query-client.ts   # Shared QueryClient instance
│       └── signals.ts        # Utility signal factories
└── .gitignore
```

## Key patterns

### SolidJS reactivity vs React

SolidJS components run **once** — signals drive fine-grained updates, not re-renders:

```tsx
// Correct — read signal inside JSX or effects
const [count, setCount] = createSignal(0);
return <button onClick={() => setCount(c => c + 1)}>{count()}</button>;

// WRONG — do NOT destructure props (breaks reactivity)
// function Btn({ label }) { ... }   ← bad
function Btn(props: { label: string }) { return <span>{props.label}</span>; }
```

### Route params

```tsx
const params = useParams<{ id: string }>();
// Access as params.id — reactive, updates on navigation
```

### TanStack Query

```tsx
const query = createQuery(() => ({
  queryKey: ["items"],
  queryFn:  () => api.items.list(),
}));

const mutation = createMutation(() => ({
  mutationFn: (id: number) => api.items.delete(id),
  onSuccess:  () => queryClient.invalidateQueries({ queryKey: ["items"] }),
}));
```

### Conditional rendering with `<Show>`

```tsx
<Show when={query.isSuccess && query.data}>
  {(data) => <p>{data().name}</p>}  {/* accessor pattern — always fresh */}
</Show>
```

## Adding Tailwind CSS

```bash
bun add -d tailwindcss @tailwindcss/vite
```

In `vite.config.ts`:
```typescript
import tailwindcss from "@tailwindcss/vite";
plugins: [solid(), tailwindcss()]
```

In `src/main.tsx` or a global CSS file:
```css
@import "tailwindcss";
```

## Environment variables

Vite exposes only variables prefixed with `VITE_`:

| Variable          | Default | Description             |
|-------------------|---------|-------------------------|
| `VITE_API_BASE`   | `/api`  | Backend API base URL    |
