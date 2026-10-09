import { useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, Minus, Plus, Timer, X } from 'lucide-react';
import { FOCUS_PRESETS, Focus, FocusStyle, Item, focusFor, focusState, fmtCountdown, fmtRange, hueOf } from '../lib/prep';
import { Segmented } from './Segmented';
import { useNow } from './hooks';
import { cn } from './cn';

const R = 34;
const C = 2 * Math.PI * R;
const BREAK_COLOR = '#22c55e';

type Mode = 'off' | FocusStyle;

function Ring({ fraction, color, children }: { fraction: number; color: string; children: React.ReactNode }) {
  const f = Math.min(1, Math.max(0, fraction));
  return (
    <div className="relative grid size-[88px] shrink-0 place-items-center">
      <svg viewBox="0 0 80 80" className="absolute inset-0 -rotate-90">
        <circle cx="40" cy="40" r={R} fill="none" strokeWidth="5" className="stroke-border" />
        <circle
          cx="40"
          cy="40"
          r={R}
          fill="none"
          strokeWidth="5"
          strokeLinecap="round"
          stroke={color}
          strokeDasharray={C}
          strokeDashoffset={C * (1 - f)}
          style={{ transition: 'stroke-dashoffset 1s linear, stroke 300ms ease' }}
        />
      </svg>
      <div className="relative text-center">{children}</div>
    </div>
  );
}

/**
 * The focus timer. Like the original it runs off the task's own schedule and the device
 * clock (no start/stop to forget), splitting the task into focus and break phases when it
 * has a rhythm. The countdown is also mirrored in the browser tab title.
 */
