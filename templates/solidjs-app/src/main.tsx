/* SolidJS Router v0.14 file-based routing entry point */
import { render }  from "solid-js/web";
import { Router }  from "@solidjs/router";
import { QueryClientProvider } from "@tanstack/solid-query";
import { queryClient } from "@/lib/query-client.js";
import { routes }  from "@/routes.js";

const root = document.getElementById("root");
if (!root) throw new Error("No #root element found");

render(
  () => (
    <QueryClientProvider client={queryClient}>
      <Router>{routes}</Router>
    </QueryClientProvider>
  ),
  root,
);
