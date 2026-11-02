import { createClient } from '@supabase/supabase-js';
import { INITIAL_BUSINESSES } from './mock-data';
import { Business, RadarFilterState } from './types';
import { enrichBusinessWithMedia } from './media-helpers';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  '';

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  !supabaseUrl.includes('your_supabase_project_url')
);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// In-memory store for local / demo mode
let localBusinesses: Business[] = [...INITIAL_BUSINESSES];

export async function fetchFilteredBusinesses(filters: RadarFilterState): Promise<Business[]> {
  if (isSupabaseConfigured && supabase) {
    try {
      let query = supabase.from('businesses').select('*');

      if (filters.area && filters.area !== 'all') {
        query = query.ilike('area', `%${filters.area}%`);
      }
      if (filters.category && filters.category !== 'all') {
        query = query.eq('category', filters.category);
      }
      if (filters.status && filters.status !== 'all') {
        query = query.eq('outreach_status', filters.status);
      }
      if (filters.source && filters.source !== 'all') {
        query = query.eq('source', filters.source);
      }
      if (filters.search) {
        query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
      }

      const { data, error } = await query.order('first_seen_at', { ascending: false });
      if (!error && data && data.length > 0) {
        const enriched = (data as Business[]).map((b) => enrichBusinessWithMedia(b));
        return filterByRecency(enriched, filters.recency);
      }
    } catch (e) {
      console.warn('Falling back to local cache due to Supabase error:', e);
    }
  }

  // Fallback to local memory store
  let res = localBusinesses.map((b) => enrichBusinessWithMedia(b));

  if (filters.area && filters.area !== 'all') {
    res = res.filter((b) => b.area.toLowerCase().includes(filters.area.toLowerCase()));
  }
  if (filters.category && filters.category !== 'all') {
    res = res.filter((b) => b.category.toLowerCase() === filters.category.toLowerCase());
  }
  if (filters.status && filters.status !== 'all') {
    res = res.filter((b) => b.outreach_status === filters.status);
  }
  if (filters.source && filters.source !== 'all') {
    res = res.filter((b) => b.source === filters.source);
  }
  if (filters.search) {
    const s = filters.search.toLowerCase();
    res = res.filter((b) =>
      b.name.toLowerCase().includes(s) ||
      (b.description && b.description.toLowerCase().includes(s)) ||
      (b.area && b.area.toLowerCase().includes(s))
    );
  }

  res = filterByLaunchAge(res, filters.launch_age);
  return filterByRecency(res, filters.recency);
}

function filterByLaunchAge(items: Business[], launchAge?: string): Business[] {
  if (!launchAge || launchAge === 'all') return items;
  const now = Date.now();
  const MS_DAY = 24 * 60 * 60 * 1000;

  return items.filter((b) => {
    if (launchAge === 'opening_soon') {
      return b.is_opening_soon === true;
    }
    const dateStr = b.actual_launch_date || b.estimated_open_date;
    if (!dateStr) return false;
    const diffDays = Math.round((now - new Date(dateStr).getTime()) / MS_DAY);

    if (launchAge === '14d') return diffDays >= 0 && diffDays <= 14;
    if (launchAge === '30d') return diffDays >= 0 && diffDays <= 30;
    if (launchAge === '90d') return diffDays >= 0 && diffDays <= 90;
    if (launchAge === 'older') return diffDays > 90;
    return true;
  });
}

function filterByRecency(items: Business[], recency: string): Business[] {
  if (recency === 'all') return items;
  const now = Date.now();
  const intervals: Record<string, number> = {
    '24h': 24 * 60 * 60 * 1000,
    '7d': 7 * 24 * 60 * 60 * 1000,
    '30d': 30 * 24 * 60 * 60 * 1000,
    '6m': 180 * 24 * 60 * 60 * 1000,
  };
  const maxDiff = intervals[recency];
  if (!maxDiff) return items;

  return items.filter((b) => {
    const seen = new Date(b.first_seen_at).getTime();
    return now - seen <= maxDiff;
  });
}

export async function updateBusinessOutreach(
  id: string,
  status: Business['outreach_status'],
  notes?: string
): Promise<boolean> {
  if (isSupabaseConfigured && supabase) {
    try {
      const updatePayload: Record<string, any> = { outreach_status: status };
      if (notes !== undefined) updatePayload.outreach_notes = notes;
      if (status === 'contacted') updatePayload.contacted_at = new Date().toISOString();

      const { error } = await supabase.from('businesses').update(updatePayload).eq('id', id);
      if (!error) return true;
    } catch (e) {
      console.warn('Failed to update Supabase, updating local state:', e);
    }
  }

  // Update in local state
  localBusinesses = localBusinesses.map((b) => {
    if (b.id === id) {
      return {
        ...b,
        outreach_status: status,
        outreach_notes: notes !== undefined ? notes : b.outreach_notes,
        contacted_at: status === 'contacted' ? new Date().toISOString() : b.contacted_at,
      };
    }
    return b;
  });

  return true;
}

export async function fetchBusinessById(id: string): Promise<Business | null> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase.from('businesses').select('*').eq('id', id).single();
      if (!error && data) {
        return enrichBusinessWithMedia(data as Business);
      }
    } catch (e) {
      console.warn('Error fetching business by id from Supabase, checking local:', e);
    }
  }

  const found = localBusinesses.find((b) => b.id === id);
  if (found) {
    return enrichBusinessWithMedia(found);
  }
  return null;
}

export async function upsertDiscoveredBusinesses(items: Business[]): Promise<{ count: number; added: number }> {
  let added = 0;
  if (isSupabaseConfigured && supabase) {
    try {
      const rows = items.map((b) => ({
        id: b.id,
        name: b.name,
        category: b.category,
        sub_category: b.sub_category,
        area: b.area,
        city: b.city || 'Hyderabad',
        lat: b.lat,
        lng: b.lng,
        phone: b.phone,
        website: b.website,
        osm_id: b.osm_id || b.id,
        source: b.source || 'osm',
        description: b.description,
        lead_score: b.lead_score,
        outreach_status: b.outreach_status || 'new',
        first_seen_at: b.first_seen_at || new Date().toISOString(),
        actual_launch_date: b.actual_launch_date,
        launch_source: b.launch_source || 'osm',
      }));

      const { data, error } = await supabase.from('businesses').upsert(rows, { onConflict: 'osm_id' }).select();
      if (!error && data) {
        added = data.length;
      }
    } catch (e) {
      console.warn('Failed to upsert to Supabase, saving to local store:', e);
    }
  }

  // Update in-memory store
  const existingNames = new Set(localBusinesses.map((b) => b.name.toLowerCase().trim()));
  for (const item of items) {
    const key = item.name.toLowerCase().trim();
    if (!existingNames.has(key)) {
      localBusinesses.unshift(enrichBusinessWithMedia(item));
      existingNames.add(key);
      added++;
    }
  }

  return { count: localBusinesses.length, added };
}
