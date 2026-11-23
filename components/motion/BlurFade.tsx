'use client';

// Adapted from Magic UI "Blur Fade" (MIT, listed on 21st.dev). Shorter travel,
// 300ms ease-out, once per element, and nothing at all under reduced motion.
import React, { useRef } from 'react';
import { motion, useInView, useReducedMotion } from 'motion/react';

export function BlurFade({
  children,
  className,
  delay = 0,
  y = 6,
  as = 'div',
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  y?: number;
  as?: 'div' | 'li' | 'section';
}) {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: '-40px' });
  const reduce = useReducedMotion();
  const M = motion[as] as typeof motion.div;
  if (reduce) {
    const Tag = as;
    return <Tag className={className}>{children}</Tag>;
  }
  return (
    <M
      ref={ref as React.Ref<HTMLDivElement>}
      className={className}
      initial={{ opacity: 0, y, filter: 'blur(4px)' }}
      animate={inView ? { opacity: 1, y: 0, filter: 'blur(0px)' } : undefined}
      transition={{ duration: 0.3, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </M>
  );
}
