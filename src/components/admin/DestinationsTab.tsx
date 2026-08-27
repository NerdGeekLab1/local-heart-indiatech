import { useEffect, useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { MapPin, Plus, Trash2, Download, Landmark, CalendarDays, Search, Users, Sparkles, Eye, EyeOff, Save, ChevronLeft, Crosshair, Map as MapIcon, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import ImageUpload from "@/components/ImageUpload";
import SiteMarkerMap from "@/components/admin/SiteMarkerMap";
import {
  useAdminDestinations, useDestinationSites, useDestinationDetail, slugify,
  type DestinationRow, type DestinationSite, type ItineraryDay,
} from "@/hooks/useDestinations";
import { destinations as staticDestinations } from "@/lib/data";
import { buildDestinationSeed } from "@/lib/destinationSeed";

const SITE_TYPES = ["monument", "temple", "palace", "fort", "nature", "beach", "market", "museum"];

const csv = (v?: string[] | null) => (v || []).join(", ");
const parseCsv = (v: string) => v.split(",").map(s => s.trim()).filter(Boolean);

/** Free-form place lookup via OpenStreetMap Nominatim (same service used for booking maps). */
export const geocodePlace = async (query: string): Promise<{ lat: number; lng: number } | null> => {
  const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(query)}`, {
    headers: { Accept: "application/json" },
  });
  if (!res.ok) return null;
  const data = await res.json();
  const hit = Array.isArray(data) ? data[0] : null;
  if (!hit) return null;
  return { lat: Number(Number(hit.lat).toFixed(6)), lng: Number(Number(hit.lon).toFixed(6)) };
};

type DetailTab = "basics" | "sites" | "itinerary" | "live";


const emptyDraft = {
  name: "", slug: "", state: "", tagline: "", description: "",
  highlights: "", best_season: "", avg_temp: "", hero_images: "", experience_tags: "",
  is_published: true, sort_order: 0,
};

const DestinationsTab = () => {
  const { toast } = useToast();
  const qc = useQueryClient();
  const { data: rows = [], isLoading } = useAdminDestinations();
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [busy, setBusy] = useState(false);

  const selected = rows.find(r => r.id === selectedId) || null;
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter(r => `${r.name} ${r.state} ${r.tagline}`.toLowerCase().includes(q));
  }, [rows, query]);

  const refresh = () => qc.invalidateQueries({ queryKey: ["admin-destinations"] });

  const importDefaults = async () => {
    setBusy(true);
    // buildDestinationSeed adds city coordinates, derived site markers and a default itinerary.
    const payload = buildDestinationSeed(staticDestinations as any[]);
    const { data, error } = await supabase.rpc("import_destinations", { _payload: payload as any });
    setBusy(false);
    if (error) { toast({ title: "Import failed", description: error.message, variant: "destructive" }); return; }
    toast({ title: `Imported ${data ?? 0} destinations` });
    refresh();
  };


  if (selected) {
    return <DestinationEditor row={selected} onBack={() => setSelectedId(null)} onChanged={refresh} />;
  }

  return (
    <div className="mt-4 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            <MapPin className="w-5 h-5 text-primary" /> Destinations ({rows.length})
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Everything on the public destination page — sites, map pins, itinerary — comes from here. Host and experience counts stay live.
          </p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" className="rounded-full gap-1 text-xs" disabled={busy} onClick={importDefaults}>
            <Download className="w-3 h-3" /> Import built-in list
          </Button>
          <Button size="sm" className="rounded-full gap-1 text-xs" onClick={() => setCreating(true)}>
            <Plus className="w-3 h-3" /> Add destination
          </Button>
        </div>
      </div>

      <div className="relative max-w-sm">
        <Search className="w-3.5 h-3.5 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
        <Input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search destinations" className="pl-9 h-9 text-sm" />
      </div>

      {creating && (
        <CreateForm
          onCancel={() => setCreating(false)}
          onCreated={(id) => { setCreating(false); refresh(); setSelectedId(id); }}
        />
      )}

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[0, 1, 2, 3, 4, 5].map(i => <div key={i} className="h-28 rounded-xl bg-muted animate-pulse" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-xl border-2 border-dashed border-border p-10 text-center">
          <MapPin className="w-8 h-8 text-muted-foreground/40 mx-auto mb-2" />
          <p className="font-semibold text-foreground">No destinations yet</p>
          <p className="text-sm text-muted-foreground mt-1">Use “Import built-in list” to load the curated set, then edit any of them.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(d => (
            <button key={d.id} onClick={() => setSelectedId(d.id)}
              className="text-left rounded-xl bg-card p-4 shadow-card hover:shadow-card-hover transition-shadow">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-primary shrink-0" />
                <h3 className="font-bold text-foreground truncate">{d.name}</h3>
                <span className="text-xs bg-secondary text-muted-foreground px-2 py-0.5 rounded-full ml-auto shrink-0">{d.state}</span>
              </div>
              <p className="text-sm text-primary mt-1 truncate">{d.tagline}</p>
              <div className="mt-2 flex items-center gap-2 text-[11px] text-muted-foreground">
                <span className="flex items-center gap-1">
                  {d.is_published ? <Eye className="w-3 h-3 text-primary" /> : <EyeOff className="w-3 h-3" />}
                  {d.is_published ? "Published" : "Hidden"}
                </span>
                <span>·</span>
                <span>/destination/{d.slug}</span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

const CreateForm = ({ onCancel, onCreated }: { onCancel: () => void; onCreated: (id: string) => void }) => {
  const { toast } = useToast();
  const [draft, setDraft] = useState({ ...emptyDraft });
  const [saving, setSaving] = useState(false);

  const save = async () => {
    if (!draft.name.trim()) { toast({ title: "Name is required", variant: "destructive" }); return; }
    setSaving(true);
    const { data, error } = await supabase.from("destinations").insert({
      name: draft.name.trim(),
      slug: slugify(draft.slug || draft.name),
      state: draft.state,
      tagline: draft.tagline,
      description: draft.description,
      highlights: parseCsv(draft.highlights),
      best_season: draft.best_season || null,
      avg_temp: draft.avg_temp || null,
      hero_images: parseCsv(draft.hero_images),
      experience_tags: parseCsv(draft.experience_tags),
      is_published: draft.is_published,
    }).select("id").maybeSingle();
    setSaving(false);
    if (error || !data) { toast({ title: "Could not create", description: error?.message, variant: "destructive" }); return; }
    toast({ title: "Destination created" });
    onCreated(data.id);
  };

  return (
    <div className="rounded-xl bg-card p-4 shadow-card space-y-3">
      <h3 className="font-semibold text-foreground text-sm">New destination</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Field label="Name"><Input value={draft.name} onChange={e => setDraft({ ...draft, name: e.target.value })} /></Field>
        <Field label="State"><Input value={draft.state} onChange={e => setDraft({ ...draft, state: e.target.value })} /></Field>
        <Field label="Tagline"><Input value={draft.tagline} onChange={e => setDraft({ ...draft, tagline: e.target.value })} /></Field>
        <Field label="URL slug (optional)"><Input value={draft.slug} onChange={e => setDraft({ ...draft, slug: e.target.value })} placeholder={slugify(draft.name)} /></Field>
      </div>
      <Field label="Description"><Textarea rows={3} value={draft.description} onChange={e => setDraft({ ...draft, description: e.target.value })} /></Field>
      <div className="flex gap-2">
        <Button size="sm" className="rounded-full" disabled={saving} onClick={save}>Create</Button>
        <Button size="sm" variant="outline" className="rounded-full" onClick={onCancel}>Cancel</Button>
      </div>
    </div>
  );
};

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <label className="block">
    <span className="text-[11px] uppercase tracking-wide text-muted-foreground font-semibold">{label}</span>
    <div className="mt-1">{children}</div>
  </label>
);

const DestinationEditor = ({ row, onBack, onChanged }: { row: DestinationRow; onBack: () => void; onChanged: () => void }) => {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [tab, setTab] = useState<DetailTab>("basics");
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: row.name, slug: row.slug, state: row.state, tagline: row.tagline, description: row.description,
    highlights: csv(row.highlights), best_season: row.best_season || "", avg_temp: row.avg_temp || "",
    hero_images: csv(row.hero_images), experience_tags: csv(row.experience_tags),
    latitude: row.latitude?.toString() || "", longitude: row.longitude?.toString() || "",
    is_published: row.is_published, sort_order: row.sort_order,
  });
  const [itinerary, setItinerary] = useState<ItineraryDay[]>(Array.isArray(row.itinerary) ? row.itinerary : []);

  const { data: sites = [] } = useDestinationSites(row.id);
  const { data: live } = useDestinationDetail(row.slug);

  const refreshSites = () => qc.invalidateQueries({ queryKey: ["destination-sites", row.id] });

  const saveBasics = async () => {
    setSaving(true);
    const { error } = await supabase.from("destinations").update({
      name: form.name.trim(),
      slug: slugify(form.slug || form.name),
      state: form.state,
      tagline: form.tagline,
      description: form.description,
      highlights: parseCsv(form.highlights),
      best_season: form.best_season || null,
      avg_temp: form.avg_temp || null,
      hero_images: parseCsv(form.hero_images),
      experience_tags: parseCsv(form.experience_tags),
      latitude: form.latitude ? Number(form.latitude) : null,
      longitude: form.longitude ? Number(form.longitude) : null,
      is_published: form.is_published,
      sort_order: Number(form.sort_order) || 0,
      itinerary: itinerary as any,
    }).eq("id", row.id);
    setSaving(false);
    if (error) { toast({ title: "Save failed", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Destination saved" });
    onChanged();
    qc.invalidateQueries({ queryKey: ["destination-public", row.slug] });
  };

  const removeDestination = async () => {
    const { error } = await supabase.from("destinations").delete().eq("id", row.id);
    if (error) { toast({ title: "Delete failed", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Destination removed" });
    onChanged();
    onBack();
  };

  const addSite = async () => {
    const { error } = await supabase.from("destination_sites").insert({
      destination_id: row.id, name: "New site", type: "monument", sort_order: sites.length,
    });
    if (error) { toast({ title: "Could not add site", description: error.message, variant: "destructive" }); return; }
    refreshSites();
  };

  const tabs: { id: DetailTab; label: string; icon: React.ElementType }[] = [
    { id: "basics", label: "Destination details", icon: MapPin },
    { id: "sites", label: "Sites & map", icon: Landmark },
    { id: "itinerary", label: "Itinerary", icon: CalendarDays },
    { id: "live", label: "Hosts & experiences", icon: Users },
  ];

  return (
    <div className="mt-4 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Button size="icon" variant="ghost" className="rounded-full" onClick={onBack}><ChevronLeft className="w-4 h-4" /></Button>
          <div>
            <h2 className="text-xl font-bold text-foreground">{form.name || "Destination"}</h2>
            <p className="text-xs text-muted-foreground">/destination/{slugify(form.slug || form.name)}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-xs text-muted-foreground">
            <Switch checked={form.is_published} onCheckedChange={v => setForm({ ...form, is_published: v })} /> Published
          </label>
          <Button size="sm" className="rounded-full gap-1" disabled={saving} onClick={saveBasics}>
            <Save className="w-3.5 h-3.5" /> {saving ? "Saving…" : "Save changes"}
          </Button>
          <Button size="sm" variant="outline" className="rounded-full gap-1 text-destructive" onClick={removeDestination}>
            <Trash2 className="w-3.5 h-3.5" /> Delete
          </Button>
        </div>
      </div>

      <div className="flex gap-1 border-b border-border overflow-x-auto">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium whitespace-nowrap rounded-t-lg transition-colors ${tab === t.id ? "bg-card text-primary border-b-2 border-primary" : "text-muted-foreground hover:text-foreground"}`}>
            <t.icon className="w-3.5 h-3.5" /> {t.label}
          </button>
        ))}
      </div>

      {tab === "basics" && (
        <div className="rounded-xl bg-card p-5 shadow-card space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Name"><Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></Field>
            <Field label="State"><Input value={form.state} onChange={e => setForm({ ...form, state: e.target.value })} /></Field>
            <Field label="Tagline"><Input value={form.tagline} onChange={e => setForm({ ...form, tagline: e.target.value })} /></Field>
            <Field label="URL slug"><Input value={form.slug} onChange={e => setForm({ ...form, slug: e.target.value })} /></Field>
            <Field label="Best season"><Input value={form.best_season} onChange={e => setForm({ ...form, best_season: e.target.value })} placeholder="Oct – Mar" /></Field>
            <Field label="Average temperature"><Input value={form.avg_temp} onChange={e => setForm({ ...form, avg_temp: e.target.value })} placeholder="25°C" /></Field>
            <Field label="Latitude (map centre)"><Input value={form.latitude} onChange={e => setForm({ ...form, latitude: e.target.value })} /></Field>
            <Field label="Longitude (map centre)"><Input value={form.longitude} onChange={e => setForm({ ...form, longitude: e.target.value })} /></Field>
          </div>
          <Field label="Description"><Textarea rows={4} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} /></Field>
          <Field label="Highlights (comma separated)"><Input value={form.highlights} onChange={e => setForm({ ...form, highlights: e.target.value })} /></Field>
          <Field label="Experience tags (comma separated)"><Input value={form.experience_tags} onChange={e => setForm({ ...form, experience_tags: e.target.value })} /></Field>
          <Field label="Hero image URLs (comma separated)"><Textarea rows={2} value={form.hero_images} onChange={e => setForm({ ...form, hero_images: e.target.value })} /></Field>
          <Field label="Sort order"><Input type="number" value={form.sort_order} onChange={e => setForm({ ...form, sort_order: Number(e.target.value) })} className="max-w-[120px]" /></Field>
        </div>
      )}

      {tab === "sites" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">{sites.length} sites — coordinates power the public map.</p>
            <Button size="sm" className="rounded-full gap-1 text-xs" onClick={addSite}><Plus className="w-3 h-3" /> Add site</Button>
          </div>
          <div className="space-y-3">
            {sites.map(site => <SiteEditor key={site.id} site={site} onChanged={refreshSites} />)}
            {sites.length === 0 && (
              <div className="rounded-xl border-2 border-dashed border-border p-8 text-center text-sm text-muted-foreground">
                No sites yet. Add monuments, temples, markets or nature spots for this destination.
              </div>
            )}
          </div>
          {sites.some(s => s.latitude && s.longitude) && (
            <div className="rounded-xl overflow-hidden shadow-card aspect-[16/9] bg-secondary">
              <MapFrame lat={Number(sites.find(s => s.latitude)?.latitude)} lng={Number(sites.find(s => s.longitude)?.longitude)} title={form.name} />
            </div>
          )}
        </div>
      )}

      {tab === "itinerary" && (
        <div className="rounded-xl bg-card p-5 shadow-card space-y-4">
          {itinerary.map((day, i) => (
            <div key={i} className="rounded-xl border border-border p-4 space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-primary uppercase tracking-wide">Day {i + 1}</span>
                <Button size="icon" variant="ghost" className="ml-auto rounded-full h-7 w-7"
                  onClick={() => setItinerary(itinerary.filter((_, j) => j !== i))}>
                  <Trash2 className="w-3.5 h-3.5 text-destructive" />
                </Button>
              </div>
              <Field label="Day title">
                <Input value={day.title} onChange={e => setItinerary(itinerary.map((d, j) => j === i ? { ...d, title: e.target.value } : d))} />
              </Field>
              <Field label="Places / activities (comma separated)">
                <Input value={csv(day.places)} onChange={e => setItinerary(itinerary.map((d, j) => j === i ? { ...d, places: parseCsv(e.target.value) } : d))} />
              </Field>
            </div>
          ))}
          <div className="flex gap-2">
            <Button size="sm" variant="outline" className="rounded-full gap-1 text-xs"
              onClick={() => setItinerary([...itinerary, { title: "", places: [] }])}>
              <Plus className="w-3 h-3" /> Add day
            </Button>
            <Button size="sm" className="rounded-full gap-1 text-xs" disabled={saving} onClick={saveBasics}>
              <Save className="w-3 h-3" /> Save itinerary
            </Button>
          </div>
          {itinerary.length === 0 && (
            <p className="text-sm text-muted-foreground">No itinerary set — the public page will fall back to a suggested route built from your sites.</p>
          )}
        </div>
      )}

      {tab === "live" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="rounded-xl bg-card p-5 shadow-card">
            <h3 className="font-semibold text-foreground flex items-center gap-2"><Users className="w-4 h-4 text-primary" /> Local hosts ({live?.host_count ?? 0})</h3>
            <p className="text-xs text-muted-foreground mt-1">Live count of public host profiles based in {form.name}.</p>
            <div className="mt-3 space-y-2">
              {(live?.hosts || []).map(h => (
                <div key={h.id} className="flex items-center gap-3 rounded-lg bg-secondary/50 p-2.5">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                    {(h.first_name || "H")[0]}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{[h.first_name, h.last_name].filter(Boolean).join(" ") || h.username}</p>
                    <p className="text-xs text-muted-foreground truncate">{h.tagline || "—"}</p>
                  </div>
                </div>
              ))}
              {(live?.hosts || []).length === 0 && <p className="text-sm text-muted-foreground">No hosts mapped to this city yet.</p>}
            </div>
          </div>
          <div className="rounded-xl bg-card p-5 shadow-card">
            <h3 className="font-semibold text-foreground flex items-center gap-2"><Sparkles className="w-4 h-4 text-primary" /> Experiences ({live?.experiences.length ?? 0})</h3>
            <p className="text-xs text-muted-foreground mt-1">Approved host experiences matched to this destination.</p>
            <div className="mt-3 space-y-2">
              {(live?.experiences || []).map(e => (
                <div key={e.id} className="flex items-center justify-between gap-3 rounded-lg bg-secondary/50 p-2.5">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{e.title}</p>
                    <p className="text-xs text-muted-foreground truncate">{e.category} · {e.host_name || "Host"}</p>
                  </div>
                  <span className="text-sm font-bold text-foreground shrink-0">₹{Number(e.price).toLocaleString("en-IN")}</span>
                </div>
              ))}
              {(live?.experiences || []).length === 0 && <p className="text-sm text-muted-foreground">No approved experiences mapped yet.</p>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export const MapFrame = ({ lat, lng, title }: { lat: number; lng: number; title: string }) => {
  const bbox = `${lng - 0.15},${lat - 0.15},${lng + 0.15},${lat + 0.15}`;
  return (
    <iframe
      title={`Map of ${title}`}
      width="100%"
      height="100%"
      loading="lazy"
      src={`https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat},${lng}`}
      style={{ border: 0 }}
    />
  );
};

const SiteEditor = ({ site, onChanged }: { site: DestinationSite; onChanged: () => void }) => {
  const { toast } = useToast();
  const [form, setForm] = useState({
    name: site.name, type: site.type, description: site.description,
    entry_fee: site.entry_fee || "", best_time: site.best_time || "", duration: site.duration || "",
    latitude: site.latitude?.toString() || "", longitude: site.longitude?.toString() || "",
    image_url: site.image_url || "", sort_order: site.sort_order,
  });
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    const { error } = await supabase.from("destination_sites").update({
      name: form.name, type: form.type, description: form.description,
      entry_fee: form.entry_fee || null, best_time: form.best_time || null, duration: form.duration || null,
      latitude: form.latitude ? Number(form.latitude) : null,
      longitude: form.longitude ? Number(form.longitude) : null,
      image_url: form.image_url || null, sort_order: Number(form.sort_order) || 0,
    }).eq("id", site.id);
    setSaving(false);
    if (error) { toast({ title: "Save failed", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Site saved" });
    onChanged();
  };

  const remove = async () => {
    const { error } = await supabase.from("destination_sites").delete().eq("id", site.id);
    if (error) { toast({ title: "Delete failed", description: error.message, variant: "destructive" }); return; }
    onChanged();
  };

  return (
    <div className="rounded-xl bg-card p-4 shadow-card space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Field label="Name"><Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></Field>
        <Field label="Type">
          <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}
            className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm capitalize">
            {SITE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </Field>
        <Field label="Sort order"><Input type="number" value={form.sort_order} onChange={e => setForm({ ...form, sort_order: Number(e.target.value) })} /></Field>
      </div>
      <Field label="Description"><Textarea rows={2} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} /></Field>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <Field label="Entry fee"><Input value={form.entry_fee} onChange={e => setForm({ ...form, entry_fee: e.target.value })} placeholder="₹200" /></Field>
        <Field label="Best time"><Input value={form.best_time} onChange={e => setForm({ ...form, best_time: e.target.value })} placeholder="Morning" /></Field>
        <Field label="Duration"><Input value={form.duration} onChange={e => setForm({ ...form, duration: e.target.value })} placeholder="2 hrs" /></Field>
        <Field label="Latitude"><Input value={form.latitude} onChange={e => setForm({ ...form, latitude: e.target.value })} /></Field>
        <Field label="Longitude"><Input value={form.longitude} onChange={e => setForm({ ...form, longitude: e.target.value })} /></Field>
        <Field label="Image URL"><Input value={form.image_url} onChange={e => setForm({ ...form, image_url: e.target.value })} /></Field>
      </div>
      <div className="flex gap-2">
        <Button size="sm" className="rounded-full text-xs" disabled={saving} onClick={save}>{saving ? "Saving…" : "Save site"}</Button>
        <Button size="sm" variant="outline" className="rounded-full text-xs text-destructive gap-1" onClick={remove}><Trash2 className="w-3 h-3" /> Remove</Button>
      </div>
    </div>
  );
};

export default DestinationsTab;
