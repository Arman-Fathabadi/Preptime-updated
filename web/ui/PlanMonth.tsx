import { useEffect, useRef, useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { AnimatePresence, motion } from 'framer-motion';
import { CalendarRange, Check, Loader2, TriangleAlert, X } from 'lucide-react';
import { cn } from './cn';

const STEPS = ['Reading your week', 'Finding your rhythm', 'Placing the next three weeks'];
const MIN_ITEMS = 5;

/** Confirmation + progress for "plan the next 3 weeks". Replaces the old full-screen loader. */
export function PlanMonth({
  open,
  onOpenChange,
  count,
  weekLabel,
  nextLabel,
  replacing,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  count: number;
  weekLabel: string;
  nextLabel: string;
  replacing: number;
  onConfirm: () => Promise<void>;
}) {
  const [phase, setPhase] = useState<'idle' | 'running' | 'error'>('idle');
  const [step, setStep] = useState(0);
  const [error, setError] = useState('');
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);
  const ok = count >= MIN_ITEMS;

  useEffect(() => {
    if (!open) {
      setPhase('idle');
      setStep(0);
      setError('');
    }
  }, [open]);

  useEffect(() => () => void (timer.current && clearInterval(timer.current)), []);

  const run = async () => {
    setPhase('running');
    setStep(0);
    timer.current = setInterval(() => setStep((s) => Math.min(s + 1, STEPS.length - 1)), 800);
    const started = Date.now();
    try {
      await onConfirm();
      const wait = Math.max(0, 1900 - (Date.now() - started)); // let the progress read as intentional
      await new Promise((r) => setTimeout(r, wait));
      onOpenChange(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong.');
      setPhase('error');
    } finally {
      if (timer.current) clearInterval(timer.current);
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={(o) => phase !== 'running' && onOpenChange(o)}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/30 backdrop-blur-[2px] data-[state=open]:animate-fade-in" />
        <Dialog.Content
          aria-describedby={undefined}
          className="fixed left-1/2 top-[16vh] z-50 w-[min(460px,calc(100vw-24px))] -translate-x-1/2 overflow-hidden rounded-2xl bg-surface shadow-pop outline-none data-[state=open]:animate-pop-in"
        >
          <div className="flex items-start justify-between px-5 pt-5">
            <div className="grid size-10 place-items-center rounded-xl bg-subtle">
              <CalendarRange className="size-5" />
            </div>
            {phase !== 'running' && (
              <Dialog.Close className="grid size-7 place-items-center rounded-md text-muted transition hover:bg-subtle hover:text-fg" aria-label="Close">
                <X className="size-4" />
              </Dialog.Close>
            )}
          </div>

          <div className="px-5 pb-5 pt-3">
            <Dialog.Title className="text-[17px] font-semibold tracking-tight">Plan the next three weeks</Dialog.Title>

            <AnimatePresence mode="wait" initial={false}>
              {phase === 'running' ? (
                <motion.div key="run" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mt-4">
                  <ul className="space-y-2.5">
                    {STEPS.map((s, i) => {
                      const done = i < step;
                      const active = i === step;
                      return (
                        <li key={s} className={cn('flex items-center gap-3 text-[13.5px] transition-colors', done || active ? 'text-fg' : 'text-faint')}>
                          <span className="grid size-5 place-items-center">
                            {done ? (
                              <motion.span initial={{ scale: 0.4 }} animate={{ scale: 1 }} className="grid size-5 place-items-center rounded-full bg-accent text-accent-fg">
                                <Check className="size-3" strokeWidth={3} />
                              </motion.span>
                            ) : active ? (
                              <Loader2 className="size-4 animate-spin text-accent" />
                            ) : (
                              <span className="size-1.5 rounded-full bg-border" />
                            )}
                          </span>
                          {s}
                        </li>
                      );
                    })}
                  </ul>
                  <div className="mt-5 h-1 overflow-hidden rounded-full bg-subtle">
                    <motion.div
                      className="h-full rounded-full bg-accent"
                      initial={{ width: '6%' }}
                      animate={{ width: `${((step + 1) / STEPS.length) * 92}%` }}
                      transition={{ type: 'spring', stiffness: 90, damping: 20 }}
                    />
                  </div>
                </motion.div>
              ) : (
                <motion.div key="idle" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                  <p className="mt-1.5 text-[13.5px] leading-relaxed text-muted">
                    We use <span className="font-medium text-fg">{weekLabel}</span> as the pattern and lay out the next three weeks
                    starting <span className="font-medium text-fg">{nextLabel}</span>.
                  </p>
                  {replacing > 0 && ok && (
                    <p className="mt-2 text-[12.5px] text-muted">
                      This replaces the {replacing} task{replacing === 1 ? '' : 's'} planned earlier. Anything you added yourself stays.
                    </p>
                  )}
                  {!ok && (
                    <div className="mt-3 flex items-start gap-2 rounded-lg bg-amber-500/10 px-3 py-2.5 text-[12.5px] text-[color-mix(in_oklab,#f59e0b_70%,rgb(var(--fg)))]">
                      <TriangleAlert className="mt-px size-4 shrink-0" />
                      Add at least {MIN_ITEMS} tasks to this week first ({count} so far). That gives us a pattern to learn from.
                    </div>
                  )}
                  {phase === 'error' && (
                    <div className="mt-3 flex items-start gap-2 rounded-lg bg-danger/10 px-3 py-2.5 text-[12.5px] text-danger">
                      <TriangleAlert className="mt-px size-4 shrink-0" />
                      <span className="break-words">{error}</span>
                    </div>
                  )}
                  <div className="mt-5 flex justify-end gap-2">
                    <button onClick={() => onOpenChange(false)} className="h-9 rounded-lg px-3.5 text-[13px] font-medium text-muted transition hover:bg-subtle hover:text-fg">
                      Cancel
                    </button>
                    <button
                      onClick={run}
                      disabled={!ok}
                      className="h-9 rounded-lg bg-ink px-4 text-[13px] font-medium text-ink-fg transition enabled:hover:opacity-90 enabled:active:scale-[0.98] disabled:opacity-40"
                    >
                      {phase === 'error' ? 'Try again' : 'Plan three weeks'}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
