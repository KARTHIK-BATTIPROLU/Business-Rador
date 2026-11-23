'use client';

import React, { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { Business } from '@/lib/types';
import { Layers, Crosshair } from 'lucide-react';

interface RadarMapProps {
  businesses: Business[];
  selectedBusiness?: Business | null;
  onSelectBusiness: (b: Business) => void;
  flyToCoords?: { lat: number; lng: number; zoom?: number } | null;
  onScanViewport?: (coords: { lat: number; lng: number; radius: number }) => void;
  isScanning?: boolean;
}

const MAP_STYLES = {
  positron: 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',
  voyager: 'https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json',
  dark: 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json',
};

export const AREA_COORDINATES: Record<string, [number, number]> = {
  // Global & Continents
  Global: [-97.7431, 30.2672],
  World: [0, 20],

  // United States Metros & Corridors
  'South Congress': [-97.7495, 30.2510],
  'East Austin': [-97.7210, 30.2635],
  'Downtown Austin': [-97.7402, 30.2680],
  Austin: [-97.7431, 30.2672],
  'Uptown Dallas': [-96.8040, 32.7985],
  'Deep Ellum': [-96.7845, 32.7835],
  Dallas: [-96.7970, 32.7767],
  Montrose: [-95.3910, 29.7420],
  'The Heights': [-95.3980, 29.7990],
  Houston: [-95.3698, 29.7604],
  'San Antonio': [-98.4936, 29.4241],
  'Fort Worth': [-97.3308, 32.7555],
  Texas: [-97.7431, 30.2672],
  SoHo: [-73.9990, 40.7233],
  Williamsburg: [-73.9571, 40.7178],
  'West Village': [-74.0048, 40.7358],
  'New York City': [-73.9851, 40.7488],
  'West Hollywood': [-118.3617, 34.0900],
  'Santa Monica': [-118.4912, 34.0195],
  'Los Angeles': [-118.2437, 34.0522],
  Wynwood: [-80.1989, 25.8042],
  Miami: [-80.1918, 25.7617],
  'The Loop': [-87.6298, 41.8819],
  'West Loop': [-87.6534, 41.8867],
  Chicago: [-87.6298, 41.8781],
  'Mission District': [-122.4192, 37.7599],
  'San Francisco': [-122.4194, 37.7749],

  // United Kingdom Metros & Corridors
  Shoreditch: [-0.0785, 51.5245],
  Soho: [-0.1340, 51.5135],
  'Covent Garden': [-0.1240, 51.5117],
  Camden: [-0.1426, 51.5390],
  Hackney: [-0.0553, 51.5450],
  'Notting Hill': [-0.2057, 51.5091],
  London: [-0.1276, 51.5074],
  'Northern Quarter': [-2.2350, 53.4835],
  Manchester: [-2.2426, 53.4808],
  'Old Town Edinburgh': [-3.1890, 55.9486],
  Edinburgh: [-3.1883, 55.9533],

  // India Metros & Corridors
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
  Indiranagar: [77.6412, 12.9784],
  Koramangala: [77.6245, 12.9352],
  'HSR Layout': [77.6408, 12.9121],
  Bangalore: [77.5946, 12.9716],
  'Bandra West': [72.8295, 19.0596],
  BKC: [72.8682, 19.0657],
  Mumbai: [72.8777, 19.0760],
  'Hauz Khas': [77.2065, 28.5494],
  'Connaught Place': [77.2167, 28.6304],
  Delhi: [77.2090, 28.6139],

  // Canada
  'Queen Street West': [-79.4042, 43.6487],
  Toronto: [-79.3832, 43.6532],
  Gastown: [-123.1089, 49.2838],
  Vancouver: [-123.1207, 49.2827],

  // Australia
  'Surry Hills': [151.2120, -33.8860],
  'Bondi Beach': [151.2743, -33.8915],
  Sydney: [151.2093, -33.8688],
  Fitzroy: [144.9780, -37.7985],
  Melbourne: [144.9631, -37.8136],

  // Europe (Germany, France)
  Mitte: [13.4040, 52.5180],
  Kreuzberg: [13.4020, 52.4990],
  Berlin: [13.4050, 52.5200],
  'Le Marais': [2.3600, 48.8575],
  'Saint-Germain': [2.3330, 48.8538],
  Paris: [2.3522, 48.8566],

  // Asia (Japan, UAE, Singapore)
  Shibuya: [139.7016, 35.6580],
  Shinjuku: [139.7006, 35.6938],
  Ginza: [139.7671, 35.6719],
  Tokyo: [139.6917, 35.6895],
  'Downtown Dubai': [55.2744, 25.1972],
  'Dubai Marina': [55.1403, 25.0805],
  Dubai: [55.2708, 25.2048],
  'Orchard Road': [103.8340, 1.3048],
  Singapore: [103.8198, 1.3521],
};

function createPopupHTML(b: Business): string {
  const launchBadge = b.is_opening_soon
    ? '<span style="display:inline-block;background:#e0e7ff;color:#3730a3;font-size:10px;font-weight:700;padding:2px 8px;border-radius:9999px;border:1px solid #c7d2fe;">✨ OPENING SOON</span>'
    : b.actual_launch_date
    ? `<span style="display:inline-block;background:#ecfdf5;color:#065f46;font-size:10px;font-weight:700;padding:2px 8px;border-radius:9999px;border:1px solid #a7f3d0;">🚀 Launched ${b.actual_launch_date}</span>`
    : '';

  const budgetBadge = b.estimated_site_budget
    ? `<span style="background:#fef3c7;color:#92400e;font-size:10px;font-weight:700;padding:2px 6px;border-radius:6px;border:1px solid #fde68a;">💰 ${b.estimated_site_budget}</span>`
    : '';

  const waLink = b.whatsapp
    ? `<a href="https://wa.me/${b.whatsapp}?text=Hi%20${encodeURIComponent(b.name)},%20congratulations%20on%20your%20new%20launch%20in%20${encodeURIComponent(b.area)}!" target="_blank" rel="noopener noreferrer" style="flex:1;text-align:center;background:#ecfdf5;color:#047857;border:1px solid #a7f3d0;padding:5px 6px;border-radius:6px;font-size:11px;font-weight:600;text-decoration:none;display:inline-flex;align-items:center;justify-content:center;gap:3px;">💬 WhatsApp</a>`
    : '';

  const callLink = b.phone
    ? `<a href="tel:${b.phone}" style="flex:1;text-align:center;background:#f8fafc;color:#334155;border:1px solid #cbd5e1;padding:5px 6px;border-radius:6px;font-size:11px;font-weight:600;text-decoration:none;display:inline-flex;align-items:center;justify-content:center;gap:3px;">📞 Call</a>`
    : '';

  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(b.name + ' ' + (b.area || '') + ' ' + (b.city || ''))}`;

  const mapsLink = `<a href="${mapsUrl}" target="_blank" rel="noopener noreferrer" style="flex:1;text-align:center;background:#eff6ff;color:#1e40af;border:1px solid #bfdbfe;padding:5px 6px;border-radius:6px;font-size:11px;font-weight:600;text-decoration:none;display:inline-flex;align-items:center;justify-content:center;gap:3px;">📍 Maps</a>`;

  const igHref = b.instagram_handle
    ? (b.instagram_url || `https://www.instagram.com/${b.instagram_handle.replace('@', '')}/`)
    : `https://www.google.com/search?q=${encodeURIComponent('site:instagram.com "' + b.name + '" "' + (b.city || b.area) + '"')}`;

  const igLink = `<a href="${igHref}" target="_blank" rel="noopener noreferrer" style="flex:1;text-align:center;background:#fdf2f8;color:#be185d;border:1px solid #fbcfe8;padding:5px 6px;border-radius:6px;font-size:11px;font-weight:600;text-decoration:none;display:inline-flex;align-items:center;justify-content:center;gap:3px;">📸 IG</a>`;

  return `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 4px; min-width: 240px; max-width: 290px;">
      <div style="display:flex; justify-content:space-between; align-items:flex-start; gap:8px; margin-bottom:5px;">
        <h4 style="margin:0; font-size:14px; font-weight:700; color:#0f172a; line-height:1.25;">${b.name}</h4>
        <span style="background:#eff6ff; color:#1d4ed8; font-weight:700; font-size:11px; padding:2px 6px; border-radius:6px; border:1px solid #bfdbfe; white-space:nowrap;">🔥 ${b.lead_score}</span>
      </div>
      <div style="font-size:11px; color:#64748b; margin-bottom:6px; display:flex; gap:6px; align-items:center;">
        <span>📍 <strong>${b.area || b.city}</strong> (${b.city})</span>
        <span>•</span>
        <span>${b.category}</span>
      </div>
      <div style="margin-bottom:8px; display:flex; gap:4px; flex-wrap:wrap;">
        ${launchBadge}
        ${budgetBadge}
      </div>
      <p style="font-size:11px; color:#475569; margin:0 0 10px 0; line-height:1.4; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden;">
        ${b.description || 'Newly discovered commercial business.'}
      </p>
      <div style="display:flex; gap:5px; margin-bottom:8px;">
        ${mapsLink}
        ${waLink || callLink}
        ${igLink}
      </div>
      <a href="/business/${b.id}" style="display:flex; align-items:center; justify-content:center; gap:6px; text-align:center; background:#2563eb; color:#ffffff; padding:7px 10px; border-radius:7px; font-size:12px; font-weight:700; text-decoration:none; box-shadow:0 2px 4px rgba(37,99,235,0.25);">
        <span>See Details, Dossier & Pitch</span>
        <span>→</span>
      </a>
    </div>
  `;
}

