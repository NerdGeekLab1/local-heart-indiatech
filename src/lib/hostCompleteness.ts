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

export interface CompletenessItem {
  key: string;
  label: string;
  done: boolean;
  hint: string;
}

export interface CompletenessResult {
  score: number;
  items: CompletenessItem[];
  missing: CompletenessItem[];
}

/** Shared scoring so the dashboard and the public page never disagree. */
export const hostCompleteness = (input: CompletenessInput): CompletenessResult => {
  const quickInfoDone =
    (input.languages?.length ?? 0) > 0 &&
    Boolean(input.responseTime) &&
    Number(input.yearsHosting || 0) > 0;

  const items: CompletenessItem[] = [
    { key: "cover", label: "Cover photo", done: Boolean(input.coverUrl), hint: "Upload a banner image for your public page." },
    { key: "avatar", label: "Profile photo", done: Boolean(input.avatarUrl), hint: "Add a clear photo of yourself." },
    { key: "about", label: "Bio & tagline", done: Boolean(input.bio && input.tagline && input.city), hint: "Write a bio, a tagline and set your city." },
    { key: "quickInfo", label: "Quick Info", done: quickInfoDone, hint: "Add languages, response time and years hosting." },
    { key: "services", label: "Services", done: (input.services?.length ?? 0) > 0, hint: "Select the services you offer." },
    { key: "specialties", label: "Specialties", done: (input.specialties?.length ?? 0) > 0, hint: "Add at least one specialty tag." },
    { key: "reels", label: "Reels & stories", done: (input.reelsCount ?? 0) > 0, hint: "Publish a reel or story to your feed." },
    { key: "amenities", label: "Listing amenities", done: (input.amenitiesCount ?? 0) > 0, hint: "Tag amenities on a property, dish or vehicle." },
  ];

  const score = Math.round((items.filter(item => item.done).length / items.length) * 100);
  return { score, items, missing: items.filter(item => !item.done) };
};
