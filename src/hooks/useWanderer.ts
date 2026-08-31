import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

const db = supabase as any;

export interface WandererRow {
  id: string;
  user_id: string;
  full_name: string;
  city: string;
  bio: string | null;
  status: string;
  badge: string | null;
  score: number | null;
  missions_completed: number | null;
  total_videos: number | null;
  travel_styles: string[] | null;
  preferred_destinations: string[] | null;
  video_url: string | null;
  admin_notes: string | null;
  created_at: string;
}

export interface MissionRow {
  id: string;
  wanderer_id: string;
  title: string;
  destination: string;
  description: string | null;
  status: string;
  reward_points: number | null;
  deadline: string | null;
  completed_at: string | null;
  created_at: string;
}

export const APPROVED_WANDERER_STATUSES = ["approved", "verified", "active"];

/** The signed-in traveler's own Beta Wanderer application (null when they never applied). */
export const useMyWanderer = () => {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["my-wanderer", user?.id],
    enabled: !!user,
    staleTime: 30_000,
    queryFn: async (): Promise<WandererRow | null> => {
      const { data, error } = await db
        .from("beta_wanderers")
        .select("*")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return (data as WandererRow) || null;
    },
  });
};

/** Missions assigned to (or requested by) a wanderer. */
export const useMyMissions = (wandererId?: string | null) =>
  useQuery({
    queryKey: ["my-missions", wandererId],
    enabled: !!wandererId,
    staleTime: 20_000,
    queryFn: async (): Promise<MissionRow[]> => {
      const { data, error } = await db
        .from("wanderer_missions")
        .select("*")
        .eq("wanderer_id", wandererId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data || []) as MissionRow[];
    },
  });

/** Wanderer-initiated mission request; lands in the admin missions queue as "requested". */
export const useRequestMission = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      wandererId: string;
      title: string;
      destination: string;
      description?: string;
      deadline?: string;
    }) => {
      const { data, error } = await db.from("wanderer_missions").insert({
        wanderer_id: input.wandererId,
        title: input.title,
        destination: input.destination,
        description: input.description || null,
        deadline: input.deadline || null,
        status: "requested",
        reward_points: 0,
      }).select().maybeSingle();
      if (error) throw error;
      return data as MissionRow;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["my-missions"] }),
  });
};
