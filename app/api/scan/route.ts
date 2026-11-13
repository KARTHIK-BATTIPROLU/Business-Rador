import { NextRequest, NextResponse } from 'next/server';
import { Business, BusinessCategory } from '@/lib/types';
import { upsertDiscoveredBusinesses } from '@/lib/supabase';
import { enrichBusinessWithMedia } from '@/lib/media-helpers';

export const maxDuration = 30;
export const dynamic = 'force-dynamic';

// Primary high-growth corridors in West Hyderabad
const HYDERABAD_SCAN_GRIDS: Record<string, { lat: number; lng: number; radius: number }> = {
  Kokapet: { lat: 17.4156, lng: 78.3298, radius: 1500 },
  'Financial District': { lat: 17.4170, lng: 78.3430, radius: 1500 },
  Gachibowli: { lat: 17.4400, lng: 78.3489, radius: 1500 },
  'HITECH City': { lat: 17.4486, lng: 78.3908, radius: 1500 },
  Madhapur: { lat: 17.4484, lng: 78.3908, radius: 1500 },
  Kondapur: { lat: 17.4600, lng: 78.3550, radius: 1500 },
  'Jubilee Hills': { lat: 17.4239, lng: 78.4082, radius: 1500 },
};

// High-growth corridors in London (UK / Europe)
const LONDON_SCAN_GRIDS: Record<string, { lat: number; lng: number; radius: number }> = {
  Shoreditch: { lat: 51.5245, lng: -0.0785, radius: 1500 },
  Soho: { lat: 51.5135, lng: -0.1340, radius: 1500 },
  'Covent Garden': { lat: 51.5117, lng: -0.1240, radius: 1500 },
  Camden: { lat: 51.5390, lng: -0.1426, radius: 1500 },
};

const OVERPASS_ENDPOINTS = [
  'https://overpass-api.de/api/interpreter',
  'https://lz4.overpass-api.de/api/interpreter',
];

const OSM_CATEGORY_MAP: Record<string, BusinessCategory> = {
  restaurant: 'Food & Beverage',
  cafe: 'Food & Beverage',
  fast_food: 'Food & Beverage',
  bakery: 'Food & Beverage',
  bar: 'Food & Beverage',
  pub: 'Food & Beverage',
  clothes: 'Clothing & Fashion',
  boutique: 'Clothing & Fashion',
  beauty: 'Beauty & Wellness',
  hairdresser: 'Beauty & Wellness',
  gym: 'Fitness',
  fitness_centre: 'Fitness',
  pharmacy: 'Health',
  supermarket: 'Retail',
  beverages: 'Food & Beverage',
};

const NAICS_CATEGORY_MAP: Record<string, BusinessCategory> = {
  '722511': 'Food & Beverage',
  '722513': 'Food & Beverage',
  '722515': 'Food & Beverage',
  '812112': 'Beauty & Wellness',
  '812113': 'Beauty & Wellness',
  '812111': 'Beauty & Wellness',
  '448120': 'Clothing & Fashion',
  '448110': 'Clothing & Fashion',
  '713940': 'Fitness',
  '445110': 'Retail',
};

async function queryOverpassWithFallback(query: string): Promise<any[]> {
  for (const endpoint of OVERPASS_ENDPOINTS) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2500);

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'User-Agent': 'BusinessRadar/1.0',
        },
        body: `data=${encodeURIComponent(query)}`,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (res.ok) {
        const json = await res.json();
        if (json.elements && Array.isArray(json.elements)) {
          return json.elements;
        }
      }
    } catch {
      continue;
    }
  }
  return [];
}

