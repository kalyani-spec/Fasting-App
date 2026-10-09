import type { Drink } from './types';

export const HOUR = 3_600_000;
export const DAY = 24 * HOUR;

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const pad = (n: number) => String(n).padStart(2, '0');

/** Elapsed as HH:MM — hours can exceed 24 (e.g. 30:14). */
export function formatHHMM(ms: number): string {
  const totalMin = Math.max(0, Math.floor(ms / 60_000));
  return `${pad(Math.floor(totalMin / 60))}:${pad(totalMin % 60)}`;
}

/** "30h 14m", "45m", "5h" */
export function formatHM(ms: number): string {
  const totalMin = Math.max(0, Math.floor(ms / 60_000));
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

export function formatClock(ts: number): string {
  const d = new Date(ts);
  const h = d.getHours();
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${pad(d.getMinutes())} ${h < 12 ? 'AM' : 'PM'}`;
}

/** "Thu, 8:00 PM" */
export function formatDayTime(ts: number): string {
  return `${DAYS[new Date(ts).getDay()]}, ${formatClock(ts)}`;
}

/** "Thu 9 Oct" */
export function formatDate(ts: number): string {
  const d = new Date(ts);
  return `${DAYS[d.getDay()]} ${d.getDate()} ${MONTHS[d.getMonth()]}`;
}

export function startOfDay(ts: number): number {
  const d = new Date(ts);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

export function sameDay(a: number, b: number): boolean {
  return startOfDay(a) === startOfDay(b);
}

export function countToday(drinks: Drink[], now = Date.now()) {
  const midnight = startOfDay(now);
  let water = 0;
  let chaas = 0;
  for (const d of drinks) {
    if (d.ts < midnight) continue;
    if (d.type === 'water') water++;
    else chaas++;
  }
  return { water, chaas };
}

export function countAll(drinks: Drink[]) {
  return {
    water: drinks.filter((d) => d.type === 'water').length,
    chaas: drinks.filter((d) => d.type === 'chaas').length,
  };
}

export function totalDays(goalHours: number): number {
  return Math.max(1, Math.ceil(goalHours / 24));
}

export function dayNumber(elapsedMs: number): number {
  return Math.floor(elapsedMs / DAY) + 1;
}

/** Parses "72.4" / "72,4" kg; null if not a plausible body weight. */
export function parseKg(s: string): number | null {
  const n = parseFloat(s.replace(',', '.'));
  return Number.isFinite(n) && n >= 20 && n <= 400 ? Math.round(n * 10) / 10 : null;
}
