'use client';

// The one hand-drawn mark on the landing page: a wobbly terracotta underline
// that draws itself once (350ms) after the headline settles.
import React from 'react';
import { motion, useReducedMotion } from 'motion/react';

export function HandUnderline({ children }: { children: React.ReactNode }) {
  const reduce = useReducedMotion();
  return (
    <span className="relative inline-block">
      {children}
      <svg
        aria-hidden
        viewBox="0 0 300 18"
        preserveAspectRatio="none"
        className="absolute left-[-2%] -bottom-[0.18em] w-[104%] h-[0.32em] overflow-visible"
      >
        <motion.path
          d="M3 11 C 48 4, 96 14, 150 8 S 252 5, 297 10"
          fill="none"
          stroke="rgb(var(--accent))"
          strokeWidth="5"
          strokeLinecap="round"
          initial={reduce ? false : { pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.38, delay: 0.75, ease: 'easeOut' }}
        />
      </svg>
    </span>
  );
}
