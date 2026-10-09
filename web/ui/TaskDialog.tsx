import { useEffect, useRef, useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { CalendarDays, Check, Clock, Timer, Trash2, X } from 'lucide-react';
import { FOCUS_PRESETS, Focus, FocusStyle, Item, PALETTE, fmtDuration, focusFor, hhmmToHour, hourToHhmm, hueOf } from '../lib/prep';
import { Kbd } from './Kbd';
import { Segmented } from './Segmented';
import { useRestoreFocus } from './hooks';
import { cn } from './cn';

export type Draft = {
  id?: string;
  title: string;
  date: string;
  start: string; // HH:MM
  end: string; // HH:MM
  label: string;
  color: string;
  description: string;
  focus?: Focus;
};

const LABELS: { label: string; color: string }[] = [
  { label: 'study', color: 'bg-violet-500' },
  { label: 'deep', color: 'bg-indigo-500' },
  { label: 'work', color: 'bg-red-500' },
  { label: 'admin', color: 'bg-orange-500' },
  { label: 'fitness', color: 'bg-cyan-500' },
  { label: 'break', color: 'bg-green-500' },
  { label: 'social', color: 'bg-pink-500' },
  { label: 'life', color: 'bg-slate-500' },
];

export function draftFromItem(it: Item): Draft {
  return {
    id: it.id,
    title: it.title,
    date: it.date,
    start: hourToHhmm(it.startHour),
    end: hourToHhmm(it.endHour >= 24 ? 23.9833 : it.endHour),
    label: it.label,
    color: it.color,
    description: it.description,
    focus: it.focus,
  };
}

export function TaskDialog({
  open,
  draft,
  onClose,
  onSave,
  onDelete,
  onFocus,
}: {
  open: boolean;
  draft: Draft | null;
  onClose: () => void;
  onSave: (d: Draft) => void;
  onDelete: (id: string) => void;
  onFocus?: (id: string) => void;
}) {
  const [d, setD] = useState<Draft | null>(draft);
  const [colorTouched, setColorTouched] = useState(false);
  const titleRef = useRef<HTMLInputElement>(null);
  useRestoreFocus(open);

  useEffect(() => {
    setD(draft);
    setColorTouched(!!draft?.id);
  }, [draft, open]);

  if (!d) return null;
  const editing = !!d.id;
  const startH = hhmmToHour(d.start);
  const endH = hhmmToHour(d.end);
  const valid = d.title.trim().length > 0 && endH > startH;
  const set = (patch: Partial<Draft>) => setD((prev) => (prev ? { ...prev, ...patch } : prev));

  const save = () => {
    if (valid) onSave({ ...d, title: d.title.trim() });
  };

  return (
    <Dialog.Root open={open} onOpenChange={(o) => !o && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/30 backdrop-blur-[2px] data-[state=open]:animate-fade-in" />
        <Dialog.Content
          onOpenAutoFocus={(e) => {
            e.preventDefault();
            titleRef.current?.focus();
          }}
          onKeyDown={(e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
              e.preventDefault();
              save();
            }
          }}
          className="fixed left-1/2 top-[12vh] z-50 w-[min(520px,calc(100vw-24px))] -translate-x-1/2 rounded-2xl bg-surface shadow-pop outline-none data-[state=open]:animate-pop-in"
          aria-describedby={undefined}
        >
          <Dialog.Title className="sr-only">{editing ? 'Edit task' : 'New task'}</Dialog.Title>

          {/* Title row */}
          <div className="flex items-start gap-3 px-5 pb-1 pt-5">
            <span className="mt-[9px] size-3 shrink-0 rounded-full" style={{ background: hueOf(d.color) }} />
            <input
              ref={titleRef}
              value={d.title}
              onChange={(e) => set({ title: e.target.value })}
              onKeyDown={(e) => e.key === 'Enter' && !e.metaKey && !e.ctrlKey && (e.preventDefault(), save())}
              placeholder="What are you working on?"
              className="w-full bg-transparent text-[20px] font-semibold tracking-tight placeholder:text-faint focus:outline-none"
            />
            <Dialog.Close className="mt-1 grid size-7 shrink-0 place-items-center rounded-md text-muted transition hover:bg-subtle hover:text-fg" aria-label="Close">
              <X className="size-4" />
            </Dialog.Close>
          </div>

          <div className="space-y-4 px-5 pb-4 pt-3">
            {/* When */}
            <div className="grid grid-cols-[auto_1fr] items-center gap-x-3 gap-y-2.5">
              <CalendarDays className="size-4 text-faint" />
              <input
                type="date"
                value={d.date}
                onChange={(e) => e.target.value && set({ date: e.target.value })}
                className="h-9 w-fit rounded-lg bg-subtle px-3 text-[13px] tabular outline-none transition focus:ring-2 focus:ring-accent/60"
              />
              <Clock className="size-4 text-faint" />
              <div className="flex flex-wrap items-center gap-2">
                <input
                  type="time"
                  step={300}
                  value={d.start}
                  onChange={(e) => {
                    const ns = e.target.value;
                    if (!ns) return;
                    // keep the same duration when the start moves
                    const len = Math.max(endH - startH, 0.25);
                    set({ start: ns, end: hourToHhmm(Math.min(hhmmToHour(ns) + len, 23.9833)) });
                  }}
                  className="h-9 rounded-lg bg-subtle px-3 text-[13px] tabular outline-none transition focus:ring-2 focus:ring-accent/60"
                />
                <span className="text-faint">→</span>
                <input
                  type="time"
                  step={300}
                  value={d.end}
                  onChange={(e) => e.target.value && set({ end: e.target.value })}
                  className={cn(
                    'h-9 rounded-lg bg-subtle px-3 text-[13px] tabular outline-none transition focus:ring-2 focus:ring-accent/60',
                    endH <= startH && 'ring-2 ring-danger/60'
                  )}
                />
                <span className={cn('tabular font-mono text-[12px]', endH > startH ? 'text-muted' : 'text-danger')}>
                  {endH > startH ? fmtDuration(startH, endH) : 'End must be after start'}
                </span>
              </div>
              <span />
              <div className="flex flex-wrap gap-1.5">
                {[0.5, 1, 1.5, 2].map((h) => (
                  <button
                    key={h}
                    onClick={() => set({ end: hourToHhmm(Math.min(startH + h, 23.9833)) })}
                    className={cn(
                      'h-6 rounded-md px-2 text-[11.5px] font-medium tabular transition',
                      Math.abs(endH - startH - h) < 0.01 ? 'bg-ink text-ink-fg' : 'bg-subtle text-muted hover:text-fg'
                    )}
                  >
                    {fmtDuration(0, h)}
                  </button>
                ))}
              </div>
            </div>

            <div className="h-px bg-line" />

            {/* Category */}
            <div>
              <div className="mb-2 text-[11.5px] font-medium text-muted">Category</div>
              <div className="flex flex-wrap gap-1.5">
                {LABELS.map((l) => {
                  const active = d.label === l.label;
                  return (
                    <button
                      key={l.label}
                      onClick={() => set({ label: active ? '' : l.label, ...(colorTouched || active ? {} : { color: l.color }) })}
                      className={cn(
                        'inline-flex h-7 items-center gap-1.5 rounded-full px-2.5 text-[12px] font-medium capitalize transition',
                        active ? 'bg-ink text-ink-fg' : 'bg-subtle text-muted hover:text-fg'
                      )}
                    >
                      <span className="size-1.5 rounded-full" style={{ background: hueOf(l.color) }} />
                      {l.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Colour */}
            <div>
              <div className="mb-2 text-[11.5px] font-medium text-muted">Colour</div>
              <div className="flex flex-wrap gap-2">
                {PALETTE.map((c) => {
                  const active = d.color === c.value;
                  return (
                    <button
                      key={c.value}
                      aria-label={c.name}
                      aria-pressed={active}
                      onClick={() => {
                        setColorTouched(true);
                        set({ color: c.value });
                      }}
                      className="relative grid size-6 place-items-center rounded-full transition hover:scale-110"
                      style={{ background: hueOf(c.value) }}
                    >
                      {active && <Check className="size-3.5 text-white" strokeWidth={3} />}
                      {active && <span className="absolute -inset-[3px] rounded-full ring-2 ring-fg/80" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Focus rhythm */}
            <div>
              <div className="mb-2 flex items-center gap-1.5 text-[11.5px] font-medium text-muted">
                <Timer className="size-3.5" /> Focus rhythm
                <span className="font-normal text-faint">
                  {d.focus ? `${d.focus.focusMin} min focus, ${d.focus.breakMin} min break` : 'one countdown to the end'}
                </span>
              </div>
              <Segmented<'off' | FocusStyle>
                id="dlg-rhythm"
                value={d.focus?.style ?? 'off'}
                onChange={(m) => set({ focus: m === 'off' ? undefined : focusFor(m, d.focus) })}
                options={[
                  { value: 'off', label: 'Off' },
                  { value: 'pomodoro', label: `Pomodoro ${FOCUS_PRESETS.pomodoro.focusMin}/${FOCUS_PRESETS.pomodoro.breakMin}` },
                  { value: 'deep', label: `Deep ${FOCUS_PRESETS.deep.focusMin}/${FOCUS_PRESETS.deep.breakMin}` },
                  { value: 'custom', label: 'Custom' },
                ]}
              />
              {d.focus?.style === 'custom' && (
                <div className="mt-2 flex items-center gap-2 text-[12.5px] text-muted">
                  Focus
                  <input type="number" min={5} max={180} value={d.focus.focusMin}
                    onChange={(e) => set({ focus: { ...d.focus!, focusMin: Math.max(5, Math.min(180, Number(e.target.value) || 5)) } })}
                    className="tabular h-8 w-16 rounded-lg bg-subtle px-2 text-center font-mono text-[13px] text-fg outline-none focus:ring-2 focus:ring-accent/60" />
                  min, break
                  <input type="number" min={1} max={60} value={d.focus.breakMin}
                    onChange={(e) => set({ focus: { ...d.focus!, breakMin: Math.max(1, Math.min(60, Number(e.target.value) || 1)) } })}
                    className="tabular h-8 w-16 rounded-lg bg-subtle px-2 text-center font-mono text-[13px] text-fg outline-none focus:ring-2 focus:ring-accent/60" />
                  min
                </div>
              )}
            </div>

            <textarea
              value={d.description}
              onChange={(e) => set({ description: e.target.value })}
              placeholder="Notes (optional)"
              rows={2}
              className="w-full resize-none rounded-lg bg-subtle px-3 py-2 text-[13px] placeholder:text-faint outline-none transition focus:ring-2 focus:ring-accent/60"
            />
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between border-t border-line px-4 py-3">
            {editing ? (
              <div className="flex items-center gap-1">
                <button
                  onClick={() => d.id && onDelete(d.id)}
                  className="inline-flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-[13px] font-medium text-danger transition hover:bg-danger/10"
                >
                  <Trash2 className="size-4" /> Delete
                </button>
                {onFocus && (
                  <button
                    onClick={() => d.id && onFocus(d.id)}
                    className="inline-flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-[13px] font-medium text-muted transition hover:bg-subtle hover:text-fg"
                  >
                    <Timer className="size-4" /> Focus on this
                  </button>
                )}
              </div>
            ) : (
              <span className="text-[12px] text-faint">Tip: drag on the calendar to pick a time</span>
            )}
            <div className="flex items-center gap-2">
              <button onClick={onClose} className="h-8 rounded-lg px-3 text-[13px] font-medium text-muted transition hover:bg-subtle hover:text-fg">
                Cancel
              </button>
              <button
                onClick={save}
                disabled={!valid}
                className="inline-flex h-8 items-center gap-2 rounded-lg bg-ink px-3.5 text-[13px] font-medium text-ink-fg transition enabled:hover:opacity-90 enabled:active:scale-[0.98] disabled:opacity-40"
              >
                {editing ? 'Save' : 'Add task'}
                <Kbd className="border-transparent bg-white/15 text-ink-fg/70 dark:bg-black/10">⌘↵</Kbd>
              </button>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
