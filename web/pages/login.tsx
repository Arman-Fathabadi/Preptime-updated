import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import { ArrowRight, Loader2 } from 'lucide-react';
import { Logo } from '../ui/Sidebar';

export default function Login() {
    const router = useRouter();
    const [name, setName] = useState('');
    const [loading, setLoading] = useState(false);

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

                <form onSubmit={handleSubmit} className="rounded-2xl bg-surface p-5 shadow-card">
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

                <p className="mt-5 text-center text-[12px] text-faint">Your plan is saved in this browser. No account needed.</p>
            </motion.div>
        </div>
    );
}
