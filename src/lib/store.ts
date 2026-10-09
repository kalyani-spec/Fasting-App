import AsyncStorage from '@react-native-async-storage/async-storage';
import { sameDay, startOfDay } from './time';
import type { DrinkType, Fast, GoalHours, WeightEntry } from './types';

// Every read/write of persisted state goes through this file.

const KEYS = {
  active: 'fast:active',
  history: 'fast:history',
  weights: 'weights',
  milestonesSeen: 'milestones:seen',
} as const;

type Listener = () => void;
const listeners = new Set<Listener>();

/** Subscribe to any store change (in this JS context). Returns unsubscribe. */
export function subscribe(fn: Listener): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

function emit() {
  listeners.forEach((fn) => fn());
}

async function readJSON<T>(key: string, fallback: T): Promise<T> {
  try {
    const raw = await AsyncStorage.getItem(key);
    return raw == null ? fallback : (JSON.parse(raw) as T);
  } catch {
    return fallback;
  }
}

async function writeJSON(key: string, value: unknown) {
  await AsyncStorage.setItem(key, JSON.stringify(value));
}

// Serialise writes so a notification action and an in-app tap can't race
// and drop a drink.
let queue: Promise<unknown> = Promise.resolve();
function serial<T>(fn: () => Promise<T>): Promise<T> {
  const next = queue.then(fn, fn);
  queue = next.catch(() => undefined);
  return next;
}

// ---- Active fast ----

export function getActive(): Promise<Fast | null> {
  return readJSON<Fast | null>(KEYS.active, null);
}

export function saveActive(fast: Fast): Promise<void> {
  return serial(async () => {
    await writeJSON(KEYS.active, fast);
    emit();
  });
}

export function startFast(startTime: number, goalHours: GoalHours): Promise<Fast> {
  return serial(async () => {
    const fast: Fast = {
      id: `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
      startTime,
      goalHours,
      drinks: [],
    };
    await writeJSON(KEYS.active, fast);
    await writeJSON(KEYS.milestonesSeen, []);
    emit();
    return fast;
  });
}

/** Ends the active fast, moves it to history, returns the ended fast. */
export function endActive(endTime = Date.now()): Promise<Fast | null> {
  return serial(async () => {
    const active = await getActive();
    if (!active) return null;
    const ended: Fast = { ...active, endTime };
    const history = await getHistory();
    await writeJSON(KEYS.history, [ended, ...history.filter((f) => f.id !== ended.id)]);
    await AsyncStorage.removeItem(KEYS.active);
    await writeJSON(KEYS.milestonesSeen, []);
    emit();
    return ended;
  });
}

export function addDrink(type: DrinkType, ts = Date.now()): Promise<Fast | null> {
  return serial(async () => {
    const active = await getActive();
    if (!active) return null;
    const next: Fast = { ...active, drinks: [...active.drinks, { ts, type }] };
    await writeJSON(KEYS.active, next);
    emit();
    return next;
  });
}

/** Removes the most recent drink of this type logged today. */
export function undoDrink(type: DrinkType): Promise<Fast | null> {
  return serial(async () => {
    const active = await getActive();
    if (!active) return null;
    const midnight = startOfDay(Date.now());
    let idx = -1;
    for (let i = active.drinks.length - 1; i >= 0; i--) {
      const d = active.drinks[i];
      if (d.type === type && d.ts >= midnight) {
        idx = i;
        break;
      }
    }
    if (idx === -1) return active;
    const next: Fast = { ...active, drinks: active.drinks.filter((_, i) => i !== idx) };
    await writeJSON(KEYS.active, next);
    emit();
    return next;
  });
}

// ---- History ----

export function getHistory(): Promise<Fast[]> {
  return readJSON<Fast[]>(KEYS.history, []);
}

export async function getFast(id: string): Promise<Fast | null> {
  const active = await getActive();
  if (active?.id === id) return active;
  return (await getHistory()).find((f) => f.id === id) ?? null;
}

// ---- Weights ----

export async function getWeights(): Promise<WeightEntry[]> {
  const list = await readJSON<WeightEntry[]>(KEYS.weights, []);
  return [...list].sort((a, b) => a.ts - b.ts);
}

/** One entry per calendar day — logging again the same day replaces it. */
export function addWeight(kg: number, ts = Date.now()): Promise<void> {
  return serial(async () => {
    const list = await getWeights();
    const next = [...list.filter((w) => !sameDay(w.ts, ts)), { ts, kg }].sort((a, b) => a.ts - b.ts);
    await writeJSON(KEYS.weights, next);
    emit();
  });
}

export function deleteWeight(ts: number): Promise<void> {
  return serial(async () => {
    const list = await getWeights();
    await writeJSON(
      KEYS.weights,
      list.filter((w) => w.ts !== ts),
    );
    emit();
  });
}

// ---- Milestones seen (in-app celebration) ----

export function getMilestonesSeen(): Promise<number[]> {
  return readJSON<number[]>(KEYS.milestonesSeen, []);
}

export function markMilestonesSeen(hours: number[]): Promise<void> {
  return serial(async () => {
    const seen = await getMilestonesSeen();
    await writeJSON(KEYS.milestonesSeen, Array.from(new Set([...seen, ...hours])));
  });
}

// ---- One-time flags (tips / prompts) ----

export async function getFlag(name: string): Promise<boolean> {
  return (await AsyncStorage.getItem(`flag:${name}`)) === '1';
}

export async function setFlag(name: string): Promise<void> {
  await AsyncStorage.setItem(`flag:${name}`, '1');
}
