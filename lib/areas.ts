// Map centres for each scanned corridor, [lng, lat]. Kept outside RadarMap so
// pages can use them without pulling MapLibre into the first bundle.
export const AREA_COORDINATES: Record<string, [number, number]> = {
  // Hyderabad corridors
  Kokapet: [78.3298, 17.4156],
  Gachibowli: [78.3489, 17.44],
  'HITECH City': [78.3908, 17.4486],
  Madhapur: [78.3908, 17.4484],
  'Financial District': [78.343, 17.417],
  Nanakramguda: [78.355, 17.418],
  'Jubilee Hills': [78.4072, 17.4312],
  'Banjara Hills': [78.435, 17.4156],
  Kondapur: [78.355, 17.46],
  Narsingi: [78.3588, 17.3883],
  Hyderabad: [78.35, 17.43],

  // Texas corridors (USA)
  'South Congress': [-97.7495, 30.251],
  'Bouldin Creek': [-97.7565, 30.248],
  'East Austin': [-97.721, 30.2635],
  Downtown: [-97.7402, 30.268],
  Austin: [-97.7431, 30.2672],
  Uptown: [-96.804, 32.7985],
  'Deep Ellum': [-96.7845, 32.7835],
  Dallas: [-96.797, 32.7767],
  Montrose: [-95.391, 29.742],
  'The Heights': [-95.398, 29.799],
  Houston: [-95.3698, 29.7604],
  Texas: [-97.7431, 30.2672],

  // London corridors (UK)
  Shoreditch: [-0.0785, 51.5245],
  Soho: [-0.134, 51.5135],
  'Covent Garden': [-0.124, 51.5117],
  London: [-0.1276, 51.5074],
};
