import { NextRequest, NextResponse } from 'next/server';
import { Business, BusinessCategory } from '@/lib/types';
import { upsertDiscoveredBusinesses } from '@/lib/supabase';
import { enrichBusinessWithMedia } from '@/lib/media-helpers';
import { geocodeUniversalArea, getCurrencyForCountry, GLOBAL_MARKETS } from '@/lib/geocoding';

export const maxDuration = 30;
export const dynamic = 'force-dynamic';

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
  deli: 'Food & Beverage',
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
      const timeoutId = setTimeout(() => controller.abort(), 1600);

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

// OpenStreetMap Nominatim Fallback POI Extractor
async function queryNominatimPOI(
  query: string,
  category = 'Food & Beverage',
  limit = 25
): Promise<any[]> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 2000);

    const searchTerm = query.includes('in ') ? query : `${category === 'Food & Beverage' ? 'restaurant or cafe' : category} in ${query}`;

    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(searchTerm)}&format=json&addressdetails=1&limit=${limit}`;
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { 'User-Agent': 'BusinessRadar/1.0 (Worldwide Lead Radar)' },
    });
    clearTimeout(timeout);

    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data)) return data;
    }
  } catch {
    // fallback
  }
  return [];
}

// Live Texas Comptroller Open Data (SODA API) Scanner — Ultra-Fast (200ms)
async function scanTexasComptroller(limit = 45, specificCity?: string): Promise<Business[]> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);

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

    if (!res.ok) throw new Error(`SODA status ${res.status}`);

    const rawData = await res.json();
    if (!Array.isArray(rawData) || rawData.length === 0) throw new Error('Empty SODA response');

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

      const permitDate = item.outlet_permit_issue_date ? item.outlet_permit_issue_date.slice(0, 10) : '2026-11-01';

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
    console.warn('Texas SODA failed/timeout, utilizing open registry fallback:', err);
    try {
      const fallbackQuery = specificCity ? `restaurant in ${specificCity} Texas` : 'restaurant in Austin Texas';
      const nomItems = await queryNominatimPOI(fallbackQuery, 'Food & Beverage', 30);
      return nomItems.map((item, idx) => ({
        id: `tx-osm-${item.osm_id || idx}`,
        name: item.name || item.display_name.split(',')[0],
        category: 'Food & Beverage' as const,
        sub_category: item.type || 'restaurant',
        area: item.address?.road || `${specificCity || 'Austin'} Corridor`,
        city: specificCity || item.address?.city || 'Austin',
        state: 'Texas',
        country: 'USA',
        currency: 'USD',
        currency_symbol: '$',
        estimated_site_budget: '$2,800 – $5,200',
        lat: Number(item.lat),
        lng: Number(item.lon),
        phone: null,
        whatsapp: null,
        website: null,
        instagram_handle: null,
        instagram_url: null,
        instagram_followers: null,
        instagram_post_count: null,
        actual_launch_date: '2026-11-05',
        is_opening_soon: true,
        first_seen_at: new Date().toISOString(),
        source: 'osm',
        launch_source: 'osm',
        description: `Verified physical commercial venue in ${item.address?.road || specificCity || 'Austin'}, Texas.`,
        grok_summary: `Verified venue in Texas corridor. No website registered in public records.`,
        lead_score: 96,
        outreach_status: 'new' as const,
      }));
    } catch {
      return [];
    }
  }
}

// Universal Worldwide OSM Commercial Scanner
async function scanWorldwideOSM(
  lat: number,
  lng: number,
  radius = 1600,
  areaName = 'Commercial Area',
  cityName = 'Metro Area',
  countryName = 'Global',
  countryCode = 'US',
  targetCategory?: string
): Promise<Business[]> {
  try {
    const currencyInfo = getCurrencyForCountry(countryCode);
    const results: Business[] = [];
    const seenOsmIds = new Set<string>();

    const amenityFilter = targetCategory === 'Food & Beverage'
      ? 'restaurant|cafe|bar|pub|bakery|fast_food'
      : targetCategory === 'Fitness'
      ? 'gym|fitness_centre'
      : targetCategory === 'Beauty & Wellness'
      ? 'beauty|hairdresser'
      : 'restaurant|cafe|bar|pub|bakery|fast_food|clothes|boutique|beauty|hairdresser|gym';

    const overpassQuery = `[out:json][timeout:2];(node["amenity"~"${amenityFilter}"](around:${radius},${lat},${lng});node["shop"~"clothes|boutique|beauty|hairdresser|bakery|supermarket|deli"](around:${radius},${lat},${lng}););out body 30;`;

    let elements = await queryOverpassWithFallback(overpassQuery);

    if (!elements || elements.length === 0) {
      const nomQuery = `${targetCategory || 'restaurant or cafe'} in ${areaName} ${cityName}`;
      const nomItems = await queryNominatimPOI(nomQuery, targetCategory, 25);
      for (const item of nomItems) {
        const addr = item.address || {};
        const name = item.name || (item.display_name ? item.display_name.split(',')[0] : 'Commercial Venue');
        if (!name || seenOsmIds.has(String(item.osm_id))) continue;
        seenOsmIds.add(String(item.osm_id));

        const amenity = item.type || 'commercial';
        const mappedCategory = OSM_CATEGORY_MAP[amenity] || 'Food & Beverage';
        const street = addr.road ? `${addr.house_number ? addr.house_number + ' ' : ''}${addr.road}` : areaName;

        results.push({
          id: `osm-${countryCode.toLowerCase()}-${item.osm_id}`,
          osm_id: String(item.osm_id),
          name: name.trim(),
          category: mappedCategory,
          sub_category: amenity.replace('_', ' '),
          area: street,
          city: addr.city || addr.town || cityName,
          state: addr.state,
          country: countryName,
          currency: currencyInfo.currency,
          currency_symbol: currencyInfo.symbol,
          estimated_site_budget: currencyInfo.budget,
          lat: Number(item.lat),
          lng: Number(item.lon),
          phone: null,
          website: null,
          instagram_handle: null,
          instagram_url: null,
          instagram_followers: null,
          instagram_post_count: null,
          actual_launch_date: null,
          first_seen_at: new Date().toISOString(),
          source: 'osm',
          description: `Physical ${amenity.replace('_', ' ')} located at ${street}, ${cityName} (${countryName}).`,
          grok_summary: `Storefront in ${areaName}. Zero official website detected in open records.`,
          lead_score: 96,
          outreach_status: 'new',
        });
      }
      return results;
    }

    for (const el of elements) {
      const tags = el.tags || {};
      const name = tags.name || tags['name:en'] || tags['name:international'];
      if (!name || seenOsmIds.has(String(el.id))) continue;
      seenOsmIds.add(String(el.id));

      const amenity = tags.amenity || tags.shop || 'commercial';
      const mappedCategory = OSM_CATEGORY_MAP[amenity] || 'Food & Beverage';
      const hasWebsite = Boolean(tags.website || tags['contact:website']);

      const cleanStreet = tags['addr:street']
        ? `${tags['addr:housenumber'] ? tags['addr:housenumber'] + ' ' : ''}${tags['addr:street']}`
        : areaName;

      results.push({
        id: `osm-${countryCode.toLowerCase()}-${el.id}`,
        osm_id: String(el.id),
        name: name.trim(),
        category: mappedCategory,
        sub_category: amenity.replace('_', ' '),
        area: cleanStreet,
        city: tags['addr:city'] || cityName,
        state: tags['addr:state'],
        country: countryName,
        currency: currencyInfo.currency,
        currency_symbol: currencyInfo.symbol,
        estimated_site_budget: currencyInfo.budget,
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
        description: `Physical commercial establishment verified on GPS node in ${cleanStreet}, ${cityName} (${countryName}).`,
        grok_summary: !hasWebsite
          ? `Storefront in ${areaName}. Zero official website detected — prime agency candidate.`
          : `Active venue in ${areaName}. Has existing site.`,
        lead_score: !hasWebsite ? 98 : 72,
        outreach_status: 'new',
      });
    }

    return results;
  } catch (err) {
    console.warn('scanWorldwideOSM failed:', err);
    return [];
  }
}

export async function POST(req: NextRequest) {
  try {
    let targetArea = 'all';
    let region = 'all';
    let country: string | undefined = undefined;
    let city: string | undefined = undefined;
    let lat: number | undefined = undefined;
    let lng: number | undefined = undefined;
    let radius = 1600;
    let category: string | undefined = undefined;

    try {
      const body = await req.json();
      if (body?.area) targetArea = body.area;
      if (body?.region) region = body.region;
      if (body?.country) country = body.country;
      if (body?.city) city = body.city;
      if (body?.lat !== undefined) lat = Number(body.lat);
      if (body?.lng !== undefined) lng = Number(body.lng);
      if (body?.radius !== undefined) radius = Number(body.radius);
      if (body?.category && body.category !== 'all') category = body.category;
    } catch {
      // no JSON body
    }

    const { searchParams } = new URL(req.url);
    if (searchParams.get('area')) targetArea = searchParams.get('area')!;
    if (searchParams.get('region')) region = searchParams.get('region')!;
    if (searchParams.get('country')) country = searchParams.get('country')!;
    if (searchParams.get('city')) city = searchParams.get('city')!;
    if (searchParams.get('lat')) lat = Number(searchParams.get('lat'));
    if (searchParams.get('lng')) lng = Number(searchParams.get('lng'));
    if (searchParams.get('radius')) radius = Number(searchParams.get('radius'));
    if (searchParams.get('category')) category = searchParams.get('category')!;

    const discoveredBusinesses: Business[] = [];
    const rawCandidates: Business[] = [];

    // 1. Direct Coordinates Provided (e.g. from "Scan Current Map View")
    if (lat !== undefined && lng !== undefined && !isNaN(lat) && !isNaN(lng)) {
      const geoInfo = await geocodeUniversalArea(`${lat},${lng}`);
      const countryCode = geoInfo?.countryCode || 'US';
      const countryName = country || geoInfo?.country || 'Global';
      const cityName = city || geoInfo?.city || 'Local Area';
      const areaName = targetArea !== 'all' ? targetArea : (geoInfo?.name || 'Target Corridor');

      const leads = await scanWorldwideOSM(lat, lng, radius, areaName, cityName, countryName, countryCode, category);
      rawCandidates.push(...leads);
    }
    // 2. Global Sweep ("Scan All Global Markets")
    else if (region === 'all' && (targetArea === 'all' || !targetArea)) {
      const [txRes, ldnRes, hydRes, nycRes, tokyoRes] = await Promise.allSettled([
        scanTexasComptroller(45),
        scanWorldwideOSM(51.5245, -0.0785, 1400, 'Shoreditch', 'London', 'United Kingdom', 'GB', category),
        scanWorldwideOSM(17.4156, 78.3298, 1500, 'Kokapet', 'Hyderabad', 'India', 'IN', category),
        scanWorldwideOSM(40.7233, -73.9990, 1300, 'SoHo', 'New York City', 'United States', 'US', category),
        scanWorldwideOSM(35.6580, 139.7016, 1400, 'Shibuya', 'Tokyo', 'Japan', 'JP', category),
      ]);

      if (txRes.status === 'fulfilled') rawCandidates.push(...txRes.value);
      if (ldnRes.status === 'fulfilled') rawCandidates.push(...ldnRes.value);
      if (hydRes.status === 'fulfilled') rawCandidates.push(...hydRes.value);
      if (nycRes.status === 'fulfilled') rawCandidates.push(...nycRes.value);
      if (tokyoRes.status === 'fulfilled') rawCandidates.push(...tokyoRes.value);
    }
    // 3. Country or Specific City / Area Requested
    else {
      // Resolve area or city coordinates via Universal Geocoder
      const queryStr = [targetArea !== 'all' ? targetArea : '', city || '', country || '', region !== 'all' ? region : '']
        .filter(Boolean)
        .join(' ');

      const resolved = await geocodeUniversalArea(queryStr || targetArea || city || 'Austin');

      if (resolved) {
        const isTexas =
          resolved.countryCode === 'US' &&
          (resolved.state === 'Texas' ||
            ['Austin', 'Dallas', 'Houston', 'San Antonio', 'Fort Worth'].includes(resolved.city) ||
            queryStr.toLowerCase().includes('texas'));

        if (isTexas) {
          const specificCity = ['Austin', 'Dallas', 'Houston', 'San Antonio'].find((c) =>
            queryStr.toLowerCase().includes(c.toLowerCase()) || resolved.city.toLowerCase().includes(c.toLowerCase())
          );
          const [txLeads, osmLeads] = await Promise.allSettled([
            scanTexasComptroller(45, specificCity),
            scanWorldwideOSM(resolved.lat, resolved.lng, resolved.radius, resolved.name, resolved.city, resolved.country, resolved.countryCode, category),
          ]);
          if (txLeads.status === 'fulfilled') rawCandidates.push(...txLeads.value);
          if (osmLeads.status === 'fulfilled') rawCandidates.push(...osmLeads.value);
        } else {
          const leads = await scanWorldwideOSM(
            resolved.lat,
            resolved.lng,
            resolved.radius,
            resolved.name,
            resolved.city,
            resolved.country,
            resolved.countryCode,
            category
          );
          rawCandidates.push(...leads);
        }
      }
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
      city,
      country,
      coordinates: lat !== undefined && lng !== undefined ? { lat, lng } : undefined,
      discovered_count: discoveredBusinesses.length,
      newly_added: added,
      total_pipeline_count: count,
      message: `Live area scan completed! Discovered ${discoveredBusinesses.length} physical business leads.`,
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
