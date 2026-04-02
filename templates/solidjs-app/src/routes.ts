import type { RouteDefinition } from "@solidjs/router";
import { lazy } from "solid-js";

export const routes: RouteDefinition[] = [
  {
    path:      "/",
    component: lazy(() => import("@/pages/Home.js")),
  },
  {
    path:      "/items",
    component: lazy(() => import("@/pages/Items.js")),
  },
  {
    path:      "/items/:id",
    component: lazy(() => import("@/pages/ItemDetail.js")),
  },
  {
    path:      "/*",
    component: lazy(() => import("@/pages/NotFound.js")),
  },
];
