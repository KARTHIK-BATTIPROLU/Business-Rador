'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { NumberTicker } from '@/components/motion/NumberTicker';

/** Compact score: mono number with a thin arc. Terracotta arc only at 85+ ("hot"). */
export function ScoreDial({ score, size = 44, animate = false, className }: { score: number; size?: number; animate?: boolean; className?: string }) {
  const r = size / 2 - 3;
  const c = 2 * Math.PI * r;
  const hot = score >= 85;
  return (
    <div
      className={cn('relative shrink-0 grid place-items-center rounded-full', className)}
      style={{ width: size, height: size }}
      role="img"
      aria-label={`Lead score ${score} out of 100${hot ? ', hot lead' : ''}`}
    >
      <svg width={size} height={size} className="absolute inset-0 -rotate-90" aria-hidden>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgb(var(--hairline))" strokeWidth="1.5" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={hot ? 'rgb(var(--accent))' : 'rgb(var(--ink))'}
          strokeWidth="2"
          strokeLinecap="round"
          strokeDasharray={`${(score / 100) * c} ${c}`}
        />
      </svg>
      <span className="font-mono tabular text-sm font-medium text-ink" aria-hidden>
        {animate ? <NumberTicker value={score} /> : score}
      </span>
    </div>
  );
}

/** The rotated rubber stamp — used once, on the lead dossier. */
export function ScoreStamp({ score, className }: { score: number; className?: string }) {
  const hot = score >= 85;
  return (
    <div
      className={cn(
        'inline-flex flex-col items-center justify-center -rotate-6 border-2 rounded-ctl px-4 py-2 select-none',
        hot ? 'border-accent text-accent-strong' : 'border-ink text-ink',
        className,
      )}
      role="img"
      aria-label={`Lead score ${score} out of 100`}
      style={{ boxShadow: 'inset 0 0 0 3px rgb(var(--surface)), inset 0 0 0 4px currentColor' }}
    >
      <span className="font-mono tabular text-3xl font-semibold leading-none" aria-hidden>
        <NumberTicker value={score} />
      </span>
      <span className="text-2xs font-medium mt-1" aria-hidden>
        {hot ? 'hot lead' : 'lead score'} / 100
      </span>
    </div>
  );
}
