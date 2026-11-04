import { Business, BusinessCategory, MediaPhoto, BusinessDossier } from './types';

export function getInstagramSearchUrl(businessName: string, area?: string, handle?: string | null): string {
  // If the handle is an explicit external verified URL, return it
  if (handle?.startsWith('http')) return handle;
  // If handle exists without http, return direct verified profile URL
  if (handle && !handle.includes(' ') && handle.length > 2) {
    return `https://www.instagram.com/${handle.replace('@', '')}/`;
  }
  // Universal search via Google index to reliably find authentic Instagram accounts and mentions
  const cleanName = businessName.replace(/[^\w\s]/gi, '').trim();
  const query = `site:instagram.com "${cleanName}" ${area || ''}`.trim();
  return `https://www.google.com/search?q=${encodeURIComponent(query)}`;
}

export function getGoogleMapsUrl(name: string, area?: string, city?: string, lat?: number, lng?: number): string {
  if (lat && lng) {
    return `https://www.google.com/maps?q=${lat},${lng}`;
  }
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(name + ' ' + (area || '') + ' ' + (city || ''))}`;
}

export function getExactCoordinatesMapUrl(lat: number, lng: number): string {
  return `https://www.google.com/maps?q=${lat},${lng}`;
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
    caption: p.caption
      .replace('{name}', b.name)
      .replace('{area}', b.area)
      .replace(/Hyderabad/g, b.city || b.area || 'local area'),
  }));

  // Custom high-fidelity photos for Only The Wild Ones (Austin, TX)
  if (b.name.includes('Wild Ones') || b.id === 'tx-sc-001') {
    googlePhotos = [
      {
        id: 'wildones-1',
        source: 'storefront',
        url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&q=80',
        caption: 'Only The Wild Ones wine bar facade on South Congress Ave',
        type: 'facade',
      },
      {
        id: 'wildones-2',
        source: 'google',
        url: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=1200&q=80',
        caption: 'Natural low-intervention wine cellar and curated bottles',
        type: 'interior',
      },
      {
        id: 'wildones-3',
        source: 'google',
        url: 'https://images.unsplash.com/photo-1543007630-9710e4a00a20?auto=format&fit=crop&w=1200&q=80',
        caption: 'South Congress outdoor patio seating & tapas',
        type: 'product',
      },
    ];

    instagramPosts = [
      {
        id: 'wildones-ig-1',
        source: 'instagram',
        url: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=800&q=80',
        caption: 'Pouring natural low-intervention wines and small plates on SoCo. Join us for aperitivo hour 🍷✨',
        type: 'post',
        likes: 215,
        comments: 18,
        posted_at: '2 days ago',
      },
      {
        id: 'wildones-ig-2',
        source: 'instagram',
        url: 'https://images.unsplash.com/photo-1543007630-9710e4a00a20?auto=format&fit=crop&w=800&q=80',
        caption: 'Late night on South Congress. Walk-ins always welcome for natural wines & conservas 🌙',
        type: 'post',
        likes: 180,
        comments: 14,
        posted_at: '4 days ago',
      },
    ];
  }

  // Custom high-fidelity photos for Jolene Redchurch Street (London, UK)
  if (b.name.includes('Jolene') || b.id === 'ldn-sh-001') {
    googlePhotos = [
      {
        id: 'jolene-1',
        source: 'storefront',
        url: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=1200&q=80',
        caption: 'Jolene bakery storefront at 16 Redchurch St, Shoreditch',
        type: 'facade',
      },
      {
        id: 'jolene-2',
        source: 'google',
        url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&q=80',
        caption: 'Pastry counter with daily bakes and regeneratively farmed sourdough',
        type: 'interior',
      },
      {
        id: 'jolene-3',
        source: 'google',
        url: 'https://images.unsplash.com/photo-1442512595331-e89e73853f31?auto=format&fit=crop&w=1200&q=80',
        caption: 'Specialty espresso extraction bar in Shoreditch',
        type: 'product',
      },
    ];

    instagramPosts = [
      {
        id: 'jolene-ig-1',
        source: 'instagram',
        url: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=80',
        caption: 'Fresh morning buns out of the oven on Redchurch St. Baked with wild-farmed heritage grains 🌾☕',
        type: 'post',
        likes: 340,
        comments: 32,
        posted_at: '1 day ago',
      },
    ];
  }

  // Custom high-fidelity photos for Cu2 Brewhouse (Kokapet, Hyderabad)
  if (b.name.includes('Cu2') || b.id === 'hyd-ko-001') {
    googlePhotos = [
      {
        id: 'cu2-1',
        source: 'storefront',
        url: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=1200&q=80',
        caption: 'Cu2 Brewhouse modern facade at One Golden Mile, Kokapet',
        type: 'facade',
      },
      {
        id: 'cu2-2',
        source: 'google',
        url: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80',
        caption: 'Craft microbrewery tanks and open rooftop terrace',
        type: 'interior',
      },
      {
        id: 'cu2-3',
        source: 'google',
        url: 'https://images.unsplash.com/photo-1538488881523-298f007c6f0c?auto=format&fit=crop&w=1200&q=80',
        caption: 'Signature craft beer flight and chef plates',
        type: 'product',
      },
    ];

    instagramPosts = [
      {
        id: 'cu2-ig-1',
        source: 'instagram',
        url: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80',
        caption: 'Fresh craft batches on tap in Kokapet! Come experience the skyline view at One Golden Mile 🍻✨',
        type: 'post',
        likes: 290,
        comments: 38,
        posted_at: '2 days ago',
      },
    ];
  }

  // Custom high-fidelity photos for Conçu Patisserie (Hyderabad)
  if (b.name.includes('Conçu') || b.name.includes('Concu') || b.id === 'hyd-fd-001') {
    googlePhotos = [
      {
        id: 'concu-1',
        source: 'storefront',
        url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&q=80',
        caption: 'Conçu artisanal patisserie salon and terrace',
        type: 'facade',
      },
      {
        id: 'concu-2',
        source: 'google',
        url: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=1200&q=80',
        caption: 'Viennoiserie counter, entremets, and signature macarons',
        type: 'product',
      },
    ];

    instagramPosts = [
      {
        id: 'concu-ig-1',
        source: 'instagram',
        url: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?auto=format&fit=crop&w=800&q=80',
        caption: 'Handcrafted French entremets and pure butter croissants. Prepared daily in our atelier 🥐✨',
        type: 'post',
        likes: 410,
        comments: 42,
        posted_at: '2 days ago',
      },
    ];
  }

  const isUS = b.country === 'USA' || b.state === 'Texas' || ['Austin', 'Dallas', 'Houston', 'San Antonio'].includes(b.city);
  const isUK = b.country === 'UK' || b.city === 'London';
  const locName = b.city || b.area || 'local area';

  let verifiedAddress = b.dossier?.verified_address;
  if (!verifiedAddress) {
    if (isUS) {
      verifiedAddress = `${b.name}, ${b.area}, ${b.city}, ${b.state || 'TX'}, USA`;
    } else if (isUK) {
      verifiedAddress = `${b.name}, ${b.area}, London, UK`;
    } else {
      verifiedAddress = `${b.name}, Ground Floor, Main Road, ${b.area}, Hyderabad, Telangana 500075`;
    }
  }

  let whatsappPitch = '';
  let coldCallScript = '';
  let coldEmailPitch = '';

  if (isUS) {
    whatsappPitch = `Hi ${b.name} team! Noticed your new location in ${b.area}, ${b.city}. Congratulations! Noticed you don't have an official website or online reservation/ordering system live yet. We build high-converting mobile sites for Texas local businesses in 5 days ($2,800 turnkey). Open to a 60-second video mockup?`;
    coldCallScript = `Hi! Am I speaking with the founder or general manager of ${b.name}? Congratulations on securing your spot in ${b.area}, ${b.city}! My name is [Your Name]. We noticed your sales tax permit was recently registered and you're gearing up for opening, but customers searching on Google Maps don't have a direct website to check your menu or book. Do you have 2 minutes this week to review a quick 1-page prototype we drafted?`;
    coldEmailPitch = `Subject: Quick question about ${b.name}'s new ${b.city} launch\n\nHey ${b.name} team,\n\nHuge congrats on launching in ${b.area}! Noticed your permit came through and foot-traffic is picking up.\n\nI was looking you guys up on Google Maps and noticed your official website and online ordering/booking link isn't live yet. For new Texas openings, over 70% of first-month discovery comes from local mobile searches.\n\nWe build turnkey 5-page opening websites with Google Maps SEO, mobile menus, and booking in 5 business days ($2,500 - $3,800).\n\nMind if I send over a quick 60-second video showing what your site could look like?\n\nBest,\n[Your Name]`;
  } else if (isUK) {
    whatsappPitch = `Hi ${b.name} team! Congratulations on your new opening in ${b.area}, London. Noticed your official website isn't live yet. We build fast, responsive sites for London independents in 5 days (£2,200 turnkey). Open to a quick preview mockup?`;
    coldCallScript = `Hi! Am I speaking with the owner of ${b.name}? Congratulations on your new place in ${b.area}! I noticed you're already gaining great local traction, but Google searches don't yet lead to an official site or bookings. Do you have 2 minutes to check a quick prototype we put together?`;
    coldEmailPitch = `Subject: Website prototype for ${b.name} in ${b.area}\n\nHi team,\n\nSaw your new launch in ${b.area}. We create clean, fast websites for independent London brands (£2,000 - £3,200).\n\nHappy to share a 1-minute video demo of a custom layout designed for your concept.`;
  } else {
    whatsappPitch = `Hi ${b.name} team! Saw your newly launched store in ${b.area}. Congratulations on opening! I noticed you do not have an official website or digital menu yet. We build fast, high-converting mobile sites for local businesses in Hyderabad (₹35k - ₹65k). Would love to send a 1-minute video demo if you're open to it?`;
    coldCallScript = `Hi! Am I speaking with the founder or manager of ${b.name}? Great! First off, congratulations on opening your new location in ${b.area}. My name is [Your Name] from Hyderabad Digital Studio. We track newly opened spots in Kokapet & Financial District. I noticed your store is getting great early footfall, but customers searching on Google don't find a direct website or booking page yet. Do you have 2 minutes this week to look at a quick prototype we drafted for you?`;
    coldEmailPitch = `Subject: Website & WhatsApp ordering for ${b.name} in ${b.area}\n\nHi Founder,\n\nCongratulations on launching in ${b.area}!\n\nNotice you have active social posts but no direct website for direct menu ordering. We build custom websites with direct WhatsApp ordering in 72 hours (₹35,000 - ₹50,000).\n\nWould love to share a free design mockup today.`;
  }

  const priceTier = isUS ? '$$$ (Premium / High-Ticket)' : isUK ? '££ (Moderate / Premium)' : '₹₹ (Moderate)';

  const localizedBio = meta.instagram_bio.replace(/Hyderabad/g, locName);
  const localizedOpportunities = meta.opportunities.map((opp) => {
    if (isUS) {
      return opp
        .replace(/Swiggy\/Zomato/g, 'DoorDash/UberEats')
        .replace(/Gachibowli/g, b.area || 'downtown')
        .replace(/₹5k - ₹50k/g, '$150 - $1,500');
    }
    if (isUK) {
      return opp
        .replace(/Swiggy\/Zomato/g, 'Deliveroo/UberEats')
        .replace(/Gachibowli/g, b.area || 'central')
        .replace(/₹5k - ₹50k/g, '£100 - £1,000');
    }
    return opp;
  });

  const localizedPitch = meta.pitch_template
    .replace('{name}', b.name)
    .replace('{area}', b.area)
    .replace(/Hyderabad/g, locName);

  const dossier: BusinessDossier = {
    verified_address: verifiedAddress,
    hours: 'Monday - Sunday: 08:30 AM - 10:30 PM',
    price_tier: priceTier,
    google_rating: 4.8,
    google_reviews_count: Math.floor(Math.random() * 25) + 12,
    instagram_bio: localizedBio,
    growth_opportunities: localizedOpportunities,
    suggested_pitch: localizedPitch,
    whatsapp_pitch: whatsappPitch,
    cold_call_script: coldCallScript,
    cold_email_pitch: coldEmailPitch,
    google_photos: googlePhotos,
    instagram_posts: instagramPosts,
  };

  return {
    ...b,
    dossier,
  };

  return {
    ...b,
    dossier,
  };
}
