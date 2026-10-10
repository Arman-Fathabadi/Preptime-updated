// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup, act } from '@testing-library/react';
import React from 'react';
import { EventCard } from '../../ui/EventCard';
import { TaskDialog, Draft } from '../../ui/TaskDialog';
import { FocusPanel } from '../../ui/FocusPanel';
import { MonthView } from '../../ui/MonthView';
import { YearView } from '../../ui/YearView';
import { Item } from '../../lib/prep';

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

const item = (over: Partial<Item> = {}): Item => ({
  id: 'a', title: 'Write essay', description: '', label: 'study', day: 1, date: '2026-10-12',
  startHour: 9, endHour: 10.5, color: 'bg-violet-500', completed: false, ...over,
});

describe('EventCard', () => {
  it('shows the title and time, and is an accessible group with an edit hint', () => {
    render(<EventCard item={item()} style={{}} compact={false} onOpen={() => {}} onToggle={() => {}} />);
    const card = screen.getByRole('group');
    expect(card.getAttribute('aria-label')).toBe('Write essay, 9 – 10:30 AM. Press Enter to edit.');
    expect(screen.getByText('Write essay')).toBeTruthy();
  });

  it('marks done without opening the editor', () => {
    const onOpen = vi.fn();
    const onToggle = vi.fn();
    render(<EventCard item={item()} style={{}} compact={false} onOpen={onOpen} onToggle={onToggle} />);
    fireEvent.click(screen.getByRole('button', { name: 'Mark as done' }));
    expect(onToggle).toHaveBeenCalledTimes(1);
    expect(onOpen).not.toHaveBeenCalled();
  });

  it('opens with Enter from the keyboard', () => {
    const onOpen = vi.fn();
    render(<EventCard item={item()} style={{}} compact={false} onOpen={onOpen} onToggle={() => {}} />);
    fireEvent.keyDown(screen.getByRole('group'), { key: 'Enter' });
    expect(onOpen).toHaveBeenCalledTimes(1);
  });
});

describe('TaskDialog', () => {
  const draft: Draft = { title: '', date: '2026-10-12', start: '09:00', end: '10:00', label: '', color: 'bg-blue-500', description: '' };

  it('only enables saving with a title and an end after the start', () => {
    const onSave = vi.fn();
    render(<TaskDialog open draft={draft} onClose={() => {}} onSave={onSave} onDelete={() => {}} />);
    const save = screen.getByRole('button', { name: /Add task/ }) as HTMLButtonElement;
    expect(save.disabled).toBe(true);
    fireEvent.change(screen.getByPlaceholderText('What are you working on?'), { target: { value: 'Read chapter 3' } });
    expect(save.disabled).toBe(false);
    const [, end] = Array.from(document.querySelectorAll('input[type=time]')) as HTMLInputElement[];
    fireEvent.change(end, { target: { value: '08:00' } });
    expect(save.disabled).toBe(true);
    expect(screen.getByText('End must be after start')).toBeTruthy();
    fireEvent.change(end, { target: { value: '11:00' } });
    fireEvent.click(save);
    expect(onSave).toHaveBeenCalledWith(expect.objectContaining({ title: 'Read chapter 3', start: '09:00', end: '11:00' }));
  });

  it('suggests a colour from the category until you pick one yourself', () => {
    const onSave = vi.fn();
    render(<TaskDialog open draft={{ ...draft, title: 'x' }} onClose={() => {}} onSave={onSave} onDelete={() => {}} />);
    fireEvent.click(screen.getByRole('button', { name: /fitness/i }));
    fireEvent.click(screen.getByRole('button', { name: /Add task/ }));
    expect(onSave.mock.calls[0][0]).toMatchObject({ label: 'fitness', color: 'bg-cyan-500' });
  });

  it('sets a focus rhythm', () => {
    const onSave = vi.fn();
    render(<TaskDialog open draft={{ ...draft, title: 'x' }} onClose={() => {}} onSave={onSave} onDelete={() => {}} />);
    fireEvent.click(screen.getByRole('tab', { name: /Pomodoro/ }));
    fireEvent.click(screen.getByRole('button', { name: /Add task/ }));
    expect(onSave.mock.calls[0][0].focus).toEqual({ style: 'pomodoro', focusMin: 25, breakMin: 5 });
  });
});

describe('FocusPanel', () => {
  it('counts down to the start of an upcoming task', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 9, 12, 8, 30));
    render(<FocusPanel item={item()} auto={false} upNext={null} onClear={() => {}} onChangeFocus={() => {}} onMarkDone={() => {}} />);
    act(() => vi.advanceTimersByTime(600));
    expect(screen.getByText('Starts in')).toBeTruthy();
    expect(screen.getByText('30:00')).toBeTruthy();
  });

  it('shows the break phase of a Pomodoro and lets you switch the rhythm off', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 9, 12, 9, 27));
    const onChangeFocus = vi.fn();
    render(
      <FocusPanel item={item({ focus: { style: 'pomodoro', focusMin: 25, breakMin: 5 } })} auto={false} upNext={null} onClear={() => {}} onChangeFocus={onChangeFocus} onMarkDone={() => {}} />
    );
    act(() => vi.advanceTimersByTime(600));
    expect(screen.getByText('Break')).toBeTruthy();
    expect(screen.getByText('03:00')).toBeTruthy();
    fireEvent.click(screen.getByRole('tab', { name: 'Off' }));
    expect(onChangeFocus).toHaveBeenCalledWith(undefined);
  });

  it('offers "Mark done" once the session is over', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 9, 12, 11, 0));
    const onMarkDone = vi.fn();
    render(<FocusPanel item={item()} auto={false} upNext={null} onClear={() => {}} onChangeFocus={() => {}} onMarkDone={onMarkDone} />);
    act(() => vi.advanceTimersByTime(600));
    fireEvent.click(screen.getByRole('button', { name: 'Mark done' }));
    expect(onMarkDone).toHaveBeenCalled();
  });
});

describe('MonthView and YearView', () => {
  it('November 2026 has six week rows (no extra row from the clock change)', () => {
    const { container } = render(<MonthView month={new Date(2026, 10, 1)} byDate={new Map()} onPickDay={() => {}} onOpen={() => {}} onCreate={() => {}} />);
    const grid = container.querySelector('[style*="grid-template-rows"]') as HTMLElement;
    expect(grid.style.gridTemplateRows).toContain('repeat(6');
    expect(grid.children.length).toBe(42);
  });

  it('shows a task chip and opens it', () => {
    const onOpen = vi.fn();
    const map = new Map([['2026-11-03', [item({ date: '2026-11-03', title: 'Midterm' })]]]);
    render(<MonthView month={new Date(2026, 10, 1)} byDate={map} onPickDay={() => {}} onOpen={onOpen} onCreate={() => {}} />);
    fireEvent.click(screen.getByText('Midterm'));
    expect(onOpen).toHaveBeenCalled();
  });

  it('year view shows all twelve months and opens a day', () => {
    const onPickDay = vi.fn();
    render(<YearView variant="year" months={Array.from({ length: 12 }, (_, i) => new Date(2026, i, 1))} byDate={new Map()} onPickDay={onPickDay} />);
    expect(screen.getAllByRole('heading', { level: 3 })).toHaveLength(12);
    fireEvent.click(screen.getAllByText('15')[0]);
    expect(onPickDay).toHaveBeenCalledWith(new Date(2026, 0, 15));
  });
});
