import { Item, addDays, mondayOf, toISODate } from './prep';

/** What /api/calendar/events returns: a trimmed-down Google Calendar event (times are ISO strings). */
export type GCalEvent = { id: string; title: string; start: string; end: string; allDay: boolean };

export const GCAL_SCOPE = 'https://www.googleapis.com/auth/calendar.readonly';
export const GCAL_PREFIX = 'gcal_';
export const GCAL_LABEL = 'Google Calendar';

export const isImported = (it: Pick<Item, 'id'>) => it.id.startsWith(GCAL_PREFIX);

const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
const hoursOf = (d: Date, day: Date) => Math.round(((d.getTime() - day.getTime()) / 36e5) * 4) / 4; // quarter hours

/**
 * Turns Google events into plan items, in the viewer's own time zone.
 * All-day events are skipped (they have no time to block). An event that crosses midnight
 * becomes one item per day, so it shows on every day it covers.
 */
export function eventsToItems(events: GCalEvent[]): Item[] {
  const out: Item[] = [];
  for (const ev of events) {
    if (ev.allDay) continue;
    const start = new Date(ev.start);
    const end = new Date(ev.end);
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || !(end > start)) continue;

    for (let day = startOfDay(start); day < end; day = addDays(day, 1)) {
      const next = addDays(day, 1);
      const segStart = start > day ? start : day;
      const segEnd = end < next ? end : next;
      const startHour = hoursOf(segStart, day);
      const endHour = segEnd.getTime() === next.getTime() ? 24 : hoursOf(segEnd, day);
      if (!(endHour > startHour)) continue; // under a quarter hour: nothing worth blocking
      const date = toISODate(day);
      out.push({
        id: `${GCAL_PREFIX}${ev.id}_${date}`,
        title: (ev.title || '(No title)').slice(0, 200),
        description: '',
        label: GCAL_LABEL,
        day: day.getDay(),
        date,
        startHour,
        endHour,
        color: 'bg-slate-500',
        completed: false,
      });
    }
  }
  return out;
}

/** Replaces the imported items inside [from, to] (inclusive ISO dates) with a fresh import; everything else is untouched. */
export function mergeImported(items: Item[], fresh: Item[], from: string, to: string): Item[] {
  const keep = items.filter((t) => !(isImported(t) && t.date >= from && t.date <= to));
  return [...keep, ...fresh.filter((t) => t.date >= from && t.date <= to)];
}

/** The window imported on each sync: last week through the next eight. */
export function importWindow(today: Date) {
  const monday = mondayOf(today);
  return { from: toISODate(addDays(monday, -7)), to: toISODate(addDays(monday, 8 * 7 - 1)) };
}

