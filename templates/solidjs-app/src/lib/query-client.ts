import { QueryClient } from "@tanstack/query-core";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 30, // 30 seconds
      retry:     1,
    },
  },
});
