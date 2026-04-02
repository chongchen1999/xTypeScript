/**
 * Solution: 02-03 Type-Safe Event Emitter
 */

export class EventEmitter<Events extends Record<string, any>> {
  // Map from event name to list of handlers
  private listeners = new Map<keyof Events, Array<(payload: any) => void>>();

  on<K extends keyof Events>(event: K, handler: (payload: Events[K]) => void): void {
    const existing = this.listeners.get(event) ?? [];
    this.listeners.set(event, [...existing, handler]);
  }

  emit<K extends keyof Events>(event: K, payload: Events[K]): void {
    this.listeners.get(event)?.forEach((h) => h(payload));
  }

  // Bonus: remove a specific listener
  off<K extends keyof Events>(event: K, handler: (payload: Events[K]) => void): void {
    const existing = this.listeners.get(event) ?? [];
    this.listeners.set(event, existing.filter((h) => h !== handler));
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
