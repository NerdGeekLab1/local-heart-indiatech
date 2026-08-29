import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface RewardLedgerRow {
  id: string;
  user_id: string;
  event_type: string;
  reference_key: string | null;
  reference_id: string | null;
  points: number;
  status: string;
  title: string;
  notes: string | null;
  metadata: any;
  reviewed_by: string | null;
  reviewed_at: string | null;
  created_at: string;
}

export interface ReferralCodeRow {
  id: string;
  user_id: string;
  code: string;
  is_active: boolean;
  uses: number;
  retired_at: string | null;
  created_at: string;
}

export interface RewardBalance {
  approved_points: number;
  pending_points: number;
  paid_points: number;
  spent_points: number;
}

const db = supabase as any;

/** Signed-in traveler's point balance (approved minus redeemed). */
export const useRewardBalance = () => {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["reward-balance", user?.id],
    enabled: !!user,
    staleTime: 30_000,
    queryFn: async (): Promise<RewardBalance> => {
      const { data, error } = await db.rpc("get_reward_balance", { _user: null });
      if (error) throw error;
      const row = Array.isArray(data) ? data[0] : data;
      return row || { approved_points: 0, pending_points: 0, paid_points: 0, spent_points: 0 };
    },
  });
};

/** Ledger rows: own rows for travelers, every row for admins. */
export const useRewardLedger = (opts?: { all?: boolean }) => {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["reward-ledger", opts?.all ? "all" : user?.id],
    enabled: opts?.all ? true : !!user,
    staleTime: 20_000,
    queryFn: async (): Promise<RewardLedgerRow[]> => {
      let q = db.from("reward_ledger").select("*").order("created_at", { ascending: false }).limit(1000);
      if (!opts?.all && user) q = q.eq("user_id", user.id);
      const { data, error } = await q;
      if (error) throw error;
      return (data || []) as RewardLedgerRow[];
    },
  });
};

/** Stamps earned by the signed-in traveler, including claim state. */
export const useMyStamps = () => {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["my-stamps", user?.id],
    enabled: !!user,
    staleTime: 20_000,
    queryFn: async () => {
      const { data, error } = await db
        .from("traveler_stamps")
        .select("id,stamp_key,tier,category,progress,earned_at,claimed,claimed_at")
        .eq("user_id", user!.id);
      if (error) throw error;
      return (data || []) as any[];
    },
  });
};

/** Referral codes (active + retired history). Admins can pass a target user. */
export const useReferralCodes = (userId?: string) => {
  const { user } = useAuth();
  const target = userId ?? user?.id;
  return useQuery({
    queryKey: ["referral-codes", target ?? "all"],
    enabled: !!target || userId === "all",
    staleTime: 20_000,
    queryFn: async (): Promise<ReferralCodeRow[]> => {
      let q = db.from("referral_codes").select("*").order("created_at", { ascending: false }).limit(1000);
      if (userId !== "all" && target) q = q.eq("user_id", target);
      const { data, error } = await q;
      if (error) throw error;
      return (data || []) as ReferralCodeRow[];
    },
  });
};

const invalidateRewards = (qc: ReturnType<typeof useQueryClient>) => {
  qc.invalidateQueries({ queryKey: ["reward-balance"] });
  qc.invalidateQueries({ queryKey: ["reward-ledger"] });
  qc.invalidateQueries({ queryKey: ["my-stamps"] });
};

/** Convert an earned stamp into reward points (one claim per stamp). */
export const useClaimStamp = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { stampKey: string; points: number; title: string }) => {
      const { data, error } = await db.rpc("claim_stamp_reward", {
        _stamp_key: input.stampKey, _points: input.points, _title: input.title,
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => invalidateRewards(qc),
  });
};

/** Spend points on a redemption; queued as pending for admin approval. */
export const useRedeemReward = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { rewardKey: string; points: number; title: string }) => {
      const { data, error } = await db.rpc("redeem_reward", {
        _reward_key: input.rewardKey, _points: input.points, _title: input.title,
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => invalidateRewards(qc),
  });
};

/** Create or rotate a referral code. Admins may pass another traveler's id. */
export const useRegenerateReferralCode = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (userId?: string) => {
      const { data, error } = await db.rpc("regenerate_referral_code", { _user: userId ?? null });
      if (error) throw error;
      return data as ReferralCodeRow;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["referral-codes"] }),
  });
};

/** Admin: move a ledger event through pending → approved → paid (or reject). */
export const useReviewLedger = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { id: string; status: string; notes?: string }) => {
      const { data, error } = await db.rpc("review_reward_ledger", {
        _id: input.id, _status: input.status, _notes: input.notes ?? null,
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => invalidateRewards(qc),
  });
};
