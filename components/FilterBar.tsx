'use client';

import React, { useEffect, useRef } from 'react';
import { RadarFilterState } from '@/lib/types';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { Popover } from '@/components/ui/Popover';
import { FieldLabel, Select } from '@/components/ui/primitives';
import { buttonClass } from '@/components/ui/Button';
import { STATUS_META, STATUS_ORDER } from '@/lib/lead';
import { cn } from '@/lib/utils';

interface FilterBarProps {
  filters: RadarFilterState;
  onChange: (updated: Partial<RadarFilterState>) => void;
  onAreaJump?: (area: string) => void;
  className?: string;
}

const US_STATES = [
  'Texas', 'California', 'New York', 'Florida', 'Illinois', 'Washington', 'Georgia', 'Colorado', 'North Carolina',
  'Massachusetts', 'Arizona', 'Pennsylvania', 'Ohio', 'Michigan', 'New Jersey', 'Virginia', 'Tennessee', 'Indiana',
  'Missouri', 'Maryland', 'Wisconsin', 'Minnesota', 'South Carolina', 'Alabama', 'Louisiana', 'Kentucky', 'Oregon',
  'Oklahoma', 'Connecticut', 'Utah', 'Nevada', 'Arkansas', 'Mississippi', 'Kansas', 'New Mexico', 'Nebraska', 'Idaho',
  'Hawaii', 'Maine', 'Montana', 'Rhode Island', 'Delaware', 'South Dakota', 'North Dakota', 'Alaska', 'Vermont', 'Wyoming',
];

export const REGION_AREAS: Record<string, string[]> = {
  hyderabad: ['Kokapet', 'Gachibowli', 'HITECH City', 'Madhapur', 'Financial District', 'Nanakramguda', 'Jubilee Hills', 'Banjara Hills', 'Kondapur', 'Narsingi'],
  texas: ['South Congress', 'East Austin', 'Austin', 'Uptown', 'Deep Ellum', 'Dallas', 'Montrose', 'The Heights', 'Houston'],
  london: ['Shoreditch', 'Soho', 'Covent Garden', 'London'],
  all: ['Kokapet', 'Financial District', 'Gachibowli', 'Jubilee Hills', 'South Congress', 'East Austin', 'Uptown', 'Deep Ellum', 'Montrose', 'Shoreditch', 'Soho'],
};

const REGIONS: { value: RadarFilterState['region']; label: string }[] = [
  { value: 'all', label: 'All markets' },
  { value: 'hyderabad', label: 'Hyderabad (₹35k–₹75k sites)' },
  { value: 'texas', label: 'United States, Texas permits' },
  { value: 'london', label: 'London (£2k–£4.5k sites)' },
];

const CATEGORIES = ['Food & Beverage', 'Clothing & Fashion', 'Beauty & Wellness', 'Fitness', 'Retail', 'Health', 'Services'];

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
  if (f.region !== 'all') c.push({ key: 'region', label: REGIONS.find((r) => r.value === f.region)?.label.split(' (')[0] ?? f.region, clear: { region: 'all', area: 'all' } });
  if (f.us_state && f.us_state !== 'all') c.push({ key: 'us', label: f.us_state, clear: { us_state: 'all' } });
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
  region: 'all', us_state: 'all', area: 'all', category: 'all', recency: 'all', launch_age: 'all',
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
export const FilterBar: React.FC<FilterBarProps> = ({ filters, onChange, onAreaJump, className }) => {
  const region = filters.region || 'all';
  const areas = REGION_AREAS[region] || REGION_AREAS.all;
  const chips = activeChips(filters);

  const setRegion = (r: RadarFilterState['region']) => {
    onChange({ region: r, area: 'all' });
    if (!onAreaJump) return;
    if (r === 'texas') onAreaJump('Austin');
    else if (r === 'london') onAreaJump('London');
    else if (r === 'hyderabad') onAreaJump('Hyderabad');
  };

  return (
    <div className={cn('flex flex-wrap items-center gap-2', className)}>
      <Popover
        label="Filters"
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
                <FieldLabel htmlFor="f-region">Market</FieldLabel>
                <Select id="f-region" value={region} onChange={(e) => setRegion(e.target.value as RadarFilterState['region'])}>
                  {REGIONS.map((r) => (
                    <option key={r.value} value={r.value}>
                      {r.label}
                    </option>
                  ))}
                </Select>
              </div>
              {(region === 'texas' || region === 'all') && (
                <div>
                  <FieldLabel htmlFor="f-us">US state</FieldLabel>
                  <Select
                    id="f-us"
                    value={filters.us_state || 'all'}
                    onChange={(e) => {
                      onChange({ us_state: e.target.value });
                      if (e.target.value === 'Texas') onAreaJump?.('Austin');
                    }}
                  >
                    <option value="all">Any state</option>
                    {US_STATES.map((s) => (
                      <option key={s}>{s}</option>
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
              <legend className="text-xs font-medium text-walnut mb-2">Area (moves the map)</legend>
              <div className="flex flex-wrap gap-1.5">
                {areas.map((a) => {
                  const on = filters.area === a;
                  return (
                    <button
                      key={a}
                      type="button"
                      aria-pressed={on}
                      onClick={() => {
                        onChange({ area: on ? 'all' : a });
                        if (!on) onAreaJump?.(a);
                      }}
                      className={cn(
                        'h-9 px-3 rounded-ctl border text-sm transition-colors',
                        on ? 'bg-ink text-surface border-ink' : 'border-hairline text-ink hover:border-ink bg-surface',
                      )}
                    >
                      {a}
                    </button>
                  );
                })}
              </div>
            </fieldset>

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
