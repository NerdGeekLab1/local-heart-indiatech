import { Helmet } from "react-helmet-async";
import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useSiteSettings } from "@/hooks/useSiteSettings";

/**
 * Applies the Website CMS settings (title, description, favicon, social tags)
 * sitewide. Append ?cms_preview=draft to any URL to preview unpublished drafts.
 */
const SiteHead = () => {
  const location = useLocation();
  const isDraftPreview = new URLSearchParams(location.search).get("cms_preview") === "draft";
  const { settings } = useSiteSettings(isDraftPreview ? "draft" : "published");

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
      {isDraftPreview && <meta name="robots" content="noindex" />}
    </Helmet>
  );
};

export default SiteHead;
