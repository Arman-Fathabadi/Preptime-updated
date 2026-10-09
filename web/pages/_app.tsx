import type { AppProps } from 'next/app';
import Head from 'next/head';
import { SpeedInsights } from "@vercel/speed-insights/next";
import '../styles/globals.css';

export default function App({ Component, pageProps }: AppProps) {
    return (
        <>
            <Head>
                <title>PrepTime | AI-Powered Smart Scheduler</title>
                <meta name="description" content="PrepTime learns from your Week 1 schedule and generates the rest of your month." />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
            </Head>
            <Component {...pageProps} />
            <SpeedInsights />
        </>
    );
}
