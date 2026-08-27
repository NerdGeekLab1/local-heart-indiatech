/** Approximate city-centre coordinates for the curated destination list (admins can refine per destination). */
export const destinationCoords: Record<string, [number, number]> = {
  "Jaipur": [26.9124, 75.7873],
  "Varanasi": [25.3176, 82.9739],
  "Alleppey": [9.4981, 76.3388],
  "Goa": [15.2993, 74.124],
  "Delhi": [28.6139, 77.209],
  "Udaipur": [24.5854, 73.7125],
  "Mumbai": [19.076, 72.8777],
  "Rishikesh": [30.0869, 78.2676],
  "Hampi": [15.335, 76.46],
  "Darjeeling": [27.036, 88.2627],
  "Amritsar": [31.634, 74.8723],
  "Jodhpur": [26.2389, 73.0243],
  "Agra": [27.1767, 78.0081],
  "Pushkar": [26.4899, 74.5511],
  "Jaisalmer": [26.9157, 70.9083],
  "Bikaner": [28.0229, 73.3119],
  "Mount Abu": [24.5926, 72.7156],
  "Ranthambore": [26.0173, 76.5026],
  "Manali": [32.2432, 77.1892],
  "Shimla": [31.1048, 77.1734],
  "Dharamshala": [32.219, 76.3234],
  "Spiti Valley": [32.2464, 78.0349],
  "Kasol": [32.01, 77.315],
  "Bir Billing": [32.05, 76.72],
  "Leh": [34.1526, 77.5771],
  "Srinagar": [34.0837, 74.7973],
  "Gulmarg": [34.0484, 74.3805],
  "Mussoorie": [30.4598, 78.0664],
  "Nainital": [29.3803, 79.4636],
  "Haridwar": [29.9457, 78.1642],
  "Auli": [30.529, 79.566],
  "Jim Corbett": [29.53, 78.7747],
  "Kedarnath": [30.7346, 79.0669],
  "Badrinath": [30.7433, 79.4938],
  "Vrindavan": [27.565, 77.6593],
  "Bodh Gaya": [24.6961, 84.9869],
  "Khajuraho": [24.8318, 79.9199],
  "Ujjain": [23.1793, 75.7849],
  "Indore": [22.7196, 75.8577],
  "Bhopal": [23.2599, 77.4126],
  "Pachmarhi": [22.4675, 78.4345],
  "Mysore": [12.2958, 76.6394],
  "Coorg": [12.3375, 75.8069],
  "Gokarna": [14.5479, 74.3188],
  "Bangalore": [12.9716, 77.5946],
  "Hyderabad": [17.385, 78.4867],
  "Chennai": [13.0827, 80.2707],
  "Madurai": [9.9252, 78.1198],
  "Kanyakumari": [8.0883, 77.5385],
  "Ooty": [11.4102, 76.695],
  "Kodaikanal": [10.2381, 77.4892],
  "Pondicherry": [11.9416, 79.8083],
  "Kochi": [9.9312, 76.2673],
  "Munnar": [10.0889, 77.0595],
  "Wayanad": [11.6854, 76.132],
  "Thekkady": [9.5939, 77.16],
  "Kovalam": [8.3988, 76.9782],
  "Andaman Islands": [11.6234, 92.7265],
  "Lakshadweep": [10.5667, 72.6417],
  "Shillong": [25.5788, 91.8933],
  "Cherrapunji": [25.2702, 91.7323],
  "Tawang": [27.586, 91.8594],
  "Ziro Valley": [27.5449, 93.83],
  "Kaziranga": [26.5775, 93.1711],
  "Majuli": [26.95, 94.1667],
  "Gangtok": [27.3389, 88.6065],
  "Pelling": [27.32, 88.24],
  "Puri": [19.8135, 85.8312],
  "Kolkata": [22.5726, 88.3639],
  "Sundarbans": [21.9497, 88.9],
  "Tirupati": [13.6288, 79.4192],
  "Vizag": [17.6868, 83.2185],
  "Pune": [18.5204, 73.8567],
  "Aurangabad": [19.8762, 75.3433],
  "Lonavala": [18.7546, 73.4062],
  "Ahmedabad": [23.0225, 72.5714],
  "Rann of Kutch": [23.7337, 69.8597],
  "Dwarka": [22.2394, 68.9678],
  "Gir National Park": [21.1244, 70.8242],
  "Coonoor": [11.353, 76.7959],
};

