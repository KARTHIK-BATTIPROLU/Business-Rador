import React from 'react';
import localFont from 'next/font/local';
import { SAMPLE_LEADS } from '@/lib/sample-leads';
import { launchLabel } from '@/lib/lead';

// Story Script (Google Fonts, 2025) is loaded only here, for the one handwritten note on the map.
const hand = localFont({ src: '../../app/fonts/StoryScript-400.woff2', display: 'swap', variable: '--font-hand' });

// Projection for the crop: west Hyderabad, lng 78.32–78.45, lat 17.38–17.47.
const W = 800;
const H = 560;
const px = (lng: number) => ((lng - 78.32) / 0.13) * W;
const py = (lat: number) => ((17.47 - lat) / 0.09) * H;

const AREAS: [string, number, number][] = [
  ['Kokapet', 78.329, 17.404],
  ['Gachibowli', 78.345, 17.451],
  ['Financial District', 78.338, 17.424],
  ['Narsingi', 78.36, 17.384],
  ['Kondapur', 78.364, 17.466],
  ['HITECH City', 78.378, 17.455],
  ['Madhapur', 78.396, 17.443],
  ['Jubilee Hills', 78.405, 17.424],
  ['Banjara Hills', 78.43, 17.41],
];

/**
 * The landing-page hero: a cropped, slightly rotated piece of the radar,
 * drawn in the product's own map palette, plotted with the SAMPLE leads.
 */
