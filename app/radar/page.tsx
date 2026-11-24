'use client';

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import dynamic from 'next/dynamic';
import { TransitionLink as Link } from '@/components/motion/ViewTransitions';
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
import { CityClock } from '@/components/radar/CityClock';
import { useToast } from '@/components/ui/Toast';
import { RADAR_GOTO, RADAR_SCAN_PLACE, useCommands, useOpenCommandBar, type Command, type RadarGoto } from '@/components/command/CommandBar';
import { GLOBAL_MARKETS, geocodeUniversalArea } from '@/lib/geocoding';
import { STATUS_META } from '@/lib/lead';
import { Command as CommandIcon, Crosshair, Eye, HelpCircle, Store } from 'lucide-react';
import { Tour, type TourStep } from '@/components/tour/Tour';
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
  const [hovered, setHovered] = useState<{ id: string; from: 'map' | 'list' } | null>(null);
  const [mapCenter, setMapCenter] = useState<{ lat: number; lng: number } | null>(null);
  const [scanFocus, setScanFocus] = useState<{ lat: number; lng: number } | null>(null);
  const revealTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  // New scan results land a few at a time (best first) so pins and cards drop in
  // one after another. The server returns them all at once; this is presentation only.
  const revealProgressively = useCallback(
    (list: Business[]) => {
      if (revealTimer.current) clearInterval(revealTimer.current);
      if (reduce || list.length <= 3) {
        setBusinesses(list);
        return;
      }
      const ordered = [...list].sort((a, b) => b.lead_score - a.lead_score);
      const step = Math.max(1, Math.ceil(ordered.length / 14));
      let n = 0;
      setBusinesses([]);
      revealTimer.current = setInterval(() => {
        n = Math.min(ordered.length, n + step);
        setBusinesses(ordered.slice(0, n));
        if (n >= ordered.length && revealTimer.current) clearInterval(revealTimer.current);
      }, 70);
    },
    [reduce],
  );
  useEffect(() => () => {
    if (revealTimer.current) clearInterval(revealTimer.current);
  }, []);
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

  const toast = useToast();
  const openCommandBar = useOpenCommandBar();

  const handleStatusChange = async (id: string, status: OutreachStatus, notes?: string, opts?: { silent?: boolean }) => {
    const before = businesses.find((b) => b.id === id);
    if (!opts?.silent && before) {
      if (before.outreach_status !== status) {
        toast({
          text: `${before.name}: ${STATUS_META[status].label.toLowerCase()}`,
          action: { label: 'Undo', run: () => handleStatusChange(id, before.outreach_status, before.outreach_notes ?? undefined, { silent: true }) },
        });
      } else if ((notes ?? '') !== (before.outreach_notes ?? '')) {
        toast({
          text: 'Note saved',
          action: { label: 'Undo', run: () => handleStatusChange(id, status, before.outreach_notes ?? '', { silent: true }) },
        });
      }
    }
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
    const preset = targetArea !== 'all' ? AREA_COORDINATES[targetArea] : filters.city ? AREA_COORDINATES[filters.city] : undefined;
    const focus = coords ? { lat: coords.lat, lng: coords.lng } : preset ? { lng: preset[0], lat: preset[1] } : targetRegion === 'all' && targetArea === 'all' ? null : mapCenter;
    setScanFocus(focus);
    if (focus && !coords) setFlyToCoords({ ...focus, zoom: 13.5 });
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
          revealProgressively(data.businesses);
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
      setScanFocus(null);
      setTimeout(() => setScan((s) => (s.phase === 'running' ? s : { phase: 'idle' })), 9000);
    }
  };

  const previewSamples = () => {
    setSampleMode(true);
    revealProgressively(SAMPLE_LEADS);
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

  // ——— Command bar: places, typed scans, leads and page actions ———
  const gotoPlace = useCallback((g: RadarGoto) => {
    const m = g.marketId ? GLOBAL_MARKETS[g.marketId] : undefined;
    setFilters((prev) => ({
      ...prev,
      region: g.marketId || prev.region,
      country: m?.name ?? prev.country,
      city: g.city ?? prev.city,
      area: g.city && g.name !== g.city ? g.name : 'all',
    }));
    setFlyToCoords({ lng: g.coords[0], lat: g.coords[1], zoom: g.city && g.name !== g.city ? 14.5 : 12.5 });
  }, []);

  const scanPlace = useCallback(
    async (q: string) => {
      const geo = await geocodeUniversalArea(q);
      if (!geo) {
        toast({ text: `Couldn't find "${q}". Try adding the city.` });
        return;
      }
      setFilters((prev) => ({ ...prev, area: geo.name, city: geo.city, country: geo.country }));
      setFlyToCoords({ lng: geo.lng, lat: geo.lat, zoom: 14 });
      handleManualScan(undefined, geo.name, { lat: geo.lat, lng: geo.lng, radius: geo.radius, city: geo.city, country: geo.country });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [toast],
  );

  useEffect(() => {
    const onGoto = (e: Event) => gotoPlace((e as CustomEvent<RadarGoto>).detail);
    const onScan = (e: Event) => scanPlace((e as CustomEvent<string>).detail);
    window.addEventListener(RADAR_GOTO, onGoto);
    window.addEventListener(RADAR_SCAN_PLACE, onScan);
    return () => {
      window.removeEventListener(RADAR_GOTO, onGoto);
      window.removeEventListener(RADAR_SCAN_PLACE, onScan);
    };
  }, [gotoPlace, scanPlace]);

  // Arriving from the command bar on another page: /radar?go=Shibuya or /radar?scan=Bandra
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const goName = params.get('go');
    const scanQ = params.get('scan');
    if (goName) {
      for (const m of Object.values(GLOBAL_MARKETS))
        for (const c of m.cities) {
          if (c.name === goName) return gotoPlace({ name: c.name, coords: c.coords, marketId: m.id, city: c.name });
          const k = c.corridors.find((x) => x.name === goName);
          if (k) return gotoPlace({ name: k.name, coords: k.coords, marketId: m.id, city: c.name });
        }
    }
    if (scanQ) scanPlace(scanQ);
    // run once on arrival
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const commands = useMemo<Command[]>(
    () => [
      {
        id: 'a-scan-view',
        group: 'Actions',
        label: 'Scan this area of the map',
        keywords: 'scan viewport here',
        icon: <Crosshair aria-hidden />,
        run: () => mapCenter && handleScanViewport({ ...mapCenter, radius: 1800 }),
      },
      ...(sampleMode
        ? []
        : [{ id: 'a-samples', group: 'Actions' as const, label: 'Preview with sample leads', keywords: 'demo example', icon: <Eye aria-hidden />, run: () => previewSamples() }]),
      ...visible.map((b) => ({
        id: `lead-${b.id}`,
        group: 'Leads' as const,
        label: b.name,
        hint: `${b.area} · ${b.lead_score}`,
        keywords: `${b.category} ${b.sub_category ?? ''} ${b.city ?? ''}`,
        icon: <Store aria-hidden />,
        run: () => {
          select(b);
          if (b.lat && b.lng) setFlyToCoords({ lat: b.lat, lng: b.lng, zoom: 15.5 });
        },
      })),
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [visible, sampleMode, mapCenter],
  );
  useCommands('radar', commands);

  // ——— Guided tour ———
  const [tourOpen, setTourOpen] = useState(false);
  const [tourOffer, setTourOffer] = useState(false);
  const tourSelected = useRef(false);
  const tourSamples = useRef(false);

  useEffect(() => {
    let seen = false;
    try {
      seen = localStorage.getItem('br_tour_seen') === '1';
    } catch {}
    const asked = new URLSearchParams(window.location.search).get('tour') === '1';
    if (asked) setTourOpen(true);
    else if (!seen) setTourOffer(true);
  }, []);

  const endTour = (finished: boolean) => {
    setTourOpen(false);
    setTourOffer(false);
    try {
      localStorage.setItem('br_tour_seen', '1');
    } catch {}
    if (tourSelected.current) {
      setSelectedBusiness(null);
      tourSelected.current = false;
    }
    if (finished && tourSamples.current) toast({ text: 'The sample leads stay until you run a scan or hide them.' });
    tourSamples.current = false;
  };

  const tourCommands = useMemo<Command[]>(
    () => [{ id: 'a-tour', group: 'Actions', label: 'Take the tour', keywords: 'help how tutorial guide', icon: <HelpCircle aria-hidden />, run: () => setTourOpen(true) }],
    [],
  );
  useCommands('radar-tour', tourCommands);

  const tourSteps: TourStep[] = [
    {
      id: 'welcome',
      title: 'This is the radar',
      body: (
        <>
          It finds shops that opened recently and don&apos;t have a website yet, anywhere in the world. Here&apos;s how to go from
          a map to a sent message in about a minute.
        </>
      ),
    },
    {
      id: 'filters',
      target: '[data-tour="filters"]',
      title: 'Choose where to look',
      body: 'Pick a country, city and neighbourhood, or type any place in the world. Filters for website, Instagram and opening date live here too.',
    },
    {
      id: 'scan',
      target: '[data-tour="scan"]',
      title: 'Scan for new shops',
      body: 'This scans whatever you picked. Rings ripple on the map while it works, then new leads drop in, best first.',
    },
    {
      id: 'scan-area',
      target: '[data-tour="scan-area"]',
      title: 'Or scan exactly what you see',
      body: 'Drag and zoom the map anywhere, then scan that spot.',
    },
    {
      id: 'list',
      target: '[data-tour="list"]',
      pad: 0,
      title: 'Your leads, best first',
      body: 'The score leans hardest on "no website", then on how new the shop is and how small it is online. Hover a lead to see its pin pulse on the map.',
      onEnter: () => {
        setSnap('half');
        if (visible.length === 0 && !sampleMode) {
          tourSamples.current = true;
          previewSamples();
        }
      },
    },
    {
      id: 'card',
      target: '[data-tour="lead-card"]',
      title: 'One tap to reach out',
      body: 'The main button opens WhatsApp with a hello already written. Call, email, Maps and Instagram are in the ••• menu, and you change the status right on the card.',
      onEnter: () => {
        if (tourSelected.current) {
          setSelectedBusiness(null);
          tourSelected.current = false;
        }
      },
    },
    {
      id: 'drawer',
      target: '[data-tour="drawer"]',
      pad: 0,
      title: 'Everything about one shop',
      body: 'Click a lead to open this. Notes, every contact option, and a link to the full lead page with research and editable pitch messages.',
      onEnter: () => {
        const first = [...visible].sort((a, b) => b.lead_score - a.lead_score)[0];
        if (first && !selectedBusiness) {
          tourSelected.current = true;
          select(first);
          setSnap('full');
        }
      },
    },
    {
      id: 'clock',
      target: '[data-tour="clock"]',
      title: 'Check the local time',
      body: 'Shows the time where the map is looking, so you don’t message a shop owner at midnight.',
      onEnter: () => {
        if (tourSelected.current) {
          setSelectedBusiness(null);
          tourSelected.current = false;
          setSnap('half');
        }
      },
    },
    {
      id: 'command',
      target: '[data-tour="command"]',
      title: 'Jump anywhere with Ctrl K',
      body: 'Type a shop, a city or "scan Bandra". It works on every page. Press / to search your leads.',
    },
    {
      id: 'done',
      title: 'You’re set',
      body: 'Run your first scan, or try the sample leads first. You can replay this tour any time from the ? button.',
    },
  ];

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
      hovered={hovered}
      onHover={(id) => setHovered(id ? { id, from: 'list' } : null)}
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
          <Button onClick={() => handleManualScan()} disabled={isScanning} variant="primary" size="md" className="ml-auto" data-tour="scan">
            <span className="sm:hidden">{isScanning ? 'Scanning…' : 'Scan'}</span>
            <span className="hidden sm:inline">{isScanning ? 'Scanning…' : scanLabel}</span>
          </Button>
          <button
            type="button"
            data-tour="command"
            onClick={openCommandBar}
            aria-label="Open command bar (Ctrl K)"
            title="Command bar (Ctrl K)"
            className="hidden lg:inline-flex items-center gap-1.5 h-9 px-2.5 rounded-ctl border border-hairline bg-surface text-xs text-walnut hover:border-ink hover:text-ink"
          >
            <CommandIcon aria-hidden className="size-3.5 stroke-[1.5]" />
            <kbd className="font-mono">Ctrl K</kbd>
          </button>
          <CityClock center={mapCenter} className="hidden md:inline-flex order-last md:order-none" />
          <button
            type="button"
            onClick={() => setTourOpen(true)}
            aria-label="How the radar works (tour)"
            title="How it works"
            className="-ml-1 size-11 shrink-0 grid place-items-center rounded-ctl text-walnut hover:text-ink hover:bg-sunk"
          >
            <HelpCircle aria-hidden className="size-[18px] stroke-[1.5]" />
          </button>
          <ThemeToggle className="-ml-2" />
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
          <CityClock center={mapCenter} className="md:hidden absolute top-[104px] left-3 z-10" />
          <RadarMap
            businesses={visible}
            selectedBusiness={selectedBusiness}
            onSelectBusiness={select}
            flyToCoords={flyToCoords}
            onScanViewport={handleScanViewport}
            scanFocus={scanFocus}
            hoveredId={hovered?.id ?? null}
            onHoverBusiness={(id) => setHovered(id ? { id, from: 'map' } : null)}
            onCenterChange={setMapCenter}
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
      <Tour steps={isTablet === false ? tourSteps.filter((t) => t.id !== 'command') : tourSteps} open={tourOpen} onClose={endTour} />

      {/* First visit: offer the tour instead of forcing it */}
      <AnimatePresence>
        {tourOffer && !tourOpen && (
          <motion.div
            role="dialog"
            aria-label="Take the tour"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            transition={{ type: 'spring', stiffness: 380, damping: 32, delay: 0.6 }}
            className="fixed z-[60] left-3 right-3 top-[132px] md:left-auto md:right-5 md:top-auto md:bottom-6 md:w-[340px] rounded-panel border border-ink bg-surface p-5 shadow-hard"
          >
            <p className="font-display text-xl leading-tight">First time here?</p>
            <p className="mt-1.5 text-sm text-walnut">A one-minute tour of the radar, from picking a city to sending the first message.</p>
            <div className="mt-4 flex gap-2">
              <Button variant="primary" size="sm" onClick={() => setTourOpen(true)}>
                Take the tour
              </Button>
              <Button variant="ghost" size="sm" onClick={() => endTour(false)}>
                Not now
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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
