import { useRef, useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { CalendarArrowUp, Download, FileJson, FileSpreadsheet, Monitor, Moon, Sun, Upload, Wand2, X } from 'lucide-react';
import { toast } from 'sonner';
import { Item, Prefs, backupJSON, isPlanned, parseBackup, tasksCSV, tasksICS } from '../lib/prep';
import { Segmented } from './Segmented';
import { Theme } from './CommandPalette';
import { useRestoreFocus } from './hooks';
import { cn } from './cn';

function download(name: string, mime: string, text: string) {
  const blob = new Blob([text], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

const hours = Array.from({ length: 25 }, (_, h) => h);
const hourLabel = (h: number) => (h === 0 || h === 24 ? '12 AM' : h === 12 ? '12 PM' : h < 12 ? `${h} AM` : `${h - 12} PM`);

function Row({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 py-3">
      <div className="min-w-0">
        <div className="text-[13.5px] font-medium">{title}</div>
        {hint && <div className="mt-0.5 text-[12px] leading-snug text-muted">{hint}</div>}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}

const selectCls = 'h-8 rounded-lg bg-subtle px-2.5 text-[13px] tabular outline-none transition focus:ring-2 focus:ring-accent/60';

export function SettingsDialog({
  open,
  onOpenChange,
  prefs,
  onPrefs,
  theme,
  onTheme,
  items,
  onReplaceAll,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  prefs: Prefs;
  onPrefs: (patch: Partial<Prefs>) => void;
  theme: Theme;
  onTheme: (t: Theme) => void;
  items: Item[];
  onReplaceAll: (next: Item[]) => void;
}) {
  useRestoreFocus(open);
  const fileRef = useRef<HTMLInputElement>(null);
  const [pending, setPending] = useState<{ tasks: Item[]; prefs?: Partial<Prefs> } | null>(null);
  const [importError, setImportError] = useState('');
  const planned = items.filter(isPlanned).length;
  const stamp = new Date().toISOString().slice(0, 10);

  const onFile = async (f: File | undefined) => {
    setImportError('');
    setPending(null);
    if (!f) return;
    if (f.size > 5 * 1024 * 1024) return setImportError('That file is too large (max 5 MB).');
    try {
      setPending(parseBackup(await f.text()));
    } catch (e) {
      setImportError(e instanceof Error ? e.message : 'Could not read that file.');
    } finally {
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const applyImport = (mode: 'merge' | 'replace') => {
    if (!pending) return;
    const before = items;
    const next = mode === 'replace' ? pending.tasks : [...items.filter((t) => !pending.tasks.some((n) => n.id === t.id)), ...pending.tasks];
    onReplaceAll(next);
    if (pending.prefs) onPrefs(pending.prefs);
    toast.success(mode === 'replace' ? 'Backup restored' : 'Tasks imported', {
      description: `${pending.tasks.length} tasks`,
      action: { label: 'Undo', onClick: () => onReplaceAll(before) },
    });
    setPending(null);
  };

  const clearPlanned = () => {
    const before = items;
    onReplaceAll(items.filter((t) => !isPlanned(t)));
    toast('Planned tasks removed', { description: `${planned} tasks`, action: { label: 'Undo', onClick: () => onReplaceAll(before) } });
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/30 backdrop-blur-[2px] data-[state=open]:animate-fade-in" />
        <Dialog.Content
          aria-describedby={undefined}
          className="thin-scroll fixed left-1/2 top-[8vh] z-50 max-h-[84vh] w-[min(560px,calc(100vw-24px))] -translate-x-1/2 overflow-y-auto rounded-2xl bg-surface shadow-pop outline-none data-[state=open]:animate-pop-in"
        >
          <div className="sticky top-0 z-10 flex items-center justify-between border-b border-line bg-surface px-5 py-4">
            <Dialog.Title className="text-[16px] font-semibold tracking-tight">Settings</Dialog.Title>
            <Dialog.Close aria-label="Close" className="grid size-7 place-items-center rounded-md text-muted transition hover:bg-subtle hover:text-fg">
              <X className="size-4" />
            </Dialog.Close>
          </div>

          <div className="px-5 pb-5">
            <h3 className="pt-4 text-[11px] font-semibold uppercase tracking-wider text-faint">General</h3>
            <div className="divide-y divide-line">
              <Row title="Appearance">
                <Segmented<Theme>
                  id="settings-theme"
                  size="sm"
                  ariaLabel="Theme"
                  value={theme}
                  onChange={onTheme}
                  options={[
                    { value: 'light', label: <span className="flex items-center gap-1.5 px-1"><Sun className="size-3.5" /> Light</span> },
                    { value: 'dark', label: <span className="flex items-center gap-1.5 px-1"><Moon className="size-3.5" /> Dark</span> },
                    { value: 'system', label: <span className="flex items-center gap-1.5 px-1"><Monitor className="size-3.5" /> Auto</span> },
                  ]}
                />
              </Row>
              <Row title="Working hours" hint="The calendar opens here and dims the hours outside it.">
                <div className="flex items-center gap-1.5 text-[13px] text-muted">
                  <select aria-label="Day starts" className={selectCls} value={prefs.dayStartHour} onChange={(e) => onPrefs({ dayStartHour: Math.min(Number(e.target.value), prefs.dayEndHour - 1) })}>
                    {hours.slice(0, 24).map((h) => <option key={h} value={h}>{hourLabel(h)}</option>)}
                  </select>
                  to
                  <select aria-label="Day ends" className={selectCls} value={prefs.dayEndHour} onChange={(e) => onPrefs({ dayEndHour: Math.max(Number(e.target.value), prefs.dayStartHour + 1) })}>
                    {hours.slice(1).map((h) => <option key={h} value={h}>{hourLabel(h)}</option>)}
                  </select>
                </div>
              </Row>
              <Row title="Weather" hint="Temperature unit in the sidebar.">
                <Segmented<'celsius' | 'fahrenheit'>
                  id="settings-unit"
                  size="sm"
                  ariaLabel="Temperature unit"
                  value={prefs.weatherUnit}
                  onChange={(v) => onPrefs({ weatherUnit: v })}
                  options={[
                    { value: 'celsius', label: '°C' },
                    { value: 'fahrenheit', label: '°F' },
                  ]}
                />
              </Row>
            </div>

            <h3 className="pt-6 text-[11px] font-semibold uppercase tracking-wider text-faint">Planning</h3>
            <div className="divide-y divide-line">
              <Row title="Buffer around fixed events" hint="Free time the planner keeps before and after an event.">
                <Segmented<string>
                  id="settings-buffer"
                  size="sm"
                  ariaLabel="Buffer"
                  value={String(prefs.bufferMin)}
                  onChange={(v) => onPrefs({ bufferMin: Number(v) })}
                  options={['0', '5', '10', '15'].map((v) => ({ value: v, label: `${v}m` }))}
                />
              </Row>
              <Row title="Planned tasks" hint={planned ? `${planned} tasks were created by "Plan month".` : 'Nothing planned automatically yet.'}>
                <button
                  disabled={!planned}
                  onClick={clearPlanned}
                  className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-border px-3 text-[13px] font-medium transition enabled:hover:bg-subtle disabled:opacity-40"
                >
                  <Wand2 className="size-3.5 text-muted" /> Remove all
                </button>
              </Row>
            </div>

            <h3 className="pt-6 text-[11px] font-semibold uppercase tracking-wider text-faint">Your data</h3>
            <p className="mt-1.5 text-[12.5px] leading-relaxed text-muted">
              Everything is stored in this browser. Keep a backup, or take your plan to another calendar.
            </p>
            <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-3">
              {[
                { icon: FileJson, label: 'Backup', sub: '.json', onClick: () => download(`preptime-backup-${stamp}.json`, 'application/json', backupJSON(items, prefs)) },
                { icon: FileSpreadsheet, label: 'Spreadsheet', sub: '.csv', onClick: () => download(`preptime-${stamp}.csv`, 'text/csv', tasksCSV(items)) },
                { icon: CalendarArrowUp, label: 'Calendar', sub: '.ics · Google, Apple, Outlook', onClick: () => download(`preptime-${stamp}.ics`, 'text/calendar', tasksICS(items)) },
              ].map(({ icon: I, label, sub, onClick }) => (
                <button
                  key={label}
                  disabled={!items.length}
                  onClick={onClick}
                  className="group flex items-start gap-2.5 rounded-xl border border-border p-3 text-left transition enabled:hover:bg-subtle disabled:opacity-40"
                >
                  <I className="mt-0.5 size-4 text-muted group-hover:text-fg" />
                  <div className="min-w-0">
                    <div className="flex items-center gap-1 text-[13px] font-medium">
                      <Download className="size-3" /> {label}
                    </div>
                    <div className="truncate text-[11.5px] text-muted">{sub}</div>
                  </div>
                </button>
              ))}
            </div>

            <div className="mt-2 rounded-xl border border-dashed border-border p-3">
              <div className="flex items-center justify-between gap-3">
                <div className="text-[13px]">
                  <div className="font-medium">Import a backup</div>
                  <div className="text-[12px] text-muted">A .json file exported from PrepTime.</div>
                </div>
                <button
                  onClick={() => fileRef.current?.click()}
                  className="inline-flex h-8 shrink-0 items-center gap-1.5 rounded-lg border border-border px-3 text-[13px] font-medium transition hover:bg-subtle"
                >
                  <Upload className="size-3.5" /> Choose file
                </button>
                <input ref={fileRef} type="file" accept="application/json,.json" className="hidden" onChange={(e) => onFile(e.target.files?.[0])} />
              </div>
              {importError && <p className="mt-2 text-[12.5px] text-danger">{importError}</p>}
              {pending && (
                <div className="mt-3 flex flex-wrap items-center justify-between gap-2 rounded-lg bg-subtle px-3 py-2.5">
                  <span className="text-[12.5px]">
                    Found <span className="font-semibold">{pending.tasks.length}</span> tasks.
                  </span>
                  <div className="flex gap-2">
                    <button onClick={() => applyImport('merge')} className="h-8 rounded-lg border border-border bg-surface px-3 text-[12.5px] font-medium transition hover:bg-bg">
                      Add to my plan
                    </button>
                    <button onClick={() => applyImport('replace')} className={cn('h-8 rounded-lg bg-ink px-3 text-[12.5px] font-medium text-ink-fg transition hover:opacity-90')}>
                      Replace everything
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
