import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";

export type BookmarkItemType = "post" | "trip" | "experience";

/** Generic bookmarks across posts / trips / experiences. */
export function useBookmarks(itemType?: BookmarkItemType) {
  const { user } = useAuth();
  const [ids, setIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!user) { setIds(new Set()); return; }
    setLoading(true);
    let q = supabase.from("user_bookmarks").select("item_id, item_type").eq("user_id", user.id);
    if (itemType) q = q.eq("item_type", itemType);
    const { data } = await q;
    setIds(new Set((data || []).map((r: any) => `${r.item_type}:${r.item_id}`)));
    setLoading(false);
  }, [user?.id, itemType]);

  useEffect(() => { refresh(); }, [refresh]);

  const isBookmarked = (type: BookmarkItemType, id: string) => ids.has(`${type}:${id}`);

  const toggle = async (type: BookmarkItemType, id: string) => {
    if (!user) { toast({ title: "Sign in to bookmark", variant: "destructive" }); return; }
    const key = `${type}:${id}`;
    if (ids.has(key)) {
      await supabase.from("user_bookmarks").delete().eq("user_id", user.id).eq("item_type", type).eq("item_id", id);
      setIds(s => { const n = new Set(s); n.delete(key); return n; });
    } else {
      const { error } = await supabase.from("user_bookmarks").insert({ user_id: user.id, item_type: type, item_id: id });
      if (error) { toast({ title: "Couldn't save", description: error.message, variant: "destructive" }); return; }
      setIds(s => new Set(s).add(key));
      toast({ title: "Saved to bookmarks ✨" });
    }
  };

  return { ids, isBookmarked, toggle, refresh, loading };
}
