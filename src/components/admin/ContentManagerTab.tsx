import { useEffect, useMemo, useState } from "react";
import { Plus, Pencil, Trash2, Eye, EyeOff, Newspaper, BookOpen, Lightbulb, Hash, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import EditDialog, { FieldConfig } from "@/components/EditDialog";
import AdminPagination from "@/components/admin/AdminPagination";
import { slugify } from "@/lib/cmsSeo";
import { readingTime } from "@/lib/structuredData";

type Entity = "blogs" | "stories" | "tips" | "channels";

interface EntityConfig {
  id: Entity;
  table: "cms_blogs" | "cms_stories" | "cms_tips" | "cms_channels";
  label: string;
  icon: typeof Newspaper;
  titleKey: string;
  blurb: string;
  columns: { key: string; label: string }[];
  fields: FieldConfig[];
}

const BLOG_CATEGORIES = ["Travel Guide", "Industry Insights", "Adventure", "Food & Culture", "Wellness", "Culture", "Sustainability", "Festivals", "Budget Travel"];
const AUTHORS = ["Travelista Editorial", "Ravi S.", "Priya K.", "Deepak S.", "Kiran M.", "Arjun M.", "Community Contributor"];
const LOCATIONS = [
  "Jaipur, Rajasthan", "Udaipur, Rajasthan", "Jaisalmer, Rajasthan", "Varanasi, Uttar Pradesh", "Agra, Uttar Pradesh",
  "Rishikesh, Uttarakhand", "Alleppey, Kerala", "Munnar, Kerala", "Kochi, Kerala", "Goa", "Mumbai, Maharashtra",
  "Delhi", "Amritsar, Punjab", "Leh, Ladakh", "Spiti, Himachal Pradesh", "Shillong, Meghalaya", "Hampi, Karnataka",
];
const TIP_CATEGORIES = ["safety", "culture", "food", "transport", "packing", "money", "health"];
const CHANNEL_ICONS = ["Compass", "Utensils", "Mountain", "Heart", "Laptop", "Sparkles", "Camera", "Users", "Tent"];
const COLOR_TOKENS = ["text-primary", "text-accent", "text-destructive", "text-muted-foreground"];

const CONFIGS: EntityConfig[] = [
  {
    id: "blogs", table: "cms_blogs", label: "Blogs", icon: Newspaper, titleKey: "title",
    blurb: "Long-form editorial articles. Each published post gets Article structured data and a sitemap entry.",
    columns: [{ key: "title", label: "Title" }, { key: "category", label: "Category" }, { key: "author", label: "Author" }, { key: "read_time", label: "Read time" }],
    fields: [
      { key: "title", label: "Title", required: true, hint: "Aim for under 60 characters for search results" },
      { key: "slug", label: "URL slug", hint: "Leave blank to generate from the title" },
      { key: "category", label: "Category", type: "select", options: BLOG_CATEGORIES, allowCustom: true, required: true },
      { key: "author", label: "Author", type: "select", options: AUTHORS, allowCustom: true, required: true },
      { key: "read_time", label: "Read time", deriveFrom: "body", derive: readingTime, hint: "Auto-calculated from the body — override if you like" },
      { key: "image_url", label: "Cover image URL", type: "url" },
      { key: "tags", label: "Tags", type: "tags", placeholder: "Planning, Beginner, India 101" },
      { key: "excerpt", label: "Excerpt / meta description", type: "textarea", required: true, hint: "Under 160 characters — used for search snippets and social cards" },
      { key: "body", label: "Article body", type: "richtext", required: true },
      { key: "is_featured", label: "Feature on the blog hub", type: "checkbox", hint: "Show as a highlighted post" },
      { key: "sort_order", label: "Sort order", type: "number" },
    ],
  },
  {
    id: "stories", table: "cms_stories", label: "Traveler Stories", icon: BookOpen, titleKey: "title",
    blurb: "First-person traveler stories shown in the Community hub.",
    columns: [{ key: "title", label: "Title" }, { key: "location", label: "Location" }, { key: "author", label: "Traveler" }],
    fields: [
      { key: "title", label: "Story title", required: true },
      { key: "slug", label: "URL slug", hint: "Leave blank to generate from the title" },
      { key: "author", label: "Traveler name", required: true },
      { key: "location", label: "Location", type: "select", options: LOCATIONS, allowCustom: true, required: true },
      { key: "image_url", label: "Photo URL", type: "url" },
      { key: "video_url", label: "Video URL", type: "url", hint: "Optional MP4 / hosted video" },
      { key: "tags", label: "Tags", type: "tags", placeholder: "Kerala, Food, Homestay" },
      { key: "excerpt", label: "Pull quote / excerpt", type: "textarea", required: true },
      { key: "body", label: "Full story", type: "richtext", required: true },
      { key: "is_featured", label: "Feature this story", type: "checkbox" },
      { key: "sort_order", label: "Sort order", type: "number" },
    ],
  },
  {
    id: "tips", table: "cms_tips", label: "Travel Tips", icon: Lightbulb, titleKey: "title",
    blurb: "Short, practical tips grouped by category across the Community and Resources pages.",
    columns: [{ key: "title", label: "Tip" }, { key: "category", label: "Category" }],
    fields: [
      { key: "title", label: "Tip title", required: true },
      { key: "slug", label: "URL slug" },
      { key: "category", label: "Category", type: "select", options: TIP_CATEGORIES, allowCustom: true, required: true },
      { key: "icon", label: "Emoji icon", placeholder: "🌤️" },
      { key: "body", label: "Tip detail", type: "richtext", required: true },
      { key: "sort_order", label: "Sort order", type: "number" },
    ],
  },
  {
    id: "channels", table: "cms_channels", label: "Community Channels", icon: Hash, titleKey: "name",
    blurb: "Community groups listed on the Channels tab of /community.",
    columns: [{ key: "name", label: "Channel" }, { key: "member_count", label: "Members" }],
    fields: [
      { key: "name", label: "Channel name", required: true },
      { key: "slug", label: "URL slug" },
      { key: "icon", label: "Icon (lucide name)", type: "select", options: CHANNEL_ICONS, allowCustom: true },
      { key: "color", label: "Accent colour token", type: "select", options: COLOR_TOKENS },
      { key: "member_count", label: "Member count", type: "number" },
      { key: "external_url", label: "External join URL", type: "url" },
      { key: "description", label: "Description", type: "textarea", required: true },
      { key: "sort_order", label: "Sort order", type: "number" },
    ],
  },
];

const PAGE_SIZE = 10;

const ContentManagerTab = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [entity, setEntity] = useState<Entity>("blogs");
  const [rows, setRows] = useState<Record<string, any>[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [q, setQ] = useState("");
  const [editing, setEditing] = useState<Record<string, any> | null>(null);
  const [open, setOpen] = useState(false);

  const config = CONFIGS.find(c => c.id === entity)!;

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from(config.table)
      .select("*")
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: false });
    if (error) toast({ title: `Could not load ${config.label}`, description: error.message, variant: "destructive" });
    setRows((data ?? []) as Record<string, any>[]);
    setLoading(false);
  };

  useEffect(() => { setPage(0); load(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [entity]);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return rows;
    return rows.filter(r => JSON.stringify(r).toLowerCase().includes(term));
  }, [rows, q]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount - 1);
  const paged = filtered.slice(safePage * PAGE_SIZE, (safePage + 1) * PAGE_SIZE);
  const publishedCount = rows.filter(r => r.is_published).length;

  const save = async (data: Record<string, any>) => {
    const payload: Record<string, any> = { ...data };
    const title = payload[config.titleKey] ?? "";
    payload.slug = (payload.slug || slugify(String(title))) || `item-${Date.now()}`;

    config.fields.forEach(f => {
      if (f.type === "number") payload[f.key] = Number(payload[f.key] || 0);
      if (f.type === "checkbox") payload[f.key] = !!payload[f.key];
      if (f.type === "tags") {
        payload[f.key] = String(payload[f.key] || "").split(",").map(s => s.trim()).filter(Boolean);
      }
      if (payload[f.key] === "") payload[f.key] = null;
    });

    if (editing?.id) {
      const { id, created_at, updated_at, created_by, is_published, ...rest } = { ...editing, ...payload };
      const { error } = await supabase.from(config.table).update(rest as never).eq("id", editing.id);
      if (error) return toast({ title: "Update failed", description: error.message, variant: "destructive" });
      toast({ title: "Saved" });
    } else {
      const { error } = await supabase.from(config.table).insert({ ...payload, created_by: user?.id ?? null } as never);
      if (error) return toast({ title: "Create failed", description: error.message, variant: "destructive" });
      toast({ title: `${config.label.replace(/s$/, "")} created as draft`, description: "Publish it when you're ready, or share a preview link." });
    }
    load();
  };

  const remove = async (id: string) => {
    const { error } = await supabase.from(config.table).delete().eq("id", id);
    if (error) toast({ title: "Delete failed", description: error.message, variant: "destructive" });
    else { toast({ title: "Deleted" }); load(); }
  };

  const togglePublish = async (row: Record<string, any>) => {
    const { error } = await supabase.from(config.table).update({ is_published: !row.is_published }).eq("id", row.id);
    if (error) toast({ title: "Could not update status", description: error.message, variant: "destructive" });
    else setRows(prev => prev.map(r => r.id === row.id ? { ...r, is_published: !row.is_published } : r));
  };

  return (
    <div className="mt-6 space-y-5">
      <div>
        <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
          <Newspaper className="w-5 h-5 text-primary" /> Content Manager
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Create, edit, publish and delete blogs, traveler stories, travel tips and community channels. Everything lives in the database and renders on the public site.
        </p>
      </div>

      <div className="flex gap-1 overflow-x-auto border-b border-border pb-px">
        {CONFIGS.map(c => (
          <button key={c.id} onClick={() => setEntity(c.id)}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium whitespace-nowrap rounded-t-lg transition-colors ${entity === c.id ? "bg-card text-primary border-b-2 border-primary" : "text-muted-foreground hover:text-foreground"}`}>
            <c.icon className="w-4 h-4" /> {c.label}
          </button>
        ))}
      </div>

      <p className="text-xs text-muted-foreground">{config.blurb}</p>

      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Total", value: rows.length, color: "text-primary" },
          { label: "Published", value: publishedCount, color: "text-accent" },
          { label: "Drafts", value: rows.length - publishedCount, color: "text-muted-foreground" },
        ].map(s => (
          <div key={s.label} className="rounded-lg bg-card p-3 shadow-card">
            <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input className="pl-9" placeholder={`Search ${config.label.toLowerCase()}…`} value={q}
            onChange={e => { setQ(e.target.value); setPage(0); }} />
        </div>
        <Button size="sm" className="rounded-full gap-2" onClick={() => { setEditing(null); setOpen(true); }}>
          <Plus className="w-4 h-4" /> New {config.label.replace(/s$/, "")}
        </Button>
      </div>

      <div className="rounded-lg bg-card shadow-card overflow-x-auto">
        {loading ? (
          <div className="p-8 text-center text-sm text-muted-foreground">Loading…</div>
        ) : paged.length === 0 ? (
          <div className="p-8 text-center text-sm text-muted-foreground">No {config.label.toLowerCase()} yet.</div>
        ) : (
          <table className="w-full text-sm min-w-[640px]">
            <thead className="bg-secondary/40 text-xs uppercase text-muted-foreground">
              <tr>
                {config.columns.map(c => <th key={c.key} className="text-left p-3">{c.label}</th>)}
                <th className="text-left p-3">Status</th>
                <th className="text-right p-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {paged.map(row => (
                <tr key={row.id}>
                  {config.columns.map(c => (
                    <td key={c.key} className="p-3 text-foreground truncate max-w-[260px]">{row[c.key] ?? "—"}</td>
                  ))}
                  <td className="p-3">
                    <span className={`text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded ${row.is_published ? "bg-accent/10 text-accent" : "bg-secondary text-muted-foreground"}`}>
                      {row.is_published ? "published" : "draft"}
                    </span>
                  </td>
                  <td className="p-3">
                    <div className="flex justify-end gap-1.5">
                      <Button size="sm" variant="outline" className="rounded-full gap-1.5" onClick={() => togglePublish(row)}>
                        {row.is_published ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        {row.is_published ? "Unpublish" : "Publish"}
                      </Button>
                      <Button size="sm" variant="outline" className="rounded-full gap-1.5" onClick={() => { setEditing(row); setOpen(true); }}>
                        <Pencil className="w-3.5 h-3.5" /> Edit
                      </Button>
                      <Button size="sm" variant="destructive" className="rounded-full" onClick={() => remove(row.id)}>
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {filtered.length > PAGE_SIZE && (
        <AdminPagination page={safePage} total={filtered.length} pageSize={PAGE_SIZE} onPage={setPage} />
      )}

      <EditDialog
        wide
        open={open}
        onClose={() => setOpen(false)}
        title={editing ? `Edit ${config.label.replace(/s$/, "")}` : `New ${config.label.replace(/s$/, "")}`}
        description={config.blurb}
        fields={config.fields}
        initialData={editing ?? undefined}
        onSave={save}
        onDelete={editing?.id ? () => remove(editing.id) : undefined}
      />
    </div>
  );
};

export default ContentManagerTab;
