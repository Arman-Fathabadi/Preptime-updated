import { motion } from 'framer-motion';
import { CalendarPlus, Sparkles } from 'lucide-react';
import { Kbd } from './Kbd';

export function EmptyState({ onAdd, onSample }: { onAdd: () => void; onSample: () => void }) {
  return (
    <div className="pointer-events-none absolute inset-0 z-30 grid place-items-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 12, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: 'spring', stiffness: 260, damping: 26, delay: 0.1 }}
        className="pointer-events-auto w-[min(380px,100%)] rounded-2xl bg-surface p-6 text-center shadow-pop"
      >
        <div className="mx-auto mb-4 grid size-11 place-items-center rounded-xl bg-subtle">
          <CalendarPlus className="size-5" />
        </div>
        <h2 className="text-[17px] font-semibold tracking-tight">Start with one good week</h2>
        <p className="mx-auto mt-1.5 max-w-[30ch] text-[13.5px] leading-relaxed text-muted">
          Add the tasks you do in a typical week. PrepTime learns the pattern and plans the weeks after it.
        </p>
        <div className="mt-5 flex flex-col gap-2">
          <button
            onClick={onAdd}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-ink px-4 text-[13.5px] font-medium text-ink-fg transition hover:opacity-90 active:scale-[0.98]"
          >
            Add your first task <Kbd className="border-transparent bg-white/15 text-ink-fg/70 dark:bg-black/10">N</Kbd>
          </button>
          <button
            onClick={onSample}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-subtle px-4 text-[13.5px] font-medium text-fg transition hover:bg-border/60 active:scale-[0.98]"
          >
            <Sparkles className="size-4 text-muted" /> Try a sample week
          </button>
        </div>
        <p className="mt-4 text-[12px] text-faint">
          Tip: press <Kbd>⌘</Kbd> <Kbd>K</Kbd> for everything else
        </p>
      </motion.div>
    </div>
  );
}
