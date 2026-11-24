'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Clock } from 'lucide-react';
import { GLOBAL_MARKETS } from '@/lib/geocoding';
import { cn } from '@/lib/utils';

// IANA zones for every preset city. Anything else falls back to a longitude estimate.
const ZONES: Record<string, string> = {
  Austin: 'America/Chicago',
  Dallas: 'America/Chicago',
  Houston: 'America/Chicago',
  Chicago: 'America/Chicago',
  'New York City': 'America/New_York',
  Miami: 'America/New_York',
  'Los Angeles': 'America/Los_Angeles',
  'San Francisco': 'America/Los_Angeles',
  London: 'Europe/London',
  Manchester: 'Europe/London',
  Edinburgh: 'Europe/London',
  Hyderabad: 'Asia/Kolkata',
  Bangalore: 'Asia/Kolkata',
  Mumbai: 'Asia/Kolkata',
  'Delhi NCR': 'Asia/Kolkata',
  Toronto: 'America/Toronto',
  Vancouver: 'America/Vancouver',
  Sydney: 'Australia/Sydney',
  Melbourne: 'Australia/Melbourne',
  Berlin: 'Europe/Berlin',
  Munich: 'Europe/Berlin',
  Paris: 'Europe/Paris',
  Tokyo: 'Asia/Tokyo',
  Osaka: 'Asia/Tokyo',
  Dubai: 'Asia/Dubai',
  Singapore: 'Asia/Singapore',
};

const CITIES = Object.values(GLOBAL_MARKETS).flatMap((m) => m.cities.map((c) => ({ name: c.name, lng: c.coords[0], lat: c.coords[1] })));

// Rough distance in km (equirectangular is plenty for "which city is this").
const km = (a: { lat: number; lng: number }, b: { lat: number; lng: number }) => {
  const x = ((b.lng - a.lng) * Math.PI) / 180 * Math.cos((((a.lat + b.lat) / 2) * Math.PI) / 180);
  const y = ((b.lat - a.lat) * Math.PI) / 180;
  return Math.sqrt(x * x + y * y) * 6371;
};

/** Local time where the map is looking, so you know if it's a sensible hour to message. */
export function CityClock({ center, className }: { center: { lat: number; lng: number } | null; className?: string }) {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    setNow(new Date());
    const t = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(t);
  }, []);

  const place = useMemo(() => {
    if (!center) return null;
    let best: (typeof CITIES)[number] | null = null;
    let bestD = Infinity;
    for (const c of CITIES) {
      const d = km(center, c);
      if (d < bestD) {
        bestD = d;
        best = c;
      }
    }
    if (best && bestD < 90) return { label: best.name, zone: ZONES[best.name], approx: false };
    return { label: 'Map centre', zone: null, approx: true };
  }, [center]);

  if (!now || !place || !center) return null;

  let time: string;
  let hour: number;
  if (place.zone) {
    time = new Intl.DateTimeFormat('en-GB', { hour: 'numeric', minute: '2-digit', hour12: true, timeZone: place.zone }).format(now);
    hour = Number(new Intl.DateTimeFormat('en-GB', { hour: 'numeric', hourCycle: 'h23', timeZone: place.zone }).format(now));
  } else {
    // Solar estimate: 15° of longitude per hour.
    const offset = Math.round(center.lng / 15);
    const d = new Date(now.getTime() + offset * 3_600_000);
    hour = d.getUTCHours();
    time = new Intl.DateTimeFormat('en-GB', { hour: 'numeric', minute: '2-digit', hour12: true, timeZone: 'UTC' }).format(d);
  }
  const late = hour >= 21 || hour < 8;

  return (
    <div
      data-tour="clock"
      className={cn(
        'inline-flex items-center gap-1.5 h-9 px-2.5 rounded-ctl border text-xs whitespace-nowrap transition-colors duration-300',
        late ? 'border-hairline text-walnut bg-sunk' : 'border-hairline text-ink bg-surface',
        className,
      )}
      title={place.approx ? 'Estimated from the map position' : `Local time in ${place.label}`}
      aria-live="polite"
    >
      <Clock aria-hidden className="size-3.5 stroke-[1.5]" />
      <span className="hidden sm:inline">{place.label} ·</span>
      <span className="font-mono tabular">
        {time.replace(' ', ' ')}
        {place.approx && <span className="text-walnut"> approx</span>}
      </span>
      {late && <span className="text-walnut">· late to message</span>}
    </div>
  );
}
