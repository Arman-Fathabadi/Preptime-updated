import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import * as Dialog from '@radix-ui/react-dialog';
import { AnimatePresence, motion } from 'framer-motion';
import { toast } from 'sonner';
import { ChevronLeft, ChevronRight, Menu, Plus, Search, Wand2 } from 'lucide-react';
import {
  Item,
  MONTHS,
  ViewKind,
  addDays,
  addMonths,
  buildGenerationRequest,
  fromISODate,
  hhmmToHour,
  hourToHhmm,
  isPlanned,
  itemsFromGeneration,
  mondayOf,
  isToday,
  startOfDay,
  toISODate,
  usePrepStore,
  weekTitle,
} from '../lib/prep';
import { Draft, TaskDialog, draftFromItem } from '../ui/TaskDialog';
import { CommandPalette, Theme } from '../ui/CommandPalette';
import { PlanMonth } from '../ui/PlanMonth';
import { Sidebar, Logo } from '../ui/Sidebar';
import { TimeGrid } from '../ui/TimeGrid';
import { MonthView } from '../ui/MonthView';
import { EmptyState } from '../ui/EmptyState';
import { Segmented } from '../ui/Segmented';
import { Kbd } from '../ui/Kbd';
import { useMediaQuery, useNow, useStoredState } from '../ui/hooks';
import { cn } from '../ui/cn';

const VIEWS: { value: ViewKind; label: string }[] = [
  { value: 'day', label: 'Day' },
  { value: 'week', label: 'Week' },
  { value: 'month', label: 'Month' },
];

const longDay = (d: Date) => d.toLocaleString('en', { weekday: 'long', month: 'long', day: 'numeric' });

