'use client';

import React, { useEffect, useRef, useState } from 'react';
import { RadarFilterState } from '@/lib/types';
import { GLOBAL_MARKETS, geocodeUniversalArea } from '@/lib/geocoding';
import { Crosshair, Search, SlidersHorizontal, X } from 'lucide-react';
import { Popover } from '@/components/ui/Popover';
import { FieldLabel, Select } from '@/components/ui/primitives';
import { buttonClass } from '@/components/ui/Button';
import { STATUS_META, STATUS_ORDER } from '@/lib/lead';
import { cn } from '@/lib/utils';

interface FilterBarProps {
  filters: RadarFilterState;
  onChange: (updated: Partial<RadarFilterState>) => void;
  onAreaJump?: (area: string, coords?: [number, number]) => void;
  /** Scan a place the user typed (geocoded first). */
  onTriggerScan?: (
    region?: string,
    area?: string,
    coords?: { lat: number; lng: number; radius?: number; city?: string; country?: string },
  ) => void;
  isScanning?: boolean;
  className?: string;
}

// Corridors shown as quick picks when no market is chosen.
const TRENDING: { name: string; coords?: [number, number] }[] = [
  { name: 'Kokapet' },
  { name: 'Indiranagar' },
  { name: 'South Congress' },
  { name: 'SoHo' },
  { name: 'Shoreditch' },
  { name: 'Shibuya' },
  { name: 'Mitte' },
];

const marketLabel = (id: string) => GLOBAL_MARKETS[id]?.name ?? id;

const CATEGORIES = ['Food & Beverage', 'Clothing & Fashion', 'Beauty & Wellness', 'Fitness', 'Retail', 'Health', 'Services', 'Tech'];

const LAUNCH: Record<string, string> = {
  opening_soon: 'Opening soon',
  '14d': 'Opened in the last 14 days',
  '30d': 'Opened in the last 30 days',
  '90d': 'Opened in the last 90 days',
  older: 'Established',
};
const RECENCY: Record<string, string> = { '24h': 'Spotted today', '7d': 'Spotted this week', '30d': 'Spotted this month', '6m': 'Spotted in 6 months' };
const IG: Record<string, string> = { low_followers: 'Under 500 followers', no_instagram: 'No Instagram found', dormant_posts: '5 posts or fewer' };

type Chip = { key: string; label: string; clear: Partial<RadarFilterState> };

function activeChips(f: RadarFilterState): Chip[] {
  const c: Chip[] = [];
  if (f.region && f.region !== 'all') c.push({ key: 'region', label: marketLabel(f.region), clear: { region: 'all', country: undefined, city: undefined, area: 'all' } });
  else if (f.country) c.push({ key: 'country', label: f.country, clear: { country: undefined, city: undefined, area: 'all' } });
  if (f.city) c.push({ key: 'city', label: f.city, clear: { city: undefined, area: 'all' } });
  if (f.area !== 'all') c.push({ key: 'area', label: f.area, clear: { area: 'all' } });
  if (f.category !== 'all') c.push({ key: 'cat', label: f.category, clear: { category: 'all' } });
  if (f.has_website === 'no' || f.missing_website_only) c.push({ key: 'web', label: 'No website', clear: { has_website: 'all', missing_website_only: false } });
  else if (f.has_website === 'yes') c.push({ key: 'web', label: 'Has a website', clear: { has_website: 'all' } });
  const ig = f.instagram_filter && f.instagram_filter !== 'all' ? f.instagram_filter : f.low_social_only ? 'low_followers' : null;
  if (ig) c.push({ key: 'ig', label: IG[ig], clear: { instagram_filter: 'all', low_social_only: false } });
  if (f.launch_age && f.launch_age !== 'all') c.push({ key: 'launch', label: LAUNCH[f.launch_age], clear: { launch_age: 'all' } });
  if (f.recency !== 'all') c.push({ key: 'rec', label: RECENCY[f.recency], clear: { recency: 'all' } });
  if (f.status !== 'all') c.push({ key: 'status', label: STATUS_META[f.status].label, clear: { status: 'all' } });
  return c;
}

