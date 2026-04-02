/**
 * Exercise 02-03: Type-Safe Event Emitter
 *
 * Implement a generic EventEmitter class where:
 *   - `on(event, handler)` registers a listener
 *   - `emit(event, payload)` fires all listeners for that event
 *   - The type of `payload` in `emit` and `handler` is inferred from `Events`
 *
 * The type parameter `Events` is a Record mapping event names to payload types.
 */

// TODO: implement EventEmitter
export class EventEmitter<Events extends Record<string, any>> {
  // TODO: implement on() and emit()
  on<K extends keyof Events>(event: K, handler: (payload: Events[K]) => void): void {
    throw new Error("Not implemented");
  }

  emit<K extends keyof Events>(event: K, payload: Events[K]): void {
    throw new Error("Not implemented");
  }
}

// --- usage test ---
type AppEvents = {
  login:  { userId: string; timestamp: number };
  logout: { userId: string };
  error:  { message: string; code: number };
};

const emitter = new EventEmitter<AppEvents>();

emitter.on("login", ({ userId, timestamp }) => {
  console.log(`User ${userId} logged in at ${timestamp}`);
});

emitter.on("error", ({ message, code }) => {
  console.error(`Error ${code}: ${message}`);
});

emitter.emit("login", { userId: "u-1", timestamp: Date.now() });
emitter.emit("error", { message: "Not found", code: 404 });

// The following should be a TypeScript compile error:
// emitter.emit("login", { userId: "u-1" }); // missing `timestamp`
// emitter.emit("unknown", {});              // unknown event
