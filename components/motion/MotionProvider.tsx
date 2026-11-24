'use client';

// Every motion animation in the app follows the OS "reduce motion" setting:
// transforms and layout animations are skipped, opacity fades stay.
import { MotionConfig } from 'motion/react';

export function MotionProvider({ children }: { children: React.ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
