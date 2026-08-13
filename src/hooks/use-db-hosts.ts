import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface DbHost {
  id: string;
  username: string | null;
  name: string;
  city: string | null;
  tagline: string | null;
  bio: string | null;
  avatar_url: string | null;
  services: string[];
  specialties: string[];
  pricePerDay: number;
  rating: number;
  reviewCount: number;
  experiencesCount: number;
}

/**
 * Fetches real hosts from the `profiles` table, joined with their approved experiences.
 * Drop-in replacement source for the mock `hosts` array in `lib/data.ts` for any
 * surface that only needs basic host directory info (id, name, city, avatar).
 */
export const useDbHosts = () => {
  const [hosts, setHosts] = useState<DbHost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      const { data, error } = await supabase.rpc("get_public_host_directory");
      if (error) {
        if (!cancelled) {
          setHosts([]);
          setLoading(false);
        }
        return;
      }
      const result: DbHost[] = (data ?? []).map((host) => ({
        id: host.id,
        username: host.username,
        name: host.full_name || "Host",
        city: host.city,
        tagline: host.tagline,
        bio: host.bio,
        avatar_url: host.avatar_url,
        services: host.services ?? [],
        specialties: host.specialties ?? [],
        pricePerDay: Number(host.price_per_day || 0),
        rating: Number(host.rating || 0),
        reviewCount: Number(host.review_count || 0),
        experiencesCount: Number(host.experiences_count || 0),
      }));

      if (!cancelled) {
        setHosts(result);
        setLoading(false);
      }
    };
    void load();
    const channel = supabase.channel("public-host-directory")
      .on("postgres_changes", { event: "*", schema: "public", table: "profiles" }, load)
      .on("postgres_changes", { event: "*", schema: "public", table: "experiences" }, load)
      .subscribe();
    return () => { cancelled = true; void supabase.removeChannel(channel); };
  }, []);

  return { hosts, loading };
};
