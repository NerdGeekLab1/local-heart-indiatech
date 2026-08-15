/**
 * Canonical tag slugs for host services & specialties.
 * Hosts type free-form tags; Explore filters on slugs so "Local Guide",
 * "local-guide" and "localguide" all match the same bucket.
 */

const ALIASES: Record<string, string> = {
  guides: "guide",
  guiding: "guide",
  "local-guide": "guide",
  "city-guide": "guide",
  stays: "stay",
  homestay: "stay",
  accommodation: "stay",
  transports: "transport",
  vehicle: "transport",
  driving: "transport",
  foods: "food",
  foodie: "food",
  cuisine: "food",
  culinary: "food",
  cultural: "culture",
  heritage: "culture",
  adventures: "adventure",
  trekking: "adventure",
  photo: "photography",
  photographer: "photography",
  wellbeing: "wellness",
  yoga: "wellness",
  spiritual: "spirituality",
};

export const toTagSlug = (value: string): string => {
  const base = value
    .trim()
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return ALIASES[base] ?? base;
};

export const tagLabel = (value: string): string =>
  value
    .split(/[-\s]+/)
    .filter(Boolean)
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

export const toTagSlugs = (values: (string | null | undefined)[] = []): string[] =>
  Array.from(new Set(values.filter(Boolean).map(value => toTagSlug(String(value))))).filter(Boolean);

export interface TaggedHost {
  services: string[];
  specialties: string[];
}

/** Number of selected slugs the host matches. */
export const tagMatchCount = (host: TaggedHost, selected: string[]): number => {
  if (!selected.length) return 0;
  const hostSlugs = new Set([...toTagSlugs(host.services), ...toTagSlugs(host.specialties)]);
  return selected.filter(slug => hostSlugs.has(slug)).length;
};

/** Relevance score: tag overlap first, then rating and review volume. */
export const hostMatchScore = (
  host: TaggedHost & { rating?: number; reviewCount?: number; experiencesCount?: number },
  selected: string[],
): number =>
  tagMatchCount(host, selected) * 100 +
  Number(host.rating || 0) * 5 +
  Math.min(Number(host.reviewCount || 0), 20) +
  Math.min(Number(host.experiencesCount || 0), 10);
