import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Item, MONTHS, addDays, addMonths, isToday, mondayOf, sameDay, toISODate } from '../lib/prep';
import { cn } from './cn';

/** Small month picker for the sidebar. The viewed week is highlighted as a row. */
export function MiniCalendar({
  selected,
  byDate,
  onSelect,
}: {
  selected: Date;
  byDate: Map<string, Item[]>;
  onSelect: (d: Date) => void;
}) {
  const [cursor, setCursor] = useState(() => new Date(selected.getFullYear(), selected.getMonth(), 1));
  useEffect(() => {
    setCursor(new Date(selected.getFullYear(), selected.getMonth(), 1));
  }, [selected.getFullYear(), selected.getMonth()]);

  const gridStart = mondayOf(cursor);
  const last = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0);
  // Round, don't ceil: a daylight-saving change makes one of these weeks 167 or 169 hours long.
  const weeks = Math.round((mondayOf(last).getTime() - gridStart.getTime()) / 86400000 / 7) + 1;
  const days = Array.from({ length: weeks * 7 }, (_, i) => addDays(gridStart, i));
  const selMon = mondayOf(selected).getTime();

  return (
    <div className="select-none">
      <div className="mb-2 flex items-center justify-between px-1">
        <div className="text-[13px] font-semibold tracking-tight">
          {MONTHS[cursor.getMonth()]} <span className="font-normal text-muted">{cursor.getFullYear()}</span>
        </div>
        <div className="flex items-center gap-0.5">
          <button aria-label="Previous month" onClick={() => setCursor(addMonths(cursor, -1))} className="grid size-6 place-items-center rounded-md text-muted transition hover:bg-subtle hover:text-fg">
            <ChevronLeft className="size-4" />
          </button>
          <button aria-label="Next month" onClick={() => setCursor(addMonths(cursor, 1))} className="grid size-6 place-items-center rounded-md text-muted transition hover:bg-subtle hover:text-fg">
            <ChevronRight className="size-4" />
          </button>
        </div>
      </div>
      <div className="grid grid-cols-7 text-center text-[10.5px] font-medium text-faint">
        {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
          <div key={i} className="py-1">{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7">
        {days.map((d) => {
          const inMonth = d.getMonth() === cursor.getMonth();
          const inWeek = mondayOf(d).getTime() === selMon;
          const count = byDate.get(toISODate(d))?.length ?? 0;
          const today = isToday(d);
          const isSel = sameDay(d, selected);
          return (
            <button
              key={d.toISOString()}
              onClick={() => onSelect(d)}
              className={cn(
                'relative grid h-7 place-items-center text-[12px] tabular transition-colors',
                inWeek && 'bg-accent/8',
                inWeek && d.getDay() === 1 && 'rounded-l-lg',
                inWeek && d.getDay() === 0 && 'rounded-r-lg',
                !inMonth && 'text-faint'
              )}
            >
              <span
                className={cn(
                  'grid size-6 place-items-center rounded-full font-medium transition-colors',
                  today && !isSel && 'text-accent',
                  isSel ? 'bg-accent text-accent-fg' : 'hover:bg-subtle'
                )}
              >
                {d.getDate()}
              </span>
              {count > 0 && !isSel && <span className="absolute bottom-0.5 size-[3px] rounded-full bg-faint" />}
            </button>
          );
        })}
      </div>
    </div>
  );
}
