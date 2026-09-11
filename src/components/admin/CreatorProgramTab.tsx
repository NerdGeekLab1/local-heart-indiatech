import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Camera, Loader2, Wallet } from "lucide-react";

interface CreatorRow {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  phone: string | null;
  city: string | null;
  niche: string | null;
  bio: string | null;
  total_followers: number;
  avg_views: number;
  portfolio_links: string[];
  payout_method: string | null;
  payout_details: string | null;
  tier: string;
  status: string;
  review_notes: string | null;
  created_at: string;
}

interface ContentRow {
  id: string;
  creator_id: string;
  platform: string;
  title: string;
  url: string;
  campaign: string | null;
  views: number;
  likes: number;
  clicks: number;
  bookings_attributed: number;
  reward_points: number;
  payout_amount: number;
  status: string;
  created_at: string;
}

interface PayoutRow {
  id: string;
  creator_id: string;
  amount_inr: number;
  period: string | null;
  status: string;
  paid_at: string | null;
  created_at: string;
}

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-primary/10 text-primary",
  submitted: "bg-primary/10 text-primary",
  under_review: "bg-accent/10 text-accent",
  approved: "bg-emerald-500/10 text-emerald-600",
  paid: "bg-emerald-500/10 text-emerald-600",
  rejected: "bg-destructive/10 text-destructive",
  paused: "bg-destructive/10 text-destructive",
};

const TIERS = ["rising", "creator", "signature"];
const inr = (n: number) => `₹${Math.round(n).toLocaleString("en-IN")}`;

