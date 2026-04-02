/**
 * Solution: 07c-01 Reactive Signals
 */

type Subscriber = () => void;

// Global tracking stack for auto-dependency detection
const trackingStack: Set<Subscriber>[] = [];

function getCurrentTracker(): Set<Subscriber> | undefined {
  return trackingStack[trackingStack.length - 1];
}

export function createSignal<T>(initial: T): [() => T, (v: T) => void] {
  let value = initial;
  const subscribers = new Set<Subscriber>();

  const getter = (): T => {
    const tracker = getCurrentTracker();
    if (tracker) {
      for (const sub of tracker) subscribers.add(sub);
    }
    return value;
  };

  const setter = (v: T): void => {
    if (Object.is(value, v)) return;
    value = v;
    for (const sub of [...subscribers]) sub();
  };

  return [getter, setter];
}

export function createEffect(fn: () => void): void {
  const execute: Subscriber = () => {
    const deps = new Set<Subscriber>([execute]);
    trackingStack.push(deps);
    try {
      fn();
    } finally {
      trackingStack.pop();
    }
  };

  execute();
}

export function createMemo<T>(fn: () => T): () => T {
  let cached: T;
  let dirty = true;
  const subscribers = new Set<Subscriber>();

  const recompute = () => {
    dirty = true;
    // Propagate to downstream effects/memos
    for (const sub of [...subscribers]) sub();
  };

  const getter = (): T => {
    // Register downstream subscribers
    const tracker = getCurrentTracker();
    if (tracker) {
      for (const sub of tracker) subscribers.add(sub);
    }

    if (dirty) {
      const deps = new Set<Subscriber>([recompute]);
      trackingStack.push(deps);
      try {
        cached = fn();
      } finally {
        trackingStack.pop();
      }
      dirty = false;
    }
    return cached;
  };

  return getter;
}

// --- manual test ---
const [count, setCount] = createSignal(0);
const [name, setName] = createSignal("Alice");

const greeting = createMemo(() => `${name()} has ${count()} items`);

createEffect(() => {
  console.log("Effect:", greeting());
});

setCount(1);
setCount(2);
setName("Bob");
console.log("Memo direct read:", greeting());
