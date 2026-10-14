import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { authClient, AUTH_PROVIDERS } from '../lib/authClient';
import { Item, Prefs, clearLocalPlan } from '../lib/prep';
import { SyncDoc, docSignature, mergeById, sameDoc } from '../lib/sync';

export type SyncStatus = 'off' | 'syncing' | 'saved' | 'offline';
export const ACCOUNTS_ENABLED = AUTH_PROVIDERS.length > 0;

// Constant for the lifetime of the page, so the hook order never changes.
const useSession = ACCOUNTS_ENABLED ? authClient.useSession : () => ({ data: null, isPending: false, error: null });

type Store = {
  loaded: boolean;
  items: Item[];
  prefs: Prefs;
  username: string | null;
  setUsername: (n: string | null) => void;
  replaceAll: (items: Item[]) => void;
  updatePrefs: (p: Partial<Prefs>) => void;
};
type Choice = { remote: SyncDoc; version: number };

const SAVE_DELAY_MS = 1500;

async function api(method: 'GET' | 'PUT', body?: unknown) {
  const res = await fetch('/api/sync', { method, headers: body ? { 'Content-Type': 'application/json' } : undefined, body: body ? JSON.stringify(body) : undefined });
  let json: any = null;
  try {
    json = await res.json();
  } catch {
    /* empty body */
  }
  return { status: res.status, json };
}

/**
 * Optional accounts. Signed out, nothing here does anything and the plan stays in this browser.
 * Signed in, the plan is one document in the cloud: pulled on sign-in, saved shortly after every
 * change, refreshed when the tab regains focus, and never overwritten blindly (versioned saves).
 */
export function useAccount(store: Store) {
  const { data: session, isPending } = useSession();
  const user = session?.user ?? null;
  const uid = user?.id;

  const [status, setStatus] = useState<SyncStatus>('off');
  const [choice, setChoice] = useState<Choice | null>(null);
  const [readyTick, setReadyTick] = useState(0); // bumps when the first pull finishes, to start saving

  const ready = useRef(false); // initial pull/resolve finished
  const version = useRef(0);
  const lastSig = useRef('');
  const adopting = useRef(false); // next render reflects remote data: record it, don't re-upload it
  const saving = useRef(false);
  const latest = useRef(store);
  latest.current = store;

  const adopt = useCallback(
    (doc: SyncDoc, v: number) => {
      adopting.current = true;
      version.current = v;
      store.replaceAll(doc.items);
      store.updatePrefs(doc.prefs);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [store.replaceAll, store.updatePrefs]
  );

  // A signed-in person always has a display name.
  useEffect(() => {
    if (user && store.loaded && !store.username) store.setUsername((user.name || user.email || 'You').split(' ')[0]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, store.loaded, store.username]);

  // First pull after sign-in.
  useEffect(() => {
    if (!uid || !store.loaded) return;
    let cancelled = false;
    ready.current = false;
    setStatus('syncing');
    (async () => {
      try {
        const { status: code, json } = await api('GET');
        if (cancelled) return;
        if (code !== 200) throw new Error(String(code));
        const local: SyncDoc = { items: latest.current.items, prefs: latest.current.prefs };
        version.current = json.version;
        if (!json.doc) {
          // Brand new account: the first save uploads whatever is in this browser.
          lastSig.current = '';
          ready.current = true;
          setReadyTick((n) => n + 1);
        } else if (local.items.length === 0 || sameDoc(local, json.doc)) {
          adopt(json.doc, json.version);
          ready.current = true;
          setReadyTick((n) => n + 1);
        } else {
          setChoice({ remote: json.doc, version: json.version });
          return;
        }
        setStatus('saved');
      } catch {
        if (!cancelled) setStatus('offline');
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [uid, store.loaded, adopt]);

  const resolve = useCallback(
    (how: 'merge' | 'cloud' | 'local') => {
      if (!choice) return;
      const local = latest.current.items;
      if (how === 'cloud') adopt(choice.remote, choice.version);
      else {
        version.current = choice.version;
        lastSig.current = ''; // differs from the cloud copy, so it uploads
        if (how === 'merge') latest.current.replaceAll(mergeById(local, choice.remote.items));
      }
      ready.current = true;
      setReadyTick((n) => n + 1);
      setChoice(null);
      setStatus('syncing');
    },
    [choice, adopt]
  );

  const save = useCallback(async (): Promise<boolean> => {
    if (saving.current) return false;
    const { items, prefs } = latest.current;
    const sig = docSignature(items, prefs);
    if (sig === lastSig.current) return true;
    saving.current = true;
    setStatus('syncing');
    try {
      const { status: code, json } = await api('PUT', { baseVersion: version.current, doc: { items, prefs } });
      if (code === 200) {
        version.current = json.version;
        lastSig.current = sig;
        setStatus('saved');
        return true;
      }
      if (code === 409 && json?.doc) {
        adopt(json.doc, json.version);
        setStatus('saved');
        toast('Updated from another device', { description: 'Your latest edits here were replaced by the newer version.' });
        return true;
      }
      throw new Error(String(code));
    } catch {
      setStatus('offline');
      return false;
    } finally {
      saving.current = false;
    }
  }, [adopt]);

  // Save shortly after every change.
  useEffect(() => {
    if (!uid || !ready.current || !store.loaded) return;
    const sig = docSignature(store.items, store.prefs);
    if (adopting.current) {
      adopting.current = false;
      lastSig.current = sig;
      return;
    }
    if (sig === lastSig.current) return;
    const t = setTimeout(save, SAVE_DELAY_MS);
    return () => clearTimeout(t);
  }, [uid, store.items, store.prefs, store.loaded, save, readyTick]);

  // Pick up changes from other devices when this tab comes back.
  useEffect(() => {
    if (!uid) return;
    const onVisible = async () => {
      if (document.visibilityState !== 'visible' || !ready.current || saving.current) return;
      const { items, prefs } = latest.current;
      if (docSignature(items, prefs) !== lastSig.current) return void save(); // our own edits first
      try {
        const { status: code, json } = await api('GET');
        if (code === 200 && json.doc && json.version > version.current) {
          adopt(json.doc, json.version);
          toast('Synced from another device');
        }
        setStatus(code === 200 ? 'saved' : 'offline');
      } catch {
        setStatus('offline');
      }
    };
    document.addEventListener('visibilitychange', onVisible);
    window.addEventListener('online', onVisible);
    return () => {
      document.removeEventListener('visibilitychange', onVisible);
      window.removeEventListener('online', onVisible);
    };
  }, [uid, save, adopt]);

  /** Saves what's pending, signs out, and clears this browser's copy. Returns false if it couldn't save. */
  const signOutAccount = useCallback(async () => {
    if (ready.current && !(await save())) {
      toast.error("Couldn't save your latest changes", { description: 'Check your connection and try again. You are still signed in.' });
      return false;
    }
    await authClient.signOut();
    clearLocalPlan();
    return true;
  }, [save]);

  const signIn = useCallback((provider: 'google' | 'github') => authClient.signIn.social({ provider, callbackURL: '/' }), []);

  return { enabled: ACCOUNTS_ENABLED, pending: ACCOUNTS_ENABLED && isPending, user, status: uid ? status : ('off' as SyncStatus), choice, resolve, signOutAccount, signIn };
}
