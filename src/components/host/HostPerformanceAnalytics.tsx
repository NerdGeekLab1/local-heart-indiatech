import { useMemo, useState } from "react";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { TrendingUp, Clock, Star, Percent } from "lucide-react";

type Row = Record<string, any>;

const RANGES = [
  { key: "7", label: "7 days" },
  { key: "30", label: "30 days" },
  { key: "90", label: "90 days" },
  { key: "365", label: "12 months" },
] as const;

const bucketLabel = (date: Date, days: number) =>
  days <= 30 ? date.toLocaleDateString("en-IN", { day: "2-digit", month: "short" })
    : date.toLocaleDateString("en-IN", { month: "short", year: "2-digit" });

const bucketKey = (date: Date, days: number) =>
  days <= 30 ? date.toISOString().slice(0, 10) : date.toISOString().slice(0, 7);

/**
 * Host-facing performance analytics: booking conversion, reply speed and review
 * trends over a simple date-range filter. Everything is derived from live rows.
 */
export default function HostPerformanceAnalytics({
  bookings, reviews, messages, userId,
}: { bookings: Row[]; reviews: Row[]; messages: Row[]; userId?: string }) {
  const [range, setRange] = useState<(typeof RANGES)[number]["key"]>("30");
  const days = Number(range);

  const stats = useMemo(() => {
    const since = new Date(Date.now() - days * 86_400_000);
    const inRange = (value: any) => value && new Date(value) >= since;

    const rangedBookings = bookings.filter(b => inRange(b.created_at));
    const rangedReviews = reviews.filter(r => inRange(r.created_at));
    const rangedMessages = messages.filter(m => inRange(m.created_at));

    const won = rangedBookings.filter(b => b.status === "confirmed" || b.status === "completed");
    const conversion = rangedBookings.length ? Math.round((won.length / rangedBookings.length) * 100) : null;

    const received = rangedMessages.filter(m => m.receiver_id === userId);
    const sent = rangedMessages.filter(m => m.sender_id === userId).sort((a, b) => +new Date(a.created_at) - +new Date(b.created_at));
    const gaps: number[] = [];
    received.forEach(inbound => {
      const reply = sent.find(out => out.receiver_id === inbound.sender_id && new Date(out.created_at) > new Date(inbound.created_at));
      if (reply) gaps.push((+new Date(reply.created_at) - +new Date(inbound.created_at)) / 60_000);
    });
    const avgReplyMinutes = gaps.length ? Math.round(gaps.reduce((s, g) => s + g, 0) / gaps.length) : null;
    const replyRate = received.length ? Math.round((gaps.length / received.length) * 100) : null;
    const avgRating = rangedReviews.length
      ? Number((rangedReviews.reduce((s, r) => s + Number(r.rating || 0), 0) / rangedReviews.length).toFixed(1))
      : null;

    const buckets = new Map<string, { label: string; requests: number; won: number; ratingSum: number; ratingCount: number }>();
    const step = days <= 30 ? 86_400_000 : 0;
    if (step) {
      for (let i = days - 1; i >= 0; i--) {
        const d = new Date(Date.now() - i * step);
        buckets.set(bucketKey(d, days), { label: bucketLabel(d, days), requests: 0, won: 0, ratingSum: 0, ratingCount: 0 });
      }
    } else {
      const months = Math.round(days / 30);
      for (let i = months - 1; i >= 0; i--) {
        const d = new Date();
        d.setMonth(d.getMonth() - i);
        buckets.set(bucketKey(d, days), { label: bucketLabel(d, days), requests: 0, won: 0, ratingSum: 0, ratingCount: 0 });
      }
    }

    rangedBookings.forEach(b => {
      const bucket = buckets.get(bucketKey(new Date(b.created_at), days));
      if (!bucket) return;
      bucket.requests += 1;
      if (b.status === "confirmed" || b.status === "completed") bucket.won += 1;
    });
    rangedReviews.forEach(r => {
      const bucket = buckets.get(bucketKey(new Date(r.created_at), days));
      if (!bucket) return;
      bucket.ratingSum += Number(r.rating || 0);
      bucket.ratingCount += 1;
    });

    const series = [...buckets.values()].map(b => ({
      label: b.label,
      requests: b.requests,
      won: b.won,
      rating: b.ratingCount ? Number((b.ratingSum / b.ratingCount).toFixed(2)) : null,
    }));

    return { conversion, avgReplyMinutes, replyRate, avgRating, series, total: rangedBookings.length, reviewCount: rangedReviews.length };
  }, [bookings, reviews, messages, userId, days]);

  const cards = [
    { label: "Booking conversion", value: stats.conversion === null ? "—" : `${stats.conversion}%`, hint: `${stats.total} requests`, icon: Percent },
    { label: "Avg. reply time", value: stats.avgReplyMinutes === null ? "—" : stats.avgReplyMinutes < 60 ? `${stats.avgReplyMinutes} min` : `${(stats.avgReplyMinutes / 60).toFixed(1)} h`, hint: stats.replyRate === null ? "No messages" : `${stats.replyRate}% replied`, icon: Clock },
    { label: "Avg. rating", value: stats.avgRating ?? "—", hint: `${stats.reviewCount} reviews`, icon: Star },
    { label: "Confirmed bookings", value: stats.series.reduce((s, r) => s + r.won, 0), hint: "In selected range", icon: TrendingUp },
  ];

  return (
    <div className="mt-6 space-y-6" data-testid="host-analytics">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-foreground">Performance analytics</h2>
          <p className="text-xs text-muted-foreground">Conversion, reply speed and review trends from your live data.</p>
        </div>
        <div className="flex gap-1 rounded-full border border-border bg-card p-1">
          {RANGES.map(r => (
            <button key={r.key} onClick={() => setRange(r.key)} data-testid={`host-analytics-range-${r.key}`}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${range === r.key ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>
              {r.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {cards.map(card => (
          <div key={card.label} className="rounded-xl bg-card p-4 shadow-card">
            <card.icon className="mb-2 h-4 w-4 text-primary" />
            <p className="text-2xl font-bold text-foreground">{card.value}</p>
            <p className="text-xs text-muted-foreground">{card.label}</p>
            <p className="text-[11px] text-muted-foreground">{card.hint}</p>
          </div>
        ))}
      </div>

      <div className="rounded-xl bg-card p-4 shadow-card">
        <h3 className="mb-3 text-sm font-bold text-foreground">Requests vs confirmed</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={stats.series}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="label" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" interval="preserveStartEnd" />
              <YAxis allowDecimals={false} tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
              <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 12, fontSize: 12 }} />
              <Bar dataKey="requests" name="Requests" fill="hsl(var(--muted-foreground))" radius={[4, 4, 0, 0]} />
              <Bar dataKey="won" name="Confirmed" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="rounded-xl bg-card p-4 shadow-card">
        <h3 className="mb-3 text-sm font-bold text-foreground">Review rating trend</h3>
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={stats.series}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="label" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" interval="preserveStartEnd" />
              <YAxis domain={[0, 5]} tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
              <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 12, fontSize: 12 }} />
              <Line type="monotone" dataKey="rating" name="Avg rating" stroke="hsl(var(--accent))" strokeWidth={2} connectNulls dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        {stats.reviewCount === 0 && <p className="mt-2 text-xs text-muted-foreground">No reviews in this range yet.</p>}
      </div>
    </div>
  );
}
