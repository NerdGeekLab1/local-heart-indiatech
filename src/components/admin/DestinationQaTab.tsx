import { useEffect, useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { AlertTriangle, CheckCircle2, Download, MapPin, Search, ShieldCheck, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import AdminPagination from "@/components/admin/AdminPagination";
import { useAdminDestinations, useAllDestinationSites, slugify } from "@/hooks/useDestinations";
import { destinations as staticDestinations } from "@/lib/data";
import { buildDestinationSeed, type SeedDestination } from "@/lib/destinationSeed";

type Severity = "error" | "warning";
/** A one-click repair: either a patch on the destination row or a per-site patch. */
interface Fix {
  label: string;
  destinationPatch?: Record<string, any>;
  sitePatch?: { ids: string[]; patch: Record<string, any> };
  siteCoords?: { id: string; latitude: number; longitude: number }[];
}
interface Issue { severity: Severity; field: string; message: string; fix?: Fix }
interface AuditRow {
  id: string | null;
  name: string;
  slug: string;
  state: string;
  published: boolean;
  siteCount: number;
  issues: Issue[];
}

const err = (field: string, message: string, fix?: Fix): Issue => ({ severity: "error", field, message, fix });
const warn = (field: string, message: string, fix?: Fix): Issue => ({ severity: "warning", field, message, fix });

/** Validates the destinationSeed import: flags missing coordinates, thumbnails, regions, seasons and required fields. */
const DestinationQaTab = () => {
  const { toast } = useToast();
  const qc = useQueryClient();
  const { data: rows = [], isLoading } = useAdminDestinations();
  const { data: sites = [] } = useAllDestinationSites();
  const [query, setQuery] = useState("");
  const [onlyProblems, setOnlyProblems] = useState(true);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [fixing, setFixing] = useState<string | null>(null);

  const seed = useMemo(() => buildDestinationSeed(staticDestinations as any[]), []);
  const seedBySlug = useMemo(() => new Map(seed.map(s => [slugify(s.slug), s])), [seed]);

  useEffect(() => { setPage(0); }, [query, onlyProblems]);

  const audit = useMemo<AuditRow[]>(() => {
    const bySlug = new Map(rows.map(r => [r.slug, r]));
    const list: AuditRow[] = rows.map(d => {
      const issues: Issue[] = [];
      const mySites = sites.filter(s => s.destination_id === d.id);
      const s: SeedDestination | undefined = seedBySlug.get(d.slug);

      if (!d.state?.trim()) issues.push(err("region", "No state / region set — destination is missing from region filters",
        s?.state ? { label: `Set region to “${s.state}”`, destinationPatch: { state: s.state } } : undefined));
      if (!d.tagline?.trim()) issues.push(err("tagline", "Tagline missing",
        s?.tagline ? { label: "Fill tagline from built-in seed", destinationPatch: { tagline: s.tagline } } : undefined));
      if (!d.description?.trim()) issues.push(err("description", "Description missing",
        s?.description ? { label: "Fill description from built-in seed", destinationPatch: { description: s.description } } : undefined));
      if (d.latitude == null || d.longitude == null) issues.push(err("coordinates", "No map coordinates — will not appear on the public map",
        s?.latitude != null && s?.longitude != null
          ? { label: `Apply seed pin ${s.latitude}, ${s.longitude}`, destinationPatch: { latitude: s.latitude, longitude: s.longitude } }
          : undefined));
      if (!d.best_season?.trim()) issues.push(warn("season", "Best season missing — excluded from season filtering",
        s?.best_season ? { label: `Set season to “${s.best_season}”`, destinationPatch: { best_season: s.best_season } } : undefined));
      if (!(d.experience_tags || []).length) issues.push(warn("experience tags", "No experience tags — excluded from experience filtering",
        s?.experience_tags?.length ? { label: `Apply ${s.experience_tags.length} seed tags`, destinationPatch: { experience_tags: s.experience_tags } } : undefined));
      if (!(d.hero_images || []).length) issues.push(warn("thumbnail", "No hero image — public page falls back to a stock photo",
        s?.hero_images?.length ? { label: "Apply seed hero image", destinationPatch: { hero_images: s.hero_images } } : undefined));
      if (!(d.highlights || []).length) issues.push(warn("highlights", "No highlights listed",
        s?.highlights?.length ? { label: `Apply ${s.highlights.length} seed highlights`, destinationPatch: { highlights: s.highlights } } : undefined));
      if (!Array.isArray(d.itinerary) || d.itinerary.length === 0) issues.push(warn("itinerary", "No itinerary — a sample route is generated instead",
        s?.itinerary?.length ? { label: "Apply seed itinerary", destinationPatch: { itinerary: s.itinerary } } : undefined));
      if (mySites.length === 0) issues.push(err("sites", "No sites & monuments added"));

      const noCoords = mySites.filter(x => x.latitude == null || x.longitude == null);
      const noThumb = mySites.filter(x => !x.image_url);
      const noDesc = mySites.filter(x => !x.description?.trim());
      const unpublished = mySites.filter(x => x.is_published === false);

      if (noCoords.length) {
        // Derive pins around the destination centre so every site lands on the map.
        const baseLat = d.latitude ?? s?.latitude ?? null;
        const baseLng = d.longitude ?? s?.longitude ?? null;
        const siteCoords = baseLat != null && baseLng != null
          ? noCoords.map((x, j) => ({
              id: x.id,
              latitude: Number((baseLat + (j % 3) * 0.012 - 0.012).toFixed(6)),
              longitude: Number((baseLng + Math.floor(j / 3) * 0.012 - 0.006).toFixed(6)),
            }))
          : undefined;
        issues.push(err("site coordinates",
          `${noCoords.length} site(s) without map pins: ${noCoords.slice(0, 3).map(x => x.name).join(", ")}${noCoords.length > 3 ? "…" : ""}`,
          siteCoords ? { label: `Generate ${siteCoords.length} pins near the city centre`, siteCoords } : undefined));
      }
      if (noThumb.length) issues.push(warn("site thumbnails", `${noThumb.length} site(s) without a thumbnail`,
        (d.hero_images || [])[0] || s?.hero_images?.[0]
          ? { label: "Use the destination hero image as fallback", sitePatch: { ids: noThumb.map(x => x.id), patch: { image_url: (d.hero_images || [])[0] || s?.hero_images?.[0] } } }
          : undefined));
      if (noDesc.length) issues.push(warn("site description", `${noDesc.length} site(s) without a description`,
        { label: "Generate a short description for each", sitePatch: { ids: noDesc.map(x => x.id), patch: { __describe: `${d.name}, ${d.state}` } } }));
      if (unpublished.length) issues.push(warn("site draft", `${unpublished.length} site(s) held back from the public map`,
        { label: `Publish ${unpublished.length} site(s)`, sitePatch: { ids: unpublished.map(x => x.id), patch: { is_published: true } } }));

      return { id: d.id, name: d.name, slug: d.slug, state: d.state, published: d.is_published, siteCount: mySites.length, issues };
    });

    // Seed entries that were never imported
    for (const s of seed) {
      if (!bySlug.has(slugify(s.slug))) {
        list.push({
          id: null, name: s.name, slug: s.slug, state: s.state, published: false, siteCount: s.sites.length,
          issues: [err("import", "Present in the built-in seed but never imported — run “Import built-in list”")],
        });
      }
    }
    return list.sort((a, b) => b.issues.length - a.issues.length);
  }, [rows, sites, seed, seedBySlug]);

  const filtered = audit.filter(a => {
    const q = query.trim().toLowerCase();
    if (q && !`${a.name} ${a.state} ${a.slug}`.toLowerCase().includes(q)) return false;
    if (onlyProblems && a.issues.length === 0) return false;
    return true;
  });
  const pageRows = filtered.slice(page * pageSize, page * pageSize + pageSize);

  const errors = audit.reduce((s, a) => s + a.issues.filter(i => i.severity === "error").length, 0);
  const warnings = audit.reduce((s, a) => s + a.issues.filter(i => i.severity === "warning").length, 0);
  const clean = audit.filter(a => a.issues.length === 0).length;
  const fixable = audit.reduce((s, a) => s + a.issues.filter(i => i.fix).length, 0);

  const refresh = () => {
    qc.invalidateQueries({ queryKey: ["admin-destinations"] });
    qc.invalidateQueries({ queryKey: ["admin-destination-sites"] });
    qc.invalidateQueries({ queryKey: ["public-destinations"] });
  };

  const applyFix = async (row: AuditRow, issue: Issue, key: string) => {
    const fix = issue.fix;
    if (!fix || !row.id) return;
    setFixing(key);
    try {
      if (fix.destinationPatch) {
        const { error } = await supabase.from("destinations").update(fix.destinationPatch as never).eq("id", row.id);
        if (error) throw error;
      }
      if (fix.siteCoords) {
        for (const c of fix.siteCoords) {
          const { error } = await supabase.from("destination_sites")
            .update({ latitude: c.latitude, longitude: c.longitude } as never).eq("id", c.id);
          if (error) throw error;
        }
      }
      if (fix.sitePatch) {
        const { __describe, ...rest } = fix.sitePatch.patch as any;
        for (const id of fix.sitePatch.ids) {
          const site = sites.find(s => s.id === id);
          const patch = __describe
            ? { description: `${site?.name} — a signature stop in ${__describe}.` }
            : rest;
          const { error } = await supabase.from("destination_sites").update(patch as never).eq("id", id);
          if (error) throw error;
        }
      }
      refresh();
      toast({ title: "Fix applied", description: `${row.name}: ${issue.field}` });
    } catch (e: any) {
      toast({ title: "Fix failed", description: e.message, variant: "destructive" });
    } finally {
      setFixing(null);
    }
  };

  const fixAll = async (row: AuditRow) => {
    for (const [idx, issue] of row.issues.entries()) {
      if (issue.fix) await applyFix(row, issue, `${row.slug}-${idx}`);
    }
  };

  const exportCsv = () => {
    const lines = ["destination,slug,state,published,sites,severity,field,issue,suggested_fix"];
    for (const a of audit) {
      for (const i of a.issues) {
        lines.push([a.name, a.slug, a.state, a.published, a.siteCount, i.severity, i.field,
          `"${i.message.replace(/"/g, "'")}"`, `"${(i.fix?.label || "manual").replace(/"/g, "'")}"`].join(","));
      }
    }
    const url = URL.createObjectURL(new Blob([lines.join("\n")], { type: "text/csv" }));
    const link = document.createElement("a");
    link.href = url; link.download = "destination-import-audit.csv"; link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="mt-4 space-y-4" data-testid="destination-qa-tab">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2"><ShieldCheck className="w-5 h-5 text-primary" /> Destination Import QA</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Validates the built-in destination seed against what is live: missing coordinates, thumbnails, regions, seasons, sites and required copy — with one-click fixes.
          </p>
        </div>
        <Button size="sm" variant="outline" className="rounded-full gap-1 text-xs" onClick={exportCsv}>
          <Download className="w-3 h-3" /> Export report
        </Button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {[
          { label: "Destinations checked", value: audit.length, color: "text-foreground" },
          { label: "Blocking issues", value: errors, color: "text-destructive" },
          { label: "Warnings", value: warnings, color: "text-primary" },
          { label: "One-click fixable", value: fixable, color: "text-primary" },
          { label: "Fully complete", value: clean, color: "text-accent" },
        ].map(s => (
          <div key={s.label} className="rounded-xl bg-card p-3 shadow-card">
            <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-[11px] text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative max-w-sm flex-1">
          <Search className="w-3.5 h-3.5 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
          <Input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search destinations" className="pl-9 h-9 text-sm" />
        </div>
        <Button size="sm" variant={onlyProblems ? "default" : "outline"} className="rounded-full text-xs" onClick={() => setOnlyProblems(v => !v)}>
          {onlyProblems ? "Showing issues only" : "Showing all"}
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-2">{[0, 1, 2].map(i => <div key={i} className="h-20 rounded-xl bg-muted animate-pulse" />)}</div>
      ) : filtered.length === 0 ? (
        <div className="rounded-xl border-2 border-dashed border-border p-10 text-center">
          <CheckCircle2 className="w-8 h-8 text-accent mx-auto mb-2" />
          <p className="font-semibold text-foreground">Nothing to fix</p>
          <p className="text-sm text-muted-foreground mt-1">Every imported destination has coordinates, thumbnails, a region, a season and sites.</p>
        </div>
      ) : (
        <>
          <div className="space-y-3">
            {pageRows.map(a => {
              const autoFixable = a.issues.filter(i => i.fix).length;
              return (
                <div key={a.slug} className="rounded-xl bg-card p-4 shadow-card">
                  <div className="flex flex-wrap items-center gap-2">
                    <MapPin className="w-4 h-4 text-primary" />
                    <h3 className="font-bold text-foreground">{a.name}</h3>
                    <span className="text-xs bg-secondary text-muted-foreground px-2 py-0.5 rounded-full">{a.state || "no region"}</span>
                    <span className="text-xs text-muted-foreground">{a.siteCount} sites</span>
                    {!a.id && <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-destructive/10 text-destructive">Not imported</span>}
                    {a.id && !a.published && <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-primary/10 text-primary">Draft / hidden</span>}
                    {a.issues.length === 0 && <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-accent/10 text-accent ml-auto">Complete</span>}
                    {autoFixable > 1 && (
                      <Button size="sm" variant="outline" className="rounded-full text-xs gap-1 ml-auto"
                        disabled={!!fixing} onClick={() => fixAll(a)}>
                        <Wand2 className="w-3 h-3" /> Fix all {autoFixable}
                      </Button>
                    )}
                  </div>
                  {a.issues.length > 0 && (
                    <ul className="mt-3 space-y-1.5">
                      {a.issues.map((i, idx) => {
                        const key = `${a.slug}-${idx}`;
                        return (
                          <li key={idx} className="flex flex-wrap items-start gap-2 text-sm">
                            <AlertTriangle className={`w-3.5 h-3.5 mt-0.5 shrink-0 ${i.severity === "error" ? "text-destructive" : "text-primary"}`} />
                            <span className="text-muted-foreground flex-1 min-w-[200px]">
                              <span className="font-medium text-foreground">{i.field}:</span> {i.message}
                            </span>
                            {i.fix ? (
                              <Button size="sm" variant="secondary" className="rounded-full text-[11px] h-7 gap-1"
                                disabled={fixing === key || !!fixing} onClick={() => applyFix(a, i, key)}>
                                <Wand2 className="w-3 h-3" /> {fixing === key ? "Fixing…" : i.fix.label}
                              </Button>
                            ) : (
                              <span className="text-[11px] text-muted-foreground/70 italic">manual fix</span>
                            )}
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>
              );
            })}
          </div>
          <AdminPagination page={page} total={filtered.length} pageSize={pageSize} onPage={setPage} onPageSize={setPageSize} alwaysShow />
        </>
      )}
    </div>
  );
};

export default DestinationQaTab;
