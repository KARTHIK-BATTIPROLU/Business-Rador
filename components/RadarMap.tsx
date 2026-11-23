'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { Business } from '@/lib/types';
import { LocateFixed } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RadarMapProps {
  businesses: Business[];
  selectedBusiness?: Business | null;
  onSelectBusiness: (b: Business) => void;
  flyToCoords?: { lat: number; lng: number; zoom?: number } | null;
  className?: string;
}

// Both bases are CARTO vector styles, recoloured below to the paper palette.
const MAP_STYLES = {
  paper: 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',
  streets: 'https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json',
} as const;
type StyleKey = keyof typeof MAP_STYLES;

const HOME: [number, number] = [78.36, 17.43];

export const AREA_COORDINATES: Record<string, [number, number]> = {
  // Hyderabad corridors
  Kokapet: [78.3298, 17.4156],
  Gachibowli: [78.3489, 17.44],
  'HITECH City': [78.3908, 17.4486],
  Madhapur: [78.3908, 17.4484],
  'Financial District': [78.343, 17.417],
  Nanakramguda: [78.355, 17.418],
  'Jubilee Hills': [78.4072, 17.4312],
  'Banjara Hills': [78.435, 17.4156],
  Kondapur: [78.355, 17.46],
  Narsingi: [78.3588, 17.3883],
  Hyderabad: [78.35, 17.43],

  // Texas corridors (USA)
  'South Congress': [-97.7495, 30.251],
  'Bouldin Creek': [-97.7565, 30.248],
  'East Austin': [-97.721, 30.2635],
  Downtown: [-97.7402, 30.268],
  Austin: [-97.7431, 30.2672],
  Uptown: [-96.804, 32.7985],
  'Deep Ellum': [-96.7845, 32.7835],
  Dallas: [-96.797, 32.7767],
  Montrose: [-95.391, 29.742],
  'The Heights': [-95.398, 29.799],
  Houston: [-95.3698, 29.7604],
  Texas: [-97.7431, 30.2672],

  // London corridors (UK)
  Shoreditch: [-0.0785, 51.5245],
  Soho: [-0.134, 51.5135],
  'Covent Garden': [-0.124, 51.5117],
  London: [-0.1276, 51.5074],
};

/* Palette for the basemap (hex because MapLibre paint props don't read CSS vars). */
const C = {
  paper: '#F5EFE4',
  land2: '#EFE7D8',
  green: '#E4DFC8',
  water: '#CFCDBE',
  building: '#E7DCCB',
  roadMinor: '#E8DAC3',
  roadMajor: '#D6C1A0',
  roadCase: '#D9C7AB',
  hairline: '#CDBBA3',
  walnut: '#5A4636',
  tan: '#8A6A4F',
  ink: '#1B1612',
  surface: '#FBF7EF',
  accent: '#C2562B',
  stone: '#8C8174',
};

/** Recolour whatever CARTO style is loaded: cream land, tan roads, muted water, no blue. */
function paperize(map: maplibregl.Map) {
  const style = map.getStyle();
  if (!style?.layers) return;
  const set = (id: string, prop: string, value: unknown) => {
    try {
      map.setPaintProperty(id, prop, value);
    } catch {
      /* layer may not support the property */
    }
  };
  for (const layer of style.layers) {
    const id = layer.id.toLowerCase();
    if (id.startsWith('radar-')) continue;
    switch (layer.type) {
      case 'background':
        set(layer.id, 'background-color', C.paper);
        break;
      case 'fill':
        if (id.includes('water')) set(layer.id, 'fill-color', C.water);
        else if (id.includes('building')) {
          set(layer.id, 'fill-color', C.building);
          set(layer.id, 'fill-outline-color', C.hairline);
        } else if (/park|wood|grass|green|landcover|nature|cemetery|pitch/.test(id)) set(layer.id, 'fill-color', C.green);
        else set(layer.id, 'fill-color', C.land2);
        break;
      case 'line':
        if (id.includes('water')) set(layer.id, 'line-color', C.water);
        else if (id.includes('boundary')) set(layer.id, 'line-color', C.hairline);
        else if (id.includes('rail')) set(layer.id, 'line-color', C.hairline);
        else if (id.includes('case') || id.includes('casing')) set(layer.id, 'line-color', C.roadCase);
        else if (/motorway|trunk|primary|major|highway/.test(id)) set(layer.id, 'line-color', C.roadMajor);
        else set(layer.id, 'line-color', C.roadMinor);
        break;
      case 'symbol':
        set(layer.id, 'text-color', id.includes('water') ? C.tan : C.walnut);
        set(layer.id, 'text-halo-color', C.paper);
        set(layer.id, 'icon-opacity', 0.55);
        break;
      default:
        break;
    }
  }
}

