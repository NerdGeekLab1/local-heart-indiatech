import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Coins, Gift, Sparkles, Trophy, Loader2, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { STAMP_CATALOG, TIER_STYLES, type StampTier } from "@/lib/stampsCatalog";
import { REDEMPTION_CATALOG, TIER_POINTS, type RedemptionOption } from "@/lib/rewardsEngine";
import { useClaimStamp, useMyStamps, useRedeemReward, useRedemptionCatalog, useRewardBalance } from "@/hooks/useRewards";
import RewardHistory from "@/components/rewards/RewardHistory";

/** Traveler reward wallet: claim earned stamps for points, redeem points, and audit every event. */
const RewardWallet = () => {
  const { toast } = useToast();
  const { data: balance } = useRewardBalance();
  const { data: stamps = [], isLoading: stampsLoading } = useMyStamps();
  const { data: serverCatalog = [] } = useRedemptionCatalog();
  const claim = useClaimStamp();
  const redeem = useRedeemReward();
  const [confirming, setConfirming] = useState<RedemptionOption | null>(null);

  const available = Math.max(balance?.approved_points ?? 0, 0);
  const pending = balance?.pending_points ?? 0;

  /** Prices come from the server catalog; local entries only supply copy/emoji. */
  const options: RedemptionOption[] = useMemo(() => {
    if (!serverCatalog.length) return REDEMPTION_CATALOG;
    return serverCatalog.map(row => {
      const local = REDEMPTION_CATALOG.find(o => o.key === row.reward_key);
      return {
        key: row.reward_key,
        points: row.points,
        title: local?.title || row.title,
        description: local?.description || "Applied after our team confirms your request",
        emoji: local?.emoji || "🎁",
        kind: (local?.kind || row.kind) as RedemptionOption["kind"],
      };
    });
  }, [serverCatalog]);

  const claimable = useMemo(
    () => stamps.filter(s => !s.claimed).map(s => ({
      ...s,
      def: STAMP_CATALOG.find(d => d.key === s.stamp_key),
      points: TIER_POINTS[(s.tier as StampTier) || "bronze"] ?? 50,
    })),
    [stamps],
  );

  const claimStamp = async (row: any) => {
    try {
      const result: any = await claim.mutateAsync({
        stampKey: row.stamp_key,
        points: row.points,
        title: `${row.def?.title || row.stamp_key} stamp reward`,
      });
      toast({
        title: `+${result?.points ?? row.points} points claimed! 🎉`,
        description: `${row.def?.title || row.stamp_key}${result?.receipt_code ? ` · Receipt ${result.receipt_code}` : ""}`,
      });
    } catch (e: any) {
      toast({ title: "Couldn't claim", description: e.message, variant: "destructive" });
    }
  };

  const confirmRedeem = async () => {
    if (!confirming) return;
    try {
      const result: any = await redeem.mutateAsync({ rewardKey: confirming.key, points: confirming.points, title: confirming.title });
      toast({
        title: "Redemption requested",
        description: `${confirming.title} — pending approval${result?.receipt_code ? ` · Receipt ${result.receipt_code}` : ""}.`,
      });
      setConfirming(null);
    } catch (e: any) {
      toast({ title: "Redemption failed", description: e.message, variant: "destructive" });
    }
  };


  return (
    <div className="space-y-6" data-testid="reward-wallet">
      {/* Balance */}
      <div className="rounded-2xl p-5 bg-gradient-to-br from-primary via-orange-500 to-pink-500 text-primary-foreground shadow-lg shadow-primary/30 relative overflow-hidden">
        <div className="absolute -right-8 -top-8 w-36 h-36 rounded-full bg-primary-foreground/15 blur-2xl" />
        <div className="relative flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest opacity-90">Reward wallet</p>
            <p className="text-4xl font-bold mt-1 flex items-center gap-2"><Coins className="w-7 h-7" /> {available}</p>
            <p className="text-xs mt-1 opacity-90">points available · {pending} pending approval · {balance?.spent_points ?? 0} redeemed</p>
          </div>
          <div className="flex flex-wrap gap-2 text-xs">
            <span className="px-2 py-1 rounded-full bg-background/25 backdrop-blur font-semibold">🏅 {stamps.length} stamps earned</span>
            <span className="px-2 py-1 rounded-full bg-background/25 backdrop-blur font-semibold">✨ {claimable.length} ready to claim</span>
          </div>
        </div>
      </div>

      {/* Claim milestones */}
      <div>
        <h3 className="font-bold text-foreground flex items-center gap-2"><Sparkles className="w-4 h-4 text-primary" /> Milestones ready to claim</h3>
        {stampsLoading ? (
          <p className="text-sm text-muted-foreground mt-2">Checking your milestones…</p>
        ) : claimable.length === 0 ? (
          <div className="mt-3 rounded-xl border-2 border-dashed border-border p-6 text-center">
            <Trophy className="w-7 h-7 text-muted-foreground/40 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">
              Nothing to claim right now. Complete trips, post video reviews and invite friends to unlock new stamps.
            </p>
          </div>
        ) : (
          <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
            {claimable.map(row => {
              const tier = TIER_STYLES[(row.tier as StampTier) || "bronze"];
              return (
                <motion.div key={row.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                  className="rounded-xl bg-card p-4 shadow-card flex items-center gap-3">
                  <span className="text-3xl">{row.def?.emoji || "🏅"}</span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-foreground truncate">{row.def?.title || row.stamp_key}</p>
                    <p className="text-[11px] text-muted-foreground line-clamp-1">{row.def?.description || row.category}</p>
                    <span className={`inline-block mt-1 text-[10px] font-bold px-1.5 py-0.5 rounded-full ${tier?.bg}`}>{tier?.label} · +{row.points} pts</span>
                  </div>
                  <Button size="sm" className="rounded-full text-xs shrink-0" disabled={claim.isPending} onClick={() => claimStamp(row)}>
                    {claim.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : "Claim"}
                  </Button>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Redemption catalog */}
      <div>
        <h3 className="font-bold text-foreground flex items-center gap-2"><Gift className="w-4 h-4 text-primary" /> Redeem your points</h3>
        <p className="text-xs text-muted-foreground mt-0.5">Redemptions are confirmed by our team, then applied to your next booking.</p>
        <div className="mt-3 grid grid-cols-2 lg:grid-cols-3 gap-3">
          {REDEMPTION_CATALOG.map(opt => {
            const affordable = available >= opt.points;
            return (
              <div key={opt.key} className={`rounded-xl border p-4 text-center transition-all ${affordable ? "border-primary bg-primary/5" : "border-border bg-card opacity-70"}`}>
                <span className="text-2xl">{opt.emoji}</span>
                <p className="font-bold text-foreground text-sm mt-1">{opt.title}</p>
                <p className="text-[11px] text-muted-foreground mt-0.5 min-h-[30px]">{opt.description}</p>
                <p className="text-xs font-bold text-primary mt-1">{opt.points} pts</p>
                <Button size="sm" variant={affordable ? "default" : "outline"} disabled={!affordable || redeem.isPending}
                  className="rounded-full text-xs mt-2 w-full" onClick={() => setConfirming(opt)}>
                  {affordable ? "Redeem" : `Need ${opt.points - available} more`}
                </Button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Ledger */}
      <div>
        <h3 className="font-bold text-foreground flex items-center gap-2"><History className="w-4 h-4 text-primary" /> Reward ledger</h3>
        {ledger.length === 0 ? (
          <p className="text-sm text-muted-foreground mt-2">No reward activity yet.</p>
        ) : (
          <div className="mt-3 space-y-2">
            {ledger.slice(0, 25).map(row => (
              <div key={row.id} className="rounded-lg bg-card p-3 shadow-card flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{row.title}</p>
                  <p className="text-[11px] text-muted-foreground">
                    {EVENT_LABELS[row.event_type] || row.event_type} · {new Date(row.created_at).toLocaleDateString()}
                    {row.notes ? ` · ${row.notes}` : ""}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className={`text-sm font-bold ${row.points < 0 ? "text-destructive" : "text-accent"}`}>
                    {row.points > 0 ? "+" : ""}{row.points} pts
                  </p>
                  <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${LEDGER_STATUS_STYLES[row.status] || "bg-secondary text-muted-foreground"}`}>
                    {row.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <AlertDialog open={!!confirming} onOpenChange={open => !open && setConfirming(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Redeem {confirming?.title}?</AlertDialogTitle>
            <AlertDialogDescription>
              This spends <strong>{confirming?.points} points</strong> from your balance of {available}. The request goes to our
              rewards team and appears in your ledger as pending until it is approved.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep my points</AlertDialogCancel>
            <AlertDialogAction onClick={confirmRedeem} disabled={redeem.isPending}>
              {redeem.isPending ? "Submitting…" : "Confirm redemption"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default RewardWallet;
