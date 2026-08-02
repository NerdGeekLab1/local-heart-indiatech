import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { blogPosts, communityStories, travelTips, type BlogPost, type TravelTip } from "@/lib/data";

export interface CmsChannel {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  color: string | null;
  member_count: number;
  external_url: string | null;
}

type Story = (typeof communityStories)[number];

const FALLBACK_IMG = "/placeholder.svg";

/**
 * Merges admin-managed (Website CMS) content with the built-in curated content.
 * Only published CMS rows are visible to visitors (enforced by RLS).
 */
export const useCmsContent = () => {
  const [blogs, setBlogs] = useState<BlogPost[]>(blogPosts);
  const [stories, setStories] = useState<Story[]>(communityStories);
  const [tips, setTips] = useState<TravelTip[]>(travelTips);
  const [channels, setChannels] = useState<CmsChannel[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const [b, s, t, c] = await Promise.all([
        supabase.from("cms_blogs").select("*").eq("is_published", true).order("sort_order"),
        supabase.from("cms_stories").select("*").eq("is_published", true).order("sort_order"),
        supabase.from("cms_tips").select("*").eq("is_published", true).order("sort_order"),
        supabase.from("cms_channels").select("*").eq("is_published", true).order("sort_order"),
      ]);
      if (cancelled) return;

      if (b.data?.length) {
        setBlogs([
          ...b.data.map(row => ({
            id: row.slug,
            title: row.title,
            excerpt: row.excerpt ?? "",
            content: row.body ?? "",
            author: row.author ?? "Travelista",
            authorImage: FALLBACK_IMG,
            category: row.category ?? "Travel",
            tags: row.tags ?? [],
            date: new Date(row.created_at).toLocaleDateString(),
            readTime: row.read_time ?? "5 min",
            image: row.image_url ?? FALLBACK_IMG,
            featured: row.is_featured,
          })) as BlogPost[],
          ...blogPosts,
        ]);
      }

      if (s.data?.length) {
        setStories([
          ...s.data.map(row => ({
            id: row.slug,
            travelerName: row.author ?? "Traveler",
            country: "",
            hostName: row.author ?? "Travelista",
            city: row.location ?? "India",
            title: row.title,
            excerpt: row.excerpt ?? "",
            fullStory: row.body ?? "",
            image: row.image_url ?? FALLBACK_IMG,
            duration: "",
          })) as unknown as Story[],
          ...communityStories,
        ]);
      }

      if (t.data?.length) {
        setTips([
          ...t.data.map(row => ({
            id: row.slug,
            title: row.title,
            category: (row.category ?? "culture") as TravelTip["category"],
            content: row.body ?? "",
            icon: row.icon ?? "💡",
          })),
          ...travelTips,
        ]);
      }

      setChannels((c.data ?? []) as CmsChannel[]);
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, []);

  return { blogs, stories, tips, channels, loading };
};
