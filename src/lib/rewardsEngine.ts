// Reward mechanics: how stamps convert to points and what points can be redeemed for.
import type { StampTier } from "@/lib/stampsCatalog";

/** Points awarded when a traveler claims an earned stamp, by tier. */
export const TIER_POINTS: Record<StampTier, number> = {
  bronze: 50,
  silver: 100,
  gold: 250,
  platinum: 500,
  legend: 1000,
};

export interface RedemptionOption {
  key: string;
  points: number;
  title: string;
  description: string;
  emoji: string;
  kind: "credit" | "experience" | "membership";
}

/** What travelers can convert points into. Redemptions are queued for admin approval. */
export const REDEMPTION_CATALOG: RedemptionOption[] = [
  { key: "credit_100",     points: 100,  title: "₹100 booking credit",      description: "Applied to your next confirmed booking", emoji: "💰", kind: "credit" },
  { key: "upgrade_exp",    points: 300,  title: "Free experience upgrade",   description: "Upgrade any booked experience tier",     emoji: "⭐", kind: "experience" },
  { key: "tier_explorer",  points: 500,  title: "1 month Explorer tier",     description: "Explorer membership, on the house",      emoji: "🧭", kind: "membership" },
  { key: "credit_1000",    points: 900,  title: "₹1,000 experience voucher", description: "Spend on any host experience in India",  emoji: "🎟️", kind: "credit" },
  { key: "tier_adventurer",points: 1000, title: "1 month Adventurer tier",   description: "Adventurer membership for 30 days",       emoji: "🏔️", kind: "membership" },
  { key: "free_stay",      points: 2000, title: "Complimentary 1-night stay",description: "One night with a verified homestay host", emoji: "🏡", kind: "experience" },
];

export const LEDGER_STATUS_STYLES: Record<string, string> = {
  pending: "bg-primary/10 text-primary",
  approved: "bg-accent/10 text-accent",
  paid: "bg-emerald-500/10 text-emerald-600",
  rejected: "bg-destructive/10 text-destructive",
};

export const EVENT_LABELS: Record<string, string> = {
  referral: "Referral",
  stamp: "Stamp reward",
  redemption: "Redemption",
  payout: "Payout",
  adjustment: "Adjustment",
};