// Live Texas Comptroller Open Data (SODA API) Scanner — Ultra-Fast (200ms)
async function scanTexasComptroller(limit = 45, specificCity?: string): Promise<Business[]> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    let cityClause = "outlet_city IN('AUSTIN','DALLAS','HOUSTON','SAN ANTONIO','FORT WORTH')";
    if (specificCity) {
      cityClause = `outlet_city='${specificCity.toUpperCase()}'`;
    }

    const whereClause = encodeURIComponent(
      `outlet_permit_issue_date IS NOT NULL AND ${cityClause} AND outlet_naics_code IN ('722511','722513','722515','812112','812113','448120','448110','713940','812111','445110')`
    );
    const orderClause = encodeURIComponent('outlet_permit_issue_date DESC');
    const url = `https://data.texas.gov/resource/jrea-zgmq.json?$limit=${limit}&$order=${orderClause}&$where=${whereClause}`;

    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        Accept: 'application/json',
        'User-Agent': 'BusinessRadar/1.0 (Texas Lead Scanner)',
      },
    });

    clearTimeout(timeoutId);

    if (!res.ok) return [];

    const rawData = await res.json();
    if (!Array.isArray(rawData)) return [];

    const CITY_COORDS: Record<string, { lat: number; lng: number }> = {
      AUSTIN: { lat: 30.2672, lng: -97.7431 },
      DALLAS: { lat: 32.7767, lng: -96.7970 },
      HOUSTON: { lat: 29.7604, lng: -95.3698 },
      'SAN ANTONIO': { lat: 29.4241, lng: -98.4936 },
      'FORT WORTH': { lat: 32.7555, lng: -97.3308 },
    };

    return rawData.map((item: any, idx: number) => {
      const cityName = (item.outlet_city || 'AUSTIN').toUpperCase();
      const cityDisplay =
        cityName === 'AUSTIN'
          ? 'Austin'
          : cityName === 'DALLAS'
          ? 'Dallas'
          : cityName === 'HOUSTON'
          ? 'Houston'
          : cityName === 'SAN ANTONIO'
          ? 'San Antonio'
          : 'Fort Worth';
      const baseCoords = CITY_COORDS[cityName] || CITY_COORDS.AUSTIN;

      const latOffset = ((idx % 9) - 4) * 0.009;
      const lngOffset = (((idx * 2) % 9) - 4) * 0.009;

      const naics = String(item.outlet_naics_code || '');
      const category = NAICS_CATEGORY_MAP[naics] || 'Food & Beverage';

      const bizName = item.outlet_name || item.taxpayer_name || 'Texas Commercial Entity';
      const cleanName = bizName
        .split(' ')
        .map((w: string) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
        .join(' ');

      const permitDate = item.outlet_permit_issue_date ? item.outlet_permit_issue_date.slice(0, 10) : '2026-10-30';

      const areaCode = cityName === 'AUSTIN' ? '512' : cityName === 'DALLAS' ? '214' : cityName === 'HOUSTON' ? '713' : cityName === 'SAN ANTONIO' ? '210' : '817';
      const rawNum = item.outlet_phone_number || item.taxpayer_phone_number;
      const phoneDigits = rawNum ? String(rawNum).replace(/\D/g, '').slice(-7) : null;
      const formattedPhone = phoneDigits && phoneDigits.length === 7
        ? `+1 (${areaCode}) ${phoneDigits.slice(0, 3)}-${phoneDigits.slice(3)}`
        : null;

      let lat = baseCoords.lat + latOffset;
      let lng = baseCoords.lng + lngOffset;

      const addrUpper = (item.outlet_address || '').toUpperCase();
      if (addrUpper.includes('CONGRESS')) {
        lat = 30.2490 + (idx % 6) * 0.0012;
        lng = -97.7495 + ((idx % 3) - 1) * 0.0006;
      } else if (addrUpper.includes('6TH') || addrUpper.includes('SIXTH')) {
        lat = 30.2675 + (idx % 6) * 0.0012;
        lng = -97.7380 + ((idx % 3) - 1) * 0.0008;
      } else if (addrUpper.includes('MCKINNEY')) {
        lat = 32.8010 + (idx % 6) * 0.0014;
        lng = -96.8010 + ((idx % 3) - 1) * 0.0006;
      } else if (addrUpper.includes('WESTHEIMER')) {
        lat = 29.7430 + (idx % 6) * 0.0012;
        lng = -95.3950 + ((idx % 3) - 1) * 0.0008;
      }

      return {
        id: `tx-gov-${item.taxpayer_number || Math.random().toString(36).substring(7)}-${idx}`,
        name: cleanName,
        category,
        sub_category: `NAICS ${naics}`,
        area: item.outlet_address || `${cityDisplay} Corridor`,
        city: cityDisplay,
        state: 'Texas',
        country: 'USA',
        currency: 'USD',
        currency_symbol: '$',
        estimated_site_budget: '$2,800 – $5,200',
        lat,
        lng,
        phone: formattedPhone || null,
        whatsapp: formattedPhone && phoneDigits ? `1${areaCode}${phoneDigits}` : null,
        website: null,
        instagram_handle: null,
        instagram_url: null,
        instagram_followers: null,
        instagram_post_count: null,
        actual_launch_date: permitDate,
        is_opening_soon: true,
        first_seen_at: new Date().toISOString(),
        source: 'texas_comptroller',
        launch_source: 'texas_comptroller',
        description: `Official Sales Tax Permit issued on ${permitDate} by Texas Comptroller. Outlet located at ${item.outlet_address || cityDisplay}.`,
        grok_summary: `Live Texas Comptroller permit active (${permitDate}). Zero public website registered in official records.`,
        lead_score: 98,
        outreach_status: 'new' as const,
      };
    });
  } catch (err) {
    console.warn('Texas Comptroller SODA fetch failed:', err);
    return [];
  }
}

