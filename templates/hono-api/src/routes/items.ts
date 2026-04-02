import { Effect } from "effect";
import { Hono }   from "hono";
import { zValidator } from "@hono/zod-validator";
import { ItemRepository } from "@/services/item-repository.js";
import { CreateItemSchema, UpdateItemSchema } from "@/models/item.js";
import { NotFoundError } from "@/errors.js";
import type { AppEnv } from "@/types.js";

export const itemsRouter = new Hono<AppEnv>();

// GET /items
itemsRouter.get("/", async (c) => {
  const repo    = c.get("repo");
  const program = ItemRepository.findAll().pipe(
    Effect.provideService(ItemRepository, repo),
  );
  const items = await Effect.runPromise(program);
  return c.json(items);
});

// GET /items/:id
itemsRouter.get("/:id", async (c) => {
  const id   = Number(c.req.param("id"));
  const repo = c.get("repo");

  const program = Effect.gen(function* () {
    const item = yield* ItemRepository.findById(id);
    if (!item) yield* Effect.fail(new NotFoundError({ resource: "Item", id }));
    return item!;
  }).pipe(
    Effect.provideService(ItemRepository, repo),
    Effect.catchTag("NotFoundError", (e) =>
      Effect.succeed(c.json({ error: `${e.resource} ${e.id} not found` }, 404)),
    ),
  );

  return await Effect.runPromise(program as any);
});

// POST /items
itemsRouter.post("/", zValidator("json", CreateItemSchema), async (c) => {
  const data = c.req.valid("json");
  const repo = c.get("repo");

  const program = ItemRepository.create(data).pipe(
    Effect.provideService(ItemRepository, repo),
  );
  const item = await Effect.runPromise(program);
  return c.json(item, 201);
});

// PATCH /items/:id
itemsRouter.patch("/:id", zValidator("json", UpdateItemSchema), async (c) => {
  const id   = Number(c.req.param("id"));
  const data = c.req.valid("json");
  const repo = c.get("repo");

  const program = Effect.gen(function* () {
    const item = yield* ItemRepository.update(id, data);
    if (!item) yield* Effect.fail(new NotFoundError({ resource: "Item", id }));
    return item!;
  }).pipe(
    Effect.provideService(ItemRepository, repo),
    Effect.catchTag("NotFoundError", (e) =>
      Effect.succeed(c.json({ error: `${e.resource} ${e.id} not found` }, 404)),
    ),
  );

  return await Effect.runPromise(program as any);
});

// DELETE /items/:id
itemsRouter.delete("/:id", async (c) => {
  const id   = Number(c.req.param("id"));
  const repo = c.get("repo");

  const program = Effect.gen(function* () {
    const ok = yield* ItemRepository.delete(id);
    if (!ok) yield* Effect.fail(new NotFoundError({ resource: "Item", id }));
    return ok;
  }).pipe(
    Effect.provideService(ItemRepository, repo),
    Effect.catchTag("NotFoundError", (e) =>
      Effect.succeed(c.json({ error: `${e.resource} ${e.id} not found` }, 404)),
    ),
  );

  await Effect.runPromise(program as any);
  return c.body(null, 204);
});
