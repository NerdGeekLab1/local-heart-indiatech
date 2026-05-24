import { useEffect, useMemo, useState } from "react";
import { Navigate } from "react-router-dom";
import { CheckCircle2, Filter, Mail, Search, Download } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Row {
  id: string;
  email: string;
  full_name: string | null;
  city: string | null;
  plan_interest: string | null;
  interest: string | null;
  referral_source: string | null;
  status: string;
  created_at: string;
  confirmed_at: string | null;
}

const PLANS = ["all", "explorer", "adventurer", "nomad"] as const;
const STATUSES = ["all", "pending", "confirmed"] as const;

export default function WaitlistAdmin() {
  const { user, userRole, loading } = useAuth();
  const { toast } = useToast();
  const [rows, setRows] = useState<Row[]>([]);
  const [plan, setPlan] = useState<(typeof PLANS)[number]>("all");
  const [status, setStatus] = useState<(typeof STATUSES)[number]>("all");
  const [q, setQ] = useState("");

  const load = async () => {
    const { data } = await supabase.from("beta_waitlist").select("*").order("created_at", { ascending: false });
    setRows((data ?? []) as Row[]);
  };
  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => rows.filter(r => {
    if (plan !== "all" && r.plan_interest !== plan) return false;
    if (status !== "all" && r.status !== status) return false;
    if (q && !`${r.email} ${r.full_name ?? ""} ${r.city ?? ""} ${r.interest ?? ""}`.toLowerCase().includes(q.toLowerCase())) return false;
    return true;
  }), [rows, plan, status, q]);

  if (loading) return null;
  if (userRole !== "admin") return <Navigate to="/" replace />;

  const confirm = async (id: string) => {
    const { error } = await supabase.from("beta_waitlist").update({ status: "confirmed", confirmed_at: new Date().toISOString() }).eq("id", id);
    if (error) toast({ title: "Failed", description: error.message, variant: "destructive" });
    else { toast({ title: "Marked confirmed" }); load(); }
  };

  const sendEmail = async (r: Row) => {
    if (!user) return;
    await supabase.from("email_notifications").insert({
      recipient_email: r.email,
      subject: "Your Travelista beta spot is live",
      template_name: "beta_waitlist_invite",
      trigger_event: "beta_waitlist_invite",
      body_html: `<p>Hi ${r.full_name || "traveler"},</p><p>Great news — your <strong>${r.plan_interest || "beta"}</strong> spot is ready! Sign in to start exploring.</p>`,
      payload: { waitlist_id: r.id, plan: r.plan_interest },
      sent_by: user.id,
    });
    toast({ title: "Email queued" });
  };

  const exportCsv = () => {
    const header = ["email", "full_name", "city", "plan_interest", "status", "interest", "referral_source", "created_at"];
    const csv = [header.join(",")].concat(filtered.map(r => header.map(k => JSON.stringify((r as any)[k] ?? "")).join(","))).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "beta-waitlist.csv";
    a.click();
  };

  const stats = {
    total: rows.length,
    pending: rows.filter(r => r.status === "pending").length,
    confirmed: rows.filter(r => r.status === "confirmed").length,
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-10 max-w-6xl">
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <div>
            <h1 className="text-3xl font-bold">Beta Waitlist</h1>
            <p className="text-muted-foreground text-sm">Review signups, filter by plan or status, and mark users as confirmed.</p>
          </div>
          <Button variant="outline" onClick={exportCsv}><Download className="w-4 h-4 mr-1" /> Export CSV</Button>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-6">
          {[
            { label: "Total", value: stats.total },
            { label: "Pending", value: stats.pending },
            { label: "Confirmed", value: stats.confirmed },
          ].map(s => (
            <div key={s.label} className="rounded-xl border bg-card p-4">
              <div className="text-xs text-muted-foreground">{s.label}</div>
              <div className="text-2xl font-bold">{s.value}</div>
            </div>
          ))}
        </div>

        <div className="flex gap-2 flex-wrap mb-4">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
            <Input value={q} onChange={e => setQ(e.target.value)} placeholder="Search email, name, city..." className="pl-9" />
          </div>
          <select className="h-10 rounded-md border bg-background px-3 text-sm" value={plan} onChange={e => setPlan(e.target.value as any)}>
            {PLANS.map(p => <option key={p} value={p}>Plan: {p}</option>)}
          </select>
          <select className="h-10 rounded-md border bg-background px-3 text-sm" value={status} onChange={e => setStatus(e.target.value as any)}>
            {STATUSES.map(s => <option key={s} value={s}>Status: {s}</option>)}
          </select>
        </div>

        <div className="rounded-xl border bg-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/40 text-xs uppercase tracking-wide">
                <tr>
                  <th className="text-left p-3">Name / Email</th>
                  <th className="text-left p-3">City</th>
                  <th className="text-left p-3">Plan</th>
                  <th className="text-left p-3">Status</th>
                  <th className="text-left p-3">Signed up</th>
                  <th className="text-right p-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(r => (
                  <tr key={r.id} className="border-t">
                    <td className="p-3">
                      <div className="font-medium">{r.full_name || "—"}</div>
                      <div className="text-xs text-muted-foreground">{r.email}</div>
                    </td>
                    <td className="p-3">{r.city || "—"}</td>
                    <td className="p-3"><Badge variant="outline" className="capitalize">{r.plan_interest || "—"}</Badge></td>
                    <td className="p-3">
                      <Badge variant={r.status === "confirmed" ? "default" : "secondary"} className="capitalize">{r.status}</Badge>
                    </td>
                    <td className="p-3 text-muted-foreground text-xs">{new Date(r.created_at).toLocaleDateString()}</td>
                    <td className="p-3 text-right space-x-2 whitespace-nowrap">
                      {r.status !== "confirmed" && (
                        <Button size="sm" onClick={() => confirm(r.id)}><CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Confirm</Button>
                      )}
                      <Button size="sm" variant="outline" onClick={() => sendEmail(r)}><Mail className="w-3.5 h-3.5 mr-1" /> Email</Button>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={6} className="p-8 text-center text-muted-foreground">No signups match these filters.</td></tr>
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
