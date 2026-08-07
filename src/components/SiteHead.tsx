import { Helmet } from "react-helmet-async";
import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { useCmsPreview } from "@/hooks/useCmsPreview";
import { organizationSchema, webSiteSchema } from "@/lib/structuredData";
import JsonLd from "@/components/JsonLd";

/**
 * Applies the Website CMS settings (title, description, favicon, social tags) sitewide
 * plus sitewide Organization/WebSite structured data.
 *
 * Draft previewing:
 *  - `?cms_preview=draft` — admin-only in-app preview
 *  - `?preview_token=<uuid>` — shareable, expiring, revocable link (always noindex)
 */
const SiteHead = () => {
  const location = useLocation();
  const isDraftPreview = new URLSearchParams(location.search).get("cms_preview") === "draft";
  const { preview, isPreview } = useCmsPreview();
  const { settings: liveSettings } = useSiteSettings(isDraftPreview ? "draft" : "published");
  const settings = isPreview && preview ? preview.settings : liveSettings;
  const noindex = isDraftPreview || isPreview;

  useEffect(() => {
    if (!settings.favicon_url) return;
    let link = document.querySelector<HTMLLinkElement>("link[rel='icon']");
    if (!link) {
      link = document.createElement("link");
      link.rel = "icon";
      document.head.appendChild(link);
    }
    link.href = settings.favicon_url;
  }, [settings.favicon_url]);

  const url = `${(settings.base_url || "").replace(/\/$/, "")}${location.pathname}`;

  return (
    <>
      <Helmet>
        <title>{settings.site_title}</title>
        <meta name="description" content={settings.meta_description} />
        {settings.meta_keywords && <meta name="keywords" content={settings.meta_keywords} />}
        <meta property="og:title" content={settings.site_title} />
        <meta property="og:description" content={settings.meta_description} />
        <meta property="og:type" content="website" />
        {settings.base_url && <meta property="og:url" content={url} />}
        {settings.og_image_url && <meta property="og:image" content={settings.og_image_url} />}
        <meta name="twitter:card" content="summary_large_image" />
        {settings.twitter_handle && <meta name="twitter:site" content={settings.twitter_handle} />}
        {noindex && <meta name="robots" content="noindex, nofollow" />}
      </Helmet>
      <JsonLd data={[organizationSchema(settings), webSiteSchema(settings)]} />
      {isPreview && preview && (
        <div className="fixed bottom-3 left-3 z-[60] rounded-full bg-primary text-primary-foreground text-[11px] font-semibold px-3 py-1.5 shadow-lg">
          Draft preview{preview.label ? ` · ${preview.label}` : ""} · not indexed
        </div>
      )}
    </>
  );
};

export default SiteHead;
