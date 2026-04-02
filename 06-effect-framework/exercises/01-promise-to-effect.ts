/**
 * Exercise 06-01: Rewrite Promise Code with Effect
 *
 * The function below uses Promise + try/catch.
 * Rewrite it using Effect.gen + tagged errors.
 *
 * Requirements:
 *  - Define tagged error classes for each failure case
 *  - Use Effect.tryPromise (or Effect.try) to wrap async operations
 *  - The final Effect type should have all errors in the `E` parameter
 *    (no `never` unless there really are no errors)
 *  - Use Effect.runPromise at the bottom to execute
 */

import { Effect, Data } from "effect";

// --- original Promise version (for reference, do not modify) ---
async function fetchUserWithPosts_Promise(userId: string) {
  if (!userId) throw new Error("userId is required");

  const userRes = await fetch(`/api/users/${userId}`);
  if (!userRes.ok) throw new Error(`User ${userId} not found`);
  const user: { id: string; name: string } = await userRes.json();

  const postsRes = await fetch(`/api/users/${userId}/posts`);
  if (!postsRes.ok) throw new Error("Failed to fetch posts");
  const posts: Array<{ id: string; title: string }> = await postsRes.json();

  return { user, posts: posts.slice(0, 5) };
}

// --- TODO: define tagged error types ---
// class ValidationError ...
// class UserNotFound ...
// class FetchError ...

// --- TODO: rewrite using Effect ---
const fetchUserWithPosts = (userId: string) =>
  Effect.gen(function* () {
    // TODO: implement
    throw new Error("Not implemented");
  });

// --- run ---
Effect.runPromise(fetchUserWithPosts("u-1"))
  .then(console.log)
  .catch(console.error);
