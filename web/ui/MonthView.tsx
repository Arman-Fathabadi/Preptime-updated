import { motion } from 'framer-motion';
import { Item, WEEKDAYS_SHORT, addDays, fmtHour, hueOf, isToday, mondayOf, toISODate } from '../lib/prep';
import { cn } from './cn';

/** Month overview: dense but calm. Click a day to open it, click a chip to edit. */
export function MonthView({
  month,
  byDate,
  onPickDay,
  onOpen,
  onCreate,
}: {
  month: Date;
  byDate: Map<string, Item[]>;
  onPickDay: (d: Date) => void;
  onOpen: (item: Item) => void;
  onCreate: (d: Date) => void;
}) {
  const first = new Date(month.getFullYear(), month.getMonth(), 1);
  const gridStart = mondayOf(first);
  const last = new Date(month.getFullYear(), month.getMonth() + 1, 0);
  const weeks = Math.ceil(((mondayOf(last).getTime() - gridStart.getTime()) / 86400000 + 7) / 7);
  const cells = Array.from({ length: weeks * 7 }, (_, i) => addDays(gridStart, i));

  return (
    <div className="flex h-full min-h-0 flex-col bg-surface">
      <div className="grid shrink-0 grid-cols-7 border-b border-line">
        {WEEKDAYS_SHORT.map((d) => (
          <div key={d} className="px-3 py-2.5 text-[11px] font-medium uppercase tracking-[0.08em] text-muted">
            {d}
          </div>
        ))}
      </div>
      <div className="grid min-h-0 flex-1 grid-cols-7" style={{ gridTemplateRows: `repeat(${weeks}, minmax(0, 1fr))` }}>
        {cells.map((d, i) => {
          const iso = toISODate(d);
          const list = byDate.get(iso) ?? [];
          const inMonth = d.getMonth() === month.getMonth();
          const today = isToday(d);
          const shown = list.slice(0, 3);
          const extra = list.length - shown.length;
          return (
            <motion.div
              key={iso}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2, delay: Math.min(i, 20) * 0.006 }}
              onClick={() => onPickDay(d)}
              onDoubleClick={() => onCreate(d)}
              className={cn(
                'group relative min-h-0 cursor-pointer overflow-hidden border-b border-l border-line p-1.5 transition-colors hover:bg-subtle/60',
                !inMonth && 'bg-subtle/40'
              )}
            >
              <div className="mb-1 flex items-center justify-between px-1">
                <span
                  className={cn(
                    'tabular grid h-6 min-w-6 place-items-center rounded-full px-1 text-[12px] font-medium',
                    today ? 'bg-accent text-accent-fg' : inMonth ? 'text-fg' : 'text-faint'
                  )}
                >
                  {d.getDate() === 1 ? `${d.toLocaleString('en', { month: 'short' })} 1` : d.getDate()}
                </span>
                {list.length > 0 && <span className="tabular font-mono text-[10px] text-faint opacity-0 transition-opacity group-hover:opacity-100">{list.length}</span>}
              </div>
              <div className="space-y-0.5">
                {shown.map((t) => (
                  <button
                    key={t.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpen(t);
                    }}
                    style={{ ['--c' as string]: hueOf(t.color) }}
                    className={cn(
                      'flex h-[18px] w-full items-center gap-1.5 rounded px-1.5 text-left text-[11px] transition-colors',
                      'bg-[color-mix(in_oklab,var(--c)_13%,rgb(var(--surface)))] hover:bg-[color-mix(in_oklab,var(--c)_22%,rgb(var(--surface)))]',
                      t.completed && 'opacity-50'
                    )}
                  >
                    <span className="size-1.5 shrink-0 rounded-full bg-[var(--c)]" />
                    <span className={cn('truncate text-[color-mix(in_oklab,var(--c)_55%,rgb(var(--fg)))]', t.completed && 'line-through')}>{t.title}</span>
                    <span className="tabular ml-auto hidden shrink-0 font-mono text-[10px] text-faint xl:block">{fmtHour(t.startHour)}</span>
                  </button>
                ))}
                {extra > 0 && <div className="px-1.5 text-[11px] text-muted">+{extra} more</div>}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