export default function Home() {
  const router = useRouter();
  const store = usePrepStore();
  const now = useNow();
  const narrow = useMediaQuery('(max-width: 767px)');
  const wide = useMediaQuery('(min-width: 1024px)');

  const [storedView, setStoredView] = useStoredState<string>('preptime-view', 'week');
  const [theme, setThemeState] = useStoredState<Theme>('preptime-theme', 'system');
  const view: ViewKind = storedView === 'day' ? 'day' : storedView === 'month' || storedView === 'season' || storedView === 'year' ? 'month' : 'week';
  const effectiveView: ViewKind = narrow && view === 'week' ? 'day' : view;

  const [cursor, setCursor] = useState<Date>(() => startOfDay(new Date()));
  const dirRef = useRef(1);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [planOpen, setPlanOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  /* ---- auth + backend wake-up --------------------------------------- */
  useEffect(() => {
    if (!store.loaded) return;
    if (!store.username) {
      router.replace('/login');
      return;
    }
    // The free backend sleeps when idle: wake it now and keep it warm while the tab is open.
    fetch('/api/health').catch(() => {});
    const id = setInterval(() => fetch('/api/health').catch(() => {}), 240_000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [store.loaded, store.username]);

  // Forget a picked task that no longer exists.
  useEffect(() => {
    if (store.loaded && store.activeId && !store.items.some((t) => t.id === store.activeId)) store.setActiveId(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [store.loaded, store.activeId, store.items]);

  /* ---- theme -------------------------------------------------------- */
  useEffect(() => {
    const apply = () => {
      const dark = theme === 'dark' || (theme === 'system' && matchMedia('(prefers-color-scheme: dark)').matches);
      document.documentElement.classList.toggle('dark', dark);
    };
    apply();
    if (theme !== 'system') return;
    const m = matchMedia('(prefers-color-scheme: dark)');
    m.addEventListener('change', apply);
    return () => m.removeEventListener('change', apply);
  }, [theme]);

  /* ---- navigation --------------------------------------------------- */
  const go = useCallback((d: Date, dir?: number) => {
    setCursor((prev) => {
      dirRef.current = dir ?? (d.getTime() >= prev.getTime() ? 1 : -1);
      return startOfDay(d);
    });
  }, []);

  const step = useCallback(
    (sign: 1 | -1) => {
      go(effectiveView === 'month' ? addMonths(cursor, sign) : addDays(cursor, sign * (effectiveView === 'week' ? 7 : 1)), sign);
    },
    [cursor, effectiveView, go]
  );

  const setView = (v: ViewKind) => setStoredView(v);

  const monday = mondayOf(cursor);
  const dates = useMemo(
    () => (effectiveView === 'day' ? [cursor] : Array.from({ length: 7 }, (_, i) => addDays(monday, i))),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [effectiveView, cursor.getTime()]
  );

  const title =
    effectiveView === 'day'
      ? longDay(cursor)
      : effectiveView === 'week'
        ? weekTitle(monday)
        : `${MONTHS[cursor.getMonth()]} ${cursor.getFullYear()}`;

  /* ---- editing ------------------------------------------------------ */
  const openCreate = useCallback(
    (date: Date, start = 9, end = 10) => {
      setDraft({ title: '', date: toISODate(date), start: hourToHhmm(start), end: hourToHhmm(Math.min(end, 23.9833)), label: '', color: 'bg-blue-500', description: '' });
      setDialogOpen(true);
    },
    []
  );
  const openEdit = useCallback((it: Item) => {
    setDraft(draftFromItem(it));
    setDialogOpen(true);
  }, []);

  const saveDraft = (d: Draft) => {
    const patch = {
      title: d.title,
      date: d.date,
      startHour: hhmmToHour(d.start),
      endHour: hhmmToHour(d.end),
      label: d.label,
      color: d.color,
      description: d.description,
      focus: d.focus,
    };
    if (d.id) store.update(d.id, patch);
    else store.add(patch);
    setDialogOpen(false);
  };

  const deleteItem = (id: string) => {
    const removed = store.items.find((t) => t.id === id);
    store.remove(id);
    setDialogOpen(false);
    if (removed) {
      toast('Task deleted', {
        description: removed.title,
        action: { label: 'Undo', onClick: () => store.add({ ...removed }) },
      });
    }
  };

  /* ---- planning the month ------------------------------------------ */
  const nextMonday = addDays(monday, 7);
  const weekItems = store.items.filter((t) => {
    const d = fromISODate(t.date);
    return d >= monday && d < nextMonday;
  });
  const replacing = store.items.filter((t) => isPlanned(t) && fromISODate(t.date) >= nextMonday).length;

  const planMonth = async () => {
    const body = buildGenerationRequest(store.items, monday, store.prefs);
    const res = await fetch('/api/generate-month', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    if (!res.ok) {
      let msg = 'The planner is not responding. It may be waking up, so try again in a moment.';
      if (res.status === 429) msg = 'Too many requests. Please wait a minute and try again.';
      else {
        try {
          const j = await res.json();
          if (j?.details) msg = String(j.details);
        } catch {
          /* keep default */
        }
      }
      throw new Error(msg);
    }
    const result = await res.json();
    const created = itemsFromGeneration(result);
    if (created.length === 0) throw new Error('The planner returned an empty plan. Add a few more tasks to this week and try again.');
    const snapshot = store.items;
    store.replaceAll([...snapshot.filter((t) => !(isPlanned(t) && fromISODate(t.date) >= nextMonday)), ...created]);
    go(nextMonday, 1);
    toast.success(`Planned ${created.length} tasks`, {
      description: `${weekTitle(nextMonday)} and the two weeks after`,
      action: { label: 'Undo', onClick: () => store.replaceAll(snapshot) },
    });
  };

  const addSample = () => {
    const made = store.addSampleWeek(monday);
    toast.success('Sample week added', { description: `${made.length} tasks. Try "Plan the next 3 weeks" next.` });
  };

  const signOut = () => {
    localStorage.removeItem('preptime-username');
    router.push('/login');
  };

  /* ---- keyboard ----------------------------------------------------- */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setPaletteOpen((o) => !o);
        return;
      }
      const t = e.target as HTMLElement;
      if (t.closest('input, textarea, select, [contenteditable], [role=dialog]') || e.metaKey || e.ctrlKey || e.altKey) return;
      if (dialogOpen || paletteOpen || planOpen) return;
      switch (e.key.toLowerCase()) {
        case 'n':
          e.preventDefault();
          openCreate(cursor, Math.max(7, Math.ceil((now?.getHours() ?? 8) + 0.01)), Math.max(8, Math.ceil((now?.getHours() ?? 8) + 0.01) + 1));
          break;
        case 't':
          go(new Date());
          break;
        case 'd':
          setView('day');
          break;
        case 'w':
          setView('week');
          break;
        case 'm':
          setView('month');
          break;
        case 'p':
          setPlanOpen(true);
          break;
        case 'arrowleft':
          step(-1);
          break;
        case 'arrowright':
          step(1);
          break;
        case '/':
          e.preventDefault();
          setPaletteOpen(true);
          break;
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dialogOpen, paletteOpen, planOpen, cursor, now, step]);

  /* ---- render ------------------------------------------------------- */
  const dayItems = store.byDate.get(toISODate(cursor)) ?? [];

  // Focus timer target: the task you picked, otherwise whatever is happening right now.
  const nowH = now ? now.getHours() + now.getMinutes() / 60 : -1;
  const todayItems = store.byDate.get(toISODate(now ?? new Date())) ?? [];
  const runningNow = todayItems.find((t) => !t.completed && t.startHour <= nowH && nowH < t.endHour) ?? null;
  const picked = store.activeId ? store.items.find((t) => t.id === store.activeId) ?? null : null;
  const focusItem = picked ?? runningNow;
  const upNext = todayItems.find((t) => !t.completed && t.startHour > nowH) ?? null;
  const empty = store.loaded && store.items.length === 0;
  const viewKey = `${effectiveView}-${effectiveView === 'month' ? `${cursor.getFullYear()}-${cursor.getMonth()}` : toISODate(effectiveView === 'week' ? monday : cursor)}`;

  const sidebar = (
    <Sidebar
      username={store.username}
      now={now}
      selected={cursor}
      byDate={store.byDate}
      dayItems={dayItems}
      theme={theme}
      onTheme={setThemeState}
      onSelectDate={(d) => {
        go(d);
        setDrawerOpen(false);
      }}
      onOpenItem={openEdit}
      onToggleItem={store.toggle}
      onSignOut={signOut}
      focusItem={focusItem}
      focusAuto={!picked && !!runningNow}
      upNext={upNext}
      activeId={store.activeId}
      onSelect={(id) => store.setActiveId(store.activeId === id ? null : id)}
      onClearActive={() => store.setActiveId(null)}
      onChangeFocus={(focus) => focusItem && store.update(focusItem.id, { focus })}
      onMarkDone={() => focusItem && !focusItem.completed && store.toggle(focusItem.id)}
    />
  );

  if (!store.loaded || !store.username) {
    return <div className="grid h-dvh place-items-center bg-bg"><Logo className="animate-pulse" /></div>;
  }

  return (
    <div className="flex h-dvh overflow-hidden bg-bg text-fg">
      {wide && sidebar}

      <Dialog.Root open={drawerOpen && !wide} onOpenChange={setDrawerOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-black/30 data-[state=open]:animate-fade-in" />
          <Dialog.Content aria-describedby={undefined} className="fixed inset-y-0 left-0 z-50 outline-none data-[state=open]:animate-fade-in">
            <Dialog.Title className="sr-only">Menu</Dialog.Title>
            {sidebar}
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      <main className="flex min-w-0 flex-1 flex-col">
        {/* Top bar */}
        <header className="flex h-14 shrink-0 items-center gap-2 border-b border-border bg-surface px-3 sm:px-5">
          {!wide && (
            <button onClick={() => setDrawerOpen(true)} aria-label="Open menu" className="grid size-8 place-items-center rounded-lg text-muted transition hover:bg-subtle hover:text-fg">
              <Menu className="size-[18px]" />
            </button>
          )}

          <div className="relative h-8 min-w-0 flex-1 overflow-hidden sm:flex-none sm:basis-[300px]">
            <AnimatePresence mode="popLayout" initial={false} custom={dirRef.current}>
              <motion.h1
                key={title}
                initial={{ opacity: 0, y: 10 * dirRef.current, filter: 'blur(3px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                exit={{ opacity: 0, y: -10 * dirRef.current, filter: 'blur(3px)' }}
                transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
                className="absolute inset-0 flex items-center truncate text-[17px] font-semibold tracking-tight"
              >
                {title}
              </motion.h1>
            </AnimatePresence>
          </div>

          <div className="flex items-center gap-1">
            <button onClick={() => go(new Date())} className="h-8 rounded-lg border border-border px-3 text-[13px] font-medium transition hover:bg-subtle active:scale-[0.98]">
              Today
            </button>
            <button onClick={() => step(-1)} aria-label="Previous" className="grid size-8 place-items-center rounded-lg text-muted transition hover:bg-subtle hover:text-fg active:scale-95">
              <ChevronLeft className="size-[18px]" />
            </button>
            <button onClick={() => step(1)} aria-label="Next" className="grid size-8 place-items-center rounded-lg text-muted transition hover:bg-subtle hover:text-fg active:scale-95">
              <ChevronRight className="size-[18px]" />
            </button>
          </div>

          <div className="ml-auto flex items-center gap-2">
            <div className="hidden sm:block">
              <Segmented<ViewKind> id="view" ariaLabel="View" value={view} onChange={setView} options={VIEWS} />
            </div>

            <button
              onClick={() => setPaletteOpen(true)}
              className="hidden h-8 items-center gap-2 rounded-lg border border-border px-2.5 text-[13px] text-muted transition hover:bg-subtle hover:text-fg md:inline-flex"
            >
              <Search className="size-3.5" />
              <span className="hidden xl:inline">Search</span>
              <Kbd>⌘K</Kbd>
            </button>

            <button
              onClick={() => setPlanOpen(true)}
              className="inline-flex h-8 items-center gap-2 rounded-lg border border-border px-2.5 text-[13px] font-medium transition hover:bg-subtle active:scale-[0.98]"
              title="Plan the next three weeks (P)"
            >
              <Wand2 className="size-4 text-muted" />
              <span className="hidden lg:inline">Plan month</span>
            </button>

            <button
              onClick={() => openCreate(cursor, Math.max(7, Math.ceil((now?.getHours() ?? 8) + 0.01)), Math.max(8, Math.ceil((now?.getHours() ?? 8) + 0.01) + 1))}
              className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-ink pl-2.5 pr-3 text-[13px] font-medium text-ink-fg transition hover:opacity-90 active:scale-[0.98]"
            >
              <Plus className="size-4" strokeWidth={2.4} />
              <span>New</span>
            </button>
          </div>
        </header>

        {/* Mobile view switch */}
        <div className="flex shrink-0 justify-center border-b border-border bg-surface py-2 sm:hidden">
          <Segmented<ViewKind> id="view-m" ariaLabel="View" value={view} onChange={setView} options={VIEWS} />
        </div>

        {/* View */}
        <div className="relative min-h-0 flex-1 bg-surface">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={viewKey}
              initial={{ opacity: 0, x: 14 * dirRef.current }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -14 * dirRef.current }}
              transition={{ duration: 0.16, ease: [0.23, 1, 0.32, 1] }}
              className="h-full"
            >
              {effectiveView === 'month' ? (
                <MonthView
                  month={cursor}
                  byDate={store.byDate}
                  onPickDay={(d) => {
                    go(d);
                    setView('day');
                  }}
                  onOpen={openEdit}
                  onCreate={(d) => openCreate(d)}
                />
              ) : (
                <div className={cn('h-full', effectiveView === 'day' && 'mx-auto max-w-[920px] border-x border-line')}>
                <TimeGrid
                  dates={dates}
                  byDate={store.byDate}
                  prefs={store.prefs}
                  now={now}
                  onCreate={openCreate}
                  onOpen={openEdit}
                  onToggle={store.toggle}
                  onChange={store.update}
                  activeId={store.activeId}
                  onPickDay={effectiveView === 'week' ? (d) => { go(d); setView('day'); } : undefined}
                />
                </div>
              )}
            </motion.div>
          </AnimatePresence>
          {empty && <EmptyState onAdd={() => openCreate(cursor, 9, 10)} onSample={addSample} />}
        </div>
      </main>

      <TaskDialog
        open={dialogOpen}
        draft={draft}
        onClose={() => setDialogOpen(false)}
        onSave={saveDraft}
        onDelete={deleteItem}
        onFocus={(id) => {
          const it = store.items.find((t) => t.id === id);
          store.setActiveId(id);
          setDialogOpen(false);
          if (it) go(fromISODate(it.date));
          toast('Focus timer set', { description: it?.title });
        }}
      />

      <PlanMonth
        open={planOpen}
        onOpenChange={setPlanOpen}
        count={weekItems.length}
        weekLabel={weekTitle(monday)}
        nextLabel={nextMonday.toLocaleString('en', { weekday: 'short', month: 'short', day: 'numeric' })}
        replacing={replacing}
        onConfirm={planMonth}
      />

      <CommandPalette
        open={paletteOpen}
        onOpenChange={setPaletteOpen}
        items={store.items}
        hasItems={store.items.length > 0}
        actions={{
          newTask: () => openCreate(cursor, 9, 10),
          planMonth: () => setPlanOpen(true),
          sampleWeek: addSample,
          today: () => go(new Date()),
          prev: () => step(-1),
          next: () => step(1),
          setView,
          setTheme: setThemeState,
          openItem: (it) => {
            go(fromISODate(it.date));
            openEdit(it);
          },
        }}
      />
    </div>
  );
}
