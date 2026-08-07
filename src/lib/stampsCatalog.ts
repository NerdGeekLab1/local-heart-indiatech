// Stamp catalog: defines all collectible badges across categories & tiers.
// Travelers earn stamps automatically (or admin-granted) based on activity.

export type StampCategory = "city" | "activity" | "expertise" | "milestone" | "seasonal";
export type StampTier = "bronze" | "silver" | "gold" | "platinum" | "legend";

export interface StampDef {
  key: string;
  category: StampCategory;
  tier: StampTier;
  title: string;
  description: string;
  emoji: string;
  threshold: number; // e.g. cities visited, trips done
  metric: string;    // e.g. 'cities_visited', 'adventures_done'
}

export const STAMP_CATALOG: StampDef[] = [
  // 🏙️ City Explorer milestones
  { key: "city_first",       category: "city", tier: "bronze",   title: "First Footprint",      description: "Explored your very first city",                emoji: "🏙️", threshold: 1,   metric: "cities_visited" },
  { key: "city_explorer_7",  category: "city", tier: "silver",   title: "7 City Wanderer",      description: "Stamped 7 cities into your passport",          emoji: "🗺️", threshold: 7,   metric: "cities_visited" },
  { key: "city_master_25",   category: "city", tier: "gold",     title: "25 City Master",       description: "A quarter-century of cities conquered",        emoji: "🌆", threshold: 25,  metric: "cities_visited" },
  { key: "city_centurion",   category: "city", tier: "platinum", title: "City Centurion",       description: "100 cities. India's true cartographer",        emoji: "🏛️", threshold: 100, metric: "cities_visited" },
  { key: "state_sweeper",    category: "city", tier: "gold",     title: "State Sweeper",        description: "Set foot in 15+ Indian states",                emoji: "🇮🇳", threshold: 15,  metric: "states_visited" },
  { key: "border_crosser",   category: "city", tier: "silver",   title: "Border Crosser",       description: "Crossed into a neighbouring country",          emoji: "🛂", threshold: 1,   metric: "countries_visited" },

  // 🎯 Activity-based stamps
  { key: "adv_first_quest",  category: "activity", tier: "bronze",   title: "First Quest",       description: "Completed your first adventure booking",      emoji: "🎯", threshold: 1,  metric: "adventures_done" },
  { key: "adv_10_trips",     category: "activity", tier: "silver",   title: "10-Trip Streak",    description: "Booked & completed 10 trips",                 emoji: "🚐", threshold: 10, metric: "trips_completed" },
  { key: "adv_thrill_seeker",category: "activity", tier: "gold",     title: "Thrill Seeker",     description: "Logged 5+ extreme adventures",                emoji: "🪂", threshold: 5,  metric: "extreme_adventures" },
  { key: "adv_weekender",    category: "activity", tier: "bronze",   title: "Weekend Warrior",   description: "10 weekend escapes done",                     emoji: "⛺", threshold: 10, metric: "weekend_trips" },
  { key: "adv_road_legend",  category: "activity", tier: "platinum", title: "Road Trip Legend",  description: "Drove across 5,000+ km of Indian highways",   emoji: "🛣️", threshold: 5000, metric: "km_driven" },

  // 🧗 Expertise / terrain
  { key: "exp_terrain",      category: "expertise", tier: "silver",   title: "Knows the Terrain", description: "Explored 3+ distinct terrain types",         emoji: "🧭", threshold: 3,  metric: "terrains_explored" },
  { key: "exp_mountaineer",  category: "expertise", tier: "gold",     title: "Mountaineer",       description: "Summited or trekked 5 high-altitude trails", emoji: "🏔️", threshold: 5,  metric: "mountain_treks" },
  { key: "exp_sea_surfer",   category: "expertise", tier: "silver",   title: "Sea Surfer",        description: "Caught waves on 3 coastal trips",            emoji: "🏄", threshold: 3,  metric: "surf_sessions" },
  { key: "exp_beach_bum",    category: "expertise", tier: "bronze",   title: "Beach Bum",         description: "Visited 5 of India's iconic beaches",        emoji: "🏖️", threshold: 5,  metric: "beaches_visited" },
  { key: "exp_desert_rider", category: "expertise", tier: "gold",     title: "Desert Rider",      description: "Crossed dunes on camel or 4x4",              emoji: "🐪", threshold: 1,  metric: "desert_trips" },
  { key: "exp_jungle_scout", category: "expertise", tier: "gold",     title: "Jungle Scout",      description: "Completed 3+ wildlife safaris",              emoji: "🐅", threshold: 3,  metric: "safaris" },
  { key: "exp_himalayan",    category: "expertise", tier: "platinum", title: "Himalayan Soul",    description: "Spent 30+ nights in the Himalayas",          emoji: "⛰️", threshold: 30, metric: "himalaya_nights" },
  { key: "exp_backwaters",   category: "expertise", tier: "silver",   title: "Backwater Sailor",  description: "Houseboated through Kerala's backwaters",    emoji: "🛶", threshold: 1,  metric: "backwater_trips" },

  // 🌟 Special milestones
  { key: "mile_foodie",      category: "milestone", tier: "silver",   title: "Foodie Voyager",    description: "Tried regional cuisine in 10 states",        emoji: "🍛", threshold: 10, metric: "cuisines_tried" },
  { key: "mile_culture",     category: "milestone", tier: "gold",     title: "Culture Curator",   description: "Attended 5 cultural festivals or events",    emoji: "🎭", threshold: 5,  metric: "festivals_attended" },
  { key: "mile_storyteller", category: "milestone", tier: "silver",   title: "Storyteller",       description: "Posted 10 reviews with video",               emoji: "🎥", threshold: 10, metric: "video_reviews" },
  { key: "mile_streak_12",   category: "milestone", tier: "legend",   title: "12-Month Nomad",    description: "Booked a trip every month for a year",       emoji: "🔥", threshold: 12, metric: "streak_months" },
  { key: "mile_referrer",    category: "milestone", tier: "gold",     title: "Community Builder", description: "Referred 5 friends who joined Travelista",   emoji: "🤝", threshold: 5,  metric: "referrals_done" },

  // 🌦️ Seasonal
  { key: "sea_monsoon",      category: "seasonal", tier: "bronze",   title: "Monsoon Chaser",    description: "Travelled during monsoon season",            emoji: "🌧️", threshold: 1, metric: "monsoon_trips" },
  { key: "sea_winter",       category: "seasonal", tier: "bronze",   title: "Snow Hunter",       description: "Visited a snow destination in winter",       emoji: "❄️", threshold: 1, metric: "snow_trips" },
  { key: "sea_summer",       category: "seasonal", tier: "bronze",   title: "Summer Escape",     description: "Beat the heat at a hill station",            emoji: "☀️", threshold: 1, metric: "summer_trips" },
];