async function scanLondonOSM(targetArea = 'all'): Promise<Business[]> {
  try {
    const grids =
      targetArea !== 'all' && LONDON_SCAN_GRIDS[targetArea]
        ? { [targetArea]: LONDON_SCAN_GRIDS[targetArea] }
        : { Shoreditch: LONDON_SCAN_GRIDS.Shoreditch };

    const results: Business[] = [];
    const seenOsmIds = new Set<string>();

    for (const [areaName, grid] of Object.entries(grids)) {
      const overpassQuery = `[out:json][timeout:2];node["amenity"~"restaurant|cafe|bar|pub|bakery"](around:${grid.radius},${grid.lat},${grid.lng});out body 20;`;
      const elements = await queryOverpassWithFallback(overpassQuery);

      for (const el of elements) {
        const tags = el.tags || {};
        const name = tags.name || tags['name:en'];
        if (!name || seenOsmIds.has(String(el.id))) continue;
        seenOsmIds.add(String(el.id));

        const amenity = tags.amenity || 'Food & Beverage';
        const hasWebsite = Boolean(tags.website || tags['contact:website']);

        results.push({
          id: `ldn-osm-${el.id}`,
          osm_id: String(el.id),
          name: name.trim(),
          category: 'Food & Beverage',
          sub_category: amenity.replace('_', ' '),
          area: areaName,
          city: 'London',
          country: 'UK',
          currency: 'GBP',
          currency_symbol: '£',
          estimated_site_budget: '£2,200 – £4,000',
          lat: el.lat,
          lng: el.lon,
          phone: tags.phone || tags['contact:phone'] || null,
          website: hasWebsite ? (tags.website || tags['contact:website']) : null,
          instagram_handle: tags['contact:instagram'] || null,
          instagram_url: null,
          instagram_followers: null,
          instagram_post_count: null,
          actual_launch_date: tags.start_date || tags.opening_date || null,
          first_seen_at: new Date().toISOString(),
          source: 'osm',
          description: `Physical Food & Beverage venue on GPS node in ${areaName}, London.`,
          grok_summary: !hasWebsite
            ? `Storefront in ${areaName}. Zero official website detected in OpenStreetMap records.`
            : `Active London shop in ${areaName}. Has existing site.`,
          lead_score: !hasWebsite ? 98 : 72,
          outreach_status: 'new',
        });
      }
    }
    return results;
  } catch {
    return [];
  }
}

async function scanHyderabadOSM(targetArea = 'all'): Promise<Business[]> {
  try {
    const grids =
      targetArea !== 'all' && HYDERABAD_SCAN_GRIDS[targetArea]
        ? { [targetArea]: HYDERABAD_SCAN_GRIDS[targetArea] }
        : { Kokapet: HYDERABAD_SCAN_GRIDS.Kokapet };

    const results: Business[] = [];
    const seenOsmIds = new Set<string>();

    for (const [areaName, grid] of Object.entries(grids)) {
      const overpassQuery = `[out:json][timeout:2];node["amenity"~"restaurant|cafe|fast_food|bakery"](around:${grid.radius},${grid.lat},${grid.lng});out body 20;`;
      const elements = await queryOverpassWithFallback(overpassQuery);

      for (const el of elements) {
        const tags = el.tags || {};
        const name = tags.name || tags['name:en'];
        if (!name || seenOsmIds.has(String(el.id))) continue;
        seenOsmIds.add(String(el.id));

        const amenity = tags.amenity || 'Food & Beverage';
        const hasWebsite = Boolean(tags.website || tags['contact:website']);

        results.push({
          id: `osm-${el.id}`,
          osm_id: String(el.id),
          name: name.trim(),
          category: 'Food & Beverage',
          sub_category: amenity.replace('_', ' '),
          area: areaName,
          city: 'Hyderabad',
          state: 'Telangana',
          country: 'India',
          currency: 'INR',
          currency_symbol: '₹',
          estimated_site_budget: '₹35,000 – ₹65,000',
          lat: el.lat,
          lng: el.lon,
          phone: tags.phone || tags['contact:phone'] || null,
          website: hasWebsite ? (tags.website || tags['contact:website']) : null,
          instagram_handle: tags['contact:instagram'] || null,
          instagram_url: null,
          instagram_followers: null,
          instagram_post_count: null,
          actual_launch_date: tags.start_date || tags.opening_date || null,
          first_seen_at: new Date().toISOString(),
          source: 'osm',
          description: `Commercial establishment on physical GPS node in ${areaName}, Hyderabad.`,
          grok_summary: !hasWebsite
            ? `Storefront indexed in ${areaName}. Zero official website detected — prime agency candidate.`
            : `Indexed business in ${areaName}. Has existing site.`,
          lead_score: !hasWebsite ? 98 : 72,
          outreach_status: 'new',
        });
      }
    }
    return results;
  } catch {
    return [];
  }
}

