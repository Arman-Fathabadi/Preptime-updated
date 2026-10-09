import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { Item, fmtRange, hueOf } from '../lib/prep';
import { cn } from './cn';

/**
 * A calendar event. Colour comes from the item's palette entry but is tinted into the
 * surface (works in light and dark) instead of a flat saturated fill.
 */
export function EventCard({
  item,
  style,
  compact,
  dragging,
  active,
  onOpen,
  onToggle,
  onPointerDown,
  onResizePointerDown,
  index = 0,
}: {
  item: Item;
  style: React.CSSProperties;
  compact: boolean;
  dragging?: boolean;
  active?: boolean;
  onOpen: () => void;
  onToggle: () => void;
  onPointerDown?: (e: React.PointerEvent) => void;
  onResizePointerDown?: (e: React.PointerEvent) => void;
  index?: number;
}) {
  const hue = hueOf(item.color);
  const vars = { ['--c' as string]: hue } as React.CSSProperties;

  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22, delay: Math.min(index, 12) * 0.012, ease: [0.23, 1, 0.32, 1] }}
      data-event
      role="button"
      tabIndex={0}
      aria-label={`${item.title}, ${fmtRange(item.startHour, item.endHour)}${item.completed ? ', completed' : ''}`}
      onClick={(e) => {
        e.stopPropagation();
        onOpen();
      }}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onOpen();
        }
      }}
      onPointerDown={onPointerDown}
      style={{ ...vars, ...style }}
      className={cn(
        'group absolute cursor-pointer overflow-hidden rounded-md border-l-[3px] text-left outline-none',
        'bg-[color-mix(in_oklab,var(--c)_15%,rgb(var(--surface)))] border-l-[var(--c)]',
        'shadow-[0_0_0_1px_color-mix(in_oklab,var(--c)_14%,transparent)]',
        'transition-[box-shadow,background-color,opacity,transform] duration-150 ease-out',
        'hover:bg-[color-mix(in_oklab,var(--c)_22%,rgb(var(--surface)))] hover:shadow-[0_0_0_1px_color-mix(in_oklab,var(--c)_30%,transparent),0_4px_14px_-4px_color-mix(in_oklab,var(--c)_35%,transparent)]',
        'focus-visible:ring-2 focus-visible:ring-accent',
        item.completed && 'opacity-55',
        active && 'ring-2 ring-accent/70',
        dragging && 'z-30 scale-[1.01] shadow-pop'
      )}
    >
      <div className={cn('flex h-full items-start gap-1.5', compact ? 'px-1.5 py-0.5' : 'px-2 py-1.5')}>
        <div className="min-w-0 flex-1 leading-tight">
          <div
            className={cn(
              'truncate text-[12px] font-medium text-[color-mix(in_oklab,var(--c)_62%,rgb(var(--fg)))]',
              item.completed && 'line-through decoration-1'
            )}
          >
            {item.title}
            {compact && (
              <span className="ml-1.5 font-mono text-[10.5px] font-normal text-[color-mix(in_oklab,var(--c)_40%,rgb(var(--muted)))] tabular">
                {fmtRange(item.startHour, item.endHour)}
              </span>
            )}
          </div>
          {!compact && (
            <div className="mt-0.5 truncate font-mono text-[10.5px] text-[color-mix(in_oklab,var(--c)_40%,rgb(var(--muted)))] tabular">
              {fmtRange(item.startHour, item.endHour)}
            </div>
          )}
          {!compact && item.label && item.endHour - item.startHour >= 1.25 && (
            <div className="mt-1 truncate text-[10.5px] capitalize text-[color-mix(in_oklab,var(--c)_35%,rgb(var(--muted)))]">{item.label}</div>
          )}
        </div>
        <button
          aria-label={item.completed ? 'Mark as not done' : 'Mark as done'}
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => {
            e.stopPropagation();
            onToggle();
          }}
          className={cn(
            'mt-px grid size-4 shrink-0 place-items-center rounded-full border transition',
            item.completed
              ? 'border-transparent bg-[var(--c)] text-white'
              : 'border-[color-mix(in_oklab,var(--c)_55%,transparent)] text-transparent opacity-0 hover:bg-[color-mix(in_oklab,var(--c)_25%,transparent)] group-hover:opacity-100 focus-visible:opacity-100'
          )}
        >
          <Check className="size-2.5" strokeWidth={3.5} />
        </button>
      </div>
      {onResizePointerDown && (
        <div
          aria-hidden
          onPointerDown={onResizePointerDown}
          onClick={(e) => e.stopPropagation()}
          className="absolute inset-x-0 bottom-0 h-2 cursor-ns-resize"
        >
          <span className="absolute inset-x-1/2 bottom-0.5 h-0.5 w-6 -translate-x-1/2 rounded-full bg-[var(--c)] opacity-0 transition-opacity group-hover:opacity-40" />
        </div>
      )}
    </motion.div>
  );
}
