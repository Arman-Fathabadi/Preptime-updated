import type { AppProps } from 'next/app';
import Head from 'next/head';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { useEffect } from 'react';
import { Toaster } from 'sonner';
import { sans, mono } from '../lib/fonts';
import '../styles/globals.css';

export default function App({ Component, pageProps }: AppProps) {
    // Fonts must be imported here for Next to inject their CSS. Also put the variable classes on <html>
    // so portals (dialogs, command menu, toasts) inherit them.
    useEffect(() => {
        const cls = [sans.variable, mono.variable];
        document.documentElement.classList.add(...cls);
        return () => document.documentElement.classList.remove(...cls);
    }, []);

    return (
        <div className={`${sans.variable} ${mono.variable} font-sans`}>
            <Head>
                <title>PrepTime | Plan your week, protect your focus</title>
                <meta name="description" content="PrepTime turns your first week into a plan for the whole month." />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
            </Head>
            <Component {...pageProps} />
            <Toaster position="bottom-right" toastOptions={{ className: 'font-sans' }} />
            <SpeedInsights />
        </div>
    );
}
