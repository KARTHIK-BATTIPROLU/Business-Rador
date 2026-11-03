export type OutreachStatus = 'new' | 'contacted' | 'interested' | 'closed' | 'skip';

export type BusinessCategory =
  | 'Food & Beverage'
  | 'Clothing & Fashion'
  | 'Beauty & Wellness'
  | 'Fitness'
  | 'Retail'
  | 'Health'
  | 'Services'
  | 'Tech'
  | 'Other';

export interface MediaPhoto {
  id: string;
  source: 'google' | 'instagram' | 'storefront';
  url: string;
  thumbnail_url?: string;
  caption: string;
  type?: 'facade' | 'interior' | 'product' | 'story' | 'post';
  likes?: number;
  comments?: number;
  posted_at?: string;
}

export interface BusinessDossier {
  verified_address?: string;
  hours?: string;
  price_tier?: string;
  google_rating?: number;
  google_reviews_count?: number;
  instagram_bio?: string;
  growth_opportunities?: string[];
  suggested_pitch?: string;
  whatsapp_pitch?: string;
  cold_call_script?: string;
  cold_email_pitch?: string;
  google_photos?: MediaPhoto[];
  instagram_posts?: MediaPhoto[];
}

export interface Business {
  id: string;
  name: string;
  category: BusinessCategory | string;
  sub_category?: string;
  area: string;
  city: string;
  state?: string;
  country?: string; // 'India' | 'USA' | 'UK' | string
  currency?: string; // 'INR' | 'USD' | 'GBP' | 'EUR'
  currency_symbol?: string; // '₹' | '$' | '£' | '€'
  estimated_site_budget?: string; // e.g. '$2,500 – $4,500' or '₹35,000 – ₹75,000'
  lat: number;
  lng: number;
  phone?: string | null;
  email?: string | null;
  whatsapp?: string | null;
  website?: string | null;
  instagram_handle?: string | null;
  instagram_url?: string | null;
  instagram_followers?: number | null;
  google_place_id?: string | null;
  osm_id?: string | null;
  first_seen_at: string; // ISO date when radar spotted it
  estimated_open_date?: string | null;
  actual_launch_date?: string | null; // Real-world business opening date (YYYY-MM-DD)
  launch_source?: 'instagram_first_post' | 'google_maps_review' | 'grok_ai' | 'gstin_reg' | 'permit_reg' | 'texas_comptroller' | 'osm' | string | null;
  instagram_first_post_at?: string | null; // Date of first published Instagram post
  instagram_post_count?: number | null; // Total posts on account (low count = young profile)
  is_opening_soon?: boolean; // Flagged as opening soon / under construction
  source: 'google_maps' | 'instagram' | 'osm' | 'texas_comptroller' | 'companies_house' | 'manual';
  description?: string | null;
  grok_summary?: string | null;
  lead_score: number; // 0 - 100
  outreach_status: OutreachStatus;
  outreach_notes?: string | null;
  contacted_at?: string | null;
  dossier?: BusinessDossier;
}

export interface RadarFilterState {
  region: 'all' | 'hyderabad' | 'texas' | 'london';
  area: string;
  category: string;
  recency: 'all' | '24h' | '7d' | '30d' | '6m';
  launch_age?: 'all' | 'opening_soon' | '14d' | '30d' | '90d' | 'older';
  missing_website_only?: boolean; // Store Leads inspired: filter only businesses without a website
  low_social_only?: boolean; // Filter businesses with < 500 Instagram followers
  search: string;
  status: 'all' | OutreachStatus;
  source: 'all' | 'google_maps' | 'instagram' | 'osm' | 'texas_comptroller';
}

export interface AreaStat {
  name: string;
  count: number;
  lat: number;
  lng: number;
}
