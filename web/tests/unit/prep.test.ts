import { describe, it, expect } from 'vitest';
import {
  Item,
  buildGenerationRequest,
  fmtDuration,
  fmtHour,
  fmtRange,
  hhmmToHour,
  hourToHhmm,
  itemsFromGeneration,
  layoutDay,
  mondayOf,
  normalizeHour24,
  weekTitle,
  DEFAULT_PREFS,
} from '../../lib/prep';

const item = (id: string, start: number, end: number, date = '2026-10-12'): Item => ({
  id, title: id, description: '', label: 'study', day: 1, date, startHour: start, endHour: end, color: 'bg-blue-500', completed: false,
});

describe('time formatting', () => {
  it('formats hours with minutes only when needed', () => {
    expect(fmtHour(9)).toBe('9 AM');
    expect(fmtHour(8.5)).toBe('8:30 AM');
    expect(fmtHour(0)).toBe('12 AM');
    expect(fmtHour(12)).toBe('12 PM');
    expect(fmtHour(23.25)).toBe('11:15 PM');
  });
  it('formats ranges, sharing the meridiem when it matches', () => {
    expect(fmtRange(8.5, 10)).toBe('8:30 – 10 AM');
    expect(fmtRange(11, 13)).toBe('11 AM – 1 PM');
    expect(fmtRange(22, 24)).toBe('10 PM – 12 AM');
  });
  it('formats durations', () => {
    expect(fmtDuration(9, 10.5)).toBe('1h 30m');
    expect(fmtDuration(9, 9.5)).toBe('30m');
    expect(fmtDuration(9, 11)).toBe('2h');
  });
  it('round-trips HH:MM', () => {
    expect(hhmmToHour('08:30')).toBe(8.5);
    expect(hourToHhmm(8.5)).toBe('08:30');
    expect(hourToHhmm(hhmmToHour('23:45'))).toBe('23:45');
  });
  it('repairs hours saved by the old double-PM bug', () => {
    expect(normalizeHour24(29)).toBe(17);
    expect(normalizeHour24(24)).toBe(24);
    expect(normalizeHour24(-3)).toBe(0);
    expect(normalizeHour24('x')).toBe(0);
  });
});

describe('calendar layout', () => {
  it('puts non-overlapping items in a single full-width lane', () => {
    const p = layoutDay([item('a', 9, 10), item('b', 10, 11)]);
    expect(p.every((x) => x.lane === 0 && x.lanes === 1)).toBe(true);
  });
  it('puts overlapping items side by side', () => {
    const p = layoutDay([item('a', 9, 11), item('b', 10, 12)]);
    const byId = Object.fromEntries(p.map((x) => [x.item.id, x]));
    expect(byId.a.lane).not.toBe(byId.b.lane);
    expect(byId.a.lanes).toBe(2);
    expect(byId.b.lanes).toBe(2);
  });
  it('reuses a lane once an earlier item has ended', () => {
    const p = layoutDay([item('a', 9, 10), item('b', 9, 12), item('c', 10, 11)]);
    const byId = Object.fromEntries(p.map((x) => [x.item.id, x]));
    expect(byId.c.lane).toBe(byId.a.lane); // c reuses a's lane
    expect(Math.max(...p.map((x) => x.lanes))).toBe(2);
  });
});

describe('week helpers', () => {
  it('finds Monday', () => {
    expect(mondayOf(new Date(2026, 9, 9)).getDate()).toBe(5); // Fri Oct 9 -> Mon Oct 5
    expect(mondayOf(new Date(2026, 9, 11)).getDate()).toBe(5); // Sun
  });
  it('titles weeks across month boundaries', () => {
    expect(weekTitle(new Date(2026, 9, 5))).toBe('Oct 5 – 11, 2026');
    expect(weekTitle(new Date(2026, 8, 28))).toBe('Sep 28 – Oct 4, 2026');
  });
});

describe('month generation mapping', () => {
  it('starts the plan on the Monday after the viewed week, at local midnight', () => {
    const req = buildGenerationRequest([item('a', 9, 10)], new Date(2026, 8, 14), DEFAULT_PREFS);
    expect(req.startDate).toMatch(/^2026-09-21T00:00:00[+-]\d{2}:\d{2}$/);
  });
  it('only sends tasks from the viewed week', () => {
    const items = [item('in', 9, 10, '2026-09-16'), item('out', 9, 10, '2026-09-25')];
    const req = buildGenerationRequest(items, new Date(2026, 8, 14), DEFAULT_PREFS);
    expect(req.week1Tasks.map((t) => t.id)).toEqual(['in']);
  });
  it('drops the "(W2)" tag the planner adds to titles and parses clock digits as-is', () => {
    const out = itemsFromGeneration({
      generatedTasks: [{ id: 't', title: 'Lunch (W2)', label: 'break', color: 'bg-green-400' }],
      scheduledBlocks: [{ taskId: 't', start: '2026-10-12T11:30:00-04:00', end: '2026-10-12T12:30:00-04:00' }],
    });
    expect(out).toHaveLength(1);
    expect(out[0].title).toBe('Lunch');
    expect(out[0].date).toBe('2026-10-12');
    expect(out[0].startHour).toBe(11.5);
    expect(out[0].endHour).toBe(12.5);
    expect(out[0].id.startsWith('ai_')).toBe(true);
  });
});
