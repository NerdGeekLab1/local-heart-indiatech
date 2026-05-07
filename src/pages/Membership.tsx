import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Star, Zap, Crown, Sparkles } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

const tiers = [
  {
    id: "free" as const,
    name: "Free",
    price: 0,
    icon: Star,
    description: "Get started with basic travel features",
    color: "border-border",
    badge: null,
    features: [
      "Browse all experiences",
      "Book trips with hosts",
      "Community access",
      "Basic travel streaks",
      "Standard support",
    ],
  },
  {
    id: "explorer" as const,
    name: "Explorer",
    price: 499,
    icon: Zap,
    description: "Unlock deals and priority booking",
    color: "border-primary",
    badge: "Popular",
    features: [
      "Everything in Free",
      "5% discount on all bookings",
      "Priority booking access",
      "Exclusive travel deals",
      "AI trip recommendations",
      "Beta Wanderer eligibility",
      "Priority support",
    ],
  },
  {
    id: "adventurer" as const,
    name: "Adventurer",
    price: 999,
    icon: Crown,
    description: "Premium perks for serious travelers",
    color: "border-accent",
    badge: "Best Value",
    features: [
      "Everything in Explorer",
      "10% discount on all bookings",
      "Early access to new experiences",
      "Free trip cancellation (1/month)",
      "Exclusive host meetups",
      "Wanderer mission priority",
      "Dedicated travel concierge",
    ],
  },
  {
    id: "nomad" as const,
    name: "Nomad",
    price: 1999,
    icon: Sparkles,
    description: "The ultimate membership for digital nomads",
    color: "border-chart-1",
    badge: "Elite",
    features: [
      "Everything in Adventurer",
      "15% discount on all bookings",
      "Unlimited free cancellations",
      "VIP host experiences",
      "Co-working space partners",
      "Annual travel retreat invite",
      "Personal travel planner",
      "Airport lounge access (select cities)",
    ],
  },
];

const iconMap: Record<string, any> = { free: Star, explorer: Zap, adventurer: Crown, nomad: Sparkles };
const colorMap: Record<string, string> = { free: "border-border", explorer: "border-primary", adventurer: "border-accent", nomad: "border-chart-1" };

const Membership = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState<string | null>(null);
  const [dbTiers, setDbTiers] = useState<typeof tiers | null>(null);

  useEffect(() => {
    supabase.from("subscription_plans").select("*").eq("is_active", true).order("sort_order").then(({ data }) => {
      if (!data || data.length === 0) return;
      setDbTiers(data.map((p: any) => ({
        id: p.slug as any,
        name: p.name,
        price: Number(p.price),
        icon: iconMap[p.slug] || Star,
        description: p.description || "",
        color: colorMap[p.slug] || "border-border",
        badge: p.badge,
        features: p.features || [],
      })));
    });
  }, []);

  const activeTiers = dbTiers || tiers;

  const handleSubscribe = async (tierId: "free" | "explorer" | "adventurer" | "nomad", price: number) => {
    if (!user) {
      navigate("/signup");
      return;
    }

    setLoading(tierId);
    try {
      const { data: existing } = await supabase
        .from("subscriptions")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (existing) {
        await supabase
          .from("subscriptions")
          .update({
            tier: tierId,
            amount: price,
            starts_at: new Date().toISOString(),
            expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            is_active: true,
          })
          .eq("user_id", user.id);
      } else {
        await supabase.from("subscriptions").insert({
          user_id: user.id,
          tier: tierId,
          amount: price,
          starts_at: new Date().toISOString(),
          expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          is_active: true,
        });
      }

      toast({
        title: "Subscription updated!",
        description: `You're now on the ${tierId.charAt(0).toUpperCase() + tierId.slice(1)} plan.`,
      });
    } catch {
      toast({ title: "Error", description: "Could not update subscription.", variant: "destructive" });
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-3">Membership Plans</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Choose a plan that fits your travel style. Unlock exclusive deals, priority access, and the Beta Wanderer program.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {tiers.map((tier) => {
            const Icon = tier.icon;
            return (
              <Card
                key={tier.id}
                className={`relative flex flex-col ${tier.color} ${tier.badge === "Popular" ? "ring-2 ring-primary shadow-lg scale-[1.02]" : ""}`}
              >
                {tier.badge && (
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground">
                    {tier.badge}
                  </Badge>
                )}
                <CardHeader className="text-center pb-2">
                  <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                  <CardTitle className="text-xl">{tier.name}</CardTitle>
                  <CardDescription>{tier.description}</CardDescription>
                </CardHeader>
                <CardContent className="flex-1">
                  <div className="text-center mb-6">
                    <span className="text-3xl font-bold text-foreground">
                      ₹{tier.price}
                    </span>
                    <span className="text-muted-foreground text-sm">/month</span>
                  </div>
                  <ul className="space-y-2.5">
                    {tier.features.map((f) => (
                      <li key={f} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <Check className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                        {f}
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button
                    className="w-full"
                    variant={tier.badge === "Popular" ? "default" : "outline"}
                    onClick={() => handleSubscribe(tier.id, tier.price)}
                    disabled={loading === tier.id}
                  >
                    {loading === tier.id ? "Processing…" : tier.price === 0 ? "Get Started" : "Subscribe"}
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Membership;
