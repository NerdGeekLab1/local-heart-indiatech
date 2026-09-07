import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AlertTriangle, ShieldAlert } from "lucide-react";

interface IssueRow {
  id: string;
  subject: string;
  description: string | null;
  category: string | null;
  status: string;
  priority: string | null;
  resolution: string | null;
  created_at: string;
}

const STATUS_STYLES: Record<string, string> = {
  open: "bg-destructive/10 text-destructive",
  in_progress: "bg-primary/10 text-primary",
  resolved: "bg-accent/10 text-accent",
  closed: "bg-secondary text-muted-foreground",
};

/**
 * Read-only view of grievances filed against the signed-in host.
 * Hosts can see what was raised and how it was resolved, but cannot edit —
 * mediation stays with admins.
 */
export default function HostIssuesRaised({ hostId }: { hostId: string }) {
  const [rows, setRows] = useState<IssueRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    let active = true;
    const load = async () => {
      const { data } = await supabase
        .from("grievances")
        .select("id, subject, description, category, status, priority, resolution, created_at")
        .eq("against", hostId)
        .order("created_at", { ascending: false });
      if (!active) return;
      setRows((data || []) as IssueRow[]);
      setLoading(false);
    };
    void load();
    const channel = supabase
      .channel(`host-issues-${hostId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "grievances", filter: `against=eq.${hostId}` }, () => { void load(); })
      .subscribe();
    return () => { active = false; void supabase.removeChannel(channel); };
  }, [hostId]);

  const visible = rows.filter(r => filter === "all" || r.status === filter);
  const openCount = rows.filter(r => r.status === "open").length;

  return (
    <section className="mt-6 space-y-4" aria-labelledby="host-issues-heading">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 id="host-issues-heading" className="text-xl font-bold text-foreground flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-primary" /> Issues Raised ({openCount} open)
          </h2>
          <p className="text-sm text-muted-foreground">Complaints travelers filed about your hosting. Our team mediates — reply through Messages if you want to explain.</p>
        </div>
        <select aria-label="Filter issue status" className="h-9 rounded-md border border-input bg-background px-2 text-sm text-foreground"
          value={filter} onChange={e => setFilter(e.target.value)}>
          <option value="all">All</option>
          <option value="open">Open</option>
          <option value="in_progress">In progress</option>
          <option value="resolved">Resolved</option>
          <option value="closed">Closed</option>
        </select>
      </div>

      {loading ? (
        <div className="rounded-lg bg-card p-8 text-center shadow-card text-sm text-muted-foreground">Loading issues…</div>
      ) : visible.length === 0 ? (
        <div className="rounded-lg bg-card p-8 text-center shadow-card">
          <AlertTriangle className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
          <p className="font-medium text-foreground">Nothing raised against you</p>
          <p className="text-sm text-muted-foreground">Keep it up — complaints would show here with their status.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {visible.map(r => (
            <div key={r.id} className="rounded-lg bg-card p-4 shadow-card">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="font-semibold text-foreground">{r.subject}</p>
                  <p className="text-xs text-muted-foreground">
                    {r.category ? `${r.category.replace(/_/g, " ")} · ` : ""}{new Date(r.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {r.priority && <span className="px-2 py-1 rounded-full text-xs font-medium bg-secondary text-muted-foreground">{r.priority}</span>}
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${STATUS_STYLES[r.status] || "bg-secondary text-muted-foreground"}`}>
                    {r.status.replace(/_/g, " ")}
                  </span>
                </div>
              </div>
              {r.description && <p className="mt-2 text-sm text-muted-foreground">{r.description}</p>}
              {r.resolution && (
                <p className="mt-3 rounded-md bg-secondary/50 px-3 py-2 text-sm text-foreground">
                  <span className="font-medium">Outcome:</span> {r.resolution}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
