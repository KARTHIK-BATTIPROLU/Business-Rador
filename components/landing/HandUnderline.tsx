'use client';

// The one hand-made mark on the landing page: a saffron highlighter swipe that
// sweeps in behind a phrase once (380ms) after the headline settles.
import React from 'react';
import { motion, useReducedMotion } from 'motion/react';

export function HandUnderline({ children }: { children: React.ReactNode }) {
  const reduce = useReducedMotion();
  return (
    <span className="relative inline-block isolate text-on-accent">
      <motion.span
        aria-hidden
        className="absolute -z-10 left-[-0.12em] right-[-0.12em] top-[0.18em] bottom-[0.02em] bg-accent-fill/80 rounded-[3px] origin-left"
        style={{ rotate: '-1.2deg', clipPath: 'polygon(0 8%, 100% 0, 99% 92%, 1% 100%)' }}
        initial={reduce ? false : { scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 0.38, delay: 0.7, ease: [0.22, 1, 0.36, 1] }}
      />
      {children}
    </span>
  );
}
