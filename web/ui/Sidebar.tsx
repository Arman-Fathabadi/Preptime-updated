import { LogOut, Monitor, Moon, Sun } from 'lucide-react';
import { Item, MONTHS, fmtHour, hueOf, isToday } from '../lib/prep';
import { MiniCalendar } from './MiniCalendar';
import { Segmented } from './Segmented';
import { Theme } from './CommandPalette';
import { cn } from './cn';

export function Logo({ className }: { className?: string }) {
  return (
    <span className={cn('grid size-7 place-items-center rounded-[9px] bg-ink text-ink-fg', className)} aria-hidden>
      <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="8.2" />
        <path d="M12 7.2V12l3.2 2" />
      </svg>
    </span>
  );
}

const greeting = (d: Date) => (d.getHours() < 12 ? 'Good morning' : d.getHours() < 18 ? 'Good afternoon' : 'Good evening');

export function Sidebar({
  username,
  now,
  selected,
  byDate,
  dayItems,
  theme,
  onTheme,
  onSelectDate,
  onOpenItem,
  onToggleItem,
  onSignOut,
}: {
  username: string | null;
  now: Date | null;
  selected: Date;
  byDate: Map<string, Item[]>;
  dayItems: Item[];
  theme: Theme;
  onTheme: (t: Theme) => void;
  onSelectDate: (d: Date) => void;
  onOpenItem: (it: Item) => void;
  onToggleItem: (id: string) => void;
  onSignOut: () => void;
}) {
  const nowH = now ? now.getHours() + now.getMinutes() / 60 : -1;
  const today = isToday(selected);
  const done = dayItems.filter((t) => t.completed).length;
  const current = today ? dayItems.find((t) => !t.completed && t.startHour <= nowH && nowH < t.endHour) : undefined;
  const next = today && !current ? dayItems.find((t) => !t.completed && t.startHour > nowH) : undefined;
  const title = today ? 'Today' : `${selected.toLocaleString('en', { weekday: 'long' })}, ${MONTHS[selected.getMonth()].slice(0, 3)} ${selected.getDate()}`;

  return (
    <aside className="flex h-full w-[284px] shrink-0 flex-col border-r border-border bg-surface">
      <div className="flex items-center gap-2.5 px-5 pb-4 pt-5">
        <Logo />
        <div className="text-[15px] font-semibold tracking-tight">PrepTime</div>
      </div>

      <div className="px-4">
        <MiniCalendar selected={selected} byDate={byDate} onSelect={onSelectDate} />
      </div>

      <div className="mx-5 my-4 h-px bg-line" />

      {/* Agenda */}
      <div className="flex min-h-0 flex-1 flex-col px-4">
        <div className="mb-2 flex items-baseline justify-between px-1">
          <h2 className="text-[13px] font-semibold tracking-tight">{title}</h2>
          {dayItems.length > 0 && (
            <span className="tabular font-mono text-[11px] text-muted">
              {done}/{dayItems.length} done
            </span>
          )}
        </div>
        {dayItems.length > 0 && (
          <div className="mx-1 mb-3 h-1 overflow-hidden rounded-full bg-subtle">
            <div className="h-full rounded-full bg-accent transition-[width] duration-500 ease-out" style={{ width: `${(done / dayItems.length) * 100}%` }} />
          </div>
        )}
        <div className="thin-scroll -mx-1 min-h-0 flex-1 space-y-px overflow-y-auto px-1 pb-2">
          {dayItems.length === 0 && (
            <p className="px-1 py-6 text-center text-[12.5px] leading-relaxed text-faint">
              Nothing planned.
              <br />
              Press <kbd className="rounded border border-border bg-subtle px-1 font-mono text-[10px]">N</kbd> to add a task.
            </p>
          )}
          {dayItems.map((t) => {
            const isNow = current?.id === t.id;
            const isNext = next?.id === t.id;
            return (
              <div key={t.id} className={cn('group flex items-center gap-2.5 rounded-lg px-2 py-1.5 transition-colors hover:bg-subtle', isNow && 'bg-accent/8')}>
                <button
                  aria-label={t.completed ? 'Mark as not done' : 'Mark as done'}
                  onClick={() => onToggleItem(t.id)}
                  className="grid size-4 shrink-0 place-items-center rounded-full border-[1.5px] transition"
                  style={{ borderColor: hueOf(t.color), background: t.completed ? hueOf(t.color) : 'transparent' }}
                >
                  {t.completed && (
                    <svg viewBox="0 0 12 12" className="size-2.5 text-white" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M2.5 6.2 5 8.6l4.5-5" />
                    </svg>
                  )}
                </button>
                <button onClick={() => onOpenItem(t)} className="min-w-0 flex-1 text-left">
                  <div className={cn('truncate text-[13px] font-medium', t.completed && 'text-faint line-through')}>{t.title}</div>
                  <div className="tabular font-mono text-[10.5px] text-muted">{fmtHour(t.startHour)}</div>
                </button>
                {(isNow || isNext) && (
                  <span className={cn('rounded-full px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider', isNow ? 'bg-accent text-accent-fg' : 'bg-subtle text-muted')}>
                    {isNow ? 'Now' : 'Next'}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer */}
      <div className="space-y-3 border-t border-line p-4">
        <div className="flex items-center justify-between">
          <span className="text-[12px] text-muted">Appearance</span>
          <Segmented<Theme>
            id="theme"
            size="sm"
            ariaLabel="Theme"
            value={theme}
            onChange={onTheme}
            options={[
              { value: 'light', label: <Sun className="size-3.5" />, title: 'Light' },
              { value: 'dark', label: <Moon className="size-3.5" />, title: 'Dark' },
              { value: 'system', label: <Monitor className="size-3.5" />, title: 'Match system' },
            ]}
          />
        </div>
        <div className="flex items-center gap-2.5">
          <span className="grid size-8 place-items-center rounded-full bg-subtle text-[12px] font-semibold uppercase">{(username ?? '?').slice(0, 1)}</span>
          <div className="min-w-0 flex-1">
            <div className="truncate text-[13px] font-medium">{username ?? 'Guest'}</div>
            <div className="text-[11.5px] text-muted">{now ? greeting(now) : ''}</div>
          </div>
          <button onClick={onSignOut} aria-label="Switch user" title="Switch user" className="grid size-8 place-items-center rounded-lg text-muted transition hover:bg-subtle hover:text-fg">
            <LogOut className="size-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
