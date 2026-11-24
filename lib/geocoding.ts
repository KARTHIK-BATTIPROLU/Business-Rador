export interface GlobalMarket {
  id: string;
  name: string;
  code: string;
  flag: string;
  currency: string;
  currencySymbol: string;
  defaultBudget: string;
  defaultCoords: [number, number]; // [lng, lat]
  cities: {
    name: string;
    coords: [number, number];
    corridors: { name: string; coords: [number, number]; radius?: number }[];
  }[];
}

export const GLOBAL_MARKETS: Record<string, GlobalMarket> = {
  usa: {
    id: 'usa',
    name: 'United States',
    code: 'US',
    flag: '🇺🇸',
    currency: 'USD',
    currencySymbol: '$',
    defaultBudget: '$2,800 – $5,500',
    defaultCoords: [-97.7431, 30.2672],
    cities: [
      {
        name: 'Austin',
        coords: [-97.7431, 30.2672],
        corridors: [
          { name: 'South Congress', coords: [-97.7495, 30.2510], radius: 1500 },
          { name: 'East Austin', coords: [-97.7210, 30.2635], radius: 1500 },
          { name: 'Downtown Austin', coords: [-97.7402, 30.2680], radius: 1500 },
          { name: 'Domain / North Austin', coords: [-97.7239, 30.4014], radius: 1800 },
        ],
      },
      {
        name: 'Dallas',
        coords: [-96.7970, 32.7767],
        corridors: [
          { name: 'Uptown Dallas', coords: [-96.8040, 32.7985], radius: 1500 },
          { name: 'Deep Ellum', coords: [-96.7845, 32.7835], radius: 1500 },
          { name: 'Bishop Arts', coords: [-96.8285, 32.7485], radius: 1500 },
        ],
      },
      {
        name: 'Houston',
        coords: [-95.3698, 29.7604],
        corridors: [
          { name: 'Montrose', coords: [-95.3910, 29.7420], radius: 1600 },
          { name: 'The Heights', coords: [-95.3980, 29.7990], radius: 1600 },
          { name: 'Downtown Houston', coords: [-95.3620, 29.7560], radius: 1500 },
        ],
      },
      {
        name: 'New York City',
        coords: [-73.9851, 40.7488],
        corridors: [
          { name: 'SoHo', coords: [-73.9990, 40.7233], radius: 1200 },
          { name: 'Williamsburg', coords: [-73.9571, 40.7178], radius: 1500 },
          { name: 'West Village', coords: [-74.0048, 40.7358], radius: 1200 },
          { name: 'Chelsea', coords: [-74.0014, 40.7465], radius: 1400 },
          { name: 'DUMBO', coords: [-73.9893, 40.7033], radius: 1000 },
        ],
      },
      {
        name: 'Los Angeles',
        coords: [-118.2437, 34.0522],
        corridors: [
          { name: 'West Hollywood', coords: [-118.3617, 34.0900], radius: 1600 },
          { name: 'Silver Lake', coords: [-118.2702, 34.0869], radius: 1500 },
          { name: 'Santa Monica', coords: [-118.4912, 34.0195], radius: 1500 },
          { name: 'Venice Beach', coords: [-118.4695, 33.9850], radius: 1500 },
        ],
      },
      {
        name: 'Miami',
        coords: [-80.1918, 25.7617],
        corridors: [
          { name: 'Wynwood', coords: [-80.1989, 25.8042], radius: 1400 },
          { name: 'Brickell', coords: [-80.1918, 25.7580], radius: 1400 },
          { name: 'South Beach', coords: [-80.1300, 25.7826], radius: 1500 },
        ],
      },
      {
        name: 'Chicago',
        coords: [-87.6298, 41.8781],
        corridors: [
          { name: 'The Loop', coords: [-87.6298, 41.8819], radius: 1400 },
          { name: 'West Loop / Fulton Market', coords: [-87.6534, 41.8867], radius: 1400 },
          { name: 'Wicker Park', coords: [-87.6773, 41.9088], radius: 1500 },
        ],
      },
      {
        name: 'San Francisco',
        coords: [-122.4194, 37.7749],
        corridors: [
          { name: 'Mission District', coords: [-122.4192, 37.7599], radius: 1500 },
          { name: 'Hayes Valley', coords: [-122.4267, 37.7758], radius: 1200 },
          { name: 'Marina District', coords: [-122.4363, 37.8037], radius: 1400 },
        ],
      },
    ],
  },
  uk: {
    id: 'uk',
    name: 'United Kingdom',
    code: 'GB',
    flag: '🇬🇧',
    currency: 'GBP',
    currencySymbol: '£',
    defaultBudget: '£2,200 – £4,200',
    defaultCoords: [-0.1276, 51.5074],
    cities: [
      {
        name: 'London',
        coords: [-0.1276, 51.5074],
        corridors: [
          { name: 'Shoreditch', coords: [-0.0785, 51.5245], radius: 1400 },
          { name: 'Soho', coords: [-0.1340, 51.5135], radius: 1200 },
          { name: 'Covent Garden', coords: [-0.1240, 51.5117], radius: 1200 },
          { name: 'Camden', coords: [-0.1426, 51.5390], radius: 1500 },
          { name: 'Hackney', coords: [-0.0553, 51.5450], radius: 1600 },
          { name: 'Notting Hill', coords: [-0.2057, 51.5091], radius: 1400 },
        ],
      },
      {
        name: 'Manchester',
        coords: [-2.2426, 53.4808],
        corridors: [
          { name: 'Northern Quarter', coords: [-2.2350, 53.4835], radius: 1200 },
          { name: 'Ancoats', coords: [-2.2270, 53.4840], radius: 1200 },
          { name: 'Deansgate', coords: [-2.2485, 53.4800], radius: 1400 },
        ],
      },
      {
        name: 'Edinburgh',
        coords: [-3.1883, 55.9533],
        corridors: [
          { name: 'Old Town', coords: [-3.1890, 55.9486], radius: 1200 },
          { name: 'New Town', coords: [-3.2000, 55.9555], radius: 1400 },
          { name: 'Stockbridge', coords: [-3.2100, 55.9585], radius: 1200 },
        ],
      },
    ],
  },
  india: {
    id: 'india',
    name: 'India',
    code: 'IN',
    flag: '🇮🇳',
    currency: 'INR',
    currencySymbol: '₹',
    defaultBudget: '₹35,000 – ₹75,000',
    defaultCoords: [78.35, 17.43],
    cities: [
      {
        name: 'Hyderabad',
        coords: [78.35, 17.43],
        corridors: [
          { name: 'Kokapet', coords: [78.3298, 17.4156], radius: 1500 },
          { name: 'Financial District', coords: [78.3430, 17.4170], radius: 1500 },
          { name: 'Gachibowli', coords: [78.3489, 17.4400], radius: 1500 },
          { name: 'HITECH City', coords: [78.3908, 17.4486], radius: 1500 },
          { name: 'Madhapur', coords: [78.3908, 17.4484], radius: 1500 },
          { name: 'Jubilee Hills', coords: [78.4072, 17.4312], radius: 1600 },
          { name: 'Banjara Hills', coords: [78.4350, 17.4156], radius: 1600 },
          { name: 'Kondapur', coords: [78.3550, 17.4600], radius: 1500 },
        ],
      },
      {
        name: 'Bangalore',
        coords: [77.5946, 12.9716],
        corridors: [
          { name: 'Indiranagar', coords: [77.6412, 12.9784], radius: 1500 },
          { name: 'Koramangala', coords: [77.6245, 12.9352], radius: 1600 },
          { name: 'HSR Layout', coords: [77.6408, 12.9121], radius: 1600 },
          { name: 'Whitefield', coords: [77.7499, 12.9698], radius: 1800 },
        ],
      },
      {
        name: 'Mumbai',
        coords: [72.8777, 19.0760],
        corridors: [
          { name: 'Bandra West', coords: [72.8295, 19.0596], radius: 1500 },
          { name: 'BKC (Bandra Kurla Complex)', coords: [72.8682, 19.0657], radius: 1500 },
          { name: 'Juhu', coords: [72.8265, 19.1075], radius: 1600 },
          { name: 'Lower Parel', coords: [72.8311, 18.9950], radius: 1500 },
        ],
      },
      {
        name: 'Delhi NCR',
        coords: [77.2090, 28.6139],
        corridors: [
          { name: 'Hauz Khas', coords: [77.2065, 28.5494], radius: 1400 },
          { name: 'Connaught Place', coords: [77.2167, 28.6304], radius: 1400 },
          { name: 'Cyber Hub Gurgaon', coords: [77.0878, 28.4950], radius: 1600 },
        ],
      },
    ],
  },
  canada: {
    id: 'canada',
    name: 'Canada',
    code: 'CA',
    flag: '🇨🇦',
    currency: 'CAD',
    currencySymbol: 'C$',
    defaultBudget: 'C$3,200 – C$5,800',
    defaultCoords: [-79.3832, 43.6532],
    cities: [
      {
        name: 'Toronto',
        coords: [-79.3832, 43.6532],
        corridors: [
          { name: 'Queen Street West', coords: [-79.4042, 43.6487], radius: 1400 },
          { name: 'Yorkville', coords: [-79.3900, 43.6702], radius: 1200 },
          { name: 'Kensington Market', coords: [-79.4005, 43.6547], radius: 1200 },
          { name: 'King West', coords: [-79.4000, 43.6445], radius: 1400 },
        ],
      },
      {
        name: 'Vancouver',
        coords: [-123.1207, 49.2827],
        corridors: [
          { name: 'Gastown', coords: [-123.1089, 49.2838], radius: 1200 },
          { name: 'Yaletown', coords: [-123.1215, 49.2750], radius: 1200 },
          { name: 'Kitsilano', coords: [-123.1636, 49.2684], radius: 1500 },
        ],
      },
    ],
  },
  australia: {
    id: 'australia',
    name: 'Australia',
    code: 'AU',
    flag: '🇦🇺',
    currency: 'AUD',
    currencySymbol: 'A$',
    defaultBudget: 'A$3,500 – A$6,200',
    defaultCoords: [151.2093, -33.8688],
    cities: [
      {
        name: 'Sydney',
        coords: [151.2093, -33.8688],
        corridors: [
          { name: 'Surry Hills', coords: [151.2120, -33.8860], radius: 1400 },
          { name: 'Bondi Beach', coords: [151.2743, -33.8915], radius: 1400 },
          { name: 'Paddington', coords: [151.2285, -33.8845], radius: 1400 },
          { name: 'Newtown', coords: [151.1800, -33.8970], radius: 1400 },
        ],
      },
      {
        name: 'Melbourne',
        coords: [144.9631, -37.8136],
        corridors: [
          { name: 'Fitzroy', coords: [144.9780, -37.7985], radius: 1400 },
          { name: 'South Yarra', coords: [144.9920, -37.8390], radius: 1400 },
          { name: 'St Kilda', coords: [144.9785, -37.8640], radius: 1500 },
        ],
      },
    ],
  },
  germany: {
    id: 'germany',
    name: 'Germany',
    code: 'DE',
    flag: '🇩🇪',
    currency: 'EUR',
    currencySymbol: '€',
    defaultBudget: '€2,500 – €4,800',
    defaultCoords: [13.4050, 52.5200],
    cities: [
      {
        name: 'Berlin',
        coords: [13.4050, 52.5200],
        corridors: [
          { name: 'Mitte', coords: [13.4040, 52.5180], radius: 1500 },
          { name: 'Kreuzberg', coords: [13.4020, 52.4990], radius: 1500 },
          { name: 'Prenzlauer Berg', coords: [13.4180, 52.5400], radius: 1500 },
          { name: 'Friedrichshain', coords: [13.4540, 52.5160], radius: 1500 },
        ],
      },
      {
        name: 'Munich',
        coords: [11.5820, 48.1351],
        corridors: [
          { name: 'Schwabing', coords: [11.5860, 48.1610], radius: 1500 },
          { name: 'Glockenbachviertel', coords: [11.5700, 48.1290], radius: 1300 },
        ],
      },
    ],
  },
  france: {
    id: 'france',
    name: 'France',
    code: 'FR',
    flag: '🇫🇷',
    currency: 'EUR',
    currencySymbol: '€',
    defaultBudget: '€2,600 – €5,000',
    defaultCoords: [2.3522, 48.8566],
    cities: [
      {
        name: 'Paris',
        coords: [2.3522, 48.8566],
        corridors: [
          { name: 'Le Marais', coords: [2.3600, 48.8575], radius: 1300 },
          { name: 'Saint-Germain-des-Prés', coords: [2.3330, 48.8538], radius: 1300 },
          { name: 'Montmartre', coords: [2.3431, 48.8867], radius: 1400 },
          { name: 'Canal Saint-Martin', coords: [2.3660, 48.8710], radius: 1400 },
        ],
      },
    ],
  },
  japan: {
    id: 'japan',
    name: 'Japan',
    code: 'JP',
    flag: '🇯🇵',
    currency: 'JPY',
    currencySymbol: '¥',
    defaultBudget: '¥380,000 – ¥750,000',
    defaultCoords: [139.6917, 35.6895],
    cities: [
      {
        name: 'Tokyo',
        coords: [139.6917, 35.6895],
        corridors: [
          { name: 'Shibuya', coords: [139.7016, 35.6580], radius: 1500 },
          { name: 'Shinjuku', coords: [139.7006, 35.6938], radius: 1500 },
          { name: 'Ginza', coords: [139.7671, 35.6719], radius: 1400 },
          { name: 'Roppongi', coords: [139.7328, 35.6628], radius: 1400 },
          { name: 'Shimokitazawa', coords: [139.6672, 35.6617], radius: 1300 },
        ],
      },
      {
        name: 'Osaka',
        coords: [135.5023, 34.6937],
        corridors: [
          { name: 'Dotonbori / Namba', coords: [135.5013, 34.6687], radius: 1400 },
          { name: 'Umeda', coords: [135.4960, 34.7025], radius: 1400 },
        ],
      },
    ],
  },
  uae: {
    id: 'uae',
    name: 'United Arab Emirates',
    code: 'AE',
    flag: '🇦🇪',
    currency: 'AED',
    currencySymbol: 'AED',
    defaultBudget: 'AED 9,500 – AED 18,000',
    defaultCoords: [55.2708, 25.2048],
    cities: [
      {
        name: 'Dubai',
        coords: [55.2708, 25.2048],
        corridors: [
          { name: 'Downtown Dubai', coords: [55.2744, 25.1972], radius: 1500 },
          { name: 'Dubai Marina', coords: [55.1403, 25.0805], radius: 1600 },
          { name: 'Jumeirah', coords: [55.2382, 25.2155], radius: 1800 },
          { name: 'Business Bay', coords: [55.2650, 25.1850], radius: 1500 },
        ],
      },
    ],
  },
  singapore: {
    id: 'singapore',
    name: 'Singapore',
    code: 'SG',
    flag: '🇸🇬',
    currency: 'SGD',
    currencySymbol: 'S$',
    defaultBudget: 'S$3,800 – S$6,800',
    defaultCoords: [103.8198, 1.3521],
    cities: [
      {
        name: 'Singapore',
        coords: [103.8198, 1.3521],
        corridors: [
          { name: 'Orchard Road', coords: [103.8340, 1.3048], radius: 1400 },
          { name: 'Tanjong Pagar', coords: [103.8436, 1.2764], radius: 1300 },
          { name: 'Clarke Quay', coords: [103.8450, 1.2905], radius: 1200 },
          { name: 'Marina Bay', coords: [103.8560, 1.2840], radius: 1500 },
        ],
      },
    ],
  },
};

