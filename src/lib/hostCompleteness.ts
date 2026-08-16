export interface CompletenessInput {
  coverUrl?: string | null;
  avatarUrl?: string | null;
  bio?: string | null;
  tagline?: string | null;
  city?: string | null;
  languages?: string[] | null;
  responseTime?: string | null;
  yearsHosting?: number | null;
  services?: string[] | null;
  specialties?: string[] | null;
  reelsCount?: number;
  amenitiesCount?: number;
}

/** One concrete field inside a checklist item, so hosts see exactly what is missing. */
export interface CompletenessDetail {
  label: string;
  done: boolean;
}

/** Where the one-click fix should drop the host inside their dashboard. */
export interface CompletenessFix {
  tab: "settings" | "reels" | "listings";
  section?: "profile" | "media" | "social" | "preferences";
  cta: string;
}

export interface CompletenessItem {
  key: string;
  label: string;
  done: boolean;
  hint: string;
  details: CompletenessDetail[];
  fix: CompletenessFix;
}

export interface CompletenessResult {
  score: number;
  items: CompletenessItem[];
  missing: CompletenessItem[];
  /** Flat list of every missing field across all items — handy for summaries. */
  missingFields: string[];
}

/** Shared scoring so the dashboard and the public page never disagree. */
export const hostCompleteness = (input: CompletenessInput): CompletenessResult => {
  const items: CompletenessItem[] = [
    {
      key: "cover",
      label: "Cover photo",
      hint: "Upload a banner image for your public page.",
      details: [{ label: "Cover / banner image", done: Boolean(input.coverUrl) }],
      fix: { tab: "settings", section: "media", cta: "Upload cover" },
      done: Boolean(input.coverUrl),
    },
    {
      key: "avatar",
      label: "Profile photo",
      hint: "Add a clear photo of yourself.",
      details: [{ label: "Profile photo", done: Boolean(input.avatarUrl) }],
      fix: { tab: "settings", section: "profile", cta: "Upload photo" },
      done: Boolean(input.avatarUrl),
    },
    {
      key: "about",
      label: "Bio & tagline",
      hint: "Write a bio, a tagline and set your city.",
      details: [
        { label: "Bio", done: Boolean(input.bio) },
        { label: "Tagline", done: Boolean(input.tagline) },
        { label: "City", done: Boolean(input.city) },
      ],
      fix: { tab: "settings", section: "profile", cta: "Edit about" },
      done: Boolean(input.bio && input.tagline && input.city),
    },
    {
      key: "quickInfo",
      label: "Quick Info",
      hint: "Add languages, response time and years hosting.",
      details: [
        { label: "Languages spoken", done: (input.languages?.length ?? 0) > 0 },
        { label: "Typical response time", done: Boolean(input.responseTime) },
        { label: "Years hosting", done: Number(input.yearsHosting || 0) > 0 },
      ],
      fix: { tab: "settings", section: "profile", cta: "Add quick info" },
      done:
        (input.languages?.length ?? 0) > 0 &&
        Boolean(input.responseTime) &&
        Number(input.yearsHosting || 0) > 0,
    },
    {
      key: "services",
      label: "Services",
      hint: "Select the services you offer.",
      details: [{ label: "At least one service tag", done: (input.services?.length ?? 0) > 0 }],
      fix: { tab: "settings", section: "profile", cta: "Pick services" },
      done: (input.services?.length ?? 0) > 0,
    },
    {
      key: "specialties",
      label: "Specialties",
      hint: "Add at least one specialty tag.",
      details: [{ label: "At least one specialty tag", done: (input.specialties?.length ?? 0) > 0 }],
      fix: { tab: "settings", section: "profile", cta: "Add specialties" },
      done: (input.specialties?.length ?? 0) > 0,
    },
    {
      key: "reels",
      label: "Reels & stories",
      hint: "Publish a reel or story to your feed.",
      details: [{ label: "One approved reel or story", done: (input.reelsCount ?? 0) > 0 }],
      fix: { tab: "reels", cta: "Add a reel" },
      done: (input.reelsCount ?? 0) > 0,
    },
    {
      key: "amenities",
      label: "Listing amenities",
      hint: "Tag amenities on a property, dish or vehicle.",
      details: [{ label: "Amenity or dietary tags on a listing", done: (input.amenitiesCount ?? 0) > 0 }],
      fix: { tab: "listings", cta: "Tag amenities" },
      done: (input.amenitiesCount ?? 0) > 0,
    },
  ];

  const score = Math.round((items.filter(item => item.done).length / items.length) * 100);
  const missing = items.filter(item => !item.done);
  return {
    score,
    items,
    missing,
    missingFields: missing.flatMap(item => item.details.filter(detail => !detail.done).map(detail => detail.label)),
  };
};
