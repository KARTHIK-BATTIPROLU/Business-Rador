import React from 'react';
import { RadarFilterState } from '@/lib/types';
import { Search, Compass, Clock, Tag, SlidersHorizontal, Rocket, Sparkles, Globe2, Users, AlertCircle } from 'lucide-react';

interface FilterBarProps {
  filters: RadarFilterState;
  onChange: (updated: Partial<RadarFilterState>) => void;
  onAreaJump?: (area: string) => void;
  onTriggerScan?: (region?: string, area?: string) => void;
  isScanning?: boolean;
}

const REGION_AREAS: Record<string, string[]> = {
  hyderabad: [
    'All Areas',
    'Kokapet',
    'Gachibowli',
    'HITECH City',
    'Madhapur',
    'Financial District',
    'Nanakramguda',
    'Jubilee Hills',
    'Banjara Hills',
    'Kondapur',
    'Narsingi',
  ],
  texas: [
    'All Areas',
    'South Congress',
    'East Austin',
    'Austin',
    'Uptown',
    'Deep Ellum',
    'Dallas',
    'Montrose',
    'The Heights',
    'Houston',
  ],
  london: [
    'All Areas',
    'Shoreditch',
    'Soho',
    'Covent Garden',
    'London',
  ],
  all: [
    'All Areas',
    'Kokapet',
    'Financial District',
    'Gachibowli',
    'South Congress',
    'East Austin',
    'Uptown',
    'Deep Ellum',
    'Montrose',
    'Shoreditch',
    'Soho',
  ],
};

const REGION_HOT_GRIDS: Record<string, { name: string; icon: string }[]> = {
  hyderabad: [
    { name: 'Kokapet', icon: '📍' },
    { name: 'Gachibowli', icon: '📍' },
    { name: 'HITECH City', icon: '📍' },
    { name: 'Financial District', icon: '📍' },
    { name: 'Madhapur', icon: '📍' },
    { name: 'Jubilee Hills', icon: '📍' },
  ],
  texas: [
    { name: 'South Congress', icon: '🇺🇸' },
    { name: 'East Austin', icon: '🇺🇸' },
    { name: 'Uptown', icon: '🇺🇸' },
    { name: 'Deep Ellum', icon: '🇺🇸' },
    { name: 'Montrose', icon: '🇺🇸' },
  ],
  london: [
    { name: 'Shoreditch', icon: '🇬🇧' },
    { name: 'Soho', icon: '🇬🇧' },
    { name: 'Covent Garden', icon: '🇬🇧' },
  ],
  all: [
    { name: 'Kokapet', icon: '🇮🇳' },
    { name: 'Financial District', icon: '🇮🇳' },
    { name: 'South Congress', icon: '🇺🇸' },
    { name: 'Uptown', icon: '🇺🇸' },
    { name: 'Shoreditch', icon: '🇬🇧' },
  ],
};

const CATEGORIES = [
  'All Categories',
  'Food & Beverage',
  'Clothing & Fashion',
  'Beauty & Wellness',
  'Fitness',
  'Retail',
  'Health',
  'Services',
];

