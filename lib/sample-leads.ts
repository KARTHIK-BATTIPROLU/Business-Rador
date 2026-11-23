// SAMPLE DATA. These shops are invented. Names, phone numbers and handles are
// placeholders; areas and coordinates are real Hyderabad neighbourhoods.
// Used for (a) the landing-page map crop and (b) the "preview with sample leads"
// option on an empty radar. Every UI surface that shows them labels them "Sample".
// Dates are relative to "now" so "opened 11 days ago" stays true.
import type { Business } from './types';

const daysAgo = (n: number) => new Date(Date.now() - n * 86_400_000).toISOString().slice(0, 10);
const hoursAgo = (n: number) => new Date(Date.now() - n * 3_600_000).toISOString();

type Seed = Partial<Business> & Pick<Business, 'name' | 'category' | 'area' | 'lat' | 'lng' | 'lead_score'>;

const seeds: Seed[] = [
  { name: 'Kona Chai & Bakes', category: 'Food & Beverage', sub_category: 'Cafe', area: 'Kokapet', lat: 17.4121, lng: 78.3335, lead_score: 96, actual_launch_date: daysAgo(11), instagram_handle: 'konachai.sample', instagram_followers: 212, instagram_post_count: 3, whatsapp: '910000000001', phone: '+91 00000 00001', first_seen_at: hoursAgo(30), grok_summary: 'Corner cafe on the Kokapet main road, open 7am–11pm. Menu is a photo on Instagram; orders come by DM.' },
  { name: 'Threadline Studio', category: 'Clothing & Fashion', sub_category: 'Boutique', area: 'Jubilee Hills', lat: 17.4302, lng: 78.4091, lead_score: 91, actual_launch_date: daysAgo(19), instagram_handle: 'threadline.sample', instagram_followers: 640, instagram_post_count: 14, whatsapp: '910000000002', first_seen_at: hoursAgo(70), grok_summary: 'Hand-block-print kurtas, Road 36. Sells through Instagram stories; no catalogue anywhere.' },
  { name: 'Nook Salon', category: 'Beauty & Wellness', sub_category: 'Salon', area: 'Gachibowli', lat: 17.4417, lng: 78.3522, lead_score: 88, actual_launch_date: daysAgo(6), instagram_followers: 88, instagram_post_count: 2, phone: '+91 00000 00003', whatsapp: '910000000003', first_seen_at: hoursAgo(9), grok_summary: 'Two-chair salon above a pharmacy. Bookings by phone only.' },
  { name: 'Ironside Strength', category: 'Fitness', sub_category: 'Gym', area: 'Kondapur', lat: 17.4625, lng: 78.3571, lead_score: 79, is_opening_soon: true, instagram_handle: 'ironside.sample', instagram_followers: 340, instagram_post_count: 9, phone: '+91 00000 00004', first_seen_at: hoursAgo(50) },
  { name: 'Biryani Lane', category: 'Food & Beverage', sub_category: 'Takeaway', area: 'Madhapur', lat: 17.4497, lng: 78.3889, lead_score: 84, actual_launch_date: daysAgo(27), instagram_followers: 1210, instagram_post_count: 41, whatsapp: '910000000005', first_seen_at: hoursAgo(200), website: null },
  { name: 'Paper Plane Stationers', category: 'Retail', area: 'Financial District', lat: 17.4183, lng: 78.3447, lead_score: 72, actual_launch_date: daysAgo(38), website: 'https://example.com', instagram_followers: 420, instagram_post_count: 22, phone: '+91 00000 00006', first_seen_at: hoursAgo(400) },
  { name: 'Mitti Pottery Cafe', category: 'Food & Beverage', sub_category: 'Cafe', area: 'Narsingi', lat: 17.3897, lng: 78.3601, lead_score: 93, actual_launch_date: daysAgo(4), instagram_followers: 45, instagram_post_count: 1, whatsapp: '910000000007', first_seen_at: hoursAgo(5) },
  { name: 'Clear Skin Clinic', category: 'Health', sub_category: 'Dermatology', area: 'Banjara Hills', lat: 17.4141, lng: 78.4372, lead_score: 81, actual_launch_date: daysAgo(15), instagram_followers: 260, instagram_post_count: 7, phone: '+91 00000 00008', email: 'hello@example.com', first_seen_at: hoursAgo(120) },
  { name: 'Second Sip', category: 'Food & Beverage', sub_category: 'Juice bar', area: 'Nanakramguda', lat: 17.4192, lng: 78.3561, lead_score: 87, actual_launch_date: daysAgo(9), instagram_followers: 150, instagram_post_count: 5, whatsapp: '910000000009', first_seen_at: hoursAgo(40) },
  { name: 'Loom & Lace', category: 'Clothing & Fashion', area: 'HITECH City', lat: 17.4471, lng: 78.3812, lead_score: 68, actual_launch_date: daysAgo(70), website: 'https://example.com', instagram_followers: 2300, instagram_post_count: 96, phone: '+91 00000 00010', first_seen_at: hoursAgo(900) },
];

export const SAMPLE_LEADS: Business[] = seeds.map((s, i) => ({
  id: `sample-${i + 1}`,
  city: 'Hyderabad',
  country: 'India',
  currency: 'INR',
  currency_symbol: '₹',
  source: 'manual',
  outreach_status: 'new',
  first_seen_at: hoursAgo(24),
  website: null,
  description: null,
  ...s,
}));

export const findSampleLead = (id: string) => SAMPLE_LEADS.find((b) => b.id === id) ?? null;
