import type { SiteSettings } from "@/hooks/useSiteSettings";

/** Strips HTML so rich-text bodies can be reused in meta/JSON-LD text fields. */
export const stripHtml = (html: string) =>
  html
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();

/** Word-count based reading time, e.g. "6 min". */
export const readingTime = (text: string) => {
  const words = stripHtml(text || "").split(" ").filter(Boolean).length;
  return `${Math.max(1, Math.round(words / 200))} min`;
};

const base = (settings: SiteSettings) => (settings.base_url || "").replace(/\/$/, "");

export const organizationSchema = (settings: SiteSettings) => {
  const sameAs = [settings.instagram_url, settings.youtube_url, settings.twitter_handle ? `https://x.com/${settings.twitter_handle.replace(/^@/, "")}` : ""].filter(Boolean);
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: settings.site_title?.split("—")[0].trim() || "Travelista",
    url: base(settings) || undefined,
    description: settings.meta_description || undefined,
    logo: settings.logo_url || undefined,
    ...(sameAs.length ? { sameAs } : {}),
    ...(settings.contact_email || settings.contact_phone
      ? {
          contactPoint: {
            "@type": "ContactPoint",
            contactType: "customer support",
            email: settings.contact_email || undefined,
            telephone: settings.contact_phone || undefined,
          },
        }
      : {}),
  };
};

export const webSiteSchema = (settings: SiteSettings) => ({
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: settings.site_title || "Travelista",
  url: base(settings) || undefined,
  ...(base(settings)
    ? {
        potentialAction: {
          "@type": "SearchAction",
          target: `${base(settings)}/experiences?q={search_term_string}`,
          "query-input": "required name=search_term_string",
        },
      }
    : {}),
});

export interface ArticleInput {
  title: string;
  description?: string;
  body?: string;
  image?: string;
  author?: string;
  category?: string;
  tags?: string[];
  datePublished?: string;
  dateModified?: string;
  path: string;
}

export const articleSchema = (settings: SiteSettings, a: ArticleInput) => ({
  "@context": "https://schema.org",
  "@type": "Article",
  headline: a.title,
  description: a.description || stripHtml(a.body || "").slice(0, 200) || undefined,
  image: a.image ? [a.image.startsWith("http") ? a.image : `${base(settings)}${a.image}`] : undefined,
  articleSection: a.category || undefined,
  keywords: a.tags?.length ? a.tags.join(", ") : undefined,
  datePublished: a.datePublished || undefined,
  dateModified: a.dateModified || a.datePublished || undefined,
  wordCount: a.body ? stripHtml(a.body).split(" ").filter(Boolean).length : undefined,
  author: { "@type": "Person", name: a.author || "Travelista Editorial" },
  publisher: organizationSchema(settings),
  mainEntityOfPage: { "@type": "WebPage", "@id": `${base(settings)}${a.path}` },
});

export const breadcrumbSchema = (
  settings: SiteSettings,
  crumbs: { label: string; href?: string }[],
) => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [{ label: "Home", href: "/" }, ...crumbs].map((c, i) => ({
    "@type": "ListItem",
    position: i + 1,
    name: c.label,
    ...(c.href ? { item: `${base(settings)}${c.href}` } : {}),
  })),
});
