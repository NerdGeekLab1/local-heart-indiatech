import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export type PlatformSettings = {
  id?: string;
  gst_percent: number;
  platform_fee_percent: number;
  handling_charge: number;
  verification_min_profile_score: number;
  verification_min_listings: number;
  verification_min_completed_bookings: number;
  verification_min_rating: number;
  verification_auto_approve: boolean;
  verification_applications_enabled: boolean;
};

export const defaultPlatformSettings: PlatformSettings = {
  gst_percent: 18,
  platform_fee_percent: 5,
  handling_charge: 49,
  verification_min_profile_score: 80,
  verification_min_listings: 1,
  verification_min_completed_bookings: 3,
  verification_min_rating: 4.5,
  verification_auto_approve: false,
  verification_applications_enabled: true,
};

/** Reads the single platform settings row (fees, GST and verification milestones). */
export function usePlatformSettings() {
  const [settings, setSettings] = useState<PlatformSettings>(defaultPlatformSettings);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const { data } = await supabase.from("platform_settings").select("*").limit(1).maybeSingle();
    if (data) {
      setSettings(current => ({
        ...current,
        ...data,
        gst_percent: Number(data.gst_percent ?? current.gst_percent),
        platform_fee_percent: Number(data.platform_fee_percent ?? current.platform_fee_percent),
        handling_charge: Number(data.handling_charge ?? current.handling_charge),
        verification_min_rating: Number(data.verification_min_rating ?? current.verification_min_rating),
      }));
    }
    setLoading(false);
  }, []);

  useEffect(() => { void load(); }, [load]);

  return { settings, setSettings, loading, reload: load };
}
