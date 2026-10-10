import { describe, it, expect } from 'vitest';
import { DEFAULT_PREFS, Item, backupJSON, parseBackup, seasonOf, tasksCSV, tasksICS } from '../../lib/prep';

const t = (over: Partial<Item> = {}): Item => ({
  id: 'a', title: 'Study', description: '', label: 'study', day: 1, date: '2026-10-12',
  startHour: 9, endHour: 10.5, color: 'bg-violet-500', completed: false, ...over,
});

describe('backup', () => {
  it('round-trips tasks, focus rhythm and prefs', () => {
    const items = [t({ focus: { style: 'pomodoro', focusMin: 25, breakMin: 5 } }), t({ id: 'b', title: 'Lunch, with "Sam"', endHour: 24 })];
    const back = parseBackup(backupJSON(items, { ...DEFAULT_PREFS, bufferMin: 10 }));
    expect(back.tasks).toEqual(items);
    expect(back.prefs?.bufferMin).toBe(10);
  });

  it('accepts a bare array of tasks', () => {
    expect(parseBackup(JSON.stringify([t()])).tasks).toHaveLength(1);
  });

  it('skips invalid rows and rejects files with nothing usable', () => {
    const mixed = JSON.stringify({ tasks: [t(), { title: 'no date' }, t({ id: 'x', startHour: 10, endHour: 9 })] });
    expect(parseBackup(mixed).tasks.map((x) => x.id)).toEqual(['a']);
    expect(() => parseBackup('not json')).toThrow(/valid JSON/);
    expect(() => parseBackup('{"hello":1}')).toThrow(/No tasks/);
    expect(() => parseBackup('{"tasks":[{"title":"x"}]}')).toThrow(/No valid tasks/);
  });

  it('does not let an imported file inject arbitrary class names as colours', () => {
    const out = parseBackup(JSON.stringify([t({ color: 'bg-red-500 fixed inset-0' })]));
    expect(out.tasks[0].color).toBe('bg-slate-500');
  });
});

describe('CSV export', () => {
  it('quotes commas and quotes, and orders by date and time', () => {
    const csv = tasksCSV([t({ id: '2', date: '2026-10-13', title: 'B' }), t({ id: '1', title: 'Lunch, with "Sam"' })]).split('\r\n');
    expect(csv[0]).toBe('date,start,end,title,label,completed,notes');
    expect(csv[1]).toBe('2026-10-12,09:00,10:30,"Lunch, with ""Sam""",study,no,');
    expect(csv[2].startsWith('2026-10-13')).toBe(true);
  });
  it('writes midnight end as 24:00', () => {
    expect(tasksCSV([t({ endHour: 24 })]).split('\r\n')[1]).toContain(',24:00,');
  });
});

describe('ICS export', () => {
  it('produces a valid calendar with escaped text and local times', () => {
    const ics = tasksICS([t({ title: 'Read; notes, ch.1', description: 'line1\nline2' })]);
    const lines = ics.split('\r\n');
    expect(lines[0]).toBe('BEGIN:VCALENDAR');
    expect(lines.at(-1)).toBe('END:VCALENDAR');
    expect(ics).toContain('DTSTART:20261012T090000');
    expect(ics).toContain('DTEND:20261012T103000');
    expect(ics).toContain(String.raw`SUMMARY:Read\; notes\, ch.1`);
    expect(ics).toContain(String.raw`DESCRIPTION:line1\nline2`);
    expect(ics).toMatch(/DTSTAMP:\d{8}T\d{6}Z/);
  });
  it('ends a midnight task at 00:00 the next day', () => {
    expect(tasksICS([t({ endHour: 24 })])).toContain('DTEND:20261013T000000');
  });
});

describe('seasons', () => {
  it('maps months to seasons like the original app', () => {
    expect(seasonOf(new Date(2026, 9, 10)).name).toBe('Fall');
    expect(seasonOf(new Date(2026, 9, 10)).months.map((m) => m.getMonth())).toEqual([8, 9, 10]);
    expect(seasonOf(new Date(2026, 3, 1)).name).toBe('Spring');
    expect(seasonOf(new Date(2026, 6, 1)).name).toBe('Summer');
  });
  it('winter spans the year boundary', () => {
    const dec = seasonOf(new Date(2026, 11, 5));
    expect(dec.name).toBe('Winter');
    expect(dec.months.map((m) => `${m.getFullYear()}-${m.getMonth()}`)).toEqual(['2026-11', '2027-0', '2027-1']);
    const jan = seasonOf(new Date(2027, 0, 5));
    expect(jan.months.map((m) => `${m.getFullYear()}-${m.getMonth()}`)).toEqual(['2026-11', '2027-0', '2027-1']);
  });
});