export interface GeocodedLocation {
  name: string;
  city: string;
  state?: string;
  country: string;
  countryCode: string;
  currency: string;
  currencySymbol: string;
  budgetRange: string;
  lat: number;
  lng: number;
  radius: number;
}

const COUNTRY_CURRENCY_MAP: Record<string, { currency: string; symbol: string; budget: string }> = {
  US: { currency: 'USD', symbol: '$', budget: '$2,800 – $5,200' },
  GB: { currency: 'GBP', symbol: '£', budget: '£2,200 – £4,000' },
  IN: { currency: 'INR', symbol: '₹', budget: '₹35,000 – ₹75,000' },
  CA: { currency: 'CAD', symbol: 'C$', budget: 'C$3,200 – C$5,800' },
  AU: { currency: 'AUD', symbol: 'A$', budget: 'A$3,500 – A$6,200' },
  DE: { currency: 'EUR', symbol: '€', budget: '€2,500 – €4,800' },
  FR: { currency: 'EUR', symbol: '€', budget: '€2,600 – €5,000' },
  ES: { currency: 'EUR', symbol: '€', budget: '€2,200 – €4,200' },
  IT: { currency: 'EUR', symbol: '€', budget: '€2,400 – €4,500' },
  JP: { currency: 'JPY', symbol: '¥', budget: '¥380,000 – ¥750,000' },
  AE: { currency: 'AED', symbol: 'AED', budget: 'AED 9,500 – AED 18,000' },
  SG: { currency: 'SGD', symbol: 'S$', budget: 'S$3,800 – S$6,800' },
};

