import { Html, Head, Main, NextScript } from 'next/document';

// Runs before first paint so the correct theme is applied with no flash.
const themeScript = `
try {
  var t = localStorage.getItem('preptime-theme') || 'system';
  var dark = t === 'dark' || (t === 'system' && matchMedia('(prefers-color-scheme: dark)').matches);
  document.documentElement.classList.toggle('dark', dark);
} catch (e) {}
`;

export default function Document() {
    return (
        <Html lang="en" suppressHydrationWarning>
            <Head>
                <script dangerouslySetInnerHTML={{ __html: themeScript }} />
            </Head>
            <body>
                <Main />
                <NextScript />
            </body>
        </Html>
    );
}
