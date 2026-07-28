import { Link } from "react-router-dom";
import { BookOpen, Github, FileCode2, Database, Rocket, Map, History, ArrowUpRight, Package, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FEATURE_REGISTRY } from "@/lib/featureRegistry";

/** Current documentation bundle version — bump whenever docs change. */
const DOC_VERSION = "1.4";

const docVersionHistory = [
  { version: "1.4", date: "2026-07-28", summary: "Docs hub migrated from public footer into Admin Console", changes: ["Admin-only Docs tab", "Split moderation docs (feed vs reviews)", "Tabular admin views documented", "Legal pages: Terms, Privacy, Cookie policies separated"] },
  { version: "1.3", date: "2026-07-27", summary: "API package & portable database schema export", changes: ["Postman collection for mobile-app development", "docs/db/schema.sql for external Supabase migration", "Test Mode + feature version registry"] },
  { version: "1.2", date: "2026-04-01", summary: "Live analytics & performance tooling", changes: ["Real-time admin analytics", "React Query cached tabs", "/admin/performance profiler", "SPA rewrite rules for Apache/Hostinger"] },
  { version: "1.1", date: "2026-03-05", summary: "Traveler Feed & social layer", changes: ["/feed Instagram-style stories", "Live Atlas map filtering", "Bookmarks, traveler profiles", "Feed moderation panel"] },
  { version: "1.0", date: "2025-03-01", summary: "Initial documentation bundle", changes: ["Project overview & architecture", "Database schema reference", "API & routes map", "Setup & contributing guides"] },
];

const inAppDocSections = [
  "Project Overview", "Architecture", "Database Schema", "API & Routes", "Authentication & Roles",
  "Feature List", "Setup Guide", "Contributing", "Roadmap", "Changelog",
];

const repoFiles = [
  { icon: FileCode2, name: "PROJECT_DOCUMENTATION.md", path: "PROJECT_DOCUMENTATION.md", desc: "Full feature list, 40+ routes, tech stack reference" },
  { icon: Map, name: "Travelista_Roadmap.md", path: "Travelista_Roadmap.md", desc: "Phased roadmap incl. Phase 5 — Luggage Companion programme" },
  { icon: Package, name: "API Package (Postman)", path: "docs/api/travelista.postman_collection.json", desc: "33 tables, RPCs, edge functions & storage — import into Postman for the mobile app" },
  { icon: FileText, name: "API Guide", path: "docs/api/README.md", desc: "Auth, REST, RPC and storage conventions for API consumers" },
  { icon: Database, name: "Database Schema Export", path: "docs/db/schema.sql", desc: "Portable migration: tables, grants, RLS, functions, triggers, buckets" },
];

const DocsTab = () => (
  <div className="mt-6 space-y-6">
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <div>
        <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-primary" /> Documentation Hub
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Everything that used to live in the public footer — What's New, in-app docs and GitHub docs — now lives here, versioned with the platform.
        </p>
      </div>
      <span className="text-xs font-bold px-3 py-1.5 rounded-full bg-primary/10 text-primary shrink-0">Docs v{DOC_VERSION}</span>
    </div>

    {/* Quick links: In-app docs + GitHub */}
    <div className="grid sm:grid-cols-2 gap-4">
      <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
        <div className="flex items-center gap-2 mb-2">
          <BookOpen className="w-4 h-4 text-primary" />
          <h3 className="font-bold text-foreground">In-app Docs</h3>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-accent/10 text-accent ml-auto">v{DOC_VERSION}</span>
        </div>
        <p className="text-xs text-muted-foreground mb-3">
          The interactive developer portal — unchanged from the public site, now linked from here instead of the footer.
        </p>
        <div className="flex flex-wrap gap-1.5 mb-4">
          {inAppDocSections.map(s => (
            <span key={s} className="text-[10px] bg-secondary text-muted-foreground px-2 py-0.5 rounded-full">{s}</span>
          ))}
        </div>
        <Button asChild size="sm" className="rounded-full text-xs gap-1">
          <Link to="/docs">Open /docs <ArrowUpRight className="w-3 h-3" /></Link>
        </Button>
      </div>

      <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
        <div className="flex items-center gap-2 mb-2">
          <Github className="w-4 h-4 text-primary" />
          <h3 className="font-bold text-foreground">GitHub Docs</h3>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-accent/10 text-accent ml-auto">v{DOC_VERSION}</span>
        </div>
        <p className="text-xs text-muted-foreground mb-3">
          Source-controlled markdown docs in the repository — the canonical reference for engineering.
        </p>
        <div className="space-y-2 mb-4">
          {repoFiles.map(f => (
            <div key={f.path} className="flex items-start gap-2 text-xs">
              <f.icon className="w-3.5 h-3.5 text-primary mt-0.5 shrink-0" />
              <div className="min-w-0">
                <code className="text-foreground font-medium break-all">{f.path}</code>
                <p className="text-muted-foreground">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
        <Button asChild size="sm" variant="outline" className="rounded-full text-xs gap-1">
          <a href="https://github.com/lovable-dev/travelista" target="_blank" rel="noopener noreferrer">
            <Github className="w-3 h-3" /> Open repository
          </a>
        </Button>
      </div>
    </div>

    {/* What's New — doc changelog */}
    <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
      <div className="flex items-center gap-2 mb-4">
        <Rocket className="w-4 h-4 text-primary" />
        <h3 className="font-bold text-foreground">What's New — Documentation Changelog</h3>
      </div>
      <div className="space-y-3">
        {docVersionHistory.map(v => (
          <div key={v.version} className="rounded-xl bg-secondary/30 p-4">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-primary text-primary-foreground">v{v.version}</span>
              <span className="text-xs text-muted-foreground">{v.date}</span>
              <span className="text-sm font-semibold text-foreground">{v.summary}</span>
            </div>
            <ul className="mt-2 space-y-0.5">
              {v.changes.map(c => <li key={c} className="text-xs text-muted-foreground">• {c}</li>)}
            </ul>
          </div>
        ))}
      </div>
    </div>

    {/* Platform feature versions */}
    <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
      <div className="flex items-center gap-2 mb-1">
        <History className="w-4 h-4 text-primary" />
        <h3 className="font-bold text-foreground">Platform Feature Versions</h3>
      </div>
      <p className="text-xs text-muted-foreground mb-4">Live snapshot from the feature registry — the same source Test Mode uses for rollouts.</p>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-secondary/40 text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="text-left font-semibold px-4 py-2.5">Feature</th>
              <th className="text-left font-semibold px-4 py-2.5">Area</th>
              <th className="text-left font-semibold px-4 py-2.5">Latest</th>
              <th className="text-left font-semibold px-4 py-2.5">Status</th>
              <th className="text-left font-semibold px-4 py-2.5">Versions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {FEATURE_REGISTRY.map(f => {
              const latest = f.versions[f.versions.length - 1];
              return (
                <tr key={f.key} className="hover:bg-secondary/20">
                  <td className="px-4 py-2.5 font-medium text-foreground">{f.name}</td>
                  <td className="px-4 py-2.5 text-muted-foreground">{f.area}</td>
                  <td className="px-4 py-2.5"><span className="text-xs font-bold text-primary">v{latest.version}</span></td>
                  <td className="px-4 py-2.5">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${latest.status === "live" ? "bg-accent/10 text-accent" : latest.status === "beta" ? "bg-primary/10 text-primary" : "bg-secondary text-muted-foreground"}`}>
                      {latest.status}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-xs text-muted-foreground">
                    {f.versions.map(v => `v${v.version}`).join(" · ")}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  </div>
);

export default DocsTab;
