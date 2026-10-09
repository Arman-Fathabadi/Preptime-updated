/**
 * PrepTime domain layer for the UI: types, dates, colours, calendar layout,
 * localStorage persistence and the month-generation request/response mapping.
 *
 * Storage format is unchanged from the original app ("preptime-tasks" holds Task[]),
 * so anything saved before the redesign keeps working.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { DEMO_WEEK } from './demoWeek';
import { toLocalISO } from '../utils/dates';

/* ------------------------------------------------------------------ */
/* Types                                                              */
/* ------------------------------------------------------------------ */

export type Item = {
  id: string;
  title: string;
  description: string;
  label: string;
  day: number; // JS getDay(): 0 = Sunday
  date: string; // YYYY-MM-DD (local)
  startHour: number; // decimal hours, 8.5 = 8:30
  endHour: number;
  color: string; // tailwind-style class, e.g. "bg-cyan-500"
  completed: boolean;
};

export type Prefs = {
  dayStartHour: number;
  dayEndHour: number;
  slotStepMin: number;
  bufferMin: number;
  maxHeavyPerDay: number;
};

export const DEFAULT_PREFS: Prefs = {
  dayStartHour: 7,
  dayEndHour: 23,
  slotStepMin: 15,
  bufferMin: 5,
  maxHeavyPerDay: 3,
};

export type ViewKind = 'day' | 'week' | 'month';

/* ------------------------------------------------------------------ */
/* Dates                                                              */
/* ------------------------------------------------------------------ */

const pad = (n: number) => String(n).padStart(2, '0');

export const toISODate = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

export const fromISODate = (s: string) => {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, (m || 1) - 1, d || 1);
};

export const startOfDay = (d: Date) => {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
};

export const addDays = (d: Date, n: number) => {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
};

export const addMonths = (d: Date, n: number) => {
  const x = new Date(d.getFullYear(), d.getMonth() + n, 1);
  const last = new Date(x.getFullYear(), x.getMonth() + 1, 0).getDate();
  x.setDate(Math.min(d.getDate(), last));
  return x;
};

export const mondayOf = (d: Date) => {
  const x = startOfDay(d);
  const day = x.getDay();
  x.setDate(x.getDate() + (day === 0 ? -6 : 1) - day);
  return x;
};

export const sameDay = (a: Date, b: Date) => toISODate(a) === toISODate(b);

export const isToday = (d: Date) => sameDay(d, new Date());

export const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
export const WEEKDAYS_SHORT = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

/** "Oct 5 – 11, 2026" / "Sep 28 – Oct 4, 2026" */
export function weekTitle(monday: Date) {
  const end = addDays(monday, 6);
  const mS = MONTHS[monday.getMonth()].slice(0, 3);
  const mE = MONTHS[end.getMonth()].slice(0, 3);
  if (monday.getMonth() === end.getMonth()) return `${mS} ${monday.getDate()} – ${end.getDate()}, ${end.getFullYear()}`;
  if (monday.getFullYear() === end.getFullYear()) return `${mS} ${monday.getDate()} – ${mE} ${end.getDate()}, ${end.getFullYear()}`;
  return `${mS} ${monday.getDate()}, ${monday.getFullYear()} – ${mE} ${end.getDate()}, ${end.getFullYear()}`;
}

/* ------------------------------------------------------------------ */
/* Time formatting                                                    */
/* ------------------------------------------------------------------ */

/** Decimal hours -> { h12, min, mer } rounded to the nearest minute. */
function parts(h: number) {
  const total = Math.round(h * 60);
  const hour = Math.floor(total / 60) % 24;
  const min = total % 60;
  return { h12: hour % 12 === 0 ? 12 : hour % 12, min, mer: hour >= 12 ? 'PM' : 'AM' };
}

/** 8.5 -> "8:30 AM", 9 -> "9 AM" */
export function fmtHour(h: number) {
  const { h12, min, mer } = parts(h);
  return min === 0 ? `${h12} ${mer}` : `${h12}:${pad(min)} ${mer}`;
}

