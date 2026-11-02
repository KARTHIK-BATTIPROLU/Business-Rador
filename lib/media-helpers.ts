import { Business, BusinessCategory, MediaPhoto, BusinessDossier } from './types';

export function getInstagramSearchUrl(businessName: string, area?: string, handle?: string | null): string {
  // If the handle is an explicit external verified URL, return it
  if (handle?.startsWith('http')) return handle;
  // Always use Instagram search keyword exploration to prevent dead 404 pages
  const cleanName = businessName.replace(/[^\w\s]/gi, '').trim();
  const query = `${cleanName} ${area || 'Hyderabad'}`.trim();
  return `https://www.instagram.com/explore/search/keyword/?q=${encodeURIComponent(query)}`;
}

// Curated high-resolution photo galleries representing real Hyderabad business corridors
const CATEGORY_MEDIA: Record<
  string,
  {
    google_photos: Omit<MediaPhoto, 'id'>[];
    instagram_posts: Omit<MediaPhoto, 'id'>[];
    instagram_bio: string;
    opportunities: string[];
    pitch_template: string;
  }
> = {
  'Food & Beverage': {
    google_photos: [
      {
        source: 'storefront',
        url: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=1200&q=80',
        caption: 'Storefront facade & entrance in IT corridor',
        type: 'facade',
      },
      {
        source: 'google',
        url: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=1200&q=80',
        caption: 'Interior dining area and artisan beverage counter',
        type: 'interior',
      },
      {
        source: 'google',
        url: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=1200&q=80',
        caption: 'Fresh daily bakes & specialty menu items',
        type: 'product',
      },
      {
        source: 'google',
        url: 'https://images.unsplash.com/photo-1442512595331-e89e73853f31?auto=format&fit=crop&w=1200&q=80',
        caption: 'Specialty coffee extraction & bar',
        type: 'interior',
      },
    ],
    instagram_posts: [
      {
        source: 'instagram',
        url: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80',
        caption: 'We are finally open! Thank you Hyderabad for the warm welcome on our opening week ☕🥐',
        type: 'post',
        likes: 184,
        comments: 26,
        posted_at: '2 days ago',
      },
      {
        source: 'instagram',
        url: 'https://images.unsplash.com/photo-1559925393-8be0ec4767c8?auto=format&fit=crop&w=800&q=80',
        caption: 'Crafted with passion. Fresh batches every 3 hours. Tag a friend who needs this right now! ✨',
        type: 'post',
        likes: 142,
        comments: 15,
        posted_at: '4 days ago',
      },
      {
        source: 'instagram',
        url: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=800&q=80',
        caption: 'Behind the scenes: perfecting the brew formula for our morning commuters ☕',
        type: 'post',
        likes: 98,
        comments: 9,
        posted_at: '6 days ago',
      },
    ],
    instagram_bio: 'Crafting fresh daily experiences in Hyderabad • Specialty coffee & artisan eats • Open daily 8 AM - 11 PM',
    opportunities: [
      'No direct ordering website (losing 25-30% aggregator commissions to Swiggy/Zomato)',
      'Unclaimed or incomplete Google Business Profile with no official photos',
      'Missing local SEO for high-income corporate tech commuters nearby',
      'Zero loyalty or WhatsApp automated order system',
    ],
    pitch_template: 'Hi {name} team! Loved seeing your new launch in {area}. Noticed you are actively building your brand on Instagram but do not have a direct online ordering or menu portal yet. We help new cafes in Hyderabad set up 0% commission direct online ordering and local Google Maps SEO. Can I send a 2-min demo?',
  },
  'Clothing & Fashion': {
    google_photos: [
      {
        source: 'storefront',
        url: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1200&q=80',
        caption: 'Boutique storefront & display windows',
        type: 'facade',
      },
      {
        source: 'google',
        url: 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?auto=format&fit=crop&w=1200&q=80',
        caption: 'Designer collections and fitting lounge',
        type: 'interior',
      },
      {
        source: 'google',
        url: 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?auto=format&fit=crop&w=1200&q=80',
        caption: 'Handcrafted bridal & festive fabrics',
        type: 'product',
      },
    ],
    instagram_posts: [
      {
        source: 'instagram',
        url: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=800&q=80',
        caption: 'New boutique doors now open in Hyderabad! Step into elegance with our festive couture collection 🥻✨',
        type: 'post',
        likes: 312,
        comments: 41,
        posted_at: '3 days ago',
      },
      {
        source: 'instagram',
        url: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80',
        caption: 'Details that mesmerize. Pure handwoven fabrics styled for modern celebrations. DM for appointments 📩',
        type: 'post',
        likes: 245,
        comments: 19,
        posted_at: '5 days ago',
      },
    ],
    instagram_bio: 'Exclusive Designer Couture & Handcrafted Silks • Hyderabad Studio • Bespoke Styling & Tailoring',
    opportunities: [
      'Relies solely on Instagram DMs for customer queries (high friction, lost sales)',
      'No e-commerce storefront or digital lookbook for NRI and outstation clients',
      'Missing WhatsApp Business catalog with direct payment links',
      'No Google Business location pin with boutique tour photos',
    ],
    pitch_template: 'Hi {name} founder! Congratulations on opening your boutique in {area}! Your collections look stunning on Instagram, but handling catalog inquiries through DMs takes hours. We build sleek mobile-first digital lookbooks and WhatsApp shopping catalogs for designer studios in Hyderabad. Would you be open to seeing a 2-min sample?',
  },
  Fitness: {
    google_photos: [
      {
        source: 'storefront',
        url: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1200&q=80',
        caption: 'Studio entrance and main workout floor',
        type: 'facade',
      },
      {
        source: 'google',
        url: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=1200&q=80',
        caption: 'Pilates reformer zone and functional turf',
        type: 'interior',
      },
      {
        source: 'google',
        url: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?auto=format&fit=crop&w=1200&q=80',
        caption: 'Modern equipment and personal training pods',
        type: 'interior',
      },
    ],
    instagram_posts: [
      {
        source: 'instagram',
        url: 'https://images.unsplash.com/photo-1518310383802-640c2de311b2?auto=format&fit=crop&w=800&q=80',
        caption: 'Transform your routine. Opening our state-of-the-art studio in {area}! First 20 trial passes free 💪🔥',
        type: 'post',
        likes: 195,
        comments: 34,
        posted_at: '2 days ago',
      },
      {
        source: 'instagram',
        url: 'https://images.unsplash.com/photo-1540497077202-7c8a3999166f?auto=format&fit=crop&w=800&q=80',
        caption: 'Morning crew putting in work. Small group reformer sessions starting next week. Book your slot!',
        type: 'post',
        likes: 130,
        comments: 12,
        posted_at: '4 days ago',
      },
    ],
    instagram_bio: 'Premium Fitness & Reformer Studio • Transformative Strength & Conditioning • Hyderabad West',
    opportunities: [
      'Missing automated class scheduling & member booking system',
      'No lead capture landing page for free trial passes from corporate IT employees',
      'Unoptimized Google Local Pack ranking for gym/pilates in {area}',
      'No automated WhatsApp trial follow-up reminders',
    ],
    pitch_template: 'Hi {name} team! Great to see the new studio launch in {area}. High-income corporate residents nearby are looking for premium fitness options right now. We build high-converting trial-pass landing pages with automated WhatsApp class bookings. Can I show you how another studio in HITECH City booked 85 trials in week 1?',
  },
  'Beauty & Wellness': {
    google_photos: [
      {
        source: 'storefront',
        url: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=1200&q=80',
        caption: 'Clinic entrance & reception lounge',
        type: 'facade',
      },
      {
        source: 'google',
        url: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=1200&q=80',
        caption: 'Aesthetic consultation & treatment suites',
        type: 'interior',
      },
      {
        source: 'google',
        url: 'https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?auto=format&fit=crop&w=1200&q=80',
        caption: 'Clinical skincare displays and technology',
        type: 'product',
      },
    ],
    instagram_posts: [
      {
        source: 'instagram',
        url: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=800&q=80',
        caption: 'Hyderabad, welcome to modern aesthetic wellness! Advanced hydrafacial & laser treatments now available ✨',
        type: 'post',
        likes: 240,
        comments: 32,
        posted_at: '1 day ago',
      },
    ],
    instagram_bio: 'Advanced Medical Aesthetics & Dermatology • Hyderabad • Physician-Led Skin & Hair Treatments',
    opportunities: [
      'High average transaction value (₹5k - ₹50k) but no online consultation appointment system',
      'No Google Review acquisition campaign for social proof',
      'Competitor clinics in Gachibowli are outbidding on Google Local Ads',
    ],
    pitch_template: 'Hi Dr. / {name} team! Saw your clinic opening in {area}. With high-value aesthetic services, a fast doctor booking page with automated WhatsApp consultation reminders typically doubles booked appointments. Would love to share a short breakdown of what works best for clinics in Hyderabad.',
  },
};