export const FilterBar: React.FC<FilterBarProps> = ({
  filters,
  onChange,
  onAreaJump,
  onTriggerScan,
  isScanning,
}) => {
  const currentRegion = filters.region || 'all';
  const availableAreas = REGION_AREAS[currentRegion] || REGION_AREAS.all;
  const hotGrids = REGION_HOT_GRIDS[currentRegion] || REGION_HOT_GRIDS.all;

  return (
    <div className="bg-clay-canvas border-b border-clay-border/80 px-4 py-3 space-y-2.5">
      <div className="flex flex-wrap items-center gap-2.5">
        {/* Global Region Switcher Dropdown */}
        <div className="flex items-center gap-1.5 bg-blue-50/90 border border-blue-200/80 px-3 py-2 rounded-clay-sm shadow-clay-btn text-xs font-bold text-accent-blue">
          <Globe2 className="w-3.5 h-3.5" />
          <select
            value={currentRegion}
            onChange={(e) => {
              const region = e.target.value as RadarFilterState['region'];
              onChange({ region, area: 'all' });
              if (onAreaJump) {
                if (region === 'texas') onAreaJump('Austin');
                else if (region === 'london') onAreaJump('London');
                else if (region === 'hyderabad') onAreaJump('Kokapet');
              }
            }}
            className="bg-transparent text-accent-blue font-bold outline-none cursor-pointer pr-1"
          >
            <option value="all">🌐 Global (All Markets)</option>
            <option value="texas">🇺🇸 Texas, USA ($2.5k–$5k USD)</option>
            <option value="london">🇬🇧 London, UK (£2k–£3.5k GBP)</option>
            <option value="hyderabad">🇮🇳 Hyderabad, India (₹35k–₹75k)</option>
          </select>
        </div>

        {/* Search input with tactile inset shadow */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-clay-faint" />
          <input
            type="text"
            placeholder="Search business name, keywords, city, area..."
            value={filters.search}
            onChange={(e) => onChange({ search: e.target.value })}
            className="w-full bg-white text-sm text-clay-text pl-10 pr-3.5 py-2 rounded-clay-sm border border-clay-border/90 shadow-clay-pressed focus:outline-none focus:ring-2 focus:ring-accent-blue/20 focus:border-accent-blue placeholder:text-clay-faint transition"
          />
        </div>

        {/* Dynamic Area dropdown */}
        <div className="flex items-center gap-1.5 bg-white px-3 py-2 rounded-clay-sm shadow-clay-btn border border-clay-border/80 text-xs font-medium">
          <Compass className="w-3.5 h-3.5 text-accent-blue" />
          <select
            value={filters.area === 'all' ? 'All Areas' : filters.area}
            onChange={(e) => {
              const val = e.target.value === 'All Areas' ? 'all' : e.target.value;
              onChange({ area: val });
              if (onAreaJump && val !== 'all') onAreaJump(val);
            }}
            className="bg-transparent text-clay-text outline-none cursor-pointer pr-1"
          >
            {availableAreas.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
        </div>

        {/* Category dropdown */}
        <div className="flex items-center gap-1.5 bg-white px-3 py-2 rounded-clay-sm shadow-clay-btn border border-clay-border/80 text-xs font-medium">
          <Tag className="w-3.5 h-3.5 text-purple-600" />
          <select
            value={filters.category === 'all' ? 'All Categories' : filters.category}
            onChange={(e) => {
              const val = e.target.value === 'All Categories' ? 'all' : e.target.value;
              onChange({ category: val });
            }}
            className="bg-transparent text-clay-text outline-none cursor-pointer pr-1"
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        {/* Business Launch Age filter */}
        <div className="flex items-center gap-1.5 bg-white px-3 py-2 rounded-clay-sm shadow-clay-btn border border-clay-border/80 text-xs font-medium">
          <Rocket className="w-3.5 h-3.5 text-rose-500" />
          <select
            value={filters.launch_age || 'all'}
            onChange={(e) => onChange({ launch_age: e.target.value as any })}
            className="bg-transparent text-clay-text outline-none cursor-pointer pr-1"
          >
            <option value="all">All Launch Stages</option>
            <option value="opening_soon">🔮 Opening Soon / Permits</option>
            <option value="14d">🚀 Just Launched (&lt;14 Days)</option>
            <option value="30d">🌟 Fresh Store (&lt;30 Days)</option>
            <option value="90d">🗓️ Q1 Launch (&lt;90 Days)</option>
            <option value="older">🏢 Established</option>
          </select>
        </div>

        {/* Radar Spotted Recency dropdown */}
        <div className="flex items-center gap-1.5 bg-white px-3 py-2 rounded-clay-sm shadow-clay-btn border border-clay-border/80 text-xs font-medium">
          <Clock className="w-3.5 h-3.5 text-accent-emerald" />
          <select
            value={filters.recency}
            onChange={(e) => onChange({ recency: e.target.value as RadarFilterState['recency'] })}
            className="bg-transparent text-clay-text outline-none cursor-pointer pr-1"
            title="When the crawler first spotted the business online"
          >
            <option value="all">Radar: All Spotted</option>
            <option value="24h">⚡ Spotted Today (&lt;24h)</option>
            <option value="7d">📅 Spotted This Week</option>
            <option value="30d">🗓️ Spotted This Month</option>
            <option value="6m">⏳ Spotted Last 6 Mo</option>
          </select>
        </div>

        {/* Outreach status */}
        <div className="flex items-center gap-1.5 bg-white px-3 py-2 rounded-clay-sm shadow-clay-btn border border-clay-border/80 text-xs font-medium">
          <SlidersHorizontal className="w-3.5 h-3.5 text-accent-amber" />
          <select
            value={filters.status}
            onChange={(e) => onChange({ status: e.target.value as RadarFilterState['status'] })}
            className="bg-transparent text-clay-text outline-none cursor-pointer pr-1"
          >
            <option value="all">All Statuses</option>
            <option value="new">🟢 New Lead</option>
            <option value="contacted">🔵 Contacted</option>
            <option value="interested">🟡 Interested</option>
            <option value="closed">🟣 Closed</option>
            <option value="skip">⚪ Skip</option>
          </select>
        </div>
      </div>

      {/* Row 2: Store Leads Negative Filters + Hot Grids + Live Scanner Action */}
      <div className="flex items-center gap-2 text-xs pt-0.5 overflow-x-auto text-clay-muted">
        {/* Missing Website Toggle (Store Leads style negative condition) */}
        <button
          onClick={() => onChange({ missing_website_only: !filters.missing_website_only })}
          className={`shrink-0 flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all shadow-clay-pill border ${
            filters.missing_website_only
              ? 'bg-rose-500 text-white border-rose-600 shadow-clay-btn'
              : 'bg-white text-rose-700 hover:bg-rose-50 border-rose-200/80'
          }`}
          title="Filter only businesses that currently have NO website listed"
        >
          <span>🔥</span>
          <span>No Website Only</span>
          {filters.missing_website_only && <span className="ml-1 text-[10px] bg-rose-700 px-1.5 py-0.2 rounded-full">ACTIVE</span>}
        </button>

        {/* Low Social Footprint Toggle (< 500 Instagram followers) */}
        <button
          onClick={() => onChange({ low_social_only: !filters.low_social_only })}
          className={`shrink-0 flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all shadow-clay-pill border ${
            filters.low_social_only
              ? 'bg-purple-600 text-white border-purple-700 shadow-clay-btn'
              : 'bg-white text-purple-700 hover:bg-purple-50 border-purple-200/80'
          }`}
          title="Filter businesses with < 500 Instagram followers and low content"
        >
          <Users className="w-3 h-3" />
          <span>Low IG (&lt;500)</span>
          {filters.low_social_only && <span className="ml-1 text-[10px] bg-purple-800 px-1.5 py-0.2 rounded-full">ACTIVE</span>}
        </button>

        <span className="shrink-0 text-clay-faint text-[11px] font-semibold tracking-wide uppercase pl-1">
          {currentRegion === 'texas' ? 'Texas Corridors:' : currentRegion === 'london' ? 'London Corridors:' : 'Hot Grids:'}
        </span>

        {hotGrids.map((item) => (
          <button
            key={item.name}
            onClick={() => {
              onChange({ area: item.name });
              if (onAreaJump) onAreaJump(item.name);
            }}
            className={`shrink-0 px-3 py-1 rounded-full text-xs font-medium transition-all ${
              filters.area === item.name
                ? 'bg-accent-blue text-white shadow-clay-btn'
                : 'bg-white text-clay-muted hover:text-clay-text shadow-clay-pill border border-clay-border/70 hover:bg-slate-50'
            }`}
          >
            {item.icon} {item.name}
          </button>
        ))}

        {onTriggerScan && (
          <button
            onClick={() => onTriggerScan(currentRegion, filters.area)}
            disabled={isScanning}
            className="ml-auto shrink-0 flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-bold bg-amber-500 hover:bg-amber-600 text-white shadow-clay-btn transition active:translate-y-0.5 disabled:opacity-75"
          >
            <Sparkles className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin' : ''}`} />
            <span>
              {isScanning
                ? 'Scanning Government & GPS...'
                : filters.area !== 'all'
                ? `⚡ Scan ${filters.area} for New Leads`
                : currentRegion === 'texas'
                ? '⚡ Scan Texas Permits (80+ Leads)'
                : currentRegion === 'london'
                ? '⚡ Scan London Corridors (50+ Leads)'
                : '⚡ Scan Global (100+ Leads)'}
            </span>
          </button>
        )}
      </div>
    </div>
  );
};