export function getCurrencyForCountry(countryCode?: string): { currency: string; symbol: string; budget: string } {
  const code = (countryCode || 'US').toUpperCase();
  return COUNTRY_CURRENCY_MAP[code] || { currency: 'USD', symbol: '$', budget: '$2,800 – $5,000' };
}

/**
 * Universal Worldwide Geocoding:
 * 1. Checks curated directory for instant match (0ms latency).
 * 2. Falls back to free global OSM Photon Geocoder (under 150ms).
 */
export async function geocodeUniversalArea(query: string): Promise<GeocodedLocation | null> {
  const qClean = query.trim().toLowerCase();
  if (!qClean) return null;

  // 1. Fast Preset Lookup
  for (const market of Object.values(GLOBAL_MARKETS)) {
    for (const city of market.cities) {
      if (city.name.toLowerCase() === qClean) {
        return {
          name: city.name,
          city: city.name,
          country: market.name,
          countryCode: market.code,
          currency: market.currency,
          currencySymbol: market.currencySymbol,
          budgetRange: market.defaultBudget,
          lat: city.coords[1],
          lng: city.coords[0],
          radius: 2000,
        };
      }
      for (const corr of city.corridors) {
        if (corr.name.toLowerCase() === qClean || qClean.includes(corr.name.toLowerCase())) {
          return {
            name: corr.name,
            city: city.name,
            country: market.name,
            countryCode: market.code,
            currency: market.currency,
            currencySymbol: market.currencySymbol,
            budgetRange: market.defaultBudget,
            lat: corr.coords[1],
            lng: corr.coords[0],
            radius: corr.radius || 1500,
          };
        }
      }
    }
  }

  // 2. Global Photon Geocoder (Free OpenStreetMap API, 100% Worldwide)
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 2500);

    const res = await fetch(`https://photon.komoot.io/api/?q=${encodeURIComponent(query)}&limit=3`, {
      signal: controller.signal,
      headers: { 'Accept': 'application/json' },
    });
    clearTimeout(timeout);

    if (res.ok) {
      const data = await res.json();
      if (data.features && data.features.length > 0) {
        const feature = data.features[0];
        const props = feature.properties || {};
        const coords = feature.geometry?.coordinates; // [lng, lat]
        if (coords && coords.length === 2) {
          const countryCode = (props.countrycode || 'US').toUpperCase();
          const curr = getCurrencyForCountry(countryCode);
          return {
            name: props.name || query,
            city: props.city || props.county || props.state || query,
            state: props.state,
            country: props.country || 'Global',
            countryCode,
            currency: curr.currency,
            currencySymbol: curr.symbol,
            budgetRange: curr.budget,
            lat: coords[1],
            lng: coords[0],
            radius: 1800,
          };
        }
      }
    }
  } catch (err) {
    console.warn('Photon geocoding fallback failed:', err);
  }

  return null;
}
