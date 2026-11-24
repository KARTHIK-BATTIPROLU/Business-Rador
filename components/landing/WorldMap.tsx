import React from 'react';
import { GLOBAL_MARKETS } from '@/lib/geocoding';
import { WORLD_DOTS_PATH, WORLD_H, WORLD_W, project } from '@/lib/world-dots';

// Cities that get a written label; every preset city gets a pin.
const LABELLED: Record<string, 'left' | 'right'> = {
  'San Francisco': 'left',
  'New York City': 'right',
  Austin: 'left',
  London: 'left',
  Berlin: 'right',
  Dubai: 'left',
  Hyderabad: 'right',
  Singapore: 'right',
  Tokyo: 'right',
  Sydney: 'left',
};

const cities = Object.values(GLOBAL_MARKETS).flatMap((m) =>
  m.cities.map((c) => ({ name: c.name, country: m.name, lng: c.coords[0], lat: c.coords[1] })),
);

export const MARKET_COUNT = Object.keys(GLOBAL_MARKETS).length;
export const CITY_COUNT = cities.length;

/** Dotted world map with a pin for every city the scanner has presets for. */
export function WorldMap({ className }: { className?: string }) {
  return (
    <svg viewBox={`0 0 ${WORLD_W} ${WORLD_H}`} className={className} role="img" aria-labelledby="world-title world-desc">
      <title id="world-title">Where Business Radar can scan</title>
      <desc id="world-desc">
        A dotted world map with pins on {CITY_COUNT} preset cities in {MARKET_COUNT} countries, from San Francisco to Sydney. Hyderabad, where the
        product was built, is marked. Any other place can be scanned by name.
      </desc>
      <path d={WORLD_DOTS_PATH} stroke="rgb(var(--tan) / 0.42)" strokeWidth="4.2" strokeLinecap="round" fill="none" />
      {cities.map((c) => {
        const [x, y] = project(c.lng, c.lat);
        const home = c.name === 'Hyderabad';
        return (
          <g key={c.name}>
            {home && <circle cx={x} cy={y} r={13} fill="none" stroke="rgb(var(--ink))" strokeWidth="1.2" strokeDasharray="2.5 3" />}
            <circle cx={x} cy={y} r={7} fill="rgb(var(--accent-fill))" opacity="0.28" />
            <circle cx={x} cy={y} r={3.6} fill="rgb(var(--ink))" stroke="rgb(var(--surface))" strokeWidth="1.2" />
          </g>
        );
      })}
      <g fontFamily="var(--font-sans)" fontSize="13" fontWeight="500" fill="rgb(var(--walnut))">
        {cities
          .filter((c) => LABELLED[c.name])
          .map((c) => {
            const [x, y] = project(c.lng, c.lat);
            const left = LABELLED[c.name] === 'left';
            return (
              <text key={c.name} x={left ? x - 11 : x + 11} y={y + 4.5} textAnchor={left ? 'end' : 'start'}>
                {c.name === 'New York City' ? 'New York' : c.name}
                {c.name === 'Hyderabad' && (
                  <tspan fill="rgb(var(--ink))" fontWeight="650">
                    {' '}
                    · built here
                  </tspan>
                )}
              </text>
            );
          })}
      </g>
    </svg>
  );
}
