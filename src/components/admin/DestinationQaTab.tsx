import { useMemo, useState } from "react";
import { AlertTriangle, CheckCircle2, Download, MapPin, Search, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAdminDestinations, useAllDestinationSites, slugify } from "@/hooks/useDestinations";
import { destinations as staticDestinations } from "@/lib/data";
import { buildDestinationSeed } from "@/lib/destinationSeed";

type Severity = "error" | "warning";
interface Issue { severity: Severity; field: string; message: string }
interface AuditRow {
  id: string | null;
  name: string;
  slug: string;
  state: string;
  published: boolean;
  siteCount: number;
  issues: Issue[];
}

const err = (field: string, message: string): Issue => ({ severity: "error", field, message });
const warn = (field: string, message: string): Issue => ({ severity: "warning", field, message });

/** Validates the destinationSeed import: flags missing coordinates, thumbnails, regions, seasons and required fields. */
const DestinationQaTab = () => {
  const { data: rows = [], isLoading } = useAdminDestinations();
  const { data: sites = [] } = useAllDestinationSites();
  const [query, setQuery] = useState("");
  const [onlyProblems, setOnlyProblems] = useState(true);

  const seed = useMemo(() => buildDestinationSeed(staticDestinations as any[]), []);

  const audit = useMemo<AuditRow[]>(() => {
    const bySlug = new Map(rows.map(r => [r.slug, r]));
    const list: AuditRow[] = rows.map(d => {
      const issues: Issue[] = [];
      const mySites = sites.filter(s => s.destination_id === d.id);

      if (!d.state?.trim()) issues.push(err("region", "No state / region set — destination is missing from region filters"));
      if (!d.tagline?.trim()) issues.push(err("tagline", "Tagline missing"));
      if (!d.description?.trim()) issues.push(err("description", "Description missing"));
      if (d.latitude == null || d.longitude == null) issues.push(err("coordinates", "No map coordinates — will not appear on the public map"));
      if (!d.best_season?.trim()) issues.push(warn("season", "Best season missing — excluded from season filtering"));
      if (!(d.experience_tags || []).length) issues.push(warn("experience tags", "No experience tags — excluded from experience filtering"));
      if (!(d.hero_images || []).length) issues.push(warn("thumbnail", "No hero image — public page falls back to a stock photo"));
      if (!(d.highlights || []).length) issues.push(warn("highlights", "No highlights listed"));
      if (!Array.isArray(d.itinerary) || d.itinerary.length === 0) issues.push(warn("itinerary", "No itinerary — a sample route is generated instead"));
      if (mySites.length === 0) issues.push(err("sites", "No sites & monuments added"));

      const noCoords = mySites.filter(s => s.latitude == null || s.longitude == null);
      const noThumb = mySites.filter(s => !s.image_url);
      const noDesc = mySites.filter(s => !s.description?.trim());
      const unpublished = mySites.filter(s => s.is_published === false);
      if (noCoords.length) issues.push(err("site coordinates", `${noCoords.length} site(s) without map pins: ${noCoords.slice(0, 3).map(s => s.name).join(", ")}${noCoords.length > 3 ? "…" : ""}`));
      if (noThumb.length) issues.push(warn("site thumbnails", `${noThumb.length} site(s) without a thumbnail`));
      if (noDesc.length) issues.push(warn("site description", `${noDesc.length} site(s) without a description`));
      if (unpublished.length) issues.push(warn("site draft", `${unpublished.length} site(s) held back from the public map`));

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
  }, [rows, sites, seed]);

  const filtered = audit.filter(a => {
    const q = query.trim().toLowerCase();
    if (q && !`${a.name} ${a.state} ${a.slug}`.toLowerCase().includes(q)) return false;
    if (onlyProblems && a.issues.length === 0) return false;
    return true;
  });

  const errors = audit.reduce((s, a) => s + a.issues.filter(i => i.severity === "error").length, 0);
  const warnings = audit.reduce((s, a) => s + a.issues.filter(i => i.severity === "warning").length, 0);
  const clean = audit.filter(a => a.issues.length === 0).length;

  const exportCsv = () => {
    const lines = ["destination,slug,state,published,sites,severity,field,issue"];
    for (const a of audit) {
      for (const i of a.issues) {
        lines.push([a.name, a.slug, a.state, a.published, a.siteCount, i.severity, i.field, `"${i.message.replace(/"/g, "'")}"`].join(","));
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
            Validates the built-in destination seed against what is live: missing coordinates, thumbnails, regions, seasons, sites and required copy.
          </p>
        </div>
        <Button size="sm" variant="outline" className="rounded-full gap-1 text-xs" onClick={exportCsv}>
          <Download className="w-3 h-3" /> Export report
        </Button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Destinations checked", value: audit.length, color: "text-foreground" },
          { label: "Blocking issues", value: errors, color: "text-destructive" },
          { label: "Warnings", value: warnings, color: "text-primary" },
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
        <div className="space-y-3">
          {filtered.map(a => (
            <div key={a.slug} className="rounded-xl bg-card p-4 shadow-card">
              <div className="flex flex-wrap items-center gap-2">
                <MapPin className="w-4 h-4 text-primary" />
                <h3 className="font-bold text-foreground">{a.name}</h3>
                <span className="text-xs bg-secondary text-muted-foreground px-2 py-0.5 rounded-full">{a.state || "no region"}</span>
                <span className="text-xs text-muted-foreground">{a.siteCount} sites</span>
                {!a.id && <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-destructive/10 text-destructive">Not imported</span>}
                {a.id && !a.published && <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-primary/10 text-primary">Draft / hidden</span>}
                {a.issues.length === 0 && <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-accent/10 text-accent ml-auto">Complete</span>}
              </div>
              {a.issues.length > 0 && (
                <ul className="mt-3 space-y-1.5">
                  {a.issues.map((i, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm">
                      <AlertTriangle className={`w-3.5 h-3.5 mt-0.5 shrink-0 ${i.severity === "error" ? "text-destructive" : "text-primary"}`} />
                      <span className="text-muted-foreground"><span className="font-medium text-foreground">{i.field}:</span> {i.message}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DestinationQaTab;
