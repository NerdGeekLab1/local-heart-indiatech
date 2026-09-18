import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, Calendar, MessageCircle, Target, CheckCircle, X, Clock, FileText, Users, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

type NotificationType = "booking" | "mission" | "message" | "reward" | "invoice" | "approval" | "system";

interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  description: string;
  time: string;
  read: boolean;
  senderId?: string | null;
  destination?: string;
  createdAt: string;
}

const typeConfig: Record<NotificationType, { icon: React.ElementType; color: string }> = {
  booking: { icon: Calendar, color: "text-primary bg-primary/10" },
  mission: { icon: Target, color: "text-chart-4 bg-chart-4/10" },
  message: { icon: MessageCircle, color: "text-chart-2 bg-chart-2/10" },
  reward: { icon: CheckCircle, color: "text-chart-3 bg-chart-3/10" },
  invoice: { icon: FileText, color: "text-accent bg-accent/10" },
  approval: { icon: Shield, color: "text-primary bg-primary/10" },
  system: { icon: Users, color: "text-muted-foreground bg-muted" },
};

function timeAgo(date: string) {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

const NotificationPanel = () => {
  const { user, userRole } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filter, setFilter] = useState<"all" | NotificationType>("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const readKey = `traveler-notification-reads:${user.id}`;
    const fetchNotifications = async () => {
      setLoading(true);
      const [{ data: messages }, { data: bookings }, { data: rewards }] = await Promise.all([
        supabase.from("messages").select("*").eq("receiver_id", user.id).order("created_at", { ascending: false }).limit(20),
        supabase.from("bookings").select("id,status,created_at,start_date").eq("traveler_id", user.id).in("status", ["approved", "confirmed", "rejected", "cancelled"]).order("created_at", { ascending: false }).limit(20),
        supabase.from("reward_ledger").select("id,status,title,points,event_type,created_at,metadata").eq("user_id", user.id).in("status", ["approved", "paid", "rejected"]).order("created_at", { ascending: false }).limit(20),
      ]);
      const locallyRead = new Set<string>(JSON.parse(localStorage.getItem(readKey) || "[]"));
      const mappedMessages: Notification[] = (messages || []).map(m => ({
            id: `message:${m.id}`,
            type: "message" as NotificationType,
            title: "New Message",
            description: m.content.length > 80 ? m.content.slice(0, 80) + "…" : m.content,
            time: timeAgo(m.created_at),
            read: m.read ?? false,
            senderId: m.sender_id,
            destination: `/dashboard/traveler?tab=messages&thread=${m.sender_id}`,
            createdAt: m.created_at,
          }));
      const mappedBookings: Notification[] = (bookings || []).map(booking => ({
        id: `booking:${booking.id}:${booking.status}`, type: "booking",
        title: booking.status === "approved" || booking.status === "confirmed" ? "Booking approved" : "Booking update",
        description: booking.status === "rejected" ? "Your booking request was rejected." : booking.status === "cancelled" ? "Your booking was cancelled." : `Your trip starting ${new Date(booking.start_date).toLocaleDateString("en-IN")} is confirmed.`,
        time: timeAgo(booking.created_at), read: locallyRead.has(`booking:${booking.id}:${booking.status}`), destination: "/dashboard/traveler?tab=bookings", createdAt: booking.created_at,
      }));
      const mappedRewards: Notification[] = (rewards || []).map(reward => ({
        id: `reward:${reward.id}:${reward.status}`, type: "reward",
        title: reward.status === "rejected" ? "Reward decision" : reward.title || "Reward approved",
        description: reward.status === "rejected" ? "Your reward request was not approved." : reward.points > 0 ? `${reward.points} points were approved for your account.` : "A reward or creator payment decision was added to your account.",
        time: timeAgo(reward.created_at), read: locallyRead.has(`reward:${reward.id}:${reward.status}`), destination: "/dashboard/traveler?tab=rewards", createdAt: reward.created_at,
      }));
      setNotifications([...mappedMessages, ...mappedBookings, ...mappedRewards].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
      setLoading(false);
    };

    void fetchNotifications();

    // Subscribe to real-time messages
    const channel = supabase
      .channel("notifications-messages")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages", filter: `receiver_id=eq.${user.id}` }, (payload) => {
        const m = payload.new as any;
        setNotifications(prev => [{
          id: `message:${m.id}`,
          type: "message",
          title: "New Message",
          description: m.content.length > 80 ? m.content.slice(0, 80) + "…" : m.content,
          time: "just now",
          read: false,
          senderId: m.sender_id,
          destination: `/dashboard/traveler?tab=messages&thread=${m.sender_id}`,
          createdAt: m.created_at,
        }, ...prev]);
      })
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "bookings", filter: `traveler_id=eq.${user.id}` }, () => { void fetchNotifications(); })
      .on("postgres_changes", { event: "*", schema: "public", table: "reward_ledger", filter: `user_id=eq.${user.id}` }, () => { void fetchNotifications(); })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAllRead = async () => {
    if (!user) return;
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    localStorage.setItem(`traveler-notification-reads:${user.id}`, JSON.stringify(notifications.filter(n => n.type !== "message").map(n => n.id)));
    await supabase
      .from("messages")
      .update({ read: true })
      .eq("receiver_id", user.id)
      .eq("read", false);
  };

  const markRead = async (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    if (!user) return;
    if (id.startsWith("message:")) {
      await supabase.from("messages").update({ read: true }).eq("id", id.replace("message:", ""));
      return;
    }
    const key = `traveler-notification-reads:${user.id}`;
    const ids = new Set<string>(JSON.parse(localStorage.getItem(key) || "[]"));
    ids.add(id);
    localStorage.setItem(key, JSON.stringify([...ids]));
  };

  /** Send the user to the right dashboard messages thread for this notification. */
  const openNotification = (n: Notification) => {
    markRead(n.id);
    if (n.destination) { navigate(n.destination); return; }
    if (n.type !== "message") return;
    const base = userRole === "host" ? "/dashboard/host" : userRole === "admin" ? "/dashboard/admin" : "/dashboard/traveler";
    const thread = n.senderId ? `&thread=${n.senderId}` : "";
    navigate(`${base}?tab=messages${thread}`);
  };

  const dismiss = (id: string) => setNotifications(prev => prev.filter(n => n.id !== id));

  const filtered = filter === "all" ? notifications : notifications.filter(n => n.type === filter);
  const availableTypes = Array.from(new Set(notifications.map(n => n.type)));

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="rounded-full relative" aria-label={unreadCount ? `${unreadCount} unread notifications` : "Notifications"}>
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-destructive rounded-full text-[9px] text-destructive-foreground flex items-center justify-center font-bold">
              {unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-[380px] p-0">
        <div className="p-3 border-b border-border flex items-center justify-between">
          <h3 className="font-semibold text-sm">Notifications</h3>
          {unreadCount > 0 && (
            <button onClick={markAllRead} className="text-xs text-primary hover:underline">Mark all read</button>
          )}
        </div>

        {availableTypes.length > 1 && (
          <div className="flex gap-1 px-3 pt-2 pb-1 overflow-x-auto">
            <button
              onClick={() => setFilter("all")}
              className={cn(
                "text-[11px] px-2.5 py-1 rounded-full whitespace-nowrap capitalize transition-colors",
                filter === "all" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"
              )}
            >All</button>
            {availableTypes.map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={cn(
                  "text-[11px] px-2.5 py-1 rounded-full whitespace-nowrap capitalize transition-colors",
                  filter === f ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"
                )}
              >
                {f}
              </button>
            ))}
          </div>
        )}

        <ScrollArea className="h-[340px]">
          {loading ? (
            <div className="p-8 text-center text-muted-foreground text-sm">Loading...</div>
          ) : filtered.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground text-sm">No notifications</div>
          ) : (
            <div className="p-2 space-y-0.5">
              {filtered.map(n => {
                const cfg = typeConfig[n.type];
                const Icon = cfg.icon;
                return (
                  <div
                    key={n.id}
                    onClick={() => openNotification(n)}
                    className={cn(
                      "flex gap-3 p-2.5 rounded-lg cursor-pointer transition-colors group",
                      !n.read ? "bg-primary/5 hover:bg-primary/10" : "hover:bg-muted/50"
                    )}
                  >
                    <div className={cn("w-8 h-8 rounded-full flex items-center justify-center shrink-0", cfg.color)}>
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className={cn("text-sm leading-tight", !n.read && "font-semibold")}>{n.title}</p>
                        <button onClick={(e) => { e.stopPropagation(); dismiss(n.id); }} className="opacity-0 group-hover:opacity-100 transition-opacity">
                          <X className="w-3 h-3 text-muted-foreground" />
                        </button>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{n.description}</p>
                      <div className="flex items-center gap-1 mt-1">
                        <Clock className="w-2.5 h-2.5 text-muted-foreground" />
                        <span className="text-[10px] text-muted-foreground">{n.time}</span>
                        {!n.read && <span className="ml-auto w-1.5 h-1.5 bg-primary rounded-full" />}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
};

export default NotificationPanel;
