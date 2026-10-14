import { DEFAULT_PREFS, Item, Prefs } from './prep';

export type SyncDoc = { items: Item[]; prefs: Partial<Prefs> };

/** Union of two task lists by id. On a clash, `preferred` wins. */
export function mergeById(preferred: Item[], other: Item[]): Item[] {
  const seen = new Set(preferred.map((t) => t.id));
  return [...preferred, ...other.filter((t) => !seen.has(t.id))];
}

/** Stable signature of a plan, used to tell "nothing changed" from "needs saving". */
export function docSignature(items: Item[], prefs: Partial<Prefs>): string {
  const p = { ...DEFAULT_PREFS, ...prefs } as Record<string, unknown>;
  const sortedPrefs = Object.keys(p).sort().map((k) => [k, p[k]]);
  const sortedItems = items
    .map((t) => JSON.stringify([t.id, t.title, t.description, t.label, t.date, t.startHour, t.endHour, t.color, t.completed, t.focus ?? null]))
    .sort();
  return JSON.stringify([sortedItems, sortedPrefs]);
}

export function sameDoc(a: SyncDoc, b: SyncDoc): boolean {
  return docSignature(a.items, a.prefs) === docSignature(b.items, b.prefs);
}
