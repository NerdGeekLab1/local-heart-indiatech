import { useState } from "react";
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

type NotificationType = "booking" | "mission" | "message" | "reward" | "invoice" | "approval" | "system";

interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  description: string;
  time: string;
  read: boolean;
  roles: string[]; // which roles see this
}

const allNotifications: Notification[] = [
  // Traveler notifications
  { id: "1", type: "booking", title: "Booking Confirmed", description: "Your Jaipur Heritage Walk booking is confirmed for May 15.", time: "2 min ago", read: false, roles: ["traveler"] },
  { id: "2", type: "message", title: "New message from Ravi", description: "Hey! Looking forward to hosting you next week.", time: "15 min ago", read: false, roles: ["traveler"] },
  { id: "3", type: "reward", title: "Streak Milestone! 🔥", description: "You're on a 5-month travel streak! 6 more for a free trip.", time: "3 hrs ago", read: true, roles: ["traveler"] },
  { id: "4", type: "invoice", title: "Invoice Generated", description: "Invoice #INV-2026-042 for your Kerala trip is ready.", time: "5 hrs ago", read: false, roles: ["traveler"] },
  { id: "5", type: "booking", title: "Booking Reminder", description: "Your Kerala Backwaters trip starts in 3 days.", time: "1 day ago", read: true, roles: ["traveler"] },

  // Host notifications
  { id: "10", type: "booking", title: "New Booking Request", description: "Sarah M. requested a 3-day stay starting May 20.", time: "5 min ago", read: false, roles: ["host"] },
  { id: "11", type: "message", title: "Traveler Inquiry", description: "Thomas K. asked about your cooking class availability.", time: "30 min ago", read: false, roles: ["host"] },
  { id: "12", type: "invoice", title: "Invoice Payment Received", description: "Payment of ₹12,500 for booking #BK-045 received.", time: "2 hrs ago", read: false, roles: ["host"] },
  { id: "13", type: "approval", title: "Experience Approved ✓", description: "Your 'Ladakh Bike Expedition' experience is now live.", time: "6 hrs ago", read: true, roles: ["host"] },
  { id: "14", type: "message", title: "Review Posted", description: "Yuki T. left a 5-star review on your heritage tour.", time: "1 day ago", read: true, roles: ["host"] },

  // Admin notifications
  { id: "20", type: "approval", title: "New Trip Pending", description: "Manali-Leh Highway trip awaiting approval.", time: "10 min ago", read: false, roles: ["admin"] },
  { id: "21", type: "system", title: "Grievance Filed", description: "High-priority grievance against Host #12 regarding refund.", time: "1 hr ago", read: false, roles: ["admin"] },
  { id: "22", type: "approval", title: "Wanderer Application", description: "New Beta Wanderer application from Priya S., Mumbai.", time: "2 hrs ago", read: false, roles: ["admin"] },
  { id: "23", type: "invoice", title: "Invoice Overdue", description: "Invoice #INV-2026-038 is 7 days overdue.", time: "4 hrs ago", read: false, roles: ["admin"] },
  { id: "24", type: "system", title: "Platform Update", description: "Monthly revenue report is ready for review.", time: "1 day ago", read: true, roles: ["admin"] },
];

const typeConfig: Record<NotificationType, { icon: React.ElementType; color: string }> = {
  booking: { icon: Calendar, color: "text-primary bg-primary/10" },
  mission: { icon: Target, color: "text-chart-4 bg-chart-4/10" },
  message: { icon: MessageCircle, color: "text-chart-2 bg-chart-2/10" },
  reward: { icon: CheckCircle, color: "text-chart-3 bg-chart-3/10" },
  invoice: { icon: FileText, color: "text-accent bg-accent/10" },
  approval: { icon: Shield, color: "text-primary bg-primary/10" },
  system: { icon: Users, color: "text-muted-foreground bg-muted" },
};

const NotificationPanel = () => {
  const { userRole } = useAuth();
  const role = userRole || "traveler";

  const roleNotifications = allNotifications.filter(n => n.roles.includes(role));
  const [notifications, setNotifications] = useState(roleNotifications);
  const [filter, setFilter] = useState<"all" | NotificationType>("all");

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAllRead = () => setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  const markRead = (id: string) => setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  const dismiss = (id: string) => setNotifications(prev => prev.filter(n => n.id !== id));

  const filtered = filter === "all" ? notifications : notifications.filter(n => n.type === filter);

  // Get unique types for this role
  const availableTypes = Array.from(new Set(roleNotifications.map(n => n.type)));

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="rounded-full relative">
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
          <h3 className="font-semibold text-sm">
            Notifications
            <span className="ml-1.5 text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-full capitalize">{role}</span>
          </h3>
          {unreadCount > 0 && (
            <button onClick={markAllRead} className="text-xs text-primary hover:underline">Mark all read</button>
          )}
        </div>

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

        <ScrollArea className="h-[340px]">
          {filtered.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground text-sm">No notifications</div>
          ) : (
            <div className="p-2 space-y-0.5">
              {filtered.map(n => {
                const cfg = typeConfig[n.type];
                const Icon = cfg.icon;
                return (
                  <div
                    key={n.id}
                    onClick={() => markRead(n.id)}
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
