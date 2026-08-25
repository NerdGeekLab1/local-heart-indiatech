import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Eye, Plus, Pencil, Globe, EyeOff, Check, X, Loader2, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import EditDialog, { type FieldConfig } from "@/components/EditDialog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { MONTH_LABELS } from "@/hooks/useExperienceCatalog";

const CATEGORIES = ["Stay", "Food", "Adventure", "Wedding", "Festival", "Spiritual", "Wellness", "Culture", "Transport"];
const OCCASIONS = ["wedding", "festival", "harvest", "pilgrimage", "seasonal"];
const DIFFICULTY = ["Easy", "Moderate", "Challenging", "Extreme"];

const slugify = (v: string) => v.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const toArray = (v: any) => Array.isArray(v) ? v : String(v ?? "").split(",").map(s => s.trim()).filter(Boolean);
const toMonths = (v: any) => (Array.isArray(v) ? v : String(v ?? "").split(",")).map((m: any) => {
  const n = Number(String(m).trim());
  if (n >= 1 && n <= 12) return n;
  const idx = MONTH_LABELS.findIndex(l => l.toLowerCase() === String(m).trim().slice(0, 3).toLowerCase());
  return idx >= 0 ? idx + 1 : null;
}).filter(Boolean) as number[];

const fields: FieldConfig[] = [
  { key: "title", label: "Title", required: true, placeholder: "Village Homestay" },
  { key: "slug", label: "Slug", hint: "Auto-filled from the title when left blank", placeholder: "village-homestay" },
  { key: "category", label: "Category", type: "select", options: CATEGORIES, allowCustom: true, required: true },
  { key: "sub_category", label: "Sub category", placeholder: "Homestay" },
  { key: "summary", label: "Summary", type: "textarea", required: true, hint: "One or two lines shown on cards and in search results" },
  { key: "description", label: "Generic description", type: "textarea", full: true, hint: "The admin-owned story of this experience type. Hosts add their own specifics." },
  { key: "includes", label: "Typically included", type: "tags", placeholder: "All meals, Village walk, Private room" },
  { key: "highlights", label: "Highlights", type: "tags", placeholder: "Farm mornings, Home cooking" },
  { key: "hero_image_url", label: "Hero image URL", type: "url" },
  { key: "typical_duration", label: "Typical duration", placeholder: "1-3 nights" },
  { key: "difficulty", label: "Difficulty", type: "select", options: DIFFICULTY, allowCustom: true },
  { key: "price_min", label: "Indicative price min (₹)", type: "number" },
  { key: "price_max", label: "Indicative price max (₹)", type: "number" },
  { key: "season_months", label: "Season months", type: "tags", placeholder: "Oct, Nov, Dec, Jan", hint: "Month names or numbers 1-12" },
  { key: "season_label", label: "Season label", placeholder: "Cool season (Oct–Mar)" },
  { key: "occasion_type", label: "Occasion type", type: "select", options: OCCASIONS, allowCustom: true, hint: "Set for date-driven experiences like weddings" },
  { key: "sort_order", label: "Sort order", type: "number" },
  { key: "is_featured", label: "Featured", type: "checkbox", hint: "Show first on the experience types page" },
];

