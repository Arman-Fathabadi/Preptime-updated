import { Command } from 'cmdk';
import {
  ArrowLeft,
  ArrowRight,
  CalendarCheck,
  CalendarDays,
  CalendarRange,
  CornerDownLeft,
  LayoutGrid,
  CalendarFold,
  Grid3x3,
  Settings,
  Monitor,
  Moon,
  Plus,
  Rows3,
  Sun,
  Wand2,
} from 'lucide-react';
import { Item, fmtRange, fromISODate, hueOf, MONTHS } from '../lib/prep';
import { Kbd } from './Kbd';
import { useRestoreFocus } from './hooks';

export type Theme = 'system' | 'light' | 'dark';

type Props = {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  items: Item[];
  hasItems: boolean;
  actions: {
    newTask: () => void;
    planMonth: () => void;
    sampleWeek: () => void;
    today: () => void;
    prev: () => void;
    next: () => void;
    setView: (v: 'day' | 'week' | 'month' | 'season' | 'year') => void;
    openSettings: () => void;
    setTheme: (t: Theme) => void;
    openItem: (it: Item) => void;
  };
};

const itemCls =
  'group flex h-10 cursor-pointer items-center gap-3 rounded-lg px-3 text-[13.5px] text-fg outline-none data-[selected=true]:bg-subtle';

