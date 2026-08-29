import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Award, Lock, Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { STAMP_CATALOG, TIER_STYLES, CATEGORY_META, type StampCategory } from "@/lib/stampsCatalog";
import { TIER_POINTS } from "@/lib/rewardsEngine";
import { useClaimStamp, useMyStamps } from "@/hooks/useRewards";

const StampCollection = () => {
  const { toast } = useToast();
  const { data: earned = [], isLoading: loading } = useMyStamps();
  const claim = useClaimStamp();
  const [activeCat, setActiveCat] = useState<StampCategory | "all">("all");

  const earnedMap = useMemo(() => new Map(earned.map((e: any) => [e.stamp_key, e])), [earned]);
  const filtered = activeCat === "all" ? STAMP_CATALOG : STAMP_CATALOG.filter(s => s.category === activeCat);
  const earnedCount = earned.length;
  const totalCount = STAMP_CATALOG.length;
  const pct = Math.round((earnedCount / totalCount) * 100);

  const claimStamp = async (stamp: (typeof STAMP_CATALOG)[number]) => {
    const points = TIER_POINTS[stamp.tier] ?? 50;
    try {
      await claim.mutateAsync({ stampKey: stamp.key, points, title: `${stamp.title} stamp reward` });
      toast({ title: `+${points} points claimed! 🎉`, description: stamp.title });
    } catch (e: any) {
      toast({ title: "Couldn't claim", description: e.message, variant: "destructive" });
    }
  };


  return (
    <div className="space-y-6">
      {/* Header / progress */}
      <div className="rounded-2xl bg-gradient-to-br from-primary/10 via-accent/5 to-secondary p-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-primary/20 border-2 border-primary flex items-center justify-center">
            <Award className="w-7 h-7 text-primary" />
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-foreground">Stamp Collection</h2>
            <p className="text-sm text-muted-foreground">Collect badges as you wander across India</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-primary">{earnedCount}<span className="text-sm text-muted-foreground">/{totalCount}</span></p>
            <p className="text-xs text-muted-foreground">{pct}% collected</p>
          </div>
        </div>
        <div className="mt-4 h-2 rounded-full bg-secondary overflow-hidden">
          <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.8 }}
            className="h-full bg-gradient-to-r from-primary to-accent" />
        </div>
      </div>

      {/* Category filter */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        <button onClick={() => setActiveCat("all")}
          className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${activeCat === "all" ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"}`}>
          All ({totalCount})
        </button>
        {(Object.keys(CATEGORY_META) as StampCategory[]).map(cat => {
          const meta = CATEGORY_META[cat];
          const count = STAMP_CATALOG.filter(s => s.category === cat).length;
          return (
            <button key={cat} onClick={() => setActiveCat(cat)}
              className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${activeCat === cat ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"}`}>
              {meta.emoji} {meta.label} ({count})
            </button>
          );
        })}
      </div>

      {activeCat !== "all" && (
        <p className="text-xs text-muted-foreground -mt-3">{CATEGORY_META[activeCat].description}</p>
      )}

      {/* Stamp grid */}
      {loading ? (
        <p className="text-center text-sm text-muted-foreground py-8">Loading your stamps...</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {filtered.map((s, i) => {
            const e = earnedMap.get(s.key);
            const isEarned = !!e;
            const tier = TIER_STYLES[s.tier];
            return (
              <motion.div key={s.key} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.02 }}
                className={`relative rounded-xl border p-4 text-center transition-all ${
                  isEarned ? `bg-card shadow-card ring-2 ${tier.ring} border-transparent` : "bg-secondary/40 border-dashed border-border opacity-60 hover:opacity-80"
                }`}>
                {!isEarned && (
                  <div className="absolute top-2 right-2">
                    <Lock className="w-3 h-3 text-muted-foreground" />
                  </div>
                )}
                {isEarned && (
                  <div className="absolute -top-2 -right-2">
                    <Sparkles className="w-4 h-4 text-primary" />
                  </div>
                )}
                <div className={`text-4xl mb-2 ${isEarned ? "" : "grayscale"}`}>{s.emoji}</div>
                <p className="text-xs font-bold text-foreground line-clamp-1">{s.title}</p>
                <p className="text-[10px] text-muted-foreground mt-1 line-clamp-2 min-h-[26px]">{s.description}</p>
                <div className="mt-2 flex items-center justify-center gap-1">
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${tier.bg}`}>{tier.label}</span>
                  {isEarned && <span className="text-[9px] text-accent font-medium">✓ Earned</span>}
                </div>
                {!isEarned && (
                  <p className="text-[9px] text-muted-foreground mt-1">Goal: {s.threshold} {s.metric.replace(/_/g, " ")}</p>
                )}
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default StampCollection;