/** 8.5, 10 -> "8:30 – 10 AM"; 11, 13 -> "11 AM – 1 PM" */
export function fmtRange(a: number, b: number) {
  const A = parts(a);
  const B = parts(b >= 24 ? 24 : b);
  const t = (p: ReturnType<typeof parts>) => (p.min === 0 ? `${p.h12}` : `${p.h12}:${pad(p.min)}`);
  if (A.mer === B.mer) return `${t(A)} – ${t(B)} ${B.mer}`;
  return `${t(A)} ${A.mer} – ${t(B)} ${B.mer}`;
}

export function fmtDuration(a: number, b: number) {
  const m = Math.round((b - a) * 60);
  const h = Math.floor(m / 60);
  const r = m % 60;
  if (h && r) return `${h}h ${r}m`;
  return h ? `${h}h` : `${r}m`;
}

/** "HH:MM" <-> decimal hours */
export const hhmmToHour = (s: string) => {
  const [h, m] = s.split(':').map(Number);
  return (h || 0) + (m || 0) / 60;
};
export const hourToHhmm = (h: number) => {
  const total = Math.round(h * 60);
  return `${pad(Math.floor(total / 60) % 24)}:${pad(total % 60)}`;
};

/** Repairs hours saved by older versions ("17 PM" style double-PM bugs). */
export function normalizeHour24(hour: unknown): number {
  let h = Number(hour);
  if (!Number.isFinite(h)) return 0;
  if (h === 24) return 24;
  while (h > 24) h -= 12;
  return h < 0 ? 0 : h;
}

/* ------------------------------------------------------------------ */
/* Colours                                                            */
/* ------------------------------------------------------------------ */

const HUES: Record<string, string> = {
  cyan: '#06b6d4',
  blue: '#3b82f6',
  indigo: '#6366f1',
  violet: '#8b5cf6',
  purple: '#a855f7',
  fuchsia: '#d946ef',
  pink: '#ec4899',
  rose: '#f43f5e',
  red: '#ef4444',
  orange: '#f97316',
  amber: '#f59e0b',
  yellow: '#eab308',
  lime: '#84cc16',
  green: '#22c55e',
  emerald: '#10b981',
  teal: '#14b8a6',
  sky: '#0ea5e9',
  slate: '#64748b',
  gray: '#6b7280',
  zinc: '#71717a',
  stone: '#78716c',
  neutral: '#737373',
};

/** The picker offers a calm, distinct subset. Values stay tailwind-style for compatibility. */
export const PALETTE: { name: string; value: string }[] = [
  { name: 'Blue', value: 'bg-blue-500' },
  { name: 'Indigo', value: 'bg-indigo-500' },
  { name: 'Violet', value: 'bg-violet-500' },
  { name: 'Pink', value: 'bg-pink-500' },
  { name: 'Red', value: 'bg-red-500' },
  { name: 'Orange', value: 'bg-orange-500' },
  { name: 'Amber', value: 'bg-amber-500' },
  { name: 'Green', value: 'bg-green-500' },
  { name: 'Teal', value: 'bg-teal-500' },
  { name: 'Cyan', value: 'bg-cyan-500' },
  { name: 'Slate', value: 'bg-slate-500' },
];

/** "bg-cyan-500" -> "#06b6d4" (shade is ignored; the UI tints it itself). */
export function hueOf(cls: string): string {
  const m = /bg-([a-z]+)/.exec(cls || '');
  return (m && HUES[m[1]]) || HUES.slate;
}

/** Consistent colour for a task name when the API doesn't supply one. */
export function colorForName(name: string): string {
  const keys = PALETTE.map((p) => p.value);
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return keys[Math.abs(hash) % keys.length];
}

/* ------------------------------------------------------------------ */
/* Calendar layout: side-by-side columns for overlapping items         */
/* ------------------------------------------------------------------ */

export type Placed = { item: Item; lane: number; lanes: number };

