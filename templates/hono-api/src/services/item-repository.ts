import { Context, Effect, Layer, Ref } from "effect";
import type { Item } from "@/models/item.js";

// --- ItemRepository service ---
export class ItemRepository extends Context.Tag("ItemRepository")<
  ItemRepository,
  {
    findAll():                       Effect.Effect<Item[]>;
    findById(id: number):            Effect.Effect<Item | null>;
    create(data: Omit<Item, "id">):  Effect.Effect<Item>;
    update(id: number, data: Partial<Omit<Item, "id">>): Effect.Effect<Item | null>;
    delete(id: number):              Effect.Effect<boolean>;
  }
>() {}

// In-memory implementation — swap for a real DB layer in production
export const ItemRepositoryLive = Layer.effect(
  ItemRepository,
  Effect.gen(function* () {
    const store = yield* Ref.make<Item[]>([
      { id: 1, name: "Widget",  description: "A sample widget",  createdAt: new Date() },
      { id: 2, name: "Gadget",  description: "A sample gadget",  createdAt: new Date() },
    ]);
    let nextId = 3;

    return {
      findAll: () => Ref.get(store),

      findById: (id) =>
        Ref.get(store).pipe(
          Effect.map(items => items.find(i => i.id === id) ?? null),
        ),

      create: (data) =>
        Effect.gen(function* () {
          const item: Item = { id: nextId++, ...data, createdAt: new Date() };
          yield* Ref.update(store, items => [...items, item]);
          return item;
        }),

      update: (id, data) =>
        Effect.gen(function* () {
          let updated: Item | null = null;
          yield* Ref.update(store, items =>
            items.map(i => {
              if (i.id !== id) return i;
              updated = { ...i, ...data };
              return updated;
            }),
          );
          return updated;
        }),

      delete: (id) =>
        Effect.gen(function* () {
          const before = yield* Ref.get(store);
          yield* Ref.update(store, items => items.filter(i => i.id !== id));
          const after = yield* Ref.get(store);
          return after.length < before.length;
        }),
    };
  }),
);
