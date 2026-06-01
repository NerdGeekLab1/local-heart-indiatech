import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Heart, MessageCircle, Send, MapPin, Mountain, Sparkles, Plus, Bookmark, Play, Camera, Compass, Globe2, Flame, Filter } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";
import { CreatePostDialog } from "@/components/CreatePostDialog";

interface FeedPost {
  id: string; user_id: string; media_url: string; media_type: string;
  caption: string | null; tag_type: string | null; tag_value: string | null;
  location: string | null; likes_count: number; created_at: string;
  status?: string;
  author?: { first_name: string; last_name: string | null; avatar_url: string | null };
  liked?: boolean; bookmarked?: boolean;
}

const FILTERS = [
  { value: "all", label: "All", emoji: "✨" },
  { value: "location", label: "Places", emoji: "📍" },
  { value: "adventure", label: "Adventure", emoji: "🏔️" },
  { value: "experience", label: "Vibes", emoji: "🍜" },
];

const TAG_ICON: Record<string, any> = { location: MapPin, adventure: Mountain, experience: Sparkles };

const Feed = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [createOpen, setCreateOpen] = useState(false);
  const [activePin, setActivePin] = useState<string | null>(null);

  const loadFeed = async () => {
    setLoading(true);
    let query = supabase.from("feed_posts").select("*").eq("status", "active").order("created_at", { ascending: false }).limit(60);
    if (filter !== "all") query = query.eq("tag_type", filter);
    const { data: postsData } = await query;
    if (!postsData) { setPosts([]); setLoading(false); return; }
    const userIds = Array.from(new Set(postsData.map(p => p.user_id)));
    const { data: profiles } = await supabase.from("profiles").select("id, first_name, last_name, avatar_url").in("id", userIds);
    const profileMap = new Map(profiles?.map(p => [p.id, p]) || []);

    let likedSet = new Set<string>();
    let bookmarkedSet = new Set<string>();
    if (user) {
      const [{ data: likes }, { data: bms }] = await Promise.all([
        supabase.from("feed_likes").select("post_id").eq("user_id", user.id).in("post_id", postsData.map(p => p.id)),
        supabase.from("feed_bookmarks").select("post_id").eq("user_id", user.id).in("post_id", postsData.map(p => p.id)),
      ]);
      likedSet = new Set(likes?.map(l => l.post_id) || []);
      bookmarkedSet = new Set(bms?.map(b => b.post_id) || []);
    }
    setPosts(postsData.map(p => ({ ...p, author: profileMap.get(p.user_id) as any, liked: likedSet.has(p.id), bookmarked: bookmarkedSet.has(p.id) })));
    setLoading(false);
  };

  useEffect(() => { loadFeed(); /* eslint-disable-next-line */ }, [filter, user?.id]);

  const toggleLike = async (post: FeedPost) => {
    if (!user) { toast({ title: "Sign in to like posts", variant: "destructive" }); return; }
    if (post.liked) {
      await supabase.from("feed_likes").delete().eq("post_id", post.id).eq("user_id", user.id);
      setPosts(p => p.map(x => x.id === post.id ? { ...x, liked: false, likes_count: Math.max(x.likes_count - 1, 0) } : x));
    } else {
      await supabase.from("feed_likes").insert({ post_id: post.id, user_id: user.id });
      setPosts(p => p.map(x => x.id === post.id ? { ...x, liked: true, likes_count: x.likes_count + 1 } : x));
    }
  };

  const toggleBookmark = async (post: FeedPost) => {
    if (!user) { toast({ title: "Sign in to bookmark", variant: "destructive" }); return; }
    if (post.bookmarked) {
      await supabase.from("feed_bookmarks").delete().eq("post_id", post.id).eq("user_id", user.id);
    } else {
      await supabase.from("feed_bookmarks").insert({ post_id: post.id, user_id: user.id });
    }
    setPosts(p => p.map(x => x.id === post.id ? { ...x, bookmarked: !x.bookmarked } : x));
  };

  // Aggregate locations for atlas
  const atlas = useMemo(() => {
    const map = new Map<string, { name: string; count: number; posts: FeedPost[] }>();
    posts.forEach(p => {
      const key = (p.location || p.tag_value || "").trim();
      if (!key) return;
      const prev = map.get(key) || { name: key, count: 0, posts: [] };
      prev.count++; prev.posts.push(p); map.set(key, prev);
    });
    return Array.from(map.values()).sort((a, b) => b.count - a.count);
  }, [posts]);

  const stories = Array.from(new Map(posts.map(p => [p.user_id, p])).values()).slice(0, 12);
  const totalLikes = posts.reduce((s, p) => s + p.likes_count, 0);

  const visiblePosts = activePin ? posts.filter(p => (p.location || p.tag_value) === activePin) : posts;

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Texture/grid backdrop instead of IG-style gradients */}
      <div className="pointer-events-none fixed inset-0 -z-10 opacity-[0.04]" style={{
        backgroundImage: "linear-gradient(to right, hsl(var(--foreground)) 1px, transparent 1px), linear-gradient(to bottom, hsl(var(--foreground)) 1px, transparent 1px)",
        backgroundSize: "40px 40px"
      }} />
      <Navbar />

      <main className="pt-20 pb-32 mx-auto max-w-7xl px-3 sm:px-4">
        {/* Header strip — postcard / atlas vibe */}
        <section className="relative mb-5 rounded-3xl overflow-hidden border-2 border-foreground/10 bg-card shadow-card">
          <div className="absolute top-0 right-0 h-full w-1/3 bg-gradient-to-br from-primary via-orange-500 to-pink-500 opacity-90 [clip-path:polygon(30%_0,100%_0,100%_100%,0_100%)]" />
          <div className="relative grid sm:grid-cols-3 gap-4 p-5 sm:p-6 items-center">
            <div className="sm:col-span-2">
              <div className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.3em] font-bold text-primary mb-1">
                <Flame className="w-3 h-3" /> Travelista · Live Atlas
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight leading-tight">
                Stories pinned across <span className="bg-gradient-to-r from-primary to-pink-500 bg-clip-text text-transparent">Bharat</span>
              </h1>
              <p className="text-sm text-muted-foreground mt-1">A travel-zine feed — postcards from real roads, not square selfies.</p>
              <div className="flex flex-wrap items-center gap-2 mt-3 text-xs">
                <span className="px-2.5 py-1 rounded-full bg-foreground text-background font-bold">{posts.length} postcards</span>
                <span className="px-2.5 py-1 rounded-full border border-foreground/20 text-foreground font-semibold flex items-center gap-1"><Heart className="w-3 h-3" /> {totalLikes}</span>
                <span className="px-2.5 py-1 rounded-full border border-foreground/20 text-foreground font-semibold flex items-center gap-1"><MapPin className="w-3 h-3" /> {atlas.length} pins</span>
              </div>
            </div>
            <div className="relative flex sm:justify-end">
              <Dialog open={createOpen} onOpenChange={setCreateOpen}>
                <DialogTrigger asChild>
                  <button className="relative w-full sm:w-auto px-5 py-4 rounded-2xl bg-background text-foreground font-bold shadow-2xl border-2 border-foreground/10 hover:scale-[1.02] active:scale-95 transition-transform flex items-center justify-center gap-2">
                    <Camera className="w-5 h-5" /> Drop a Postcard
                    <span className="absolute -top-2 -right-2 px-2 py-0.5 rounded-full bg-pink-500 text-primary-foreground text-[10px] font-bold animate-pulse">NEW</span>
                  </button>
                </DialogTrigger>
                <CreatePostDialog onClose={() => { setCreateOpen(false); loadFeed(); }} />
              </Dialog>
            </div>
          </div>
        </section>

        {/* Stories rail — full-width mobile scroll, edge-to-edge */}
        {stories.length > 0 && (
          <section className="mb-5">
            <div className="flex items-center justify-between mb-2 px-1">
              <h2 className="text-xs font-bold uppercase tracking-widest text-foreground">Stories on the road</h2>
              <span className="text-[10px] text-muted-foreground">scroll →</span>
            </div>
            <div className="-mx-3 sm:mx-0 overflow-x-auto scrollbar-hide">
              <div className="flex gap-3 px-3 sm:px-0 pb-2 w-max min-w-full">
                {stories.map(s => {
                  const name = s.author?.first_name || "Traveler";
                  return (
                    <Link to={`/traveler/${s.user_id}`} key={s.user_id} className="flex flex-col items-center gap-1.5 flex-shrink-0 w-16 group">
                      <div className="p-[2.5px] rounded-full bg-gradient-to-tr from-primary via-pink-500 to-yellow-400 group-hover:scale-110 transition-transform">
                        <div className="p-[2px] bg-background rounded-full">
                          <Avatar className="w-14 h-14">
                            <AvatarImage src={s.author?.avatar_url || undefined} />
                            <AvatarFallback className="bg-gradient-to-br from-primary/20 to-pink-500/20 font-bold">{name.charAt(0)}</AvatarFallback>
                          </Avatar>
                        </div>
                      </div>
                      <span className="text-[11px] text-foreground font-medium truncate max-w-full">{name}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          </section>
        )}

        {/* Split: Feed + Atlas */}
        <div className="grid lg:grid-cols-[1fr_320px] gap-6">
          {/* LEFT: feed stream */}
          <div>
            {/* Filter chips */}
            <div className="mb-4 flex items-center gap-2 overflow-x-auto pb-2 -mx-3 sm:mx-0 px-3 sm:px-0 scrollbar-hide">
              <Filter className="w-4 h-4 text-muted-foreground shrink-0" />
              {FILTERS.map(f => {
                const active = filter === f.value;
                return (
                  <button key={f.value} onClick={() => { setFilter(f.value); setActivePin(null); }}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all border-2 ${
                      active ? "bg-foreground text-background border-foreground" : "bg-transparent text-foreground border-foreground/15 hover:border-foreground/40"
                    }`}>
                    <span className="mr-1">{f.emoji}</span>{f.label}
                  </button>
                );
              })}
              {activePin && (
                <button onClick={() => setActivePin(null)} className="ml-1 px-3 py-1.5 rounded-full text-xs font-bold bg-primary text-primary-foreground border-2 border-primary flex items-center gap-1">
                  <MapPin className="w-3 h-3" /> {activePin} ×
                </button>
              )}
            </div>

            {loading ? (
              <div className="space-y-5">
                {[1, 2].map(i => (
                  <div key={i} className="bg-card border-2 border-foreground/10 rounded-3xl overflow-hidden p-4 space-y-3">
                    <Skeleton className="h-8 w-40" /><Skeleton className="aspect-[4/3] w-full rounded-2xl" /><Skeleton className="h-4 w-full" />
                  </div>
                ))}
              </div>
            ) : visiblePosts.length === 0 ? (
              <div className="text-center py-20 rounded-3xl border-2 border-dashed border-foreground/20 bg-card">
                <div className="text-6xl mb-3">📮</div>
                <p className="text-foreground font-bold text-lg">No postcards yet</p>
                <p className="text-sm text-muted-foreground mt-1">Be the first to drop one from your trip.</p>
                <Button onClick={() => setCreateOpen(true)} className="mt-4 rounded-full">
                  <Plus className="w-4 h-4 mr-1" /> Drop a Postcard
                </Button>
              </div>
            ) : (
              <div className="space-y-6">
                {visiblePosts.map((post, i) => (
                  <PostcardItem key={post.id} post={post} index={i} onLike={() => toggleLike(post)} onBookmark={() => toggleBookmark(post)} />
                ))}
              </div>
            )}
          </div>

          {/* RIGHT: Atlas (sticky on desktop, collapsible on mobile) */}
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-3xl border-2 border-foreground/10 bg-card shadow-card overflow-hidden">
              <div className="px-4 py-3 border-b-2 border-foreground/10 bg-gradient-to-br from-primary/5 to-pink-500/5">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-foreground flex items-center gap-1.5"><Globe2 className="w-4 h-4 text-primary" /> Live Atlas</h3>
                  <span className="text-[10px] text-muted-foreground font-semibold">{atlas.length} places</span>
                </div>
                <p className="text-[11px] text-muted-foreground mt-0.5">Tap a pin to filter the feed.</p>
              </div>

              {/* Stylized India map with hot pins */}
              <div className="relative aspect-[4/5] bg-gradient-to-br from-amber-50/40 via-rose-50/30 to-sky-50/40 dark:from-foreground/5 dark:via-foreground/5 dark:to-foreground/5">
                <svg viewBox="0 0 200 250" className="absolute inset-0 w-full h-full p-4 opacity-30" fill="none" stroke="hsl(var(--foreground))" strokeWidth="1.5">
                  {/* Highly stylized India silhouette */}
                  <path d="M70 20 Q90 10 110 18 Q130 28 145 45 Q160 65 158 90 Q165 115 155 140 Q150 165 130 185 Q115 210 100 230 Q90 215 80 195 Q60 175 55 150 Q45 130 50 105 Q45 80 55 55 Q60 35 70 20 Z" />
                </svg>
                {atlas.slice(0, 12).map((a, idx) => {
                  // Pseudo-random but stable positions
                  const seed = a.name.split("").reduce((s, c) => s + c.charCodeAt(0), 0);
                  const x = 18 + ((seed * 7) % 68);
                  const y = 14 + ((seed * 13) % 72);
                  const active = activePin === a.name;
                  return (
                    <button
                      key={a.name}
                      onClick={() => setActivePin(active ? null : a.name)}
                      className={`absolute -translate-x-1/2 -translate-y-full group transition-transform hover:scale-125 ${active ? "scale-125 z-10" : ""}`}
                      style={{ left: `${x}%`, top: `${y}%` }}
                      title={`${a.name} · ${a.count}`}
                    >
                      <div className={`relative w-3 h-3 rounded-full ring-4 ${active ? "bg-pink-500 ring-pink-500/30" : "bg-primary ring-primary/30"} shadow-lg`}>
                        <span className={`absolute inset-0 rounded-full animate-ping ${active ? "bg-pink-500/60" : "bg-primary/60"}`} />
                      </div>
                      {(active || idx < 3) && (
                        <span className={`absolute left-1/2 -translate-x-1/2 mt-1 px-1.5 py-0.5 rounded text-[9px] font-bold whitespace-nowrap ${active ? "bg-pink-500 text-primary-foreground" : "bg-foreground text-background"}`}>
                          {a.name}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              <div className="max-h-64 overflow-y-auto p-2 space-y-1">
                {atlas.length === 0 && <p className="text-xs text-muted-foreground text-center py-4">No locations tagged yet.</p>}
                {atlas.map(a => (
                  <button key={a.name} onClick={() => setActivePin(activePin === a.name ? null : a.name)}
                    className={`w-full text-left flex items-center justify-between gap-2 px-3 py-2 rounded-xl text-xs transition-colors ${
                      activePin === a.name ? "bg-foreground text-background" : "hover:bg-secondary text-foreground"
                    }`}>
                    <span className="flex items-center gap-1.5 truncate"><MapPin className="w-3 h-3 shrink-0" /> {a.name}</span>
                    <span className="font-bold tabular-nums shrink-0">{a.count}</span>
                  </button>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </main>

      {/* Mobile FAB */}
      <button
        onClick={() => setCreateOpen(true)}
        className="fixed bottom-24 right-4 lg:hidden z-40 w-14 h-14 rounded-2xl bg-foreground text-background shadow-2xl flex items-center justify-center hover:scale-105 active:scale-95 transition-transform"
        aria-label="Create post"
      >
        <Plus className="w-6 h-6" />
      </button>

      <Footer />
    </div>
  );
};

const PostcardItem = ({ post, onLike, onBookmark, index }: { post: FeedPost; onLike: () => void; onBookmark: () => void; index: number }) => {
  const name = post.author ? `${post.author.first_name || ""} ${post.author.last_name || ""}`.trim() || "Traveler" : "Traveler";
  const TagIcon = post.tag_type ? (TAG_ICON[post.tag_type] || Sparkles) : Sparkles;
  const tilt = index % 2 === 0 ? "sm:-rotate-[0.4deg]" : "sm:rotate-[0.4deg]";

  return (
    <article className={`group bg-card border-2 border-foreground/10 rounded-3xl overflow-hidden shadow-card hover:shadow-elevated transition-all duration-300 ${tilt} hover:rotate-0`}>
      {/* Postcard ticket header */}
      <div className="flex items-stretch border-b-2 border-dashed border-foreground/15">
        <Link to={`/traveler/${post.user_id}`} className="flex items-center gap-3 p-3 flex-1 group/header">
          <Avatar className="w-10 h-10 ring-2 ring-foreground/10">
            <AvatarImage src={post.author?.avatar_url || undefined} />
            <AvatarFallback className="text-xs font-bold bg-secondary">{name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="text-sm font-bold text-foreground group-hover/header:text-primary leading-tight">{name}</p>
            <p className="text-[11px] text-muted-foreground flex items-center gap-1">
              <Compass className="w-3 h-3" />
              {post.location || formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
            </p>
          </div>
        </Link>
        <div className="border-l-2 border-dashed border-foreground/15 px-3 flex flex-col items-center justify-center text-center bg-secondary/30">
          <span className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">Postcard</span>
          <span className="text-sm font-extrabold text-foreground tabular-nums">#{(index + 1).toString().padStart(3, "0")}</span>
        </div>
      </div>

      {/* Media */}
      <div className="relative bg-foreground/5 aspect-[4/3] w-full overflow-hidden">
        {post.media_type === "video" ? (
          <video src={post.media_url} className="w-full h-full object-cover" controls playsInline preload="metadata" />
        ) : (
          <img src={post.media_url} alt={post.caption || "Postcard"} className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-700" loading="lazy" />
        )}

        {post.tag_type && post.tag_value && (
          <div className="absolute top-3 left-3 inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-background/95 text-foreground text-[11px] font-bold shadow-md backdrop-blur border border-foreground/10">
            <TagIcon className="w-3 h-3 text-primary" />{post.tag_value}
          </div>
        )}
        {post.media_type === "video" && (
          <div className="absolute top-3 right-3 bg-foreground text-background px-2 py-0.5 rounded-md flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider">
            <Play className="w-3 h-3 fill-current" /> Reel
          </div>
        )}
        {/* Decorative stamp corner */}
        <div className="absolute bottom-3 right-3 rotate-[8deg] px-2 py-1 rounded-md border-2 border-pink-500/70 text-pink-500 text-[9px] font-extrabold uppercase tracking-widest bg-background/70 backdrop-blur">
          ✈ Bharat
        </div>
      </div>

      {/* Meta + actions */}
      <div className="p-4">
        {post.caption && <p className="text-sm text-foreground leading-relaxed mb-3"><span className="font-bold">{name.split(" ")[0]}:</span> {post.caption}</p>}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <button onClick={onLike} className="px-2.5 py-1.5 rounded-full hover:bg-secondary transition flex items-center gap-1.5">
              <Heart className={`w-4 h-4 ${post.liked ? "fill-pink-500 text-pink-500" : "text-foreground"}`} />
              <span className="text-xs font-bold tabular-nums">{post.likes_count}</span>
            </button>
            <button className="p-2 rounded-full hover:bg-secondary transition"><MessageCircle className="w-4 h-4 text-foreground" /></button>
            <button className="p-2 rounded-full hover:bg-secondary transition"><Send className="w-4 h-4 text-foreground" /></button>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
              {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
            </span>
            <button onClick={onBookmark} className="p-2 rounded-full hover:bg-secondary transition">
              <Bookmark className={`w-4 h-4 ${post.bookmarked ? "fill-primary text-primary" : "text-foreground"}`} />
            </button>
          </div>
        </div>
      </div>
    </article>
  );
};

export default Feed;
