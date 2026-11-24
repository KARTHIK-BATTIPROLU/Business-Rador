'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { Business, RadarFilterState, OutreachStatus } from '@/lib/types';
import { StatsBar } from '@/components/StatsBar';
import { FilterBar, SearchBox } from '@/components/FilterBar';
import { BusinessPanel } from '@/components/BusinessPanel';
import { AREA_COORDINATES } from '@/lib/areas';
import { LeadDetail } from '@/components/radar/LeadDrawer';
import { BottomSheet, type Snap } from '@/components/radar/BottomSheet';
import { Wordmark } from '@/components/ui/primitives';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { Button } from '@/components/ui/Button';
import { SAMPLE_LEADS } from '@/lib/sample-leads';
import { isSample } from '@/lib/lead';
import { X } from 'lucide-react';

// MapLibre needs WebGL: client only, loaded on demand.
const RadarMap = dynamic(() => import('@/components/RadarMap').then((m) => m.RadarMap), {
  ssr: false,
  loading: () => (
    <div className="absolute inset-0 grid place-items-center bg-paper">
      <p className="text-sm text-walnut" role="status">
        Drawing west Hyderabad…
      </p>
    </div>
  ),
});

type ScanState = { phase: 'idle' } | { phase: 'running'; step: number; where: string; steps: string[] } | { phase: 'done' | 'notice' | 'error'; text: string };

type ScanTarget = { lat: number; lng: number; radius?: number; city?: string; country?: string };

// Progress text that matches what /api/scan actually does for each kind of request.
function scanSteps(region: string, area: string, city?: string, coords?: boolean): { where: string; steps: string[] } {
  const isUS = region === 'usa' || /austin|dallas|houston|texas/i.test(`${area} ${city ?? ''}`);
  if (region === 'all' && area === 'all' && !coords) {
    return {
      where: 'eight cities',
      steps: [
        'Reading new Texas sales-tax permits',
        'Sweeping Shoreditch, Kokapet, Indiranagar and SoHo',
        'Sweeping Shibuya, Surry Hills and Mitte',
        'Looking for opening dates',
        'Scoring what came back',
      ],
    };
  }
  const where = coords && area === 'Map view' ? 'this part of the map' : area !== 'all' ? area : city || (region !== 'all' ? region : 'this area');
  return {
    where,
    steps: [
      coords ? `Locating ${where}` : `Finding ${where} on the map`,
      `Asking OpenStreetMap about shopfronts in ${where}`,
      ...(isUS ? ['Reading new Texas sales-tax permits'] : []),
      'Looking for opening dates and Instagram handles',
      'Scoring what came back',
    ],
  };
}

function useIsTablet() {
  const [is, setIs] = useState<boolean | null>(null);
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 768px)');
    const on = () => setIs(mq.matches);
    on();
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, []);
  return is;
}

