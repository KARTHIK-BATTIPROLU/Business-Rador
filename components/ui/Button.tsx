import React from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

type Variant = 'primary' | 'ink' | 'outline' | 'ghost';
type Size = 'sm' | 'md' | 'lg';

const base =
  'inline-flex items-center justify-center gap-2 font-medium whitespace-nowrap rounded-ctl select-none ' +
  'transition-[transform,box-shadow,background-color,color] duration-150 ease-out ' +
  'disabled:opacity-60 disabled:pointer-events-none [&_svg]:shrink-0 [&_svg]:stroke-[1.5]';

const variants: Record<Variant, string> = {
  // The one hard shadow in the system. Lifts on hover, presses flat on active.
  primary:
    'bg-accent-strong text-surface border border-ink shadow-hard-sm hover:-translate-x-px hover:-translate-y-px hover:shadow-hard active:translate-x-0.5 active:translate-y-0.5 active:shadow-none',
  ink: 'bg-ink text-surface border border-ink hover:bg-walnut',
  outline: 'bg-surface text-ink border border-hairline hover:border-ink',
  ghost: 'text-walnut hover:text-ink hover:bg-sunk',
};

const sizes: Record<Size, string> = {
  sm: 'h-9 px-3 text-sm [&_svg]:size-4',
  md: 'h-11 px-4 text-sm [&_svg]:size-4',
  lg: 'h-12 px-5 text-base [&_svg]:size-[18px]',
};

type Common = { variant?: Variant; size?: Size; className?: string; children: React.ReactNode };

type ButtonProps = Common & React.ButtonHTMLAttributes<HTMLButtonElement> & { href?: undefined };
type LinkProps = Common & React.AnchorHTMLAttributes<HTMLAnchorElement> & { href: string; external?: boolean };

export function buttonClass(variant: Variant = 'outline', size: Size = 'md', className?: string) {
  return cn(base, variants[variant], sizes[size], className);
}

export function Button(props: ButtonProps | LinkProps) {
  const { variant = 'outline', size = 'md', className, children, ...rest } = props;
  const cls = buttonClass(variant, size, className);
  if ('href' in rest && rest.href) {
    const { href, external, ...a } = rest as LinkProps;
    if (external || /^(https?:|tel:|mailto:)/.test(href)) {
      return (
        <a href={href} className={cls} {...(href.startsWith('http') ? { target: '_blank', rel: 'noopener noreferrer' } : {})} {...a}>
          {children}
        </a>
      );
    }
    return (
      <Link href={href} className={cls} {...a}>
        {children}
      </Link>
    );
  }
  return (
    <button type="button" className={cls} {...(rest as React.ButtonHTMLAttributes<HTMLButtonElement>)}>
      {children}
    </button>
  );
}
