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
  focusState,
  fmtCountdown,
  focusFor,
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

describe('focus timer', () => {
  // Task on 2026-10-12 from 09:00 to 11:00
  const base = { date: '2026-10-12', startHour: 9, endHour: 11 };
  const at = (h: number, m = 0, sec = 0) => new Date(2026, 9, 12, h, m, sec);

  it('counts down to the start before the task begins', () => {
    const s = focusState(base, at(8, 30));
    expect(s).toEqual({ kind: 'before', startsInSec: 1800 });
  });

  it('is finished at and after the end', () => {
    expect(focusState(base, at(11)).kind).toBe('after');
    expect(focusState(base, at(13)).kind).toBe('after');
  });

  it('without a rhythm it is one countdown to the end of the task', () => {
    const s = focusState(base, at(10, 15));
    expect(s).toMatchObject({ kind: 'running', phase: 'focus', cycles: false, phaseRemainingSec: 2700, blockRemainingSec: 2700, blockTotalSec: 7200 });
  });

  it('Pomodoro 25/5: focus, then break, then the next cycle', () => {
    const f = { ...base, focus: focusFor('pomodoro') };
    expect(focusState(f, at(9, 10))).toMatchObject({ phase: 'focus', phaseRemainingSec: 15 * 60, cycle: 1, cycles: true });
    expect(focusState(f, at(9, 26))).toMatchObject({ phase: 'break', phaseRemainingSec: 4 * 60, cycle: 1 });
    expect(focusState(f, at(9, 31))).toMatchObject({ phase: 'focus', phaseRemainingSec: 24 * 60, cycle: 2 }); // 1 min into cycle 2
  });

  it('switches phase exactly on the boundary', () => {
    const f = { ...base, focus: focusFor('pomodoro') };
    expect(focusState(f, at(9, 25, 0))).toMatchObject({ phase: 'break', phaseRemainingSec: 300 });
    expect(focusState(f, at(9, 24, 59))).toMatchObject({ phase: 'focus', phaseRemainingSec: 1 });
  });

  it('Deep Focus uses 52/17', () => {
    const f = { ...base, focus: focusFor('deep') };
    expect(focusState(f, at(9, 53))).toMatchObject({ phase: 'break', phaseTotalSec: 17 * 60 });
  });

  it('never promises more time than the task has left', () => {
    // 09:00-09:26 with 25/5: at 09:25:30 the break would be 4.5 min but only 30 s remain
    const f = { date: '2026-10-12', startHour: 9, endHour: 9 + 26 / 60, focus: focusFor('pomodoro') };
    const s = focusState(f, at(9, 25, 30));
    expect(s).toMatchObject({ phase: 'break' });
    if (s.kind === 'running') expect(s.phaseRemainingSec).toBeLessThanOrEqual(s.blockRemainingSec);
  });

  it('custom rhythm keeps its own minutes', () => {
    const f = { ...base, focus: { style: 'custom' as const, focusMin: 10, breakMin: 2 } };
    expect(focusState(f, at(9, 11))).toMatchObject({ phase: 'break', phaseRemainingSec: 60 });
  });

  it('formats countdowns', () => {
    expect(fmtCountdown(1500)).toBe('25:00');
    expect(fmtCountdown(59)).toBe('00:59');
    expect(fmtCountdown(3725)).toBe('1:02:05');
    expect(fmtCountdown(90000)).toBe('1d 1h');
    expect(fmtCountdown(-5)).toBe('00:00');
  });
});