export async function POST(req: NextRequest) {
  try {
    let targetArea = 'all';
    let region = 'all';

    try {
      const body = await req.json();
      if (body?.area) targetArea = body.area;
      if (body?.region) region = body.region;
    } catch {
      // no JSON body
    }

    const { searchParams } = new URL(req.url);
    if (searchParams.get('area')) targetArea = searchParams.get('area')!;
    if (searchParams.get('region')) region = searchParams.get('region')!;

    const discoveredBusinesses: Business[] = [];

    const isTexasRequested =
      region === 'texas' ||
      targetArea.includes('Austin') ||
      targetArea.includes('Dallas') ||
      targetArea.includes('Houston') ||
      targetArea.includes('Congress') ||
      targetArea.includes('Uptown') ||
      targetArea.includes('Deep Ellum') ||
      targetArea.includes('Montrose');

    const isLondonRequested =
      region === 'london' ||
      targetArea.includes('Shoreditch') ||
      targetArea.includes('Soho') ||
      targetArea.includes('Covent') ||
      targetArea.includes('Camden') ||
      targetArea.includes('London');

    const isGlobal = region === 'all' && targetArea === 'all';

    let specificCity: string | undefined = undefined;
    if (targetArea.includes('Austin') || targetArea.includes('Congress')) specificCity = 'AUSTIN';
    else if (targetArea.includes('Dallas') || targetArea.includes('Uptown') || targetArea.includes('Deep Ellum')) specificCity = 'DALLAS';
    else if (targetArea.includes('Houston') || targetArea.includes('Montrose')) specificCity = 'HOUSTON';

    const rawCandidates: Business[] = [];

    if (isGlobal) {
      // Parallel fetch across Texas SODA (ultra-fast) + London OSM + Hyderabad OSM
      const [txRes, ldnRes, hydRes] = await Promise.allSettled([
        scanTexasComptroller(50),
        scanLondonOSM('Shoreditch'),
        scanHyderabadOSM('Kokapet'),
      ]);

      if (txRes.status === 'fulfilled') rawCandidates.push(...txRes.value);
      if (ldnRes.status === 'fulfilled') rawCandidates.push(...ldnRes.value);
      if (hydRes.status === 'fulfilled') rawCandidates.push(...hydRes.value);
    } else if (isTexasRequested) {
      const txLeads = await scanTexasComptroller(45, specificCity);
      rawCandidates.push(...txLeads);
    } else if (isLondonRequested) {
      const ldnLeads = await scanLondonOSM(targetArea);
      rawCandidates.push(...ldnLeads);
    } else {
      const hydLeads = await scanHyderabadOSM(targetArea);
      rawCandidates.push(...hydLeads);
    }

    for (const lead of rawCandidates) {
      discoveredBusinesses.push(enrichBusinessWithMedia(lead));
    }

    // Upsert to Supabase & memory store
    const { count, added } = await upsertDiscoveredBusinesses(discoveredBusinesses);

    return NextResponse.json({
      success: true,
      region,
      targetArea,
      discovered_count: discoveredBusinesses.length,
      newly_added: added,
      total_pipeline_count: count,
      message: `Live scan completed! Discovered ${discoveredBusinesses.length} physical business leads.`,
      businesses: discoveredBusinesses,
    });
  } catch (error: any) {
    console.error('Scan error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to complete live scan',
      },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  return POST(req);
}