export function HeroMap() {
  const featured = SAMPLE_LEADS[0]; // Kona Chai & Bakes, Kokapet
  const fx = px(featured.lng);
  const fy = py(featured.lat);

  return (
    <figure className={`${hand.variable} relative`}>
      <div className="relative rotate-[-1.4deg] rounded-panel border border-ink bg-surface p-2 sm:p-3 shadow-hard">
        <div className="relative overflow-hidden rounded-[9px] border border-hairline">
          <svg viewBox={`0 0 ${W} ${H}`} className="block w-full h-auto" role="img" aria-labelledby="hero-map-title">
            <title id="hero-map-title">
              Map of west Hyderabad from Kokapet to Banjara Hills with ten sample leads plotted. A cafe in Kokapet is highlighted.
            </title>
            <rect width={W} height={H} fill="rgb(var(--paper))" />
            {/* parks / green patches */}
            <path d="M600 330c40-14 90-6 118 20 22 21 12 58-26 64-46 8-96-6-112-36-10-19 0-40 20-48z" fill="rgb(var(--map-green))" />
            <path d="M250 60c30-8 70 4 82 28 10 22-14 40-46 40-36 0-62-16-62-38 0-14 10-26 26-30z" fill="rgb(var(--map-green))" />
            {/* lakes: Durgam Cheruvu + Khajaguda, muted water */}
            <path d="M400 214c12-10 30-8 36 6 7 16-2 34-16 40-14 6-26-2-28-16-2-12 0-22 8-30z" fill="rgb(var(--map-water))" />
            <path d="M318 268c10-6 22-2 24 8 2 12-8 20-18 20s-16-8-14-16c1-5 4-9 8-12z" fill="rgb(var(--map-water))" />
            {/* minor road grid */}
            <g stroke="rgb(var(--map-road-minor))" strokeWidth="3" fill="none" strokeLinecap="round">
              <path d="M120 120 L700 150" />
              <path d="M90 300 L760 320" />
              <path d="M140 440 L640 470" />
              <path d="M300 20 L340 540" />
              <path d="M470 10 L500 540" />
              <path d="M600 40 L640 520" />
              <path d="M200 200 L420 260 L560 250" />
              <path d="M160 380 L380 340 L520 400" />
            </g>
            {/* main roads */}
            <g stroke="rgb(var(--map-road-major))" strokeWidth="7" fill="none" strokeLinecap="round">
              {/* Old Mumbai Highway, roughly */}
              <path d="M30 210 C 200 190, 360 180, 520 200 S 720 250, 800 240" />
              {/* Road towards Jubilee Hills */}
              <path d="M380 560 C 420 420, 500 300, 560 160 S 640 40, 660 0" />
            </g>
            {/* Outer Ring Road: the wide tan arc on the west */}
            <path d="M90 0 C 40 140, 30 260, 70 380 S 170 540, 230 560" stroke="rgb(var(--map-ring-road))" strokeWidth="14" fill="none" strokeLinecap="round" />
            <path d="M90 0 C 40 140, 30 260, 70 380 S 170 540, 230 560" stroke="rgb(var(--paper))" strokeWidth="1.5" strokeDasharray="10 12" fill="none" />

            {/* area labels in the display face */}
            <g fontFamily="var(--font-sans)" fontSize="15" fontWeight="500" fill="rgb(var(--walnut))">
              {AREAS.map(([n, lng, lat]) => (
                <text key={n} x={px(lng)} y={py(lat)} textAnchor="middle" letterSpacing="0.2">
                  {n}
                </text>
              ))}
            </g>

            {/* sample leads: ink dots, terracotta ring for 85+ */}
            {SAMPLE_LEADS.map((b) => (
              <g key={b.id}>
                {b.lead_score >= 85 && <circle cx={px(b.lng)} cy={py(b.lat)} r={11} fill="none" stroke="rgb(var(--accent))" strokeWidth="2.5" />}
                <circle cx={px(b.lng)} cy={py(b.lat)} r={5.5} fill="rgb(var(--ink))" stroke="rgb(var(--surface))" strokeWidth="1.5" />
              </g>
            ))}

            {/* featured lead highlight */}
            <circle cx={fx} cy={fy} r={20} fill="none" stroke="rgb(var(--ink))" strokeWidth="1" strokeDasharray="3 4" />

            {/* handwritten note + arrow */}
            <path
              d={`M ${fx + 150} ${fy + 92} C ${fx + 110} ${fy + 96}, ${fx + 60} ${fy + 70}, ${fx + 24} ${fy + 18}`}
              stroke="rgb(var(--ink))"
              strokeWidth="1.8"
              fill="none"
              strokeLinecap="round"
            />
            <path d={`M ${fx + 22} ${fy + 32} L ${fx + 24} ${fy + 18} L ${fx + 37} ${fy + 24}`} stroke="rgb(var(--ink))" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            <text x={fx + 158} y={fy + 88} fontFamily="var(--font-hand)" fontSize="24" fill="rgb(var(--ink))">
              11 days old,
            </text>
            <text x={fx + 158} y={fy + 116} fontFamily="var(--font-hand)" fontSize="24" fill="rgb(var(--ink))">
              still no website
            </text>

            {/* scale + north, in mono */}
            <g fontFamily="var(--font-mono)" fontSize="12" fill="rgb(var(--walnut))">
              <path d="M600 524 h120" stroke="rgb(var(--walnut))" strokeWidth="1.5" />
              <path d="M600 518 v12 M720 518 v12" stroke="rgb(var(--walnut))" strokeWidth="1.5" />
              <text x="660" y="512" textAnchor="middle">2 km</text>
              <text x="766" y="40" textAnchor="middle">N</text>
              <path d="M766 48 v26 M760 56 l6-8 6 8" stroke="rgb(var(--walnut))" strokeWidth="1.5" fill="none" />
            </g>
          </svg>

          {/* the lead the note points at, as it appears in the radar */}
          <div className="absolute right-2 top-2 sm:right-4 sm:top-4 w-[172px] sm:w-[232px] rounded-ctl border border-ink bg-surface p-2.5 sm:p-3 text-left">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-display text-base sm:text-lg leading-tight">{featured.name}</p>
                <p className="text-xs text-walnut mt-0.5">
                  {featured.area} · {launchLabel(featured)}
                </p>
              </div>
              <span className="font-mono tabular text-sm text-accent-strong border border-accent rounded-full size-9 grid place-items-center shrink-0">
                {featured.lead_score}
              </span>
            </div>
            <p className="hidden sm:block text-xs text-ink mt-2 leading-snug">No website, 3 Instagram posts, WhatsApp on Google Maps.</p>
          </div>
        </div>
      </div>
      <figcaption className="mt-4 ml-2 text-xs text-walnut flex items-center gap-2">
        <span className="inline-block border border-dashed border-tan rounded-ctl px-1.5 py-0.5 font-mono text-2xs">sample</span>
        Ten invented shops plotted on real neighbourhoods. Live leads appear once you run a scan.
      </figcaption>
    </figure>
  );
}
