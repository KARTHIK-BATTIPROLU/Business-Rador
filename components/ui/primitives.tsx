import React from 'react';
import { cn } from '@/lib/utils';
import type { OutreachStatus } from '@/lib/types';
import { STATUS_META, STATUS_ORDER } from '@/lib/lead';
import { ChevronDown } from 'lucide-react';

/* Card — hairline panel, no shadow. */
export function Card({ className, as: As = 'div', ...p }: React.HTMLAttributes<HTMLElement> & { as?: React.ElementType }) {
  return <As className={cn('bg-surface border border-hairline rounded-panel', className)} {...p} />;
}

/* Badge — small square-cornered label. `tone="flag"` is the terracotta "no website" mark. */
export function Badge({
  tone = 'plain',
  className,
  children,
}: {
  tone?: 'plain' | 'flag' | 'sample' | 'quiet';
  className?: string;
  children: React.ReactNode;
}) {
  const tones = {
    plain: 'border-hairline text-walnut bg-surface',
    quiet: 'border-transparent text-walnut bg-sunk',
    flag: 'border-accent/50 text-accent-strong bg-accent-wash/60',
    sample: 'border-dashed border-tan text-walnut bg-paper',
  } as const;
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 h-6 px-2 rounded-ctl border text-xs font-medium leading-none whitespace-nowrap [&_svg]:size-3.5 [&_svg]:stroke-[1.5]',
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

/* StatusDot + label. Colour is never the only signal: the word is always there. */
export function StatusLabel({ status, className }: { status: OutreachStatus; className?: string }) {
  const m = STATUS_META[status] ?? STATUS_META.new;
  return (
    <span className={cn('inline-flex items-center gap-1.5 text-xs font-medium', m.text, className)}>
      <span aria-hidden className={cn('size-2 rounded-full', m.dot)} />
      {m.label}
    </span>
  );
}

/* Inline status changer: a native select (free keyboard + screen reader support) dressed as a label. */
export function StatusSelect({
  value,
  onChange,
  className,
  id,
}: {
  value: OutreachStatus;
  onChange: (s: OutreachStatus) => void;
  className?: string;
  id?: string;
}) {
  const m = STATUS_META[value] ?? STATUS_META.new;
  return (
    <label className={cn('relative inline-flex items-center h-9 rounded-ctl border border-hairline bg-surface hover:border-ink transition-colors', className)}>
      <span className="sr-only">Outreach status</span>
      <span aria-hidden className={cn('absolute left-2.5 size-2 rounded-full', m.dot)} />
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value as OutreachStatus)}
        onClick={(e) => e.stopPropagation()}
        className={cn('appearance-none bg-transparent h-full pl-6 pr-7 text-xs font-medium cursor-pointer outline-none rounded-ctl', m.text)}
      >
        {STATUS_ORDER.map((s) => (
          <option key={s} value={s}>
            {STATUS_META[s].label}
          </option>
        ))}
      </select>
      <ChevronDown aria-hidden className="absolute right-2 size-3.5 stroke-[1.5] text-tan pointer-events-none" />
    </label>
  );
}

/* Skeleton block (shimmer stops under reduced motion via globals.css). */
export function Skeleton({ className }: { className?: string }) {
  return <div aria-hidden className={cn('skeleton', className)} />;
}

/* Text input. */
export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(function Input(
  { className, ...p },
  ref,
) {
  return (
    <input
      ref={ref}
      className={cn(
        'h-11 w-full rounded-ctl border border-hairline bg-sunk/60 px-3 text-sm text-ink placeholder:text-walnut/70 outline-none focus:border-ink focus:bg-surface transition-colors',
        className,
      )}
      {...p}
    />
  );
});

/* Field label used in filter popover / forms. */
export function FieldLabel({ htmlFor, children }: { htmlFor?: string; children: React.ReactNode }) {
  return (
    <label htmlFor={htmlFor} className="block text-xs font-medium text-walnut mb-1.5">
      {children}
    </label>
  );
}

/* Styled native select. */
export function Select({ className, children, ...p }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <div className="relative">
      <select
        className={cn(
          'appearance-none h-11 w-full rounded-ctl border border-hairline bg-surface pl-3 pr-8 text-sm text-ink outline-none focus:border-ink cursor-pointer',
          className,
        )}
        {...p}
      >
        {children}
      </select>
      <ChevronDown aria-hidden className="absolute right-2.5 top-1/2 center-y size-4 stroke-[1.5] text-tan pointer-events-none" />
    </div>
  );
}

/* Wordmark: a small hand-set radar glyph + name. */
export function Wordmark({ className }: { className?: string; compact?: boolean }) {
  return (
    <span className={cn('inline-flex items-center gap-2 text-ink', className)}>
      <svg viewBox="0 0 24 24" className="size-6" aria-hidden fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="12" cy="12" r="9.25" />
        <circle cx="12" cy="12" r="5" strokeDasharray="2 2.2" />
        <path d="M12 12 L19.2 6.6" strokeLinecap="round" />
        <circle cx="15.6" cy="9.4" r="1.6" fill="rgb(var(--accent))" stroke="none" />
      </svg>
      <span className="font-display text-base sm:text-lg leading-none tracking-display whitespace-nowrap">
        Business Radar
      </span>
    </span>
  );
}
