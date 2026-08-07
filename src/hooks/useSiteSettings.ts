import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface SiteSettings {
  site_title: string;
  tagline: string;
  meta_description: string;
  meta_keywords: string;
  favicon_url: string;
  logo_url: string;
  og_image_url: string;
  base_url: string;
  twitter_handle: string;
  instagram_url: string;
  youtube_url: string;
  contact_email: string;
  contact_phone: string;
  footer_note: string;
  robots_allow_all: boolean;
  robots_disallowed_paths: string;
  robots_extra: string;
  sitemap_include_blogs: boolean;
  sitemap_include_stories: boolean;
}

export const SITE_SETTINGS_DEFAULTS: SiteSettings = {
  site_title: "Travelista — Authentic India, hosted by locals",
  tagline: "Travel India like a local",
  meta_description:
    "Discover India through local hosts: curated trips, homestays, food experiences and traveler stories.",
  meta_keywords: "India travel, local hosts, homestays, trips, experiences",
  favicon_url: "/favicon.ico",
  logo_url: "",
  og_image_url: "",
  base_url: "https://local-heart-indiatech.lovable.app",
  twitter_handle: "",
  instagram_url: "",
  youtube_url: "",
  contact_email: "",
  contact_phone: "",
  footer_note: "",
  robots_allow_all: true,
  robots_disallowed_paths: "/admin,/dashboard",
  robots_extra: "",
  sitemap_include_blogs: true,
  sitemap_include_stories: true,
};

export const normalizeSettings = (raw: unknown): SiteSettings => ({
  ...SITE_SETTINGS_DEFAULTS,
  ...((raw && typeof raw === "object" ? raw : {}) as Partial<SiteSettings>),
});

export interface SiteSettingsRow {
  id: string;
  published: SiteSettings;
  draft: SiteSettings;
  version: number;
  published_at: string | null;
  updated_at: string;
}

/** Reads the live (published) website settings. Pass `draft` to preview unpublished changes. */
export const useSiteSettings = (mode: "published" | "draft" = "published") => {
  const [settings, setSettings] = useState<SiteSettings>(SITE_SETTINGS_DEFAULTS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from("site_settings")
        .select("published,draft")
        .limit(1)
        .maybeSingle();
      if (cancelled) return;
      if (data) {
        const raw = mode === "draft" ? data.draft : data.published;
        setSettings(normalizeSettings(raw));
      }
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [mode]);

  return { settings, loading };
};