export function layoutDay(items: Item[]): Placed[] {
  const sorted = [...items].sort((a, b) => a.startHour - b.startHour || b.endHour - a.endHour);
  const out: Placed[] = [];
  let cluster: Placed[] = [];
  let clusterEnd = -1;

  const flush = () => {
    const lanes = cluster.reduce((m, p) => Math.max(m, p.lane + 1), 1);
    cluster.forEach((p) => (p.lanes = lanes));
    out.push(...cluster);
    cluster = [];
    clusterEnd = -1;
  };

  for (const item of sorted) {
    if (cluster.length && item.startHour >= clusterEnd) flush();
    const used = new Set(cluster.filter((p) => p.item.endHour > item.startHour).map((p) => p.lane));
    let lane = 0;
    while (used.has(lane)) lane++;
    cluster.push({ item, lane, lanes: 1 });
    clusterEnd = Math.max(clusterEnd, item.endHour);
  }
  flush();
  return out;
}

/* ------------------------------------------------------------------ */
/* Store (localStorage)                                               */
/* ------------------------------------------------------------------ */

const TASKS_KEY = 'preptime-tasks';
const PREFS_KEY = 'preptime-preferences';
const USER_KEY = 'preptime-username';

export const uid = (prefix = 'task') => `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

function readItems(): Item[] {
  try {
    const raw = localStorage.getItem(TASKS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((t) => t && t.id && t.date)
      .map((t) => ({
        id: String(t.id),
        title: String(t.title ?? 'Untitled'),
        description: t.description || '',
        label: t.label || '',
        day: typeof t.day === 'number' ? t.day : fromISODate(t.date).getDay(),
        date: String(t.date),
        startHour: normalizeHour24(t.startHour),
        endHour: normalizeHour24(t.endHour),
        color: t.color || 'bg-slate-500',
        completed: !!t.completed,
      }));
  } catch {
    return [];
  }
}

function readPrefs(): Prefs {
  try {
    const raw = localStorage.getItem(PREFS_KEY);
    if (raw) return { ...DEFAULT_PREFS, ...JSON.parse(raw) };
  } catch {
    /* fall through */
  }
  return DEFAULT_PREFS;
}

export function usePrepStore() {
  const [items, setItems] = useState<Item[]>([]);
  const [prefs, setPrefs] = useState<Prefs>(DEFAULT_PREFS);
  const [username, setUsername] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);
  const skipNext = useRef(true);

  useEffect(() => {
    setItems(readItems());
    setPrefs(readPrefs());
    setUsername(localStorage.getItem(USER_KEY));
    setLoaded(true);

    // Keep several tabs in sync.
    const onStorage = (e: StorageEvent) => {
      if (e.key === TASKS_KEY) {
        skipNext.current = true;
        setItems(readItems());
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    if (skipNext.current) {
      skipNext.current = false;
      return;
    }
    localStorage.setItem(TASKS_KEY, JSON.stringify(items));
  }, [items, loaded]);

  const add = useCallback((it: Omit<Item, 'id' | 'day' | 'completed'> & Partial<Pick<Item, 'id' | 'completed'>>) => {
    const item: Item = {
      ...it,
      id: it.id ?? uid(),
      day: fromISODate(it.date).getDay(),
      completed: it.completed ?? false,
    };
    setItems((prev) => [...prev, item]);
    return item;
  }, []);

  const update = useCallback((id: string, patch: Partial<Item>) => {
    setItems((prev) =>
      prev.map((t) => {
        if (t.id !== id) return t;
        const next = { ...t, ...patch };
        if (patch.date) next.day = fromISODate(patch.date).getDay();
        return next;
      })
    );
  }, []);

  const remove = useCallback((id: string) => setItems((prev) => prev.filter((t) => t.id !== id)), []);
  const toggle = useCallback((id: string) => setItems((prev) => prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))), []);
  const replaceAll = useCallback((next: Item[]) => setItems(next), []);

  const addSampleWeek = useCallback((monday: Date) => {
    const made: Item[] = DEMO_WEEK.map((d, i) => {
      const date = toISODate(addDays(monday, d.day));
      return {
        id: `demo_${Date.now()}_${i}`,
        title: d.name,
        description: '',
        label: d.label,
        day: fromISODate(date).getDay(),
        date,
        startHour: hhmmToHour(d.start),
        endHour: hhmmToHour(d.end),
        color: d.color,
        completed: false,
      };
    });
    setItems((prev) => [...prev, ...made]);
    return made;
  }, []);

  const byDate = useMemo(() => {
    const m = new Map<string, Item[]>();
    for (const it of items) {
      const arr = m.get(it.date);
      if (arr) arr.push(it);
      else m.set(it.date, [it]);
    }
    m.forEach((arr) => arr.sort((a, b) => a.startHour - b.startHour));
    return m;
  }, [items]);

  return { items, byDate, prefs, username, loaded, add, update, remove, toggle, replaceAll, addSampleWeek, setPrefs };
}

/* ------------------------------------------------------------------ */
/* Month generation: request building and result mapping               */
/* ------------------------------------------------------------------ */

type ApiTaskType = 'study' | 'deep' | 'admin' | 'relax';

function apiTypeOf(label: string): ApiTaskType {
  const l = label.toLowerCase();
  if (l === 'study' || l === 'deep' || l === 'admin' || l === 'relax') return l;
  if (l === 'work' || l === 'hobby') return 'study';
  return 'relax';
}

export function buildGenerationRequest(items: Item[], viewedMonday: Date, prefs: Prefs) {
  const weekEnd = addDays(viewedMonday, 7);
  const week = items.filter((t) => {
    const d = fromISODate(t.date);
    return d >= viewedMonday && d < weekEnd;
  });

  const week1Blocks = week.map((t) => ({
    id: t.id,
    taskId: t.id,
    start: toLocalISO(new Date(`${t.date}T${hourToHhmm(t.startHour)}:00`)),
    end: toLocalISO(new Date(`${t.date}T${hourToHhmm(Math.min(t.endHour, 23.99))}:00`)),
  }));

  const week1Tasks = week.map((t) => {
    const type = apiTypeOf(t.label);
    const heavy = type === 'deep' || type === 'study';
    return {
      id: t.id,
      title: t.title,
      durationMin: Math.max(15, Math.round((t.endHour - t.startHour) * 60)),
      type,
      energy: heavy ? 'high' : 'med',
      splittable: false,
      priority: 3,
      mode: type === 'deep' ? 'lockin' : type === 'study' ? 'study' : 'balanced',
      label: t.label || t.title,
      color: t.color,
    };
  });

  return {
    week1Blocks,
    week1Tasks,
    existingEvents: [],
    preferences: {
      dayStartHour: prefs.dayStartHour,
      dayEndHour: prefs.dayEndHour,
      slotStepMin: prefs.slotStepMin,
      bufferMin: prefs.bufferMin,
      maxHeavyPerDay: prefs.maxHeavyPerDay,
    },
    // The Monday after the week being viewed, at local midnight, with the UTC offset.
    startDate: toLocalISO(addDays(viewedMonday, 7)),
  };
}

type GenResult = {
  generatedTasks: { id: string; title: string; label?: string; type?: string; color?: string }[];
  scheduledBlocks: { taskId: string; start: string; end: string }[];
};

export function itemsFromGeneration(result: GenResult): Item[] {
  const re = /^(\d{4}-\d{2}-\d{2})T(\d{2}):(\d{2})/;
  const out: Item[] = [];
  result.scheduledBlocks.forEach((sb, i) => {
    const s = re.exec(sb.start);
    const e = re.exec(sb.end);
    if (!s || !e) return;
    const task = result.generatedTasks.find((t) => t.id === sb.taskId);
    const date = s[1];
    out.push({
      id: `ai_${Date.now()}_${i}_${Math.random().toString(36).slice(2, 7)}`,
      // The planner tags titles with the week they were generated for, e.g. "Lunch (W2)". Drop that.
      title: (task?.title || 'Planned task').replace(/\s*\(W\d+\)\s*$/, ''),
      description: '',
      label: task?.label || task?.type || '',
      day: fromISODate(date).getDay(),
      date,
      startHour: Number(s[2]) + Number(s[3]) / 60,
      endHour: Number(e[2]) + Number(e[3]) / 60,
      color: task?.color || colorForName(task?.title || 'Planned task'),
      completed: false,
    });
  });
  return out;
}

export const isPlanned = (it: Item) => it.id.startsWith('ai_');
