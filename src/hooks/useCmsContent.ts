import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { blogPosts, communityStories, travelTips, type BlogPost, type TravelTip } from "@/lib/data";
import { useCmsPreview } from "@/hooks/useCmsPreview";

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

const mapBlogs = (rows: Record<string, any>[]): BlogPost[] =>
  rows.map(row => ({
    id: row.slug,
    title: row.title,
    excerpt: row.excerpt ?? "",
    content: row.body ?? "",
    author: row.author ?? "RoamYoo",
    authorImage: FALLBACK_IMG,
    category: row.category ?? "Travel",
    tags: row.tags ?? [],
    date: new Date(row.created_at).toLocaleDateString(),
    readTime: row.read_time ?? "5 min",
    image: row.image_url ?? FALLBACK_IMG,
    featured: row.is_featured,
  })) as BlogPost[];

const mapStories = (rows: Record<string, any>[]): Story[] =>
  rows.map(row => ({
    id: row.slug,
    travelerName: row.author ?? "Traveler",
    country: "",
    hostName: row.author ?? "RoamYoo",
    city: row.location ?? "India",
    title: row.title,
    excerpt: row.excerpt ?? "",
    fullStory: row.body ?? "",
    image: row.image_url ?? FALLBACK_IMG,
    duration: "",
  })) as unknown as Story[];

const mapTips = (rows: Record<string, any>[]): TravelTip[] =>
  rows.map(row => ({
    id: row.slug,
    title: row.title,
    category: (row.category ?? "culture") as TravelTip["category"],
    content: row.body ?? "",
    icon: row.icon ?? "💡",
  }));

/**
 * Merges admin-managed (Website CMS) content with the built-in curated content.
 * Only published CMS rows are visible to visitors (enforced by RLS); a valid
 * shareable preview token additionally surfaces unpublished drafts.
 */
export const useCmsContent = () => {
  const { preview, isPreview } = useCmsPreview();
  const [blogs, setBlogs] = useState<BlogPost[]>(blogPosts);
  const [stories, setStories] = useState<Story[]>(communityStories);
  const [tips, setTips] = useState<TravelTip[]>(travelTips);
  const [channels, setChannels] = useState<CmsChannel[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    if (isPreview && preview) {
      setBlogs([...mapBlogs(preview.blogs), ...blogPosts]);
      setStories([...mapStories(preview.stories), ...communityStories]);
      setTips([...mapTips(preview.tips), ...travelTips]);
      setChannels(preview.channels as unknown as CmsChannel[]);
      setLoading(false);
      return;
    }

    (async () => {
      const [b, s, t, c] = await Promise.all([
        supabase.from("cms_blogs").select("*").eq("is_published", true).order("sort_order"),
        supabase.from("cms_stories").select("*").eq("is_published", true).order("sort_order"),
        supabase.from("cms_tips").select("*").eq("is_published", true).order("sort_order"),
        supabase.from("cms_channels").select("*").eq("is_published", true).order("sort_order"),
      ]);
      if (cancelled) return;

      if (b.data?.length) setBlogs([...mapBlogs(b.data), ...blogPosts]);
      if (s.data?.length) setStories([...mapStories(s.data), ...communityStories]);
      if (t.data?.length) setTips([...mapTips(t.data), ...travelTips]);
      setChannels((c.data ?? []) as CmsChannel[]);
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [isPreview, preview]);

  return { blogs, stories, tips, channels, loading };
};
