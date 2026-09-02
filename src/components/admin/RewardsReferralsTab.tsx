import { useEffect, useMemo, useState } from "react";
import { Award, Flame, Gift, Search, Save, Trash2, Users, Plus, RefreshCw, Coins, Ticket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { STAMP_CATALOG, TIER_STYLES, type StampTier } from "@/lib/stampsCatalog";
import { EVENT_LABELS, LEDGER_STATUS_STYLES } from "@/lib/rewardsEngine";
import { useReferralCodes, useRegenerateReferralCode, useReviewLedger, useRewardLedger, useAllClaimAttempts, useRewardAppeals } from "@/hooks/useRewards";
import AdminPagination from "@/components/admin/AdminPagination";
import RewardFraudQueue from "@/components/admin/RewardFraudQueue";

type Section = "referrals" | "ledger" | "codes" | "streaks" | "stamps" | "fraud";

interface Row { [k: string]: any }

const referralStatuses = ["pending", "active", "completed", "cancelled"];
const ledgerStatuses = ["pending", "approved", "paid", "rejected"];


/** Admin control centre for referrals, travel streaks and traveler stamps. */
const RewardsReferralsTab = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [section, setSection] = useState<Section>("referrals");
  const [loading, setLoading] = useState(true);
  const [referrals, setReferrals] = useState<Row[]>([]);
  const [streaks, setStreaks] = useState<Row[]>([]);
  const [stamps, setStamps] = useState<Row[]>([]);
  const [people, setPeople] = useState<Row[]>([]);
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(25);
  const { data: ledger = [], refetch: refetchLedger } = useRewardLedger({ all: true });
  const { data: codes = [] } = useReferralCodes("all");
  const { data: allAttempts = [] } = useAllClaimAttempts();
  const { data: allAppeals = [] } = useRewardAppeals({ all: true });
  const reviewLedger = useReviewLedger();
  const regenerateCode = useRegenerateReferralCode();
  const openFraudCount = allAttempts.filter(a => !a.allowed).length + allAppeals.filter(a => a.status === "pending").length;

  useEffect(() => { setPage(0); }, [section, query]);
  /** Paginates any filtered list with the shared admin pager. */
  const paginate = <T,>(rows: T[]) => rows.slice(page * pageSize, page * pageSize + pageSize);


  const load = async () => {
    setLoading(true);
    const [{ data: refs }, { data: st }, { data: sp }, { data: pf }] = await Promise.all([
      supabase.from("referrals").select("*").order("created_at", { ascending: false }).limit(500),
      supabase.from("travel_streaks").select("*").order("month", { ascending: false }).limit(500),
      supabase.from("traveler_stamps").select("*").order("earned_at", { ascending: false }).limit(500),
      supabase.from("profiles").select("id, first_name, last_name, email").limit(1000),
    ]);
    setReferrals(refs || []);
    setStreaks(st || []);
    setStamps(sp || []);
    setPeople(pf || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const nameFor = (id?: string | null) => {
    if (!id) return "—";
    const p = people.find(x => x.id === id);
    if (!p) return id.slice(0, 8);
    return `${p.first_name || ""} ${p.last_name || ""}`.trim() || p.email || id.slice(0, 8);
  };

  const matches = (id?: string | null, extra = "") => {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return `${nameFor(id)} ${id || ""} ${extra}`.toLowerCase().includes(q);
  };

  const totals = useMemo(() => ({
    referrals: referrals.length,
    converted: referrals.filter(r => r.referred_id).length,
    points: referrals.reduce((s, r) => s + (r.reward_points || 0), 0),
    streakMonths: streaks.filter(s => s.completed).length,
    freeTripUnlocked: Object.values(
      streaks.filter(s => s.completed).reduce<Record<string, number>>((acc, s) => {
        acc[s.user_id] = (acc[s.user_id] || 0) + 1; return acc;
      }, {})
    ).filter(n => n >= 11).length,
    stamps: stamps.length,
  }), [referrals, streaks, stamps]);

  const saveReferral = async (row: Row, patch: Row) => {
    const { error } = await supabase.from("referrals").update(patch as never).eq("id", row.id);
    if (error) { toast({ title: "Update failed", description: error.message, variant: "destructive" }); return; }
    setReferrals(prev => prev.map(r => r.id === row.id ? { ...r, ...patch } : r));
    toast({ title: "Referral updated" });
  };

  const deleteReferral = async (id: string) => {
    const { error } = await supabase.from("referrals").delete().eq("id", id);
    if (error) { toast({ title: "Delete failed", description: error.message, variant: "destructive" }); return; }
    setReferrals(prev => prev.filter(r => r.id !== id));
  };

  const toggleStreak = async (row: Row) => {
    const { error } = await supabase.from("travel_streaks").update({ completed: !row.completed }).eq("id", row.id);
    if (error) { toast({ title: "Update failed", description: error.message, variant: "destructive" }); return; }
    setStreaks(prev => prev.map(s => s.id === row.id ? { ...s, completed: !row.completed } : s));
  };

  const revokeStamp = async (id: string) => {
    const { error } = await supabase.from("traveler_stamps").delete().eq("id", id);
    if (error) { toast({ title: "Revoke failed", description: error.message, variant: "destructive" }); return; }
    setStamps(prev => prev.filter(s => s.id !== id));
    toast({ title: "Stamp revoked" });
  };

  // Manual stamp grant
  const [grantUser, setGrantUser] = useState("");
  const [grantKey, setGrantKey] = useState(STAMP_CATALOG[0].key);
  const grantStamp = async () => {
    const def = STAMP_CATALOG.find(s => s.key === grantKey);
    const target = people.find(p => p.id === grantUser || (p.email || "").toLowerCase() === grantUser.trim().toLowerCase());
    if (!def || !target) { toast({ title: "Pick a valid traveler", description: "Search by email or user id.", variant: "destructive" }); return; }
    const { data, error } = await supabase.from("traveler_stamps").insert({
      user_id: target.id, stamp_key: def.key, category: def.category, tier: def.tier,
      progress: def.threshold, metadata: { granted_by: user?.id, manual: true } as any,
    }).select().maybeSingle();
    if (error) { toast({ title: "Grant failed", description: error.message, variant: "destructive" }); return; }
    if (data) setStamps(prev => [data as Row, ...prev]);
    toast({ title: `Granted ${def.title} to ${nameFor(target.id)}` });
    setGrantUser("");
  };

  const sections: { id: Section; label: string; icon: React.ElementType; count: number }[] = [
    { id: "referrals", label: "Referrals", icon: Gift, count: referrals.length },
    { id: "ledger", label: "Reward Ledger", icon: Coins, count: ledger.length },
    { id: "codes", label: "Referral Codes", icon: Ticket, count: codes.length },
    { id: "streaks", label: "Travel Streaks", icon: Flame, count: streaks.length },
    { id: "stamps", label: "Stamps", icon: Award, count: stamps.length },
    { id: "fraud", label: "Fraud review", icon: ShieldAlert, count: openFraudCount },
  ];

  const filteredLedger = ledger.filter(l => matches(l.user_id, `${l.title} ${l.event_type} ${l.status}`));
  const filteredCodes = codes.filter(c => matches(c.user_id, c.code));
  const filteredReferrals = referrals.filter(r => matches(r.referrer_id, r.referral_code));
  const filteredStreaks = streaks.filter(s => matches(s.user_id));
  const filteredStamps = stamps.filter(s => matches(s.user_id, s.stamp_key));

  const setLedgerStatus = async (id: string, status: string) => {
    try {
      await reviewLedger.mutateAsync({ id, status });
      toast({ title: `Marked ${status}` });
      refetchLedger();
    } catch (e: any) {
      toast({ title: "Update failed", description: e.message, variant: "destructive" });
    }
  };


  return (
    <div className="mt-4 space-y-4" data-testid="admin-rewards-tab">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2"><Gift className="w-5 h-5 text-primary" /> Rewards, Referrals &amp; Stamps</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Track who invited whom, adjust reward points, verify streak months before the free 12th trip is granted, and grant or revoke stamps.
          </p>
        </div>
        <Button size="sm" variant="outline" className="rounded-full gap-1 text-xs" onClick={load}>
          <RefreshCw className="w-3 h-3" /> Refresh
        </Button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { label: "Referral links", value: totals.referrals },
          { label: "Converted", value: totals.converted },
          { label: "Points issued", value: totals.points },
          { label: "Streak months", value: totals.streakMonths },
          { label: "Free trips unlocked", value: totals.freeTripUnlocked },
          { label: "Stamps awarded", value: totals.stamps },
        ].map(s => (
          <div key={s.label} className="rounded-xl bg-card p-3 shadow-card">
            <p className="text-xl font-bold text-foreground">{s.value}</p>
            <p className="text-[11px] text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="flex gap-1 border-b border-border overflow-x-auto">
        {sections.map(s => (
          <button key={s.id} onClick={() => setSection(s.id)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium whitespace-nowrap rounded-t-lg transition-colors ${section === s.id ? "bg-card text-primary border-b-2 border-primary" : "text-muted-foreground hover:text-foreground"}`}>
            <s.icon className="w-3.5 h-3.5" /> {s.label} ({s.count})
          </button>
        ))}
      </div>

      <div className="relative max-w-sm">
        <Search className="w-3.5 h-3.5 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
        <Input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search by traveler, email or code" className="pl-9 h-9 text-sm" />
      </div>

      {loading && <p className="text-sm text-muted-foreground">Loading reward data…</p>}

      {section === "referrals" && (
        <div className="space-y-2">
          {paginate(filteredReferrals).map(r => (
            <ReferralRow key={r.id} row={r} nameFor={nameFor} onSave={saveReferral} onDelete={deleteReferral} />
          ))}
          {!loading && filteredReferrals.length === 0 && <p className="text-sm text-muted-foreground">No referral links generated yet.</p>}
          <AdminPagination page={page} total={filteredReferrals.length} pageSize={pageSize} onPage={setPage} onPageSize={setPageSize} />
        </div>
      )}

      {section === "ledger" && (
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground">
            Every referral, stamp claim, redemption and payout event. Move pending events to approved, then paid once fulfilled.
          </p>
          {paginate(filteredLedger).map(l => (
            <div key={l.id} className="rounded-lg bg-card p-3 shadow-card flex flex-wrap items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-foreground truncate">{l.title}</p>
                <p className="text-xs text-muted-foreground truncate">
                  {nameFor(l.user_id)} · {EVENT_LABELS[l.event_type] || l.event_type} · {new Date(l.created_at).toLocaleString()}
                  {l.notes ? ` · ${l.notes}` : ""}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-sm font-bold ${l.points < 0 ? "text-destructive" : "text-accent"}`}>{l.points > 0 ? "+" : ""}{l.points}</span>
                <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${LEDGER_STATUS_STYLES[l.status] || "bg-secondary text-muted-foreground"}`}>{l.status}</span>
                <select value={l.status} onChange={e => setLedgerStatus(l.id, e.target.value)}
                  aria-label="Ledger status" className="h-8 rounded-md border border-input bg-background px-2 text-xs">
                  {ledgerStatuses.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>
          ))}
          {filteredLedger.length === 0 && <p className="text-sm text-muted-foreground">No reward events recorded yet.</p>}
          <AdminPagination page={page} total={filteredLedger.length} pageSize={pageSize} onPage={setPage} onPageSize={setPageSize} />
        </div>
      )}

      {section === "codes" && (
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground">Active and retired referral codes. Regenerating retires the current code and issues a fresh one.</p>
          {paginate(filteredCodes).map(c => (
            <div key={c.id} className="rounded-lg bg-card p-3 shadow-card flex flex-wrap items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-foreground font-mono">{c.code}</p>
                <p className="text-xs text-muted-foreground truncate">
                  {nameFor(c.user_id)} · {c.uses} sign-ups · created {new Date(c.created_at).toLocaleDateString()}
                  {c.retired_at ? ` · retired ${new Date(c.retired_at).toLocaleDateString()}` : ""}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${c.is_active ? "bg-accent/10 text-accent" : "bg-secondary text-muted-foreground"}`}>
                  {c.is_active ? "Active" : "Retired"}
                </span>
                {c.is_active && (
                  <Button size="sm" variant="outline" className="rounded-full text-xs gap-1" disabled={regenerateCode.isPending}
                    onClick={async () => {
                      try { const row = await regenerateCode.mutateAsync(c.user_id); toast({ title: "New code issued", description: row?.code }); }
                      catch (e: any) { toast({ title: "Failed", description: e.message, variant: "destructive" }); }
                    }}>
                    <RefreshCw className="w-3 h-3" /> Regenerate
                  </Button>
                )}
              </div>
            </div>
          ))}
          {filteredCodes.length === 0 && <p className="text-sm text-muted-foreground">No referral codes created yet.</p>}
          <AdminPagination page={page} total={filteredCodes.length} pageSize={pageSize} onPage={setPage} onPageSize={setPageSize} />
        </div>
      )}

      {section === "streaks" && (
        <div className="space-y-2">
          {paginate(filteredStreaks).map(s => (

            <div key={s.id} className="rounded-lg bg-card p-3 shadow-card flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-foreground">{nameFor(s.user_id)}</p>
                <p className="text-xs text-muted-foreground">
                  {new Date(s.month).toLocaleString("default", { month: "long", year: "numeric" })}
                  {s.booking_id ? ` · booking #${String(s.booking_id).slice(0, 8)}` : " · no booking linked"}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${s.completed ? "bg-accent/10 text-accent" : "bg-secondary text-muted-foreground"}`}>
                  {s.completed ? "Completed" : "Incomplete"}
                </span>
                <Button size="sm" variant="outline" className="rounded-full text-xs" onClick={() => toggleStreak(s)}>
                  {s.completed ? "Mark incomplete" : "Mark completed"}
                </Button>
              </div>
            </div>
          ))}
          {!loading && filteredStreaks.length === 0 && <p className="text-sm text-muted-foreground">No streak months recorded yet.</p>}
          <AdminPagination page={page} total={filteredStreaks.length} pageSize={pageSize} onPage={setPage} onPageSize={setPageSize} />

        </div>
      )}

      {section === "stamps" && (
        <div className="space-y-4">
          <div className="rounded-xl bg-card p-4 shadow-card space-y-3">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2"><Plus className="w-3.5 h-3.5 text-primary" /> Grant a stamp manually</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Input value={grantUser} onChange={e => setGrantUser(e.target.value)} placeholder="Traveler email or user id" className="h-9 text-sm" />
              <select value={grantKey} onChange={e => setGrantKey(e.target.value)}
                className="h-9 rounded-md border border-input bg-background px-3 text-sm">
                {STAMP_CATALOG.map(s => <option key={s.key} value={s.key}>{s.emoji} {s.title} · {s.tier}</option>)}
              </select>
              <Button size="sm" className="rounded-full gap-1 text-xs" onClick={grantStamp}><Award className="w-3 h-3" /> Grant stamp</Button>
            </div>
            <p className="text-[11px] text-muted-foreground">
              Stamps are normally earned automatically from bookings and reviews — use this for support fixes and campaign rewards.
            </p>
          </div>

          <div className="space-y-2">
            {paginate(filteredStamps).map(s => {
              const def = STAMP_CATALOG.find(d => d.key === s.stamp_key);
              const tier = TIER_STYLES[(s.tier as StampTier) || "bronze"];
              return (
                <div key={s.id} className="rounded-lg bg-card p-3 shadow-card flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{def?.emoji || "🏅"}</span>
                    <div>
                      <p className="text-sm font-semibold text-foreground">{def?.title || s.stamp_key}</p>
                      <p className="text-xs text-muted-foreground">
                        {nameFor(s.user_id)} · {s.category} · progress {s.progress}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${tier?.bg}`}>{tier?.label}</span>
                    <Button size="icon" variant="ghost" className="rounded-full h-8 w-8" onClick={() => revokeStamp(s.id)}>
                      <Trash2 className="w-3.5 h-3.5 text-destructive" />
                    </Button>
                  </div>
                </div>
              );
            })}
            {!loading && filteredStamps.length === 0 && <p className="text-sm text-muted-foreground">No stamps awarded yet.</p>}
            <AdminPagination page={page} total={filteredStamps.length} pageSize={pageSize} onPage={setPage} onPageSize={setPageSize} />

          </div>
        </div>
      )}
    </div>
  );
};

