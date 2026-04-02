import { createSignal, createEffect } from "solid-js";

/**
 * Persists a signal value to localStorage.
 * Usage: const [theme, setTheme] = createLocalSignal("theme", "light");
 */
export function createLocalSignal<T>(key: string, initial: T) {
  const stored = localStorage.getItem(key);
  const [value, setValue] = createSignal<T>(
    stored ? (JSON.parse(stored) as T) : initial,
  );

  createEffect(() => {
    localStorage.setItem(key, JSON.stringify(value()));
  });

  return [value, setValue] as const;
}

/**
 * Debounces a signal — useful for search inputs.
 * Returns a derived signal that only updates after `delay` ms of silence.
 */
export function createDebouncedSignal<T>(source: () => T, delay: number) {
  const [debounced, setDebounced] = createSignal<T>(source());

  createEffect(() => {
    const value = source();
    const timer = setTimeout(() => setDebounced(() => value), delay);
    return () => clearTimeout(timer);
  });

  return debounced;
}
