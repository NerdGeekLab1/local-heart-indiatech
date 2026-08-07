import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Globe, Save, UploadCloud, History, RotateCcw, Eye, Download, Copy, FileCode2, Bot, Image as ImageIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import {
  SiteSettings, SITE_SETTINGS_DEFAULTS, normalizeSettings,
} from "@/hooks/useSiteSettings";
import CmsPreviewLinks from "@/components/admin/CmsPreviewLinks";
import { buildRobots, buildSitemap, downloadText, SitemapItem } from "@/lib/cmsSeo";

interface VersionRow {
  id: string;
  version: number;
  note: string | null;
  created_at: string;
  snapshot: unknown;
}

type Section = "branding" | "seo" | "contact" | "seofiles" | "share" | "history";

const TEXT_FIELDS: { key: keyof SiteSettings; label: string; hint?: string; area?: boolean; section: Section }[] = [
  { key: "site_title", label: "Website title", hint: "Shown in the browser tab and search results (<60 chars)", section: "seo" },
  { key: "meta_description", label: "Meta description", hint: "Under 160 characters", area: true, section: "seo" },
  { key: "meta_keywords", label: "Meta keywords", hint: "Comma separated", section: "seo" },
  { key: "base_url", label: "Canonical base URL", hint: "Used for sitemap.xml and og:url", section: "seo" },
  { key: "og_image_url", label: "Social preview image URL", section: "seo" },
  { key: "tagline", label: "Tagline", section: "branding" },
  { key: "favicon_url", label: "Favicon URL", hint: "e.g. /favicon.ico or a hosted .png", section: "branding" },
  { key: "logo_url", label: "Logo URL", section: "branding" },
  { key: "footer_note", label: "Footer note", area: true, section: "branding" },
  { key: "contact_email", label: "Contact email", section: "contact" },
  { key: "contact_phone", label: "Contact phone", section: "contact" },
  { key: "twitter_handle", label: "X / Twitter handle", section: "contact" },
  { key: "instagram_url", label: "Instagram URL", section: "contact" },
  { key: "youtube_url", label: "YouTube URL", section: "contact" },
];

