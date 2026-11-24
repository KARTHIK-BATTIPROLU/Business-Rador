'use client';

import React, { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';
import { cn } from '@/lib/utils';

export type Theme = 'light' | 'dark';

/** Reads the theme set by the inline script in layout.tsx (stored choice, else system). */
export function useTheme(): [Theme | null, (t: Theme) => void] {
  const [theme, setThemeState] = useState<Theme | null>(null);
  useEffect(() => {
    const el = document.documentElement;
    const read = () => setThemeState(el.dataset.theme === 'dark' ? 'dark' : 'light');
    read();
    const mo = new MutationObserver(read);
    mo.observe(el, { attributes: true, attributeFilter: ['data-theme'] });
    return () => mo.disconnect();
  }, []);
  const setTheme = (t: Theme) => {
    const el = document.documentElement;
    el.classList.add('theme-switching');
    el.dataset.theme = t;
    try {
      localStorage.setItem('theme', t);
    } catch {}
    window.setTimeout(() => el.classList.remove('theme-switching'), 250);
  };
  return [theme, setTheme];
}

/** Light / dark switch. Shows the theme you'd switch to. */
export function ThemeToggle({ className }: { className?: string }) {
  const [theme, setTheme] = useTheme();
  const dark = theme === 'dark';
  return (
    <button
      type="button"
      onClick={() => setTheme(dark ? 'light' : 'dark')}
      aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={dark ? 'Light mode' : 'Dark mode'}
      className={cn(
        'size-11 shrink-0 grid place-items-center rounded-ctl text-walnut hover:text-ink hover:bg-sunk transition-colors',
        className,
      )}
    >
      {/* Render nothing until mounted so server and client agree. */}
      {theme === null ? <span className="size-[18px]" /> : dark ? <Sun aria-hidden className="size-[18px] stroke-[1.5]" /> : <Moon aria-hidden className="size-[18px] stroke-[1.5]" />}
    </button>
  );
}
