import { describe, expect, it, beforeAll } from "bun:test";
import { Effect }        from "effect";
import { TaskRepository, TaskRepositoryLive } from "../src/services/task-repository.js";

// Use an in-memory DB for tests
process.env["DATABASE_URL"] = ":memory:";

const repo = await Effect.runPromise(
  TaskRepository.pipe(Effect.provide(TaskRepositoryLive)),
);

describe("TaskRepository", () => {
  describe("create + findById", () => {
    it("creates a task and retrieves it by id", async () => {
      const task = await Effect.runPromise(
        repo.create({ title: "Test task", priority: "high" }),
      );
      expect(task.title).toBe("Test task");
      expect(task.priority).toBe("high");
      expect(task.status).toBe("pending");

      const found = await Effect.runPromise(repo.findById(task.id));
      expect(found.id).toBe(task.id);
    });

    it("fails with NotFoundError for unknown id", async () => {
      const result = await Effect.runPromise(
        repo.findById(99999).pipe(Effect.either),
      );
      expect(result._tag).toBe("Left");
      if (result._tag === "Left") {
        expect(result.left._tag).toBe("NotFoundError");
      }
    });
  });

  describe("findAll", () => {
    it("filters by status", async () => {
      const t = await Effect.runPromise(
        repo.create({ title: "Pending task", priority: "low" }),
      );
      await Effect.runPromise(
        repo.update(t.id, { status: "done" }),
      );

      const done = await Effect.runPromise(
        repo.findAll({ status: "done", limit: 50, offset: 0 }),
      );
      expect(done.every(t => t.status === "done")).toBe(true);
    });
  });

  describe("update", () => {
    it("updates title and status", async () => {
      const task    = await Effect.runPromise(repo.create({ title: "Old title", priority: "medium" }));
      const updated = await Effect.runPromise(repo.update(task.id, { title: "New title", status: "in_progress" }));
      expect(updated.title).toBe("New title");
      expect(updated.status).toBe("in_progress");
    });
  });

  describe("delete", () => {
    it("deletes an existing task", async () => {
      const task = await Effect.runPromise(repo.create({ title: "Delete me", priority: "low" }));
      await Effect.runPromise(repo.delete(task.id));
      const result = await Effect.runPromise(repo.findById(task.id).pipe(Effect.either));
      expect(result._tag).toBe("Left");
    });
  });
});
