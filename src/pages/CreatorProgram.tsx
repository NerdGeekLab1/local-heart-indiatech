import { useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  BarChart3, Camera, CheckCircle2, Clock, Coins, Eye, Film, Gift,
  IndianRupee, Loader2, MousePointerClick, Plus, Sparkles, Wallet,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

interface CreatorApp {
  id: string;
  full_name: string;
  email: string;
  city: string | null;
  niche: string | null;
  bio: string | null;
  total_followers: number;
  avg_views: number;
  portfolio_links: string[];
  payout_method: string | null;
  tier: string;
  status: string;
  review_notes: string | null;
  created_at: string;
}

interface ContentRow {
  id: string;
  platform: string;
  title: string;
  url: string;
  campaign: string | null;
  posted_at: string | null;
  views: number;
  likes: number;
  clicks: number;
  bookings_attributed: number;
  reward_points: number;
  payout_amount: number;
  status: string;
  review_notes: string | null;
  created_at: string;
}

interface PayoutRow {
  id: string;
  amount_inr: number;
  period: string | null;
  method: string | null;
  reference: string | null;
  status: string;
  paid_at: string | null;
  created_at: string;
}

const PLATFORMS = ["instagram", "youtube", "tiktok", "blog", "x", "other"];
const TIERS = [
  { key: "rising", title: "Rising", reach: "Under 10k followers", perks: ["₹1,500 per approved reel", "Free local experience", "50 reward points per post"] },
  { key: "creator", title: "Creator", reach: "10k – 100k followers", perks: ["₹6,000 per approved reel", "Hosted 2-night stay", "5% of attributed bookings"] },
  { key: "signature", title: "Signature", reach: "100k+ followers", perks: ["Custom campaign fee", "Fully hosted multi-city trip", "8% of attributed bookings"] },
];

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-primary/10 text-primary",
  under_review: "bg-accent/10 text-accent",
  submitted: "bg-primary/10 text-primary",
  approved: "bg-emerald-500/10 text-emerald-600",
  paid: "bg-emerald-500/10 text-emerald-600",
  rejected: "bg-destructive/10 text-destructive",
  paused: "bg-destructive/10 text-destructive",
};

const inr = (n: number) => `₹${Math.round(n).toLocaleString("en-IN")}`;

