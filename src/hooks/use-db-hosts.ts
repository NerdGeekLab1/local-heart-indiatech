import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface DbHost {
  id: string;
  name: string;
  city: string | null;
  bio: string | null;
  avatar_url: string | null;
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
    (async () => {
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, first_name, last_name, nationality, bio, avatar_url");

      const { data: roles } = await supabase
        .from("user_roles")
        .select("user_id")
        .eq("role", "host");

      const hostIds = new Set((roles ?? []).map(r => r.user_id));

      const { data: exps } = await supabase
        .from("experiences")
        .select("host_id, host_city")
        .eq("status", "approved");

      const expCounts = new Map<string, { count: number; city?: string }>();
      (exps ?? []).forEach(e => {
        if (!e.host_id) return;
        const cur = expCounts.get(e.host_id) ?? { count: 0 };
        cur.count += 1;
        if (e.host_city && !cur.city) cur.city = e.host_city;
        expCounts.set(e.host_id, cur);
      });

      const result: DbHost[] = (profiles ?? [])
        .filter(p => hostIds.has(p.id))
        .map(p => ({
          id: p.id,
          name: [p.first_name, p.last_name].filter(Boolean).join(" ") || "Host",
          city: expCounts.get(p.id)?.city ?? p.nationality ?? null,
          bio: p.bio,
          avatar_url: p.avatar_url,
          experiencesCount: expCounts.get(p.id)?.count ?? 0,
        }));

      if (!cancelled) {
        setHosts(result);
        setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  return { hosts, loading };
};
