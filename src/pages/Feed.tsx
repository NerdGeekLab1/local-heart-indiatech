import { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { Heart, MessageCircle, Send, MapPin, Mountain, Sparkles, Plus, Image as ImageIcon, Video, X, Loader2, Bookmark, MoreHorizontal, Play } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
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
  { value: "all", label: "✨ All" },
  { value: "location", label: "📍 Places" },
  { value: "adventure", label: "🏔️ Adventure" },
  { value: "experience", label: "🍜 Experience" },
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

  // Build "stories" rail from unique recent authors
  const stories = Array.from(new Map(posts.map(p => [p.user_id, p])).values()).slice(0, 10);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20">
      <Navbar />
      <main className="mx-auto max-w-xl px-3 sm:px-4 py-6 pb-28">
        {/* Header */}
        <header className="mb-5 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary via-primary to-accent-foreground bg-clip-text text-transparent">
              Traveler Feed
            </h1>
            <p className="text-sm text-muted-foreground">Stories from the road, in real time</p>
          </div>
          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-1.5 rounded-full shadow-md shadow-primary/20">
                <Plus className="w-4 h-4" /> Share
              </Button>
            </DialogTrigger>
            <CreatePostDialog onClose={() => { setCreateOpen(false); loadFeed(); }} />
          </Dialog>
        </header>

        {/* Stories rail */}
        {stories.length > 0 && (
          <div className="mb-5 -mx-3 sm:mx-0 px-3 sm:px-0 flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
            {stories.map(s => {
              const name = s.author?.first_name || "Traveler";
              return (
                <div key={s.user_id} className="flex flex-col items-center gap-1 flex-shrink-0 w-16">
                  <div className="p-0.5 rounded-full bg-gradient-to-tr from-primary via-orange-400 to-pink-500">
                    <div className="p-0.5 bg-background rounded-full">
                      <Avatar className="w-14 h-14">
                        <AvatarImage src={s.author?.avatar_url || undefined} />
                        <AvatarFallback className="bg-muted text-sm">{name.charAt(0)}</AvatarFallback>
                      </Avatar>
                    </div>
                  </div>
                  <span className="text-[10px] text-muted-foreground truncate max-w-full">{name}</span>
                </div>
              );
            })}
          </div>
        )}

        {/* Filter chips */}
        <div className="mb-5 flex gap-2 overflow-x-auto pb-2 -mx-3 sm:mx-0 px-3 sm:px-0 scrollbar-hide">
          {FILTERS.map(f => (
            <button key={f.value} onClick={() => setFilter(f.value)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                filter === f.value
                  ? "bg-foreground text-background shadow-sm"
                  : "bg-card border border-border text-muted-foreground hover:text-foreground hover:border-foreground/30"
              }`}>
              {f.label}
            </button>
          ))}
        </div>

        {/* Posts */}
        {loading ? (
          <div className="space-y-5">
            {[1,2].map(i => (
              <div key={i} className="bg-card border border-border rounded-2xl overflow-hidden">
                <div className="p-3 flex items-center gap-2.5"><Skeleton className="w-9 h-9 rounded-full" /><Skeleton className="h-3 w-24" /></div>
                <Skeleton className="aspect-square w-full" />
                <div className="p-3 space-y-2"><Skeleton className="h-4 w-32" /><Skeleton className="h-3 w-full" /></div>
              </div>
            ))}
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-20 rounded-2xl border-2 border-dashed border-border bg-card/50">
            <Sparkles className="w-10 h-10 mx-auto text-muted-foreground/50 mb-3" />
            <p className="text-muted-foreground font-medium">No posts here yet</p>
            <p className="text-xs text-muted-foreground/70 mt-1">Be the first to share an adventure!</p>
          </div>
        ) : (
          <div className="space-y-6">
            {posts.map(post => <PostCard key={post.id} post={post} onLike={() => toggleLike(post)} />)}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

const PostCard = ({ post, onLike }: { post: FeedPost; onLike: () => void }) => {
  const name = post.author ? `${post.author.first_name || ""} ${post.author.last_name || ""}`.trim() || "Traveler" : "Traveler";
  const TagIcon = TAG_TYPES.find(t => t.value === post.tag_type)?.icon || Sparkles;
  const [burst, setBurst] = useState(false);
  const lastTap = useRef(0);

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
    <article className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-center justify-between p-3">
        <Link to={`/host/${post.user_id}`} className="flex items-center gap-2.5 group">
          <div className="p-[1.5px] rounded-full bg-gradient-to-tr from-primary to-pink-500">
            <Avatar className="w-9 h-9 border-2 border-background">
              <AvatarImage src={post.author?.avatar_url || undefined} />
              <AvatarFallback className="text-xs">{name.charAt(0)}</AvatarFallback>
            </Avatar>
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors leading-tight">{name}</p>
            {post.location && (
              <p className="text-xs text-muted-foreground flex items-center gap-1 leading-tight">
                <MapPin className="w-3 h-3" />{post.location}
              </p>
            )}
          </div>
        </Link>
        <button className="text-muted-foreground hover:text-foreground"><MoreHorizontal className="w-5 h-5" /></button>
      </div>

      {/* Media */}
      <div
        className="relative bg-foreground/5 aspect-square w-full overflow-hidden cursor-pointer select-none"
        onClick={handleDoubleTap}
      >
        {post.media_type === "video" ? (
          <video src={post.media_url} className="w-full h-full object-cover" controls playsInline preload="metadata" />
        ) : (
          <img src={post.media_url} alt={post.caption || "Feed post"} className="w-full h-full object-cover" loading="lazy" />
        )}
        {post.media_type === "video" && (
          <div className="absolute top-3 right-3 bg-background/70 backdrop-blur px-2 py-1 rounded-full flex items-center gap-1 text-xs font-medium">
            <Play className="w-3 h-3 fill-current" /> Reel
          </div>
        )}
        {burst && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <Heart className="w-24 h-24 fill-destructive text-destructive drop-shadow-lg animate-in zoom-in-50 fade-in duration-300" />
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="px-3 pt-3 pb-2 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={onLike} className="transition-transform active:scale-75">
            <Heart className={`w-6 h-6 transition-colors ${post.liked ? "fill-destructive text-destructive" : "text-foreground hover:text-muted-foreground"}`} />
          </button>
          <button className="text-foreground hover:text-muted-foreground transition-colors"><MessageCircle className="w-6 h-6" /></button>
          <button className="text-foreground hover:text-muted-foreground transition-colors"><Send className="w-6 h-6" /></button>
        </div>
        <button className="text-foreground hover:text-muted-foreground transition-colors"><Bookmark className="w-6 h-6" /></button>
      </div>

      {/* Meta */}
      <div className="px-3 pb-3 space-y-1.5">
        <p className="text-sm font-semibold text-foreground">
          {post.likes_count.toLocaleString()} {post.likes_count === 1 ? "like" : "likes"}
        </p>
        {post.caption && (
          <p className="text-sm text-foreground leading-snug">
            <span className="font-semibold mr-1.5">{name}</span>{post.caption}
          </p>
        )}
        <div className="flex items-center gap-2 flex-wrap pt-1">
          {post.tag_type && post.tag_value && (
            <Badge variant="secondary" className="gap-1 font-normal rounded-full text-xs">
              <TagIcon className="w-3 h-3" />{post.tag_value}
            </Badge>
          )}
          <span className="text-[11px] text-muted-foreground uppercase tracking-wide">
            {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
          </span>
        </div>
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
      toast({ title: "Posted to feed!" });
      onClose();
    } catch (e: any) {
      toast({ title: "Failed to post", description: e.message, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DialogContent className="max-w-md">
      <DialogHeader><DialogTitle>Share to Feed</DialogTitle></DialogHeader>
      <div className="space-y-3">
        {preview ? (
          <div className="relative aspect-square rounded-lg overflow-hidden bg-muted">
            {file?.type.startsWith("video") ? <video src={preview} className="w-full h-full object-cover" controls /> : <img src={preview} alt="preview" className="w-full h-full object-cover" />}
            <button onClick={() => { setFile(null); setPreview(null); }} className="absolute top-2 right-2 w-8 h-8 rounded-full bg-background/80 flex items-center justify-center"><X className="w-4 h-4" /></button>
          </div>
        ) : (
          <button onClick={() => fileRef.current?.click()} className="w-full aspect-square rounded-lg border-2 border-dashed border-border flex flex-col items-center justify-center gap-2 hover:border-primary transition-colors">
            <div className="flex gap-2"><ImageIcon className="w-8 h-8 text-primary" /><Video className="w-8 h-8 text-primary" /></div>
            <p className="text-sm font-medium">Tap to upload photo or video</p>
            <p className="text-xs text-muted-foreground">Max 50MB</p>
          </button>
        )}
        <input ref={fileRef} type="file" accept="image/*,video/*" className="hidden" onChange={e => handleFile(e.target.files?.[0] || null)} />

        <Textarea placeholder="Write a caption…" value={caption} onChange={e => setCaption(e.target.value)} maxLength={500} rows={3} />

        <div className="grid grid-cols-2 gap-2">
          <Select value={tagType} onValueChange={setTagType}>
            <SelectTrigger><SelectValue placeholder="Tag type" /></SelectTrigger>
            <SelectContent>
              {TAG_TYPES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
            </SelectContent>
          </Select>
          <Input placeholder={tagType === "location" ? "e.g. Manali" : tagType === "adventure" ? "e.g. Trekking" : "e.g. Homestay"} value={tagValue} onChange={e => setTagValue(e.target.value)} maxLength={50} />
        </div>

        <Input placeholder="📍 Location (optional)" value={location} onChange={e => setLocation(e.target.value)} maxLength={100} />

        <Button onClick={submit} disabled={submitting || !file} className="w-full rounded-full">
          {submitting ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Posting…</> : "Share Post"}
        </Button>
      </div>
    </DialogContent>
  );
};

export default Feed;
