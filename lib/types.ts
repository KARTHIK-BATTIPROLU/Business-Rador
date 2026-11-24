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

export interface DeepResearchResult {
  researched_at: string;
  business_overview: string;
  target_decision_maker: {
    probable_role: string;
    contact_name?: string;
    contact_email?: string;
    contact_phone?: string;
    preferred_channel: 'email' | 'instagram' | 'whatsapp' | 'phone';
  };
  google_presence: {
    rating: number;
    review_count: number;
    sentiment_summary: string;
    missing_elements: string[];
  };
  social_presence: {
    instagram_handle?: string | null;
    instagram_status: string;
    engagement_rate?: string;
    key_themes: string[];
  };
  corridor_competition: {
    nearby_competitors: Array<{ name: string; distance: string; advantage: string }>;
    vulnerability_gap: string;
  };
  outreach_pack: {
    cold_email: {
      subject_line: string;
      preview_text: string;
      body: string;
      target_email: string;
    };
    instagram_dm: {
      message: string;
      follow_up_message: string;
      direct_message_url: string;
      instagram_handle: string;
    };
    whatsapp_message: {
      text: string;
      direct_wa_url: string;
    };
    phone_script: {
      opener: string;
      hook: string;
      closing_ask: string;
    };
  };
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
  deep_research?: DeepResearchResult;
  is_enriched?: boolean;
  last_enriched_at?: string | null;
  instagram_verified?: boolean | null;
  instagram_bio?: string | null;
  media_photos?: MediaPhoto[];
  google_photos?: MediaPhoto[];
  instagram_posts?: MediaPhoto[];
}

export interface RadarFilterState {
  region: string;
  country?: string;
  city?: string;
  us_state?: string;
  area: string;
  lat?: number;
  lng?: number;
  radius?: number;
  category: string;
  recency: 'all' | '24h' | '7d' | '30d' | '6m';
  launch_age?: 'all' | 'opening_soon' | '14d' | '30d' | '90d' | 'older';
  missing_website_only?: boolean; // Filter only businesses without a website
  has_website?: 'all' | 'yes' | 'no';
  low_social_only?: boolean; // Filter businesses with < 500 Instagram followers
  instagram_filter?: 'all' | 'low_followers' | 'no_instagram' | 'dormant_posts';
  search: string;
  status: 'all' | OutreachStatus;
  source: 'all' | 'google_maps' | 'instagram' | 'osm' | 'texas_comptroller' | string;
}

export interface AreaStat {
  name: string;
  count: number;
  lat: number;
  lng: number;
}
