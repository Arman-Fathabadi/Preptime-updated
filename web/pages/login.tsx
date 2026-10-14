import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import { ArrowRight, Loader2 } from 'lucide-react';
import { Logo } from '../ui/Sidebar';
import { AUTH_PROVIDERS, signInWith } from '../lib/authClient';

const GoogleMark = () => (
    <svg viewBox="0 0 24 24" className="size-4" aria-hidden>
        <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5a5.6 5.6 0 0 1-2.4 3.6v3h3.9c2.3-2.1 3.5-5.2 3.5-8.8z" />
        <path fill="#34A853" d="M12 24c3.2 0 6-1.1 7.9-2.9l-3.9-3c-1.1.7-2.5 1.2-4 1.2-3.1 0-5.7-2.1-6.6-4.9H1.4v3.1A12 12 0 0 0 12 24z" />
        <path fill="#FBBC05" d="M5.4 14.4a7.2 7.2 0 0 1 0-4.8V6.5H1.4a12 12 0 0 0 0 11z" />
        <path fill="#EA4335" d="M12 4.8c1.8 0 3.3.6 4.6 1.8l3.4-3.4A12 12 0 0 0 1.4 6.5l4 3.1C6.3 6.9 8.9 4.8 12 4.8z" />
    </svg>
);
const GitHubMark = () => (
    <svg viewBox="0 0 16 16" className="size-4" fill="currentColor" aria-hidden>
        <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38v-1.33c-2.23.48-2.7-1.07-2.7-1.07-.36-.92-.89-1.17-.89-1.17-.73-.5.05-.49.05-.49.8.06 1.23.83 1.23.83.71 1.22 1.87.87 2.33.66.07-.52.28-.87.5-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82a7.6 7.6 0 0 1 4 0c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.28.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48v2.2c0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8z" />
    </svg>
);
const PROVIDER_UI = { google: { label: 'Google', Mark: GoogleMark }, github: { label: 'GitHub', Mark: GitHubMark } } as const;

export default function Login() {
    const router = useRouter();
    const [name, setName] = useState('');
    const [loading, setLoading] = useState(false);
    const [oauthBusy, setOauthBusy] = useState<string | null>(null);
    const [oauthError, setOauthError] = useState('');

    const oauth = async (p: 'google' | 'github') => {
        setOauthBusy(p);
        setOauthError('');
        try {
            await signInWith(p);
        } catch {
            setOauthBusy(null);
            setOauthError('Could not start sign-in. Try again, or continue as a guest.');
        }
    };

    // Match the saved theme (the app sets it before first paint via _document).
    useEffect(() => {
        if (localStorage.getItem('preptime-username')) router.replace('/');
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const trimmed = name.trim();
        if (!trimmed || loading) return;
        setLoading(true);
        localStorage.setItem('preptime-guest', 'true');
        localStorage.setItem('preptime-username', trimmed);
        router.push('/');
    };

    return (
        <div className="relative grid min-h-dvh place-items-center overflow-hidden bg-bg p-4">
            {/* a very quiet hour-grid texture, a nod to the calendar */}
            <div
                aria-hidden
                className="pointer-events-none absolute inset-0 opacity-70 [mask-image:radial-gradient(ellipse_at_center,black,transparent_70%)]"
                style={{
                    backgroundImage:
                        'linear-gradient(to right, rgb(var(--line)) 1px, transparent 1px), linear-gradient(to bottom, rgb(var(--line)) 1px, transparent 1px)',
                    backgroundSize: '64px 56px',
                }}
            />

            <motion.div
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: 'spring', stiffness: 220, damping: 26 }}
                className="relative w-full max-w-[380px]"
            >
                <div className="mb-7 flex flex-col items-center text-center">
                    <Logo className="mb-5 size-10 rounded-xl [&_svg]:size-5" />
                    <h1 className="text-[26px] font-semibold tracking-tight">Welcome to PrepTime</h1>
                    <p className="mt-1.5 text-[14px] text-muted">Plan one good week. We&apos;ll help with the rest.</p>
                </div>

                <div className="rounded-2xl bg-surface p-5 shadow-card">
                {AUTH_PROVIDERS.length > 0 && (
                    <>
                        <div className="space-y-2">
                            {AUTH_PROVIDERS.map((p) => {
                                const { label, Mark } = PROVIDER_UI[p];
                                return (
                                    <button
                                        key={p}
                                        type="button"
                                        onClick={() => oauth(p)}
                                        disabled={!!oauthBusy}
                                        className="inline-flex h-11 w-full items-center justify-center gap-2.5 rounded-xl border border-border bg-surface text-[14px] font-medium transition enabled:hover:bg-subtle enabled:active:scale-[0.99] disabled:opacity-60"
                                    >
                                        {oauthBusy === p ? <Loader2 className="size-4 animate-spin" /> : <Mark />}
                                        Continue with {label}
                                    </button>
                                );
                            })}
                        </div>
                        {oauthError && <p role="alert" className="mt-2 text-[12.5px] text-danger">{oauthError}</p>}
                        <div className="my-4 flex items-center gap-3 text-[11.5px] text-faint">
                            <span className="h-px flex-1 bg-line" />
                            or continue as a guest
                            <span className="h-px flex-1 bg-line" />
                        </div>
                    </>
                )}
                <form onSubmit={handleSubmit}>
                    <label htmlFor="name" className="mb-2 block text-[12.5px] font-medium text-muted">
                        What should we call you?
                    </label>
                    <input
                        id="name"
                        autoFocus
                        autoComplete="given-name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Your name"
                        className="h-11 w-full rounded-xl bg-subtle px-3.5 text-[15px] outline-none transition placeholder:text-faint focus:ring-2 focus:ring-accent/60"
                    />
                    <button
                        type="submit"
                        disabled={!name.trim() || loading}
                        className="mt-3 inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-ink text-[14px] font-medium text-ink-fg transition enabled:hover:opacity-90 enabled:active:scale-[0.99] disabled:opacity-40"
                    >
                        {loading ? <Loader2 className="size-4 animate-spin" /> : <>Continue <ArrowRight className="size-4" /></>}
                    </button>
                </form>
                </div>

                <p className="mt-5 text-center text-[12px] text-faint">
                    {AUTH_PROVIDERS.length > 0 ? 'Guests keep their plan in this browser. An account saves it across devices.' : 'Your plan is saved in this browser. No account needed.'}
                </p>
            </motion.div>
        </div>
    );
}