export default function RadarPage() {
  const reduce = useReducedMotion();
  const isTablet = useIsTablet();
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [scan, setScan] = useState<ScanState>({ phase: 'idle' });
  const [sampleMode, setSampleMode] = useState(false);
  const [snap, setSnap] = useState<Snap>('half');
  const [flyToCoords, setFlyToCoords] = useState<{ lat: number; lng: number; zoom?: number } | null>(null);

  const [filters, setFilters] = useState<RadarFilterState>({
    region: 'all',
    area: 'all',
    category: 'all',
    recency: 'all',
    launch_age: 'all',
    missing_website_only: false,
    low_social_only: false,
    search: '',
    status: 'all',
    source: 'all',
  });

  const isScanning = scan.phase === 'running';

  const loadBusinesses = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const params = new URLSearchParams();
      if (filters.region && filters.region !== 'all') params.set('region', filters.region);
      if (filters.country) params.set('country', filters.country);
      if (filters.city) params.set('city', filters.city);
      if (filters.us_state && filters.us_state !== 'all') params.set('us_state', filters.us_state);
      if (filters.area && filters.area !== 'all') params.set('area', filters.area);
      if (filters.category && filters.category !== 'all') params.set('category', filters.category);
      if (filters.recency && filters.recency !== 'all') params.set('recency', filters.recency);
      if (filters.launch_age && filters.launch_age !== 'all') params.set('launch_age', filters.launch_age);
      if (filters.has_website) params.set('has_website', filters.has_website);
      if (filters.missing_website_only) params.set('missing_website_only', 'true');
      if (filters.instagram_filter) params.set('instagram_filter', filters.instagram_filter);
      if (filters.low_social_only) params.set('low_social_only', 'true');
      if (filters.status && filters.status !== 'all') params.set('status', filters.status);
      if (filters.search) params.set('search', filters.search);

      const ctrl = new AbortController();
      const timer = setTimeout(() => ctrl.abort(), 15000);
      const res = await fetch(`/api/businesses?${params.toString()}`, { signal: ctrl.signal }).finally(() => clearTimeout(timer));
      const data = await res.json();
      if (data.success && Array.isArray(data.businesses) && data.businesses.length > 0) {
        setBusinesses(data.businesses);
      } else {
        // Fall back to leads cached from this browser's last scan (fresh serverless instance).
        let cachedList: Business[] = [];
        try {
          const cached = localStorage.getItem('radar_cached_businesses');
          if (cached) {
            const parsed = JSON.parse(cached);
            // Drop synthetic demo rows that older builds cached.
            if (Array.isArray(parsed))
              cachedList = parsed.filter(
                (b: Business) =>
                  !b.id?.startsWith('mock-') &&
                  !b.id?.startsWith('ldn-sh-') &&
                  !b.id?.startsWith('tx-sc-') &&
                  !b.name?.includes('BakeOasis') &&
                  !b.name?.includes('Bouldin Creek Aperitivo'),
              );
          }
        } catch {}
        setBusinesses(cachedList);
        if (!data.success && cachedList.length === 0) setLoadError(data.error || 'The server returned an error.');
      }
    } catch (err) {
      console.error('Error loading businesses:', err);
      setLoadError(
        err instanceof DOMException && err.name === 'AbortError'
          ? 'The server took more than 15 seconds to answer.'
          : err instanceof Error
            ? err.message
            : 'Network error.',
      );
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    if (sampleMode) return;
    const t = setTimeout(loadBusinesses, filters.search ? 220 : 0); // debounce typing
    return () => clearTimeout(t);
  }, [loadBusinesses, sampleMode, filters.search]);

  // Escape closes the open lead.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && selectedBusiness && !document.querySelector('[role="dialog"],[role="menu"]')) setSelectedBusiness(null);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [selectedBusiness]);

  // Advance the scan progress text while the request is in flight.
  useEffect(() => {
    if (scan.phase !== 'running') return;
    const t = setInterval(() => setScan((s) => (s.phase === 'running' ? { ...s, step: Math.min(s.step + 1, s.steps.length - 1) } : s)), 4500);
    return () => clearInterval(t);
  }, [scan.phase]);

  // Sample mode: filter the sample set client-side so search still feels real.
  const visible = useMemo(() => {
    if (!sampleMode) return businesses;
    const s = filters.search.toLowerCase();
    return businesses.filter((b) => !s || b.name.toLowerCase().includes(s) || b.area.toLowerCase().includes(s));
  }, [businesses, sampleMode, filters.search]);

  const handleStatusChange = async (id: string, status: OutreachStatus, notes?: string) => {
    const patch = (b: Business) => (b.id === id ? { ...b, outreach_status: status, outreach_notes: notes ?? b.outreach_notes } : b);
    setBusinesses((prev) => prev.map(patch));
    setSelectedBusiness((prev) => (prev ? patch(prev) : prev));
    if (isSample({ id })) return; // samples never touch the database
    try {
      await fetch('/api/outreach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status, notes }),
      });
    } catch (err) {
      console.error('Failed to save status update:', err);
    }
  };

  const handleManualScan = async (overrideRegion?: string, overrideArea?: string, coords?: ScanTarget) => {
    const targetRegion = overrideRegion || filters.region || 'all';
    const targetArea = overrideArea !== undefined ? overrideArea : filters.area !== 'all' ? filters.area : 'all';
    const { where, steps } = scanSteps(targetRegion, targetArea, coords?.city || filters.city, Boolean(coords));
    setScan({ phase: 'running', step: 0, where, steps });
    setSampleMode(false);

    try {
      const res = await fetch('/api/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          area: targetArea,
          region: targetRegion,
          city: coords?.city || filters.city,
          country: coords?.country || filters.country,
          category: filters.category !== 'all' ? filters.category : undefined,
          ...(coords ? { lat: coords.lat, lng: coords.lng, ...(coords.radius ? { radius: coords.radius } : {}) } : {}),
        }),
      });

      if (!res.ok) {
        const errText = await res.text();
        let msg = `HTTP ${res.status}`;
        try {
          msg = JSON.parse(errText).error || msg;
        } catch {}
        setScan({ phase: 'error', text: `The scan stopped early: ${msg}. Nothing was lost; try again in a minute.` });
        return;
      }

      const data = await res.json();
      if (data.success) {
        setScan({
          phase: 'done',
          text:
            data.newly_added > 0
              ? `Found ${data.discovered_count} places in ${where}. ${data.newly_added} of them are new to your list.`
              : `Checked ${data.discovered_count} places in ${where}. Nothing new since the last scan.`,
        });
        if (Array.isArray(data.businesses) && data.businesses.length > 0) {
          setBusinesses(data.businesses);
          try {
            localStorage.setItem('radar_cached_businesses', JSON.stringify(data.businesses));
          } catch {}
        } else {
          await loadBusinesses();
        }
      } else {
        setScan({ phase: 'notice', text: data.error || 'The scan finished but returned fallback data.' });
      }
    } catch (err) {
      setScan({ phase: 'error', text: `The scan couldn't reach the server (${err instanceof Error ? err.message : 'network error'}).` });
    } finally {
      setTimeout(() => setScan((s) => (s.phase === 'running' ? s : { phase: 'idle' })), 9000);
    }
  };

  const previewSamples = () => {
    setSampleMode(true);
    setBusinesses(SAMPLE_LEADS);
    setLoadError(null);
  };

  const handleAreaJump = (areaName: string, coords?: [number, number]) => {
    const c = coords || AREA_COORDINATES[areaName];
    if (c) setFlyToCoords({ lng: c[0], lat: c[1], zoom: areaName === 'Hyderabad' ? 12.2 : 14.5 });
  };

  const handleScanViewport = (c: { lat: number; lng: number; radius: number }) => handleManualScan(filters.region, 'Map view', c);

  const select = (b: Business) => {
    setSelectedBusiness(b);
    setSnap((s) => (s === 'peek' ? 'half' : s));
  };

  const updateFilters = (u: Partial<RadarFilterState>) => setFilters((prev) => ({ ...prev, ...u }));

  const scanLabel =
    filters.area !== 'all'
      ? `Scan ${filters.area}`
      : filters.city
        ? `Scan ${filters.city}`
        : filters.region && filters.region !== 'all'
          ? `Scan ${filters.country || filters.region}`
          : 'Scan all markets';

  const panel = (
    <BusinessPanel
      businesses={visible}
      selectedId={selectedBusiness?.id}
      onSelectBusiness={(b) => {
        select(b);
        if (b.lat && b.lng) setFlyToCoords({ lat: b.lat, lng: b.lng, zoom: 15.5 });
      }}
      onStatusChange={handleStatusChange}
      onRefresh={sampleMode ? undefined : loadBusinesses}
      onTriggerScan={() => handleManualScan()}
      onPreviewSamples={sampleMode ? undefined : previewSamples}
      isScanning={isScanning}
      isLoading={isLoading && !sampleMode}
      error={loadError}
      header={<StatsBar businesses={visible} selectedArea={filters.area} />}
    />
  );

  return (
    <div className="flex flex-col h-[100dvh] w-full overflow-hidden">
      <a href="#radar-search" className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 z-[60] bg-surface border border-ink px-3 py-2 rounded-ctl">
        Skip to search
      </a>

      <header className="shrink-0 border-b border-hairline bg-paper z-20">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2 px-3 sm:px-4 py-2.5">
          <Link href="/" aria-label="Business Radar home" className="mr-1 sm:mr-3 min-h-11 inline-flex items-center">
            <Wordmark compact />
          </Link>
          <div className="order-3 basis-full md:order-none md:basis-auto md:flex-1 flex flex-wrap items-center gap-2">
            <SearchBox value={filters.search} onChange={(v) => updateFilters({ search: v })} className="flex-1 min-w-[11rem] md:max-w-md" />
            <FilterBar
              filters={filters}
              onChange={updateFilters}
              onAreaJump={handleAreaJump}
              onTriggerScan={(region, area, coords) => handleManualScan(region, area, coords)}
              isScanning={isScanning}
              className="contents"
            />
          </div>
          <Button onClick={() => handleManualScan()} disabled={isScanning} variant="primary" size="md" className="ml-auto">
            {isScanning ? 'Scanning…' : scanLabel}
          </Button>
          <ThemeToggle className="-ml-1" />
        </div>

        <AnimatePresence>
          {(scan.phase !== 'idle' || sampleMode) && (
            <motion.div
              initial={reduce ? false : { height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={reduce ? { opacity: 0 } : { height: 0, opacity: 0 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="overflow-hidden border-t border-hairline bg-surface"
            >
              <div role="status" className="flex items-center gap-3 px-4 py-2 text-sm">
                {scan.phase === 'running' ? (
                  <>
                    <span className="font-mono text-xs text-walnut tabular shrink-0">
                      {scan.step + 1}/{scan.steps.length}
                    </span>
                    <span className="text-ink">{scan.steps[scan.step]}…</span>
                    <span aria-hidden className="ml-auto hidden sm:block h-1 w-40 rounded-full bg-sunk overflow-hidden">
                      <span className="block h-full bg-ink transition-[width] duration-300 ease-out" style={{ width: `${((scan.step + 1) / (scan.steps.length + 1)) * 100}%` }} />
                    </span>
                  </>
                ) : scan.phase !== 'idle' ? (
                  <>
                    <span className={scan.phase === 'error' ? 'text-status-interested' : 'text-ink'}>{scan.text}</span>
                    <button type="button" onClick={() => setScan({ phase: 'idle' })} className="ml-auto size-9 grid place-items-center rounded-ctl text-walnut hover:bg-sunk" aria-label="Dismiss">
                      <X aria-hidden className="size-4 stroke-[1.5]" />
                    </button>
                  </>
                ) : (
                  <>
                    <span className="text-ink">These are ten invented sample shops. Run a scan to see real ones.</span>
                    <button type="button" onClick={() => { setSampleMode(false); setSelectedBusiness(null); loadBusinesses(); }} className="ml-auto text-sm underline underline-offset-4 text-walnut hover:text-ink min-h-9">
                      Hide samples
                    </button>
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <main className="relative flex-1 min-h-0 flex">
        {/* Left: lead list (tablet and up) */}
        <aside className="hidden md:flex w-[340px] lg:w-[380px] shrink-0 border-r border-hairline bg-paper flex-col min-h-0">{isTablet && panel}</aside>

        {/* Centre: map */}
        <div className="relative flex-1 min-w-0">
          <RadarMap
            businesses={visible}
            selectedBusiness={selectedBusiness}
            onSelectBusiness={select}
            flyToCoords={flyToCoords}
            onScanViewport={handleScanViewport}
            isScanning={isScanning}
          />
        </div>

        {/* Right: drawer (tablet and up). Pushes the map on desktop, overlays it on tablet. */}
        <AnimatePresence>
          {selectedBusiness && isTablet && (
            <motion.aside
              key="drawer"
              aria-label={`Lead: ${selectedBusiness.name}`}
              initial={reduce ? false : { x: 24, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={reduce ? { opacity: 0 } : { x: 24, opacity: 0 }}
              transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
              className="hidden md:flex absolute lg:static right-0 inset-y-0 z-20 w-[380px] lg:w-[400px] shrink-0 border-l border-ink lg:border-hairline bg-surface flex-col min-h-0"
            >
              <LeadDetail business={selectedBusiness} onClose={() => setSelectedBusiness(null)} onStatusChange={handleStatusChange} className="h-full" />
            </motion.aside>
          )}
        </AnimatePresence>
      </main>

      {/* Mobile: bottom sheet with the list, or the open lead */}
      {isTablet === false && (
      <BottomSheet snap={snap} onSnap={setSnap} label={selectedBusiness ? `Lead: ${selectedBusiness.name}` : 'Leads'}>
        {selectedBusiness ? (
          <LeadDetail business={selectedBusiness} onClose={() => setSelectedBusiness(null)} onStatusChange={handleStatusChange} className="h-full" />
        ) : (
          panel
        )}
      </BottomSheet>
      )}
    </div>
  );
}
