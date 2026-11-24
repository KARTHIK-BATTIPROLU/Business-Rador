'use client';

// Ctrl/Cmd+K command bar. Global items (pages, theme, places) live here; pages
// register their own items (leads, page actions) with useCommands().
// Places jump the radar there; typing anything offers "Scan <it>".
import React, { createContext, useCallback, useContext, useEffect, useId, useMemo, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { AnimatePresence, motion } from 'motion/react';
import { ArrowRight, Crosshair, FileText, Map as MapIcon, MapPin, Moon, Search, Sun, Zap } from 'lucide-react';
import { GLOBAL_MARKETS } from '@/lib/geocoding';
import { useTheme } from '@/components/ui/ThemeToggle';
import { useTransitionRouter } from '@/components/motion/ViewTransitions';
import { cn } from '@/lib/utils';

export type Command = {
  id: string;
  group: 'Leads' | 'Places' | 'Actions' | 'Pages';
  label: string;
  hint?: string;
  keywords?: string;
  icon?: React.ReactNode;
  run: () => void;
};

type Registry = { set: (key: string, items: Command[]) => void; open: () => void };
const Ctx = createContext<Registry>({ set: () => {}, open: () => {} });

/** Register page-specific commands while the component is mounted. */
export function useCommands(key: string, items: Command[]) {
  const { set } = useContext(Ctx);
  useEffect(() => {
    set(key, items);
    return () => set(key, []);
  }, [key, items, set]);
}

export const useOpenCommandBar = () => useContext(Ctx).open;

/** Events the radar page listens for, so places work from any page. */
export type RadarGoto = { name: string; coords: [number, number]; marketId?: string; city?: string };
export const RADAR_GOTO = 'radar:goto';
export const RADAR_SCAN_PLACE = 'radar:scan-place';

const PLACES = Object.values(GLOBAL_MARKETS).flatMap((m) =>
  m.cities.flatMap((c) => [
    { name: c.name, hint: m.name, coords: c.coords, marketId: m.id, city: c.name, kind: 'city' as const },
    ...c.corridors.map((k) => ({ name: k.name, hint: `${c.name}, ${m.name}`, coords: k.coords, marketId: m.id, city: c.name, kind: 'area' as const })),
  ]),
);

const score = (c: Command, q: string) => {
  if (!q) return 1;
  const label = c.label.toLowerCase();
  const hay = `${label} ${c.keywords ?? ''} ${c.hint ?? ''}`.toLowerCase();
  if (label.startsWith(q)) return 3;
  if (label.includes(q)) return 2;
  return q.split(/\s+/).every((w) => hay.includes(w)) ? 1 : 0;
};

export function CommandProvider({ children }: { children: React.ReactNode }) {
  const [registered, setRegistered] = useState<Record<string, Command[]>>({});
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const returnFocus = useRef<HTMLElement | null>(null);
  const listId = useId();
  const pathname = usePathname();
  const go = useTransitionRouter();
  const [theme, setTheme] = useTheme();

  const set = useCallback((key: string, items: Command[]) => setRegistered((r) => ({ ...r, [key]: items })), []);
  const openBar = useCallback(() => {
    returnFocus.current = document.activeElement as HTMLElement;
    setQ('');
    setActive(0);
    setOpen(true);
  }, []);
  const close = useCallback(() => {
    setOpen(false);
    requestAnimationFrame(() => returnFocus.current?.focus?.());
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (open) close();
        else openBar();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, openBar, close]);

  useEffect(() => {
    if (open) requestAnimationFrame(() => inputRef.current?.focus());
  }, [open]);

  const onRadar = pathname === '/radar';

  const globalItems = useMemo<Command[]>(() => {
    const pages: Command[] = [
      { id: 'p-map', group: 'Pages', label: 'Open the map', icon: <MapIcon aria-hidden />, run: () => go('/radar') },
      { id: 'p-home', group: 'Pages', label: 'Home page', keywords: 'landing', icon: <ArrowRight aria-hidden />, run: () => go('/') },
      {
        id: 'p-theme',
        group: 'Actions',
        label: theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode',
        keywords: 'theme dark light colour color',
        icon: theme === 'dark' ? <Sun aria-hidden /> : <Moon aria-hidden />,
        run: () => setTheme(theme === 'dark' ? 'light' : 'dark', { x: innerWidth / 2, y: 80 }),
      },
    ];
    const places: Command[] = PLACES.map((p) => ({
      id: `pl-${p.kind}-${p.name}-${p.hint}`,
      group: 'Places',
      label: p.name,
      hint: p.hint,
      icon: <MapPin aria-hidden />,
      run: () => {
        const detail: RadarGoto = { name: p.name, coords: p.coords, marketId: p.marketId, city: p.city };
        if (onRadar) window.dispatchEvent(new CustomEvent(RADAR_GOTO, { detail }));
        else go(`/radar?go=${encodeURIComponent(p.name)}`);
      },
    }));
    return [...pages, ...places];
  }, [go, onRadar, setTheme, theme]);

  const query = q.trim().toLowerCase();
  const results = useMemo(() => {
    const all = [...Object.values(registered).flat(), ...globalItems];
    const ranked = all
      .map((c) => ({ c, s: score(c, query) }))
      .filter((x) => x.s > 0)
      .sort((a, b) => b.s - a.s);
    // Without a query, keep it short: actions and pages, then a few places.
    const perGroup: Record<string, number> = query ? { Leads: 6, Places: 6, Actions: 6, Pages: 4 } : { Leads: 4, Places: 4, Actions: 6, Pages: 4 };
    const counts: Record<string, number> = {};
    const out: Command[] = [];
    for (const { c } of ranked) {
      counts[c.group] = (counts[c.group] ?? 0) + 1;
      if (counts[c.group] <= perGroup[c.group]) out.push(c);
    }
    if (query.length > 1) {
      out.unshift({
        id: 'scan-typed',
        group: 'Actions',
        label: `Scan “${q.trim()}”`,
        hint: 'Find this place and look for new shops',
        icon: <Crosshair aria-hidden />,
        run: () => {
          if (onRadar) window.dispatchEvent(new CustomEvent(RADAR_SCAN_PLACE, { detail: q.trim() }));
          else go(`/radar?scan=${encodeURIComponent(q.trim())}`);
        },
      });
    }
    const order = ['Actions', 'Leads', 'Places', 'Pages'];
    return out.sort((a, b) => order.indexOf(a.group) - order.indexOf(b.group));
  }, [registered, globalItems, query, q, onRadar, go]);

  useEffect(() => setActive(0), [query]);

  const runAt = (i: number) => {
    const c = results[i];
    if (!c) return;
    setOpen(false);
    c.run();
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActive((a) => Math.min(a + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      runAt(active);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      close();
    }
  };

  useEffect(() => {
    document.getElementById(`${listId}-${active}`)?.scrollIntoView({ block: 'nearest' });
  }, [active, listId]);

  let lastGroup = '';

  return (
    <Ctx.Provider value={{ set, open: openBar }}>
      {children}
      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-[80] flex items-start justify-center bg-scrim/40 px-3 pt-[12vh]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onMouseDown={(e) => e.target === e.currentTarget && close()}
          >
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label="Command bar"
              initial={{ opacity: 0, y: -8, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -6, scale: 0.98 }}
              transition={{ type: 'spring', stiffness: 520, damping: 38 }}
              className="w-full max-w-[600px] overflow-hidden rounded-panel border border-ink bg-surface shadow-hard"
            >
              <div className="flex items-center gap-2 border-b border-hairline px-4">
                <Search aria-hidden className="size-4 stroke-[1.5] text-tan" />
                <input
                  ref={inputRef}
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  onKeyDown={onKeyDown}
                  role="combobox"
                  aria-expanded="true"
                  aria-controls={listId}
                  aria-activedescendant={results[active] ? `${listId}-${active}` : undefined}
                  aria-label="Search shops, places and actions"
                  placeholder="Jump to a shop, a city or an action…"
                  className="h-14 flex-1 bg-transparent text-base text-ink placeholder:text-walnut/70 outline-none"
                />
                <kbd className="font-mono text-2xs text-walnut border border-hairline rounded px-1.5 py-0.5">esc</kbd>
              </div>
              <ul id={listId} role="listbox" className="max-h-[56vh] overflow-y-auto overscroll-contain p-2">
                {results.length === 0 && <li className="px-3 py-6 text-sm text-walnut">Nothing matches. Try a city, a neighbourhood or a shop name.</li>}
                {results.map((c, i) => {
                  const header = c.group !== lastGroup ? c.group : null;
                  lastGroup = c.group;
                  return (
                    <React.Fragment key={c.id}>
                      {header && (
                        <li role="presentation" className="px-3 pt-3 pb-1 text-2xs font-medium text-walnut">
                          {header}
                        </li>
                      )}
                      <li
                        id={`${listId}-${i}`}
                        role="option"
                        aria-selected={i === active}
                        onMouseMove={() => setActive(i)}
                        onClick={() => runAt(i)}
                        className={cn(
                          'relative flex items-center gap-3 h-11 px-3 rounded-ctl cursor-pointer text-sm [&_svg]:size-4 [&_svg]:stroke-[1.5] [&_svg]:shrink-0',
                          i === active ? 'text-ink' : 'text-ink/90',
                        )}
                      >
                        {i === active && (
                          <motion.span layoutId="cmd-active" aria-hidden className="absolute inset-0 rounded-ctl bg-accent-wash" transition={{ type: 'spring', stiffness: 600, damping: 44 }} />
                        )}
                        <span className="relative text-walnut">{c.icon ?? <Zap aria-hidden />}</span>
                        <span className="relative truncate">{c.label}</span>
                        {c.hint && <span className="relative ml-auto truncate text-xs text-walnut">{c.hint}</span>}
                      </li>
                    </React.Fragment>
                  );
                })}
              </ul>
              <div className="flex items-center gap-4 border-t border-hairline px-4 h-10 text-2xs text-walnut">
                <span>
                  <kbd className="font-mono">↑↓</kbd> move
                </span>
                <span>
                  <kbd className="font-mono">enter</kbd> open
                </span>
                <span className="ml-auto inline-flex items-center gap-1">
                  <FileText aria-hidden className="size-3 stroke-[1.5]" /> Ctrl K anywhere
                </span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </Ctx.Provider>
  );
}
