import { Award, Coins, Gift, ShieldCheck, Sparkles, Ticket } from "lucide-react";
import { TIER_POINTS, REDEMPTION_CATALOG, LEDGER_STATUS_STYLES } from "@/lib/rewardsEngine";
import { TIER_STYLES, CATEGORY_META, type StampTier, type StampCategory } from "@/lib/stampsCatalog";

const STEPS = [
  { icon: Sparkles, title: "1. Travel & share", text: "Book trips, explore new cities, post video reviews and invite friends. Every activity is tracked automatically." },
  { icon: Award, title: "2. Earn a stamp", text: "When you hit a stamp's goal (e.g. 7 cities visited), the stamp unlocks in your collection." },
  { icon: Coins, title: "3. Claim your points", text: "Open the Stamps tab and tap 'Claim' on any unlocked stamp. Points land in your reward wallet." },
  { icon: Gift, title: "4. Redeem", text: "Swap points for booking credit, upgrades, vouchers or free membership months." },
  { icon: ShieldCheck, title: "5. Approval & payout", text: "Every claim is reviewed. Track it in Reward History: pending → approved → paid, with a receipt code." },
];

/** Plain-English explainer of how stamps, points and redemptions work. */
const RewardsGuide = () => (
  <div className="rounded-2xl bg-card p-6 shadow-card space-y-6" data-testid="rewards-guide">
    <div>
      <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
        <Ticket className="w-4 h-4 text-primary" /> How rewards work
      </h3>
      <p className="text-sm text-muted-foreground mt-1">
        Stamps mark what you've done. Claiming a stamp turns it into points. Points become real travel perks.
      </p>
    </div>

    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
      {STEPS.map(s => (
        <div key={s.title} className="rounded-xl border border-border bg-secondary/30 p-4">
          <s.icon className="w-5 h-5 text-primary" />
          <p className="text-sm font-bold text-foreground mt-2">{s.title}</p>
          <p className="text-xs text-muted-foreground mt-1">{s.text}</p>
        </div>
      ))}
    </div>

    <div className="grid gap-6 md:grid-cols-2">
      <div>
        <h4 className="text-sm font-bold text-foreground">Points per stamp tier</h4>
        <div className="mt-3 space-y-2">
          {(Object.keys(TIER_POINTS) as StampTier[]).map(t => (
            <div key={t} className="flex items-center justify-between rounded-lg bg-secondary/40 px-3 py-2">
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${TIER_STYLES[t].bg}`}>{TIER_STYLES[t].label}</span>
              <span className="text-sm font-bold text-foreground">+{TIER_POINTS[t]} pts</span>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h4 className="text-sm font-bold text-foreground">What points get you</h4>
        <div className="mt-3 space-y-2">
          {REDEMPTION_CATALOG.map(r => (
            <div key={r.key} className="flex items-center gap-3 rounded-lg bg-secondary/40 px-3 py-2">
              <span className="text-lg">{r.emoji}</span>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-foreground truncate">{r.title}</p>
                <p className="text-[10px] text-muted-foreground truncate">{r.description}</p>
              </div>
              <span className="text-xs font-bold text-primary shrink-0">{r.points} pts</span>
            </div>
          ))}
        </div>
      </div>
    </div>

    <div>
      <h4 className="text-sm font-bold text-foreground">Where stamps come from</h4>
      <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
        {(Object.keys(CATEGORY_META) as StampCategory[]).map(c => (
          <div key={c} className="rounded-lg border border-border p-3">
            <p className="text-sm font-bold text-foreground">{CATEGORY_META[c].emoji} {CATEGORY_META[c].label}</p>
            <p className="text-[10px] text-muted-foreground mt-1">{CATEGORY_META[c].description}</p>
          </div>
        ))}
      </div>
    </div>

    <div>
      <h4 className="text-sm font-bold text-foreground">Reading your reward status</h4>
      <div className="mt-3 flex flex-wrap gap-2">
        {[
          ["pending", "Submitted, waiting for review"],
          ["approved", "Verified — points are yours"],
          ["paid", "Perk delivered or credit applied"],
          ["rejected", "Declined — you can appeal it"],
        ].map(([status, note]) => (
          <div key={status} className="flex items-center gap-2 rounded-full bg-secondary/40 pl-1 pr-3 py-1">
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${LEDGER_STATUS_STYLES[status]}`}>{status}</span>
            <span className="text-[11px] text-muted-foreground">{note}</span>
          </div>
        ))}
      </div>
      <p className="text-[11px] text-muted-foreground mt-3">
        Fair play: claims are rate-limited and duplicate claims are blocked. If a claim is blocked by mistake, submit an appeal from Reward History.
      </p>
    </div>
  </div>
);

export default RewardsGuide;
