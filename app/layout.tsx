import type { Metadata, Viewport } from 'next';
import localFont from 'next/font/local';
import './globals.css';
import { ViewTransitionRouteWatcher } from '@/components/motion/ViewTransitions';
import { MotionProvider } from '@/components/motion/MotionProvider';
import { ToastProvider } from '@/components/ui/Toast';
import { CommandProvider } from '@/components/command/CommandBar';

// Display: Funnel Display (Kristian Möller / NORD ID, Google Fonts). A tight,
// slightly condensed grotesk with odd, confident details. Set heavy and tight it
// reads like shop signage, which is what this product is about, and it avoids
// the serif-headline look that every generated landing page uses now.
const display = localFont({
  src: './fonts/FunnelDisplay-wght.woff2',
  variable: '--font-display',
  weight: '300 800',
  display: 'swap',
});

// UI/body: Funnel Sans, the text cut of the same family, so headings and body
// share skeletons without looking like one weight blown up.
const sans = localFont({
  src: './fonts/FunnelSans-wght.woff2',
  variable: '--font-sans',
  weight: '300 800',
  display: 'swap',
});

// Data: SUSE Mono (2025) for scores, counts and dates. Squarer than the usual
// developer monos, with tabular figures.
const mono = localFont({
  src: './fonts/SUSEMono-wght.woff2',
  variable: '--font-mono',
  weight: '100 800',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Business Radar — find newly opened shops before they have websites',
  description:
    'Business Radar spots cafes, boutiques and salons that opened in the last few weeks, from Shoreditch to Shibuya, scores them, and hands your agency the contact. Built in Hyderabad.',
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#FAF6EC' },
    { media: '(prefers-color-scheme: dark)', color: '#1A1712' },
  ],
};

// Runs before first paint: stored choice wins, otherwise follow the system. Avoids a light flash.
const themeScript = `try{var t=localStorage.getItem('theme');if(t!=='light'&&t!=='dark'){t=matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'}document.documentElement.dataset.theme=t}catch(e){}`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-IN" className={`${display.variable} ${sans.variable} ${mono.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-screen">
        <ViewTransitionRouteWatcher />
        <MotionProvider>
          <ToastProvider>
            <CommandProvider>{children}</CommandProvider>
          </ToastProvider>
        </MotionProvider>
      </body>
    </html>
  );
}