export const RESET_FILTERS: Partial<RadarFilterState> = {
  region: 'all', country: undefined, city: undefined, us_state: 'all', area: 'all', category: 'all', recency: 'all', launch_age: 'all',
  has_website: 'all', missing_website_only: false, instagram_filter: 'all', low_social_only: false, status: 'all',
};

/** Search box. `/` focuses it from anywhere on the page. */
export function SearchBox({ value, onChange, className }: { value: string; onChange: (v: string) => void; className?: string }) {
  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      if (e.key === '/' && !['INPUT', 'TEXTAREA', 'SELECT'].includes(t.tagName) && !t.isContentEditable) {
        e.preventDefault();
        ref.current?.focus();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);
  return (
    <div className={cn('relative', className)}>
      <Search aria-hidden className="absolute left-3 top-1/2 center-y size-4 stroke-[1.5] text-tan" />
      <label htmlFor="radar-search" className="sr-only">
        Search leads
      </label>
      <input
        ref={ref}
        id="radar-search"
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search a shop, area or street"
        className="h-11 w-full rounded-ctl border border-hairline bg-surface pl-9 pr-9 text-sm text-ink placeholder:text-walnut/70 outline-none focus:border-ink"
      />
      <kbd aria-hidden className="absolute right-2.5 top-1/2 center-y font-mono text-2xs text-walnut border border-hairline rounded px-1.5 py-0.5 bg-paper">
        /
      </kbd>
    </div>
  );
}

