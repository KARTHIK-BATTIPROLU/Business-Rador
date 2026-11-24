/** @type {import('tailwindcss').Config} */
// All colours resolve to CSS variables in app/globals.css (see docs/DESIGN.md).
// The default Tailwind palette is removed on purpose so raw `slate-*`/`blue-*`
// classes cannot sneak back in.
const v = (name) => `rgb(var(--${name}) / <alpha-value>)`;

module.exports = {
  content: ['./app/**/*.{js,ts,jsx,tsx,mdx}', './components/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    colors: {
      transparent: 'transparent',
      current: 'currentColor',
      paper: v('paper'),
      surface: v('surface'),
      sunk: v('sunk'),
      ink: v('ink'),
      walnut: v('walnut'),
      tan: v('tan'),
      hairline: v('hairline'),
      scrim: v('scrim'),
      accent: { DEFAULT: v('accent'), strong: v('accent-strong'), wash: v('accent-wash'), fill: v('accent-fill') },
      'on-accent': v('on-accent'),
      status: {
        new: v('olive'),
        'new-ink': v('olive-deep'),
        contacted: v('ochre'),
        'contacted-ink': v('ochre-deep'),
        interested: v('brick'),
        closed: v('stone'),
        'closed-ink': v('stone-deep'),
      },
    },
    fontFamily: {
      display: ['var(--font-display)', 'system-ui', 'sans-serif'],
      sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
      mono: ['var(--font-mono)', 'ui-monospace', 'monospace'],
    },
    fontSize: {
      // ~1.25 modular scale
      '2xs': ['0.6875rem', { lineHeight: '1rem' }],
      xs: ['0.75rem', { lineHeight: '1.1rem' }],
      sm: ['0.875rem', { lineHeight: '1.35rem' }],
      base: ['1rem', { lineHeight: '1.55' }],
      lg: ['1.25rem', { lineHeight: '1.4' }],
      xl: ['1.5625rem', { lineHeight: '1.25' }],
      '2xl': ['1.9375rem', { lineHeight: '1.15' }],
      '3xl': ['2.4375rem', { lineHeight: '1.08' }],
      '4xl': ['3.0625rem', { lineHeight: '1.04' }],
      '5xl': ['3.8125rem', { lineHeight: '1' }],
    },
    extend: {
      borderRadius: { ctl: '6px', panel: '14px' },
      boxShadow: {
        hard: '4px 4px 0 rgb(var(--shadow))',
        'hard-sm': '2px 2px 0 rgb(var(--shadow))',
        none: 'none',
      },
      maxWidth: { prose: '62ch' },
      letterSpacing: { display: '-0.035em' },
      transitionTimingFunction: { out: 'cubic-bezier(0.22, 1, 0.36, 1)' },
      keyframes: {
        shimmer: { '0%': { backgroundPosition: '-200% 0' }, '100%': { backgroundPosition: '200% 0' } },
        sweep: { to: { transform: 'rotate(360deg)' } },
      },
      animation: {
        shimmer: 'shimmer 1.6s ease-out infinite',
        sweep: 'sweep 9s linear infinite',
      },
    },
  },
  plugins: [],
};
