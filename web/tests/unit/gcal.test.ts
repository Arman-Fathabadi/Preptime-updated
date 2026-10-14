import { describe, expect, it } from 'vitest';
import { GCalEvent, eventsToItems, importWindow, isImported, mergeImported } from '../../lib/gcal';
import { Item, buildGenerationRequest, parseBackup } from '../../lib/prep';

const local = (y: number, m: number, d: number, h = 0, min = 0) => new Date(y, m - 1, d, h, min).toISOString();
const ev = (over: Partial<GCalEvent> = {}): GCalEvent => ({ id: 'e1', title: 'Lecture', start: local(2026, 10, 12, 9), end: local(2026, 10, 12, 10, 30), allDay: false, ...over });
const item = (id: string, over: Partial<Item> = {}): Item => ({ id, title: id, description: '', label: '', day: 1, date: '2026-10-12', startHour: 9, endHour: 10, color: 'bg-blue-500', completed: false, ...over });

describe('eventsToItems', () => {
  it('maps a timed event into local quarter-hour hours', () => {
    const [it] = eventsToItems([ev()]);
    expect(it).toMatchObject({ id: 'gcal_e1_2026-10-12', title: 'Lecture', date: '2026-10-12', startHour: 9, endHour: 10.5, label: 'Google Calendar', completed: false });
    expect(it.day).toBe(1);
    expect(isImported(it)).toBe(true);
  });

  it('skips all-day, invalid and zero-length events', () => {
    expect(eventsToItems([ev({ allDay: true }), ev({ start: 'nope' }), ev({ end: local(2026, 10, 12, 9) })])).toEqual([]);
  });

  it('splits an event that crosses midnight into one item per day', () => {
    const items = eventsToItems([ev({ start: local(2026, 10, 12, 22), end: local(2026, 10, 13, 2) })]);
    expect(items.map((t) => [t.date, t.startHour, t.endHour])).toEqual([
      ['2026-10-12', 22, 24],
      ['2026-10-13', 0, 2],
    ]);
  });

  it('survives the server-side validation used by cloud sync', () => {
    const items = eventsToItems([ev({ start: local(2026, 10, 12, 22), end: local(2026, 10, 13, 2) }), ev({ id: 'e2' })]);
    const clean = parseBackup(JSON.stringify({ tasks: items }));
    expect(clean.tasks).toHaveLength(items.length);
    expect(clean.tasks.every((t) => t.endHour > t.startHour)).toBe(true);
  });

  it('gives untitled events a name', () => {
    expect(eventsToItems([ev({ title: '' })])[0].title).toBe('(No title)');
  });
});

describe('mergeImported', () => {
  it('replaces imported items inside the window and keeps everything else', () => {
    const items = [item('mine'), item('gcal_old_2026-10-12', { date: '2026-10-12' }), item('gcal_far_2027-01-01', { date: '2027-01-01' })];
    const fresh = eventsToItems([ev()]);
    const merged = mergeImported(items, fresh, '2026-10-01', '2026-12-01');
    expect(merged.map((t) => t.id).sort()).toEqual(['gcal_e1_2026-10-12', 'gcal_far_2027-01-01', 'mine']);
  });

  it('drops events Google no longer returns', () => {
    const merged = mergeImported([item('gcal_gone_2026-10-12')], [], '2026-10-01', '2026-12-01');
    expect(merged).toEqual([]);
  });
});

describe('importWindow', () => {
  it('runs from last Monday through the end of the eighth week ahead', () => {
    expect(importWindow(new Date(2026, 9, 14))).toEqual({ from: '2026-10-05', to: '2026-12-06' });
  });
});

describe('planner and imported events', () => {
  const prefs = { dayStartHour: 7, dayEndHour: 23, slotStepMin: 15, bufferMin: 5, maxHeavyPerDay: 3, weatherUnit: 'celsius' as const };

  it('never learns from imported events, and passes later ones as fixed events', () => {
    const monday = new Date(2026, 9, 12);
    const items = [
      item('a'),
      item('gcal_cal_2026-10-13', { date: '2026-10-13' }), // in the viewed week: not a template
      item('gcal_next_2026-10-20', { date: '2026-10-20', startHour: 14, endHour: 15 }), // in a planned week: fixed
      item('gcal_late_2026-12-01', { date: '2026-12-01' }), // outside the three planned weeks
    ];
    const req = buildGenerationRequest(items, monday, prefs);
    expect(req.week1Tasks.map((t) => t.id)).toEqual(['a']);
    expect(req.existingEvents).toHaveLength(1);
    expect(req.existingEvents[0]).toMatchObject({ id: 'gcal_next_2026-10-20', kind: 'fixed' });
    expect(req.existingEvents[0].start.slice(0, 16)).toBe('2026-10-20T14:00');
  });
});