export function FocusPanel({
  item,
  auto,
  upNext,
  onClear,
  onChangeFocus,
  onMarkDone,
}: {
  item: Item | null;
  /** true when the item was picked automatically because it is happening now */
  auto: boolean;
  upNext: Item | null;
  onClear: () => void;
  onChangeFocus: (focus: Focus | undefined) => void;
  onMarkDone: () => void;
}) {
  const now = useNow(500);
  const baseTitle = useRef<string>('');

  const state = item && now ? focusState(item, now) : null;

  // Mirror the countdown in the tab title while something is running.
  useEffect(() => {
    if (!baseTitle.current) baseTitle.current = document.title;
    if (state?.kind === 'running' && item) {
      document.title = `${fmtCountdown(state.phaseRemainingSec)} · ${state.phase === 'break' ? 'Break' : 'Focus'} · ${item.title}`;
    } else if (baseTitle.current) {
      document.title = baseTitle.current;
    }
  }, [state?.kind === 'running' ? state.phaseRemainingSec : state?.kind, state?.kind === 'running' ? state.phase : '', item?.title]);
  useEffect(() => () => void (baseTitle.current && (document.title = baseTitle.current)), []);

  const mode: Mode = item?.focus?.style ?? 'off';
  const setMode = (m: Mode) => onChangeFocus(m === 'off' ? undefined : focusFor(m, item?.focus));
  const setMinutes = (patch: Partial<Focus>) => item?.focus && onChangeFocus({ ...item.focus, ...patch, style: 'custom' });

  /* ---- empty --------------------------------------------------------- */
  if (!item) {
    const until = upNext && now ? focusState(upNext, now) : null;
    return (
      <div className="rounded-xl border border-dashed border-border px-3.5 py-3">
        <div className="flex items-center gap-2 text-[12px] font-medium text-muted">
          <Timer className="size-3.5" /> Focus timer
        </div>
        <p className="mt-1.5 text-[12.5px] leading-snug text-faint">
          Pick a task from the list to start its timer
          {until?.kind === 'before' && upNext ? (
            <>
              . Next up: <span className="font-medium text-muted">{upNext.title}</span> in{' '}
              <span className="tabular font-mono text-muted">{fmtCountdown(until.startsInSec)}</span>
            </>
          ) : (
            '.'
          )}
        </p>
      </div>
    );
  }

  const hue = hueOf(item.color);
  const inBreak = state?.kind === 'running' && state.phase === 'break';
  const ringColor = inBreak ? BREAK_COLOR : 'rgb(var(--accent))';

  return (
    <div className="rounded-xl bg-subtle/70 p-3.5 ring-1 ring-border/70">
      <div className="mb-2.5 flex items-center gap-2">
        <span className="size-2 shrink-0 rounded-full" style={{ background: hue }} />
        <div className="min-w-0 flex-1">
          <div className="truncate text-[13px] font-semibold tracking-tight">{item.title}</div>
          <div className="tabular font-mono text-[10.5px] text-muted">{fmtRange(item.startHour, item.endHour)}</div>
        </div>
        {auto && <span className="rounded-full bg-accent/12 px-1.5 py-0.5 text-[9.5px] font-semibold uppercase tracking-wider text-accent">Auto</span>}
        {!auto && (
          <button onClick={onClear} aria-label="Stop watching this task" className="grid size-6 place-items-center rounded-md text-faint transition hover:bg-border/60 hover:text-fg">
            <X className="size-3.5" />
          </button>
        )}
      </div>

      <AnimatePresence mode="wait" initial={false}>
        {state?.kind === 'before' && (
          <motion.div key="before" initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="rounded-lg bg-surface px-3 py-3">
            <div className="text-[11px] font-medium uppercase tracking-wider text-muted">Starts in</div>
            <div className="tabular mt-0.5 font-mono text-[26px] font-semibold leading-none tracking-tight">{fmtCountdown(state.startsInSec)}</div>
          </motion.div>
        )}

        {state?.kind === 'after' && (
          <motion.div key="after" initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex items-center justify-between gap-2 rounded-lg bg-surface px-3 py-3">
            <div className="flex items-center gap-2 text-[13px] font-medium">
              <span className="grid size-5 place-items-center rounded-full bg-green-500/15 text-green-600"><Check className="size-3" strokeWidth={3} /></span>
              Session finished
            </div>
            {!item.completed && (
              <button onClick={onMarkDone} className="h-7 rounded-md bg-ink px-2.5 text-[12px] font-medium text-ink-fg transition hover:opacity-90 active:scale-[0.97]">
                Mark done
              </button>
            )}
          </motion.div>
        )}

        {state?.kind === 'running' && (
          <motion.div key="running" initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex items-center gap-3.5 rounded-lg bg-surface px-3 py-3">
            <Ring fraction={state.phaseRemainingSec / Math.max(1, state.phaseTotalSec)} color={ringColor}>
              <div className="tabular font-mono text-[19px] font-semibold leading-none tracking-tight">{fmtCountdown(state.phaseRemainingSec)}</div>
            </Ring>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <span className={cn('size-2 rounded-full', !inBreak && 'animate-pulse')} style={{ background: ringColor }} />
                <span className="text-[13px] font-semibold">{inBreak ? 'Break' : 'Focus'}</span>
              </div>
              <div className="mt-1 text-[11.5px] leading-snug text-muted">
                {state.cycles ? <>Cycle {state.cycle}</> : 'Until the task ends'}
              </div>
              <div className="tabular mt-0.5 truncate font-mono text-[11px] text-faint" title="Time left in the whole task">{fmtCountdown(state.blockRemainingSec)} left</div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Rhythm */}
      <div className="mt-3">
        <div className="mb-1.5 text-[11.5px] text-muted">Rhythm</div>
        <Segmented<Mode>
          id="rhythm"
          size="sm"
          fullWidth
          ariaLabel="Focus rhythm"
          value={mode}
          onChange={setMode}
          options={[
            { value: 'off', label: 'Off', title: 'One countdown to the end of the task' },
            { value: 'pomodoro', label: '25/5', title: `Pomodoro: ${FOCUS_PRESETS.pomodoro.focusMin} min focus, ${FOCUS_PRESETS.pomodoro.breakMin} min break` },
            { value: 'deep', label: '52/17', title: `Deep Focus: ${FOCUS_PRESETS.deep.focusMin} min focus, ${FOCUS_PRESETS.deep.breakMin} min break` },
            { value: 'custom', label: 'Custom' },
          ]}
        />
      </div>

      <AnimatePresence initial={false}>
        {mode === 'custom' && item.focus && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
            className="overflow-hidden"
          >
            <div className="mt-2.5 grid grid-cols-2 gap-2">
              <Stepper label="Focus" value={item.focus.focusMin} min={5} max={180} onChange={(v) => setMinutes({ focusMin: v })} />
              <Stepper label="Break" value={item.focus.breakMin} min={1} max={60} onChange={(v) => setMinutes({ breakMin: v })} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Stepper({ label, value, min, max, onChange }: { label: string; value: number; min: number; max: number; onChange: (v: number) => void }) {
  const clamp = (v: number) => Math.min(max, Math.max(min, Math.round(v) || min));
  return (
    <div className="rounded-lg bg-surface px-2 py-1.5">
      <div className="text-[10.5px] font-medium text-muted">{label} (min)</div>
      <div className="mt-0.5 flex items-center justify-between">
        <button aria-label={`Decrease ${label}`} onClick={() => onChange(clamp(value - 1))} className="grid size-6 place-items-center rounded-md text-muted transition hover:bg-subtle hover:text-fg">
          <Minus className="size-3.5" />
        </button>
        <input
          aria-label={`${label} minutes`}
          type="number"
          min={min}
          max={max}
          value={value}
          onChange={(e) => onChange(clamp(Number(e.target.value)))}
          className="tabular w-9 bg-transparent text-center font-mono text-[13px] font-semibold outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"
        />
        <button aria-label={`Increase ${label}`} onClick={() => onChange(clamp(value + 1))} className="grid size-6 place-items-center rounded-md text-muted transition hover:bg-subtle hover:text-fg">
          <Plus className="size-3.5" />
        </button>
      </div>
    </div>
  );
}
