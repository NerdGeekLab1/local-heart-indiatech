/**
 * Travelista feature registry.
 *
 * Every shipped capability is registered here with a semantic version history so
 * the Admin Test Mode console can roll a specific version to a specific audience
 * (admin / host / traveler / guest user) before it goes live for everyone.
 *
 * Versioning rules
 *  - x.0  → new capability or breaking rework  (Trip 1.0, Trip 2.0)
 *  - x.y  → additive update to an existing one (Trip 1.1)
 */

export type Audience = "admin" | "host" | "traveler" | "user";

export interface FeatureVersion {
  version: string;
  released: string;          // ISO date
  status: "live" | "beta" | "planned";
  summary: string;
  changes: string[];
}

export interface FeatureDefinition {
  key: string;
  name: string;
  area: "Marketplace" | "Social" | "Growth" | "Operations" | "Platform";
  audiences: Audience[];
  routes: string[];
  tables: string[];
  versions: FeatureVersion[];
}

export const FEATURE_REGISTRY: FeatureDefinition[] = [
  {
    key: "trip",
    name: "Traveler-led Trips",
    area: "Marketplace",
    audiences: ["traveler", "host", "admin"],
    routes: ["/trips", "/trip/:id", "/host-trip", "/trip-leader/:id"],
    tables: ["trip_listings", "trip_participants"],
    versions: [
      { version: "1.0", released: "2025-01-15", status: "live", summary: "Trip hosting MVP", changes: ["Create/publish a trip", "Fixed & split pricing", "Join requests"] },
      { version: "1.1", released: "2025-04-02", status: "live", summary: "Trip leader profiles", changes: ["Public trip-leader profile", "Leader score & history", "Deep links from feed"] },
      { version: "2.0", released: "2026-01-10", status: "beta", summary: "Luggage Companion seat", changes: ["One complimentary 'Luggage' seat per trip", "Task-based eligibility", "Subscriber-only claim window"] },
    ],
  },
  {
    key: "experience",
    name: "Host Experiences",
    area: "Marketplace",
    audiences: ["host", "traveler", "admin"],
    routes: ["/experiences", "/experience/:id", "/book/:id"],
    tables: ["experiences", "experience_requests", "bookings"],
    versions: [
      { version: "1.0", released: "2024-11-01", status: "live", summary: "Experience catalog & booking", changes: ["Listing submission", "Admin approval queue", "Booking with guests + dates"] },
      { version: "1.1", released: "2025-06-20", status: "live", summary: "Specialised categories", changes: ["Transport vehicle types", "Per day / per km pricing", "Seasonal validity windows"] },
    ],
  },
  {
    key: "feed",
    name: "Traveler Feed",
    area: "Social",
    audiences: ["traveler", "host", "user", "admin"],
    routes: ["/feed", "/traveler/:id"],
    tables: ["feed_posts", "feed_likes", "feed_bookmarks", "user_bookmarks"],
    versions: [
      { version: "1.0", released: "2026-02-01", status: "live", summary: "Instagram-style story feed", changes: ["Photo & video posts", "Captions, tags, likes"] },
      { version: "1.1", released: "2026-03-05", status: "live", summary: "Live Atlas", changes: ["Map sidebar filtering", "Infinite scroll", "Bookmarks + moderation panel"] },
    ],
  },
  {
    key: "rewards",
    name: "Streaks, Stamps & Rewards",
    area: "Growth",
    audiences: ["traveler", "admin"],
    routes: ["/rewards", "/leaderboard", "/referrals"],
    tables: ["travel_streaks", "traveler_stamps", "referrals"],
    versions: [
      { version: "1.0", released: "2025-08-12", status: "live", summary: "Streak challenge", changes: ["Monthly streak tracking", "11 months → 12th trip free"] },
      { version: "1.1", released: "2025-10-04", status: "live", summary: "Stamp collection", changes: ["Tiered stamps", "Referral rewards"] },
    ],
  },
  {
    key: "beta_wanderer",
    name: "Beta Wanderer Programme",
    area: "Growth",
    audiences: ["traveler", "admin"],
    routes: ["/beta-wanderers", "/beta-wanderer-apply", "/beta-wanderer/:id"],
    tables: ["beta_wanderers", "wanderer_missions", "beta_waitlist"],
    versions: [
      { version: "1.0", released: "2025-09-01", status: "live", summary: "Creator programme", changes: ["Applications", "Missions", "Leaderboard & badges"] },
    ],
  },
  {
    key: "subscription",
    name: "Membership & Subscriptions",
    area: "Growth",
    audiences: ["traveler", "host", "admin"],
    routes: ["/membership"],
    tables: ["subscriptions", "subscription_plans"],
    versions: [
      { version: "1.0", released: "2025-07-01", status: "live", summary: "Four-tier membership", changes: ["Free / Explorer / Adventurer / Nomad", "Plan perks & badges"] },
      { version: "1.1", released: "2026-01-20", status: "planned", summary: "Luggage entitlement", changes: ["Monthly complimentary Luggage claim for subscribers"] },
    ],
  },
  {
    key: "host_onboarding",
    name: "Host Eligibility & Waitlist",
    area: "Operations",
    audiences: ["host", "admin"],
    routes: ["/become-host", "/host-eligibility"],
    tables: ["host_eligibility", "user_roles"],
    versions: [
      { version: "1.0", released: "2025-05-10", status: "live", summary: "Scored applications", changes: ["Eligibility scoring", "Waitlist position", "Admin approval → host role"] },
    ],
  },
  {
    key: "admin_console",
    name: "Admin Console",
    area: "Platform",
    audiences: ["admin"],
    routes: ["/dashboard/admin", "/admin/feature-flags", "/admin/waitlist", "/admin/audit-log", "/admin/performance"],
    tables: ["admin_audit_log", "feature_flags", "user_feature_flags", "app_configuration"],
    versions: [
      { version: "1.0", released: "2025-03-01", status: "live", summary: "Unified operations portal", changes: ["Moderation queues", "User management", "Audit log"] },
      { version: "1.1", released: "2026-04-01", status: "live", summary: "Live analytics + cached tabs", changes: ["Real-time metrics", "React Query caching", "Persisted tab state"] },
      { version: "1.2", released: "2026-07-27", status: "beta", summary: "Test Mode", changes: ["Feature/version registry", "Per-audience rollout simulation", "Role preview"] },
    ],
  },
  {
    key: "messaging",
    name: "Messaging & Grievances",
    area: "Operations",
    audiences: ["traveler", "host", "admin"],
    routes: ["/grievances", "/help"],
    tables: ["messages", "grievances"],
    versions: [
      { version: "1.0", released: "2025-02-18", status: "live", summary: "Real-time chat", changes: ["Traveler ↔ host chat", "Grievance tickets", "Admin mediation"] },
    ],
  },
  {
    key: "ai_concierge",
    name: "AI Concierge",
    area: "Platform",
    audiences: ["traveler", "user", "admin"],
    routes: ["/", "/explore"],
    tables: [],
    versions: [
      { version: "1.0", released: "2025-12-02", status: "live", summary: "Gemini Flash recommender", changes: ["Streaming chat", "Itinerary suggestions"] },
    ],
  },
];

export const latestVersion = (f: FeatureDefinition) => f.versions[f.versions.length - 1];

export const findFeature = (key: string) => FEATURE_REGISTRY.find(f => f.key === key);
