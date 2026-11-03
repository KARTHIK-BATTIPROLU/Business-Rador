'use client';

import React, { useState, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { Business, RadarFilterState, OutreachStatus } from '@/lib/types';
import { StatsBar } from '@/components/StatsBar';
import { FilterBar } from '@/components/FilterBar';
import { BusinessPanel } from '@/components/BusinessPanel';
import { AREA_COORDINATES } from '@/components/RadarMap';
import { Radar, Radio, Github, ExternalLink, Database, Home, ArrowLeft, Sparkles, RefreshCw, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

// Dynamic import with SSR disabled for WebGL canvas
const RadarMap = dynamic(
  () => import('@/components/RadarMap').then((mod) => mod.RadarMap),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full flex flex-col items-center justify-center bg-clay-canvas text-clay-muted gap-3">
        <Radar className="w-8 h-8 text-accent-blue animate-spin" />
        <span className="text-xs font-medium tracking-wide">Loading Hyderabad MapLibre Vector Radar...</span>
      </div>
    ),
  }
);

export default function RadarPage() {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isScanning, setIsScanning] = useState(false);
  const [scanMessage, setScanMessage] = useState<string | null>(null);
  const [flyToCoords, setFlyToCoords] = useState<{ lat: number; lng: number; zoom?: number } | null>(
    null
  );

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

  const loadBusinesses = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.region && filters.region !== 'all') params.set('region', filters.region);
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

      const res = await fetch(`/api/businesses?${params.toString()}`);
      const data = await res.json();
      if (data.success && Array.isArray(data.businesses)) {
        setBusinesses(data.businesses);
      }
    } catch (err) {
      console.error('Error loading businesses:', err);
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    loadBusinesses();
  }, [loadBusinesses]);

  const handleStatusChange = async (id: string, status: OutreachStatus, notes?: string) => {
    setBusinesses((prev) =>
      prev.map((b) => (b.id === id ? { ...b, outreach_status: status, outreach_notes: notes || b.outreach_notes } : b))
    );
    if (selectedBusiness?.id === id) {
      setSelectedBusiness((prev) => (prev ? { ...prev, outreach_status: status, outreach_notes: notes || prev.outreach_notes } : null));
    }

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

  const handleManualScan = async (selectedRegion?: string, selectedArea?: string) => {
    setIsScanning(true);
    const targetRegion = selectedRegion || filters.region || 'all';
    const targetArea = selectedArea !== undefined ? selectedArea : (filters.area !== 'all' ? filters.area : 'all');

    let scanTitle = 'Hyderabad West corridors';
    if (targetRegion === 'texas') scanTitle = 'Texas Comptroller Open Data (SODA API) across Austin & Dallas';
    else if (targetRegion === 'london' || targetArea.includes('Shoreditch') || targetArea.includes('Soho')) scanTitle = `London (${targetArea !== 'all' ? targetArea : 'Shoreditch & Soho'}) corridors`;
    else if (targetRegion === 'all' && targetArea === 'all') scanTitle = 'Global Markets (Texas Permits, London & Hyderabad)';
    else if (targetArea !== 'all') scanTitle = targetArea;

    setScanMessage(`📡 Querying live government & GPS nodes across ${scanTitle}...`);

    try {
      const res = await fetch('/api/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ area: targetArea, region: targetRegion }),
      });
      const data = await res.json();
      if (data.success) {
        setScanMessage(
          `✅ Discovery Complete: Spotted ${data.discovered_count} commercial businesses! (${data.newly_added} fresh leads added to pipeline)`
        );
        await loadBusinesses();
      } else {
        setScanMessage(`⚠️ Scan notice: ${data.error || 'Scan finished with fallback data'}`);
      }
    } catch (err: any) {
      setScanMessage(`❌ Scan error: ${err.message}`);
    } finally {
      setIsScanning(false);
      setTimeout(() => setScanMessage(null), 8000);
    }
  };

  const handleAreaJump = (areaName: string) => {
    const coords = AREA_COORDINATES[areaName];
    if (coords) {
      setFlyToCoords({ lng: coords[0], lat: coords[1], zoom: 14.5 });
    }
  };

  return (
    <div className="flex flex-col h-screen w-screen bg-clay-canvas overflow-hidden select-none">
      {/* Top Porcelain Header */}
      <header className="h-16 border-b border-clay-border/80 bg-white/95 backdrop-blur-md px-5 flex items-center justify-between z-20 shrink-0 shadow-sm">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            title="Back to Landing Page"
            className="p-2 rounded-clay-sm bg-white hover:bg-slate-50 text-clay-muted hover:text-clay-text border border-clay-border shadow-clay-btn transition active:translate-y-0.5"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>

          <div className="p-2.5 rounded-clay-sm bg-blue-50 text-accent-blue shadow-clay-btn border border-blue-100">
            <Radar className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-bold text-clay-text text-base tracking-tight">
                Business Founder Radar
              </h1>
              <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-blue-50 text-accent-blue border border-blue-200/80 font-semibold shadow-clay-pill hidden sm:inline">
                {filters.region === 'texas'
                  ? '🇺🇸 Texas High-Ticket Pipeline ($)'
                  : filters.region === 'london'
                  ? '🇬🇧 London Independent Pipeline (£)'
                  : filters.region === 'hyderabad'
                  ? '🇮🇳 Hyderabad MSME Pipeline (₹)'
                  : '🌐 Global MSME & Retail Pipeline'}
              </span>
            </div>
            <div className="text-[11px] text-clay-muted flex items-center gap-2 font-medium">
              <span className="flex items-center gap-1.5 text-emerald-700">
                <Radio className="w-2.5 h-2.5 text-accent-emerald animate-ping" /> Scans Every 8h
              </span>
              <span>•</span>
              <span>
                {filters.region === 'texas'
                  ? 'Texas Comptroller Open Data · Google Maps · Instagram'
                  : 'Google Maps · Instagram · OpenStreetMap'}
              </span>
            </div>
          </div>
        </div>

        {/* Navigation & Live Manual Scanner Action */}
        <div className="flex items-center gap-2.5">
          {/* Prominent Live Radar Scan Button */}
          <button
            onClick={() => handleManualScan(filters.region, filters.area)}
            disabled={isScanning}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-clay-sm bg-accent-blue hover:bg-blue-600 text-white font-bold text-xs shadow-clay-card transition active:translate-y-0.5 disabled:opacity-75"
            title="Query physical GPS nodes and live government permit databases"
          >
            <Sparkles className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin' : 'animate-pulse'}`} />
            <span className="hidden sm:inline">
              {isScanning
                ? 'Scanning Sources...'
                : filters.area !== 'all'
                ? `⚡ Scan ${filters.area} for New Businesses`
                : filters.region === 'texas'
                ? '⚡ Scan Texas Permits (80+ Leads)'
                : filters.region === 'london'
                ? '⚡ Scan London Corridors (50+ Leads)'
                : filters.region === 'all'
                ? '⚡ Scan All Global Markets (100+ Leads)'
                : '⚡ Scan Hyderabad for New Businesses'}
            </span>
            <span className="sm:hidden">
              {isScanning ? 'Scanning...' : '⚡ Scan'}
            </span>
          </button>

          <Link
            href="/"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-clay-sm bg-white hover:bg-slate-50 text-xs font-semibold text-clay-text border border-clay-border shadow-clay-btn transition active:translate-y-0.5"
          >
            <Home className="w-3.5 h-3.5 text-slate-700" />
            <span className="hidden md:inline">Landing Page</span>
          </Link>

          <Link
            href="/todos"
            className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-clay-sm bg-blue-50 hover:bg-blue-100 text-xs font-semibold text-accent-blue border border-blue-200/80 shadow-clay-btn transition active:translate-y-0.5"
          >
            <Database className="w-3.5 h-3.5 text-accent-blue" />
            <span>Supabase SSR</span>
          </Link>

          <a
            href="https://github.com/KARTHIK-BATTIPROLU/Business-Rador"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-clay-sm bg-white hover:bg-slate-50 text-xs font-semibold text-clay-text border border-clay-border shadow-clay-btn transition active:translate-y-0.5"
          >
            <Github className="w-3.5 h-3.5 text-slate-700" />
            <span>GitHub</span>
            <ExternalLink className="w-3 h-3 text-clay-faint" />
          </a>
        </div>
      </header>

      {/* Live Scan Notification Toast */}
      {scanMessage && (
        <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white text-xs px-5 py-2 font-medium flex items-center justify-between shadow-md z-30 transition-all">
          <div className="flex items-center gap-2">
            {isScanning ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />
            )}
            <span className="font-semibold">{scanMessage}</span>
          </div>
          <button
            onClick={() => setScanMessage(null)}
            className="text-white/80 hover:text-white px-2 py-0.5 text-xs font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {/* KPI Stats Bar */}
      <StatsBar businesses={businesses} selectedArea={filters.area} />

      {/* Filter Bar with Inset Search & Clay Selectors */}
      <FilterBar
        filters={filters}
        onChange={(updated) => setFilters((prev) => ({ ...prev, ...updated }))}
        onAreaJump={handleAreaJump}
        onTriggerScan={(region, area) => handleManualScan(region || filters.region, area || filters.area)}
        isScanning={isScanning}
      />

      {/* Main Split Layout */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
        {/* Left: Map */}
        <div className="flex-1 h-[50vh] md:h-full relative">
          <RadarMap
            businesses={businesses}
            selectedBusiness={selectedBusiness}
            onSelectBusiness={(b) => setSelectedBusiness(b)}
            flyToCoords={flyToCoords}
          />
        </div>

        {/* Right: Business CRM Discovery Panel */}
        <div className="w-full md:w-[420px] lg:w-[460px] h-[50vh] md:h-full shrink-0 z-10">
          <BusinessPanel
            businesses={businesses}
            selectedId={selectedBusiness?.id}
            onSelectBusiness={(b) => {
              setSelectedBusiness(b);
              if (b.lat && b.lng) {
                setFlyToCoords({ lat: b.lat, lng: b.lng, zoom: 15.5 });
              }
            }}
            onStatusChange={handleStatusChange}
            onRefresh={loadBusinesses}
            onTriggerScan={() => handleManualScan(filters.area)}
            isScanning={isScanning}
            isLoading={isLoading}
          />
        </div>
      </div>
    </div>
  );
}
