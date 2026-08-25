import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Loader2, Trash2, Eye, Power, Pencil, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useCurrency } from "@/contexts/CurrencyContext";
import { MONTH_LABELS } from "@/hooks/useExperienceCatalog";

interface Props { hostId: string; hostCity?: string }

const PRICE_UNITS = [
  { value: "per_person", label: "Per person" },
  { value: "per_night", label: "Per night" },
  { value: "per_group", label: "Per group" },
  { value: "per_day", label: "Per day" },
];

const emptyForm = {
  catalog_id: "", headline: "", host_notes: "", price: "", price_unit: "per_person",
  city: "", meeting_point: "", max_guests: "2", duration: "",
  available_from: "", available_to: "", season_months: [] as number[],
};

/**
 * Hosts pick an admin-curated experience from the catalog dropdown and add only the
 * host-specific parts: their city, price, capacity, meeting point and availability.
 */
const HostCatalogOfferings = ({ hostId, hostCity }: Props) => {
  const { toast } = useToast();
  const { format } = useCurrency();
  const [catalog, setCatalog] = useState<any[]>([]);
  const [mine, setMine] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ ...emptyForm, city: hostCity ?? "" });

  const load = useCallback(async () => {
    const [c, m] = await Promise.all([
      (supabase as any).from("experience_catalog").select("*").eq("status", "published").order("sort_order"),
      (supabase as any).from("catalog_host_offerings").select("*").eq("host_id", hostId).order("created_at", { ascending: false }),
    ]);
    setCatalog(c.data ?? []);
    setMine(m.data ?? []);
    setLoading(false);
  }, [hostId]);

  useEffect(() => { void load(); }, [load]);

  const selected = useMemo(() => catalog.find(c => c.id === form.catalog_id), [catalog, form.catalog_id]);
  const catalogById = useMemo(() => Object.fromEntries(catalog.map(c => [c.id, c])), [catalog]);

  const startNew = () => {
    setEditId(null);
    setForm({ ...emptyForm, city: hostCity ?? "" });
    setOpen(true);
  };

  const startEdit = (row: any) => {
    setEditId(row.id);
    setForm({
      catalog_id: row.catalog_id, headline: row.headline ?? "", host_notes: row.host_notes ?? "",
      price: String(row.price ?? ""), price_unit: row.price_unit ?? "per_person", city: row.city ?? "",
      meeting_point: row.meeting_point ?? "", max_guests: String(row.max_guests ?? 2), duration: row.duration ?? "",
      available_from: row.available_from ?? "", available_to: row.available_to ?? "", season_months: row.season_months ?? [],
    });
    setOpen(true);
  };

  const submit = async () => {
    if (!form.catalog_id) { toast({ title: "Pick an experience", description: "Choose one from the catalog dropdown.", variant: "destructive" }); return; }
    if (!form.city.trim() || !Number(form.price)) { toast({ title: "City and price are required", variant: "destructive" }); return; }
    setSaving(true);
    const payload: Record<string, any> = {
      catalog_id: form.catalog_id,
      host_id: hostId,
      headline: form.headline.trim() || selected?.title || "",
      host_notes: form.host_notes.trim(),
      price: Number(form.price),
      price_unit: form.price_unit,
      city: form.city.trim(),
      meeting_point: form.meeting_point.trim() || null,
      max_guests: Number(form.max_guests) || 1,
      duration: form.duration.trim() || selected?.typical_duration || null,
      available_from: form.available_from || null,
      available_to: form.available_to || null,
      season_months: form.season_months,
      status: "pending",
    };
    const res = editId
      ? await (supabase as any).from("catalog_host_offerings").update(payload).eq("id", editId)
      : await (supabase as any).from("catalog_host_offerings").insert(payload);
    setSaving(false);
    if (res.error) { toast({ title: "Couldn't save", description: res.error.message, variant: "destructive" }); return; }
    toast({ title: editId ? "Offering updated — back in review" : "Offering submitted for review" });
    setOpen(false);
    void load();
  };

  const toggleActive = async (row: any) => {
    const { error } = await (supabase as any).from("catalog_host_offerings").update({ is_active: !row.is_active }).eq("id", row.id);
    if (error) { toast({ title: "Couldn't update", description: error.message, variant: "destructive" }); return; }
    void load();
  };

  const remove = async (row: any) => {
    const { error } = await (supabase as any).from("catalog_host_offerings").delete().eq("id", row.id);
    if (error) { toast({ title: "Couldn't delete", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Offering removed" });
    void load();
  };

  const toggleMonth = (m: number) =>
    setForm(p => ({ ...p, season_months: p.season_months.includes(m) ? p.season_months.filter(x => x !== m) : [...p.season_months, m].sort((a, b) => a - b) }));

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-bold text-foreground">Catalog experiences</h3>
          <p className="text-sm text-muted-foreground">
            Pick what you offer from Travelista's curated list — we handle the generic description and SEO, you add your city, price and dates.
          </p>
        </div>
        <Button size="sm" className="rounded-full gap-1.5" onClick={startNew}><Plus className="h-4 w-4" /> Add from catalog</Button>
      </div>

      {open && (
        <div className="rounded-2xl border border-primary/30 bg-card p-4 shadow-card">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2 space-y-1.5">
              <label className="text-sm font-medium text-foreground">Experience <span className="text-destructive">*</span></label>
              <select value={form.catalog_id} onChange={e => setForm(p => ({ ...p, catalog_id: e.target.value }))}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                <option value="">Select an experience…</option>
                {Object.entries(catalog.reduce<Record<string, any[]>>((acc, c) => { (acc[c.category] ||= []).push(c); return acc; }, {})).map(([cat, items]) => (
                  <optgroup key={cat} label={cat}>
                    {items.map(c => <option key={c.id} value={c.id}>{c.title}{c.sub_category ? ` — ${c.sub_category}` : ""}</option>)}
                  </optgroup>
                ))}
              </select>
              {selected && (
                <div className="mt-2 rounded-xl bg-secondary/60 p-3 text-xs text-muted-foreground">
                  <p className="flex items-center gap-1.5 font-semibold text-foreground"><Sparkles className="h-3.5 w-3.5 text-primary" /> {selected.title}</p>
                  <p className="mt-1">{selected.summary}</p>
                  <p className="mt-1">Typical: {selected.typical_duration || "flexible"} · Indicative {format(Number(selected.price_min))}–{format(Number(selected.price_max))} · {selected.season_label || "Year round"}</p>
                </div>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Your headline</label>
              <Input value={form.headline} onChange={e => setForm(p => ({ ...p, headline: e.target.value }))} placeholder="Two nights on our millet farm" />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">City / village <span className="text-destructive">*</span></label>
              <Input value={form.city} onChange={e => setForm(p => ({ ...p, city: e.target.value }))} placeholder="Nashik, Maharashtra" />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Price (₹) <span className="text-destructive">*</span></label>
              <Input type="number" value={form.price} onChange={e => setForm(p => ({ ...p, price: e.target.value }))} placeholder="2500" />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Price unit</label>
              <select value={form.price_unit} onChange={e => setForm(p => ({ ...p, price_unit: e.target.value }))}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm">
                {PRICE_UNITS.map(u => <option key={u.value} value={u.value}>{u.label}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Max guests</label>
              <Input type="number" min={1} value={form.max_guests} onChange={e => setForm(p => ({ ...p, max_guests: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Your duration</label>
              <Input value={form.duration} onChange={e => setForm(p => ({ ...p, duration: e.target.value }))} placeholder="2 nights" />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Available from</label>
              <Input type="date" value={form.available_from} onChange={e => setForm(p => ({ ...p, available_from: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Available to</label>
              <Input type="date" value={form.available_to} onChange={e => setForm(p => ({ ...p, available_to: e.target.value }))} />
            </div>
            <div className="sm:col-span-2 space-y-1.5">
              <label className="text-sm font-medium text-foreground">Meeting / pickup point</label>
              <Input value={form.meeting_point} onChange={e => setForm(p => ({ ...p, meeting_point: e.target.value }))} placeholder="Nashik Road station, 8am" />
            </div>
            <div className="sm:col-span-2 space-y-1.5">
              <label className="text-sm font-medium text-foreground">What you specifically provide</label>
              <Textarea value={form.host_notes} onChange={e => setForm(p => ({ ...p, host_notes: e.target.value }))}
                placeholder="Our own details: the farm, the rooms, the meals you cook, what makes your version different." className="min-h-[90px]" />
            </div>
            <div className="sm:col-span-2 space-y-1.5">
              <label className="text-sm font-medium text-foreground">Months you run it</label>
              <div className="flex flex-wrap gap-1.5">
                {MONTH_LABELS.map((m, i) => (
                  <button type="button" key={m} onClick={() => toggleMonth(i + 1)}
                    className={`rounded-full px-2.5 py-1 text-xs font-medium transition-colors ${form.season_months.includes(i + 1) ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground hover:bg-secondary/70"}`}>
                    {m}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="mt-4 flex gap-2">
            <Button size="sm" className="rounded-full" onClick={submit} disabled={saving}>
              {saving && <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />}{editId ? "Save changes" : "Submit for review"}
            </Button>
            <Button size="sm" variant="outline" className="rounded-full" onClick={() => setOpen(false)}>Cancel</Button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex items-center gap-2 p-6 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" /> Loading your offerings…</div>
      ) : mine.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-8 text-center">
          <p className="font-semibold text-foreground">No catalog experiences yet</p>
          <p className="mt-1 text-sm text-muted-foreground">Add one to appear on the public experience pages travelers browse before signing in.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {mine.map(row => {
            const c = catalogById[row.catalog_id];
            return (
              <div key={row.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-card p-4 shadow-card">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold text-foreground">{c?.title ?? "Experience"}</p>
                    <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${row.status === "approved" ? "bg-primary/10 text-primary" : row.status === "rejected" ? "bg-destructive/10 text-destructive" : "bg-accent/15 text-accent"}`}>
                      {row.status}
                    </span>
                    {!row.is_active && <span className="rounded-full bg-secondary px-2 py-0.5 text-[11px] font-semibold text-muted-foreground">paused</span>}
                  </div>
                  <p className="text-sm text-muted-foreground">{row.headline}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {[row.city, `${format(Number(row.price))} ${String(row.price_unit).replace(/_/g, " ")}`, row.duration, `up to ${row.max_guests}`].filter(Boolean).join(" · ")}
                  </p>
                  {row.admin_notes && <p className="mt-1 text-xs text-destructive">Admin note: {row.admin_notes}</p>}
                </div>
                <div className="flex gap-1.5">
                  {c?.slug && (
                    <Button asChild size="sm" variant="ghost" className="h-8 gap-1 rounded-full text-xs">
                      <Link to={`/experience-type/${c.slug}`} target="_blank" rel="noreferrer"><Eye className="h-3.5 w-3.5" /> Public page</Link>
                    </Button>
                  )}
                  <Button size="sm" variant="outline" className="h-8 gap-1 rounded-full text-xs" onClick={() => startEdit(row)}><Pencil className="h-3.5 w-3.5" /> Edit</Button>
                  <Button size="sm" variant="ghost" className="h-8 gap-1 rounded-full text-xs" onClick={() => toggleActive(row)}><Power className="h-3.5 w-3.5" /> {row.is_active ? "Pause" : "Resume"}</Button>
                  <Button size="sm" variant="ghost" className="h-8 gap-1 rounded-full text-xs text-destructive" onClick={() => remove(row)}><Trash2 className="h-3.5 w-3.5" /></Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default HostCatalogOfferings;
