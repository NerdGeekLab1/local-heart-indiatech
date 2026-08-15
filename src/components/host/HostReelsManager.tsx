import { useEffect, useState } from "react";
import { Clock, Eye, EyeOff, Plus, Play, Trash2, CheckCircle2, XCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { CreatePostDialog } from "@/components/CreatePostDialog";
import { toast } from "@/hooks/use-toast";

type ReelTab = "all" | "approved" | "pending" | "rejected";

const badge = (status: string) =>
  status === "approved" ? "bg-accent/15 text-accent" :
  status === "rejected" ? "bg-destructive/15 text-destructive" : "bg-primary/15 text-primary";

export default function HostReelsManager({ userId }: { userId: string }) {
  const [posts, setPosts] = useState<any[]>([]);
  const [tab, setTab] = useState<ReelTab>("all");
  const [creating, setCreating] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    const { data } = await supabase.from("feed_posts").select("*").eq("user_id", userId).order("created_at", { ascending: false });
    setPosts(data || []);
    setLoading(false);
  };

  useEffect(() => {
    void load();
    const channel = supabase.channel(`host-reels-${userId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "feed_posts", filter: `user_id=eq.${userId}` }, load)
      .subscribe();
    return () => { void supabase.removeChannel(channel); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const remove = async (id: string) => {
    const { error } = await supabase.from("feed_posts").delete().eq("id", id);
    if (error) { toast({ title: "Couldn't delete", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Reel deleted" });
    void load();
  };

  const visible = tab === "all" ? posts : posts.filter(post => (post.reel_status || "pending") === tab);
  const counts = {
    all: posts.length,
    approved: posts.filter(p => p.reel_status === "approved").length,
    pending: posts.filter(p => (p.reel_status || "pending") === "pending").length,
    rejected: posts.filter(p => p.reel_status === "rejected").length,
  };

  return (
    <div className="space-y-5" data-testid="host-reels-manager">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-foreground">Reels &amp; Stories</h2>
          <p className="text-sm text-muted-foreground">Publish reels here. Only admin-approved reels appear on your public host page.</p>
        </div>
        <Button size="sm" className="rounded-full gap-2" onClick={() => setCreating(true)}><Plus className="h-4 w-4" /> New reel</Button>
      </div>

      <div className="flex flex-wrap gap-2">
        {(["all", "approved", "pending", "rejected"] as ReelTab[]).map(key => (
          <button key={key} onClick={() => setTab(key)}
            className={`rounded-full px-3 py-1.5 text-xs font-semibold capitalize transition-colors ${tab === key ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground hover:bg-secondary/80"}`}>
            {key} ({counts[key]})
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-sm text-muted-foreground">Loading your reels…</p>
      ) : visible.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
          No reels in this view yet.
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map(post => {
            const status = post.reel_status || "pending";
            return (
              <article key={post.id} className="overflow-hidden rounded-2xl border border-border bg-card shadow-card">
                <div className="relative aspect-[9/16] bg-muted">
                  {post.media_type === "video" ? (
                    <>
                      <video src={post.media_url} className="h-full w-full object-cover" muted preload="metadata" />
                      <div className="absolute inset-0 flex items-center justify-center bg-foreground/20"><Play className="h-8 w-8 fill-background text-background" /></div>
                    </>
                  ) : (
                    <img src={post.media_url} alt={post.caption || "Reel"} loading="lazy" className="h-full w-full object-cover" />
                  )}
                  <span className={`absolute left-2 top-2 rounded-full px-2 py-0.5 text-[10px] font-bold capitalize ${badge(status)}`}>{status}</span>
                </div>
                <div className="space-y-2 p-3">
                  <p className="line-clamp-2 text-sm text-foreground">{post.caption || post.location || "Untitled reel"}</p>
                  <p className="flex items-center gap-1 text-[11px] text-muted-foreground">
                    {status === "approved" ? <><Eye className="h-3 w-3" /> Live on your public page</>
                      : status === "rejected" ? <><EyeOff className="h-3 w-3" /> Hidden from your public page</>
                      : <><Clock className="h-3 w-3" /> Awaiting admin review</>}
                  </p>
                  {post.reel_review_notes && (
                    <p className="flex items-start gap-1 text-[11px] text-destructive">
                      {status === "rejected" ? <XCircle className="mt-0.5 h-3 w-3 shrink-0" /> : <CheckCircle2 className="mt-0.5 h-3 w-3 shrink-0" />}
                      {post.reel_review_notes}
                    </p>
                  )}
                  <Button size="sm" variant="outline" className="rounded-full gap-1 text-xs text-destructive" onClick={() => remove(post.id)}>
                    <Trash2 className="h-3 w-3" /> Delete
                  </Button>
                </div>
              </article>
            );
          })}
        </div>
      )}

      <Dialog open={creating} onOpenChange={open => !open && setCreating(false)}>
        {creating && <CreatePostDialog onClose={() => { setCreating(false); void load(); }} />}
      </Dialog>
    </div>
  );
}