const ReferralRow = ({ row, nameFor, onSave, onDelete }: {
  row: Row; nameFor: (id?: string | null) => string;
  onSave: (row: Row, patch: Row) => void; onDelete: (id: string) => void;
}) => {
  const [points, setPoints] = useState(row.reward_points ?? 0);
  const [status, setStatus] = useState(row.status || "pending");
  const dirty = points !== (row.reward_points ?? 0) || status !== (row.status || "pending");

  return (
    <div className="rounded-lg bg-card p-3 shadow-card flex flex-wrap items-center justify-between gap-3">
      <div className="min-w-0">
        <p className="text-sm font-semibold text-foreground flex items-center gap-2">
          <Users className="w-3.5 h-3.5 text-primary" /> {nameFor(row.referrer_id)}
        </p>
        <p className="text-xs text-muted-foreground truncate">
          Code {row.referral_code} · invited {row.referred_id ? nameFor(row.referred_id) : "nobody yet"} · {new Date(row.created_at).toLocaleDateString()}
        </p>
      </div>
      <div className="flex items-center gap-2">
        <Input type="number" value={points} onChange={e => setPoints(Number(e.target.value))} className="h-8 w-20 text-sm" aria-label="Reward points" />
        <select value={status} onChange={e => setStatus(e.target.value)} className="h-8 rounded-md border border-input bg-background px-2 text-xs">
          {referralStatuses.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <Button size="sm" className="rounded-full text-xs gap-1" disabled={!dirty}
          onClick={() => onSave(row, { reward_points: points, status })}>
          <Save className="w-3 h-3" /> Save
        </Button>
        <Button size="icon" variant="ghost" className="rounded-full h-8 w-8" onClick={() => onDelete(row.id)}>
          <Trash2 className="w-3.5 h-3.5 text-destructive" />
        </Button>
      </div>
    </div>
  );
};

export default RewardsReferralsTab;
