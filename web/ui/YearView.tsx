import { motion } from 'framer-motion';
import { Item, MONTHS, addDays, hueOf, isToday, mondayOf, toISODate } from '../lib/prep';
import { cn } from './cn';

/** Busy-ness of a day, 0..4, from the total planned hours. */
function level(list: Item[] | undefined) {
  if (!list?.length) return 0;
  const hours = list.reduce((s, t) => s + (t.endHour - t.startHour), 0);
  return hours < 2 ? 1 : hours < 5 ? 2 : hours < 9 ? 3 : 4;
}

const SHADE = ['', 'bg-accent/15', 'bg-accent/30', 'bg-accent/50', 'bg-accent/75'];

function MonthCard({
  month,
  byDate,
  onPickDay,
  large,
  index,
}: {
  month: Date;
  byDate: Map<string, Item[]>;
  onPickDay: (d: Date) => void;
  large: boolean;
  index: number;
}) {
  const first = new Date(month.getFullYear(), month.getMonth(), 1);
  const last = new Date(month.getFullYear(), month.getMonth() + 1, 0);
  const start = mondayOf(first);
  const weeks = Math.round((mondayOf(last).getTime() - start.getTime()) / 86400000 / 7) + 1;
  const days = Array.from({ length: weeks * 7 }, (_, i) => addDays(start, i));
  const inMonth = (d: Date) => d.getMonth() === month.getMonth();
  const monthItems = days.filter(inMonth).flatMap((d) => byDate.get(toISODate(d)) ?? []);
  const hours = Math.round(monthItems.reduce((s, t) => s + (t.endHour - t.startHour), 0));
  const done = monthItems.filter((t) => t.completed).length;

  return (
    <motion.section
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: index * 0.025, ease: [0.23, 1, 0.32, 1] }}
      className="rounded-2xl border border-border bg-surface p-4"
    >
      <header className="mb-3 flex items-baseline justify-between">
        <h3 className={cn('font-semibold tracking-tight', large ? 'text-[16px]' : 'text-[14px]')}>{MONTHS[month.getMonth()]}</h3>
        <span className="tabular font-mono text-[11px] text-muted">
          {monthItems.length ? `${monthItems.length} tasks · ${hours}h${done ? ` · ${done} done` : ''}` : 'Nothing planned'}
        </span>
      </header>
      <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-medium text-faint">
        {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
          <div key={i}>{d}</div>
        ))}
      </div>
      <div className="mt-1 grid grid-cols-7 gap-1">
        {days.map((d) => {
          const list = byDate.get(toISODate(d));
          const lv = inMonth(d) ? level(list) : 0;
          const today = isToday(d);
          return (
            <button
              key={d.toISOString()}
              onClick={() => onPickDay(d)}
              disabled={!inMonth(d)}
              title={inMonth(d) ? `${d.toDateString()}: ${list?.length ?? 0} tasks` : undefined}
              className={cn(
                'relative grid place-items-center rounded-md tabular transition',
                large ? 'aspect-square text-[12px]' : 'aspect-square text-[10.5px]',
                inMonth(d) ? 'text-fg hover:ring-1 hover:ring-accent/60' : 'invisible',
                lv ? SHADE[lv] : 'bg-subtle/60',
                today && 'ring-2 ring-accent'
              )}
            >
              {d.getDate()}
              {large && list && list.length > 0 && (
                <span className="absolute bottom-1 flex gap-0.5">
                  {list.slice(0, 3).map((t) => (
                    <span key={t.id} className="size-1 rounded-full" style={{ background: hueOf(t.color) }} />
                  ))}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </motion.section>
  );
}

/** Year (12 months) or Season (3 months) overview. Click a day to open it. */
export function YearView({
  months,
  byDate,
  onPickDay,
  variant,
}: {
  months: Date[];
  byDate: Map<string, Item[]>;
  onPickDay: (d: Date) => void;
  variant: 'year' | 'season';
}) {
  const large = variant === 'season';
  return (
    <div className="thin-scroll h-full overflow-y-auto bg-bg p-4 sm:p-6">
      <div className={cn('mx-auto grid gap-4', large ? 'max-w-6xl grid-cols-1 lg:grid-cols-3' : 'max-w-6xl grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4')}>
        {months.map((m, i) => (
          <MonthCard key={m.toISOString()} month={m} byDate={byDate} onPickDay={onPickDay} large={large} index={i} />
        ))}
      </div>
      <div className="mx-auto mt-5 flex max-w-6xl items-center justify-end gap-2 text-[11px] text-muted">
        Less
        {SHADE.map((c, i) => (
          <span key={i} className={cn('size-3 rounded-sm', c || 'bg-subtle')} />
        ))}
        More
      </div>
    </div>
  );
}
