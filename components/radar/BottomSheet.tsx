'use client';

import React, { useRef } from 'react';
import { motion, useReducedMotion } from 'motion/react';

export type Snap = 'peek' | 'half' | 'full';
const ORDER: Snap[] = ['peek', 'half', 'full'];

const heightFor = (s: Snap) => (s === 'peek' ? '136px' : s === 'half' ? '52dvh' : 'calc(100dvh - 72px)');

/**
 * Mobile bottom sheet with three snap heights. Drag the handle, or tap / press
 * Enter on it to step through peek → half → full.
 */
export function BottomSheet({
  snap,
  onSnap,
  label,
  children,
}: {
  snap: Snap;
  onSnap: (s: Snap) => void;
  label: string;
  children: React.ReactNode;
}) {
  const reduce = useReducedMotion();
  const start = useRef<{ y: number; t: number } | null>(null);

  const onDown = (e: React.PointerEvent) => {
    start.current = { y: e.clientY, t: Date.now() };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };
  const onUp = (e: React.PointerEvent) => {
    if (!start.current) return;
    const dy = e.clientY - start.current.y;
    start.current = null;
    const i = ORDER.indexOf(snap);
    if (Math.abs(dy) < 8) {
      onSnap(ORDER[(i + 1) % ORDER.length]);
      return;
    }
    const steps = Math.abs(dy) > 220 ? 2 : 1;
    onSnap(ORDER[Math.max(0, Math.min(2, dy < 0 ? i + steps : i - steps))]);
  };

  return (
    <motion.section
      aria-label={label}
      className="fixed inset-x-0 bottom-0 z-30 flex flex-col rounded-t-panel border-t border-x border-ink bg-surface md:hidden"
      initial={false}
      animate={{ height: heightFor(snap) }}
      transition={reduce ? { duration: 0 } : { type: 'spring', stiffness: 380, damping: 34, mass: 0.9 }}
    >
      <button
        type="button"
        onPointerDown={onDown}
        onPointerUp={onUp}
        onKeyDown={(e) => {
          if (e.key === 'ArrowUp') onSnap(ORDER[Math.min(2, ORDER.indexOf(snap) + 1)]);
          if (e.key === 'ArrowDown') onSnap(ORDER[Math.max(0, ORDER.indexOf(snap) - 1)]);
        }}
        onClick={(e) => {
          // keyboard "click" (Enter/Space) has detail 0; pointer taps are handled in onPointerUp
          if (e.detail === 0) onSnap(ORDER[(ORDER.indexOf(snap) + 1) % ORDER.length]);
        }}
        aria-label={`Resize list, currently ${snap === 'peek' ? 'collapsed' : snap === 'half' ? 'half height' : 'full height'}`}
        className="h-7 w-full shrink-0 grid place-items-center touch-none cursor-grab"
      >
        <span aria-hidden className="h-1 w-10 rounded-full bg-hairline" />
      </button>
      <div className="flex-1 min-h-0 flex flex-col">{children}</div>
    </motion.section>
  );
}
