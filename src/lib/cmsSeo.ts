import type { SiteSettings } from "@/hooks/useSiteSettings";

export interface SitemapItem {
  path: string;
  lastmod?: string | null;
  changefreq?: string;
  priority?: string;
}

/** Static, publicly indexable routes of the app. */
export const STATIC_ROUTES: SitemapItem[] = [
  { path: "/", changefreq: "weekly", priority: "1.0" },
  { path: "/destinations", changefreq: "weekly", priority: "0.9" },
  { path: "/experiences", changefreq: "weekly", priority: "0.9" },
  { path: "/trips", changefreq: "weekly", priority: "0.9" },
  { path: "/explore", changefreq: "weekly", priority: "0.8" },
  { path: "/community", changefreq: "weekly", priority: "0.8" },
  { path: "/feed", changefreq: "daily", priority: "0.8" },
  { path: "/beta-wanderers", changefreq: "monthly", priority: "0.7" },
  { path: "/beta-waitlist", changefreq: "monthly", priority: "0.7" },
  { path: "/membership", changefreq: "monthly", priority: "0.7" },
  { path: "/resources", changefreq: "monthly", priority: "0.6" },
  { path: "/help-center", changefreq: "monthly", priority: "0.6" },
  { path: "/safety", changefreq: "yearly", priority: "0.5" },
  { path: "/become-host", changefreq: "monthly", priority: "0.7" },
  { path: "/terms", changefreq: "yearly", priority: "0.3" },
  { path: "/privacy", changefreq: "yearly", priority: "0.3" },
  { path: "/cookies", changefreq: "yearly", priority: "0.3" },
];

export const buildSitemap = (settings: SiteSettings, dynamic: SitemapItem[] = []) => {
  const base = (settings.base_url || "").replace(/\/$/, "");
  const urls = [...STATIC_ROUTES, ...dynamic].map(e =>
    [
      "  <url>",
      `    <loc>${base}${e.path}</loc>`,
      e.lastmod ? `    <lastmod>${e.lastmod.slice(0, 10)}</lastmod>` : null,
      e.changefreq ? `    <changefreq>${e.changefreq}</changefreq>` : null,
      e.priority ? `    <priority>${e.priority}</priority>` : null,
      "  </url>",
    ]
      .filter(Boolean)
      .join("\n"),
  );
  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...urls,
    "</urlset>",
  ].join("\n");
};

export const buildRobots = (settings: SiteSettings) => {
  const base = (settings.base_url || "").replace(/\/$/, "");
  const lines: string[] = ["User-agent: *"];
  if (!settings.robots_allow_all) {
    lines.push("Disallow: /");
  } else {
    lines.push("Allow: /");
    (settings.robots_disallowed_paths || "")
      .split(",")
      .map(p => p.trim())
      .filter(Boolean)
      .forEach(p => lines.push(`Disallow: ${p.startsWith("/") ? p : `/${p}`}`));
  }
  if (settings.robots_extra?.trim()) lines.push("", settings.robots_extra.trim());
  if (base && settings.robots_allow_all) lines.push("", `Sitemap: ${base}/sitemap.xml`);
  return lines.join("\n") + "\n";
};

export const downloadText = (filename: string, text: string, type = "text/plain") => {
  const blob = new Blob([text], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
};

export const slugify = (s: string) =>
  s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
