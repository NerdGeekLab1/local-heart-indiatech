import { useEffect, useRef, useState } from "react";
import { Bell, Calendar, MessageCircle, Receipt, TrendingUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export interface HostActivityEvent {
  id: string;
  kind: "booking" | "message" | "invoice" | "earnings";
  title: string;
  detail: string;
  at: string;
}

const icons: Record<HostActivityEvent["kind"], React.ElementType> = {
  booking: Calendar,
  message: MessageCircle,
  invoice: Receipt,
  earnings: TrendingUp,
};

const inr = (value: number) => `₹${Number(value || 0).toLocaleString("en-IN")}`;
const storageKey = (userId: string) => `host-activity-${userId}`;

/**
 * Live in-app activity feed for host metric changes.
 * Each realtime change also raises a toast so the host notices without watching the tab.
 */
export default function HostActivityFeed({ userId, earnings }: { userId: string; earnings: number }) {
  const [events, setEvents] = useState<HostActivityEvent[]>(() => {
    try {
      return JSON.parse(localStorage.getItem(storageKey(userId)) || "[]") as HostActivityEvent[];
    } catch {
      return [];
    }
  });
  const lastEarnings = useRef<number | null>(null);

  const push = (event: Omit<HostActivityEvent, "id" | "at">) => {
    const entry: HostActivityEvent = { ...event, id: crypto.randomUUID(), at: new Date().toISOString() };
    setEvents(current => {
      const next = [entry, ...current].slice(0, 25);
      try { localStorage.setItem(storageKey(userId), JSON.stringify(next)); } catch { /* quota */ }
      return next;
    });
    toast({ title: entry.title, description: entry.detail });
  };

  useEffect(() => {
    const channel = supabase.channel(`host-activity-${userId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "bookings", filter: `host_id=eq.${userId}` }, payload => {
        const row = (payload.new ?? payload.eventType) as any;
        push({
          kind: "booking",
          title: payload.eventType === "INSERT" ? "New booking request" : "Booking updated",
          detail: `${row?.status ?? "updated"} · ${inr(row?.total_price)} · ${row?.start_date ?? ""}`,
        });
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "invoices", filter: `host_id=eq.${userId}` }, payload => {
        const row = payload.new as any;
        push({ kind: "invoice", title: "Invoice update", detail: `${row?.invoice_number ?? "Invoice"} · ${row?.status ?? ""} · ${inr(row?.total_amount)}` });
      })
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages", filter: `receiver_id=eq.${userId}` }, payload => {
        const row = payload.new as any;
        push({ kind: "message", title: "New traveler message", detail: String(row?.content ?? "").slice(0, 90) || "Open Messages to reply" });
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
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [earnings]);

  return (
    <section className="rounded-2xl border border-border bg-card p-5 shadow-card" data-testid="host-activity-feed">
      <div className="flex items-center justify-between">
        <h3 className="flex items-center gap-2 font-bold text-foreground"><Bell className="h-4 w-4 text-primary" /> Live activity</h3>
        {events.length > 0 && (
          <button
            className="text-xs text-muted-foreground hover:text-foreground"
            onClick={() => { setEvents([]); localStorage.removeItem(storageKey(userId)); }}
          >
            Clear
          </button>
        )}
      </div>
      {events.length === 0 ? (
        <p className="mt-3 text-sm text-muted-foreground">Nothing yet. New bookings, messages, invoices and earnings changes appear here instantly.</p>
      ) : (
        <ul className="mt-3 space-y-2">
          {events.map(event => {
            const Icon = icons[event.kind];
            return (
              <li key={event.id} className="flex gap-3 rounded-xl border border-border/60 bg-background p-3">
                <Icon className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground">{event.title}</p>
                  <p className="truncate text-xs text-muted-foreground">{event.detail}</p>
                  <p className="text-[11px] text-muted-foreground">{new Date(event.at).toLocaleString()}</p>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
