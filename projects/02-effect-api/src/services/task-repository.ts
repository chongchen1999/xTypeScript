import { Context, Effect, Layer } from "effect";
import { eq, and, asc }          from "drizzle-orm";
import { db }                    from "@/db/migrate.js";
import { tasks }                 from "@/db/schema.js";
import { NotFoundError, DatabaseError } from "@/errors.js";
import type { CreateTask, UpdateTask, TaskQuery } from "@/models/task.js";
import type { Task } from "@/db/schema.js";

// --- Service interface ---
export class TaskRepository extends Context.Tag("TaskRepository")<
  TaskRepository,
  {
    findAll(query: TaskQuery):                  Effect.Effect<Task[], DatabaseError>;
    findById(id: number):                       Effect.Effect<Task,   NotFoundError | DatabaseError>;
    create(data: CreateTask):                   Effect.Effect<Task,   DatabaseError>;
    update(id: number, data: UpdateTask):       Effect.Effect<Task,   NotFoundError | DatabaseError>;
    delete(id: number):                         Effect.Effect<void,   NotFoundError | DatabaseError>;
  }
>() {}

// --- Drizzle SQLite implementation ---
export const TaskRepositoryLive = Layer.succeed(TaskRepository, {
  findAll: (query) =>
    Effect.try({
      try: () => {
        // Build filter conditions dynamically
        const conditions = [];
        if (query.status !== "all") {
          conditions.push(eq(tasks.status, query.status as Task["status"]));
        }
        if (query.priority) {
          conditions.push(eq(tasks.priority, query.priority));
        }
        return db
          .select()
          .from(tasks)
          .where(conditions.length ? and(...conditions) : undefined)
          .orderBy(asc(tasks.createdAt))
          .limit(query.limit)
          .offset(query.offset)
          .all();
      },
      catch: (cause) => new DatabaseError({ cause }),
    }),

  findById: (id) =>
    Effect.try({
      try: () => db.select().from(tasks).where(eq(tasks.id, id)).get(),
      catch: (cause) => new DatabaseError({ cause }),
    }).pipe(
      Effect.flatMap(row =>
        row
          ? Effect.succeed(row)
          : Effect.fail(new NotFoundError({ resource: "Task", id })),
      ),
    ),

  create: (data) =>
    Effect.try({
      try: () => {
        const [row] = db.insert(tasks).values(data).returning().all();
        return row!;
      },
      catch: (cause) => new DatabaseError({ cause }),
    }),

  update: (id, data) =>
    Effect.try({
      try: () =>
        db
          .update(tasks)
          .set({ ...data, updatedAt: new Date() })
          .where(eq(tasks.id, id))
          .returning()
          .get(),
      catch: (cause) => new DatabaseError({ cause }),
    }).pipe(
      Effect.flatMap(row =>
        row
          ? Effect.succeed(row)
          : Effect.fail(new NotFoundError({ resource: "Task", id })),
      ),
    ),

  delete: (id) =>
    Effect.try({
      try: () => {
        const result = db.delete(tasks).where(eq(tasks.id, id)).returning().all();
        return result.length > 0;
      },
      catch: (cause) => new DatabaseError({ cause }),
    }).pipe(
      Effect.flatMap(ok =>
        ok
          ? Effect.succeed(undefined)
          : Effect.fail(new NotFoundError({ resource: "Task", id })),
      ),
    ),
});
