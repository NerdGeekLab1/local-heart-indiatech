import { useMemo, useState } from "react";
import { Beaker, RotateCcw, Users, Shield, Compass, Home, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FEATURE_REGISTRY, latestVersion, type Audience } from "@/lib/featureRegistry";
import { useTestMode } from "@/hooks/useTestMode";

const AUDIENCES: { id: Audience; label: string; icon: typeof Users }[] = [
  { id: "admin", label: "Admin", icon: Shield },
  { id: "host", label: "Host", icon: Home },
  { id: "traveler", label: "Traveler", icon: Compass },
  { id: "user", label: "Guest user", icon: Users },
];

const statusStyle: Record<string, string> = {
  live: "bg-primary/15 text-primary",
  beta: "bg-accent/20 text-accent-foreground",
  planned: "bg-secondary text-muted-foreground",
};

export default function TestModePanel() {
  const { state, update, setRollout, toggleAudience, reset } = useTestMode();
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);

  const features = useMemo(() => {
    const q = search.trim().toLowerCase();
    return FEATURE_REGISTRY.filter(f =>
      !q || f.name.toLowerCase().includes(q) || f.key.includes(q) || f.area.toLowerCase().includes(q)
    );
  }, [search]);

  const activeRollouts = Object.values(state.rollouts).filter(r => r.enabled).length;

  return (
    <div className="space-y-5">
      {/* Control bar */}
      <div className="rounded-2xl bg-card shadow-card p-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Beaker className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground">Test Mode</h2>
              <p className="text-xs text-muted-foreground">
                Pin feature versions to a specific audience and preview the product as that role before rollout.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-xs px-2 py-1 rounded-full font-medium ${state.enabled ? "bg-primary/15 text-primary" : "bg-secondary text-muted-foreground"}`}>
              {state.enabled ? `Active · ${activeRollouts} pinned` : "Inactive"}
            </span>
            <Button size="sm" className="rounded-full" onClick={() => update({ enabled: !state.enabled })}>
              {state.enabled ? "Turn off" : "Turn on"}
            </Button>
            <Button size="sm" variant="outline" className="rounded-full gap-1.5" onClick={reset}>
              <RotateCcw className="h-3.5 w-3.5" /> Reset
            </Button>
          </div>
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-1.5">Preview as</p>
            <div className="flex flex-wrap gap-1.5">
              {AUDIENCES.map(a => (
                <button
                  key={a.id}
                  onClick={() => update({ simulatedRole: a.id })}
                  className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs transition-colors ${
                    state.simulatedRole === a.id ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground hover:bg-secondary/70"
                  }`}
                >
                  <a.icon className="h-3.5 w-3.5" /> {a.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-1.5">Target a specific user (optional)</p>
            <Input
              value={state.simulatedUserId}
              onChange={(e) => update({ simulatedUserId: e.target.value })}
              placeholder="user id (uuid)"
              className="h-9 text-xs"
            />
          </div>
        </div>
      </div>

      <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search features, areas or keys…" className="h-10" />

      {/* Feature registry */}
      <div className="space-y-3">
        {features.map(f => {
          const rollout = state.rollouts[f.key];
          const pinned = rollout?.version || latestVersion(f).version;
          const open = expanded === f.key;
          return (
            <div key={f.key} className="rounded-2xl bg-card shadow-card overflow-hidden">
              <div className="flex flex-wrap items-center justify-between gap-3 p-4">
                <button className="text-left min-w-0" onClick={() => setExpanded(open ? null : f.key)}>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-foreground">{f.name}</h3>
                    <span className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-secondary text-muted-foreground">{f.area}</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${statusStyle[latestVersion(f).status]}`}>
                      v{latestVersion(f).version} · {latestVersion(f).status}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5 truncate">
                    {f.key} · {f.routes.length} routes · {f.tables.length} tables
                  </p>
                </button>

                <div className="flex items-center gap-2">
                  <select
                    value={pinned}
                    onChange={(e) => setRollout(f.key, { version: e.target.value })}
                    className="rounded-lg border border-border bg-background px-2 py-1.5 text-xs text-foreground"
                  >
                    {f.versions.map(v => <option key={v.version} value={v.version}>v{v.version}</option>)}
                  </select>
                  <Button
                    size="sm"
                    variant={rollout?.enabled ? "default" : "outline"}
                    className="rounded-full text-xs"
                    onClick={() => setRollout(f.key, { enabled: !rollout?.enabled, version: pinned })}
                  >
                    {rollout?.enabled ? <><CheckCircle2 className="h-3.5 w-3.5 mr-1" /> Pinned</> : "Pin version"}
                  </Button>
                </div>
              </div>

              <div className="px-4 pb-4">
                <p className="text-[11px] font-medium text-muted-foreground mb-1.5">Exposed to</p>
                <div className="flex flex-wrap gap-1.5">
                  {AUDIENCES.filter(a => f.audiences.includes(a.id)).map(a => {
                    const on = rollout?.audiences?.includes(a.id);
                    return (
                      <button
                        key={a.id}
                        onClick={() => toggleAudience(f.key, a.id)}
                        className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] transition-colors ${
                          on ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:bg-secondary/70"
                        }`}
                      >
                        <a.icon className="h-3 w-3" /> {a.label}
                      </button>
                    );
                  })}
                  {!rollout?.audiences?.length && (
                    <span className="text-[11px] text-muted-foreground self-center">no audience selected → everyone</span>
                  )}
                </div>
              </div>

              {open && (
                <div className="border-t border-border bg-secondary/30 p-4 space-y-3">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <p className="text-[11px] font-semibold text-muted-foreground mb-1">Routes</p>
                      <div className="flex flex-wrap gap-1">
                        {f.routes.map(r => <code key={r} className="text-[11px] bg-background rounded px-1.5 py-0.5">{r}</code>)}
                      </div>
                    </div>
                    <div>
                      <p className="text-[11px] font-semibold text-muted-foreground mb-1">Database tables</p>
                      <div className="flex flex-wrap gap-1">
                        {f.tables.length ? f.tables.map(t => <code key={t} className="text-[11px] bg-background rounded px-1.5 py-0.5">{t}</code>) : <span className="text-[11px] text-muted-foreground">—</span>}
                      </div>
                    </div>
                  </div>
                  <div>
                    <p className="text-[11px] font-semibold text-muted-foreground mb-1.5">Version history</p>
                    <ol className="space-y-2">
                      {[...f.versions].reverse().map(v => (
                        <li key={v.version} className="rounded-lg bg-background p-2.5">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-sm text-foreground">v{v.version}</span>
                            <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${statusStyle[v.status]}`}>{v.status}</span>
                            <span className="text-[11px] text-muted-foreground">{v.released}</span>
                          </div>
                          <p className="text-xs text-foreground mt-0.5">{v.summary}</p>
                          <ul className="mt-1 list-disc pl-4 text-[11px] text-muted-foreground">
                            {v.changes.map(c => <li key={c}>{c}</li>)}
                          </ul>
                        </li>
                      ))}
                    </ol>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
