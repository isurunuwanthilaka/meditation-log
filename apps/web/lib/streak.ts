export type MinimalSession = { date: string; minutes: number };

export type GridCell = { key: string; date: Date; minutes: number };

function startOfToday(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

function shiftDays(base: Date, delta: number): Date {
  const d = new Date(base);
  d.setDate(d.getDate() + delta);
  return d;
}

function toDateKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function parseDateKey(key: string): Date {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function sumMinutesByDay(sessions: MinimalSession[]): Map<string, number> {
  const map = new Map<string, number>();
  for (const s of sessions) {
    map.set(s.date, (map.get(s.date) ?? 0) + s.minutes);
  }
  return map;
}

export function computeStreaks(sessions: MinimalSession[], goalMinutes: number) {
  const byDay = sumMinutesByDay(sessions);
  const qualifyingDays = new Set<string>();
  for (const [day, total] of byDay) {
    if (total >= goalMinutes) {
      qualifyingDays.add(day);
    }
  }

  const today = startOfToday();

  let current = 0;
  for (let d = 0; d < 400; d++) {
    const key = toDateKey(shiftDays(today, -d));
    if (qualifyingDays.has(key)) {
      current++;
    } else if (d > 0) {
      break;
    }
  }

  let longest = 0;
  let run = 0;
  for (let d = 365; d >= 0; d--) {
    const key = toDateKey(shiftDays(today, -d));
    if (qualifyingDays.has(key)) {
      run++;
      longest = Math.max(longest, run);
    } else {
      run = 0;
    }
  }

  return { current, longest };
}

export function computeGrid(sessions: MinimalSession[]): GridCell[] {
  const byDay = sumMinutesByDay(sessions);
  const today = startOfToday();
  const dow = today.getDay();
  const start = shiftDays(today, -(84 + dow));
  const count = 84 + dow + 1;

  const cells: GridCell[] = [];
  for (let i = 0; i < count; i++) {
    const date = shiftDays(start, i);
    const key = toDateKey(date);
    cells.push({ key, date, minutes: byDay.get(key) ?? 0 });
  }
  return cells;
}

export function relativeDayLabel(dateKey: string): string {
  const today = startOfToday();
  const target = parseDateKey(dateKey);
  const diffDays = Math.round((today.getTime() - target.getTime()) / 86_400_000);
  if (diffDays <= 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  return `${diffDays} days ago`;
}

export function isWithinDays(dateKey: string, days: number): boolean {
  const today = startOfToday();
  const target = parseDateKey(dateKey);
  const diffDays = Math.round((today.getTime() - target.getTime()) / 86_400_000);
  return diffDays >= 0 && diffDays < days;
}

export function median(values: number[]): number {
  if (values.length === 0) {
    return 0;
  }
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.floor(sorted.length / 2)];
}