export default function CreatorProgram() {
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();

  const [app, setApp] = useState<CreatorApp | null>(null);
  const [content, setContent] = useState<ContentRow[]>([]);
  const [payouts, setPayouts] = useState<PayoutRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    full_name: "", email: "", phone: "", city: "", niche: "",
    bio: "", total_followers: "", avg_views: "", portfolio: "",
    payout_method: "UPI", payout_details: "",
  });

  const [postForm, setPostForm] = useState({
    platform: "instagram", title: "", url: "", campaign: "",
    posted_at: "", views: "", likes: "", clicks: "",
  });

  const loadAll = async (uid: string) => {
    const { data } = await supabase.from("creator_applications").select("*").eq("user_id", uid).maybeSingle();
    const row = (data as CreatorApp | null) ?? null;
    setApp(row);
    if (row) {
      const [{ data: c }, { data: p }] = await Promise.all([
        supabase.from("creator_content").select("*").eq("creator_id", row.id).order("created_at", { ascending: false }),
        supabase.from("creator_payouts").select("*").eq("creator_id", row.id).order("created_at", { ascending: false }),
      ]);
      setContent((c as ContentRow[]) || []);
      setPayouts((p as PayoutRow[]) || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (authLoading) return;
    if (!user) { setLoading(false); return; }
    void loadAll(user.id);
    setForm(f => ({ ...f, email: f.email || user.email || "" }));

    const channel = supabase
      .channel(`creator-program-${user.id}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "creator_applications", filter: `user_id=eq.${user.id}` }, () => { void loadAll(user.id); })
      .on("postgres_changes", { event: "*", schema: "public", table: "creator_content", filter: `user_id=eq.${user.id}` }, () => { void loadAll(user.id); })
      .on("postgres_changes", { event: "*", schema: "public", table: "creator_payouts", filter: `user_id=eq.${user.id}` }, () => { void loadAll(user.id); })
      .subscribe();
    return () => { void supabase.removeChannel(channel); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, user?.id]);

  const stats = useMemo(() => {
    const approved = content.filter(c => c.status === "approved" || c.status === "paid");
    return {
      posts: content.length,
      approved: approved.length,
      views: approved.reduce((s, c) => s + c.views, 0),
      clicks: approved.reduce((s, c) => s + c.clicks, 0),
      bookings: approved.reduce((s, c) => s + c.bookings_attributed, 0),
      points: approved.reduce((s, c) => s + c.reward_points, 0),
      earned: approved.reduce((s, c) => s + Number(c.payout_amount || 0), 0),
      paid: payouts.filter(p => p.status === "paid").reduce((s, p) => s + Number(p.amount_inr || 0), 0),
    };
  }, [content, payouts]);

  const applyNow = async () => {
    if (!user) return;
    if (!form.full_name.trim() || !form.email.trim()) {
      toast({ title: "Name and email are required", variant: "destructive" });
      return;
    }
    setSaving(true);
    const links = form.portfolio.split(/[\n,]/).map(s => s.trim()).filter(Boolean).slice(0, 8);
    const { error } = await supabase.from("creator_applications").insert({
      user_id: user.id,
      full_name: form.full_name.trim().slice(0, 120),
      email: form.email.trim().slice(0, 160),
      phone: form.phone.trim().slice(0, 30) || null,
      city: form.city.trim().slice(0, 80) || null,
      niche: form.niche.trim().slice(0, 80) || null,
      bio: form.bio.trim().slice(0, 1000) || null,
      total_followers: Math.max(0, Number(form.total_followers) || 0),
      avg_views: Math.max(0, Number(form.avg_views) || 0),
      portfolio_links: links,
      payout_method: form.payout_method,
      payout_details: form.payout_details.trim().slice(0, 200) || null,
      status: "pending",
    });
    setSaving(false);
    if (error) { toast({ title: "Could not submit", description: error.message, variant: "destructive" }); return; }
    toast({ title: "You're in the queue", description: "We review creator applications every week." });
    void loadAll(user.id);
  };

  const submitPost = async () => {
    if (!app || !user) return;
    if (!postForm.title.trim() || !/^https?:\/\//i.test(postForm.url.trim())) {
      toast({ title: "Add a title and a valid link", variant: "destructive" });
      return;
    }
    setSaving(true);
    const { error } = await supabase.from("creator_content").insert({
      creator_id: app.id,
      user_id: user.id,
      platform: postForm.platform,
      title: postForm.title.trim().slice(0, 160),
      url: postForm.url.trim().slice(0, 500),
      campaign: postForm.campaign.trim().slice(0, 120) || null,
      posted_at: postForm.posted_at || null,
      views: Math.max(0, Number(postForm.views) || 0),
      likes: Math.max(0, Number(postForm.likes) || 0),
      clicks: Math.max(0, Number(postForm.clicks) || 0),
      status: "submitted",
    });
    setSaving(false);
    if (error) { toast({ title: "Could not submit", description: error.message, variant: "destructive" }); return; }
    setPostForm({ platform: "instagram", title: "", url: "", campaign: "", posted_at: "", views: "", likes: "", clicks: "" });
    toast({ title: "Content submitted for review" });
    void loadAll(user.id);
  };

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Creator Program | Get paid to travel with RoamYoo</title>
        <meta name="description" content="Join the RoamYoo creator program: travel influencers apply, publish reels and guides, earn reward points and cash per approved post, and get paid on a live earnings dashboard." />
        <meta property="og:title" content="Creator Program | RoamYoo" />
        <meta property="og:description" content="Apply, publish, earn rewards and get paid for the trips you already film." />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
      </Helmet>
      <Navbar />

      <main className="pb-24">
        <section className="px-4 sm:px-6 lg:px-8 pt-10 pb-12 max-w-6xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Creator Program</p>
            <h1 className="mt-3 text-3xl sm:text-5xl font-bold tracking-tight text-foreground">
              Film the India you love. Get hosted, get rewarded, get paid.
            </h1>
            <p className="mt-4 max-w-2xl text-base sm:text-lg text-muted-foreground">
              Apply once, publish reels and guides with real local hosts, submit your links, and watch points and
              payouts land on your own creator dashboard.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button asChild size="lg"><a href="#apply">Apply as a creator</a></Button>
              <Button asChild variant="outline" size="lg"><Link to="/marketing-plan">See the campaign calendar</Link></Button>
            </div>
          </motion.div>

          <div className="mt-12 grid gap-4 sm:grid-cols-3">
            {[
              { icon: Camera, title: "1. Apply & get approved", text: "Share your handles, reach and niche. We review weekly." },
              { icon: Film, title: "2. Publish & submit", text: "Post your reel or guide, drop the link with its numbers." },
              { icon: Wallet, title: "3. Earn & get paid", text: "Admin approves, points credit, payouts are recorded here." },
            ].map((s, i) => (
              <motion.div key={s.title} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.07 * i }}
                className="rounded-xl bg-card p-5 shadow-card border border-border/60">
                <s.icon className="w-6 h-6 text-primary" />
                <h2 className="mt-3 font-semibold text-foreground">{s.title}</h2>
                <p className="mt-1 text-sm text-muted-foreground">{s.text}</p>
              </motion.div>
            ))}
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            {TIERS.map(t => (
              <div key={t.key} className="rounded-xl bg-card p-6 shadow-card border border-border/60">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-primary" />
                  <h3 className="text-lg font-bold text-foreground">{t.title}</h3>
                </div>
                <p className="text-sm text-muted-foreground">{t.reach}</p>
                <ul className="mt-4 space-y-2">
                  {t.perks.map(p => (
                    <li key={p} className="flex items-start gap-2 text-sm text-foreground">
                      <Gift className="w-4 h-4 text-primary mt-0.5 shrink-0" /> {p}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <p className="mt-3 text-xs text-muted-foreground">Fees and perks are indicative starting points and confirmed per campaign at approval.</p>
        </section>

        <section id="apply" className="px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
          {loading || authLoading ? (
            <div className="rounded-xl bg-card p-10 text-center shadow-card"><Loader2 className="w-6 h-6 animate-spin text-primary mx-auto" /></div>
          ) : !user ? (
            <div className="rounded-xl bg-card p-8 shadow-card text-center border border-border/60">
              <Camera className="w-10 h-10 text-primary mx-auto" />
              <h2 className="mt-3 text-2xl font-bold text-foreground">Sign in to apply</h2>
              <p className="mt-2 text-muted-foreground">Your creator dashboard, submissions and payouts live in your account.</p>
              <Button asChild className="mt-5"><Link to="/signup?next=%2Fcreators">Create account or sign in</Link></Button>
            </div>
          ) : !app ? (
            <div className="rounded-xl bg-card p-6 sm:p-8 shadow-card border border-border/60">
              <h2 className="text-2xl font-bold text-foreground">Creator application</h2>
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <div><Label htmlFor="cr-name">Full name *</Label><Input id="cr-name" maxLength={120} value={form.full_name} onChange={e => setForm({ ...form, full_name: e.target.value })} /></div>
                <div><Label htmlFor="cr-email">Email *</Label><Input id="cr-email" type="email" maxLength={160} value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} /></div>
                <div><Label htmlFor="cr-phone">Phone</Label><Input id="cr-phone" maxLength={30} value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} /></div>
                <div><Label htmlFor="cr-city">Base city</Label><Input id="cr-city" maxLength={80} value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} /></div>
                <div><Label htmlFor="cr-niche">Niche</Label><Input id="cr-niche" maxLength={80} value={form.niche} onChange={e => setForm({ ...form, niche: e.target.value })} placeholder="Slow travel, food, adventure…" /></div>
                <div><Label htmlFor="cr-followers">Total followers</Label><Input id="cr-followers" type="number" min={0} value={form.total_followers} onChange={e => setForm({ ...form, total_followers: e.target.value })} /></div>
                <div><Label htmlFor="cr-views">Average views per post</Label><Input id="cr-views" type="number" min={0} value={form.avg_views} onChange={e => setForm({ ...form, avg_views: e.target.value })} /></div>
                <div>
                  <Label htmlFor="cr-payout">Preferred payout method</Label>
                  <select id="cr-payout" className="mt-1 h-10 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground"
                    value={form.payout_method} onChange={e => setForm({ ...form, payout_method: e.target.value })}>
                    {["UPI", "Bank transfer", "PayPal", "Wise"].map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
                <div className="sm:col-span-2"><Label htmlFor="cr-payoutd">Payout handle / account reference</Label><Input id="cr-payoutd" maxLength={200} value={form.payout_details} onChange={e => setForm({ ...form, payout_details: e.target.value })} placeholder="name@upi" /></div>
                <div className="sm:col-span-2"><Label htmlFor="cr-links">Profile links (one per line)</Label><Textarea id="cr-links" rows={3} maxLength={1000} value={form.portfolio} onChange={e => setForm({ ...form, portfolio: e.target.value })} placeholder={"https://instagram.com/…\nhttps://youtube.com/@…"} /></div>
                <div className="sm:col-span-2"><Label htmlFor="cr-bio">Tell us about your audience</Label><Textarea id="cr-bio" rows={4} maxLength={1000} value={form.bio} onChange={e => setForm({ ...form, bio: e.target.value })} /></div>
              </div>
              <Button className="mt-6" size="lg" disabled={saving} onClick={applyNow}>
                {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null} Submit application
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="rounded-xl bg-card p-6 shadow-card border border-border/60">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h2 className="text-2xl font-bold text-foreground">{app.full_name}</h2>
                    <p className="text-sm text-muted-foreground">
                      {app.city ? `${app.city} · ` : ""}{app.niche || "Travel creator"} · {app.total_followers.toLocaleString("en-IN")} followers · {app.tier} tier
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${STATUS_STYLES[app.status] || "bg-secondary text-muted-foreground"}`}>
                    {app.status.replace("_", " ")}
                  </span>
                </div>
                {app.status === "approved" ? (
                  <p className="mt-3 text-sm text-emerald-600 flex items-center gap-2"><CheckCircle2 className="w-4 h-4" /> Approved creator — submit content any time.</p>
                ) : app.status === "rejected" || app.status === "paused" ? (
                  <p className="mt-3 text-sm text-destructive">Your creator access is not active right now.</p>
                ) : (
                  <p className="mt-3 text-sm text-muted-foreground flex items-center gap-2"><Clock className="w-4 h-4" /> Application under review — we get back within a week.</p>
                )}
                {app.review_notes && <p className="mt-2 text-sm text-muted-foreground">Note from our team: {app.review_notes}</p>}
              </div>

              <div className="grid gap-4 grid-cols-2 lg:grid-cols-6">
                {[
                  { label: "Posts", value: String(stats.posts), icon: Film },
                  { label: "Approved", value: String(stats.approved), icon: CheckCircle2 },
                  { label: "Views", value: stats.views.toLocaleString("en-IN"), icon: Eye },
                  { label: "Clicks", value: stats.clicks.toLocaleString("en-IN"), icon: MousePointerClick },
                  { label: "Reward points", value: String(stats.points), icon: Coins },
                  { label: "Paid out", value: inr(stats.paid), icon: IndianRupee },
                ].map(s => (
                  <div key={s.label} className="rounded-xl bg-card p-4 shadow-card border border-border/60">
                    <s.icon className="w-5 h-5 text-primary" />
                    <p className="mt-2 text-xl font-bold text-foreground">{s.value}</p>
                    <p className="text-xs text-muted-foreground">{s.label}</p>
                  </div>
                ))}
              </div>

              <div className="rounded-xl bg-card p-6 shadow-card border border-border/60">
                <p className="text-sm text-muted-foreground">Approved earnings</p>
                <p className="text-3xl font-bold text-foreground">{inr(stats.earned)}</p>
                <p className="text-xs text-muted-foreground mt-1">{inr(stats.paid)} already paid · {inr(Math.max(0, stats.earned - stats.paid))} awaiting payout · {stats.bookings} bookings attributed</p>
              </div>

              {app.status === "approved" && (
                <div className="rounded-xl bg-card p-6 shadow-card border border-border/60">
                  <h3 className="text-lg font-bold text-foreground">Submit published content</h3>
                  <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    <div>
                      <Label htmlFor="pf-platform">Platform</Label>
                      <select id="pf-platform" className="mt-1 h-10 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground"
                        value={postForm.platform} onChange={e => setPostForm({ ...postForm, platform: e.target.value })}>
                        {PLATFORMS.map(p => <option key={p} value={p}>{p}</option>)}
                      </select>
                    </div>
                    <div><Label htmlFor="pf-title">Title *</Label><Input id="pf-title" maxLength={160} value={postForm.title} onChange={e => setPostForm({ ...postForm, title: e.target.value })} /></div>
                    <div className="lg:col-span-2"><Label htmlFor="pf-url">Link *</Label><Input id="pf-url" maxLength={500} value={postForm.url} onChange={e => setPostForm({ ...postForm, url: e.target.value })} placeholder="https://" /></div>
                    <div><Label htmlFor="pf-campaign">Campaign</Label><Input id="pf-campaign" maxLength={120} value={postForm.campaign} onChange={e => setPostForm({ ...postForm, campaign: e.target.value })} placeholder="Rajasthan winter" /></div>
                    <div><Label htmlFor="pf-date">Posted on</Label><Input id="pf-date" type="date" value={postForm.posted_at} onChange={e => setPostForm({ ...postForm, posted_at: e.target.value })} /></div>
                    <div><Label htmlFor="pf-views">Views</Label><Input id="pf-views" type="number" min={0} value={postForm.views} onChange={e => setPostForm({ ...postForm, views: e.target.value })} /></div>
                    <div><Label htmlFor="pf-clicks">Link clicks</Label><Input id="pf-clicks" type="number" min={0} value={postForm.clicks} onChange={e => setPostForm({ ...postForm, clicks: e.target.value })} /></div>
                  </div>
                  <Button className="mt-4" disabled={saving} onClick={submitPost}><Plus className="w-4 h-4 mr-1" /> Submit for review</Button>
                </div>
              )}

              <div className="rounded-xl bg-card p-6 shadow-card border border-border/60">
                <h3 className="text-lg font-bold text-foreground flex items-center gap-2"><BarChart3 className="w-5 h-5 text-primary" /> Your submissions</h3>
                {content.length === 0 ? (
                  <p className="mt-2 text-sm text-muted-foreground">Nothing submitted yet.</p>
                ) : (
                  <div className="mt-4 space-y-3">
                    {content.map(c => (
                      <div key={c.id} className="rounded-lg bg-secondary/40 p-4 flex flex-wrap items-start justify-between gap-3">
                        <div className="min-w-0">
                          <a href={c.url} target="_blank" rel="noopener noreferrer" className="font-semibold text-foreground hover:text-primary break-words">{c.title}</a>
                          <p className="text-sm text-muted-foreground">
                            {c.platform}{c.campaign ? ` · ${c.campaign}` : ""} · {c.views.toLocaleString("en-IN")} views · {c.clicks} clicks · {c.bookings_attributed} bookings
                          </p>
                          <p className="text-sm text-muted-foreground">{c.reward_points} points · {inr(Number(c.payout_amount))}</p>
                          {c.review_notes && <p className="text-xs text-muted-foreground mt-1">Note: {c.review_notes}</p>}
                        </div>
                        <span className={`text-xs px-2 py-1 rounded-full ${STATUS_STYLES[c.status] || "bg-secondary text-muted-foreground"}`}>{c.status}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="rounded-xl bg-card p-6 shadow-card border border-border/60">
                <h3 className="text-lg font-bold text-foreground flex items-center gap-2"><Wallet className="w-5 h-5 text-primary" /> Payout history</h3>
                {payouts.length === 0 ? (
                  <p className="mt-2 text-sm text-muted-foreground">No payouts recorded yet.</p>
                ) : (
                  <div className="mt-4 space-y-3">
                    {payouts.map(p => (
                      <div key={p.id} className="rounded-lg bg-secondary/40 p-4 flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <p className="font-semibold text-foreground">{inr(Number(p.amount_inr))}{p.period ? ` · ${p.period}` : ""}</p>
                          <p className="text-xs text-muted-foreground">
                            {p.method || "—"}{p.reference ? ` · ref ${p.reference}` : ""} · {p.paid_at ? `paid ${new Date(p.paid_at).toLocaleDateString()}` : `raised ${new Date(p.created_at).toLocaleDateString()}`}
                          </p>
                        </div>
                        <span className={`text-xs px-2 py-1 rounded-full ${STATUS_STYLES[p.status] || "bg-secondary text-muted-foreground"}`}>{p.status}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
}
