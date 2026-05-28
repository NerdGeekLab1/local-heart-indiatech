import { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { Heart, MessageCircle, Send, MapPin, Mountain, Sparkles, Plus, Image as ImageIcon, Video, X, Loader2 } from "lucide-react";
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

const FILTERS = ["all", "location", "adventure", "experience"];

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

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="mx-auto max-w-2xl px-4 py-8 pb-24">
        <header className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Traveler Feed</h1>
            <p className="text-sm text-muted-foreground">Stories, moments and adventures from the community</p>
          </div>
          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2 rounded-full"><Plus className="w-4 h-4" /> Share</Button>
            </DialogTrigger>
            <CreatePostDialog onClose={() => { setCreateOpen(false); loadFeed(); }} />
          </Dialog>
        </header>

        <div className="mb-6 flex gap-2 overflow-x-auto pb-2">
          {FILTERS.map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium capitalize whitespace-nowrap transition-colors ${filter === f ? "bg-primary text-primary-foreground" : "bg-card border border-border text-muted-foreground hover:text-foreground"}`}>
              {f}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
        ) : posts.length === 0 ? (
          <div className="text-center py-16 rounded-2xl border-2 border-dashed border-border">
            <p className="text-muted-foreground">No posts yet. Be the first to share!</p>
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

  return (
    <article className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
      <div className="flex items-center justify-between p-3">
        <Link to={`/host/${post.user_id}`} className="flex items-center gap-2.5">
          <Avatar className="w-9 h-9">
            <AvatarImage src={post.author?.avatar_url || undefined} />
            <AvatarFallback>{name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm font-semibold text-foreground">{name}</p>
            {post.location && <p className="text-xs text-muted-foreground flex items-center gap-1"><MapPin className="w-3 h-3" />{post.location}</p>}
          </div>
        </Link>
        <span className="text-xs text-muted-foreground">{formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}</span>
      </div>

      <div className="bg-foreground/5 aspect-square w-full overflow-hidden">
        {post.media_type === "video" ? (
          <video src={post.media_url} className="w-full h-full object-cover" controls playsInline />
        ) : (
          <img src={post.media_url} alt={post.caption || "Feed post"} className="w-full h-full object-cover" loading="lazy" />
        )}
      </div>

      <div className="p-3 space-y-2">
        <div className="flex items-center gap-3">
          <button onClick={onLike} className="transition-transform active:scale-90">
            <Heart className={`w-6 h-6 ${post.liked ? "fill-destructive text-destructive" : "text-foreground"}`} />
          </button>
          <MessageCircle className="w-6 h-6 text-foreground" />
          <Send className="w-6 h-6 text-foreground" />
        </div>
        <p className="text-sm font-semibold text-foreground">{post.likes_count} {post.likes_count === 1 ? "like" : "likes"}</p>
        {post.caption && (
          <p className="text-sm text-foreground"><span className="font-semibold">{name}</span> {post.caption}</p>
        )}
        {post.tag_type && post.tag_value && (
          <Badge variant="secondary" className="gap-1"><TagIcon className="w-3 h-3" />{post.tag_value}</Badge>
        )}
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
