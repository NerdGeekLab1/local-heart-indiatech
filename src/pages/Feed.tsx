import { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { Heart, MessageCircle, Send, MapPin, Mountain, Sparkles, Plus, Image as ImageIcon, Video, X, Loader2, Bookmark, MoreHorizontal, Play, Flame, Zap, Camera } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";

interface FeedPost {
  id: string;
  user_id: string;
  media_url: string;
  media_type: string;
  caption: string | null;
  tag_type: string | null;
  tag_value: string | null;
  location: string | null;
  likes_count: number;
  created_at: string;
  author?: { first_name: string; last_name: string | null; avatar_url: string | null };
  liked?: boolean;
}

const TAG_TYPES = [
  { value: "location", label: "Location", icon: MapPin },
  { value: "adventure", label: "Adventure", icon: Mountain },
  { value: "experience", label: "Experience", icon: Sparkles },
];

const FILTERS = [
  { value: "all", label: "All", emoji: "✨", grad: "from-primary to-pink-500" },
  { value: "location", label: "Places", emoji: "📍", grad: "from-sky-500 to-indigo-500" },
  { value: "adventure", label: "Adventure", emoji: "🏔️", grad: "from-emerald-500 to-teal-500" },
  { value: "experience", label: "Vibes", emoji: "🍜", grad: "from-orange-500 to-rose-500" },
];

const Feed = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [createOpen, setCreateOpen] = useState(false);

  const loadFeed = async () => {
    setLoading(true);
    let query = supabase.from("feed_posts").select("*").order("created_at", { ascending: false }).limit(50);
    if (filter !== "all") query = query.eq("tag_type", filter);
    const { data: postsData } = await query;
    if (!postsData) { setPosts([]); setLoading(false); return; }

    const userIds = Array.from(new Set(postsData.map(p => p.user_id)));
    const { data: profiles } = await supabase.from("profiles").select("id, first_name, last_name, avatar_url").in("id", userIds);
    const profileMap = new Map(profiles?.map(p => [p.id, p]) || []);

    let likedSet = new Set<string>();
    if (user) {
      const { data: likes } = await supabase.from("feed_likes").select("post_id").eq("user_id", user.id).in("post_id", postsData.map(p => p.id));
      likedSet = new Set(likes?.map(l => l.post_id) || []);
    }

    setPosts(postsData.map(p => ({ ...p, author: profileMap.get(p.user_id) as any, liked: likedSet.has(p.id) })));
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

  const stories = Array.from(new Map(posts.map(p => [p.user_id, p])).values()).slice(0, 10);
  const totalLikes = posts.reduce((s, p) => s + p.likes_count, 0);

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Ambient flashy backdrop */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute -top-32 -left-32 w-[28rem] h-[28rem] rounded-full bg-primary/20 blur-3xl" />
        <div className="absolute top-40 -right-32 w-[26rem] h-[26rem] rounded-full bg-pink-500/15 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 w-[24rem] h-[24rem] rounded-full bg-sky-500/10 blur-3xl" />
      </div>

      <Navbar />
      <main className="mx-auto max-w-xl px-3 sm:px-4 py-6 pb-32">
        {/* Flashy hero */}
        <section className="relative mb-6 overflow-hidden rounded-3xl p-5 bg-gradient-to-br from-primary via-orange-500 to-pink-500 text-primary-foreground shadow-2xl shadow-primary/30">
          <div className="absolute -right-10 -top-10 w-40 h-40 rounded-full bg-white/20 blur-2xl" />
          <div className="absolute -left-6 -bottom-10 w-32 h-32 rounded-full bg-white/10 blur-2xl" />
          <div className="relative flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest opacity-95 mb-1">
                <Flame className="w-3.5 h-3.5 animate-pulse" /> Live Feed
              </div>
              <h1 className="text-3xl font-extrabold tracking-tight leading-tight">Traveler Feed</h1>
              <p className="text-sm opacity-95 mt-1">Reels, snaps & soul-fuel from the road</p>
              <div className="flex items-center gap-3 mt-3 text-xs">
                <span className="px-2.5 py-1 rounded-full bg-white/25 backdrop-blur font-semibold">{posts.length} posts</span>
                <span className="px-2.5 py-1 rounded-full bg-white/25 backdrop-blur font-semibold flex items-center gap-1"><Heart className="w-3 h-3 fill-current" /> {totalLikes}</span>
              </div>
            </div>
            <Dialog open={createOpen} onOpenChange={setCreateOpen}>
              <DialogTrigger asChild>
                <button className="shrink-0 group relative w-14 h-14 rounded-2xl bg-background text-foreground shadow-xl flex items-center justify-center hover:scale-105 active:scale-95 transition-transform">
                  <Camera className="w-6 h-6" />
                  <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-pink-500 text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-background animate-pulse">+</span>
                </button>
              </DialogTrigger>
              <CreatePostDialog onClose={() => { setCreateOpen(false); loadFeed(); }} />
            </Dialog>
          </div>
        </section>

        {/* Stories rail */}
        {stories.length > 0 && (
          <section className="mb-5">
            <div className="flex items-center justify-between mb-2 px-1">
              <h2 className="text-xs font-bold uppercase tracking-widest text-foreground flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-primary" /> Stories from the road
              </h2>
              <span className="text-[10px] text-muted-foreground">{stories.length} live</span>
            </div>
            <div className="-mx-3 sm:mx-0 px-3 sm:px-0 flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
              {stories.map(s => {
                const name = s.author?.first_name || "Traveler";
                return (
                  <Link to={`/host/${s.user_id}`} key={s.user_id} className="flex flex-col items-center gap-1.5 flex-shrink-0 w-16 group">
                    <div className="p-[2.5px] rounded-full bg-gradient-to-tr from-primary via-pink-500 to-yellow-400 group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-primary/20">
                      <div className="p-[2px] bg-background rounded-full">
                        <Avatar className="w-14 h-14">
                          <AvatarImage src={s.author?.avatar_url || undefined} />
                          <AvatarFallback className="bg-gradient-to-br from-primary/20 to-pink-500/20 text-base font-bold">{name.charAt(0)}</AvatarFallback>
                        </Avatar>
                      </div>
                    </div>
                    <span className="text-[11px] text-foreground font-medium truncate max-w-full">{name}</span>
                  </Link>
                );
              })}
            </div>
          </section>
        )}

        {/* Gradient filter chips */}
        <div className="mb-6 flex gap-2 overflow-x-auto pb-2 -mx-3 sm:mx-0 px-3 sm:px-0 scrollbar-hide">
          {FILTERS.map(f => {
            const active = filter === f.value;
            return (
              <button
                key={f.value}
                onClick={() => setFilter(f.value)}
                className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all duration-300 active:scale-95 ${
                  active
                    ? `bg-gradient-to-r ${f.grad} text-white shadow-lg scale-105`
                    : "bg-card border border-border text-muted-foreground hover:text-foreground hover:border-primary/40"
                }`}
              >
                <span className="mr-1">{f.emoji}</span>{f.label}
              </button>
            );
          })}
        </div>

        {/* Posts */}
        {loading ? (
          <div className="space-y-5">
            {[1, 2].map(i => (
              <div key={i} className="bg-card border border-border rounded-3xl overflow-hidden">
                <div className="p-3 flex items-center gap-2.5"><Skeleton className="w-10 h-10 rounded-full" /><Skeleton className="h-3 w-24" /></div>
                <Skeleton className="aspect-square w-full" />
                <div className="p-3 space-y-2"><Skeleton className="h-4 w-32" /><Skeleton className="h-3 w-full" /></div>
              </div>
            ))}
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-20 rounded-3xl border-2 border-dashed border-primary/30 bg-gradient-to-br from-primary/5 to-pink-500/5">
            <div className="text-6xl mb-3 animate-bounce">📸</div>
            <p className="text-foreground font-bold text-lg">Nothing here yet</p>
            <p className="text-sm text-muted-foreground mt-1">Be the first to drop an adventure!</p>
            <Button onClick={() => setCreateOpen(true)} className="mt-4 rounded-full bg-gradient-to-r from-primary to-pink-500 text-white border-0">
              <Plus className="w-4 h-4 mr-1" /> Create the first post
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {posts.map((post, i) => <PostCard key={post.id} post={post} index={i} onLike={() => toggleLike(post)} />)}
          </div>
        )}
      </main>

      {/* Floating sticky FAB (mobile-first, visible everywhere) */}
      <button
        onClick={() => setCreateOpen(true)}
        className="fixed bottom-24 right-4 sm:bottom-8 sm:right-8 z-40 w-16 h-16 rounded-full bg-gradient-to-br from-primary via-orange-500 to-pink-500 text-white shadow-2xl shadow-primary/50 flex items-center justify-center hover:scale-110 active:scale-95 transition-transform group"
        aria-label="Create post"
      >
        <span className="absolute inset-0 rounded-full bg-gradient-to-br from-primary to-pink-500 animate-ping opacity-30" />
        <Plus className="w-7 h-7 relative" />
      </button>

      <Footer />
    </div>
  );
};

const PostCard = ({ post, onLike, index }: { post: FeedPost; onLike: () => void; index: number }) => {
  const name = post.author ? `${post.author.first_name || ""} ${post.author.last_name || ""}`.trim() || "Traveler" : "Traveler";
  const TagIcon = TAG_TYPES.find(t => t.value === post.tag_type)?.icon || Sparkles;
  const tagGrad = FILTERS.find(f => f.value === post.tag_type)?.grad || "from-primary to-pink-500";
  const [burst, setBurst] = useState(false);
  const [popLike, setPopLike] = useState(false);
  const lastTap = useRef(0);

  const triggerLike = () => {
    if (!post.liked) {
      setPopLike(true);
      setTimeout(() => setPopLike(false), 400);
    }
    onLike();
  };

  const handleDoubleTap = () => {
    const now = Date.now();
    if (now - lastTap.current < 300) {
      if (!post.liked) onLike();
      setBurst(true);
      setTimeout(() => setBurst(false), 700);
    }
    lastTap.current = now;
  };

  return (
    <article
      className="bg-card border border-border rounded-3xl overflow-hidden shadow-md hover:shadow-2xl hover:shadow-primary/10 transition-all duration-300 animate-fade-in"
      style={{ animationDelay: `${Math.min(index * 60, 240)}ms` }}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-3.5">
        <Link to={`/host/${post.user_id}`} className="flex items-center gap-3 group">
          <div className="p-[2px] rounded-full bg-gradient-to-tr from-primary via-pink-500 to-yellow-400">
            <Avatar className="w-10 h-10 border-2 border-background">
              <AvatarImage src={post.author?.avatar_url || undefined} />
              <AvatarFallback className="text-xs bg-gradient-to-br from-primary/20 to-pink-500/20 font-bold">{name.charAt(0)}</AvatarFallback>
            </Avatar>
          </div>
          <div>
            <p className="text-sm font-bold text-foreground group-hover:text-primary transition-colors leading-tight">{name}</p>
            {post.location ? (
              <p className="text-xs text-muted-foreground flex items-center gap-1 leading-tight mt-0.5">
                <MapPin className="w-3 h-3 text-primary" />{post.location}
              </p>
            ) : (
              <p className="text-xs text-muted-foreground leading-tight mt-0.5">
                {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
              </p>
            )}
          </div>
        </Link>
        <button className="text-muted-foreground hover:text-foreground p-1"><MoreHorizontal className="w-5 h-5" /></button>
      </div>

      {/* Media */}
      <div
        className="relative bg-foreground/5 aspect-square w-full overflow-hidden cursor-pointer select-none group"
        onClick={handleDoubleTap}
      >
        {post.media_type === "video" ? (
          <video src={post.media_url} className="w-full h-full object-cover" controls playsInline preload="metadata" />
        ) : (
          <img src={post.media_url} alt={post.caption || "Feed post"} className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500" loading="lazy" />
        )}

        {/* Tag floating chip on media */}
        {post.tag_type && post.tag_value && (
          <div className={`absolute top-3 left-3 flex items-center gap-1 px-2.5 py-1 rounded-full bg-gradient-to-r ${tagGrad} text-white text-xs font-bold shadow-lg backdrop-blur`}>
            <TagIcon className="w-3 h-3" />{post.tag_value}
          </div>
        )}

        {post.media_type === "video" && (
          <div className="absolute top-3 right-3 bg-foreground/70 text-background backdrop-blur px-2.5 py-1 rounded-full flex items-center gap-1 text-xs font-bold">
            <Play className="w-3 h-3 fill-current" /> Reel
          </div>
        )}

        {burst && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <Heart className="w-28 h-28 fill-pink-500 text-pink-500 drop-shadow-2xl animate-in zoom-in-50 fade-in duration-300" />
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="px-3.5 pt-3 pb-1.5 flex items-center justify-between">
        <div className="flex items-center gap-1">
          <button
            onClick={triggerLike}
            className={`p-2 rounded-full transition-all active:scale-75 ${popLike ? "scale-125" : ""}`}
          >
            <Heart className={`w-7 h-7 transition-all ${post.liked ? "fill-pink-500 text-pink-500 drop-shadow-md" : "text-foreground hover:text-pink-500"}`} />
          </button>
          <button className="p-2 rounded-full text-foreground hover:text-primary transition-colors"><MessageCircle className="w-7 h-7" /></button>
          <button className="p-2 rounded-full text-foreground hover:text-primary transition-colors"><Send className="w-7 h-7" /></button>
        </div>
        <button className="p-2 rounded-full text-foreground hover:text-primary transition-colors"><Bookmark className="w-7 h-7" /></button>
      </div>

      {/* Meta */}
      <div className="px-4 pb-4 space-y-1.5">
        <p className="text-sm font-bold text-foreground flex items-center gap-1.5">
          <span className="bg-gradient-to-r from-primary to-pink-500 bg-clip-text text-transparent">
            {post.likes_count.toLocaleString()}
          </span>
          <span className="text-foreground">{post.likes_count === 1 ? "like" : "likes"}</span>
        </p>
        {post.caption && (
          <p className="text-sm text-foreground leading-snug">
            <span className="font-bold mr-1.5">{name}</span>{post.caption}
          </p>
        )}
        <p className="text-[11px] text-muted-foreground uppercase tracking-wide pt-1">
          {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
        </p>
      </div>
    </article>
  );
};

const CreatePostDialog = ({ onClose }: { onClose: () => void }) => {
  const { user } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [caption, setCaption] = useState("");
  const [tagType, setTagType] = useState<string>("");
  const [tagValue, setTagValue] = useState("");
  const [location, setLocation] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = (f: File | null) => {
    if (!f) return;
    if (f.size > 50 * 1024 * 1024) { toast({ title: "Max 50MB", variant: "destructive" }); return; }
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const submit = async () => {
    if (!user) { toast({ title: "Please sign in", variant: "destructive" }); return; }
    if (!file) { toast({ title: "Add a photo or video", variant: "destructive" }); return; }
    setSubmitting(true);
    try {
      const ext = file.name.split(".").pop();
      const path = `${user.id}/${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage.from("feed-media").upload(path, file);
      if (upErr) throw upErr;
      const { data: pub } = supabase.storage.from("feed-media").getPublicUrl(path);
      const media_type = file.type.startsWith("video") ? "video" : "image";
      const { error: insErr } = await supabase.from("feed_posts").insert({
        user_id: user.id, media_url: pub.publicUrl, media_type,
        caption: caption.trim() || null,
        tag_type: tagType || null,
        tag_value: tagType ? (tagValue.trim() || null) : null,
        location: location.trim() || null,
      });
      if (insErr) throw insErr;
      toast({ title: "Posted to feed! 🎉" });
      onClose();
    } catch (e: any) {
      toast({ title: "Failed to post", description: e.message, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DialogContent className="max-w-md">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <span className="bg-gradient-to-r from-primary to-pink-500 bg-clip-text text-transparent font-extrabold">Share to Feed</span>
          <Sparkles className="w-5 h-5 text-primary" />
        </DialogTitle>
      </DialogHeader>
      <div className="space-y-3">
        {preview ? (
          <div className="relative aspect-square rounded-2xl overflow-hidden bg-muted">
            {file?.type.startsWith("video") ? <video src={preview} className="w-full h-full object-cover" controls /> : <img src={preview} alt="preview" className="w-full h-full object-cover" />}
            <button onClick={() => { setFile(null); setPreview(null); }} className="absolute top-2 right-2 w-8 h-8 rounded-full bg-background/80 flex items-center justify-center hover:bg-background"><X className="w-4 h-4" /></button>
          </div>
        ) : (
          <button onClick={() => fileRef.current?.click()} className="w-full aspect-square rounded-2xl border-2 border-dashed border-primary/40 flex flex-col items-center justify-center gap-3 hover:border-primary hover:bg-primary/5 transition-all bg-gradient-to-br from-primary/5 to-pink-500/5">
            <div className="flex gap-3">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-pink-500 flex items-center justify-center text-white shadow-lg">
                <ImageIcon className="w-7 h-7" />
              </div>
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-sky-500 to-indigo-500 flex items-center justify-center text-white shadow-lg">
                <Video className="w-7 h-7" />
              </div>
            </div>
            <p className="text-sm font-bold text-foreground">Tap to upload photo or video</p>
            <p className="text-xs text-muted-foreground">Max 50MB · jpg, png, mp4</p>
          </button>
        )}
        <input ref={fileRef} type="file" accept="image/*,video/*" className="hidden" onChange={e => handleFile(e.target.files?.[0] || null)} />

        <Textarea placeholder="Write a caption…" value={caption} onChange={e => setCaption(e.target.value)} maxLength={500} rows={3} className="rounded-xl" />

        <div className="grid grid-cols-2 gap-2">
          <Select value={tagType} onValueChange={setTagType}>
            <SelectTrigger className="rounded-xl"><SelectValue placeholder="Tag type" /></SelectTrigger>
            <SelectContent>
              {TAG_TYPES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
            </SelectContent>
          </Select>
          <Input className="rounded-xl" placeholder={tagType === "location" ? "e.g. Manali" : tagType === "adventure" ? "e.g. Trekking" : "e.g. Homestay"} value={tagValue} onChange={e => setTagValue(e.target.value)} maxLength={50} />
        </div>

        <Input className="rounded-xl" placeholder="📍 Location (optional)" value={location} onChange={e => setLocation(e.target.value)} maxLength={100} />

        <Button onClick={submit} disabled={submitting || !file} className="w-full rounded-full bg-gradient-to-r from-primary via-orange-500 to-pink-500 text-white border-0 shadow-lg shadow-primary/30 hover:opacity-95 h-11 font-bold">
          {submitting ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Posting…</> : <><Sparkles className="w-4 h-4 mr-1" /> Share Post</>}
        </Button>
      </div>
    </DialogContent>
  );
};

export default Feed;
