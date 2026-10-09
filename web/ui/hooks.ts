import { useEffect, useLayoutEffect, useRef, useState } from 'react';

/** Current time, refreshed on an interval (drives the "now" line). */
export function useNow(intervalMs = 30_000) {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);
  return now;
}

export function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(false);
  useEffect(() => {
    const m = window.matchMedia(query);
    const on = () => setMatches(m.matches);
    on();
    m.addEventListener('change', on);
    return () => m.removeEventListener('change', on);
  }, [query]);
  return matches;
}

/** Reads/writes a string preference in localStorage (safe during SSR). */
export function useStoredState<T extends string>(key: string, initial: T) {
  const [value, setValue] = useState<T>(initial);
  useEffect(() => {
    try {
      const v = localStorage.getItem(key);
      if (v) setValue(v as T);
    } catch {
      /* ignore */
    }
  }, [key]);
  const set = (v: T) => {
    setValue(v);
    try {
      localStorage.setItem(key, v);
    } catch {
      /* ignore */
    }
  };
  return [value, set] as const;
}

/**
 * Dialogs opened from a keyboard shortcut or an element have no trigger to hand focus back to, so Radix
 * drops it on <body>. Remember what had focus when the dialog opened and put it back when it closes.
 */
export function useRestoreFocus(open: boolean) {
  const prev = useRef<HTMLElement | null>(null);
  // Layout effect: runs before the dialog moves focus into itself.
  useLayoutEffect(() => {
    if (open) {
      prev.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    } else if (prev.current) {
      const el = prev.current;
      prev.current = null;
      setTimeout(() => {
        if (el.isConnected && el !== document.body) el.focus();
      }, 0);
    }
  }, [open]);
}