const toGeoJSON = (items: Business[]): GeoJSON.FeatureCollection<GeoJSON.Point> => ({
  type: 'FeatureCollection',
  features: items
    .filter((b) => b.lat && b.lng)
    .map((b) => ({
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [b.lng, b.lat] },
      properties: { id: b.id, name: b.name, area: b.area, lead_score: b.lead_score, status: b.outreach_status },
    })),
});

const escapeHTML = (s: string) => s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);

export const RadarMap: React.FC<RadarMapProps> = ({ businesses, selectedBusiness, onSelectBusiness, flyToCoords, className }) => {
  const container = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const dataRef = useRef<Business[]>(businesses);
  dataRef.current = businesses;
  const selectRef = useRef(onSelectBusiness);
  selectRef.current = onSelectBusiness;
  const selectedIdRef = useRef<string | null>(null);
  selectedIdRef.current = selectedBusiness?.id ?? null;
  const hoverRef = useRef<maplibregl.Popup | null>(null);
  const [styleKey, setStyleKey] = useState<StyleKey>('paper');
  const [ready, setReady] = useState(false);

  const install = useCallback((map: maplibregl.Map) => {
    paperize(map);
    if (!map.getSource('radar-src')) {
      map.addSource('radar-src', { type: 'geojson', data: toGeoJSON(dataRef.current), cluster: true, clusterMaxZoom: 14, clusterRadius: 44 });
    }
    if (!map.getLayer('radar-clusters')) {
      map.addLayer({
        id: 'radar-clusters',
        type: 'circle',
        source: 'radar-src',
        filter: ['has', 'point_count'],
        paint: {
          'circle-color': C.ink,
          'circle-radius': ['step', ['get', 'point_count'], 15, 10, 19, 30, 24],
          'circle-stroke-width': 3,
          'circle-stroke-color': C.surface,
        },
      });
      map.addLayer({
        id: 'radar-cluster-count',
        type: 'symbol',
        source: 'radar-src',
        filter: ['has', 'point_count'],
        layout: { 'text-field': '{point_count_abbreviated}', 'text-size': 12, 'text-font': ['Open Sans Bold', 'Arial Unicode MS Bold'] },
        paint: { 'text-color': C.surface },
      });
      // Terracotta ring under high scorers.
      map.addLayer({
        id: 'radar-hot-ring',
        type: 'circle',
        source: 'radar-src',
        filter: ['all', ['!', ['has', 'point_count']], ['>=', ['get', 'lead_score'], 85]],
        paint: { 'circle-radius': 10, 'circle-color': 'rgba(0,0,0,0)', 'circle-stroke-width': 2.5, 'circle-stroke-color': C.accent },
      });
      map.addLayer({
        id: 'radar-point',
        type: 'circle',
        source: 'radar-src',
        filter: ['!', ['has', 'point_count']],
        paint: {
          'circle-radius': 5.5,
          'circle-color': ['match', ['get', 'status'], ['closed', 'skip'], C.stone, C.ink],
          'circle-stroke-width': 1.5,
          'circle-stroke-color': C.surface,
        },
      });
      map.addLayer({
        id: 'radar-selected',
        type: 'circle',
        source: 'radar-src',
        filter: ['==', ['get', 'id'], selectedIdRef.current ?? ''],
        paint: { 'circle-radius': 17, 'circle-color': 'rgba(0,0,0,0)', 'circle-stroke-width': 1.5, 'circle-stroke-color': C.ink },
      });
    }
  }, []);

  // Create the map once.
  useEffect(() => {
    if (!container.current || mapRef.current) return;
    const map = new maplibregl.Map({
      container: container.current,
      style: MAP_STYLES.paper,
      center: HOME,
      zoom: 12.2,
      attributionControl: { compact: true },
    });
    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-right');
    map.on('style.load', () => {
      install(map);
      setReady(true);
    });

    map.on('click', 'radar-clusters', async (e) => {
      const f = e.features?.[0];
      const src = map.getSource('radar-src') as maplibregl.GeoJSONSource | undefined;
      if (!f || !src) return;
      const zoom = await src.getClusterExpansionZoom(f.properties?.cluster_id);
      map.easeTo({ center: (f.geometry as GeoJSON.Point).coordinates as [number, number], zoom: Math.min(zoom, 16), duration: 350 });
    });
    map.on('click', 'radar-point', (e) => {
      const id = e.features?.[0]?.properties?.id;
      const b = dataRef.current.find((x) => x.id === id);
      if (b) selectRef.current(b);
    });
    // Hover label in the display serif.
    map.on('mouseenter', 'radar-point', (e) => {
      map.getCanvas().style.cursor = 'pointer';
      const f = e.features?.[0];
      if (!f) return;
      hoverRef.current?.remove();
      hoverRef.current = new maplibregl.Popup({ closeButton: false, closeOnClick: false, offset: 12, className: 'radar-hover' })
        .setLngLat((f.geometry as GeoJSON.Point).coordinates as [number, number])
        .setHTML(
          `<div style="font-family:var(--font-display),Georgia,serif;font-size:16px;line-height:1.15;color:${C.ink}">${escapeHTML(
            String(f.properties?.name ?? ''),
          )}</div><div style="font-family:var(--font-mono),monospace;font-size:11px;color:${C.walnut};margin-top:3px">${escapeHTML(
            String(f.properties?.area ?? ''),
          )} · ${f.properties?.lead_score}</div>`,
        )
        .addTo(map);
    });
    map.on('mouseleave', 'radar-point', () => {
      map.getCanvas().style.cursor = '';
      hoverRef.current?.remove();
    });
    map.on('mouseenter', 'radar-clusters', () => (map.getCanvas().style.cursor = 'pointer'));
    map.on('mouseleave', 'radar-clusters', () => (map.getCanvas().style.cursor = ''));

    // Keep the canvas sized when the drawer / sheet changes the layout.
    const ro = new ResizeObserver(() => map.resize());
    ro.observe(container.current);

    mapRef.current = map;
    return () => {
      ro.disconnect();
      map.remove();
      mapRef.current = null;
    };
  }, [install]);

  useEffect(() => {
    const src = mapRef.current?.getSource('radar-src') as maplibregl.GeoJSONSource | undefined;
    src?.setData(toGeoJSON(businesses));
  }, [businesses, ready]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !flyToCoords) return;
    map.flyTo({ center: [flyToCoords.lng, flyToCoords.lat], zoom: flyToCoords.zoom || 14.5, speed: 1.6, essential: true });
  }, [flyToCoords]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !ready) return;
    if (map.getLayer('radar-selected')) map.setFilter('radar-selected', ['==', ['get', 'id'], selectedBusiness?.id ?? '']);
    if (selectedBusiness?.lat && selectedBusiness?.lng) {
      map.easeTo({ center: [selectedBusiness.lng, selectedBusiness.lat], zoom: Math.max(map.getZoom(), 14.5), duration: 400 });
    }
  }, [selectedBusiness, ready]);

  const switchStyle = (key: StyleKey) => {
    if (key === styleKey) return;
    setStyleKey(key);
    mapRef.current?.setStyle(MAP_STYLES[key]);
  };

  return (
    <div className={cn('relative w-full h-full min-h-[320px] bg-paper overflow-hidden', className)}>
      <div ref={container} className="absolute inset-0" aria-label="Map of discovered leads" role="region" />

      {/* Radar sweep: the only looping animation in the product. Off under reduced motion. */}
      <div aria-hidden className="pointer-events-none absolute inset-0 grid place-items-center overflow-hidden motion-reduce:hidden">
        <div
          className="aspect-square w-[160%] animate-sweep opacity-60"
          style={{ background: 'conic-gradient(from 0deg, rgb(var(--ink) / 0.07), transparent 14%, transparent)' }}
        />
      </div>

      {/* Basemap switch */}
      <div role="group" aria-label="Basemap" className="absolute top-3 left-3 z-10 flex rounded-ctl border border-hairline bg-surface p-0.5 text-xs">
        {(['paper', 'streets'] as StyleKey[]).map((k) => (
          <button
            key={k}
            type="button"
            aria-pressed={styleKey === k}
            onClick={() => switchStyle(k)}
            className={cn('h-9 px-3 rounded-[4px] capitalize transition-colors', styleKey === k ? 'bg-ink text-surface' : 'text-walnut hover:text-ink')}
          >
            {k}
          </button>
        ))}
      </div>

      <button
        type="button"
        onClick={() => mapRef.current?.flyTo({ center: HOME, zoom: 12.2, speed: 1.4 })}
        className="absolute bottom-3 left-3 z-10 inline-flex items-center gap-1.5 h-10 px-3 rounded-ctl border border-hairline bg-surface text-xs text-ink hover:border-ink"
      >
        <LocateFixed aria-hidden className="size-4 stroke-[1.5]" /> Back to west Hyderabad
      </button>

      <div className="absolute bottom-3 right-3 z-10 hidden md:block rounded-ctl border border-hairline bg-surface px-3 py-2 text-xs text-walnut space-y-1.5">
        <div className="flex items-center gap-2">
          <span aria-hidden className="relative size-4 grid place-items-center">
            <span className="absolute inset-0 rounded-full border-2 border-accent" />
            <span className="size-2 rounded-full bg-ink" />
          </span>
          Score 85 or more
        </div>
        <div className="flex items-center gap-2">
          <span aria-hidden className="size-4 grid place-items-center">
            <span className="size-2 rounded-full bg-ink" />
          </span>
          Other leads
        </div>
        <div className="flex items-center gap-2">
          <span aria-hidden className="size-4 grid place-items-center">
            <span className="size-2 rounded-full bg-status-closed" />
          </span>
          Closed or skipped
        </div>
      </div>
    </div>
  );
};
