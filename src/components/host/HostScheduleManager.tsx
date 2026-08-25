import { useCallback, useEffect, useMemo, useState } from "react";
import { CalendarDays, Plus, Loader2, Trash2, PartyPopper, Repeat, Link2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { MONTH_LABELS } from "@/hooks/useExperienceCatalog";

interface Props { hostId: string; hostCity?: string }

const EVENT_TYPES = ["Wedding", "Festival", "Harvest", "Pilgrimage", "Fair", "Sports event", "Seasonal window"];

const emptyForm = {
  kind: "occasion", title: "", event_type: "Wedding", description: "", city: "", venue: "",
  start_date: "", end_date: "", recurring_months: [] as number[], guest_capacity: "", is_public: true,
};

const dateLabel = (v?: string | null) => v ? new Date(v).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : null;

/**
 * Host itinerary: upcoming weddings, festivals and seasonal windows, with the catalog
 * experiences the host will run during each one mapped onto it.
 */
const HostScheduleManager = ({ hostId, hostCity }: Props) => {
  const { toast } = useToast();
  const [events, setEvents] = useState<any[]>([]);
  const [mappings, setMappings] = useState<any[]>([]);
  const [catalog, setCatalog] = useState<any[]>([]);
  const [offerings, setOfferings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ ...emptyForm, city: hostCity ?? "" });

  const load = useCallback(async () => {
    const [e, c, o] = await Promise.all([
      (supabase as any).from("host_schedule_events").select("*").eq("host_id", hostId).order("start_date", { nullsFirst: false }),
      (supabase as any).from("experience_catalog").select("id, slug, title, category, occasion_type").eq("status", "published").order("sort_order"),
      (supabase as any).from("catalog_host_offerings").select("id, catalog_id, headline, status").eq("host_id", hostId),
    ]);
    const eventRows = e.data ?? [];
    setEvents(eventRows);
    setCatalog(c.data ?? []);
    setOfferings(o.data ?? []);
    if (eventRows.length) {
      const { data: maps } = await (supabase as any).from("host_schedule_experiences")
        .select("*").in("schedule_id", eventRows.map((r: any) => r.id));
      setMappings(maps ?? []);
    } else setMappings([]);
    setLoading(false);
  }, [hostId]);

  useEffect(() => { void load(); }, [load]);

  const catalogById = useMemo(() => Object.fromEntries(catalog.map(c => [c.id, c])), [catalog]);
  const offeringByCatalog = useMemo(() => Object.fromEntries(offerings.map(o => [o.catalog_id, o])), [offerings]);

  const create = async () => {
    if (!form.title.trim() || !form.city.trim()) { toast({ title: "Title and city are required", variant: "destructive" }); return; }
    if (form.kind === "occasion" && !form.start_date) { toast({ title: "Pick a start date for the occasion", variant: "destructive" }); return; }
    setSaving(true);
    const { error } = await (supabase as any).from("host_schedule_events").insert({
      host_id: hostId,
      kind: form.kind,
      title: form.title.trim(),
      event_type: form.event_type || null,
      description: form.description.trim(),
      city: form.city.trim(),
      venue: form.venue.trim() || null,
      start_date: form.start_date || null,
      end_date: form.end_date || form.start_date || null,
      recurring_months: form.kind === "season" ? form.recurring_months : [],
      guest_capacity: Number(form.guest_capacity) || null,
      is_public: form.is_public,
      status: "upcoming",
    });
    setSaving(false);
    if (error) { toast({ title: "Couldn't save", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Added to your itinerary" });
    setForm({ ...emptyForm, city: hostCity ?? "" });
    setOpen(false);
    void load();
  };

  const remove = async (row: any) => {
    const { error } = await (supabase as any).from("host_schedule_events").delete().eq("id", row.id);
    if (error) { toast({ title: "Couldn't delete", description: error.message, variant: "destructive" }); return; }
    void load();
  };

  const setStatus = async (row: any, status: string) => {
    const { error } = await (supabase as any).from("host_schedule_events").update({ status }).eq("id", row.id);
    if (error) { toast({ title: "Couldn't update", description: error.message, variant: "destructive" }); return; }
    void load();
  };

  const toggleMapping = async (eventId: string, catalogId: string) => {
    const existing = mappings.find(m => m.schedule_id === eventId && m.catalog_id === catalogId);
    if (existing) {
      const { error } = await (supabase as any).from("host_schedule_experiences").delete().eq("id", existing.id);
      if (error) { toast({ title: "Couldn't unlink", description: error.message, variant: "destructive" }); return; }
    } else {
      const { error } = await (supabase as any).from("host_schedule_experiences").insert({
        schedule_id: eventId, catalog_id: catalogId, offering_id: offeringByCatalog[catalogId]?.id ?? null,
      });
      if (error) { toast({ title: "Couldn't link", description: error.message, variant: "destructive" }); return; }
    }
    void load();
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-bold text-foreground">Itinerary & occasions</h3>
          <p className="text-sm text-muted-foreground">
            Publish forthcoming weddings, festivals and seasonal windows, then map the catalog experiences you'll run during each.
          </p>
        </div>
        <Button size="sm" className="rounded-full gap-1.5" onClick={() => setOpen(o => !o)}><Plus className="h-4 w-4" /> Add occasion</Button>
      </div>

      {open && (
        <div className="rounded-2xl border border-primary/30 bg-card p-4 shadow-card">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Type</label>
              <select value={form.kind} onChange={e => setForm(p => ({ ...p, kind: e.target.value }))}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm">
                <option value="occasion">Dated occasion (wedding, festival)</option>
                <option value="season">Recurring seasonal window</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Occasion category</label>
              <select value={form.event_type} onChange={e => setForm(p => ({ ...p, event_type: e.target.value }))}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm">
                {EVENT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Title <span className="text-destructive">*</span></label>
              <Input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} placeholder="Sharma family wedding" />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">City <span className="text-destructive">*</span></label>
              <Input value={form.city} onChange={e => setForm(p => ({ ...p, city: e.target.value }))} placeholder="Udaipur, Rajasthan" />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Venue</label>
              <Input value={form.venue} onChange={e => setForm(p => ({ ...p, venue: e.target.value }))} placeholder="Family haveli" />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Guest capacity</label>
              <Input type="number" value={form.guest_capacity} onChange={e => setForm(p => ({ ...p, guest_capacity: e.target.value }))} placeholder="4" />
            </div>
            {form.kind === "occasion" ? (
              <>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">Start date <span className="text-destructive">*</span></label>
                  <Input type="date" value={form.start_date} onChange={e => setForm(p => ({ ...p, start_date: e.target.value }))} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">End date</label>
                  <Input type="date" value={form.end_date} onChange={e => setForm(p => ({ ...p, end_date: e.target.value }))} />
                </div>
              </>
            ) : (
              <div className="sm:col-span-2 space-y-1.5">
                <label className="text-sm font-medium text-foreground">Months this repeats</label>
                <div className="flex flex-wrap gap-1.5">
                  {MONTH_LABELS.map((m, i) => (
                    <button type="button" key={m}
                      onClick={() => setForm(p => ({ ...p, recurring_months: p.recurring_months.includes(i + 1) ? p.recurring_months.filter(x => x !== i + 1) : [...p.recurring_months, i + 1].sort((a, b) => a - b) }))}
                      className={`rounded-full px-2.5 py-1 text-xs font-medium ${form.recurring_months.includes(i + 1) ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"}`}>
                      {m}
                    </button>
                  ))}
                </div>
              </div>
            )}
            <div className="sm:col-span-2 space-y-1.5">
              <label className="text-sm font-medium text-foreground">What travelers should know</label>
              <Textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                placeholder="Three days of ceremonies, attire guidance included, two guest spots available." className="min-h-[80px]" />
            </div>
            <label className="sm:col-span-2 flex items-center gap-2 text-sm text-muted-foreground">
              <input type="checkbox" className="accent-primary" checked={form.is_public} onChange={e => setForm(p => ({ ...p, is_public: e.target.checked }))} />
              Show this on my public profile and the matching experience pages
            </label>
          </div>
          <div className="mt-4 flex gap-2">
            <Button size="sm" className="rounded-full" onClick={create} disabled={saving}>
              {saving && <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />}Save occasion
            </Button>
            <Button size="sm" variant="outline" className="rounded-full" onClick={() => setOpen(false)}>Cancel</Button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex items-center gap-2 p-6 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" /> Loading your itinerary…</div>
      ) : events.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-8 text-center">
          <CalendarDays className="mx-auto h-6 w-6 text-muted-foreground" />
          <p className="mt-2 font-semibold text-foreground">Nothing scheduled yet</p>
          <p className="mt-1 text-sm text-muted-foreground">Add a wedding, festival or seasonal window so travelers can plan around your dates.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {events.map(ev => {
            const linked = mappings.filter(m => m.schedule_id === ev.id).map(m => m.catalog_id);
            return (
              <div key={ev.id} className="rounded-2xl bg-card p-4 shadow-card">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      {ev.kind === "season" ? <Repeat className="h-4 w-4 text-primary" /> : <PartyPopper className="h-4 w-4 text-primary" />}
                      <p className="font-semibold text-foreground">{ev.title}</p>
                      <span className="rounded-full bg-secondary px-2 py-0.5 text-[11px] font-semibold text-muted-foreground">{ev.status}</span>
                      {!ev.is_public && <span className="rounded-full bg-secondary px-2 py-0.5 text-[11px] font-semibold text-muted-foreground">private</span>}
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {[ev.event_type, ev.city, ev.venue,
                        ev.kind === "season"
                          ? (ev.recurring_months ?? []).map((m: number) => MONTH_LABELS[m - 1]).join(", ")
                          : [dateLabel(ev.start_date), dateLabel(ev.end_date)].filter(Boolean).join(" – "),
                        ev.guest_capacity ? `${ev.guest_capacity} guest spots` : null,
                      ].filter(Boolean).join(" · ")}
                    </p>
                    {ev.description && <p className="mt-1 max-w-2xl text-sm text-muted-foreground">{ev.description}</p>}
                  </div>
                  <div className="flex gap-1.5">
                    {ev.status !== "completed" && (
                      <Button size="sm" variant="ghost" className="h-8 rounded-full text-xs" onClick={() => setStatus(ev, ev.status === "upcoming" ? "ongoing" : "completed")}>
                        Mark {ev.status === "upcoming" ? "ongoing" : "completed"}
                      </Button>
                    )}
                    <Button size="sm" variant="ghost" className="h-8 rounded-full text-xs text-destructive" onClick={() => remove(ev)}><Trash2 className="h-3.5 w-3.5" /></Button>
                  </div>
                </div>

                <div className="mt-3 border-t border-border pt-3">
                  <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    <Link2 className="h-3.5 w-3.5" /> Experiences running during this
                  </p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {catalog.map(c => {
                      const on = linked.includes(c.id);
                      const hasOffering = !!offeringByCatalog[c.id];
                      return (
                        <button key={c.id} onClick={() => toggleMapping(ev.id, c.id)}
                          title={hasOffering ? "You already price this experience" : "Add this to your catalog offerings to show pricing"}
                          className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${on ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground hover:bg-secondary/70"}`}>
                          {c.title}{!hasOffering && on ? " · no price yet" : ""}
                        </button>
                      );
                    })}
                    {catalog.length === 0 && <p className="text-sm text-muted-foreground">No published catalog experiences yet.</p>}
                  </div>
                  {linked.length > 0 && (
                    <p className="mt-2 text-xs text-muted-foreground">
                      Linked: {linked.map(id => catalogById[id]?.title).filter(Boolean).join(", ")}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default HostScheduleManager;
