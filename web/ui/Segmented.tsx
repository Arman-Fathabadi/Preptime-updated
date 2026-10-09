import { motion } from 'framer-motion';
import { cn } from './cn';

type Option<T extends string> = { value: T; label: React.ReactNode; title?: string };

/** Segmented control with a pill that slides between options (shared layout animation). */
export function Segmented<T extends string>({
  value,
  onChange,
  options,
  id,
  size = 'md',
  ariaLabel,
}: {
  value: T;
  onChange: (v: T) => void;
  options: Option<T>[];
  id: string;
  size?: 'sm' | 'md';
  ariaLabel?: string;
}) {
  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      className={cn('relative inline-flex items-center rounded-lg bg-subtle p-0.5', size === 'sm' ? 'h-7' : 'h-8')}
    >
      {options.map((o) => {
        const active = o.value === value;
        return (
          <button
            key={o.value}
            role="tab"
            aria-selected={active}
            title={o.title}
            onClick={() => onChange(o.value)}
            className={cn(
              'relative z-10 flex h-full items-center justify-center rounded-md px-3 text-[13px] font-medium transition-colors',
              size === 'sm' && 'px-2',
              active ? 'text-fg' : 'text-muted hover:text-fg'
            )}
          >
            {active && (
              <motion.span
                layoutId={`seg-${id}`}
                className="absolute inset-0 -z-10 rounded-md bg-surface shadow-card"
                transition={{ type: 'spring', stiffness: 520, damping: 38 }}
              />
            )}
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
