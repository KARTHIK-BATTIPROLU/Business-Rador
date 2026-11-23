'use client';

// Adapted from Magic UI "Number Ticker" (MIT, listed on 21st.dev). Restyled to
// tokens: inherits font/colour, tabular figures. Reduced motion shows the final
// value immediately.
import { useEffect, useRef } from 'react';
import { useInView, useMotionValue, useReducedMotion, useSpring } from 'motion/react';
import { cn } from '@/lib/utils';

export function NumberTicker({ value, className, delay = 0 }: { value: number; className?: string; delay?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const reduce = useReducedMotion();
  const mv = useMotionValue(reduce ? value : 0);
  // stiffness/damping tuned to land in ~400ms without overshoot.
  const spring = useSpring(mv, { damping: 40, stiffness: 260 });
  const inView = useInView(ref, { once: true, margin: '0px' });

  useEffect(() => {
    if (!inView) return;
    if (reduce) {
      mv.jump(value);
      return;
    }
    const t = setTimeout(() => mv.set(value), delay * 1000);
    return () => clearTimeout(t);
  }, [inView, value, delay, mv, reduce]);

  useEffect(
    () =>
      spring.on('change', (latest) => {
        if (ref.current) ref.current.textContent = Intl.NumberFormat('en-IN').format(Math.round(latest));
      }),
    [spring],
  );

  return (
    <span ref={ref} className={cn('tabular inline-block', className)}>
      {reduce ? Intl.NumberFormat('en-IN').format(value) : 0}
    </span>
  );
}
