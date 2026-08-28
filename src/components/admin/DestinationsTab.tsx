import { useEffect, useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { MapPin, Plus, Trash2, Download, Landmark, CalendarDays, Search, Users, Sparkles, Eye, EyeOff, Save, ChevronLeft, Crosshair, Map as MapIcon, Image as ImageIcon, FileEdit, Rocket, Undo2, ExternalLink } from "lucide-react";
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
  useAdminDestinations, useDestinationSites, useDestinationDetail, useDestinationDrafts, slugify,
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

/** Upsert a staged draft payload for a destination (site_id null) or one of its sites. */
export const stageDraft = async (destinationId: string, siteId: string | null, payload: Record<string, any>, updatedBy?: string) => {
  const q = supabase.from("destination_drafts").select("id").eq("destination_id", destinationId);
  const { data: existing } = siteId ? await q.eq("site_id", siteId).maybeSingle() : await q.is("site_id", null).maybeSingle();
  if (existing?.id) {
    return supabase.from("destination_drafts").update({ payload: payload as any, updated_by: updatedBy || null }).eq("id", existing.id);
  }
  return supabase.from("destination_drafts").insert({ destination_id: destinationId, site_id: siteId, payload: payload as any, updated_by: updatedBy || null });
};

export const clearDraft = async (destinationId: string, siteId: string | null) => {
  const q = supabase.from("destination_drafts").delete().eq("destination_id", destinationId);
  return siteId ? await q.eq("site_id", siteId) : await q.is("site_id", null);
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
  const { user } = useAuth();
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
  const [activeSiteId, setActiveSiteId] = useState<string | null>(null);
  /** Coordinates picked on the map, handed down to the matching site editor. */
  const [pickedCoords, setPickedCoords] = useState<{ siteId: string; lat: number; lng: number } | null>(null);

  const { data: sites = [] } = useDestinationSites(row.id);
  const { data: live } = useDestinationDetail(row.slug);
  const { data: drafts = [] } = useDestinationDrafts(row.id);
  const destDraft = drafts.find(d => !d.site_id) || null;
  const siteDraftIds = drafts.filter(d => d.site_id).map(d => d.site_id as string);

  const refreshDrafts = () => qc.invalidateQueries({ queryKey: ["destination-drafts", row.id] });

  // Staged edits win in the editor so admins continue where they left off.
  useEffect(() => {
    if (!destDraft) return;
    setForm(f => ({ ...f, ...(destDraft.payload as any) }));
    if (Array.isArray((destDraft.payload as any).itinerary)) setItinerary((destDraft.payload as any).itinerary);
  }, [destDraft?.id]);

  const markers = useMemo(() => sites.flatMap(s => {
    const picked = pickedCoords?.siteId === s.id ? pickedCoords : null;
    const lat = picked ? picked.lat : s.latitude != null ? Number(s.latitude) : null;
    const lng = picked ? picked.lng : s.longitude != null ? Number(s.longitude) : null;
    if (lat == null || lng == null) return [];
    return [{ id: s.id, name: s.name, type: s.type, latitude: lat, longitude: lng }];
  }), [sites, pickedCoords]);

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

  const draftPayload = () => ({
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
    sort_order: Number(form.sort_order) || 0,
    itinerary,
  });

  /** Stage changes without touching the live public page. */
  const saveDraft = async () => {
    setSaving(true);
    const { error } = await stageDraft(row.id, null, draftPayload(), user?.id);
    setSaving(false);
    if (error) { toast({ title: "Could not save draft", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Draft saved", description: "Preview it, then publish when you are happy." });
    refreshDrafts();
  };

  /** Apply the staged draft to the live destination and clear it. */
  const publishDraft = async () => {
    await saveBasics();
    await clearDraft(row.id, null);
    refreshDrafts();
    toast({ title: "Published to the public map" });
  };

  const discardDraft = async () => {
    await clearDraft(row.id, null);
    refreshDrafts();
    setForm({
      name: row.name, slug: row.slug, state: row.state, tagline: row.tagline, description: row.description,
      highlights: csv(row.highlights), best_season: row.best_season || "", avg_temp: row.avg_temp || "",
      hero_images: csv(row.hero_images), experience_tags: csv(row.experience_tags),
      latitude: row.latitude?.toString() || "", longitude: row.longitude?.toString() || "",
      is_published: row.is_published, sort_order: row.sort_order,
    });
    setItinerary(Array.isArray(row.itinerary) ? row.itinerary : []);
    toast({ title: "Draft discarded" });
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
          <Button size="sm" variant="outline" className="rounded-full gap-1" disabled={saving} onClick={saveDraft}>
            <FileEdit className="w-3.5 h-3.5" /> Save draft
          </Button>
          <a href={`/destination/${slugify(form.slug || form.name)}?preview=draft`} target="_blank" rel="noreferrer">
            <Button size="sm" variant="outline" className="rounded-full gap-1">
              <ExternalLink className="w-3.5 h-3.5" /> Preview
            </Button>
          </a>
          <Button size="sm" className="rounded-full gap-1" disabled={saving} onClick={destDraft ? publishDraft : saveBasics}>
            <Rocket className="w-3.5 h-3.5" /> {saving ? "Saving…" : destDraft ? "Publish draft" : "Publish changes"}
          </Button>
          {destDraft && (
            <Button size="sm" variant="ghost" className="rounded-full gap-1 text-xs" onClick={discardDraft}>
              <Undo2 className="w-3.5 h-3.5" /> Discard
            </Button>
          )}
          <Button size="sm" variant="outline" className="rounded-full gap-1 text-destructive" onClick={removeDestination}>
            <Trash2 className="w-3.5 h-3.5" /> Delete
          </Button>
        </div>
      </div>

      {(destDraft || siteDraftIds.length > 0) && (
        <div className="rounded-xl border border-primary/40 bg-primary/5 p-3 text-sm text-foreground flex flex-wrap items-center gap-2">
          <FileEdit className="w-4 h-4 text-primary" />
          <span>
            Unpublished draft in progress{destDraft ? " for this destination" : ""}
            {siteDraftIds.length > 0 ? ` · ${siteDraftIds.length} site draft(s)` : ""}. The public map still shows the last published version.
          </span>
        </div>
      )}

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
            <Field label="Longitude (map centre)">
              <div className="flex gap-2">
                <Input value={form.longitude} onChange={e => setForm({ ...form, longitude: e.target.value })} />
                <Button size="sm" variant="outline" className="rounded-full gap-1 text-xs shrink-0" onClick={async () => {
                  const hit = await geocodePlace([form.name, form.state, "India"].filter(Boolean).join(", "));
                  if (!hit) { toast({ title: "Location not found", variant: "destructive" }); return; }
                  setForm({ ...form, latitude: String(hit.lat), longitude: String(hit.lng) });
                }}>
                  <Crosshair className="w-3 h-3" /> Locate
                </Button>
              </div>
            </Field>
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
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm text-muted-foreground">
              {sites.length} sites · {markers.length} placed on the map. Select a site, then click the map to drop or drag its pin.
            </p>
            <Button size="sm" className="rounded-full gap-1 text-xs" onClick={addSite}><Plus className="w-3 h-3" /> Add site</Button>
          </div>

          <div className="rounded-xl bg-card p-4 shadow-card space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <MapIcon className="w-4 h-4 text-primary" /> Marker placement
              </h3>
              {activeSiteId
                ? <span className="text-xs text-primary font-medium">Placing: {sites.find(s => s.id === activeSiteId)?.name || "site"}</span>
                : <span className="text-xs text-muted-foreground">Pick a site below to place its marker</span>}
              {activeSiteId && (
                <Button size="sm" variant="ghost" className="rounded-full text-xs h-7" onClick={() => setActiveSiteId(null)}>Done</Button>
              )}
            </div>
            <SiteMarkerMap
              markers={markers}
              activeId={activeSiteId ?? undefined}
              center={form.latitude && form.longitude ? { lat: Number(form.latitude), lng: Number(form.longitude) } : null}
              zoom={12}
              height="360px"
              onMarkerClick={(id) => setActiveSiteId(id)}
              onPick={activeSiteId ? (lat, lng) => setPickedCoords({ siteId: activeSiteId, lat, lng }) : undefined}
            />
          </div>

          <div className="space-y-3">
            {sites.map(site => (
              <SiteEditor
                key={site.id}
                site={site}
                destinationName={form.name}
                isActive={activeSiteId === site.id}
                pickedCoords={pickedCoords?.siteId === site.id ? pickedCoords : null}
                onActivate={() => setActiveSiteId(activeSiteId === site.id ? null : site.id)}
                draftPayload={(drafts.find(d => d.site_id === site.id)?.payload as any) || null}
                onChanged={() => { setPickedCoords(null); refreshSites(); refreshDrafts(); }}
              />
            ))}
            {sites.length === 0 && (
              <div className="rounded-xl border-2 border-dashed border-border p-8 text-center text-sm text-muted-foreground">
                No sites yet. Add monuments, temples, markets or nature spots for this destination.
              </div>
            )}
          </div>
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

interface SiteEditorProps {
  site: DestinationSite;
  destinationName: string;
  isActive: boolean;
  pickedCoords: { lat: number; lng: number } | null;
  onActivate: () => void;
  draftPayload?: Record<string, any> | null;
  onChanged: () => void;
}

const SiteEditor = ({ site, destinationName, isActive, pickedCoords, onActivate, draftPayload, onChanged }: SiteEditorProps) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [form, setForm] = useState({
    name: site.name, type: site.type, description: site.description,
    entry_fee: site.entry_fee || "", best_time: site.best_time || "", duration: site.duration || "",
    latitude: site.latitude?.toString() || "", longitude: site.longitude?.toString() || "",
    image_url: site.image_url || "", sort_order: site.sort_order,
    is_published: site.is_published !== false,
    ...(draftPayload || {}),
  });
  const [saving, setSaving] = useState(false);
  const [locating, setLocating] = useState(false);

  // Coordinates dropped on the shared map flow into this form.
  useEffect(() => {
    if (!pickedCoords) return;
    setForm(f => ({ ...f, latitude: String(pickedCoords.lat), longitude: String(pickedCoords.lng) }));
  }, [pickedCoords]);

  const payload = () => ({
    name: form.name, type: form.type, description: form.description,
    entry_fee: form.entry_fee || null, best_time: form.best_time || null, duration: form.duration || null,
    latitude: form.latitude ? Number(form.latitude) : null,
    longitude: form.longitude ? Number(form.longitude) : null,
    image_url: form.image_url || null, sort_order: Number(form.sort_order) || 0,
    is_published: form.is_published,
  });

  /** Stage the site edit; the public map keeps showing the published version. */
  const saveSiteDraft = async () => {
    setSaving(true);
    const { error } = await stageDraft(site.destination_id, site.id, { ...form }, user?.id);
    setSaving(false);
    if (error) { toast({ title: "Could not save draft", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Site draft saved" });
    onChanged();
  };

  const save = async () => {
    setSaving(true);
    const { error } = await supabase.from("destination_sites").update({
      name: form.name, type: form.type, description: form.description,
      entry_fee: form.entry_fee || null, best_time: form.best_time || null, duration: form.duration || null,
      latitude: form.latitude ? Number(form.latitude) : null,
      longitude: form.longitude ? Number(form.longitude) : null,
      image_url: form.image_url || null, sort_order: Number(form.sort_order) || 0,
      is_published: form.is_published,
    }).eq("id", site.id);
    setSaving(false);
    if (error) { toast({ title: "Save failed", description: error.message, variant: "destructive" }); return; }
    await clearDraft(site.destination_id, site.id);
    toast({ title: form.is_published ? "Site published" : "Site saved (hidden from public map)" });
    onChanged();
  };

  const locate = async () => {
    setLocating(true);
    const hit = await geocodePlace([form.name, destinationName, "India"].filter(Boolean).join(", "));
    setLocating(false);
    if (!hit) { toast({ title: "Could not find these coordinates", description: "Place the pin on the map instead.", variant: "destructive" }); return; }
    setForm({ ...form, latitude: String(hit.lat), longitude: String(hit.lng) });
  };

  const remove = async () => {
    const { error } = await supabase.from("destination_sites").delete().eq("id", site.id);
    if (error) { toast({ title: "Delete failed", description: error.message, variant: "destructive" }); return; }
    onChanged();
  };

  const hasCoords = !!form.latitude && !!form.longitude;

  return (
    <div className={`rounded-xl bg-card p-4 shadow-card space-y-3 transition-shadow ${isActive ? "ring-2 ring-primary/40" : ""}`}>
      <div className="flex flex-wrap items-center gap-2">
        <span className={`text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full ${hasCoords ? "bg-primary/10 text-primary" : "bg-secondary text-muted-foreground"}`}>
          {hasCoords ? "Pinned" : "No pin"}
        </span>
        <span className="text-sm font-semibold text-foreground truncate">{form.name || "Untitled site"}</span>
        {draftPayload && <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-primary/10 text-primary">Draft</span>}
        <Button size="sm" variant={isActive ? "default" : "outline"} className="rounded-full gap-1 text-xs ml-auto" onClick={onActivate}>
          <MapIcon className="w-3 h-3" /> {isActive ? "Placing on map" : "Place on map"}
        </Button>
      </div>

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
        <Field label="Longitude">
          <div className="flex gap-2">
            <Input value={form.longitude} onChange={e => setForm({ ...form, longitude: e.target.value })} />
            <Button size="sm" variant="outline" className="rounded-full gap-1 text-xs shrink-0" disabled={locating} onClick={locate}>
              <Crosshair className="w-3 h-3" /> {locating ? "…" : "Locate"}
            </Button>
          </div>
        </Field>
        <Field label="Image URL"><Input value={form.image_url} onChange={e => setForm({ ...form, image_url: e.target.value })} placeholder="https://…" /></Field>
      </div>

      <div className="rounded-lg bg-secondary/40 p-3">
        <p className="text-[11px] uppercase tracking-wide text-muted-foreground font-semibold flex items-center gap-1.5 mb-2">
          <ImageIcon className="w-3 h-3" /> Thumbnail shown on the public destination page
        </p>
        <div className="flex items-center gap-4">
          {form.image_url
            ? <img src={form.image_url} alt={form.name} className="w-16 h-16 rounded-lg object-cover shadow-card" />
            : <div className="w-16 h-16 rounded-lg bg-secondary flex items-center justify-center text-muted-foreground"><ImageIcon className="w-5 h-5" /></div>}
          {user?.id && (
            <ImageUpload
              bucket="experience-images"
              folder={user.id}
              currentUrl={form.image_url || null}
              onUpload={(url) => setForm(f => ({ ...f, image_url: url }))}
              className="flex-1"
            />
          )}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <label className="flex items-center gap-2 text-xs text-muted-foreground mr-2">
          <Switch checked={form.is_published} onCheckedChange={v => setForm({ ...form, is_published: v })} />
          {form.is_published ? "Visible on public map" : "Hidden (draft)"}
        </label>
        <Button size="sm" variant="outline" className="rounded-full text-xs gap-1" disabled={saving} onClick={saveSiteDraft}>
          <FileEdit className="w-3 h-3" /> Save draft
        </Button>
        <Button size="sm" className="rounded-full text-xs gap-1" disabled={saving} onClick={save}>
          <Rocket className="w-3 h-3" /> {saving ? "Saving…" : "Publish site"}
        </Button>
        <Button size="sm" variant="outline" className="rounded-full text-xs text-destructive gap-1" onClick={remove}><Trash2 className="w-3 h-3" /> Remove</Button>
      </div>
    </div>
  );
};



export default DestinationsTab;
