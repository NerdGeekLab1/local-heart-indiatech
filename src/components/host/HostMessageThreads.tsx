import { useEffect, useMemo, useRef, useState } from "react";
import { Loader2, MessageCircle, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export type PresenceStatus = "online" | "away" | "sleep" | "dnd" | "invisible";

export const presenceMeta: Record<PresenceStatus, { label: string; dot: string }> = {
  online: { label: "Online", dot: "bg-accent" },
  away: { label: "Away", dot: "bg-primary" },
  sleep: { label: "Sleeping", dot: "bg-muted-foreground" },
  dnd: { label: "Do not disturb", dot: "bg-destructive" },
  invisible: { label: "Invisible", dot: "bg-border" },
};

interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  read: boolean | null;
  created_at: string;
}

const PRESENCE_CHANNEL = "roamyoo-presence";

/**
 * Threaded inbox: messages are grouped per counterpart, the host replies inline,
 * and live presence (online / away / sleep / DND) is shared over a realtime channel.
 */
export default function HostMessageThreads({ userId, initialThread }: { userId: string; initialThread?: string | null }) {
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState<string | null>(initialThread ?? null);
  const [reply, setReply] = useState("");
  const [sending, setSending] = useState(false);
  const [names, setNames] = useState<Record<string, string>>({});
  const [myStatus, setMyStatus] = useState<PresenceStatus>("online");
  const [peers, setPeers] = useState<Record<string, PresenceStatus>>({});
  const endRef = useRef<HTMLDivElement>(null);

  const load = async () => {
    const { data } = await supabase
      .from("messages")
      .select("*")
      .or(`receiver_id.eq.${userId},sender_id.eq.${userId}`)
      .order("created_at", { ascending: true });
    setMessages((data as Message[]) || []);
    setLoading(false);
  };

  useEffect(() => {
    void load();
    const channel = supabase.channel(`host-threads-${userId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "messages" }, () => void load())
      .subscribe();
    return () => { void supabase.removeChannel(channel); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  // Persisted status preference + live presence sharing.
  useEffect(() => {
    let cancelled = false;
    supabase.from("profiles").select("presence_status").eq("id", userId).maybeSingle().then(({ data }) => {
      if (!cancelled && data?.presence_status) setMyStatus(data.presence_status as PresenceStatus);
    });
    return () => { cancelled = true; };
  }, [userId]);

  useEffect(() => {
    const channel = supabase.channel(PRESENCE_CHANNEL, { config: { presence: { key: userId } } });
    channel
      .on("presence", { event: "sync" }, () => {
        const state = channel.presenceState() as Record<string, { status?: PresenceStatus }[]>;
        const next: Record<string, PresenceStatus> = {};
        Object.entries(state).forEach(([key, entries]) => {
          const status = entries?.[0]?.status;
          if (status && status !== "invisible") next[key] = status;
        });
        setPeers(next);
      })
      .subscribe(status => {
        if (status === "SUBSCRIBED") void channel.track({ status: myStatus });
      });
    return () => { void supabase.removeChannel(channel); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, myStatus]);

  const threads = useMemo(() => {
    const map = new Map<string, Message[]>();
    messages.forEach(message => {
      const peer = message.sender_id === userId ? message.receiver_id : message.sender_id;
      map.set(peer, [...(map.get(peer) || []), message]);
    });
    return [...map.entries()]
      .map(([peer, items]) => ({
        peer,
        items,
        last: items[items.length - 1],
        unread: items.filter(item => item.receiver_id === userId && !item.read).length,
      }))
      .sort((a, b) => new Date(b.last.created_at).getTime() - new Date(a.last.created_at).getTime());
  }, [messages, userId]);

  useEffect(() => {
    if (!active && threads.length) setActive(threads[0].peer);
  }, [threads, active]);

  // Resolve counterpart display names in one batched call.
  useEffect(() => {
    const missing = threads.map(thread => thread.peer).filter(peer => !names[peer]);
    if (!missing.length) return;
    supabase.rpc("get_public_profiles", { _ids: missing }).then(({ data }) => {
      const next: Record<string, string> = {};
      (data as any[] | null)?.forEach(row => {
        next[row.id] = `${row.first_name || ""} ${row.last_name || ""}`.trim() || "Traveler";
      });
      setNames(current => ({ ...current, ...next }));
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [threads]);

  const activeThread = threads.find(thread => thread.peer === active);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeThread?.items.length, active]);

  // Mark the opened thread as read.
  useEffect(() => {
    if (!activeThread?.unread) return;
    void supabase.from("messages").update({ read: true })
      .eq("receiver_id", userId).eq("sender_id", activeThread.peer).eq("read", false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, activeThread?.unread]);

  const changeStatus = async (status: PresenceStatus) => {
    setMyStatus(status);
    const { error } = await supabase.from("profiles").upsert({ id: userId, presence_status: status }, { onConflict: "id" });
    if (error) toast({ title: "Couldn't save status", description: error.message, variant: "destructive" });
  };

  const send = async () => {
    if (!reply.trim() || !active || sending) return;
    setSending(true);
    const { error } = await supabase.from("messages").insert({ sender_id: userId, receiver_id: active, content: reply.trim() });
    setSending(false);
    if (error) { toast({ title: "Couldn't send", description: error.message, variant: "destructive" }); return; }
    setReply("");
    void load();
  };

  const peerStatus = (peer: string): PresenceStatus => peers[peer] ?? "offline" as PresenceStatus;

  return (
    <div className="mt-6" data-testid="host-message-threads">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-bold text-foreground">Messages ({threads.length} threads)</h2>
        <label className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className={`h-2.5 w-2.5 rounded-full ${presenceMeta[myStatus]?.dot || "bg-border"}`} />
          My status
          <select
            aria-label="My chat status"
            data-testid="host-presence-select"
            className="h-8 rounded-md border border-input bg-background px-2 text-xs text-foreground"
            value={myStatus}
            onChange={e => changeStatus(e.target.value as PresenceStatus)}
          >
            {(Object.keys(presenceMeta) as PresenceStatus[]).map(status => (
              <option key={status} value={status}>{presenceMeta[status].label}</option>
            ))}
          </select>
        </label>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-5 w-5 animate-spin text-primary" /></div>
      ) : threads.length === 0 ? (
        <div className="py-12 text-center">
          <MessageCircle className="mx-auto mb-3 h-12 w-12 text-muted-foreground/30" />
          <p className="text-muted-foreground">No messages yet. Traveler inquiries will appear here as threads.</p>
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-[260px_1fr]">
          <ul className="space-y-2">
            {threads.map(thread => {
              const status = peerStatus(thread.peer);
              return (
                <li key={thread.peer}>
                  <button
                    onClick={() => setActive(thread.peer)}
                    className={`w-full rounded-xl border p-3 text-left transition ${active === thread.peer ? "border-primary bg-primary/5" : "border-border bg-card hover:border-primary/40"}`}
                  >
                    <span className="flex items-center gap-2">
                      <span className={`h-2 w-2 shrink-0 rounded-full ${presenceMeta[status]?.dot || "bg-border"}`} />
                      <span className="truncate text-sm font-semibold text-foreground">{names[thread.peer] || "Traveler"}</span>
                      {thread.unread > 0 && (
                        <span className="ml-auto rounded-full bg-primary px-1.5 text-[10px] font-bold text-primary-foreground">{thread.unread}</span>
                      )}
                    </span>
                    <span className="mt-1 block truncate text-xs text-muted-foreground">{thread.last.content}</span>
                  </button>
                </li>
              );
            })}
          </ul>

          <div className="flex min-h-[24rem] flex-col rounded-2xl border border-border bg-card">
            {activeThread ? (
              <>
                <div className="flex items-center gap-2 border-b border-border p-3">
                  <span className={`h-2.5 w-2.5 rounded-full ${presenceMeta[peerStatus(activeThread.peer)]?.dot || "bg-border"}`} />
                  <p className="font-semibold text-foreground">{names[activeThread.peer] || "Traveler"}</p>
                  <span className="text-xs text-muted-foreground">
                    {presenceMeta[peerStatus(activeThread.peer)]?.label || "Offline"}
                  </span>
                </div>
                <div className="flex-1 space-y-2 overflow-y-auto p-3">
                  {activeThread.items.map(message => {
                    const mine = message.sender_id === userId;
                    return (
                      <div key={message.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                        <div className={`max-w-[75%] rounded-2xl px-3 py-2 text-sm ${mine ? "rounded-br-md bg-primary text-primary-foreground" : "rounded-bl-md bg-secondary text-foreground"}`}>
                          <p>{message.content}</p>
                          <p className={`mt-1 text-[9px] ${mine ? "text-primary-foreground/60" : "text-muted-foreground"}`}>
                            {new Date(message.created_at).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={endRef} />
                </div>
                <div className="flex gap-2 border-t border-border p-3">
                  <Input
                    value={reply}
                    onChange={e => setReply(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && send()}
                    placeholder={myStatus === "dnd" ? "You're on do-not-disturb — replies still send" : "Write a reply…"}
                    className="h-9 flex-1 rounded-full text-sm"
                    aria-label="Reply"
                  />
                  <Button size="icon" className="h-9 w-9 shrink-0 rounded-full" onClick={send} disabled={!reply.trim() || sending} aria-label="Send reply">
                    {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  </Button>
                </div>
              </>
            ) : (
              <p className="m-auto text-sm text-muted-foreground">Pick a thread to read and reply.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
