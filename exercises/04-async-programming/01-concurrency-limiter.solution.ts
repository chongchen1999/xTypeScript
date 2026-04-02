/**
 * Solution: 04-01 Concurrent Request Limiter
 */

export async function limitConcurrency<T>(
  tasks: Array<() => Promise<T>>,
  limit: number,
): Promise<T[]> {
  const results: T[] = new Array(tasks.length);
  const queue = tasks.map((task, index) => ({ task, index }));
  let active = 0;
  let cursor = 0;

  return new Promise((resolve, reject) => {
    function runNext() {
      // Fill up to `limit` concurrent slots
      while (active < limit && cursor < queue.length) {
        const { task, index } = queue[cursor++];
        active++;

        task()
          .then((result) => {
            results[index] = result;
            active--;
            if (cursor < queue.length) {
              runNext();
            } else if (active === 0) {
              resolve(results);
            }
          })
          .catch(reject);
      }
    }

    runNext();
    // Edge case: empty task list
    if (tasks.length === 0) resolve(results);
  });
}

// --- manual test ---
async function main() {
  const start = Date.now();

  const tasks = Array.from({ length: 6 }, (_, i) => async () => {
    await new Promise((r) => setTimeout(r, 100));
    console.log(`Task ${i} done at ${Date.now() - start}ms`);
    return i * 10;
  });

  const results = await limitConcurrency(tasks, 2);
  console.log("Results:", results); // [0, 10, 20, 30, 40, 50]
}

main();
