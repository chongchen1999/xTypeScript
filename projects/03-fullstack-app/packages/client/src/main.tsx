import { render }              from "solid-js/web";
import { Router, Route }       from "@solidjs/router";
import { QueryClientProvider } from "@tanstack/solid-query";
import { QueryClient }         from "@tanstack/query-core";
import { lazy }                from "solid-js";

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 1000 * 30, retry: 1 } },
});

const root = document.getElementById("root");
if (!root) throw new Error("No #root element");

render(
  () => (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Route path="/"         component={lazy(() => import("@/pages/NoteList.js"))} />
        <Route path="/notes/new" component={lazy(() => import("@/pages/NoteForm.js"))} />
        <Route path="/notes/:id" component={lazy(() => import("@/pages/NoteDetail.js"))} />
        <Route path="/*"        component={() => <h1>404 — Not Found</h1>} />
      </Router>
    </QueryClientProvider>
  ),
  root,
);
