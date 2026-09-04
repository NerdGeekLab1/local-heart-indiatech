import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Crown, Sparkles, Star, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useCurrency } from "@/contexts/CurrencyContext";

interface SubRow {
  tier: string;
  amount: number | null;
  starts_at: string | null;
  expires_at: string | null;
  is_active: boolean | null;
}

const ICONS: Record<string, any> = { free: Star, explorer: Zap, adventurer: Crown, nomad: Sparkles };

const fmtDate = (v?: string | null) =>
  v ? new Date(v).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—";

/** Shows the traveler's active plan, or a prompt to subscribe when there is none. */
const SubscriptionStatusCard = () => {
  const { user } = useAuth();
  const { format } = useCurrency();
  const [sub, setSub] = useState<SubRow | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { setLoading(false); return; }
    let cancelled = false;
    const load = async () => {
      const { data } = await supabase
        .from("subscriptions")
        .select("tier, amount, starts_at, expires_at, is_active")
        .eq("user_id", user.id)
        .order("starts_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (cancelled) return;
      setSub((data as SubRow) ?? null);
      setLoading(false);
    };
    void load();
    const channel = supabase
      .channel(`my-subscription-${user.id}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "subscriptions", filter: `user_id=eq.${user.id}` }, load)
      .subscribe();
    return () => { cancelled = true; void supabase.removeChannel(channel); };
  }, [user]);

  if (loading) {
    return <div className="mt-6 h-24 rounded-2xl bg-card shadow-card animate-pulse" />;
  }

  const expired = sub?.expires_at ? new Date(sub.expires_at).getTime() < Date.now() : false;
  const active = !!sub && sub.is_active !== false && !expired && sub.tier !== "free";
  const Icon = ICONS[sub?.tier ?? "free"] || Star;
  const tierName = sub?.tier ? sub.tier.charAt(0).toUpperCase() + sub.tier.slice(1) : "Free";

  return (
    <div className="mt-6 rounded-2xl bg-card shadow-card p-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${active ? "bg-primary/10" : "bg-muted"}`}>
            <Icon className={`w-5 h-5 ${active ? "text-primary" : "text-muted-foreground"}`} />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Membership</p>
            {active ? (
              <>
                <h3 className="text-lg font-bold text-foreground">{tierName} plan · Active</h3>
                <p className="text-sm text-muted-foreground">
                  {format(Number(sub?.amount || 0))}/month · renews {fmtDate(sub?.expires_at)}
                </p>
              </>
            ) : (
              <>
                <h3 className="text-lg font-bold text-foreground">
                  {expired && sub?.tier !== "free" ? `${tierName} plan expired` : "No active subscription"}
                </h3>
                <p className="text-sm text-muted-foreground">
                  Unlock booking discounts, priority access and Beta Wanderer eligibility.
                </p>
              </>
            )}
          </div>
        </div>
        <div className="flex gap-2 shrink-0">
          <Link to="/membership">
            <Button size="sm" className="rounded-full" variant={active ? "outline" : "default"}>
              {active ? "Manage plan" : "View plans"}
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionStatusCard;
