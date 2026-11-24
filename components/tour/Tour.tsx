'use client';

// Guided tour: a spotlight cut out of a dim overlay around the step's target,
// with a card beside it. The spotlight and card glide between steps.
// Targets are CSS selectors; the first visible match is used. A step whose
// target isn't on screen (e.g. hidden on mobile) shows as a centred card.
import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ArrowLeft, ArrowRight, X } from 'lucide-react';
import { buttonClass } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

export type TourStep = {
  id: string;
  target?: string;
  title: string;
  body: React.ReactNode;
  /** Runs when the step opens (e.g. select a lead so the drawer exists). */
  onEnter?: () => void;
  /** Padding around the spotlight, px. */
  pad?: number;
};

type Rect = { top: number; left: number; width: number; height: number };

const visibleMatch = (selector: string): HTMLElement | null => {
  const els = Array.from(document.querySelectorAll<HTMLElement>(selector));
  return (
    els.find((el) => {
      const r = el.getBoundingClientRect();
      const st = getComputedStyle(el);
      return r.width > 0 && r.height > 0 && st.visibility !== 'hidden' && r.bottom > 0 && r.top < innerHeight;
    }) ?? null
  );
};

export function Tour({
  steps,
  open,
  onClose,
}: {
  steps: TourStep[];
  open: boolean;
  onClose: (finished: boolean) => void;
}) {
  const [i, setI] = useState(0);
  const [rect, setRect] = useState<Rect | null>(null);
  const [vw, setVw] = useState(0);
  const cardRef = useRef<HTMLDivElement>(null);
  const [cardH, setCardH] = useState(200);
  const step = steps[i];

  useEffect(() => {
    if (open) setI(0);
  }, [open]);

  // Run the step's setup, then track its target while things settle.
  useEffect(() => {
    if (!open || !step) return;
    step.onEnter?.();
    let raf = 0;
    const until = performance.now() + 900;
    const measure = () => {
      setVw(innerWidth);
      const el = step.target ? visibleMatch(step.target) : null;
      if (el) {
        el.scrollIntoView({ block: 'nearest', inline: 'nearest' });
        const r = el.getBoundingClientRect();
        const pad = step.pad ?? 6;
        setRect({ top: r.top - pad, left: r.left - pad, width: r.width + pad * 2, height: r.height + pad * 2 });
      } else setRect(null);
      if (performance.now() < until) raf = requestAnimationFrame(measure);
    };
    measure();
    const onResize = () => measure();
    addEventListener('resize', onResize);
    return () => {
      cancelAnimationFrame(raf);
      removeEventListener('resize', onResize);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, i]);

  useLayoutEffect(() => {
    if (cardRef.current) setCardH(cardRef.current.offsetHeight);
  }, [open, i, vw]);

  useEffect(() => {
    if (open) cardRef.current?.focus();
  }, [open, i]);

  const next = useCallback(() => (i < steps.length - 1 ? setI(i + 1) : onClose(true)), [i, steps.length, onClose]);
  const prev = useCallback(() => setI((x) => Math.max(0, x - 1)), []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose(false);
      else if (e.key === 'ArrowRight') next();
      else if (e.key === 'ArrowLeft') prev();
    };
    addEventListener('keydown', onKey);
    return () => removeEventListener('keydown', onKey);
  }, [open, next, prev, onClose]);

  // Card placement: below the target if it fits, else above, else centred.
  const W = Math.min(360, (vw || 360) - 24);
  let cardPos: { top: number; left: number };
  if (rect && vw) {
    const below = rect.top + rect.height + 12;
    const above = rect.top - 12 - cardH;
    const top = below + cardH < innerHeight - 12 ? below : above > 12 ? above : Math.max(12, innerHeight - cardH - 12);
    const left = Math.min(Math.max(12, rect.left + rect.width / 2 - W / 2), vw - W - 12);
    cardPos = { top, left };
  } else {
    cardPos = { top: Math.max(24, (typeof innerHeight === 'number' ? innerHeight : 600) / 2 - cardH / 2), left: Math.max(12, ((vw || 360) - W) / 2) };
  }

  return (
    <AnimatePresence>
      {open && step && (
        <motion.div
          key="tour"
          className="fixed inset-0 z-[90]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {/* Click-blocker; the spotlight's huge shadow does the dimming. */}
          <div className="absolute inset-0" onClick={() => onClose(false)} aria-hidden />
          <motion.div
            aria-hidden
            className="absolute rounded-panel pointer-events-none ring-2 ring-accent"
            initial={false}
            animate={
              rect
                ? { top: rect.top, left: rect.left, width: rect.width, height: rect.height, opacity: 1 }
                : { top: innerHeight / 2, left: innerWidth / 2, width: 0, height: 0, opacity: 1 }
            }
            transition={{ type: 'spring', stiffness: 260, damping: 32 }}
            style={{ boxShadow: '0 0 0 9999px rgb(var(--scrim) / 0.55)' }}
          />

          <motion.div
            ref={cardRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={`tour-${step.id}`}
            tabIndex={-1}
            initial={false}
            animate={{ top: cardPos.top, left: cardPos.left }}
            transition={{ type: 'spring', stiffness: 300, damping: 34 }}
            style={{ width: W }}
            className="absolute rounded-panel border border-ink bg-surface p-5 shadow-hard outline-none"
          >
            <div className="flex items-start justify-between gap-3">
              <p className="font-mono text-2xs text-walnut tabular">
                {i + 1} of {steps.length}
              </p>
              <button type="button" onClick={() => onClose(false)} aria-label="End tour" className="-mr-2 -mt-2 size-9 grid place-items-center rounded-ctl text-walnut hover:text-ink hover:bg-sunk">
                <X aria-hidden className="size-4 stroke-[1.5]" />
              </button>
            </div>
            <AnimatePresence mode="wait" initial={false}>
              <motion.div key={step.id} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.16 }}>
                <h2 id={`tour-${step.id}`} className="mt-1 text-xl leading-tight">
                  {step.title}
                </h2>
                <div className="mt-2 text-sm text-walnut leading-relaxed">{step.body}</div>
              </motion.div>
            </AnimatePresence>

            <div className="mt-5 flex items-center gap-2">
              <div className="flex gap-1 mr-auto" aria-hidden>
                {steps.map((s, k) => (
                  <span key={s.id} className={cn('h-1.5 rounded-full transition-all duration-300', k === i ? 'w-5 bg-accent' : k < i ? 'w-1.5 bg-ink' : 'w-1.5 bg-hairline')} />
                ))}
              </div>
              {i > 0 && (
                <button type="button" onClick={prev} className={buttonClass('ghost', 'sm')} aria-label="Previous step">
                  <ArrowLeft aria-hidden />
                </button>
              )}
              <button type="button" onClick={next} className={buttonClass(i === steps.length - 1 ? 'primary' : 'ink', 'sm')}>
                {i === steps.length - 1 ? 'Start finding leads' : 'Next'}
                {i < steps.length - 1 && <ArrowRight aria-hidden />}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
