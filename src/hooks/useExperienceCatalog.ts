import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface CatalogListItem {
  id: string;
  slug: string;
  title: string;
  category: string;
  sub_category: string | null;
  summary: string;
  hero_image_url: string | null;
  typical_duration: string | null;
  difficulty: string | null;
  price_min: number;
  price_max: number;
  season_months: number[];
  season_label: string | null;
  occasion_type: string | null;
  is_featured: boolean;
  highlights: string[];
  host_count: number;
  offered_price_min: number | null;
  offered_price_max: number | null;
  cities: string[] | null;
  avg_rating: number | null;
}

export interface CatalogHostCard {
  offering_id: string;
  masked?: boolean;
  /** masked view */
  display_name?: string;
  city_region?: string;
  price_band?: string;
  /** unmasked view */
  host_id?: string;
  username?: string | null;
  full_name?: string;
  avatar_url?: string | null;
  city?: string;
  host_notes?: string;
  price?: number;
  price_unit?: string;
  max_guests?: number;
  duration?: string | null;
  meeting_point?: string | null;
  photos?: string[];
  available_from?: string | null;
  available_to?: string | null;
  headline: string;
  verification_status?: string;
  rating: number;
  review_count: number;
}

export interface CatalogOccasion {
  id: string;
  kind: string;
  title: string;
  event_type: string | null;
  city: string;
  start_date: string | null;
  end_date: string | null;
  recurring_months: number[];
  cover_image_url: string | null;
  description: string;
}

export interface CatalogDetail {
  found: boolean;
  gated: boolean;
  catalog: CatalogListItem & { description: string; includes: string[]; gallery: string[] };
  host_count: number;
  price_range: { min: number; max: number } | null;
  cities: string[];
  hosts: CatalogHostCard[];
  occasions: CatalogOccasion[];
}

export const MONTH_LABELS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** Published, admin-curated experience types — readable without an account. */
export const useCatalogList = () =>
  useQuery({
    queryKey: ["experience-catalog"],
    queryFn: async (): Promise<CatalogListItem[]> => {
      const { data, error } = await (supabase as any).rpc("get_catalog_public");
      if (error) throw error;
      return (data ?? []) as CatalogListItem[];
    },
    staleTime: 5 * 60 * 1000,
  });

/**
 * Experience type detail. The generic content is always public; the host list is
 * masked by the backend until the visitor is signed in.
 */
export const useCatalogDetail = (identifier?: string, authKey?: string | null) =>
  useQuery({
    queryKey: ["experience-catalog", identifier, authKey ?? "anon"],
    enabled: !!identifier,
    queryFn: async (): Promise<CatalogDetail> => {
      const { data, error } = await (supabase as any).rpc("get_catalog_detail", { _identifier: identifier });
      if (error) throw error;
      return (data ?? { found: false }) as CatalogDetail;
    },
    staleTime: 60 * 1000,
  });

/** Public itinerary (weddings, festivals, seasonal windows) for one host. */
export const useHostSchedule = (hostId?: string) =>
  useQuery({
    queryKey: ["host-schedule", hostId],
    enabled: !!hostId,
    queryFn: async () => {
      const { data, error } = await (supabase as any).rpc("get_host_schedule_public", { _host: hostId });
      if (error) throw error;
      return (data ?? []) as Array<CatalogOccasion & { venue: string | null; guest_capacity: number | null; experiences: Array<{ catalog_id: string; slug: string; title: string; category: string; hero_image_url: string | null }> }>;
    },
    staleTime: 60 * 1000,
  });

export const seasonSummary = (months: number[] | null | undefined, label?: string | null) => {
  if (label) return label;
  if (!months?.length || months.length === 12) return "Year round";
  return months.map(m => MONTH_LABELS[m - 1]).filter(Boolean).join(", ");
};