export interface SeedSite {
  name: string;
  type: string;
  description: string;
  entry_fee: string | null;
  best_time: string | null;
  duration: string | null;
  latitude: number | null;
  longitude: number | null;
  image_url: string | null;
}

export interface SeedDestination {
  slug: string;
  name: string;
  state: string;
  tagline: string;
  description: string;
  highlights: string[];
  best_season: string | null;
  avg_temp: string | null;
  hero_images: string[];
  experience_tags: string[];
  itinerary: { title: string; places: string[] }[];
  latitude: number | null;
  longitude: number | null;
  sites: SeedSite[];
  sort_order: number;
}

export const slugifyName = (value: string) =>
  value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

/** Guess a site category from its name so map pins get sensible icons. */
export const guessSiteType = (name: string) => {
  const n = name.toLowerCase();
  if (/temple|monastery|ashram|gurudwara|mosque|church|basilica|stupa|ghat|jhula/.test(n)) return "temple";
  if (/fort/.test(n)) return "fort";
  if (/palace|mahal|haveli|wada/.test(n)) return "palace";
  if (/bazaar|market|chowk|road|mall/.test(n)) return "market";
  if (/museum|memorial|gallery/.test(n)) return "museum";
  if (/beach|island/.test(n)) return "beach";
  if (/lake|falls|hill|peak|valley|park|garden|dam|cave|safari|dune|desert|trek|estate|river|point|gondola|ski|snorkel|paraglid/.test(n)) return "nature";
  return "monument";
};

/** Expand the curated static list into full database rows (sites, map pins and a 3-day itinerary). */
export const buildDestinationSeed = (list: any[]): SeedDestination[] =>
  list.map((d, i) => {
    const [lat, lng] = destinationCoords[d.name] ?? [null, null];
    const rawSites = d.sites?.length
      ? d.sites
      : (d.highlights || []).map((h: string, j: number) => ({
          name: h,
          type: guessSiteType(h),
          description: h + " — a signature stop in " + d.name + ", " + d.state + ".",
          lat: lat === null ? null : Number((lat + (j % 3) * 0.012 - 0.012).toFixed(6)),
          lng: lng === null ? null : Number((lng + Math.floor(j / 3) * 0.012 - 0.006).toFixed(6)),
        }));

    const sites: SeedSite[] = rawSites.map((s: any) => ({
      name: s.name,
      type: s.type || guessSiteType(s.name),
      description: s.description || "",
      entry_fee: s.entryFee ?? null,
      best_time: s.bestTime ?? null,
      duration: s.duration ?? null,
      latitude: s.lat ?? null,
      longitude: s.lng ?? null,
      image_url: s.image ?? null,
    }));

    const names: string[] = d.highlights?.length ? d.highlights : sites.map(s => s.name);
    const itinerary = [
      { title: "Day 1 — Arrive & first impressions of " + d.name, places: names.slice(0, 2) },
      { title: "Day 2 — Icons & local flavours", places: names.slice(2, 4).length ? names.slice(2, 4) : names.slice(0, 2) },
      { title: "Day 3 — Slow travel with your host", places: names.slice(4, 6).length ? names.slice(4, 6) : ["Local market walk", "Home-cooked meal"] },
    ];

    return {
      slug: slugifyName(d.name),
      name: d.name,
      state: d.state || "",
      tagline: d.tagline || "",
      description: d.description || "",
      highlights: d.highlights || [],
      best_season: d.bestSeason || null,
      avg_temp: d.avgTemp || null,
      hero_images: [],
      experience_tags: d.experienceTags || [],
      itinerary,
      latitude: lat,
      longitude: lng,
      sites,
      sort_order: i,
    };
  });
