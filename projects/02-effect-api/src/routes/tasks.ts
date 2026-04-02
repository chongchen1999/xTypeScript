import { Effect, Layer } from "effect";
import { Hono }          from "hono";
import { zValidator }    from "@hono/zod-validator";
import { TaskRepository } from "@/services/task-repository.js";
import {
  CreateTaskSchema,
  UpdateTaskSchema,
  TaskQuerySchema,
} from "@/models/task.js";

// Helper: run an Effect and map errors to Hono responses
async function runEffect<A>(
  c: Parameters<Parameters<Hono["get"]>[1]>[0],
  effect: Effect.Effect<A, import("@/errors.js").NotFoundError | import("@/errors.js").DatabaseError>,
  onSuccess: (value: A) => Response,
): Promise<Response> {
  return Effect.runPromise(
    effect.pipe(
      Effect.map(onSuccess),
      Effect.catchTag("NotFoundError", (e) =>
        Effect.succeed(c.json({ error: `${e.resource} #${e.id} not found` }, 404)),
      ),
      Effect.catchTag("DatabaseError", (e) => {
        console.error("[DB]", e.cause);
        return Effect.succeed(c.json({ error: "Database error" }, 500));
      }),
    ),
  );
}

export function buildTasksRouter(repo: TaskRepository["Service"]): Hono {
  const router = new Hono();

  // GET /tasks?status=&priority=&limit=&offset=
  router.get("/", zValidator("query", TaskQuerySchema), async (c) => {
    const query = c.req.valid("query");
    return runEffect(c, repo.findAll(query), (tasks) => c.json(tasks));
  });

  // GET /tasks/:id
  router.get("/:id", async (c) => {
    const id = Number(c.req.param("id"));
    return runEffect(c, repo.findById(id), (task) => c.json(task));
  });

  // POST /tasks
  router.post("/", zValidator("json", CreateTaskSchema), async (c) => {
    const data = c.req.valid("json");
    return runEffect(c, repo.create(data), (task) => c.json(task, 201));
  });

  // PATCH /tasks/:id
  router.patch("/:id", zValidator("json", UpdateTaskSchema), async (c) => {
    const id   = Number(c.req.param("id"));
    const data = c.req.valid("json");
    return runEffect(c, repo.update(id, data), (task) => c.json(task));
  });

  // DELETE /tasks/:id
  router.delete("/:id", async (c) => {
    const id = Number(c.req.param("id"));
    return runEffect(c, repo.delete(id), () => c.body(null, 204));
  });

  return router;
}
