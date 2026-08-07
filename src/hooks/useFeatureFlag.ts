import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export function useFeatureFlag(flagKey: string) {
  const { user } = useAuth();
  const [enabled, setEnabled] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      const { data: flag } = await supabase
        .from("feature_flags")
        .select("enabled_globally")
        .eq("flag_key", flagKey)
        .maybeSingle();
      if (flag?.enabled_globally) {
        if (active) { setEnabled(true); setLoading(false); }
        return;
      }
      if (!user) {
        if (active) { setEnabled(false); setLoading(false); }
        return;
      }
      const { data: grant } = await supabase
        .from("user_feature_flags")
        .select("id")
        .eq("user_id", user.id)
        .eq("flag_key", flagKey)
        .maybeSingle();
      if (active) { setEnabled(!!grant); setLoading(false); }
    })();
    return () => { active = false; };
  }, [flagKey, user]);

  return { enabled, loading };
}

export function useAllFeatureFlags() {
  const { user } = useAuth();
  const [flags, setFlags] = useState<Record<string, boolean>>({});

  useEffect(() => {
    (async () => {
      const { data: all } = await supabase.from("feature_flags").select("flag_key,enabled_globally");
      const map: Record<string, boolean> = {};
      (all ?? []).forEach((f: any) => { map[f.flag_key] = f.enabled_globally; });
      if (user) {
        const { data: grants } = await supabase
          .from("user_feature_flags").select("flag_key").eq("user_id", user.id);
        (grants ?? []).forEach((g: any) => { map[g.flag_key] = true; });
      }
      setFlags(map);
    })();
  }, [user]);

  return flags;
}
