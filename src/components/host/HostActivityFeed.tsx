import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Bell, BellOff, Calendar, MessageCircle, Receipt, Settings2, TrendingUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Switch } from "@/components/ui/switch";

export interface HostActivityEvent {
  id: string;
  kind: "booking" | "message" | "invoice" | "earnings";
  title: string;
  detail: string;
  at: string;
  /** In-app deep link to the related chat thread or booking/invoice detail. */
  href?: string;
  read?: boolean;
}

/** Which streams raise toasts and land in the feed. */
export interface HostNotificationPrefs {
  messages: boolean;
  bookings: boolean;
  earnings: boolean;
  /** When on, notifications between quietFrom and quietTo are suppressed entirely. */
  quietHours: boolean;
  /** 24h "HH:MM" local times. quietFrom may be later than quietTo (overnight window). */
  quietFrom: string;
  quietTo: string;
}

const icons: Record<HostActivityEvent["kind"], React.ElementType> = {
  booking: Calendar,
  message: MessageCircle,
  invoice: Receipt,
  earnings: TrendingUp,
};

const prefRows: { key: "messages" | "bookings" | "earnings"; label: string; hint: string }[] = [
  { key: "messages", label: "New messages", hint: "Traveler chat messages" },
  { key: "bookings", label: "Booking & invoice updates", hint: "Requests, status changes, invoices" },
  { key: "earnings", label: "Earnings movement", hint: "When your total earnings change" },
];

const defaultPrefs: HostNotificationPrefs = { messages: true, bookings: true, earnings: true, quietHours: false, quietFrom: "22:00", quietTo: "07:00" };

const toMinutes = (value: string) => {
  const [hour, minute] = String(value || "").split(":").map(Number);
  return (Number.isFinite(hour) ? hour : 0) * 60 + (Number.isFinite(minute) ? minute : 0);
};

/** Overnight-safe check: 22:00 → 07:00 correctly covers 23:30 and 02:00. */
export const isQuietNow = (prefs: HostNotificationPrefs, now = new Date()) => {
  if (!prefs.quietHours) return false;
  const current = now.getHours() * 60 + now.getMinutes();
  const from = toMinutes(prefs.quietFrom);
  const to = toMinutes(prefs.quietTo);
  return from <= to ? current >= from && current < to : current >= from || current < to;
};

const inr = (value: number) => `₹${Number(value || 0).toLocaleString("en-IN")}`;
const storageKey = (userId: string) => `host-activity-${userId}`;
const prefsKey = (userId: string) => `host-activity-prefs-${userId}`;

/**
 * Live in-app activity feed for host metric changes.
 * Each realtime change also raises a toast (when the stream is unmuted) so the host notices without watching the tab.
 */