/** Admin console for the creator program: applications, content approval, reward points and payouts. */
export default function CreatorProgramTab() {
  const { toast } = useToast();
  const [creators, setCreators] = useState<CreatorRow[]>([]);
  const [content, setContent] = useState<ContentRow[]>([]);
  const [payouts, setPayouts] = useState<PayoutRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState("pending");
  const [search, setSearch] = useState("");
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [tier, setTier] = useState<Record<string, string>>({});
  const [expanded, setExpanded] = useState<string | null>(null);
  const [reward, setReward] = useState<Record<string, { points: string; payout: string }>>({});
  const [payoutForm, setPayoutForm] = useState({ amount: "", period: "", method: "UPI", reference: "" });

  const load = async () => {
    setLoading(true);
    const [{ data: c }, { data: k }, { data: p }] = await Promise.all([
      supabase.from("creator_applications").select("*").order("created_at", { ascending: false }),
      supabase.from("creator_content").select("*").order("created_at", { ascending: false }),
      supabase.from("creator_payouts").select("*").order("created_at", { ascending: false }),
    ]);
    setCreators((c as CreatorRow[]) || []);
    setContent((k as ContentRow[]) || []);
    setPayouts((p as PayoutRow[]) || []);
    setLoading(false);
  };

  useEffect(() => {
    void load();
    const channel = supabase
      .channel("admin-creator-program")
      .on("postgres_changes", { event: "*", schema: "public", table: "creator_applications" }, () => { void load(); })
      .on("postgres_changes", { event: "*", schema: "public", table: "creator_content" }, () => { void load(); })
      .on("postgres_changes", { event: "*", schema: "public", table: "creator_payouts" }, () => { void load(); })
      .subscribe();
    return () => { void supabase.removeChannel(channel); };
  }, []);

  const reviewCreator = async (id: string, status: string) => {
    setBusy(id);
    const { error } = await supabase.rpc("review_creator_application", {
      _application_id: id, _status: status, _notes: notes[id] || null, _tier: tier[id] || null,
    });
    setBusy(null);
    if (error) { toast({ title: "Could not update", description: error.message, variant: "destructive" }); return; }
    toast({ title: `Creator ${status.replace("_", " ")}` });
    void load();
  };

  const reviewContent = async (id: string, status: string) => {
    const r = reward[id] || { points: "", payout: "" };
    setBusy(id);
    const { error } = await supabase.rpc("review_creator_content", {
      _content_id: id,
      _status: status,
      _reward_points: r.points ? Number(r.points) : null,
      _payout: r.payout ? Number(r.payout) : null,
      _notes: null,
    });
    setBusy(null);
    if (error) { toast({ title: "Could not update", description: error.message, variant: "destructive" }); return; }
    toast({ title: `Content ${status}` });
    void load();
  };

  const pay = async (creatorId: string) => {
    const amount = Number(payoutForm.amount);
    if (!amount || amount <= 0) { toast({ title: "Enter a payout amount", variant: "destructive" }); return; }
    setBusy(creatorId);
    const { error } = await supabase.rpc("record_creator_payout", {
      _creator_id: creatorId,
      _amount: amount,
      _period: payoutForm.period || null,
      _method: payoutForm.method || null,
      _reference: payoutForm.reference || null,
      _status: "paid",
      _notes: null,
    });
    setBusy(null);
    if (error) { toast({ title: "Could not record payout", description: error.message, variant: "destructive" }); return; }
    setPayoutForm({ amount: "", period: "", method: "UPI", reference: "" });
    toast({ title: "Payout recorded" });
    void load();
  };

  const visible = useMemo(() => creators.filter(c =>
    (statusFilter === "all" || c.status === statusFilter) &&
    (!search.trim() || `${c.full_name} ${c.email} ${c.city || ""}`.toLowerCase().includes(search.toLowerCase()))
  ), [creators, statusFilter, search]);

  const totals = useMemo(() => ({
    pending: creators.filter(c => c.status === "pending").length,
    approved: creators.filter(c => c.status === "approved").length,
    awaitingContent: content.filter(c => c.status === "submitted").length,
    paid: payouts.filter(p => p.status === "paid").reduce((s, p) => s + Number(p.amount_inr || 0), 0),
  }), [creators, content, payouts]);

  return (
    <section aria-labelledby="creator-program-heading">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 id="creator-program-heading" className="text-xl font-bold text-foreground flex items-center gap-2">
            <Camera className="w-5 h-5 text-primary" /> Creator Program ({totals.pending} pending)
          </h2>
          <p className="text-sm text-muted-foreground">Approve creators, review submitted content, award points and record payouts.</p>
        </div>
        <div className="flex gap-2">
          <Input className="h-9 w-48" placeholder="Search creators…" value={search} onChange={e => setSearch(e.target.value)} />
          <select aria-label="Filter creator status" className="h-9 rounded-md border border-input bg-background px-2 text-sm text-foreground"
            value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
            <option value="pending">Pending</option>
            <option value="under_review">Under review</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="paused">Paused</option>
            <option value="all">All</option>
          </select>
        </div>
      </div>

      <div className="mt-4 grid gap-3 grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Pending applications", value: String(totals.pending) },
          { label: "Active creators", value: String(totals.approved) },
          { label: "Content awaiting review", value: String(totals.awaitingContent) },
          { label: "Total paid out", value: inr(totals.paid) },
        ].map(s => (
          <div key={s.label} className="rounded-lg bg-card p-4 shadow-card">
            <p className="text-2xl font-bold text-foreground">{s.value}</p>
            <p className="text-xs text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>

      {loading ? (
        <div className="mt-6 rounded-lg bg-card p-8 text-center shadow-card"><Loader2 className="w-5 h-5 animate-spin text-primary mx-auto" /></div>
      ) : visible.length === 0 ? (
        <div className="mt-6 rounded-lg bg-card p-8 text-center shadow-card">
          <Camera className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
          <p className="font-medium text-foreground">No creators here</p>
          <p className="text-sm text-muted-foreground">Applications land here from the creator program page.</p>
        </div>
      ) : (
        <div className="mt-6 space-y-3">
          {visible.map(c => {
            const posts = content.filter(k => k.creator_id === c.id);
            const cPayouts = payouts.filter(p => p.creator_id === c.id);
            const earned = posts.filter(p => p.status === "approved" || p.status === "paid").reduce((s, p) => s + Number(p.payout_amount || 0), 0);
            const paid = cPayouts.filter(p => p.status === "paid").reduce((s, p) => s + Number(p.amount_inr || 0), 0);
            const open = expanded === c.id;
            return (
              <div key={c.id} className="rounded-lg bg-card p-4 shadow-card">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-foreground">{c.full_name} <span className="text-xs text-muted-foreground">· {c.tier} tier</span></p>
                    <p className="text-xs text-muted-foreground">
                      {c.email}{c.phone ? ` · ${c.phone}` : ""}{c.city ? ` · ${c.city}` : ""} · {c.total_followers.toLocaleString("en-IN")} followers · {c.avg_views.toLocaleString("en-IN")} avg views
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {posts.length} posts · {inr(earned)} earned · {inr(paid)} paid · {inr(Math.max(0, earned - paid))} due
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${STATUS_STYLES[c.status] || "bg-secondary text-muted-foreground"}`}>{c.status.replace("_", " ")}</span>
                    <Button size="sm" variant="outline" onClick={() => setExpanded(open ? null : c.id)}>{open ? "Hide" : "Details"}</Button>
                  </div>
                </div>

                {open && (
                  <div className="mt-4 space-y-4">
                    {c.bio && <p className="text-sm text-muted-foreground">{c.bio}</p>}
                    {c.portfolio_links?.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {c.portfolio_links.map(l => (
                          <a key={l} href={l} target="_blank" rel="noopener noreferrer" className="text-xs text-primary underline break-all">{l}</a>
                        ))}
                      </div>
                    )}
                    <p className="text-xs text-muted-foreground">Payout: {c.payout_method || "—"} {c.payout_details ? `· ${c.payout_details}` : ""}</p>

                    <div>
                      <p className="text-sm font-semibold text-foreground">Submitted content</p>
                      {posts.length === 0 ? (
                        <p className="text-sm text-muted-foreground">Nothing submitted yet.</p>
                      ) : (
                        <div className="mt-2 space-y-2">
                          {posts.map(p => (
                            <div key={p.id} className="rounded-md bg-secondary/40 p-3">
                              <div className="flex flex-wrap items-start justify-between gap-2">
                                <div className="min-w-0">
                                  <a href={p.url} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-foreground hover:text-primary break-words">{p.title}</a>
                                  <p className="text-xs text-muted-foreground">
                                    {p.platform}{p.campaign ? ` · ${p.campaign}` : ""} · {p.views.toLocaleString("en-IN")} views · {p.clicks} clicks · {p.bookings_attributed} bookings · {p.reward_points} pts · {inr(Number(p.payout_amount))}
                                  </p>
                                </div>
                                <span className={`text-xs px-2 py-1 rounded-full ${STATUS_STYLES[p.status] || "bg-secondary text-muted-foreground"}`}>{p.status}</span>
                              </div>
                              {p.status === "submitted" && (
                                <div className="mt-2 flex flex-wrap gap-2">
                                  <Input className="h-8 w-32" type="number" min={0} placeholder="Points"
                                    value={reward[p.id]?.points || ""} onChange={e => setReward(s => ({ ...s, [p.id]: { points: e.target.value, payout: s[p.id]?.payout || "" } }))} />
                                  <Input className="h-8 w-36" type="number" min={0} placeholder="Payout ₹"
                                    value={reward[p.id]?.payout || ""} onChange={e => setReward(s => ({ ...s, [p.id]: { points: s[p.id]?.points || "", payout: e.target.value } }))} />
                                  <Button size="sm" disabled={busy === p.id} onClick={() => reviewContent(p.id, "approved")}>Approve</Button>
                                  <Button size="sm" variant="destructive" disabled={busy === p.id} onClick={() => reviewContent(p.id, "rejected")}>Reject</Button>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {c.status === "approved" && (
                      <div className="rounded-md bg-secondary/40 p-3">
                        <p className="text-sm font-semibold text-foreground flex items-center gap-2"><Wallet className="w-4 h-4 text-primary" /> Record a payout</p>
                        <div className="mt-2 grid gap-2 sm:grid-cols-4">
                          <Input className="h-9" type="number" min={0} placeholder="Amount ₹" value={payoutForm.amount} onChange={e => setPayoutForm({ ...payoutForm, amount: e.target.value })} />
                          <Input className="h-9" placeholder="Period (e.g. Sep 2026)" value={payoutForm.period} onChange={e => setPayoutForm({ ...payoutForm, period: e.target.value })} />
                          <Input className="h-9" placeholder="Method" value={payoutForm.method} onChange={e => setPayoutForm({ ...payoutForm, method: e.target.value })} />
                          <Input className="h-9" placeholder="Reference / UTR" value={payoutForm.reference} onChange={e => setPayoutForm({ ...payoutForm, reference: e.target.value })} />
                        </div>
                        <Button size="sm" className="mt-2" disabled={busy === c.id} onClick={() => pay(c.id)}>Mark paid</Button>
                      </div>
                    )}

                    {cPayouts.length > 0 && (
                      <div>
                        <p className="text-sm font-semibold text-foreground">Payout history</p>
                        <div className="mt-2 space-y-2">
                          {cPayouts.map(p => (
                            <div key={p.id} className="rounded-md bg-secondary/40 p-3 text-sm flex items-center justify-between gap-2">
                              <span className="text-foreground">{inr(Number(p.amount_inr))}{p.period ? ` · ${p.period}` : ""} · {p.paid_at ? new Date(p.paid_at).toLocaleDateString() : new Date(p.created_at).toLocaleDateString()}</span>
                              <span className={`text-xs px-2 py-1 rounded-full ${STATUS_STYLES[p.status] || "bg-secondary text-muted-foreground"}`}>{p.status}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {c.review_notes && <p className="mt-3 text-sm text-muted-foreground">Notes: {c.review_notes}</p>}

                <div className="mt-3 flex flex-col sm:flex-row gap-2">
                  <Input className="h-9" placeholder="Review notes (optional)…" value={notes[c.id] || ""} onChange={e => setNotes(p => ({ ...p, [c.id]: e.target.value }))} />
                  <select aria-label="Set tier" className="h-9 rounded-md border border-input bg-background px-2 text-sm text-foreground"
                    value={tier[c.id] || c.tier} onChange={e => setTier(p => ({ ...p, [c.id]: e.target.value }))}>
                    {TIERS.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                  <div className="flex gap-2">
                    <Button size="sm" disabled={busy === c.id} onClick={() => reviewCreator(c.id, "approved")}>Approve</Button>
                    <Button size="sm" variant="outline" disabled={busy === c.id} onClick={() => reviewCreator(c.id, "under_review")}>Under review</Button>
                    <Button size="sm" variant="destructive" disabled={busy === c.id} onClick={() => reviewCreator(c.id, "rejected")}>Reject</Button>
                    {c.status === "approved" && <Button size="sm" variant="outline" disabled={busy === c.id} onClick={() => reviewCreator(c.id, "paused")}>Pause</Button>}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
