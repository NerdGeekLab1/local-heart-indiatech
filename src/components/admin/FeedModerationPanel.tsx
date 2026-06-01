import { useEffect, useState } from "react";
import { Shield, Flag, Trash2, CheckCircle2, Play, RotateCcw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";

const REASON_CODES = [
  "Spam / promotional",
  "Hate speech or harassment",
  "Nudity or sexual content",
  "Graphic violence",
  "Misinformation",
  "Copyright violation",
  "Off-topic / not travel",
  "Other",
];

type Filter = "active" | "pending" | "removed" | "all";

export const FeedModerationPanel = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState<any[]>([]);
  const [filter, setFilter] = useState<Filter>("active");
  const [authors, setAuthors] = useState<Record<string, any>>({});
  const [removing, setRemoving] = useState<string | null>(null);
  const [reason, setReason] = useState(REASON_CODES[0]);
  const [reasonDetail, setReasonDetail] = useState("");

  const load = async () => {
    let q = supabase.from("feed_posts").select("*").order("created_at", { ascending: false }).limit(100);
    if (filter !== "all") q = q.eq("status", filter);
    const { data } = await q;
    setPosts(data || []);
    if (data?.length) {
      const uids = Array.from(new Set(data.map((p: any) => p.user_id)));
      const { data: profs } = await supabase.from("profiles").select("id,first_name,last_name,email,avatar_url").in("id", uids);
      const map: Record<string, any> = {};
      profs?.forEach(p => { map[p.id] = p; });
      setAuthors(map);
    }
  };
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [filter]);

  const approve = async (post: any) => {
    await supabase.from("feed_posts").update({ status: "active", removed_reason: null, removed_by: null, removed_at: null }).eq("id", post.id);
    await supabase.from("admin_audit_log").insert({
      admin_id: user!.id, entity_type: "feed_post", entity_id: post.id, action: "approve",
      previous_status: post.status, new_status: "active",
      metadata: { caption: post.caption, user_id: post.user_id },
    });
    toast({ title: "Post approved" });
    load();
  };

  const remove = async (post: any) => {
    const detail = reasonDetail.trim();
    const finalReason = detail ? `${reason} — ${detail}` : reason;
    await supabase.from("feed_posts").update({ status: "removed", removed_reason: finalReason, removed_by: user!.id, removed_at: new Date().toISOString() }).eq("id", post.id);
    await supabase.from("admin_audit_log").insert({
      admin_id: user!.id, entity_type: "feed_post", entity_id: post.id, action: "remove",
      previous_status: post.status, new_status: "removed",
      notes: finalReason,
      metadata: { reason_code: reason, user_id: post.user_id, caption: post.caption },
    });
    setRemoving(null); setReasonDetail(""); setReason(REASON_CODES[0]);
    toast({ title: "Post removed", description: finalReason });
    load();
  };

  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
      <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
        <h3 className="font-bold text-foreground flex items-center gap-2"><Shield className="w-4 h-4 text-primary" /> Feed Moderation</h3>
        <Select value={filter} onValueChange={(v: any) => setFilter(v)}>
          <SelectTrigger className="w-40 h-8 text-xs"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="removed">Removed</SelectItem>
            <SelectItem value="all">All</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {posts.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-8">No posts in this view.</p>
      ) : (
        <div className="space-y-3">
          {posts.map(p => {
            const author = authors[p.user_id];
            const isRemoving = removing === p.id;
            return (
              <div key={p.id} className="rounded-xl border border-border bg-background p-3 flex gap-3 items-start">
                <div className="relative w-24 h-24 rounded-lg overflow-hidden bg-muted shrink-0">
                  {p.media_type === "video" ? (
                    <>
                      <video src={p.media_url} className="w-full h-full object-cover" muted />
                      <div className="absolute inset-0 flex items-center justify-center bg-foreground/30"><Play className="w-6 h-6 fill-background text-background" /></div>
                    </>
                  ) : (
                    <img src={p.media_url} alt="" className="w-full h-full object-cover" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-bold text-foreground">{author ? `${author.first_name} ${author.last_name || ""}` : "Unknown"}</p>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      p.status === "active" ? "bg-accent/15 text-accent" :
                      p.status === "removed" ? "bg-destructive/15 text-destructive" : "bg-primary/15 text-primary"
                    }`}>{p.status}</span>
                    {p.tag_value && <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full">{p.tag_type}: {p.tag_value}</span>}
                  </div>
                  <p className="text-xs text-muted-foreground">{new Date(p.created_at).toLocaleString()} · ❤ {p.likes_count}</p>
                  {p.caption && <p className="text-sm text-foreground line-clamp-2 mt-1">{p.caption}</p>}
                  {p.removed_reason && <p className="text-xs text-destructive mt-1 flex items-center gap-1"><Flag className="w-3 h-3" /> {p.removed_reason}</p>}

                  {isRemoving ? (
                    <div className="mt-2 space-y-2">
                      <Select value={reason} onValueChange={setReason}>
                        <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                        <SelectContent>{REASON_CODES.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent>
                      </Select>
                      <Textarea className="text-xs" rows={2} placeholder="Optional details…" value={reasonDetail} onChange={e => setReasonDetail(e.target.value)} />
                      <div className="flex gap-2">
                        <Button size="sm" variant="destructive" className="rounded-full text-xs" onClick={() => remove(p)}><Trash2 className="w-3 h-3 mr-1" /> Confirm Remove</Button>
                        <Button size="sm" variant="outline" className="rounded-full text-xs" onClick={() => setRemoving(null)}>Cancel</Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex gap-2 mt-2 flex-wrap">
                      {p.status !== "active" && (
                        <Button size="sm" variant="outline" className="rounded-full text-xs gap-1" onClick={() => approve(p)}>
                          {p.status === "removed" ? <RotateCcw className="w-3 h-3" /> : <CheckCircle2 className="w-3 h-3" />}
                          {p.status === "removed" ? "Restore" : "Approve"}
                        </Button>
                      )}
                      {p.status !== "removed" && (
                        <Button size="sm" variant="outline" className="rounded-full text-xs gap-1 text-destructive border-destructive/30 hover:bg-destructive/10" onClick={() => setRemoving(p.id)}>
                          <Trash2 className="w-3 h-3" /> Remove…
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default FeedModerationPanel;
