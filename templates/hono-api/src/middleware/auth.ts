import { createMiddleware } from "hono/factory";
import type { AppEnv } from "@/types.js";

// Bearer token auth — replace with real JWT validation in production
export const authMiddleware = createMiddleware<AppEnv>(async (c, next) => {
  const token = c.req.header("Authorization")?.replace("Bearer ", "");
  const validToken = process.env["API_TOKEN"] ?? "dev-token";

  if (!token || token !== validToken) {
    return c.json({ error: "Unauthorized" }, 401);
  }
  c.set("userId", `user-from-${token}`);
  await next();
});