export function CommandPalette({ open, onOpenChange, items, hasItems, actions }: Props) {
  useRestoreFocus(open);
  const run = (fn: () => void) => () => {
    onOpenChange(false);
    // let the dialog close before the action opens another one
    setTimeout(fn, 60);
  };

  return (
    <Command.Dialog
      open={open}
      onOpenChange={onOpenChange}
      label="Command menu"
      // Every typed word must appear in the item (or its keywords). cmdk's default is a loose
      // letters-in-order match that lets "late night" match unrelated long titles.
      filter={(value, search, keywords) => {
        const hay = `${value} ${(keywords ?? []).join(' ')}`.toLowerCase();
        const words = search.toLowerCase().split(/\s+/).filter(Boolean);
        if (!words.length) return 1;
        return words.every((w) => hay.includes(w)) ? (hay.startsWith(words[0]) ? 1 : 0.6) : 0;
      }}
      overlayClassName="fixed inset-0 z-50 bg-black/30 backdrop-blur-[2px] data-[state=open]:animate-fade-in"
      contentClassName="fixed left-1/2 top-[14vh] z-50 w-[min(580px,calc(100vw-24px))] -translate-x-1/2 overflow-hidden rounded-2xl bg-surface shadow-pop outline-none data-[state=open]:animate-pop-in"
    >
      <div className="border-b border-line">
        <Command.Input
          autoFocus
          placeholder="Type a command or search your tasks…"
          className="h-14 w-full bg-transparent px-5 text-[15px] outline-none placeholder:text-faint"
        />
      </div>
      <Command.List className="thin-scroll max-h-[min(420px,60vh)] overflow-y-auto p-2">
        <Command.Empty className="px-4 py-10 text-center text-[13px] text-muted">Nothing matches that.</Command.Empty>

        <Command.Group heading="Actions" className="[&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:pb-1 [&_[cmdk-group-heading]]:pt-2 [&_[cmdk-group-heading]]:text-[11px] [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-wider [&_[cmdk-group-heading]]:text-faint">
          <Command.Item className={itemCls} onSelect={run(actions.newTask)} keywords={['add', 'create', 'task']}>
            <Plus className="size-4 text-muted" /> New task
            <Kbd className="ml-auto">N</Kbd>
          </Command.Item>
          <Command.Item className={itemCls} onSelect={run(actions.planMonth)} keywords={['generate', 'plan', 'month', 'ai']}>
            <Wand2 className="size-4 text-muted" /> Plan the next 3 weeks <Kbd className="ml-auto">P</Kbd>
          </Command.Item>
          <Command.Item className={itemCls} onSelect={run(actions.openSettings)} keywords={['settings', 'preferences', 'export', 'import', 'backup', 'ics', 'csv', 'weather']}>
            <Settings className="size-4 text-muted" /> Settings, export and import <Kbd className="ml-auto">,</Kbd>
          </Command.Item>
          {!hasItems && (
            <Command.Item className={itemCls} onSelect={run(actions.sampleWeek)} keywords={['demo', 'example', 'try']}>
              <CalendarCheck className="size-4 text-muted" /> Try a sample week
            </Command.Item>
          )}
        </Command.Group>

        <Command.Group heading="Navigate" className="[&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:pb-1 [&_[cmdk-group-heading]]:pt-3 [&_[cmdk-group-heading]]:text-[11px] [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-wider [&_[cmdk-group-heading]]:text-faint">
          <Command.Item className={itemCls} onSelect={run(actions.today)} keywords={['now', 'current']}>
            <CornerDownLeft className="size-4 text-muted" /> Go to today <Kbd className="ml-auto">T</Kbd>
          </Command.Item>
          <Command.Item className={itemCls} onSelect={run(actions.prev)}>
            <ArrowLeft className="size-4 text-muted" /> Previous <Kbd className="ml-auto">←</Kbd>
          </Command.Item>
          <Command.Item className={itemCls} onSelect={run(actions.next)}>
            <ArrowRight className="size-4 text-muted" /> Next <Kbd className="ml-auto">→</Kbd>
          </Command.Item>
        </Command.Group>

        <Command.Group heading="View" className="[&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:pb-1 [&_[cmdk-group-heading]]:pt-3 [&_[cmdk-group-heading]]:text-[11px] [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-wider [&_[cmdk-group-heading]]:text-faint">
          <Command.Item className={itemCls} onSelect={run(() => actions.setView('day'))} keywords={['view', 'day']}>
            <Rows3 className="size-4 text-muted" /> Day view <Kbd className="ml-auto">D</Kbd>
          </Command.Item>
          <Command.Item className={itemCls} onSelect={run(() => actions.setView('week'))} keywords={['view', 'week']}>
            <CalendarRange className="size-4 text-muted" /> Week view <Kbd className="ml-auto">W</Kbd>
          </Command.Item>
          <Command.Item className={itemCls} onSelect={run(() => actions.setView('month'))} keywords={['view', 'month']}>
            <LayoutGrid className="size-4 text-muted" /> Month view <Kbd className="ml-auto">M</Kbd>
          </Command.Item>
          <Command.Item className={itemCls} onSelect={run(() => actions.setView('season'))} keywords={['view', 'season', 'quarter']}>
            <CalendarFold className="size-4 text-muted" /> Season view <Kbd className="ml-auto">S</Kbd>
          </Command.Item>
          <Command.Item className={itemCls} onSelect={run(() => actions.setView('year'))} keywords={['view', 'year', 'overview']}>
            <Grid3x3 className="size-4 text-muted" /> Year view <Kbd className="ml-auto">Y</Kbd>
          </Command.Item>
        </Command.Group>

        <Command.Group heading="Theme" className="[&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:pb-1 [&_[cmdk-group-heading]]:pt-3 [&_[cmdk-group-heading]]:text-[11px] [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-wider [&_[cmdk-group-heading]]:text-faint">
          <Command.Item className={itemCls} onSelect={run(() => actions.setTheme('light'))} keywords={['theme', 'light', 'appearance']}>
            <Sun className="size-4 text-muted" /> Light
          </Command.Item>
          <Command.Item className={itemCls} onSelect={run(() => actions.setTheme('dark'))} keywords={['theme', 'dark', 'appearance']}>
            <Moon className="size-4 text-muted" /> Dark
          </Command.Item>
          <Command.Item className={itemCls} onSelect={run(() => actions.setTheme('system'))} keywords={['theme', 'system', 'auto', 'appearance']}>
            <Monitor className="size-4 text-muted" /> Match system
          </Command.Item>
        </Command.Group>

        {items.length > 0 && (
          <Command.Group heading="Tasks" className="[&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:pb-1 [&_[cmdk-group-heading]]:pt-3 [&_[cmdk-group-heading]]:text-[11px] [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-wider [&_[cmdk-group-heading]]:text-faint">
            {items.slice(0, 200).map((t) => {
              const d = fromISODate(t.date);
              return (
                <Command.Item
                  key={t.id}
                  value={`${t.title} ${t.label} ${t.date}`}
                  className={itemCls}
                  onSelect={run(() => actions.openItem(t))}
                >
                  <span className="size-2 shrink-0 rounded-full" style={{ background: hueOf(t.color) }} />
                  <span className="truncate">{t.title}</span>
                  <span className="tabular ml-auto shrink-0 font-mono text-[11.5px] text-faint">
                    {MONTHS[d.getMonth()].slice(0, 3)} {d.getDate()} · {fmtRange(t.startHour, t.endHour)}
                  </span>
                </Command.Item>
              );
            })}
          </Command.Group>
        )}
      </Command.List>
      <div className="flex items-center gap-4 border-t border-line px-4 py-2.5 text-[11.5px] text-faint">
        <span className="inline-flex items-center gap-1.5"><Kbd>↑</Kbd><Kbd>↓</Kbd> navigate</span>
        <span className="inline-flex items-center gap-1.5"><Kbd>↵</Kbd> select</span>
        <span className="ml-auto inline-flex items-center gap-1.5"><Kbd>esc</Kbd> close</span>
      </div>
    </Command.Dialog>
  );
}
