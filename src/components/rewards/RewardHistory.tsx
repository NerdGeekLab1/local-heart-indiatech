import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { History, Receipt, ShieldAlert, Filter, Coins, CheckCircle2, Clock, XCircle, BadgeCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { EVENT_LABELS, LEDGER_STATUS_STYLES } from "@/lib/rewardsEngine";
import { useClaimAttempts, useRewardLedger, type RewardLedgerRow } from "@/hooks/useRewards";

const FILTERS = [
  { key: "all", label: "All activity" },
  { key: "stamp", label: "Stamp claims" },
  { key: "redemption", label: "Redemptions" },
  { key: "referral", label: "Referrals" },
] as const;

const STATUS_ICONS: Record<string, typeof Clock> = {
  pending: Clock,
  approved: CheckCircle2,
  paid: BadgeCheck,
  rejected: XCircle,
};

const STATUS_STEPS = ["pending", "approved", "paid"];

const BLOCK_REASONS: Record<string, string> = {
  rate_limited: "Blocked — hourly claim limit reached",
  not_earned: "Blocked — stamp not earned yet",
  already_claimed: "Blocked — already claimed",
  duplicate_ledger_entry: "Blocked — duplicate claim",
  duplicate_submission: "Blocked — duplicate submission",
  insufficient_points: "Blocked — not enough points",
  unknown_reward: "Blocked — reward unavailable",
};

const formatDate = (value: string) =>
  new Date(value).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" });

/** Traveler-facing rewards history: every claim and redemption with status tracking and a printable receipt. */
const RewardHistory = () => {
  const { data: ledger = [], isLoading } = useRewardLedger();
  const { data: attempts = [] } = useClaimAttempts();
  const [filter, setFilter] = useState<(typeof FILTERS)[number]["key"]>("all");
  const [receipt, setReceipt] = useState<RewardLedgerRow | null>(null);

  const rows = useMemo(
    () => (filter === "all" ? ledger : ledger.filter(r => r.event_type === filter)),
    [ledger, filter],
  );

  const blocked = useMemo(() => attempts.filter(a => !a.allowed).slice(0, 5), [attempts]);

  return (
    <div className="space-y-4" data-testid="reward-history">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="font-bold text-foreground flex items-center gap-2">
          <History className="w-4 h-4 text-primary" /> Rewards &amp; redemption history
        </h3>
        <div className="flex items-center gap-1 overflow-x-auto">
          <Filter className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
          {FILTERS.map(f => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`text-[11px] font-semibold px-2.5 py-1 rounded-full whitespace-nowrap transition-colors ${
                filter === f.key ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading your reward history…</p>
      ) : rows.length === 0 ? (
        <div className="rounded-xl border-2 border-dashed border-border p-6 text-center">
          <Coins className="w-7 h-7 text-muted-foreground/40 mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">No reward activity in this view yet.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {rows.map(row => {
            const StatusIcon = STATUS_ICONS[row.status] || Clock;
            return (
              <motion.button
                key={row.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={() => setReceipt(row)}
                data-testid="reward-history-row"
                className="w-full text-left rounded-lg bg-card p-3 shadow-card flex items-center justify-between gap-3 hover:ring-1 hover:ring-primary/40 transition-all"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{row.title}</p>
                  <p className="text-[11px] text-muted-foreground">
                    {EVENT_LABELS[row.event_type] || row.event_type} · {formatDate(row.created_at)}
                    {row.receipt_code ? ` · ${row.receipt_code}` : ""}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className={`text-sm font-bold ${row.points < 0 ? "text-destructive" : "text-accent"}`}>
                    {row.points > 0 ? "+" : ""}{row.points} pts
                  </p>
                  <span className={`inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full ${LEDGER_STATUS_STYLES[row.status] || "bg-secondary text-muted-foreground"}`}>
                    <StatusIcon className="w-3 h-3" /> {row.status}
                  </span>
                </div>
              </motion.button>
            );
          })}
        </div>
      )}

      {blocked.length > 0 && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4">
          <p className="text-xs font-bold text-destructive flex items-center gap-1.5">
            <ShieldAlert className="w-3.5 h-3.5" /> Security checks on recent attempts
          </p>
          <ul className="mt-2 space-y-1">
            {blocked.map(a => (
              <li key={a.id} className="text-[11px] text-muted-foreground">
                {formatDate(a.created_at)} · {a.reference_key || a.action} — {BLOCK_REASONS[a.reason || ""] || "Blocked by fraud checks"}
              </li>
            ))}
          </ul>
        </div>
      )}

      <Dialog open={!!receipt} onOpenChange={open => !open && setReceipt(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Receipt className="w-4 h-4 text-primary" /> Reward receipt
            </DialogTitle>
            <DialogDescription>{receipt?.title}</DialogDescription>
          </DialogHeader>
          {receipt && (
            <div className="space-y-4">
              <div className="rounded-xl bg-secondary/40 p-4 space-y-2 text-sm">
                {[
                  ["Receipt", receipt.receipt_code || "—"],
                  ["Type", EVENT_LABELS[receipt.event_type] || receipt.event_type],
                  ["Reference", receipt.reference_key || "—"],
                  ["Points", `${receipt.points > 0 ? "+" : ""}${receipt.points}`],
                  ["Requested", formatDate(receipt.created_at)],
                  ["Reviewed", receipt.reviewed_at ? formatDate(receipt.reviewed_at) : "Awaiting review"],
                  ["Verification", receipt.metadata?.verified ? "Server verified" : "—"],
                ].map(([label, value]) => (
                  <div key={label as string} className="flex items-center justify-between gap-3">
                    <span className="text-muted-foreground text-xs">{label}</span>
                    <span className="font-semibold text-foreground text-right">{value}</span>
                  </div>
                ))}
              </div>

              {receipt.points < 0 && (
                <div className="flex items-center justify-between">
                  {STATUS_STEPS.map((step, i) => {
                    const reached = receipt.status === "rejected"
                      ? i === 0
                      : STATUS_STEPS.indexOf(receipt.status) >= i;
                    return (
                      <div key={step} className="flex-1 text-center">
                        <div className={`h-1.5 rounded-full mx-0.5 ${reached ? "bg-primary" : "bg-border"}`} />
                        <p className={`text-[10px] mt-1 capitalize ${reached ? "text-primary font-semibold" : "text-muted-foreground"}`}>{step}</p>
                      </div>
                    );
                  })}
                </div>
              )}

              {receipt.status === "rejected" && (
                <p className="text-xs text-destructive">
                  This request was rejected{receipt.notes ? `: ${receipt.notes}` : ""}. Points were returned to your balance.
                </p>
              )}
              {receipt.notes && receipt.status !== "rejected" && (
                <p className="text-xs text-muted-foreground">Note: {receipt.notes}</p>
              )}

              <Button variant="outline" className="w-full rounded-full" onClick={() => window.print()}>
                Print / save receipt
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RewardHistory;
