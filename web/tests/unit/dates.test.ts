import { describe, it, expect } from 'vitest';
import { mondayOf, nextMondayAfter, toLocalISO } from '../../utils/dates';

describe('month generator dates', () => {
  it('mondayOf returns Monday 00:00 of the same week', () => {
    // Fri Oct 9 2026 (local) -> Mon Oct 5
    const m = mondayOf(new Date(2026, 9, 9, 15, 30));
    expect([m.getFullYear(), m.getMonth(), m.getDate(), m.getDay(), m.getHours(), m.getMinutes()]).toEqual([2026, 9, 5, 1, 0, 0]);
  });

  it('a Sunday belongs to the week that started the previous Monday', () => {
    const m = mondayOf(new Date(2026, 9, 11, 23, 59)); // Sun Oct 11
    expect(m.getDate()).toBe(5);
  });

  it('nextMondayAfter is the Monday after the viewed week, at midnight', () => {
    // Viewing Sep 17 (week of Sep 14) -> Week 2 must start Mon Sep 21, not "today + 7"
    const n = nextMondayAfter(new Date(2026, 8, 17, 12, 0));
    expect([n.getMonth(), n.getDate(), n.getDay(), n.getHours()]).toEqual([8, 21, 1, 0]);
  });

  it('toLocalISO keeps the local clock digits and an explicit offset', () => {
    const d = new Date(2026, 9, 19, 0, 0, 0);
    const iso = toLocalISO(d);
    expect(iso).toMatch(/^2026-10-19T00:00:00[+-]\d{2}:\d{2}$/);
    // Round-trips to the same instant
    expect(new Date(iso).getTime()).toBe(d.getTime());
  });
});
