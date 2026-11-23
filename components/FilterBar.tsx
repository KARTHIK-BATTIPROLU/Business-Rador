'use client';

import React, { useState } from 'react';
import { RadarFilterState } from '@/lib/types';
import { GLOBAL_MARKETS, geocodeUniversalArea } from '@/lib/geocoding';
import {
  Search,
  Compass,
  Clock,
  Tag,
  SlidersHorizontal,
  Rocket,
  Sparkles,
  Globe2,
  Users,
  MapPin,
  Crosshair,
} from 'lucide-react';

interface FilterBarProps {
  filters: RadarFilterState;
  onChange: (updated: Partial<RadarFilterState>) => void;
  onAreaJump?: (area: string, coords?: [number, number]) => void;
  onTriggerScan?: (
    region?: string,
    area?: string,
    coords?: { lat: number; lng: number; radius?: number; city?: string; country?: string }
  ) => void;
  isScanning?: boolean;
}

const CATEGORIES = [
  'All Categories',
  'Food & Beverage',
  'Clothing & Fashion',
  'Beauty & Wellness',
  'Fitness',
  'Retail',
  'Health',
  'Services',
  'Tech',
];

export const FilterBar: React.FC<FilterBarProps> = ({
  filters,
  onChange,
  onAreaJump,
  onTriggerScan,
  isScanning,
}) => {
  const [customAreaInput, setCustomAreaInput] = useState('');
  const [isGeocoding, setIsGeocoding] = useState(false);

  const selectedMarketId = filters.region || 'all';
  const activeMarket = GLOBAL_MARKETS[selectedMarketId];

  // Available cities for currently selected country
  const availableCities = activeMarket ? activeMarket.cities : [];
  const selectedCityObj = availableCities.find((c) => c.name === filters.city);

  // Available corridors for current city, or fallback to all cities' corridors in this country
  const availableCorridors = selectedCityObj
    ? selectedCityObj.corridors
    : activeMarket
    ? activeMarket.cities.flatMap((c) => c.corridors)
    : [];

  // Hot grids dynamically derived from selected market
  const hotGrids = activeMarket
    ? activeMarket.cities.flatMap((c) => c.corridors.slice(0, 2)).slice(0, 6)
    : [
        { name: 'South Congress', flag: '🇺🇸' },
        { name: 'SoHo', flag: '🇺🇸' },
        { name: 'Shoreditch', flag: '🇬🇧' },
        { name: 'Kokapet', flag: '🇮🇳' },
        { name: 'Indiranagar', flag: '🇮🇳' },
        { name: 'Shibuya', flag: '🇯🇵' },
        { name: 'Mitte', flag: '🇩🇪' },
      ];

  const handleCountryChange = (marketId: string) => {
    if (marketId === 'all') {
      onChange({ region: 'all', country: undefined, city: undefined, area: 'all' });
      if (onAreaJump) onAreaJump('Austin', [-97.7431, 30.2672]);
      return;
    }

    const market = GLOBAL_MARKETS[marketId];
    if (market) {
      const firstCity = market.cities[0];
      const firstCorridor = firstCity?.corridors[0];
      onChange({
        region: marketId,
        country: market.name,
        city: firstCity?.name,
        area: firstCorridor?.name || 'all',
      });
      if (onAreaJump) {
        onAreaJump(firstCorridor?.name || firstCity?.name || market.name, firstCorridor?.coords || firstCity?.coords || market.defaultCoords);
      }
    }
  };

  const handleCityChange = (cityName: string) => {
    if (cityName === 'all') {
      onChange({ city: undefined, area: 'all' });
      if (onAreaJump && activeMarket) {
        onAreaJump(activeMarket.name, activeMarket.defaultCoords);
      }
      return;
    }

    const city = availableCities.find((c) => c.name === cityName);
    if (city) {
      const firstCorridor = city.corridors[0];
      onChange({ city: cityName, area: firstCorridor ? firstCorridor.name : 'all' });
      if (onAreaJump) {
        onAreaJump(city.name, city.coords);
      }
    }
  };

  const handleCorridorChange = (corridorName: string) => {
    if (corridorName === 'all') {
      onChange({ area: 'all' });
      return;
    }

    const corr = availableCorridors.find((c) => c.name === corridorName);
    onChange({ area: corridorName });
    if (onAreaJump && corr) {
      onAreaJump(corr.name, corr.coords);
    }
  };

  const handleUniversalAreaSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const query = customAreaInput.trim();
    if (!query) return;

    setIsGeocoding(true);
    try {
      const geo = await geocodeUniversalArea(query);
      if (geo) {
        onChange({
          area: geo.name,
          city: geo.city,
          country: geo.country,
        });

        if (onAreaJump) {
          onAreaJump(geo.name, [geo.lng, geo.lat]);
        }

        if (onTriggerScan) {
          onTriggerScan(undefined, geo.name, {
            lat: geo.lat,
            lng: geo.lng,
            radius: geo.radius,
            city: geo.city,
            country: geo.country,
          });
        }
      }
    } finally {
      setIsGeocoding(false);
    }
  };

  return (
    <div className="bg-clay-canvas border-b border-clay-border/80 px-4 py-3 space-y-2.5">
      {/* Top Filter Controls */}
      <div className="flex flex-wrap items-center gap-2.5">
        {/* Country / Market Selector */}
        <div className="flex items-center gap-1.5 bg-blue-50/90 border border-blue-200/80 px-3 py-2 rounded-clay-sm shadow-clay-btn text-xs font-bold text-accent-blue">
          <Globe2 className="w-3.5 h-3.5" />
          <select
            value={selectedMarketId}
            onChange={(e) => handleCountryChange(e.target.value)}
            className="bg-transparent text-accent-blue font-bold outline-none cursor-pointer pr-1"
          >
            <option value="all">🌐 Global (All Markets)</option>
            {Object.values(GLOBAL_MARKETS).map((m) => (
              <option key={m.id} value={m.id}>
                {m.flag} {m.name} ({m.currencySymbol})
              </option>
            ))}
          </select>
        </div>

        {/* City Selector (cascading from chosen country) */}
        {availableCities.length > 0 && (
          <div className="flex items-center gap-1.5 bg-white px-3 py-2 rounded-clay-sm shadow-clay-btn border border-clay-border/80 text-xs font-semibold text-slate-700">
            <span className="text-[11px] font-bold text-blue-600">City:</span>
            <select
              value={filters.city || 'all'}
              onChange={(e) => handleCityChange(e.target.value)}
              className="bg-transparent text-clay-text outline-none cursor-pointer pr-1 text-xs font-semibold"
            >
              <option value="all">All Cities</option>
              {availableCities.map((c) => (
                <option key={c.name} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Area / Corridor Selector */}
        {availableCorridors.length > 0 && (
          <div className="flex items-center gap-1.5 bg-white px-3 py-2 rounded-clay-sm shadow-clay-btn border border-clay-border/80 text-xs font-medium">
            <Compass className="w-3.5 h-3.5 text-accent-blue" />
            <select
              value={filters.area === 'all' ? 'All Corridors' : filters.area}
              onChange={(e) => handleCorridorChange(e.target.value === 'All Corridors' ? 'all' : e.target.value)}
              className="bg-transparent text-clay-text outline-none cursor-pointer pr-1 font-semibold"
            >
              <option value="All Corridors">All Corridors</option>
              {availableCorridors.map((corr) => (
                <option key={corr.name} value={corr.name}>
                  {corr.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Universal Search & Instant Area Scanner Input */}
        <form onSubmit={handleUniversalAreaSubmit} className="relative flex-1 min-w-[220px]">
          <MapPin className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-rose-500" />
          <input
            type="text"
            placeholder="Type any city or neighborhood worldwide (e.g. SoHo NYC, Shibuya, Bandra, Mitte)..."
            value={customAreaInput}
            onChange={(e) => setCustomAreaInput(e.target.value)}
            className="w-full bg-white text-xs sm:text-sm text-clay-text pl-10 pr-20 py-2 rounded-clay-sm border border-clay-border/90 shadow-clay-pressed focus:outline-none focus:ring-2 focus:ring-accent-blue/20 focus:border-accent-blue placeholder:text-clay-faint transition"
          />
          <button
            type="submit"
            disabled={isGeocoding || !customAreaInput.trim()}
            className="absolute right-1.5 top-1/2 -translate-y-1/2 px-2.5 py-1 bg-accent-blue hover:bg-blue-600 disabled:opacity-50 text-white rounded text-xs font-bold transition flex items-center gap-1"
          >
            <Crosshair className={`w-3 h-3 ${isGeocoding ? 'animate-spin' : ''}`} />
            <span>{isGeocoding ? 'Locating...' : 'Scan Area'}</span>
          </button>
        </form>

        {/* Search within leads */}
        <div className="relative min-w-[140px] max-w-[200px]">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-clay-faint" />
          <input
            type="text"
            placeholder="Filter leads..."
            value={filters.search}
            onChange={(e) => onChange({ search: e.target.value })}
            className="w-full bg-white text-xs text-clay-text pl-8 pr-2.5 py-2 rounded-clay-sm border border-clay-border/90 shadow-clay-pressed focus:outline-none focus:ring-1 focus:ring-accent-blue"
          />
        </div>

        {/* Category Dropdown */}
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

        {/* Website Filter */}
        <div className="flex items-center gap-1.5 bg-white px-3 py-2 rounded-clay-sm shadow-clay-btn border border-clay-border/80 text-xs font-medium">
          <span className="text-[11px] font-bold text-rose-600">Website:</span>
          <select
            value={filters.has_website || (filters.missing_website_only ? 'no' : 'all')}
            onChange={(e) => {
              const val = e.target.value as 'all' | 'yes' | 'no';
              onChange({
                has_website: val,
                missing_website_only: val === 'no',
              });
            }}
            className="bg-transparent text-clay-text outline-none cursor-pointer pr-1 font-semibold"
          >
            <option value="all">Website: All</option>
            <option value="no">🔥 Missing Website Only</option>
            <option value="yes">✅ Has Website</option>
          </select>
        </div>

        {/* Instagram Filter */}
        <div className="flex items-center gap-1.5 bg-white px-3 py-2 rounded-clay-sm shadow-clay-btn border border-clay-border/80 text-xs font-medium">
          <span className="text-[11px] font-bold text-purple-600">Instagram:</span>
          <select
            value={filters.instagram_filter || (filters.low_social_only ? 'low_followers' : 'all')}
            onChange={(e) => {
              const val = e.target.value as RadarFilterState['instagram_filter'];
              onChange({
                instagram_filter: val,
                low_social_only: val === 'low_followers',
              });
            }}
            className="bg-transparent text-clay-text outline-none cursor-pointer pr-1 font-semibold"
          >
            <option value="all">Instagram: All</option>
            <option value="low_followers">📉 Low Social (&lt;500 Followers)</option>
            <option value="no_instagram">🚫 No IG Profile Found</option>
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
          </select>
        </div>

        {/* Radar Spotted Recency */}
        <div className="flex items-center gap-1.5 bg-white px-3 py-2 rounded-clay-sm shadow-clay-btn border border-clay-border/80 text-xs font-medium">
          <Clock className="w-3.5 h-3.5 text-accent-emerald" />
          <select
            value={filters.recency}
            onChange={(e) => onChange({ recency: e.target.value as RadarFilterState['recency'] })}
            className="bg-transparent text-clay-text outline-none cursor-pointer pr-1"
          >
            <option value="all">Radar: All Spotted</option>
            <option value="24h">⚡ Spotted Today (&lt;24h)</option>
            <option value="7d">📅 Spotted This Week</option>
            <option value="30d">🗓️ Spotted This Month</option>
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

      {/* Row 2: Store Leads Opportunity Toggles + Hot Corridor Chips + Primary Scanner */}
      <div className="flex items-center gap-2 text-xs pt-1 overflow-x-auto text-clay-muted">
        {/* Missing Website Toggle */}
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

        {/* Low Social Footprint Toggle */}
        <button
          onClick={() => onChange({ low_social_only: !filters.low_social_only })}
          className={`shrink-0 flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all shadow-clay-pill border ${
            filters.low_social_only
              ? 'bg-purple-600 text-white border-purple-700 shadow-clay-btn'
              : 'bg-white text-purple-700 hover:bg-purple-50 border-purple-200/80'
          }`}
          title="Filter businesses with < 500 Instagram followers"
        >
          <Users className="w-3 h-3" />
          <span>Low IG (&lt;500)</span>
          {filters.low_social_only && <span className="ml-1 text-[10px] bg-purple-800 px-1.5 py-0.2 rounded-full">ACTIVE</span>}
        </button>

        <span className="shrink-0 text-clay-faint text-[11px] font-semibold tracking-wide uppercase pl-1">
          {activeMarket ? `${activeMarket.name} Hot Corridors:` : 'Trending Corridors:'}
        </span>

        {/* Hot Corridor Quick Chips */}
        {hotGrids.map((item: any) => (
          <button
            key={item.name}
            onClick={() => {
              onChange({ area: item.name });
              if (onAreaJump) onAreaJump(item.name, item.coords);
            }}
            className={`shrink-0 px-3 py-1 rounded-full text-xs font-medium transition-all ${
              filters.area === item.name
                ? 'bg-accent-blue text-white shadow-clay-btn'
                : 'bg-white text-clay-muted hover:text-clay-text shadow-clay-pill border border-clay-border/70 hover:bg-slate-50'
            }`}
          >
            {item.flag || (activeMarket ? activeMarket.flag : '📍')} {item.name}
          </button>
        ))}

        {/* Primary Scan Button */}
        {onTriggerScan && (
          <button
            onClick={() => {
              const activeCorridor = availableCorridors.find((c) => c.name === filters.area);
              onTriggerScan(
                selectedMarketId,
                filters.area,
                activeCorridor
                  ? { lat: activeCorridor.coords[1], lng: activeCorridor.coords[0], radius: activeCorridor.radius, city: filters.city, country: activeMarket?.name }
                  : undefined
              );
            }}
            disabled={isScanning}
            className="ml-auto shrink-0 flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold bg-amber-500 hover:bg-amber-600 text-white shadow-clay-btn transition active:translate-y-0.5 disabled:opacity-75"
          >
            <Sparkles className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin' : ''}`} />
            <span>
              {isScanning
                ? 'Scanning Worldwide Nodes...'
                : filters.area !== 'all'
                ? `⚡ Scan ${filters.area}`
                : filters.city
                ? `⚡ Scan ${filters.city}`
                : activeMarket
                ? `⚡ Scan ${activeMarket.name} Metros`
                : '⚡ Scan Global Corridors'}
            </span>
          </button>
        )}
      </div>
    </div>
  );
};
