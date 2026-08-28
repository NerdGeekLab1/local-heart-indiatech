import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface DestinationRow {
  id: string;
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
  itinerary: ItineraryDay[];
  latitude: number | null;
  longitude: number | null;
  is_published: boolean;
  sort_order: number;
}

export interface ItineraryDay {
  title: string;
  places: string[];
}

export interface DestinationSite {
  id: string;
  destination_id: string;
  name: string;
  type: string;
  description: string;
  entry_fee: string | null;
  best_time: string | null;
  duration: string | null;
  latitude: number | null;
  longitude: number | null;
  image_url: string | null;
  sort_order: number;
  is_published?: boolean;
}

export interface DestinationDraft {
  id: string;
  destination_id: string;
  site_id: string | null;
  payload: Record<string, any>;
  note: string | null;
  updated_at: string;
}


export interface DestinationHost {
  id: string;
  username: string | null;
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
  tagline: string | null;
  services: string[] | null;
  price_per_day: number | null;
  verification_status: string | null;
}

export interface DestinationExperience {
  id: string;
  title: string;
  category: string;
  image_url: string | null;
  price: number;
  duration: string | null;
  location: string | null;
  host_name: string | null;
  rating: number | null;
  review_count: number | null;
}

export interface DestinationDetail {
  destination: DestinationRow;
  sites: DestinationSite[];
  host_count: number;
  hosts: DestinationHost[];
  experiences: DestinationExperience[];
}

/** Public destination page data (destination + sites + live hosts/experiences). */
export function useDestinationDetail(identifier?: string) {
  return useQuery({
    queryKey: ["destination-public", identifier?.toLowerCase()],
    enabled: !!identifier,
    queryFn: async (): Promise<DestinationDetail | null> => {
      const { data, error } = await supabase.rpc("get_destination_public", { _identifier: identifier! });
      if (error) throw error;
      return (data as unknown as DestinationDetail) ?? null;
    },
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
}

export interface PublicDestination extends DestinationRow {
  sites: DestinationSite[];
}

/** Published destinations with their sites, for the public /destinations directory. */
export function usePublicDestinations() {
  return useQuery({
    queryKey: ["public-destinations"],
    queryFn: async (): Promise<PublicDestination[]> => {
      const [{ data: rows, error }, { data: siteRows, error: siteError }] = await Promise.all([
        supabase
          .from("destinations")
          .select("*")
          .eq("is_published", true)
          .order("sort_order", { ascending: true })
          .order("name", { ascending: true }),
        supabase
          .from("destination_sites")
          .select("*")
          .order("sort_order", { ascending: true }),
      ]);
      if (error) throw error;
      if (siteError) throw siteError;

      const byDestination = new Map<string, DestinationSite[]>();
      for (const site of (siteRows || []) as unknown as DestinationSite[]) {
        const list = byDestination.get(site.destination_id) || [];
        list.push(site);
        byDestination.set(site.destination_id, list);
      }
      return ((rows || []) as unknown as DestinationRow[]).map(d => ({
        ...d,
        sites: byDestination.get(d.id) || [],
      }));
    },
    staleTime: 5 * 60 * 1000,
  });
}

/** Admin list of every destination row (published or not). */

export function useAdminDestinations() {
  return useQuery({
    queryKey: ["admin-destinations"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("destinations")
        .select("*")
        .order("sort_order", { ascending: true })
        .order("name", { ascending: true });
      if (error) throw error;
      return (data || []) as unknown as DestinationRow[];
    },
    staleTime: 60 * 1000,
  });
}

export function useDestinationSites(destinationId?: string) {
  return useQuery({
    queryKey: ["destination-sites", destinationId],
    enabled: !!destinationId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("destination_sites")
        .select("*")
        .eq("destination_id", destinationId!)
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return (data || []) as unknown as DestinationSite[];
    },
    staleTime: 30 * 1000,
  });
}

export const slugify = (value: string) =>
  value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

/** Staged (unpublished) edits for a destination and its sites — admin only. */
export function useDestinationDrafts(destinationId?: string) {
  return useQuery({
    queryKey: ["destination-drafts", destinationId],
    enabled: !!destinationId,
    queryFn: async (): Promise<DestinationDraft[]> => {
      const { data, error } = await supabase
        .from("destination_drafts")
        .select("*")
        .eq("destination_id", destinationId!);
      if (error) throw error;
      return (data || []) as unknown as DestinationDraft[];
    },
    staleTime: 15 * 1000,
  });
}

/** Count of destinations that currently have unpublished drafts. */
export function useAllDestinationDrafts() {
  return useQuery({
    queryKey: ["destination-drafts-all"],
    queryFn: async (): Promise<DestinationDraft[]> => {
      const { data, error } = await supabase.from("destination_drafts").select("*");
      if (error) return [];
      return (data || []) as unknown as DestinationDraft[];
    },
    staleTime: 30 * 1000,
  });
}

/** Every site row across all destinations — powers the admin import QA screen. */
export function useAllDestinationSites() {
  return useQuery({
    queryKey: ["admin-destination-sites"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("destination_sites")
        .select("*")
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return (data || []) as unknown as DestinationSite[];
    },
    staleTime: 60 * 1000,
  });
}

export interface DestinationPreview {
  destination: DestinationRow;
  sites: DestinationSite[];
  hasDraft: boolean;
}

/**
 * Admin-only draft preview of a destination: reads the live row plus any staged
 * draft payloads and merges them, so the public page can be reviewed before publishing.
 */
export function useDestinationPreview(identifier?: string, enabled = false) {
  return useQuery({
    queryKey: ["destination-preview", identifier?.toLowerCase()],
    enabled: !!identifier && enabled,
    queryFn: async (): Promise<DestinationPreview | null> => {
      const ident = identifier!;
      const { data: rows } = await supabase
        .from("destinations")
        .select("*")
        .or(`slug.eq.${slugify(ident)},name.ilike.${ident}`)
        .limit(1);
      const row = (rows || [])[0] as unknown as DestinationRow | undefined;
      if (!row) return null;
      const [{ data: siteRows }, { data: drafts }] = await Promise.all([
        supabase.from("destination_sites").select("*").eq("destination_id", row.id).order("sort_order", { ascending: true }),
        supabase.from("destination_drafts").select("*").eq("destination_id", row.id),
      ]);
      const draftList = (drafts || []) as unknown as DestinationDraft[];
      const destDraft = draftList.find(d => !d.site_id);
      const merged = { ...row, ...(destDraft?.payload || {}) } as DestinationRow;
      const sites = ((siteRows || []) as unknown as DestinationSite[]).map(s => {
        const d = draftList.find(x => x.site_id === s.id);
        return d ? ({ ...s, ...d.payload } as DestinationSite) : s;
      });
      return { destination: merged, sites, hasDraft: draftList.length > 0 };
    },
    staleTime: 0,
  });
}