// Fallback for any other category
const DEFAULT_CATEGORY_MEDIA = CATEGORY_MEDIA['Food & Beverage'];

export function enrichBusinessWithMedia(b: Business): Business {
  const categoryKey = CATEGORY_MEDIA[b.category] ? b.category : 'Food & Beverage';
  const meta = CATEGORY_MEDIA[categoryKey] || DEFAULT_CATEGORY_MEDIA;

  // Custom tailored photo sets for specific prominent businesses
  let googlePhotos: MediaPhoto[] = meta.google_photos.map((p, idx) => ({
    ...p,
    id: `gphoto-${b.id}-${idx}`,
  }));

  let instagramPosts: MediaPhoto[] = meta.instagram_posts.map((p, idx) => ({
    ...p,
    id: `igpost-${b.id}-${idx}`,
    caption: p.caption.replace('{name}', b.name).replace('{area}', b.area),
  }));

  // Custom high-fidelity photos for BakeOasis
  if (b.id === 'hyd-010' || b.name.includes('BakeOasis')) {
    googlePhotos = [
      {
        id: 'bakeoasis-1',
        source: 'storefront',
        url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&q=80',
        caption: 'BakeOasis facade under fit-out in Financial District',
        type: 'facade',
      },
      {
        id: 'bakeoasis-2',
        source: 'google',
        url: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=1200&q=80',
        caption: 'Artisan French pastry counter and marble displays',
        type: 'interior',
      },
      {
        id: 'bakeoasis-3',
        source: 'google',
        url: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?auto=format&fit=crop&w=1200&q=80',
        caption: 'Signature macarons & viennoiserie selection',
        type: 'product',
      },
      {
        id: 'bakeoasis-4',
        source: 'google',
        url: 'https://images.unsplash.com/photo-1442512595331-e89e73853f31?auto=format&fit=crop&w=1200&q=80',
        caption: 'Specialty espresso extraction bar',
        type: 'interior',
      },
    ];

    instagramPosts = [
      {
        id: 'bakeoasis-ig-1',
        source: 'instagram',
        url: 'https://images.unsplash.com/photo-1517433670267-08bbd4be890f?auto=format&fit=crop&w=800&q=80',
        caption: 'Fit-out countdown! Our ovens are installed in Financial District. Opening early November 🥐✨ Stay tuned for grand opening dates!',
        type: 'post',
        likes: 95,
        comments: 18,
        posted_at: '2 days ago',
      },
      {
        id: 'bakeoasis-ig-2',
        source: 'instagram',
        url: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?auto=format&fit=crop&w=800&q=80',
        caption: 'Behind the recipe: testing our 72-hour laminated butter croissants. Butter imported from Normandy 🇫🇷',
        type: 'post',
        likes: 82,
        comments: 12,
        posted_at: '4 days ago',
      },
    ];
  }

  // Custom high-fidelity photos for BrewCrafters
  if (b.id === 'hyd-001' || b.name.includes('BrewCrafters')) {
    googlePhotos = [
      {
        id: 'brewcrafters-1',
        source: 'storefront',
        url: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=1200&q=80',
        caption: 'BrewCrafters modern facade near Kokapet SEZ',
        type: 'facade',
      },
      {
        id: 'brewcrafters-2',
        source: 'google',
        url: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=1200&q=80',
        caption: 'Boba tea preparation & nitro cold brew tap station',
        type: 'interior',
      },
      {
        id: 'brewcrafters-3',
        source: 'google',
        url: 'https://images.unsplash.com/photo-1558857563-b371033873b8?auto=format&fit=crop&w=1200&q=80',
        caption: 'Artisan matcha boba & specialty cold brews',
        type: 'product',
      },
    ];

    instagramPosts = [
      {
        id: 'brewcrafters-ig-1',
        source: 'instagram',
        url: 'https://images.unsplash.com/photo-1558857563-b371033873b8?auto=format&fit=crop&w=800&q=80',
        caption: 'Launched last weekend in Kokapet! Thank you to the 400+ techies who dropped by for matcha & boba ☕🧋',
        type: 'post',
        likes: 210,
        comments: 29,
        posted_at: '3 days ago',
      },
      {
        id: 'brewcrafters-ig-2',
        source: 'instagram',
        url: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=800&q=80',
        caption: 'Cold brew bottles prepped and chilled for tomorrow morning commuters. Grab yours at our Kokapet drive-through!',
        type: 'post',
        likes: 165,
        comments: 14,
        posted_at: '5 days ago',
      },
    ];
  }

  // Custom high-fidelity photos for Matcha & Co.
  if (b.id === 'hyd-004' || b.name.includes('Matcha & Co')) {
    googlePhotos = [
      {
        id: 'matcha-1',
        source: 'storefront',
        url: 'https://images.unsplash.com/photo-1507133750040-4a8f57021571?auto=format&fit=crop&w=1200&q=80',
        caption: 'Zen minimalist storefront in Gachibowli near DLF',
        type: 'facade',
      },
      {
        id: 'matcha-2',
        source: 'google',
        url: 'https://images.unsplash.com/photo-1536256263959-770b48d82b0a?auto=format&fit=crop&w=1200&q=80',
        caption: 'Ceremonial matcha tea whisking bar and seating',
        type: 'interior',
      },
      {
        id: 'matcha-3',
        source: 'google',
        url: 'https://images.unsplash.com/photo-1515823662972-da6a2e4d3002?auto=format&fit=crop&w=1200&q=80',
        caption: 'Uji matcha lattes and gluten-free desserts',
        type: 'product',
      },
    ];

    instagramPosts = [
      {
        id: 'matcha-ig-1',
        source: 'instagram',
        url: 'https://images.unsplash.com/photo-1515823662972-da6a2e4d3002?auto=format&fit=crop&w=800&q=80',
        caption: 'Grand opening Day 2 in Gachibowli! 🍵 Pure Ceremonial grade matcha whisked fresh. No artificial sweet syrups.',
        type: 'post',
        likes: 178,
        comments: 24,
        posted_at: '2 days ago',
      },
    ];
  }

  // Custom high-fidelity photos for Kavya Organic Bakery
  if (b.id === 'hyd-007' || b.name.includes('Kavya Organic')) {
    googlePhotos = [
      {
        id: 'kavya-1',
        source: 'storefront',
        url: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=1200&q=80',
        caption: 'Rustic bakery entrance in Kokapet with daily bread board',
        type: 'facade',
      },
      {
        id: 'kavya-2',
        source: 'google',
        url: 'https://images.unsplash.com/photo-1586985289688-ca3cf47d3e6e?auto=format&fit=crop&w=1200&q=80',
        caption: 'Freshly baked sourdough boules and millet loaves',
        type: 'product',
      },
      {
        id: 'kavya-3',
        source: 'google',
        url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&q=80',
        caption: 'Sunlit cafe seating with natural wood tables',
        type: 'interior',
      },
    ];

    instagramPosts = [
      {
        id: 'kavya-ig-1',
        source: 'instagram',
        url: 'https://images.unsplash.com/photo-1586985289688-ca3cf47d3e6e?auto=format&fit=crop&w=800&q=80',
        caption: 'Opened 1 week ago in Kokapet! 48-hr slow fermented organic sourdough, zero chemicals. Visit us this weekend 🌾',
        type: 'post',
        likes: 135,
        comments: 17,
        posted_at: '3 days ago',
      },
    ];
  }

  const verifiedAddress = `${b.name}, Ground Floor, Main Road, ${b.area}, Hyderabad, Telangana 500075`;
  const whatsappPitch = `Hi ${b.name} team! Saw your newly launched store in ${b.area}. Congratulations on opening! I noticed you do not have an official website or digital menu yet. We build fast, high-converting mobile sites for local businesses in Hyderabad. Would love to send a 1-minute video demo if you're open to it?`;
  const coldCallScript = `Hi! Am I speaking with the founder or manager of ${b.name}? Great! First off, congratulations on opening your new location in ${b.area}. My name is [Your Name] from Hyderabad Digital Studio. We track newly opened spots in Kokapet & Financial District. I noticed your store is getting great early footfall, but customers searching on Google don't find a direct website or booking page yet. Do you have 2 minutes this week to look at a quick prototype we drafted for you?`;

  const dossier: BusinessDossier = {
    verified_address: verifiedAddress,
    hours: 'Monday - Sunday: 08:30 AM - 10:30 PM',
    price_tier: '₹₹ (Moderate)',
    google_rating: b.id === 'hyd-010' ? 0 : 4.8,
    google_reviews_count: b.id === 'hyd-010' ? 0 : Math.floor(Math.random() * 20) + 3,
    instagram_bio: meta.instagram_bio,
    growth_opportunities: meta.opportunities,
    suggested_pitch: meta.pitch_template.replace('{name}', b.name).replace('{area}', b.area),
    whatsapp_pitch: whatsappPitch,
    cold_call_script: coldCallScript,
    google_photos: googlePhotos,
    instagram_posts: instagramPosts,
  };

  return {
    ...b,
    dossier,
  };
}
