/**
 * Solution: 01-01 Debounce
 */

export function debounce<T extends (...args: any[]) => void>(
  fn: T,
  delay: number,
): (...args: Parameters<T>) => void {
  let timer: ReturnType<typeof setTimeout> | undefined;

  return (...args: Parameters<T>) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

// --- manual test ---
const log = debounce((msg: string) => console.log("called:", msg), 100);
log("a");
log("b");
log("c"); // Only "called: c" appears after 100ms
