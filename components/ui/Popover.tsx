'use client';

import React, { useEffect, useId, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { cn } from '@/lib/utils';

/**
 * Minimal accessible popover / menu. Click or Enter opens, Escape and outside
 * click close, focus moves into the panel and returns to the trigger.
 */
export function Popover({
  trigger,
  children,
  align = 'start',
  label,
  className,
  panelClassName,
  role = 'dialog',
}: {
  trigger: (p: { open: boolean; toggle: () => void; props: React.ButtonHTMLAttributes<HTMLButtonElement> & { ref: React.Ref<HTMLButtonElement> } }) => React.ReactNode;
  children: React.ReactNode | ((close: () => void) => React.ReactNode);
  align?: 'start' | 'end';
  label: string;
  className?: string;
  panelClassName?: string;
  role?: 'dialog' | 'menu';
}) {
  const [open, setOpen] = useState(false);
  const id = useId();
  const btn = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const close = () => {
    setOpen(false);
    btn.current?.focus();
  };

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && close();
    const onDown = (e: MouseEvent) => {
      if (!panel.current?.contains(e.target as Node) && !btn.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('mousedown', onDown);
    const first = panel.current?.querySelector<HTMLElement>('button, a, select, input, [tabindex]:not([tabindex="-1"])');
    first?.focus();
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('mousedown', onDown);
    };
  }, [open]);

  // Arrow-key navigation for menus.
  const onPanelKey = (e: React.KeyboardEvent) => {
    if (role !== 'menu' || !['ArrowDown', 'ArrowUp'].includes(e.key)) return;
    e.preventDefault();
    const items = Array.from(panel.current?.querySelectorAll<HTMLElement>('[role="menuitem"]') ?? []);
    const i = items.indexOf(document.activeElement as HTMLElement);
    const next = e.key === 'ArrowDown' ? (i + 1) % items.length : (i - 1 + items.length) % items.length;
    items[next]?.focus();
  };

  return (
    <div className={cn('relative', className)}>
      {trigger({
        open,
        toggle: () => setOpen((o) => !o),
        props: {
          ref: btn,
          'aria-expanded': open,
          'aria-controls': id,
          'aria-haspopup': role === 'menu' ? 'menu' : 'dialog',
          onClick: (e) => {
            e.stopPropagation();
            setOpen((o) => !o);
          },
        },
      })}
      <AnimatePresence>
        {open && (
          <motion.div
            ref={panel}
            id={id}
            role={role}
            aria-label={label}
            onKeyDown={onPanelKey}
            onClick={(e) => e.stopPropagation()}
            initial={reduce ? false : { opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, y: -4 }}
            transition={{ duration: 0.16, ease: 'easeOut' }}
            className={cn(
              'absolute z-50 mt-2 min-w-[220px] rounded-panel border border-ink bg-surface p-2 shadow-hard',
              align === 'end' ? 'right-0' : 'left-0',
              panelClassName,
            )}
          >
            {typeof children === 'function' ? children(close) : children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function MenuItem({
  href,
  onSelect,
  children,
  external,
}: {
  href?: string;
  onSelect?: () => void;
  children: React.ReactNode;
  external?: boolean;
}) {
  const cls =
    'flex w-full items-center gap-2.5 h-10 px-2.5 rounded-ctl text-sm text-ink hover:bg-sunk focus:bg-sunk outline-none [&_svg]:size-4 [&_svg]:stroke-[1.5] [&_svg]:text-walnut';
  if (href)
    return (
      <a role="menuitem" href={href} className={cls} {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>
        {children}
      </a>
    );
  return (
    <button role="menuitem" type="button" onClick={onSelect} className={cls}>
      {children}
    </button>
  );
}
