import { Award, Coins, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { STAMP_CATALOG } from "@/lib/stampsCatalog";
import { TIER_POINTS } from "@/lib/rewardsEngine";
import { useMyStamps, useRewardBalance } from "@/hooks/useRewards";
import type { StampTier } from "@/lib/stampsCatalog";

interface Props {
  /** Jumps the dashboard to the rewards tab where stamps can be claimed. */
  onOpenRewards: () => void;
}

/** Overview strip: latest achievements plus a nudge to claim unclaimed milestones. */
const AchievementsStrip = ({ onOpenRewards }: Props) => {
  const { data: stamps = [] } = useMyStamps();
  const { data: balance } = useRewardBalance();
  const unclaimed = stamps.filter(s => !s.claimed);
  const claimablePoints = unclaimed.reduce((sum, s) => sum + (TIER_POINTS[(s.tier as StampTier) || "bronze"] ?? 50), 0);
  const recent = [...stamps].sort((a, b) => +new Date(b.earned_at) - +new Date(a.earned_at)).slice(0, 6);

  return (
    <div className="rounded-2xl bg-card p-5 shadow-card" data-testid="achievements-strip">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="font-bold text-foreground flex items-center gap-2"><Award className="w-4 h-4 text-primary" /> Achievements</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            {stamps.length} stamp{stamps.length === 1 ? "" : "s"} earned · {Math.max(balance?.approved_points ?? 0, 0)} points available
          </p>
        </div>
        <Button size="sm" variant={unclaimed.length ? "default" : "outline"} className="rounded-full gap-1 text-xs" onClick={onOpenRewards}>
          {unclaimed.length ? <><Sparkles className="w-3 h-3" /> Claim {unclaimed.length} · +{claimablePoints} pts</> : <><Coins className="w-3 h-3" /> Open reward wallet</>}
        </Button>
      </div>

      {recent.length === 0 ? (
        <p className="text-sm text-muted-foreground mt-3">
          No achievements yet — complete a booking or post a video review to earn your first stamp.
        </p>
      ) : (
        <div className="mt-4 flex gap-3 overflow-x-auto pb-1">
          {recent.map(s => {
            const def = STAMP_CATALOG.find(d => d.key === s.stamp_key);
            return (
              <div key={s.id} className={`shrink-0 w-24 rounded-xl p-3 text-center border ${s.claimed ? "border-border bg-secondary/40" : "border-primary bg-primary/5"}`}>
                <div className="text-2xl">{def?.emoji || "🏅"}</div>
                <p className="text-[10px] font-bold text-foreground mt-1 line-clamp-2 min-h-[26px]">{def?.title || s.stamp_key}</p>
                <p className={`text-[9px] mt-1 font-medium ${s.claimed ? "text-muted-foreground" : "text-primary"}`}>
                  {s.claimed ? "Claimed" : "Claim now"}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AchievementsStrip;
