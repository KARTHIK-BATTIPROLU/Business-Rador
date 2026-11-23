import type { Metadata, Viewport } from 'next';
import localFont from 'next/font/local';
import './globals.css';

// Display: Newsreader, a newspaper text face with an optical-size axis. At 56px it
// gets fine, high-contrast detail; at 20px it stays sturdy enough for card titles.
// A "local paper" voice suits a product whose whole job is noticing neighbourhood shops.
const display = localFont({
  src: './fonts/Newsreader-opsz.woff2',
  variable: '--font-display',
  weight: '300 800',
  display: 'swap',
});

// UI/body: Hanken Grotesk — humanist, slightly open apertures, not Inter.
const sans = localFont({
  src: './fonts/HankenGrotesk-wght.woff2',
  variable: '--font-sans',
  weight: '300 800',
  display: 'swap',
});

// Data: JetBrains Mono with tabular figures for scores, counts and dates.
const mono = localFont({
  src: './fonts/JetBrainsMono-wght.woff2',
  variable: '--font-mono',
  weight: '300 700',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Business Radar — new Hyderabad shops before they have websites',
  description:
    'Business Radar spots cafes, boutiques and salons that opened in Kokapet, Gachibowli and Jubilee Hills in the last few weeks, scores them, and hands your agency the WhatsApp number.',
};

export const viewport: Viewport = {
  themeColor: '#F5EFE4',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-IN" className={`${display.variable} ${sans.variable} ${mono.variable}`}>
      <body className="min-h-screen">{children}</body>
    </html>
  );
}