/** "Filters" button + popover, and a row of removable chips for whatever is active. */
export const FilterBar: React.FC<FilterBarProps> = ({ filters, onChange, onAreaJump, onTriggerScan, isScanning, className }) => {
  const marketId = filters.region || 'all';
  const market = GLOBAL_MARKETS[marketId];
  const cities = market ? market.cities : [];
  const city = cities.find((c) => c.name === filters.city);
  const corridors = city ? city.corridors : market ? market.cities.flatMap((c) => c.corridors) : [];
  const quickPicks: { name: string; coords?: [number, number] }[] = market
    ? city
      ? city.corridors
      : market.cities.flatMap((c) => c.corridors.slice(0, 2)).slice(0, 8)
    : TRENDING;
  const chips = activeChips(filters);

  const [place, setPlace] = useState('');
  const [placeState, setPlaceState] = useState<'idle' | 'locating' | 'notfound'>('idle');

  const setMarket = (id: string) => {
    if (id === 'all') {
      onChange({ region: 'all', country: undefined, city: undefined, area: 'all' });
      return;
    }
    const m = GLOBAL_MARKETS[id];
    if (!m) return;
    const firstCity = m.cities[0];
    onChange({ region: id, country: m.name, city: firstCity?.name, area: 'all' });
    onAreaJump?.(firstCity?.name || m.name, firstCity?.coords || m.defaultCoords);
  };

  const setCity = (name: string) => {
    if (name === 'all') {
      onChange({ city: undefined, area: 'all' });
      if (market) onAreaJump?.(market.name, market.defaultCoords);
      return;
    }
    const c = cities.find((x) => x.name === name);
    if (!c) return;
    onChange({ city: name, area: 'all' });
    onAreaJump?.(c.name, c.coords);
  };

  const setArea = (name: string, coords?: [number, number]) => {
    if (name === 'all' || filters.area === name) {
      onChange({ area: 'all' });
      return;
    }
    const corr = corridors.find((x) => x.name === name);
    onChange({ area: name });
    onAreaJump?.(name, coords || corr?.coords);
  };

  const scanPlace = async (e: React.FormEvent, close: () => void) => {
    e.preventDefault();
    const q = place.trim();
    if (!q) return;
    setPlaceState('locating');
    const geo = await geocodeUniversalArea(q);
    if (!geo) {
      setPlaceState('notfound');
      return;
    }
    setPlaceState('idle');
    onChange({ area: geo.name, city: geo.city, country: geo.country });
    onAreaJump?.(geo.name, [geo.lng, geo.lat]);
    onTriggerScan?.(undefined, geo.name, { lat: geo.lat, lng: geo.lng, radius: geo.radius, city: geo.city, country: geo.country });
    close();
  };

  return (
    <div className={cn('flex flex-wrap items-center gap-2', className)}>
      <Popover
        label="Filters"
        align="end"
        panelClassName="w-[min(92vw,560px)] p-4 sm:p-5"
        trigger={({ props, open }) => (
          <button {...props} className={buttonClass(open ? 'ink' : 'outline', 'md')}>
            <SlidersHorizontal aria-hidden /> Filters
            {chips.length > 0 && <span className="font-mono tabular text-xs">({chips.length})</span>}
          </button>
        )}
      >
        {(close) => (
          <div className="space-y-5">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <FieldLabel htmlFor="f-region">Country</FieldLabel>
                <Select id="f-region" value={marketId} onChange={(e) => setMarket(e.target.value)}>
                  <option value="all">All countries</option>
                  {Object.values(GLOBAL_MARKETS).map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} ({m.currencySymbol})
                    </option>
                  ))}
                </Select>
              </div>
              {cities.length > 0 && (
                <div>
                  <FieldLabel htmlFor="f-city">City</FieldLabel>
                  <Select id="f-city" value={filters.city || 'all'} onChange={(e) => setCity(e.target.value)}>
                    <option value="all">All cities</option>
                    {cities.map((c) => (
                      <option key={c.name}>{c.name}</option>
                    ))}
                  </Select>
                </div>
              )}
              {corridors.length > 0 && (
                <div>
                  <FieldLabel htmlFor="f-area">Neighbourhood</FieldLabel>
                  <Select id="f-area" value={corridors.some((c) => c.name === filters.area) ? filters.area : 'all'} onChange={(e) => setArea(e.target.value)}>
                    <option value="all">All neighbourhoods</option>
                    {corridors.map((c) => (
                      <option key={`${c.name}-${c.coords.join()}`}>{c.name}</option>
                    ))}
                  </Select>
                </div>
              )}
              <div>
                <FieldLabel htmlFor="f-cat">Kind of business</FieldLabel>
                <Select id="f-cat" value={filters.category} onChange={(e) => onChange({ category: e.target.value })}>
                  <option value="all">Any</option>
                  {CATEGORIES.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </Select>
              </div>
              <div>
                <FieldLabel htmlFor="f-web">Website</FieldLabel>
                <Select
                  id="f-web"
                  value={filters.has_website || (filters.missing_website_only ? 'no' : 'all')}
                  onChange={(e) => {
                    const v = e.target.value as 'all' | 'yes' | 'no';
                    onChange({ has_website: v, missing_website_only: v === 'no' });
                  }}
                >
                  <option value="all">Either</option>
                  <option value="no">No website</option>
                  <option value="yes">Has a website</option>
                </Select>
              </div>
              <div>
                <FieldLabel htmlFor="f-launch">Opened</FieldLabel>
                <Select id="f-launch" value={filters.launch_age || 'all'} onChange={(e) => onChange({ launch_age: e.target.value as RadarFilterState['launch_age'] })}>
                  <option value="all">Any time</option>
                  {Object.entries(LAUNCH).map(([v, l]) => (
                    <option key={v} value={v}>
                      {l}
                    </option>
                  ))}
                </Select>
              </div>
              <div>
                <FieldLabel htmlFor="f-ig">Instagram</FieldLabel>
                <Select
                  id="f-ig"
                  value={filters.instagram_filter || (filters.low_social_only ? 'low_followers' : 'all')}
                  onChange={(e) => {
                    const v = e.target.value as RadarFilterState['instagram_filter'];
                    onChange({ instagram_filter: v, low_social_only: v === 'low_followers' });
                  }}
                >
                  <option value="all">Any</option>
                  {Object.entries(IG).map(([v, l]) => (
                    <option key={v} value={v}>
                      {l}
                    </option>
                  ))}
                </Select>
              </div>
              <div>
                <FieldLabel htmlFor="f-rec">First spotted by the radar</FieldLabel>
                <Select id="f-rec" value={filters.recency} onChange={(e) => onChange({ recency: e.target.value as RadarFilterState['recency'] })}>
                  <option value="all">Any time</option>
                  {Object.entries(RECENCY).map(([v, l]) => (
                    <option key={v} value={v}>
                      {l}
                    </option>
                  ))}
                </Select>
              </div>
              <div>
                <FieldLabel htmlFor="f-status">Your status</FieldLabel>
                <Select id="f-status" value={filters.status} onChange={(e) => onChange({ status: e.target.value as RadarFilterState['status'] })}>
                  <option value="all">Any</option>
                  {STATUS_ORDER.map((s) => (
                    <option key={s} value={s}>
                      {STATUS_META[s].label}
                    </option>
                  ))}
                </Select>
              </div>
            </div>

            <fieldset>
              <legend className="text-xs font-medium text-walnut mb-2">
                {city ? `Neighbourhoods in ${city.name}` : market ? `Busy streets in ${market.name}` : 'Busy streets worldwide'} (moves the map)
              </legend>
              <div className="flex flex-wrap gap-1.5">
                {quickPicks.map((a) => {
                  const on = filters.area === a.name;
                  return (
                    <button
                      key={a.name}
                      type="button"
                      aria-pressed={on}
                      onClick={() => setArea(a.name, a.coords)}
                      className={cn(
                        'h-9 px-3 rounded-ctl border text-sm transition-colors',
                        on ? 'bg-ink text-surface border-ink' : 'border-hairline text-ink hover:border-ink bg-surface',
                      )}
                    >
                      {a.name}
                    </button>
                  );
                })}
              </div>
            </fieldset>

            {onTriggerScan && (
              <form onSubmit={(e) => scanPlace(e, close)} className="rounded-ctl border border-hairline bg-paper p-3">
                <label htmlFor="f-place" className="block text-xs font-medium text-walnut mb-1.5">
                  Scan anywhere: type a neighbourhood or city
                </label>
                <div className="flex gap-2">
                  <input
                    id="f-place"
                    value={place}
                    onChange={(e) => {
                      setPlace(e.target.value);
                      if (placeState === 'notfound') setPlaceState('idle');
                    }}
                    placeholder="Bandra West, Shibuya, Williamsburg…"
                    className="h-11 min-w-0 flex-1 rounded-ctl border border-hairline bg-surface px-3 text-sm text-ink placeholder:text-walnut/70 outline-none focus:border-ink"
                  />
                  <button type="submit" disabled={!place.trim() || placeState === 'locating' || isScanning} className={buttonClass('ink', 'md', 'shrink-0')}>
                    <Crosshair aria-hidden /> {placeState === 'locating' ? 'Finding…' : 'Scan'}
                  </button>
                </div>
                <p role="status" className="mt-1.5 text-xs text-walnut min-h-[1rem]">
                  {placeState === 'notfound' ? `Couldn't find "${place}". Try adding the city, like "Bandra Mumbai".` : ''}
                </p>
              </form>
            )}

            <div className="flex items-center justify-between pt-1 border-t border-hairline -mx-4 sm:-mx-5 px-4 sm:px-5 pt-4">
              <button type="button" onClick={() => onChange(RESET_FILTERS)} className="text-sm text-walnut underline underline-offset-4 hover:text-ink min-h-11">
                Clear all
              </button>
              <button type="button" onClick={close} className={buttonClass('ink', 'md')}>
                Done
              </button>
            </div>
          </div>
        )}
      </Popover>

      {chips.length > 0 && (
        <ul className="flex flex-wrap items-center gap-1.5" aria-label="Active filters">
          {chips.map((c) => (
            <li key={c.key}>
              <button
                type="button"
                onClick={() => onChange(c.clear)}
                className="inline-flex items-center gap-1 h-9 pl-2.5 pr-1.5 rounded-ctl bg-sunk text-sm text-ink hover:bg-hairline/60"
                aria-label={`Remove filter: ${c.label}`}
              >
                {c.label}
                <X aria-hidden className="size-3.5 stroke-[1.5] text-walnut" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
