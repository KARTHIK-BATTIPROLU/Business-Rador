'use client';

import React from 'react';
import { Business } from '@/lib/types';
import { NumberTicker } from '@/components/motion/NumberTicker';
import { isFresh } from '@/lib/lead';
import { cn } from '@/lib/utils';

interface StatsBarProps {
  businesses: Business[];
  selectedArea: string;
  className?: string;
}

const DAILY_TARGET = 10;

/** A sentence, not five KPI tiles. Numbers tick up once when they change. */
export const StatsBar: React.FC<StatsBarProps> = ({ businesses, selectedArea, className }) => {
  const total = businesses.length;
  const noSite = businesses.filter((b) => !b.website).length;
  const fresh = businesses.filter(isFresh).length;
  const today = businesses.filter((b) => Date.now() - new Date(b.first_seen_at).getTime() <= 86_400_000).length;
  const contacted = businesses.filter((b) => b.outreach_status === 'contacted').length;
  const where = selectedArea && selectedArea !== 'all' ? `in ${selectedArea}` : 'on the map';

  if (total === 0) return null;

  const N = ({ v, hot }: { v: number; hot?: boolean }) => (
    <strong className={cn('font-mono font-medium tabular', hot ? 'text-accent-strong' : 'text-ink')}>
      <NumberTicker value={v} key={v} />
    </strong>
  );

  return (
    <p className={cn('text-sm text-walnut leading-relaxed', className)} aria-live="polite">
      <N v={total} /> leads {where}. <N v={noSite} hot /> have no website, <N v={fresh} /> opened in the last month
      {today > 0 && (
        <>
          , <N v={today} /> spotted today
        </>
      )}
      . You&apos;ve contacted <N v={contacted} /> of a daily {DAILY_TARGET}.
    </p>
  );
};
