'use client';

// Page-to-page transitions with the browser's View Transitions API.
// - Every internal navigation made through <TransitionLink> (or navigateWithTransition)
//   cross-fades; elements that share a `view-transition-name` on both pages morph
//   (lead card -> lead page header).
// - The callback handed to startViewTransition stays pending until the new route
//   has actually rendered (pathname change), so the browser captures the right frame.
// - Browsers without the API, and anyone with reduced motion, just navigate.
import React, { useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

type VTDocument = Document & { startViewTransition?: (cb: () => Promise<void> | void) => { finished: Promise<void> } };

let resolvePending: (() => void) | null = null;

export const canViewTransition = () =>
  typeof document !== 'undefined' &&
  typeof (document as VTDocument).startViewTransition === 'function' &&
  !window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Run a DOM update inside a view transition when supported. */
export function withViewTransition(update: () => void | Promise<void>) {
  if (!canViewTransition()) {
    void update();
    return null;
  }
  return (document as VTDocument).startViewTransition!(update);
}

/** Mount once (layout). Resolves the pending transition when the route changes. */
export function ViewTransitionRouteWatcher() {
  const pathname = usePathname();
  useEffect(() => {
    if (resolvePending) {
      // Give the new page one frame to paint its first content.
      const r = resolvePending;
      resolvePending = null;
      requestAnimationFrame(() => r());
    }
  }, [pathname]);
  return null;
}

export function useTransitionRouter() {
  const router = useRouter();
  const pathname = usePathname();
  return (href: string) => {
    const target = href.split('#')[0].split('?')[0];
    if (!canViewTransition() || target === pathname) {
      router.push(href);
      return;
    }
    withViewTransition(
      () =>
        new Promise<void>((resolve) => {
          resolvePending = resolve;
          // Never hold the page frozen for long if the route is slow.
          setTimeout(() => {
            if (resolvePending === resolve) {
              resolvePending = null;
              resolve();
            }
          }, 1200);
          router.push(href);
        }),
    );
  };
}

/** Drop-in for next/link that animates the navigation. */
export const TransitionLink = React.forwardRef<HTMLAnchorElement, React.ComponentProps<typeof Link> & { href: string }>(function TransitionLink(
  { href, onClick, ...rest },
  ref,
) {
  const go = useTransitionRouter();
  return (
    <Link
      ref={ref}
      href={href}
      onClick={(e) => {
        onClick?.(e);
        if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
        if (href.startsWith('#')) return;
        e.preventDefault();
        go(href);
      }}
      {...rest}
    />
  );
});