export const RadarMap: React.FC<RadarMapProps> = ({
  businesses,
  selectedBusiness,
  onSelectBusiness,
  flyToCoords,
  onScanViewport,
  isScanning,
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<maplibregl.Map | null>(null);
  const businessesRef = useRef<Business[]>(businesses);
  businessesRef.current = businesses;
  const popupRef = useRef<maplibregl.Popup | null>(null);
  const [currentStyle, setCurrentStyle] = useState<'positron' | 'voyager' | 'dark'>('positron');

  const toGeoJSON = (items: Business[]): GeoJSON.FeatureCollection<GeoJSON.Point> => ({
    type: 'FeatureCollection',
    features: items
      .filter((b) => b.lat && b.lng)
      .map((b) => ({
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [b.lng, b.lat],
        },
        properties: {
          id: b.id,
          name: b.name,
          category: b.category,
          area: b.area,
          lead_score: b.lead_score,
          status: b.outreach_status,
          phone: b.phone || '',
          whatsapp: b.whatsapp || '',
          instagram_handle: b.instagram_handle || '',
          first_seen_at: b.first_seen_at,
        },
      })),
  });

  useEffect(() => {
    if (!mapContainer.current || mapInstance.current) return;

    const map = new maplibregl.Map({
      container: mapContainer.current,
      style: MAP_STYLES[currentStyle],
      center: [78.35, 17.43],
      zoom: 12.4,
      pitch: 25,
    });

    map.addControl(new maplibregl.NavigationControl({ showCompass: true }), 'top-right');

    map.on('load', () => {
      map.addSource('businesses-source', {
        type: 'geojson',
        data: toGeoJSON(businesses),
        cluster: true,
        clusterMaxZoom: 14,
        clusterRadius: 45,
      });

      // Cluster circle layer — Bangalore Startup Map inspired density bubbles
      map.addLayer({
        id: 'clusters',
        type: 'circle',
        source: 'businesses-source',
        filter: ['has', 'point_count'],
        paint: {
          'circle-color': [
            'step',
            ['get', 'point_count'],
            '#10B981', // < 10: Emerald Green (bangalorestartupmap style)
            10,
            '#F59E0B', // 10-30: Warm Amber
            30,
            '#F97316', // 30-80: Sunset Orange
            80,
            '#EF4444', // 80+: Crimson
          ],
          'circle-radius': ['step', ['get', 'point_count'], 18, 10, 24, 30, 30, 80, 36],
          'circle-stroke-width': 3.5,
          'circle-stroke-color': '#FFFFFF',
          'circle-opacity': 0.95,
        },
      });

      // Cluster label
      map.addLayer({
        id: 'cluster-count',
        type: 'symbol',
        source: 'businesses-source',
        filter: ['has', 'point_count'],
        layout: {
          'text-field': '{point_count_abbreviated}',
          'text-size': 13,
          'text-font': ['Open Sans Bold', 'Arial Unicode MS Bold'],
        },
        paint: {
          'text-color': '#FFFFFF',
        },
      });

      // Individual unclustered pin
      map.addLayer({
        id: 'unclustered-point',
        type: 'circle',
        source: 'businesses-source',
        filter: ['!', ['has', 'point_count']],
        paint: {
          'circle-color': [
            'match',
            ['get', 'status'],
            'contacted',
            '#6366F1',
            'interested',
            '#F59E0B',
            'closed',
            '#10B981',
            'skip',
            '#94A3B8',
            '#2563EB',
          ],
          'circle-radius': [
            'interpolate',
            ['linear'],
            ['get', 'lead_score'],
            0,
            7,
            100,
            11,
          ],
          'circle-stroke-width': 2.5,
          'circle-stroke-color': '#FFFFFF',
        },
      });

      map.on('click', 'clusters', async (e) => {
        const features = map.queryRenderedFeatures(e.point, { layers: ['clusters'] });
        const clusterId = features[0]?.properties?.cluster_id;
        const source = map.getSource('businesses-source') as maplibregl.GeoJSONSource;
        if (!source || clusterId === undefined) return;

        const zoom = await source.getClusterExpansionZoom(clusterId);
        const coords = (features[0].geometry as GeoJSON.Point).coordinates as [number, number];
        map.flyTo({ center: coords, zoom: Math.min(zoom, 16), speed: 1.2 });
      });

      map.on('click', 'unclustered-point', (e) => {
        const feature = e.features?.[0];
        if (!feature) return;
        const bizId = feature.properties?.id;
        const target = businessesRef.current.find((b) => b.id === bizId);
        if (target) {
          onSelectBusiness(target);

          if (popupRef.current) {
            popupRef.current.remove();
          }

          const coords = (feature.geometry as GeoJSON.Point).coordinates.slice() as [number, number];
          const popup = new maplibregl.Popup({
            offset: 14,
            closeButton: true,
            closeOnClick: false,
            className: 'radar-map-popup',
            maxWidth: '320px',
          })
            .setLngLat(coords)
            .setHTML(createPopupHTML(target))
            .addTo(map);

          popupRef.current = popup;
        }
      });

      map.on('mouseenter', 'clusters', () => { map.getCanvas().style.cursor = 'pointer'; });
      map.on('mouseleave', 'clusters', () => { map.getCanvas().style.cursor = ''; });
      map.on('mouseenter', 'unclustered-point', () => { map.getCanvas().style.cursor = 'pointer'; });
      map.on('mouseleave', 'unclustered-point', () => { map.getCanvas().style.cursor = ''; });
    });

    mapInstance.current = map;

    return () => {
      map.remove();
      mapInstance.current = null;
    };
  }, []);

  useEffect(() => {
    if (!mapInstance.current) return;
    const map = mapInstance.current;
    if (!map.isStyleLoaded()) return;

    const source = map.getSource('businesses-source') as maplibregl.GeoJSONSource;
    if (source) {
      source.setData(toGeoJSON(businesses));
    }
  }, [businesses]);

  useEffect(() => {
    if (!mapInstance.current || !flyToCoords) return;
    mapInstance.current.flyTo({
      center: [flyToCoords.lng, flyToCoords.lat],
      zoom: flyToCoords.zoom || 14.5,
      speed: 1.4,
      essential: true,
    });
  }, [flyToCoords]);

  useEffect(() => {
    if (!mapInstance.current || !selectedBusiness?.lat || !selectedBusiness?.lng) return;
    const map = mapInstance.current;
    map.flyTo({
      center: [selectedBusiness.lng, selectedBusiness.lat],
      zoom: 15.5,
      speed: 1.4,
    });

    if (popupRef.current) {
      popupRef.current.remove();
    }

    const popup = new maplibregl.Popup({
      offset: 14,
      closeButton: true,
      closeOnClick: false,
      className: 'radar-map-popup',
      maxWidth: '320px',
    })
      .setLngLat([selectedBusiness.lng, selectedBusiness.lat])
      .setHTML(createPopupHTML(selectedBusiness))
      .addTo(map);

    popupRef.current = popup;
  }, [selectedBusiness]);

  const handleStyleChange = (styleKey: 'positron' | 'voyager' | 'dark') => {
    setCurrentStyle(styleKey);
    if (!mapInstance.current) return;
    mapInstance.current.setStyle(MAP_STYLES[styleKey]);
  };

  return (
    <div className="relative w-full h-full min-h-[420px] bg-clay-canvas overflow-hidden">
      <div ref={mapContainer} className="w-full h-full" />

      {/* Floating Center "Scan Current Map View" Trigger */}
      {onScanViewport && (
        <button
          onClick={() => {
            if (!mapInstance.current || isScanning) return;
            const center = mapInstance.current.getCenter();
            const zoom = mapInstance.current.getZoom();
            const radius = Math.min(5000, Math.max(900, Math.round(40000000 / Math.pow(2, zoom + 1))));
            onScanViewport({ lat: center.lat, lng: center.lng, radius });
          }}
          disabled={isScanning}
          className={`absolute top-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 px-4 py-2 rounded-full font-bold text-xs shadow-lg border transition-all active:scale-95 ${
            isScanning
              ? 'bg-blue-600 text-white border-blue-400 shadow-blue-500/30 animate-pulse cursor-wait'
              : 'bg-white/95 hover:bg-accent-blue text-clay-text hover:text-white border-clay-border/80 shadow-clay-card'
          }`}
          title="Scan newly opened physical businesses in this visible area"
        >
          <Crosshair className={`w-4 h-4 text-rose-500 ${isScanning ? 'animate-spin' : ''}`} />
          <span>{isScanning ? 'Scanning Map Corridors...' : '🎯 Scan Current Map View'}</span>
        </button>
      )}

      {/* Clay Floating Map Style Control */}
      <div className="absolute top-4 left-4 z-10 flex items-center gap-1.5 p-1 rounded-clay bg-white/90 backdrop-blur-md shadow-clay-card border border-clay-border/80 text-xs">
        <span className="text-clay-muted pl-2 text-[11px] font-medium flex items-center gap-1">
          <Layers className="w-3.5 h-3.5 text-accent-blue" /> Basemap:
        </span>
        <button
          onClick={() => handleStyleChange('positron')}
          className={`px-2.5 py-1 rounded-clay-sm font-medium transition ${
            currentStyle === 'positron'
              ? 'bg-accent-blue text-white shadow-clay-btn'
              : 'text-clay-muted hover:text-clay-text'
          }`}
        >
          Porcelain
        </button>
        <button
          onClick={() => handleStyleChange('voyager')}
          className={`px-2.5 py-1 rounded-clay-sm font-medium transition ${
            currentStyle === 'voyager'
              ? 'bg-accent-blue text-white shadow-clay-btn'
              : 'text-clay-muted hover:text-clay-text'
          }`}
        >
          Street
        </button>
        <button
          onClick={() => handleStyleChange('dark')}
          className={`px-2.5 py-1 rounded-clay-sm font-medium transition ${
            currentStyle === 'dark'
              ? 'bg-accent-blue text-white shadow-clay-btn'
              : 'text-clay-muted hover:text-clay-text'
          }`}
        >
          Slate
        </button>
      </div>

      {/* Recenter Button */}
      <button
        onClick={() => {
          mapInstance.current?.flyTo({ center: [78.35, 17.43], zoom: 12.4, speed: 1.2 });
        }}
        className="absolute bottom-5 left-4 z-10 flex items-center gap-1.5 px-3 py-1.5 bg-white/95 hover:bg-white text-clay-text rounded-clay shadow-clay-btn border border-clay-border/80 text-xs font-medium transition active:translate-y-0.5"
      >
        <Crosshair className="w-3.5 h-3.5 text-accent-blue" />
        Reset to Hyderabad West
      </button>

      {/* Clay Legend */}
      <div className="absolute bottom-5 right-4 z-10 bg-white/95 backdrop-blur-md px-3.5 py-2.5 rounded-clay shadow-clay-card border border-clay-border/80 text-[11px] text-clay-text hidden md:block space-y-1.5">
        <div className="font-semibold text-clay-muted text-[10px] uppercase tracking-wider pb-1 border-b border-clay-border/60">
          Status Pipeline
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-accent-blue shadow-sm" />
          <span className="font-medium">New Lead</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 shadow-sm" />
          <span>Contacted</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-sm" />
          <span>Interested</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-sm" />
          <span>Closed Plan</span>
        </div>
      </div>
    </div>
  );
};
