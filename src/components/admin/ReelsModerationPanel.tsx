import { useEffect, useState } from "react";
import { Clock, Film, Play, CheckCircle2, XCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import AdminPagination from "@/components/admin/AdminPagination";

const PAGE_SIZE = 8;
type Filter = "pending" | "approved" | "rejected" | "all";

const badge = (status: string) =>
  status === "approved" ? "bg-accent/15 text-accent" :
  status === "rejected" ? "bg-destructive/15 text-destructive" : "bg-primary/15 text-primary";

/** Admin approve/reject workflow for host reels & stories. */
export default function ReelsModerationPanel() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<any[]>([]);
  const [authors, setAuthors] = useState<Record<string, any>>({});
  const [filter, setFilter] = useState<Filter>("pending");
  const [page, setPage] = useState(0);
  const [notes, setNotes] = useState<Record<string, string>>({});

  const load = async () => {
    let query = supabase.from("feed_posts").select("*").order("created_at", { ascending: false }).limit(150);
    if (filter !== "all") query = query.eq("reel_status", filter);
    const { data } = await query;
    setPosts(data || []);
    if (data?.length) {
      const ids = Array.from(new Set(data.map((post: any) => post.user_id)));
      const { data: profs } = await supabase.from("profiles").select("id,first_name,last_name,username,avatar_url").in("id", ids);
      const map: Record<string, any> = {};
      profs?.forEach(profile => { map[profile.id] = profile; });
      setAuthors(map);
    }
  };

  useEffect(() => { void load(); setPage(0); /* eslint-disable-next-line */ }, [filter]);

  useEffect(() => {
    const channel = supabase.channel("admin-reels-moderation")
      .on("postgres_changes", { event: "*", schema: "public", table: "feed_posts" }, () => void load())
      .subscribe();
    return () => { void supabase.removeChannel(channel); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  const decide = async (post: any, next: "approved" | "rejected") => {
    const note = (notes[post.id] || "").trim();
    const { error } = await supabase.from("feed_posts").update({
      reel_status: next,
      reel_reviewed_by: user?.id ?? null,
      reel_reviewed_at: new Date().toISOString(),
      reel_review_notes: note || null,
    }).eq("id", post.id);
    if (error) { toast({ title: "Couldn't update reel", description: error.message, variant: "destructive" }); return; }
    await supabase.from("admin_audit_log").insert({
      admin_id: user!.id, entity_type: "feed_post_reel", entity_id: post.id,
      action: next === "approved" ? "approve_reel" : "reject_reel",
      previous_status: post.reel_status, new_status: next, notes: note || null,
      metadata: { user_id: post.user_id, caption: post.caption },
    });
    toast({ title: next === "approved" ? "Reel approved" : "Reel rejected" });
    setNotes(current => ({ ...current, [post.id]: "" }));
    void load();
  };

  const pageCount = Math.max(1, Math.ceil(posts.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount - 1);
  const paged = posts.slice(safePage * PAGE_SIZE, (safePage + 1) * PAGE_SIZE);

  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <h3 className="flex items-center gap-2 font-bold text-foreground"><Film className="h-4 w-4 text-primary" /> Reels &amp; Stories Moderation</h3>
        <div className="flex flex-wrap gap-2">
          {(["pending", "approved", "rejected", "all"] as Filter[]).map(key => (
            <button key={key} onClick={() => setFilter(key)}
              className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${filter === key ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground hover:bg-secondary/80"}`}>
              {key}
            </button>
          ))}
        </div>
      </div>

      {posts.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted-foreground">No reels in this view.</p>
      ) : (
        <div className="space-y-3">
          {paged.map(post => {
            const author = authors[post.user_id];
            const status = post.reel_status || "pending";
            return (
              <div key={post.id} className="flex flex-col gap-3 rounded-xl border border-border bg-background p-3 sm:flex-row">
                <div className="relative h-28 w-24 shrink-0 overflow-hidden rounded-lg bg-muted">
                  {post.media_type === "video" ? (
                    <>
                      <video src={post.media_url} className="h-full w-full object-cover" muted preload="metadata" />
                      <div className="absolute inset-0 flex items-center justify-center bg-foreground/25"><Play className="h-6 w-6 fill-background text-background" /></div>
                    </>
                  ) : (
                    <img src={post.media_url} alt="" className="h-full w-full object-cover" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-bold text-foreground">{author ? `${author.first_name} ${author.last_name || ""}`.trim() : "Unknown"}</p>
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold capitalize ${badge(status)}`}>{status}</span>
                    <span className="text-[11px] text-muted-foreground">{new Date(post.created_at).toLocaleString()}</span>
                  </div>
                  {post.caption && <p className="mt-1 line-clamp-2 text-sm text-foreground">{post.caption}</p>}
                  {post.reel_review_notes && <p className="mt-1 text-xs text-muted-foreground">Note: {post.reel_review_notes}</p>}
                  <Textarea rows={2} className="mt-2 text-xs" placeholder="Reviewer note (shown to the host)…"
                    value={notes[post.id] ?? ""} onChange={event => setNotes(current => ({ ...current, [post.id]: event.target.value }))} />
                  <div className="mt-2 flex flex-wrap gap-2">
                    {status !== "approved" && (
                      <Button size="sm" className="rounded-full gap-1 text-xs" onClick={() => decide(post, "approved")}>
                        <CheckCircle2 className="h-3 w-3" /> Approve
                      </Button>
                    )}
                    {status !== "rejected" && (
                      <Button size="sm" variant="outline" className="rounded-full gap-1 border-destructive/30 text-xs text-destructive hover:bg-destructive/10" onClick={() => decide(post, "rejected")}>
                        <XCircle className="h-3 w-3" /> Reject
                      </Button>
                    )}
                    {status === "pending" && <span className="flex items-center gap-1 text-[11px] text-muted-foreground"><Clock className="h-3 w-3" /> Hidden from the public host page until approved</span>}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
      <AdminPagination page={safePage} total={posts.length} pageSize={PAGE_SIZE} onPage={setPage} />
    </div>
  );
}
