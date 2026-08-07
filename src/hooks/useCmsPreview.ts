import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { normalizeSettings, SiteSettings } from "@/hooks/useSiteSettings";

export interface CmsPreviewPayload {
  valid: boolean;
  label?: string | null;
  expires_at?: string;
  settings: SiteSettings;
  blogs: Record<string, any>[];
  stories: Record<string, any>[];
  tips: Record<string, any>[];
  channels: Record<string, any>[];
}

export const PREVIEW_PARAM = "preview_token";

/** Reads a shareable preview token from the URL (?preview_token=…) or the current session. */
export const usePreviewToken = () => {
  const location = useLocation();
  const fromUrl = new URLSearchParams(location.search).get(PREVIEW_PARAM);
  const [token, setToken] = useState<string | null>(
    fromUrl || sessionStorage.getItem(PREVIEW_PARAM),
  );

  useEffect(() => {
    if (fromUrl) {
      sessionStorage.setItem(PREVIEW_PARAM, fromUrl);
      setToken(fromUrl);
    }
  }, [fromUrl]);

  return token;
};

/**
 * Resolves a shareable draft-preview token through a secure token-gated RPC.
 * Unpublished content is never exposed without a valid, unexpired, unrevoked token.
 */
export const useCmsPreview = () => {
  const token = usePreviewToken();
  const [payload, setPayload] = useState<CmsPreviewPayload | null>(null);
  const [loading, setLoading] = useState(!!token);

  useEffect(() => {
    if (!token) { setPayload(null); setLoading(false); return; }
    let cancelled = false;
    (async () => {
      setLoading(true);
      const { data, error } = await supabase.rpc("resolve_cms_preview", { _token: token });
      if (cancelled) return;
      const raw = (data ?? {}) as Record<string, any>;
      if (error || !raw.valid) {
        sessionStorage.removeItem(PREVIEW_PARAM);
        setPayload(null);
      } else {
        setPayload({
          valid: true,
          label: raw.label ?? null,
          expires_at: raw.expires_at,
          settings: normalizeSettings(raw.settings),
          blogs: raw.blogs ?? [],
          stories: raw.stories ?? [],
          tips: raw.tips ?? [],
          channels: raw.channels ?? [],
        });
      }
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [token]);

  return { token, preview: payload, isPreview: !!payload?.valid, loading };
};