/** Admin ownership of the generic experience catalog plus the host offering approval queue. */
const ExperienceCatalogTab = () => {
  const { toast } = useToast();
  const [rows, setRows] = useState<any[]>([]);
  const [offerings, setOfferings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<any | null>(null);
  const [creating, setCreating] = useState(false);
  const [q, setQ] = useState("");

  const load = useCallback(async () => {
    const [c, o] = await Promise.all([
      (supabase as any).from("experience_catalog").select("*").order("sort_order"),
      (supabase as any).from("catalog_host_offerings")
        .select("*, experience_catalog(title, slug), profiles!catalog_host_offerings_host_id_fkey(first_name, last_name, username)")
        .order("created_at", { ascending: false }),
    ]);
    setRows(c.data ?? []);
    setOfferings(o.data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { void load(); }, [load]);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return rows.filter(r => !needle || `${r.title} ${r.category} ${r.slug}`.toLowerCase().includes(needle));
  }, [rows, q]);

  const save = async (data: Record<string, any>) => {
    const payload = {
      title: data.title,
      slug: data.slug?.trim() ? slugify(data.slug) : slugify(data.title),
      category: data.category,
      sub_category: data.sub_category || null,
      summary: data.summary || "",
      description: data.description || "",
      includes: toArray(data.includes),
      highlights: toArray(data.highlights),
      hero_image_url: data.hero_image_url || null,
      typical_duration: data.typical_duration || null,
      difficulty: data.difficulty || null,
      price_min: Number(data.price_min) || 0,
      price_max: Number(data.price_max) || 0,
      season_months: toMonths(data.season_months),
      season_label: data.season_label || null,
      occasion_type: data.occasion_type || null,
      sort_order: Number(data.sort_order) || 0,
      is_featured: !!data.is_featured,
    };
    const res = editing?.id
      ? await (supabase as any).from("experience_catalog").update(payload).eq("id", editing.id)
      : await (supabase as any).from("experience_catalog").insert({ ...payload, status: "draft" });
    if (res.error) { toast({ title: "Couldn't save", description: res.error.message, variant: "destructive" }); return; }
    toast({ title: editing?.id ? "Experience updated" : "Experience created (draft)" });
    setEditing(null); setCreating(false);
    void load();
  };

  const setStatus = async (row: any, status: string) => {
    const { error } = await (supabase as any).from("experience_catalog")
      .update({ status, reviewed_at: new Date().toISOString() }).eq("id", row.id);
    if (error) { toast({ title: "Couldn't update", description: error.message, variant: "destructive" }); return; }
    toast({ title: status === "published" ? "Published to the public site" : `Marked ${status}` });
    void load();
  };

  const reviewOffering = async (row: any, status: "approved" | "rejected") => {
    const { error } = await (supabase as any).from("catalog_host_offerings").update({ status }).eq("id", row.id);
    if (error) { toast({ title: "Couldn't update", description: error.message, variant: "destructive" }); return; }
    toast({ title: `Host offering ${status}` });
    void load();
  };

  const pending = offerings.filter(o => o.status === "pending");

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-foreground">Experience catalog</h2>
          <p className="text-sm text-muted-foreground">
            Generic, admin-owned experience definitions. Hosts attach their own pricing and details; visitors see the generic page without host identities until they sign in.
          </p>
        </div>
        <div className="flex gap-2">
          <Input value={q} onChange={e => setQ(e.target.value)} placeholder="Search catalog…" className="w-44" />
          <Button size="sm" className="rounded-full gap-1.5" onClick={() => { setEditing(null); setCreating(true); }}>
            <Plus className="h-4 w-4" /> New experience
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center gap-2 p-8 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" /> Loading catalog…</div>
      ) : (
        <div className="overflow-x-auto rounded-2xl bg-card shadow-card">
          <table className="w-full text-sm">
            <thead className="bg-secondary/60 text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-4 py-3 text-left">Experience</th>
                <th className="px-4 py-3 text-left">Category</th>
                <th className="px-4 py-3 text-left">Season</th>
                <th className="px-4 py-3 text-left">Hosts</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(row => {
                const hostCount = offerings.filter(o => o.catalog_id === row.id && o.status === "approved").length;
                return (
                  <tr key={row.id} className="border-t border-border">
                    <td className="px-4 py-3">
                      <p className="font-medium text-foreground">{row.title}</p>
                      <p className="text-xs text-muted-foreground">/{row.slug}</p>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{row.category}{row.occasion_type ? ` · ${row.occasion_type}` : ""}</td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{row.season_label || (row.season_months?.length ? row.season_months.map((m: number) => MONTH_LABELS[m - 1]).join(", ") : "Year round")}</td>
                    <td className="px-4 py-3 text-muted-foreground"><span className="inline-flex items-center gap-1"><Users className="h-3.5 w-3.5" />{hostCount}</span></td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${row.status === "published" ? "bg-primary/10 text-primary" : row.status === "pending" ? "bg-accent/15 text-accent" : "bg-secondary text-muted-foreground"}`}>
                        {row.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1.5">
                        <Button asChild size="sm" variant="ghost" className="h-8 gap-1 rounded-full text-xs">
                          <Link to={`/experience-type/${row.slug}`} target="_blank" rel="noreferrer"><Eye className="h-3.5 w-3.5" /> Preview</Link>
                        </Button>
                        <Button size="sm" variant="outline" className="h-8 gap-1 rounded-full text-xs" onClick={() => { setCreating(false); setEditing(row); }}>
                          <Pencil className="h-3.5 w-3.5" /> Edit
                        </Button>
                        {row.status === "published" ? (
                          <Button size="sm" variant="ghost" className="h-8 gap-1 rounded-full text-xs" onClick={() => setStatus(row, "draft")}>
                            <EyeOff className="h-3.5 w-3.5" /> Unpublish
                          </Button>
                        ) : (
                          <Button size="sm" className="h-8 gap-1 rounded-full text-xs" onClick={() => setStatus(row, "published")}>
                            <Globe className="h-3.5 w-3.5" /> Publish
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr><td colSpan={6} className="px-4 py-10 text-center text-muted-foreground">No catalog entries yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <div>
        <h3 className="text-lg font-bold text-foreground">Host offerings awaiting review ({pending.length})</h3>
        <p className="text-sm text-muted-foreground">Host-specific pricing and details mapped onto a catalog experience.</p>
        <div className="mt-3 space-y-2">
          {pending.length === 0 && <p className="rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">Nothing pending.</p>}
          {pending.map(o => (
            <div key={o.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-card p-4 shadow-card">
              <div>
                <p className="font-medium text-foreground">{o.experience_catalog?.title} — {o.headline || "Untitled offering"}</p>
                <p className="text-xs text-muted-foreground">
                  {[o.profiles ? `${o.profiles.first_name ?? ""} ${o.profiles.last_name ?? ""}`.trim() || o.profiles.username : "Host", o.city, `₹${o.price} ${String(o.price_unit || "").replace(/_/g, " ")}`, `up to ${o.max_guests}`].filter(Boolean).join(" · ")}
                </p>
                {o.host_notes && <p className="mt-1 max-w-2xl text-sm text-muted-foreground">{o.host_notes}</p>}
              </div>
              <div className="flex gap-2">
                <Button size="sm" className="rounded-full gap-1" onClick={() => reviewOffering(o, "approved")}><Check className="h-3.5 w-3.5" /> Approve</Button>
                <Button size="sm" variant="destructive" className="rounded-full gap-1" onClick={() => reviewOffering(o, "rejected")}><X className="h-3.5 w-3.5" /> Reject</Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <EditDialog
        open={creating || !!editing}
        onClose={() => { setCreating(false); setEditing(null); }}
        title={editing ? `Edit ${editing.title}` : "New catalog experience"}
        description="Generic details only — hosts add city, price and availability from their dashboard."
        wide
        fields={fields}
        initialData={editing ? {
          ...editing,
          includes: (editing.includes ?? []).join(", "),
          highlights: (editing.highlights ?? []).join(", "),
          season_months: (editing.season_months ?? []).map((m: number) => MONTH_LABELS[m - 1]).join(", "),
        } : undefined}
        onSave={save}
      />
    </div>
  );
};

export default ExperienceCatalogTab;
