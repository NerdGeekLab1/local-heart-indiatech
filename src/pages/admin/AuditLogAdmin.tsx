import { useEffect, useMemo, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { Shield, Search } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

interface Row {
  id: string;
  admin_id: string;
  entity_type: string;
  entity_id: string;
  action: string;
  previous_status: string | null;
  new_status: string | null;
  metadata: any;
  created_at: string;
}

const TYPES = ["all", "feature_flag", "user_feature_flag", "beta_waitlist", "experience"] as const;

export default function AuditLogAdmin() {
  const { userRole, loading } = useAuth();
  const [rows, setRows] = useState<Row[]>([]);
  const [type, setType] = useState<(typeof TYPES)[number]>("all");
  const [q, setQ] = useState("");

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("admin_audit_log")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(500);
      setRows((data ?? []) as Row[]);
    })();
  }, []);

  const filtered = useMemo(
    () =>
      rows.filter((r) => {
        if (type !== "all" && r.entity_type !== type) return false;
        if (q) {
          const blob = `${r.action} ${r.entity_type} ${r.admin_id} ${JSON.stringify(r.metadata ?? {})}`.toLowerCase();
          if (!blob.includes(q.toLowerCase())) return false;
        }
        return true;
      }),
    [rows, type, q]
  );

  if (loading) return null;
  if (userRole !== "admin") return <Navigate to="/" replace />;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-10 max-w-6xl">
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Shield className="w-7 h-7 text-primary" /> Admin Audit Log
            </h1>
            <p className="text-muted-foreground text-sm">Every flag change and waitlist confirmation is recorded here.</p>
          </div>
          <div className="flex gap-2">
            <Button asChild variant="outline" size="sm"><Link to="/admin/feature-flags">Flags</Link></Button>
            <Button asChild variant="outline" size="sm"><Link to="/admin/waitlist">Waitlist</Link></Button>
          </div>
        </div>

        <div className="flex gap-2 flex-wrap mb-4">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search action, admin id, metadata..." className="pl-9" />
          </div>
          <select className="h-10 rounded-md border bg-background px-3 text-sm" value={type} onChange={(e) => setType(e.target.value as any)}>
            {TYPES.map((t) => <option key={t} value={t}>Type: {t}</option>)}
          </select>
        </div>

        <div className="rounded-xl border bg-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/40 text-xs uppercase tracking-wide">
                <tr>
                  <th className="text-left p-3">When</th>
                  <th className="text-left p-3">Entity</th>
                  <th className="text-left p-3">Action</th>
                  <th className="text-left p-3">Status</th>
                  <th className="text-left p-3">Admin</th>
                  <th className="text-left p-3">Metadata</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => (
                  <tr key={r.id} className="border-t align-top">
                    <td className="p-3 whitespace-nowrap text-xs text-muted-foreground">{new Date(r.created_at).toLocaleString()}</td>
                    <td className="p-3"><Badge variant="outline">{r.entity_type}</Badge></td>
                    <td className="p-3 font-medium capitalize">{r.action}</td>
                    <td className="p-3 text-xs">
                      {r.previous_status && <span className="text-muted-foreground">{r.previous_status} → </span>}
                      {r.new_status || "—"}
                    </td>
                    <td className="p-3"><code className="text-xs">{r.admin_id.slice(0, 8)}…</code></td>
                    <td className="p-3 text-xs"><code className="text-xs">{r.metadata ? JSON.stringify(r.metadata) : "—"}</code></td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={6} className="p-8 text-center text-muted-foreground">No audit entries match these filters.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