const WebsiteCMSTab = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [rowId, setRowId] = useState<string | null>(null);
  const [version, setVersion] = useState(1);
  const [published, setPublished] = useState<SiteSettings>(SITE_SETTINGS_DEFAULTS);
  const [draft, setDraft] = useState<SiteSettings>(SITE_SETTINGS_DEFAULTS);
  const [versions, setVersions] = useState<VersionRow[]>([]);
  const [section, setSection] = useState<Section>("branding");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [dynamicEntries, setDynamicEntries] = useState<SitemapItem[]>([]);

  const load = async () => {
    setLoading(true);
    const [{ data: row }, { data: hist }] = await Promise.all([
      supabase.from("site_settings").select("*").limit(1).maybeSingle(),
      supabase.from("site_settings_versions").select("*").order("version", { ascending: false }).limit(25),
    ]);
    if (row) {
      setRowId(row.id);
      setVersion(row.version);
      setPublished(normalizeSettings(row.published));
      setDraft(normalizeSettings(row.draft && Object.keys(row.draft as object).length ? row.draft : row.published));
    }
    setVersions((hist ?? []) as VersionRow[]);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  // Dynamic sitemap entries come straight from CMS content
  useEffect(() => {
    (async () => {
      const entries: SitemapItem[] = [];
      if (draft.sitemap_include_blogs) {
        const { data } = await supabase.from("cms_blogs").select("slug,updated_at").eq("is_published", true);
        (data ?? []).forEach(b => entries.push({ path: `/blog/${b.slug}`, lastmod: b.updated_at, changefreq: "monthly", priority: "0.7" }));
      }
      if (draft.sitemap_include_stories) {
        const { data } = await supabase.from("cms_stories").select("slug,updated_at").eq("is_published", true);
        (data ?? []).forEach(s => entries.push({ path: `/community?story=${s.slug}`, lastmod: s.updated_at, changefreq: "monthly", priority: "0.6" }));
      }
      setDynamicEntries(entries);
    })();
  }, [draft.sitemap_include_blogs, draft.sitemap_include_stories]);

  const dirty = JSON.stringify(draft) !== JSON.stringify(published);

  const saveDraft = async () => {
    if (!rowId) return;
    setBusy(true);
    const { error } = await supabase.from("site_settings").update({ draft: draft as never }).eq("id", rowId);
    setBusy(false);
    toast(error
      ? { title: "Could not save draft", description: error.message, variant: "destructive" }
      : { title: "Draft saved", description: "Preview it with ?cms_preview=draft on any page." });
  };

  const publish = async () => {
    if (!rowId) return;
    setBusy(true);
    const nextVersion = version + 1;
    const { error } = await supabase.from("site_settings").update({
      published: draft as never,
      draft: draft as never,
      version: nextVersion,
      published_at: new Date().toISOString(),
      published_by: user?.id ?? null,
    }).eq("id", rowId);
    if (!error) {
      await supabase.from("site_settings_versions").insert({
        version: nextVersion,
        snapshot: draft as never,
        note: "Published from Website CMS",
        created_by: user?.id ?? null,
      });
    }
    setBusy(false);
    if (error) toast({ title: "Publish failed", description: error.message, variant: "destructive" });
    else { toast({ title: `Published v${nextVersion}` }); load(); }
  };

  const rollback = async (v: VersionRow) => {
    setDraft(normalizeSettings(v.snapshot));
    setSection("branding");
    toast({ title: `Loaded v${v.version} into draft`, description: "Review, then publish to make it live." });
  };

  const sitemap = buildSitemap(draft, dynamicEntries);
  const robots = buildRobots(draft);

  const copy = async (label: string, text: string) => {
    await navigator.clipboard.writeText(text);
    toast({ title: `${label} copied` });
  };

  const set = <K extends keyof SiteSettings>(key: K, value: SiteSettings[K]) =>
    setDraft(p => ({ ...p, [key]: value }));

  const sections: { id: Section; label: string; icon: typeof Globe }[] = [
    { id: "branding", label: "Branding", icon: ImageIcon },
    { id: "seo", label: "SEO & Meta", icon: Globe },
    { id: "contact", label: "Contact & Social", icon: FileCode2 },
    { id: "seofiles", label: "Sitemap & Robots", icon: Bot },
    { id: "share", label: "Share Preview", icon: Eye },
    { id: "history", label: "Version History", icon: History },
  ];

  if (loading) return <div className="mt-6 text-center py-12 text-muted-foreground">Loading Website CMS…</div>;

  return (
    <div className="mt-6 space-y-5">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            <Globe className="w-5 h-5 text-primary" /> Website CMS
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-secondary text-muted-foreground">v{version} live</span>
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Edit the site title, favicon, logo, SEO metadata and crawl files. Changes stay in draft until you publish.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" className="rounded-full gap-2" asChild>
            <a href="/?cms_preview=draft" target="_blank" rel="noreferrer"><Eye className="w-4 h-4" /> Preview draft</a>
          </Button>
          <Button variant="outline" size="sm" className="rounded-full gap-2" disabled={busy} onClick={saveDraft}>
            <Save className="w-4 h-4" /> Save draft
          </Button>
          <Button size="sm" className="rounded-full gap-2" disabled={busy} onClick={publish}>
            <UploadCloud className="w-4 h-4" /> Publish
          </Button>
        </div>
      </div>

      {dirty && (
        <div className="rounded-lg border border-primary/30 bg-primary/5 p-3 text-sm text-foreground flex items-center justify-between gap-3">
          <span>You have unpublished draft changes.</span>
          <Button variant="ghost" size="sm" className="gap-1.5" onClick={() => setDraft(published)}>
            <RotateCcw className="w-3.5 h-3.5" /> Discard
          </Button>
        </div>
      )}

      <div className="flex gap-1 overflow-x-auto border-b border-border pb-px">
        {sections.map(s => (
          <button key={s.id} onClick={() => setSection(s.id)}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium whitespace-nowrap rounded-t-lg transition-colors ${section === s.id ? "bg-card text-primary border-b-2 border-primary" : "text-muted-foreground hover:text-foreground"}`}>
            <s.icon className="w-4 h-4" /> {s.label}
          </button>
        ))}
      </div>

      {(section === "branding" || section === "seo" || section === "contact") && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
          className="rounded-lg bg-card p-5 shadow-card grid gap-4 sm:grid-cols-2">
          {TEXT_FIELDS.filter(f => f.section === section).map(f => (
            <div key={String(f.key)} className={f.area ? "sm:col-span-2" : ""}>
              <label className="text-sm font-medium text-foreground">{f.label}</label>
              {f.area ? (
                <Textarea className="mt-1" value={String(draft[f.key] ?? "")}
                  onChange={e => set(f.key, e.target.value as never)} />
              ) : (
                <Input className="mt-1" value={String(draft[f.key] ?? "")}
                  onChange={e => set(f.key, e.target.value as never)} />
              )}
              {f.hint && <p className="text-xs text-muted-foreground mt-1">{f.hint}</p>}
            </div>
          ))}
          {section === "seo" && (
            <div className="sm:col-span-2 rounded-lg bg-secondary/30 p-3">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Search preview</p>
              <p className="text-primary text-sm mt-1 truncate">{draft.site_title || "Untitled"}</p>
              <p className="text-[11px] text-accent">{draft.base_url}</p>
              <p className="text-xs text-muted-foreground line-clamp-2">{draft.meta_description}</p>
            </div>
          )}
        </motion.div>
      )}

      {section === "seofiles" && (
        <div className="space-y-4">
          <div className="rounded-lg bg-card p-5 shadow-card space-y-3">
            <h3 className="font-bold text-foreground">Crawl rules</h3>
            <label className="flex items-center gap-2 text-sm text-foreground cursor-pointer">
              <input type="checkbox" className="accent-primary" checked={draft.robots_allow_all}
                onChange={e => set("robots_allow_all", e.target.checked)} />
              Allow search engines to index the site
            </label>
            <div>
              <label className="text-sm font-medium text-foreground">Disallowed paths (comma separated)</label>
              <Input className="mt-1" value={draft.robots_disallowed_paths}
                onChange={e => set("robots_disallowed_paths", e.target.value)} />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">Extra robots.txt directives</label>
              <Textarea className="mt-1 font-mono text-xs" value={draft.robots_extra}
                onChange={e => set("robots_extra", e.target.value)} />
            </div>
            <div className="flex flex-wrap gap-4 pt-1">
              <label className="flex items-center gap-2 text-sm text-foreground cursor-pointer">
                <input type="checkbox" className="accent-primary" checked={draft.sitemap_include_blogs}
                  onChange={e => set("sitemap_include_blogs", e.target.checked)} />
                Include blog posts in sitemap
              </label>
              <label className="flex items-center gap-2 text-sm text-foreground cursor-pointer">
                <input type="checkbox" className="accent-primary" checked={draft.sitemap_include_stories}
                  onChange={e => set("sitemap_include_stories", e.target.checked)} />
                Include traveler stories in sitemap
              </label>
            </div>
          </div>

          {[
            { name: "sitemap.xml", text: sitemap, type: "application/xml" },
            { name: "robots.txt", text: robots, type: "text/plain" },
          ].map(file => (
            <div key={file.name} className="rounded-lg bg-card p-5 shadow-card space-y-2">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <h3 className="font-bold text-foreground font-mono text-sm">{file.name}</h3>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="rounded-full gap-1.5" onClick={() => copy(file.name, file.text)}>
                    <Copy className="w-3.5 h-3.5" /> Copy
                  </Button>
                  <Button size="sm" variant="outline" className="rounded-full gap-1.5"
                    onClick={() => downloadText(file.name, file.text, file.type)}>
                    <Download className="w-3.5 h-3.5" /> Download
                  </Button>
                </div>
              </div>
              <pre className="max-h-64 overflow-auto rounded-md bg-secondary/40 p-3 text-[11px] font-mono text-foreground whitespace-pre-wrap">{file.text}</pre>
            </div>
          ))}
          <p className="text-xs text-muted-foreground">
            Generated live from these settings plus published CMS content ({dynamicEntries.length} dynamic URLs). Download and drop into <code>public/</code> to ship them with the next deploy.
          </p>
        </div>
      )}

      {section === "share" && <CmsPreviewLinks baseUrl={draft.base_url} />}

      {section === "history" && (
        <div className="rounded-lg bg-card shadow-card overflow-hidden">
          {versions.length === 0 ? (
            <div className="p-8 text-center text-sm text-muted-foreground">No published versions yet.</div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-secondary/40 text-xs uppercase text-muted-foreground">
                <tr><th className="text-left p-3">Version</th><th className="text-left p-3">Title</th><th className="text-left p-3">Published</th><th className="text-right p-3">Actions</th></tr>
              </thead>
              <tbody className="divide-y divide-border">
                {versions.map(v => (
                  <tr key={v.id}>
                    <td className="p-3 font-semibold text-foreground">v{v.version}</td>
                    <td className="p-3 text-muted-foreground truncate max-w-[240px]">{normalizeSettings(v.snapshot).site_title}</td>
                    <td className="p-3 text-muted-foreground">{new Date(v.created_at).toLocaleString()}</td>
                    <td className="p-3 text-right">
                      <Button size="sm" variant="outline" className="rounded-full gap-1.5" onClick={() => rollback(v)}>
                        <RotateCcw className="w-3.5 h-3.5" /> Restore to draft
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
};

export default WebsiteCMSTab;
