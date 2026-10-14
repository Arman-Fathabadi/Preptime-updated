import { describe, expect, it } from 'vitest';
import { Item } from '../../lib/prep';
import { docSignature, mergeById, sameDoc } from '../../lib/sync';

const item = (id: string, over: Partial<Item> = {}): Item => ({
  id,
  title: id,
  description: '',
  label: '',
  day: 1,
  date: '2026-10-12',
  startHour: 9,
  endHour: 10,
  color: 'bg-blue-500',
  completed: false,
  ...over,
});

describe('mergeById', () => {
  it('keeps every task once and lets the preferred side win a clash', () => {
    const merged = mergeById([item('a', { title: 'mine' }), item('b')], [item('a', { title: 'theirs' }), item('c')]);
    expect(merged.map((t) => t.id)).toEqual(['a', 'b', 'c']);
    expect(merged[0].title).toBe('mine');
  });

  it('handles empty sides', () => {
    expect(mergeById([], [item('a')])).toHaveLength(1);
    expect(mergeById([item('a')], [])).toHaveLength(1);
  });
});

describe('docSignature / sameDoc', () => {
  it('ignores ordering and missing-vs-default prefs', () => {
    const a = { items: [item('a'), item('b')], prefs: { bufferMin: 5 } };
    const b = { items: [item('b'), item('a')], prefs: {} };
    expect(sameDoc(a, b)).toBe(true);
  });

  it('notices real edits', () => {
    const base = [item('a')];
    expect(docSignature(base, {})).not.toBe(docSignature([item('a', { completed: true })], {}));
    expect(docSignature(base, {})).not.toBe(docSignature([item('a', { startHour: 9.25 })], {}));
    expect(docSignature(base, {})).not.toBe(docSignature(base, { bufferMin: 15 }));
    expect(docSignature(base, {})).not.toBe(docSignature([], {}));
  });
});
