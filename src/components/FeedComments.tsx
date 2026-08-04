import { useEffect, useState } from "react";
import { MessageCircle, Send, Trash2, Loader2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";

interface CommentRow {
  id: string;
  user_id: string;
  content: string;
  created_at: string;
  author?: { first_name: string | null; last_name: string | null; avatar_url: string | null };
}

const MAX = 1000;

/** Comment thread for a feed post — button + dialog with live list, add and delete. */
const FeedComments = ({ postId }: { postId: string }) => {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [count, setCount] = useState<number | null>(null);
  const [rows, setRows] = useState<CommentRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);

  const loadCount = async () => {
    const { count: c } = await supabase
      .from("feed_comments")
      .select("*", { count: "exact", head: true })
      .eq("post_id", postId);
    setCount(c ?? 0);
  };

  useEffect(() => { loadCount(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [postId]);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("feed_comments")
      .select("id, user_id, content, created_at")
      .eq("post_id", postId)
      .order("created_at", { ascending: true });
    if (error) {
      toast({ title: "Couldn't load comments", description: error.message, variant: "destructive" });
      setLoading(false);
      return;
    }
    const ids = Array.from(new Set((data || []).map(r => r.user_id)));
    let map = new Map<string, any>();
    if (ids.length) {
      const { data: profiles } = await supabase.rpc("get_public_profiles", { _ids: ids });
      map = new Map((profiles || []).map((p: any) => [p.id, p]));
    }
    setRows((data || []).map(r => ({ ...r, author: map.get(r.user_id) })));
    setCount((data || []).length);
    setLoading(false);
  };

  useEffect(() => { if (open) load(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [open, postId]);

  const submit = async () => {
    const content = text.trim();
    if (!user) { toast({ title: "Sign in to comment", variant: "destructive" }); return; }
    if (!content) { toast({ title: "Write something first", variant: "destructive" }); return; }
    if (content.length > MAX) { toast({ title: `Keep it under ${MAX} characters`, variant: "destructive" }); return; }
    setSending(true);
    const { error } = await supabase.from("feed_comments").insert({ post_id: postId, user_id: user.id, content });
    setSending(false);
    if (error) { toast({ title: "Comment failed", description: error.message, variant: "destructive" }); return; }
    setText("");
    load();
  };

  const remove = async (id: string) => {
    const { error } = await supabase.from("feed_comments").delete().eq("id", id);
    if (error) { toast({ title: "Delete failed", description: error.message, variant: "destructive" }); return; }
    setRows(p => p.filter(r => r.id !== id));
    setCount(c => Math.max(0, (c ?? 1) - 1));
  };

  const nameOf = (r: CommentRow) =>
    `${r.author?.first_name || ""} ${r.author?.last_name || ""}`.trim() || "Traveler";

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        aria-label="View comments"
        className="px-2.5 py-1.5 rounded-full hover:bg-secondary transition flex items-center gap-1.5"
      >
        <MessageCircle className="w-4 h-4 text-foreground" />
        <span className="text-xs font-bold tabular-nums">{count ?? 0}</span>
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Comments {count !== null && `(${count})`}</DialogTitle>
          </DialogHeader>

          <div className="max-h-[45vh] overflow-y-auto space-y-3 pr-1">
            {loading ? (
              <div className="flex items-center justify-center py-8 text-muted-foreground">
                <Loader2 className="w-4 h-4 animate-spin mr-2" /> Loading comments…
              </div>
            ) : rows.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">No comments yet — be the first to say something kind.</p>
            ) : rows.map(r => (
              <div key={r.id} className="flex gap-3 group">
                <Link to={`/traveler/${r.user_id}`}>
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={r.author?.avatar_url || undefined} />
                    <AvatarFallback className="text-xs">{nameOf(r).charAt(0)}</AvatarFallback>
                  </Avatar>
                </Link>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-foreground break-words">
                    <Link to={`/traveler/${r.user_id}`} className="font-bold hover:text-primary">{nameOf(r)}</Link>{" "}
                    {r.content}
                  </p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    {formatDistanceToNow(new Date(r.created_at), { addSuffix: true })}
                  </p>
                </div>
                {user?.id === r.user_id && (
                  <button onClick={() => remove(r.id)} aria-label="Delete comment" className="opacity-0 group-hover:opacity-100 transition p-1">
                    <Trash2 className="w-3.5 h-3.5 text-destructive" />
                  </button>
                )}
              </div>
            ))}
          </div>

          {user ? (
            <form
              onSubmit={e => { e.preventDefault(); submit(); }}
              className="flex gap-2 items-center border-t border-border pt-3"
            >
              <Input
                value={text}
                onChange={e => setText(e.target.value.slice(0, MAX))}
                placeholder="Add a comment…"
                aria-label="Add a comment"
              />
              <Button type="submit" size="icon" disabled={sending || !text.trim()} aria-label="Post comment">
                {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </Button>
            </form>
          ) : (
            <p className="text-sm text-muted-foreground border-t border-border pt-3">
              <Link to="/login/traveler" className="text-primary font-semibold hover:underline">Sign in</Link> to join the conversation.
            </p>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default FeedComments;