export const TIER_STYLES: Record<StampTier, { ring: string; bg: string; label: string }> = {
  bronze:   { ring: "ring-amber-700/40", bg: "bg-amber-700/10 text-amber-700",  label: "Bronze" },
  silver:   { ring: "ring-slate-400/50", bg: "bg-slate-400/10 text-slate-500",  label: "Silver" },
  gold:     { ring: "ring-yellow-500/50",bg: "bg-yellow-500/10 text-yellow-600",label: "Gold" },
  platinum: { ring: "ring-sky-400/50",   bg: "bg-sky-400/10 text-sky-500",      label: "Platinum" },
  legend:   { ring: "ring-fuchsia-500/60",bg: "bg-fuchsia-500/10 text-fuchsia-500", label: "Legend" },
};

export const CATEGORY_META: Record<StampCategory, { label: string; emoji: string; description: string }> = {
  city:      { label: "City Explorer",  emoji: "🗺️", description: "Stamps for cities, states & countries explored" },
  activity:  { label: "Activities",     emoji: "🎯", description: "Earned through trips & adventure bookings" },
  expertise: { label: "Terrain & Expertise", emoji: "🧭", description: "Master mountains, seas, beaches, jungles & more" },
  milestone: { label: "Milestones",     emoji: "🌟", description: "Community, streaks & special achievements" },
  seasonal:  { label: "Seasonal",       emoji: "🌦️", description: "Travel through every Indian season" },
};
