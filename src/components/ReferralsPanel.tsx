import { useState, useEffect } from "react";
import { Copy, Gift, Users, Share2, Check, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const rewardTiers = [
  { points: 100, label: "₹100 booking credit", icon: "💰" },
  { points: 300, label: "Free experience upgrade", icon: "⭐" },
  { points: 500, label: "1 month Explorer tier", icon: "🧭" },
  { points: 1000, label: "1 month Adventurer tier", icon: "🏔️" },
];

interface Props {
  /** Hides the marketing hero when embedded inside the traveler dashboard. */
  compact?: boolean;
}

/** Referral link, points, reward tiers and history — shared by /referrals and the traveler dashboard. */
const ReferralsPanel = ({ compact = false }: Props) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [referrals, setReferrals] = useState<any[]>([]);
  const [referralCode, setReferralCode] = useState("");
  const [copied, setCopied] = useState(false);
  const [totalPoints, setTotalPoints] = useState(0);

  useEffect(() => {
    if (!user) return;
    const code = `TRAV-${user.id.slice(0, 8).toUpperCase()}`;
    setReferralCode(code);

    const fetchReferrals = async () => {
      const { data } = await supabase
        .from("referrals")
        .select("*")
        .eq("referrer_id", user.id)
        .order("created_at", { ascending: false });

      if (data) {
        setReferrals(data);
        setTotalPoints(data.reduce((sum, r) => sum + (r.reward_points || 0), 0));
      }

      const { data: existing } = await supabase
        .from("referrals")
        .select("id")
        .eq("referrer_id", user.id)
        .eq("referral_code", code)
        .maybeSingle();

      if (!existing) {
        await supabase.from("referrals").insert({
          referrer_id: user.id,
          referral_code: code,
          reward_points: 0,
          status: "active",
        });
      }
    };
    fetchReferrals();
  }, [user]);

  const link = `${window.location.origin}/signup?ref=${referralCode}`;

  const copyCode = () => {
    navigator.clipboard.writeText(link);
    setCopied(true);
    toast({ title: "Referral link copied! 📋" });
    setTimeout(() => setCopied(false), 2000);
  };

  const shareLink = () => {
    if (navigator.share) {
      navigator.share({ title: "Join RoamYoo!", text: "Use my referral link to get bonus rewards!", url: link });
    } else {
      copyCode();
    }
  };

  if (!user) {
    return <p className="text-muted-foreground text-center py-8">Sign in to access your referral dashboard.</p>;
  }

  return (
    <div data-testid="referrals-panel">
      {!compact && (
        <div className="rounded-2xl bg-gradient-to-br from-primary/10 via-accent/5 to-secondary p-8 text-center">
          <Gift className="w-12 h-12 text-primary mx-auto mb-3" />
          <h1 className="text-3xl font-bold text-foreground">Invite Friends, Earn Rewards</h1>
          <p className="text-muted-foreground mt-2 max-w-lg mx-auto">
            Share your referral link. When friends sign up and book, you both earn reward points!
          </p>
        </div>
      )}

      <div className={`${compact ? "" : "mt-8"} rounded-xl bg-card p-6 shadow-card`}>
        <h2 className="font-bold text-foreground mb-3">Your Referral Link</h2>
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="flex-1 rounded-lg bg-secondary/50 border border-border px-4 py-3 font-mono text-sm text-foreground truncate">
            {link}
          </div>
          <div className="flex gap-2">
            <Button onClick={copyCode} variant="outline" className="rounded-lg gap-2">
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? "Copied" : "Copy"}
            </Button>
            <Button onClick={shareLink} className="rounded-lg gap-2">
              <Share2 className="w-4 h-4" /> Share
            </Button>
          </div>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-3 gap-4">
        {[
          { label: "Total Referrals", value: referrals.filter(r => r.referred_id).length, icon: Users },
          { label: "Points Earned", value: totalPoints, icon: Star },
          { label: "Pending", value: referrals.filter(r => r.status === "pending").length, icon: Gift },
        ].map(s => (
          <div key={s.label} className="rounded-xl bg-card p-4 shadow-card text-center">
            <s.icon className="w-6 h-6 text-primary mx-auto mb-2" />
            <p className="text-2xl font-bold text-foreground">{s.value}</p>
            <p className="text-xs text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-bold text-foreground mb-4">Reward Tiers</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {rewardTiers.map(r => (
            <div key={r.points} className={`rounded-xl border p-4 text-center transition-all ${totalPoints >= r.points ? "border-primary bg-primary/5" : "border-border bg-card"}`}>
              <span className="text-2xl">{r.icon}</span>
              <p className="font-bold text-foreground mt-2">{r.points} pts</p>
              <p className="text-xs text-muted-foreground mt-1">{r.label}</p>
              {totalPoints >= r.points && (
                <span className="inline-block mt-2 text-xs font-medium text-primary">✓ Unlocked</span>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-bold text-foreground mb-4">Referral History</h2>
        {referrals.filter(r => r.referred_id).length === 0 ? (
          <div className="text-center py-8 rounded-xl bg-card shadow-card">
            <Users className="w-10 h-10 text-muted-foreground/30 mx-auto mb-2" />
            <p className="text-muted-foreground">No referrals yet. Share your link to get started!</p>
          </div>
        ) : (
          <div className="space-y-2">
            {referrals.filter(r => r.referred_id).map(r => (
              <div key={r.id} className="rounded-lg bg-card p-3 shadow-card flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium text-foreground">Referral #{r.id.slice(0, 8)}</p>
                  <p className="text-xs text-muted-foreground">{new Date(r.created_at).toLocaleDateString()}</p>
                </div>
                <div className="text-right">
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${r.status === "completed" ? "bg-accent/10 text-accent" : "bg-primary/10 text-primary"}`}>
                    {r.status}
                  </span>
                  <p className="text-xs text-muted-foreground mt-1">+{r.reward_points} pts</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ReferralsPanel;
