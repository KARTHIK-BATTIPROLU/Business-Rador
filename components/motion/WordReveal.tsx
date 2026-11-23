'use client';

// Word-by-word fade for the single landing headline, once on load.
// Pattern adapted from Magic UI "Text Animate" (by-word, fadeIn) on 21st.dev.
// Screen readers get the plain sentence; the animated spans are aria-hidden.
import React from 'react';
import { motion, useReducedMotion } from 'motion/react';

export function WordReveal({ text, className, children, start = 0 }: { text: string; className?: string; children?: React.ReactNode; start?: number }) {
  const reduce = useReducedMotion();
  const words = text.split(' ');
  return (
    <span className={className}>
      <span className="sr-only">{text}</span>
      <span aria-hidden>
        {words.map((w, i) => (
          <motion.span
            key={i}
            className="inline-block whitespace-pre"
            initial={reduce ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.32, delay: 0.05 + (start + i) * 0.045, ease: [0.22, 1, 0.36, 1] }}
          >
            {w + (i < words.length - 1 ? ' ' : '')}
          </motion.span>
        ))}
        {children}
      </span>
    </span>
  );
}
