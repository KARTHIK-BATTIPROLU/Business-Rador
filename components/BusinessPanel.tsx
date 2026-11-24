'use client';

import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { Business, OutreachStatus } from '@/lib/types';
import { BusinessCard } from './BusinessCard';
import { RefreshCw, Radar, Eye } from 'lucide-react';
import { Skeleton } from '@/components/ui/primitives';
import { Button } from '@/components/ui/Button';
import { daysSinceLaunch } from '@/lib/lead';
import { cn } from '@/lib/utils';

export type SortKey = 'score' | 'newest' | 'launch' | 'name';

interface BusinessPanelProps {
  businesses: Business[];
  selectedId?: string | null;
  onSelectBusiness: (b: Business) => void;
  onStatusChange: (id: string, status: OutreachStatus, notes?: string) => void;
  onRefresh?: () => void;
  onTriggerScan?: () => void;
  onPreviewSamples?: () => void;
  isScanning?: boolean;
  isLoading?: boolean;
  error?: string | null;
  header?: React.ReactNode;
  className?: string;
  hovered?: { id: string; from: 'map' | 'list' } | null;
  onHover?: (id: string | null) => void;
}

const sorters: Record<SortKey, (a: Business, b: Business) => number> = {
  score: (a, b) => b.lead_score - a.lead_score,
  newest: (a, b) => new Date(b.first_seen_at).getTime() - new Date(a.first_seen_at).getTime(),
  launch: (a, b) => (daysSinceLaunch(a) ?? 9999) - (daysSinceLaunch(b) ?? 9999),
  name: (a, b) => a.name.localeCompare(b.name),
};

export const BusinessPanel: React.FC<BusinessPanelProps> = ({
  businesses,
  selectedId,
  onSelectBusiness,
  onStatusChange,
  onRefresh,
  onTriggerScan,
  onPreviewSamples,
  isScanning,
  isLoading,
  error,
  header,
  className,
  hovered,
  onHover,
}) => {
  const [sortBy, setSortBy] = useState<SortKey>('score');
  const refs = useRef<Record<string, HTMLDivElement | null>>({});
  const listRef = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();

  useEffect(() => {
    if (selectedId) refs.current[selectedId]?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'nearest' });
  }, [selectedId, reduce]);

  // A pin hovered on the map scrolls its card into view.
  useEffect(() => {
    if (hovered?.from === 'map') refs.current[hovered.id]?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'nearest' });
  }, [hovered, reduce]);

  const sorted = [...businesses].sort(sorters[sortBy]);

  // ↑/↓ move between cards.
  const onListKey = (e: React.KeyboardEvent) => {
    if (!['ArrowDown', 'ArrowUp'].includes(e.key)) return;
    const cards = Array.from(listRef.current?.querySelectorAll<HTMLElement>('article[tabindex]') ?? []);
    const i = cards.indexOf(document.activeElement as HTMLElement);
    if (i === -1) return;
    e.preventDefault();
    cards[e.key === 'ArrowDown' ? Math.min(i + 1, cards.length - 1) : Math.max(i - 1, 0)]?.focus();
  };

  return (
    <section aria-label="Leads" data-tour="list" className={cn('flex flex-col h-full min-h-0', className)}>
      <div className="px-4 pt-4 pb-3 border-b border-hairline space-y-3">
        {header}
        <div className="flex items-center justify-between gap-2">
          <label className="flex items-center gap-2 text-xs text-walnut">
            Sort
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortKey)}
              className="h-9 rounded-ctl border border-hairline bg-surface px-2 text-sm text-ink outline-none focus:border-ink cursor-pointer"
            >
              <option value="score">Best score</option>
              <option value="launch">Newest shop</option>
              <option value="newest">Recently spotted</option>
              <option value="name">Name</option>
            </select>
          </label>
          {onRefresh && (
            <button
              type="button"
              onClick={onRefresh}
              disabled={isLoading}
              className="inline-flex items-center gap-1.5 h-9 px-2.5 rounded-ctl text-xs text-walnut hover:text-ink hover:bg-sunk disabled:opacity-50"
            >
              <RefreshCw aria-hidden className="size-3.5 stroke-[1.5]" /> {isLoading ? 'Refreshing' : 'Refresh'}
            </button>
          )}
        </div>
      </div>

      <div ref={listRef} onKeyDown={onListKey} className="flex-1 min-h-0 overflow-y-auto overscroll-contain p-3 sm:p-4">
        <AnimatePresence mode="wait" initial={false}>
        {isLoading && businesses.length === 0 ? (
          <motion.ul key="loading" exit={{ opacity: 0 }} transition={{ duration: 0.15 }} className="space-y-3" aria-label="Loading leads">
            {[0, 1, 2, 3].map((i) => (
              <li key={i} className="rounded-panel border border-hairline bg-surface p-4 space-y-3">
                <div className="flex justify-between gap-3">
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-5 w-3/5" />
                    <Skeleton className="h-3 w-2/5" />
                  </div>
                  <Skeleton className="size-11 rounded-full" />
                </div>
                <Skeleton className="h-3.5 w-4/5" />
                <Skeleton className="h-9 w-full" />
              </li>
            ))}
            <li className="sr-only" role="status">
              Loading leads
            </li>
          </motion.ul>
        ) : error ? (
          <motion.div key="error" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} role="alert" className="rounded-panel border border-status-interested/50 bg-surface p-5">
            <h3 className="text-lg">The radar couldn&apos;t load leads.</h3>
            <p className="mt-2 text-sm text-walnut">{error}</p>
            <p className="mt-2 text-sm text-walnut">Check your connection, then try again. Your notes are safe.</p>
            {onRefresh && (
              <Button onClick={onRefresh} variant="ink" size="sm" className="mt-4">
                Try again
              </Button>
            )}
          </motion.div>
        ) : sorted.length === 0 ? (
          <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="px-2 py-10">
            <Radar aria-hidden className="size-7 stroke-[1.5] text-tan" />
            <h3 className="mt-4 text-xl">Nothing here yet.</h3>
            <p className="mt-2 text-sm text-walnut max-w-[34ch]">
              Either no scan has run, or your filters are too tight. A scan usually finishes in under half a minute.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              {onTriggerScan && (
                <Button onClick={onTriggerScan} disabled={isScanning} variant="primary" size="md">
                  {isScanning ? 'Scanning…' : 'Run a scan'}
                </Button>
              )}
              {onPreviewSamples && (
                <Button onClick={onPreviewSamples} variant="outline" size="md">
                  <Eye aria-hidden /> Preview with sample leads
                </Button>
              )}
            </div>
          </motion.div>
        ) : (
          <motion.ul key="list" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.25 }} className="space-y-3">
            <AnimatePresence initial={false}>
              {sorted.map((b, idx) => (
                <motion.li
                  key={b.id}
                  layout={reduce ? false : 'position'}
                  initial={reduce ? false : { opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                >
                  <div ref={(el) => { refs.current[b.id] = el; }} data-tour={idx === 0 ? 'lead-card' : undefined}>
                    <BusinessCard
                      business={b}
                      isSelected={b.id === selectedId}
                      onSelect={() => onSelectBusiness(b)}
                      onStatusChange={(status, notes) => onStatusChange(b.id, status, notes)}
                      isHovered={hovered?.from === 'map' && hovered.id === b.id}
                      onHover={onHover ? (h) => onHover(h ? b.id : null) : undefined}
                    />
                  </div>
                </motion.li>
              ))}
            </AnimatePresence>
          </motion.ul>
        )}
        </AnimatePresence>
      </div>
    </section>
  );
};