export default function HostActivityFeed({ userId, earnings }: { userId: string; earnings: number }) {
  const [events, setEvents] = useState<HostActivityEvent[]>(() => {
    try {
      return JSON.parse(localStorage.getItem(storageKey(userId)) || "[]") as HostActivityEvent[];
    } catch {
      return [];
    }
  });
  const [prefs, setPrefs] = useState<HostNotificationPrefs>(() => {
    try {
      return { ...defaultPrefs, ...JSON.parse(localStorage.getItem(prefsKey(userId)) || "{}") };
    } catch {
      return defaultPrefs;
    }
  });
  const [showPrefs, setShowPrefs] = useState(false);
  const prefsRef = useRef(prefs);
  prefsRef.current = prefs;
  const lastEarnings = useRef<number | null>(null);

  const savePrefs = (next: HostNotificationPrefs) => {
    setPrefs(next);
    try { localStorage.setItem(prefsKey(userId), JSON.stringify(next)); } catch { /* quota */ }
  };

  const persist = (next: HostActivityEvent[]) => {
    try { localStorage.setItem(storageKey(userId), JSON.stringify(next)); } catch { /* quota */ }
    return next;
  };

  const push = (event: Omit<HostActivityEvent, "id" | "at">, stream: "messages" | "bookings" | "earnings") => {
    if (!prefsRef.current[stream]) return;
    if (isQuietNow(prefsRef.current)) return;
    const entry: HostActivityEvent = { ...event, id: crypto.randomUUID(), at: new Date().toISOString(), read: false };
    setEvents(current => persist([entry, ...current].slice(0, 25)));
    toast({
      title: entry.title,
      description: entry.href ? `${entry.detail} · open in dashboard` : entry.detail,
    });
  };

  useEffect(() => {
    const channel = supabase.channel(`host-activity-${userId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "bookings", filter: `host_id=eq.${userId}` }, payload => {
        const row = (payload.new ?? payload.eventType) as any;
        push({
          kind: "booking",
          title: payload.eventType === "INSERT" ? "New booking request" : "Booking updated",
          detail: `${row?.status ?? "updated"} · ${inr(row?.total_price)} · ${row?.start_date ?? ""}`,
          href: row?.id ? `/dashboard/host?tab=bookings&booking=${row.id}` : "/dashboard/host?tab=bookings",
        }, "bookings");
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "invoices", filter: `host_id=eq.${userId}` }, payload => {
        const row = payload.new as any;
        push({
          kind: "invoice",
          title: "Invoice update",
          detail: `${row?.invoice_number ?? "Invoice"} · ${row?.status ?? ""} · ${inr(row?.total_amount)}`,
          href: row?.id ? `/dashboard/host?tab=invoices&invoice=${row.id}` : "/dashboard/host?tab=invoices",
        }, "bookings");
      })
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages", filter: `receiver_id=eq.${userId}` }, payload => {
        const row = payload.new as any;
        push({
          kind: "message",
          title: "New traveler message",
          detail: String(row?.content ?? "").slice(0, 90) || "Open Messages to reply",
          href: row?.sender_id ? `/dashboard/host?tab=messages&thread=${row.sender_id}` : "/dashboard/host?tab=messages",
        }, "messages");
      })
      .subscribe();
    return () => { void supabase.removeChannel(channel); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  useEffect(() => {
    if (lastEarnings.current === null) { lastEarnings.current = earnings; return; }
    if (earnings === lastEarnings.current) return;
    const delta = earnings - lastEarnings.current;
    lastEarnings.current = earnings;
    push({
      kind: "earnings",
      title: delta > 0 ? "Earnings went up" : "Earnings adjusted",
      detail: `${delta > 0 ? "+" : ""}${inr(delta)} · now ${inr(earnings)}`,
      href: "/dashboard/host?tab=earnings",
    }, "earnings");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [earnings]);

  const unread = useMemo(() => events.filter(event => !event.read).length, [events]);
  const mutedCount = prefRows.filter(row => !prefs[row.key]).length;
  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return events.filter(event => {
      const matchesFilter =
        filter === "all" ||
        (filter === "bookings" && (event.kind === "booking" || event.kind === "invoice")) ||
        (filter === "messages" && event.kind === "message") ||
        (filter === "earnings" && event.kind === "earnings");
      if (!matchesFilter) return false;
      if (!needle) return true;
      return `${event.title} ${event.detail}`.toLowerCase().includes(needle);
    });
  }, [events, filter, query]);

  const markRead = (id: string) => setEvents(current => persist(current.map(event => event.id === id ? { ...event, read: true } : event)));
  const markAllRead = () => setEvents(current => persist(current.map(event => ({ ...event, read: true }))));

  return (
    <section className="rounded-2xl border border-border bg-card p-5 shadow-card" data-testid="host-activity-feed">
      <div className="flex items-center justify-between gap-2">
        <h3 className="flex items-center gap-2 font-bold text-foreground">
          {mutedCount === prefRows.length ? <BellOff className="h-4 w-4 text-muted-foreground" /> : <Bell className="h-4 w-4 text-primary" />}
          Live activity
          {unread > 0 && (
            <span className="rounded-full bg-primary px-2 py-0.5 text-[10px] font-bold text-primary-foreground" data-testid="host-activity-unread">
              {unread}
            </span>
          )}
        </h3>
        <div className="flex items-center gap-2">
          {unread > 0 && (
            <button className="text-xs text-muted-foreground hover:text-foreground" onClick={markAllRead}>Mark all read</button>
          )}
          <button
            className="rounded-full p-1 text-muted-foreground hover:bg-secondary hover:text-foreground"
            onClick={() => setShowPrefs(value => !value)}
            aria-label="Notification preferences"
            data-testid="host-activity-prefs-toggle"
          >
            <Settings2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {showPrefs && (
        <div className="mt-3 space-y-2 rounded-xl border border-border/60 bg-background p-3" data-testid="host-activity-prefs">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Notify me about</p>
          {prefRows.map(row => (
            <label key={row.key} className="flex items-center justify-between gap-3">
              <span className="min-w-0">
                <span className="block text-sm text-foreground">{row.label}</span>
                <span className="block text-[11px] text-muted-foreground">{row.hint}</span>
              </span>
              <Switch
                checked={prefs[row.key]}
                onCheckedChange={value => savePrefs({ ...prefs, [row.key]: value })}
                aria-label={row.label}
              />
            </label>
          ))}
          <p className="text-[11px] text-muted-foreground">Muted streams raise no toasts and no feed items.</p>

          <div className="mt-3 border-t border-border/60 pt-3" data-testid="host-quiet-hours">
            <label className="flex items-center justify-between gap-3">
              <span className="min-w-0">
                <span className="block text-sm text-foreground">Quiet hours</span>
                <span className="block text-[11px] text-muted-foreground">Suppress every toast and feed item during this window</span>
              </span>
              <Switch
                checked={prefs.quietHours}
                onCheckedChange={value => savePrefs({ ...prefs, quietHours: value })}
                aria-label="Quiet hours"
              />
            </label>
            {prefs.quietHours && (
              <div className="mt-2 flex items-center gap-2">
                <label className="flex-1 text-[11px] text-muted-foreground">
                  From
                  <input type="time" value={prefs.quietFrom} aria-label="Quiet hours start"
                    onChange={e => savePrefs({ ...prefs, quietFrom: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-border bg-background px-2 py-1 text-sm text-foreground" />
                </label>
                <label className="flex-1 text-[11px] text-muted-foreground">
                  To
                  <input type="time" value={prefs.quietTo} aria-label="Quiet hours end"
                    onChange={e => savePrefs({ ...prefs, quietTo: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-border bg-background px-2 py-1 text-sm text-foreground" />
                </label>
              </div>
            )}
            {isQuietNow(prefs) && <p className="mt-2 text-[11px] font-medium text-primary">Quiet hours active — notifications are paused.</p>}
          </div>

        </div>
      )}

      {events.length === 0 ? (
        <p className="mt-3 text-sm text-muted-foreground">Nothing yet. New bookings, messages, invoices and earnings changes appear here instantly.</p>
      ) : (
        <>
          <ul className="mt-3 space-y-2">
            {events.map(event => {
              const Icon = icons[event.kind];
              const body = (
                <>
                  <Icon className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground">
                      {!event.read && <span className="mr-1.5 inline-block h-1.5 w-1.5 rounded-full bg-primary align-middle" />}
                      {event.title}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">{event.detail}</p>
                    <p className="text-[11px] text-muted-foreground">{new Date(event.at).toLocaleString()}</p>
                  </div>
                </>
              );
              const classes = `flex gap-3 rounded-xl border p-3 ${event.read ? "border-border/60 bg-background" : "border-primary/40 bg-primary/5"}`;
              return (
                <li key={event.id}>
                  {event.href ? (
                    <Link to={event.href} onClick={() => markRead(event.id)} className={`${classes} hover:border-primary`}>{body}</Link>
                  ) : (
                    <button type="button" onClick={() => markRead(event.id)} className={`${classes} w-full text-left`}>{body}</button>
                  )}
                </li>
              );
            })}
          </ul>
          <button
            className="mt-3 text-xs text-muted-foreground hover:text-foreground"
            onClick={() => { setEvents([]); localStorage.removeItem(storageKey(userId)); }}
          >
            Clear
          </button>
        </>
      )}
    </section>
  );
}
