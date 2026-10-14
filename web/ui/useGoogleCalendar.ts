import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { authClient, AUTH_PROVIDERS } from '../lib/authClient';
import { GCAL_SCOPE, GCalEvent, eventsToItems, importWindow, isImported, mergeImported } from '../lib/gcal';
import { Item } from '../lib/prep';

export type CalendarState = 'unavailable' | 'checking' | 'disconnected' | 'idle' | 'syncing' | 'reconnect' | 'error';

const REFRESH_AFTER_MS = 15 * 60 * 1000;
const GOOGLE_ENABLED = AUTH_PROVIDERS.includes('google');

type Store = { items: Item[]; replaceAll: (items: Item[]) => void };

/**
 * Optional, read-only Google Calendar import. Needs a signed-in account whose sign-in methods include Google.
 * Events become ordinary plan items (id "gcal_…"): they sync to the cloud like any task and the
 * planner treats the ones in the weeks it fills as fixed. Re-importing replaces them, so changes and
 * cancellations in Google show up; nothing is ever written back to Google.
 */
export function useGoogleCalendar(store: Store, account: { user: { id: string } | null; status: string }) {
  const uid = account.user?.id;
  const available = GOOGLE_ENABLED && !!uid;
  const [state, setState] = useState<CalendarState>(available ? 'checking' : 'unavailable');
  const [lastSync, setLastSync] = useState<number | null>(null);
  const [count, setCount] = useState(0);
  const [hasGoogleLogin, setHasGoogleLogin] = useState(false);
  const latest = useRef(store);
  latest.current = store;
  const lastAt = useRef(0);
  const busy = useRef(false);

  // Is Calendar access already granted?
  useEffect(() => {
    if (!available) return setState('unavailable');
    let cancelled = false;
    setState('checking');
    authClient
      .listAccounts()
      .then((r) => {
        if (cancelled) return;
        const google = (r.data ?? []).find((a: any) => a.providerId === 'google');
        setHasGoogleLogin(!!google);
        setState(google?.scopes?.includes(GCAL_SCOPE) ? 'idle' : 'disconnected');
      })
      .catch(() => !cancelled && setState('error'));
    return () => {
      cancelled = true;
    };
  }, [available, uid]);

  const sync = useCallback(
    async (quiet = false) => {
      if (busy.current) return;
      busy.current = true;
      setState('syncing');
      try {
        const { from, to } = importWindow(new Date());
        const res = await fetch(`/api/calendar/events?from=${from}&to=${to}`);
        const json = await res.json().catch(() => ({}));
        if (res.status === 409) {
          setState(json.error === 'reconnect' ? 'reconnect' : 'disconnected');
          return;
        }
        if (!res.ok) throw new Error(json.error || String(res.status));
        const fresh = eventsToItems(json.events as GCalEvent[]);
        const before = latest.current.items;
        latest.current.replaceAll(mergeImported(before, fresh, from, to));
        lastAt.current = Date.now();
        setLastSync(lastAt.current);
        setCount(fresh.length);
        setState('idle');
        if (!quiet) toast.success('Google Calendar synced', { description: `${fresh.length} events in the next eight weeks.`, action: { label: 'Undo', onClick: () => latest.current.replaceAll(before) } });
      } catch (e) {
        setState('error');
        if (!quiet) toast.error("Couldn't reach Google Calendar", { description: e instanceof Error ? e.message : 'Try again in a moment.' });
      } finally {
        busy.current = false;
      }
    },
    []
  );

  // Once the cloud copy has loaded (so we never import into a half-loaded plan), then again when the tab returns after a while.
  const started = useRef(false);
  useEffect(() => {
    if (state === 'idle' && account.status === 'saved' && !started.current) {
      started.current = true;
      void sync(true);
    }
  }, [state, account.status, sync]);
  useEffect(() => {
    if (!available) return;
    const onVisible = () => {
      if (document.visibilityState === 'visible' && (state === 'idle' || state === 'error') && started.current && Date.now() - lastAt.current > REFRESH_AFTER_MS) void sync(true);
    };
    document.addEventListener('visibilitychange', onVisible);
    return () => document.removeEventListener('visibilitychange', onVisible);
  }, [available, state, sync]);

  const connect = useCallback(async () => {
    try {
      // Someone who already signs in with Google just grants the extra permission; otherwise add Google as a second sign-in.
      if (hasGoogleLogin) await authClient.signIn.social({ provider: 'google', scopes: [GCAL_SCOPE], callbackURL: '/' });
      else await authClient.linkSocial({ provider: 'google', scopes: [GCAL_SCOPE], callbackURL: '/' });
    } catch {
      toast.error("Couldn't open Google", { description: 'Try again in a moment.' });
    }
  }, [hasGoogleLogin]);

  const disconnect = useCallback(async () => {
    const before = latest.current.items;
    try {
      const list = await authClient.listAccounts();
      const google = (list.data ?? []).find((a: any) => a.providerId === 'google');
      if (!google) throw new Error('No Google account is linked.');
      const r = await authClient.unlinkAccount({ accountId: google.id });
      if (r.error) throw new Error(r.error.message);
    } catch (e) {
      toast.error("Couldn't disconnect", { description: e instanceof Error && e.message ? e.message : 'Google is your only sign-in method, so it can’t be removed.' });
      return;
    }
    latest.current.replaceAll(before.filter((t) => !isImported(t)));
    setState('disconnected');
    setHasGoogleLogin(false);
    started.current = false;
    toast('Google Calendar disconnected', { description: 'Imported events were removed from your plan.' });
  }, []);

  return { available, state, lastSync, count, connect, sync: () => sync(false), disconnect };
}
