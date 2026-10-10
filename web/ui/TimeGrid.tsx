import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Item, Prefs, WEEKDAYS_SHORT, fmtHour, fmtRange, isToday, layoutDay, toISODate } from '../lib/prep';
import { EventCard } from './EventCard';
import { cn } from './cn';

export const HOUR_PX = 56;
const SNAP = 0.25; // 15 minutes
const MIN_LEN = 0.25;
const GUTTER_PX = 56;

const snap = (h: number) => Math.round(h / SNAP) * SNAP;
const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

type Draft = { col: number; a: number; b: number };
type Drag = {
  id: string;
  mode: 'move' | 'resize';
  startX: number;
  startY: number;
  origCol: number;
  origStart: number;
  origEnd: number;
  col: number;
  start: number;
  end: number;
  moved: boolean;
};

/**
 * The shared day/week time grid. Click an empty slot to add, drag on empty space to
 * choose a range, drag an event to move it (also across days) and drag its bottom edge
 * to resize. Everything snaps to 15 minutes.
 */
export function TimeGrid({
  dates,
  byDate,
  prefs,
  now,
  onCreate,
  onOpen,
  onToggle,
  onChange,
  onPickDay,
  activeId,
}: {
  dates: Date[];
  byDate: Map<string, Item[]>;
  prefs: Prefs;
  now: Date | null;
  onCreate: (date: Date, start: number, end: number) => void;
  onOpen: (item: Item) => void;
  onToggle: (id: string) => void;
  onChange: (id: string, patch: Partial<Item>) => void;
  onPickDay?: (d: Date) => void;
  activeId?: string | null;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const colsRef = useRef<HTMLDivElement>(null);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [drag, setDrag] = useState<Drag | null>(null);
  const suppressClick = useRef(false);
  const n = dates.length;
  const [colPx, setColPx] = useState(200);
  useEffect(() => {
    const el = colsRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setColPx(el.getBoundingClientRect().width / n));
    ro.observe(el);
    return () => ro.disconnect();
  }, [n]);
  // How many cards can sit side by side and still be readable.
  const MIN_CARD_PX = 68;

  // Open on the working day, not on midnight. If today is in view, start a little before now.
  useLayoutEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const today = dates.some(isToday);
    const nowH = now ? now.getHours() + now.getMinutes() / 60 : prefs.dayStartHour;
    const inDay = nowH >= prefs.dayStartHour && nowH <= prefs.dayEndHour;
    // Today and inside the working day: keep "now" in view. Otherwise open at the start of the day.
    const target = today && inDay ? Math.max(prefs.dayStartHour - 0.5, nowH - 2) : prefs.dayStartHour - 0.5;
    el.scrollTop = Math.max(0, target * HOUR_PX);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dates[0]?.getTime(), n]);

  const hourAt = useCallback((clientY: number, colEl: Element) => {
    const rect = colEl.getBoundingClientRect();
    return clamp((clientY - rect.top) / HOUR_PX, 0, 24);
  }, []);

  const colIndexAt = useCallback(
    (clientX: number) => {
      const rect = colsRef.current?.getBoundingClientRect();
      if (!rect) return 0;
      return clamp(Math.floor(((clientX - rect.left) / rect.width) * n), 0, n - 1);
    },
    [n]
  );

  /* ---- create by click / drag on empty space ------------------------- */
  const onColumnPointerDown = (e: React.PointerEvent<HTMLDivElement>, col: number) => {
    if (e.button !== 0) return;
    if ((e.target as HTMLElement).closest('[data-event]')) return;
    const colEl = e.currentTarget;
    colEl.setPointerCapture(e.pointerId);
    const startY = e.clientY;
    const t0 = performance.now();
    const h0 = snap(hourAt(e.clientY, colEl));
    let moved = false;
    setDraft({ col, a: h0, b: h0 });

    const move = (ev: PointerEvent) => {
      if (Math.abs(ev.clientY - startY) > 5) moved = true;
      if (moved) setDraft({ col, a: h0, b: snap(hourAt(ev.clientY, colEl)) });
    };
    const up = (ev: PointerEvent) => {
      colEl.removeEventListener('pointermove', move);
      colEl.removeEventListener('pointerup', up);
      colEl.removeEventListener('pointercancel', cancel);
      const h1 = snap(hourAt(ev.clientY, colEl));
      setDraft(null);
      if (!moved && performance.now() - t0 < 400) {
        const start = clamp(Math.floor(hourAt(ev.clientY, colEl) * 2) / 2, 0, 23);
        onCreate(dates[col], start, Math.min(24, start + 1));
      } else {
        const a = Math.min(h0, h1);
        const b = Math.max(h0, h1, a + 0.5);
        onCreate(dates[col], a, Math.min(24, b));
      }
    };
    const cancel = () => {
      colEl.removeEventListener('pointermove', move);
      colEl.removeEventListener('pointerup', up);
      colEl.removeEventListener('pointercancel', cancel);
      setDraft(null);
    };
    colEl.addEventListener('pointermove', move);
    colEl.addEventListener('pointerup', up);
    colEl.addEventListener('pointercancel', cancel);
  };

  /* ---- move / resize an event ---------------------------------------- */
  const beginDrag = (e: React.PointerEvent, item: Item, col: number, mode: 'move' | 'resize') => {
    if (e.button !== 0) return;
    e.stopPropagation();
    // Listen on window: a move across days re-parents the card, which would drop element-level capture.
    const base: Drag = {
      id: item.id,
      mode,
      startX: e.clientX,
      startY: e.clientY,
      origCol: col,
      origStart: item.startHour,
      origEnd: item.endHour,
      col,
      start: item.startHour,
      end: item.endHour,
      moved: false,
    };
    let cur = base;
    setDrag(base);

    const move = (ev: PointerEvent) => {
      const dy = (ev.clientY - base.startY) / HOUR_PX;
      const moved = cur.moved || Math.abs(ev.clientY - base.startY) > 4 || Math.abs(ev.clientX - base.startX) > 4;
      if (mode === 'move') {
        const len = base.origEnd - base.origStart;
        const start = clamp(snap(base.origStart + dy), 0, 24 - len);
        cur = { ...base, moved, col: colIndexAt(ev.clientX), start, end: start + len };
      } else {
        cur = { ...base, moved, end: clamp(snap(base.origEnd + dy), base.origStart + MIN_LEN, 24) };
      }
      setDrag(cur);
    };
    const finish = (commit: boolean) => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
      window.removeEventListener('pointercancel', cancel);
      setDrag(null);
      if (commit && cur.moved) {
        suppressClick.current = true;
        setTimeout(() => (suppressClick.current = false), 0);
        const patch: Partial<Item> = { startHour: cur.start, endHour: cur.end };
        if (mode === 'move') patch.date = toISODate(dates[cur.col]);
        onChange(item.id, patch);
      }
    };
    const up = () => finish(true);
    const cancel = () => finish(false);
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
    window.addEventListener('pointercancel', cancel);
  };

  /* ---- per-column layout (with the live drag preview applied) -------- */
  const columns = useMemo(() => {
    return dates.map((d, col) => {
      let list = (byDate.get(toISODate(d)) ?? []).filter((t) => !(drag && t.id === drag.id));
      const items = [...list];
      if (drag && drag.col === col) {
        const original = Array.from(byDate.values()).flat().find((t) => t.id === drag.id);
        if (original) items.push({ ...original, startHour: drag.start, endHour: drag.end });
      }
      return layoutDay(items);
    });
  }, [dates, byDate, drag]);

  const nowHour = now ? now.getHours() + now.getMinutes() / 60 : null;
  const offTop = prefs.dayStartHour * HOUR_PX;
  const offBottom = (24 - prefs.dayEndHour) * HOUR_PX;

  return (
    <div className="flex h-full min-h-0 flex-col">
      {/* Day header */}
      <div className="grid shrink-0 border-b border-line bg-surface pr-[10px]" style={{ gridTemplateColumns: `${GUTTER_PX}px repeat(${n}, minmax(0, 1fr))` }}>
        <div />
        {dates.map((d, i) => {
          const today = isToday(d);
          const wd = WEEKDAYS_SHORT[(d.getDay() + 6) % 7];
          return (
            <button
              key={i}
              onClick={() => onPickDay?.(d)}
              className={cn(
                'group flex items-center justify-center gap-2 border-l border-line py-2.5 transition-colors',
                onPickDay ? 'hover:bg-subtle/70' : 'cursor-default'
              )}
            >
              <span className={cn('text-[11px] font-medium uppercase tracking-[0.08em]', today ? 'text-accent' : 'text-muted')}>{wd}</span>
              <span
                className={cn(
                  'tabular grid size-7 place-items-center rounded-full text-[14px] font-medium transition-colors',
                  today ? 'bg-accent text-accent-fg' : 'text-fg group-hover:bg-subtle'
                )}
              >
                {d.getDate()}
              </span>
            </button>
          );
        })}
      </div>

      {/* Scrollable hours */}
      <div ref={scrollRef} className="thin-scroll relative min-h-0 flex-1 overflow-y-scroll overscroll-contain bg-surface">
        <div className="relative grid" style={{ gridTemplateColumns: `${GUTTER_PX}px repeat(${n}, minmax(0, 1fr))`, height: 24 * HOUR_PX }}>
          {/* hour labels */}
          <div className="relative">
            {Array.from({ length: 23 }, (_, i) => i + 1).map((h) => (
              <div
                key={h}
                className="tabular absolute right-2 -translate-y-1/2 font-mono text-[10.5px] text-faint"
                style={{ top: h * HOUR_PX }}
              >
                {fmtHour(h)}
              </div>
            ))}
          </div>

          {/* day columns */}
          <div ref={colsRef} className="relative col-span-full col-start-2 grid" style={{ gridTemplateColumns: `repeat(${n}, minmax(0, 1fr))`, gridColumn: '2 / -1' }}>
            {dates.map((d, col) => {
              const today = isToday(d);
              return (
                <div
                  key={col}
                  onPointerDown={(e) => onColumnPointerDown(e, col)}
                  className="relative touch-pan-y select-none border-l border-line"
                  style={{
                    backgroundImage: `repeating-linear-gradient(to bottom, transparent 0, transparent ${HOUR_PX - 1}px, rgb(var(--line)) ${HOUR_PX - 1}px, rgb(var(--line)) ${HOUR_PX}px)`,
                    cursor: drag ? (drag.mode === 'resize' ? 'ns-resize' : 'grabbing') : 'cell',
                  }}
                >
                  {/* hours outside the working day are quietly dimmed */}
                  <div className="pointer-events-none absolute inset-x-0 top-0 bg-subtle/55" style={{ height: offTop }} />
                  <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-subtle/55" style={{ height: offBottom }} />

                  {(() => {
                    // Start groups wider than the column can show collapse into a "+N" chip.
                    const fit = Math.max(1, Math.floor((colPx - 4 - 14 * 2) / MIN_CARD_PX));
                    const sizes = new Map<number, number>();
                    columns[col].forEach((p) => sizes.set(p.group, p.cols));
                    const chips: { group: number; top: number; left: number; width: number; hidden: Item[]; indent: number }[] = [];
                    columns[col].forEach((p) => {
                      if (p.cols > fit && p.col >= fit - 1) {
                        let chip = chips.find((c) => c.group === p.group);
                        if (!chip) {
                          chip = { group: p.group, top: p.item.startHour, left: fit - 1, width: fit, hidden: [], indent: p.indent };
                          chips.push(chip);
                        }
                        chip.hidden.push(p.item);
                        chip.top = Math.min(chip.top, p.item.startHour);
                      }
                    });
                    return chips.map((c) => {
                      const inset = 2 + c.indent * 14;
                      return (
                        <button
                          key={`chip-${c.group}`}
                          data-event
                          onPointerDown={(e) => e.stopPropagation()}
                          onClick={(e) => {
                            e.stopPropagation();
                            onPickDay?.(dates[col]);
                          }}
                          title={c.hidden.map((h) => h.title).join(', ')}
                          className="absolute z-20 flex h-7 items-center justify-center rounded-md border border-border bg-surface text-[11.5px] font-semibold text-muted shadow-card transition hover:text-fg"
                          style={{
                            top: c.top * HOUR_PX + 1,
                            left: `calc(${inset}px + (100% - ${inset + 3}px) * ${c.left} / ${c.width})`,
                            width: `calc((100% - ${inset + 3}px) / ${c.width} - 2px)`,
                          }}
                        >
                          +{c.hidden.length}
                        </button>
                      );
                    });
                  })()}

                  {columns[col].map((p, i) => {
                    const fit = Math.max(1, Math.floor((colPx - 4 - 14 * 2) / MIN_CARD_PX));
                    if (p.cols > fit && p.col >= fit - 1) return null; // shown in the "+N" chip
                    const shownCols = Math.min(p.cols, fit);
                    const it = p.item;
                    const len = it.endHour - it.startHour;
                    const compact = len < 0.75;
                    const top = it.startHour * HOUR_PX;
                    const height = Math.max(len * HOUR_PX, 18) - 2;
                    // Cascade: each level is nudged right; items in the same start group share the rest.
                    const STEP = 14;
                    const inset = 2 + p.indent * STEP;
                    const isDragging = drag?.id === it.id;
                    return (
                      <EventCard
                        key={it.id}
                        item={it}
                        index={i}
                        compact={compact}
                        dragging={isDragging && drag?.moved}
                        active={activeId === it.id}
                        style={{
                          top: top + 1,
                          height,
                          left: `calc(${inset}px + (100% - ${inset + 3}px) * ${p.col} / ${shownCols})`,
                          width: `calc((100% - ${inset + 3}px) / ${shownCols} - ${shownCols > 1 ? 2 : 0}px)`,
                          ['--z' as string]: 1 + p.indent,
                          cursor: isDragging ? 'grabbing' : 'grab',
                          touchAction: 'none',
                        }}
                        onOpen={() => {
                          if (suppressClick.current) return;
                          onOpen(it);
                        }}
                        onToggle={() => onToggle(it.id)}
                        onPointerDown={(e) => beginDrag(e, byDate.get(it.date)?.find((x) => x.id === it.id) ?? it, col, 'move')}
                        onResizePointerDown={(e) => beginDrag(e, byDate.get(it.date)?.find((x) => x.id === it.id) ?? it, col, 'resize')}
                      />
                    );
                  })}

                  {/* drag-to-create ghost */}
                  <AnimatePresence>
                    {draft && draft.col === col && Math.abs(draft.b - draft.a) >= 0.25 && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.1 }}
                        className="pointer-events-none absolute inset-x-0.5 z-20 rounded-md border border-accent/60 bg-accent/12 px-2 py-1"
                        style={{ top: Math.min(draft.a, draft.b) * HOUR_PX + 1, height: Math.abs(draft.b - draft.a) * HOUR_PX - 2 }}
                      >
                        <div className="tabular font-mono text-[10.5px] font-medium text-accent">
                          {fmtRange(Math.min(draft.a, draft.b), Math.max(draft.a, draft.b))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* now line */}
                  {today && nowHour !== null && (
                    <div className="pointer-events-none absolute inset-x-0 z-20" style={{ top: nowHour * HOUR_PX }}>
                      <div className="absolute -left-[5px] -top-[4.5px] size-[9px] rounded-full bg-now ring-2 ring-surface" />
                      <div className="h-px w-full bg-now" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
