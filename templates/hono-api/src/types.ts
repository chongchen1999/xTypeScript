import type { ItemRepository } from "@/services/item-repository.js";

// Hono context variable types — add more as your app grows
export type AppEnv = {
  Variables: {
    repo:   InstanceType<typeof ItemRepository>["Service"];
    userId: string | null;
  };
};
