import * as Dialog from '@radix-ui/react-dialog';
import { CloudDownload, Layers, MonitorUp } from 'lucide-react';

const tasks = (n: number) => `${n} task${n === 1 ? '' : 's'}`;

/** Shown once, when this browser and the signed-in account both already hold a plan. */
export function SyncChoice({
  open,
  localCount,
  cloudCount,
  onResolve,
}: {
  open: boolean;
  localCount: number;
  cloudCount: number;
  onResolve: (how: 'merge' | 'cloud' | 'local') => void;
}) {
  const options = [
    { how: 'merge' as const, icon: Layers, title: 'Keep both', sub: `Combine them (${tasks(localCount)} here + ${tasks(cloudCount)} in your account, duplicates removed).`, primary: true },
    { how: 'cloud' as const, icon: CloudDownload, title: 'Use my account’s plan', sub: `Replace what’s in this browser with the ${tasks(cloudCount)} from your account.` },
    { how: 'local' as const, icon: MonitorUp, title: 'Use this browser’s plan', sub: `Replace your account’s plan with the ${tasks(localCount)} here.` },
  ];
  return (
    <Dialog.Root open={open}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/40 backdrop-blur-[2px] data-[state=open]:animate-fade-in" />
        <Dialog.Content
          aria-describedby="sync-choice-desc"
          onEscapeKeyDown={(e) => e.preventDefault()}
          onPointerDownOutside={(e) => e.preventDefault()}
          className="fixed left-1/2 top-[14vh] z-50 w-[min(460px,calc(100vw-24px))] -translate-x-1/2 rounded-2xl bg-surface p-5 shadow-pop outline-none data-[state=open]:animate-pop-in"
        >
          <Dialog.Title className="text-[17px] font-semibold tracking-tight">You have a plan in two places</Dialog.Title>
          <p id="sync-choice-desc" className="mt-1.5 text-[13px] leading-relaxed text-muted">
            This browser already has tasks, and so does your account. Choose what to keep. Nothing is deleted until you pick.
          </p>
          <div className="mt-4 space-y-2">
            {options.map(({ how, icon: I, title, sub, primary }) => (
              <button
                key={how}
                onClick={() => onResolve(how)}
                className={`flex w-full items-start gap-3 rounded-xl border p-3 text-left transition hover:bg-subtle ${primary ? 'border-accent/60 bg-accent/5' : 'border-border'}`}
              >
                <I className="mt-0.5 size-4 shrink-0 text-muted" />
                <span className="min-w-0">
                  <span className="block text-[13.5px] font-medium">{title}</span>
                  <span className="block text-[12px] leading-snug text-muted">{sub}</span>
                </span>
              </button>
            ))}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
