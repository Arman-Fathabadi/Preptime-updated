import { cn } from './cn';

export function Kbd({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <kbd
      className={cn(
        'inline-flex h-[18px] min-w-[18px] items-center justify-center rounded border border-border bg-subtle px-1 font-mono text-[10px] font-medium text-muted',
        className
      )}
    >
      {children}
    </kbd>
  );
}
