import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { BadgeCheck, ShieldCheck } from "lucide-react";

interface VerificationRow {
  id: string;
  host_id: string;
  status: string;
  review_notes: string | null;
  created_at: string;
  reviewed_at: string | null;
  milestone_snapshot: any;
  hostName?: string;
}

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-primary/10 text-primary",
  under_review: "bg-accent/10 text-accent",
  verified: "bg-accent/10 text-accent",
  rejected: "bg-destructive/10 text-destructive",
};

/**
 * Admin review queue for host "verified badge" applications
 * (host_verification_applications + review_host_verification RPC).
 */
export default function HostVerificationQueue() {
  const { toast } = useToast();
  const [rows, setRows] = useState<VerificationRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [statusFilter, setStatusFilter] = useState<string>("pending");
  const [busy, setBusy] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("host_verification_applications")
      .select("*")
      .order("created_at", { ascending: false });
    const list = (data || []) as VerificationRow[];
    const ids = [...new Set(list.map(r => r.host_id))];
    let names: Record<string, string> = {};
    if (ids.length) {
      const { data: profs } = await supabase.rpc("get_public_profiles", { _ids: ids });
      names = Object.fromEntries(((profs as any[]) || []).map(p => [p.id, `${p.first_name || ""} ${p.last_name || ""}`.trim()]));
    }
    setRows(list.map(r => ({ ...r, hostName: names[r.host_id] || "Host" })));
    setLoading(false);
  };

  useEffect(() => {
    load();
    const channel = supabase
      .channel("admin-host-verification")
      .on("postgres_changes", { event: "*", schema: "public", table: "host_verification_applications" }, () => { void load(); })
      .subscribe();
    return () => { void supabase.removeChannel(channel); };
  }, []);

  const review = async (id: string, status: "verified" | "rejected" | "under_review") => {
    setBusy(id);
    const { error } = await supabase.rpc("review_host_verification", { _application_id: id, _status: status, _notes: notes[id] || "" });
    setBusy(null);
    if (error) { toast({ title: "Could not update", description: error.message, variant: "destructive" }); return; }
    toast({ title: `Application ${status.replace("_", " ")}` });
    void load();
  };

  const visible = rows.filter(r => statusFilter === "all" || r.status === statusFilter);

  return (
    <section className="mt-8" aria-labelledby="host-verification-heading">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <h2 id="host-verification-heading" className="text-xl font-bold text-foreground flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-primary" /> Verification Requests ({rows.filter(r => r.status === "pending").length} pending)
          </h2>
          <p className="text-sm text-muted-foreground">Hosts applying for the verified badge after hitting their milestones.</p>
        </div>
        <select aria-label="Filter verification status" className="h-9 rounded-md border border-input bg-background px-2 text-sm text-foreground"
          value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option value="pending">Pending</option>
          <option value="under_review">Under review</option>
          <option value="verified">Verified</option>
          <option value="rejected">Rejected</option>
          <option value="all">All</option>
        </select>
      </div>

      {loading ? (
        <div className="rounded-lg bg-card p-8 text-center shadow-card text-sm text-muted-foreground">Loading requests…</div>
      ) : visible.length === 0 ? (
        <div className="rounded-lg bg-card p-8 text-center shadow-card">
          <BadgeCheck className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
          <p className="font-medium text-foreground">No verification requests here</p>
          <p className="text-sm text-muted-foreground">Requests appear as soon as a host applies from their dashboard.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {visible.map(r => {
            const snap = (r.milestone_snapshot || {}) as Record<string, any>;
            return (
              <div key={r.id} className="rounded-lg bg-card p-4 shadow-card">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-foreground">{r.hostName}</p>
                    <p className="text-xs text-muted-foreground">Applied {new Date(r.created_at).toLocaleDateString()}</p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${STATUS_STYLES[r.status] || "bg-secondary text-muted-foreground"}`}>
                    {r.status.replace("_", " ")}
                  </span>
                </div>

                {Object.keys(snap).length > 0 && (
                  <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {Object.entries(snap).slice(0, 8).map(([k, v]) => (
                      <div key={k} className="rounded-md bg-secondary/50 px-2 py-1.5">
                        <p className="text-[11px] uppercase tracking-wide text-muted-foreground">{k.replace(/_/g, " ")}</p>
                        <p className="text-sm font-medium text-foreground truncate">{typeof v === "object" ? JSON.stringify(v) : String(v)}</p>
                      </div>
                    ))}
                  </div>
                )}

                {r.review_notes && <p className="mt-3 text-sm text-muted-foreground">Notes: {r.review_notes}</p>}

                {r.status !== "verified" && r.status !== "rejected" && (
                  <div className="mt-3 flex flex-col sm:flex-row gap-2">
                    <Input className="h-9" placeholder="Review notes (optional)…" value={notes[r.id] || ""}
                      onChange={e => setNotes(p => ({ ...p, [r.id]: e.target.value }))} />
                    <div className="flex gap-2">
                      <Button size="sm" disabled={busy === r.id} onClick={() => review(r.id, "verified")}>Verify</Button>
                      <Button size="sm" variant="outline" disabled={busy === r.id} onClick={() => review(r.id, "under_review")}>Under review</Button>
                      <Button size="sm" variant="destructive" disabled={busy === r.id} onClick={() => review(r.id, "rejected")}>Reject</Button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
