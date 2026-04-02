/**
 * Solution: 06-01 Rewrite Promise Code with Effect
 */

import { Effect, Data } from "effect";

// Tagged error types — each carries relevant context
class ValidationError extends Data.TaggedError("ValidationError")<{
  readonly field: string;
  readonly message: string;
}> {}

class UserNotFound extends Data.TaggedError("UserNotFound")<{
  readonly userId: string;
}> {}

class FetchError extends Data.TaggedError("FetchError")<{
  readonly url: string;
  readonly cause: unknown;
}> {}

// Helper: wrap fetch + check ok + parse JSON
const fetchJSON = <T>(url: string): Effect.Effect<T, FetchError> =>
  Effect.tryPromise({
    try: async () => {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.json() as Promise<T>;
    },
    catch: (cause) => new FetchError({ url, cause }),
  });

const fetchUserWithPosts = (userId: string) =>
  Effect.gen(function* () {
    // Validate input
    if (!userId) {
      yield* Effect.fail(new ValidationError({ field: "userId", message: "userId is required" }));
    }

    // Fetch user
    const user = yield* fetchJSON<{ id: string; name: string }>(`/api/users/${userId}`).pipe(
      Effect.catchTag("FetchError", () =>
        Effect.fail(new UserNotFound({ userId }))
      ),
    );

    // Fetch posts
    const posts = yield* fetchJSON<Array<{ id: string; title: string }>>(
      `/api/users/${userId}/posts`
    );

    return { user, posts: posts.slice(0, 5) };
  });
// Return type: Effect<{user, posts}, ValidationError | UserNotFound | FetchError, never>

// --- run ---
Effect.runPromise(fetchUserWithPosts("u-1"))
  .then(console.log)
  .catch(console.error);
