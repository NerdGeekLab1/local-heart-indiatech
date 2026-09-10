import { useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  BedDouble, BadgeCheck, Building2, CalendarDays, CheckCircle2, Clock,
  Globe2, IndianRupee, Loader2, Plus, Trash2, TrendingUp, Users,
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

interface HotelPartner {
  id: string;
  hotel_name: string;
  contact_name: string;
  contact_email: string;
  contact_phone: string | null;
  city: string;
  state: string | null;
  property_type: string;
  room_count: number;
  website: string | null;
  description: string | null;
  commission_pct: number;
  status: string;
  review_notes: string | null;
  created_at: string;
}

interface RatePlan {
  id: string;
  room_type: string;
  occupancy: number;
  rate_inr: number;
  net_rate_inr: number | null;
  meal_plan: string;
  cancellation_policy: string | null;
  min_nights: number;
  valid_from: string | null;
  valid_to: string | null;
  terms: string | null;
  is_active: boolean;
}

interface Lead {
  id: string;
  guest_name: string;
  guest_country: string | null;
  check_in: string | null;
  nights: number;
  guests: number;
  room_type: string | null;
  value_inr: number;
  commission_inr: number;
  status: string;
  created_at: string;
}

const PROPERTY_TYPES = ["hotel", "boutique hotel", "homestay", "resort", "guesthouse", "villa", "hostel"];
const MEAL_PLANS = [
  { value: "room_only", label: "Room only" },
  { value: "breakfast", label: "With breakfast" },
  { value: "half_board", label: "Half board" },
  { value: "full_board", label: "Full board" },
];

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-primary/10 text-primary",
  under_review: "bg-accent/10 text-accent",
  approved: "bg-emerald-500/10 text-emerald-600",
  rejected: "bg-destructive/10 text-destructive",
  suspended: "bg-destructive/10 text-destructive",
};

const inr = (n: number) => `₹${Math.round(n).toLocaleString("en-IN")}`;

const BENEFITS = [
  { icon: Globe2, title: "Foreign travellers, pre-qualified", text: "Guests arrive through verified local hosts and curated itineraries — longer stays, fewer cancellations." },
  { icon: IndianRupee, title: "Commission only on stays", text: "No listing fee, no subscription. You set the net rate; we agree the commission at approval." },
  { icon: TrendingUp, title: "Live performance dashboard", text: "Every enquiry, confirmed stay and commission tracked in one live view." },
  { icon: BadgeCheck, title: "Creator-led exposure", text: "Featured in reels and city guides made by our travel creators." },
];

export default function HotelPartners() {
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();

  const [hotel, setHotel] = useState<HotelPartner | null>(null);
  const [rates, setRates] = useState<RatePlan[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    hotel_name: "", contact_name: "", contact_email: "", contact_phone: "",
    city: "", state: "", property_type: "hotel", room_count: "10",
    website: "", description: "",
  });

  const [rateForm, setRateForm] = useState({
    room_type: "", occupancy: "2", rate_inr: "", net_rate_inr: "",
    meal_plan: "breakfast", min_nights: "1", valid_from: "", valid_to: "",
    cancellation_policy: "", terms: "",
  });

  const loadAll = async (uid: string) => {
    const { data } = await supabase.from("hotel_partners").select("*").eq("user_id", uid).maybeSingle();
    const row = (data as HotelPartner | null) ?? null;
    setHotel(row);
    if (row) {
      const [{ data: r }, { data: l }] = await Promise.all([
        supabase.from("hotel_rate_plans").select("*").eq("hotel_id", row.id).order("created_at", { ascending: false }),
        supabase.from("hotel_leads").select("*").eq("hotel_id", row.id).order("created_at", { ascending: false }),
      ]);
      setRates((r as RatePlan[]) || []);
      setLeads((l as Lead[]) || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (authLoading) return;
    if (!user) { setLoading(false); return; }
    void loadAll(user.id);
    setForm(f => ({ ...f, contact_email: f.contact_email || user.email || "" }));

    const channel = supabase
      .channel(`hotel-partner-${user.id}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "hotel_partners", filter: `user_id=eq.${user.id}` }, () => { void loadAll(user.id); })
      .on("postgres_changes", { event: "*", schema: "public", table: "hotel_leads" }, () => { void loadAll(user.id); })
      .subscribe();
    return () => { void supabase.removeChannel(channel); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, user?.id]);

  const stats = useMemo(() => {
    const confirmed = leads.filter(l => l.status === "confirmed" || l.status === "completed");
    return {
      enquiries: leads.length,
      confirmed: confirmed.length,
      roomNights: confirmed.reduce((s, l) => s + l.nights, 0),
      revenue: confirmed.reduce((s, l) => s + Number(l.value_inr || 0), 0),
      commission: confirmed.reduce((s, l) => s + Number(l.commission_inr || 0), 0),
    };
  }, [leads]);

  const apply = async () => {
    if (!user) return;
    if (!form.hotel_name.trim() || !form.contact_name.trim() || !form.contact_email.trim() || !form.city.trim()) {
      toast({ title: "Please fill the required fields", variant: "destructive" });
      return;
    }
    setSaving(true);
    const { error } = await supabase.from("hotel_partners").insert({
      user_id: user.id,
      hotel_name: form.hotel_name.trim().slice(0, 120),
      contact_name: form.contact_name.trim().slice(0, 120),
      contact_email: form.contact_email.trim().slice(0, 160),
      contact_phone: form.contact_phone.trim().slice(0, 30) || null,
      city: form.city.trim().slice(0, 80),
      state: form.state.trim().slice(0, 80) || null,
      property_type: form.property_type,
      room_count: Math.max(0, Number(form.room_count) || 0),
      website: form.website.trim().slice(0, 200) || null,
      description: form.description.trim().slice(0, 1500) || null,
      status: "pending",
    });
    setSaving(false);
    if (error) { toast({ title: "Could not submit", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Application received", description: "Our partnerships team reviews new properties within 3 working days." });
    void loadAll(user.id);
  };

  const addRate = async () => {
    if (!hotel) return;
    if (!rateForm.room_type.trim() || !rateForm.rate_inr) {
      toast({ title: "Add a room type and rate", variant: "destructive" });
      return;
    }
    setSaving(true);
    const { error } = await supabase.from("hotel_rate_plans").insert({
      hotel_id: hotel.id,
      room_type: rateForm.room_type.trim().slice(0, 80),
      occupancy: Math.max(1, Number(rateForm.occupancy) || 1),
      rate_inr: Math.max(0, Number(rateForm.rate_inr) || 0),
      net_rate_inr: rateForm.net_rate_inr ? Math.max(0, Number(rateForm.net_rate_inr)) : null,
      meal_plan: rateForm.meal_plan,
      min_nights: Math.max(1, Number(rateForm.min_nights) || 1),
      valid_from: rateForm.valid_from || null,
      valid_to: rateForm.valid_to || null,
      cancellation_policy: rateForm.cancellation_policy.trim().slice(0, 500) || null,
      terms: rateForm.terms.trim().slice(0, 1000) || null,
    });
    setSaving(false);
    if (error) { toast({ title: "Could not save rate", description: error.message, variant: "destructive" }); return; }
    setRateForm({ room_type: "", occupancy: "2", rate_inr: "", net_rate_inr: "", meal_plan: "breakfast", min_nights: "1", valid_from: "", valid_to: "", cancellation_policy: "", terms: "" });
    toast({ title: "Rate plan saved" });
    void loadAll(user!.id);
  };

  const toggleRate = async (r: RatePlan) => {
    await supabase.from("hotel_rate_plans").update({ is_active: !r.is_active }).eq("id", r.id);
    void loadAll(user!.id);
  };

  const removeRate = async (id: string) => {
    await supabase.from("hotel_rate_plans").delete().eq("id", id);
    void loadAll(user!.id);
  };

  const setLeadStatus = async (id: string, status: string) => {
    const { error } = await supabase.from("hotel_leads").update({ status }).eq("id", id);
    if (error) { toast({ title: "Could not update", description: error.message, variant: "destructive" }); return; }
    void loadAll(user!.id);
  };

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Hotel Partnerships | RoamYoo for hotels & homestays</title>
        <meta name="description" content="Partner your hotel, homestay or resort with RoamYoo. Submit rates and terms, get approved by our team, and track enquiries, stays and commission on a live dashboard." />
        <meta property="og:title" content="Hotel Partnerships | RoamYoo" />
        <meta property="og:description" content="List your property, submit rates and terms, and track every enquiry and confirmed stay live." />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
      </Helmet>
      <Navbar />

      <main className="pb-24">
        <section className="px-4 sm:px-6 lg:px-8 pt-10 pb-12 max-w-6xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Hotel Partner Program</p>
            <h1 className="mt-3 text-3xl sm:text-5xl font-bold tracking-tight text-foreground">
              Fill your rooms with travellers who came for the culture
            </h1>
            <p className="mt-4 max-w-2xl text-base sm:text-lg text-muted-foreground">
              Apply once, share your rates and terms, and our team gets you live. Every enquiry, confirmed stay and
              commission then shows up on your own dashboard in real time.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button asChild size="lg"><a href="#apply">Apply your property</a></Button>
              <Button asChild variant="outline" size="lg"><Link to="/marketing-plan">See how we bring guests</Link></Button>
            </div>
          </motion.div>

          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {BENEFITS.map((b, i) => (
              <motion.div key={b.title} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.06 * i }}
                className="rounded-xl bg-card p-5 shadow-card border border-border/60">
                <b.icon className="w-6 h-6 text-primary" />
                <h2 className="mt-3 font-semibold text-foreground">{b.title}</h2>
                <p className="mt-1 text-sm text-muted-foreground">{b.text}</p>
              </motion.div>
            ))}
          </div>
        </section>

        <section className="px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
          <div className="rounded-xl bg-secondary/40 p-6 border border-border/60">
            <h2 className="text-xl font-bold text-foreground">How the partnership works</h2>
            <ol className="mt-4 grid gap-4 sm:grid-cols-4">
              {[
                { t: "1. Apply", d: "Tell us about the property and who to talk to." },
                { t: "2. Submit rates & terms", d: "Room types, net rates, meal plans, cancellation policy." },
                { t: "3. Admin approval", d: "We verify the property and agree your commission." },
                { t: "4. Go live", d: "Receive enquiries and track stays on your dashboard." },
              ].map(s => (
                <li key={s.t} className="rounded-lg bg-card p-4 shadow-card">
                  <p className="font-semibold text-foreground">{s.t}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{s.d}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section id="apply" className="px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto mt-12">
          {loading || authLoading ? (
            <div className="rounded-xl bg-card p-10 text-center shadow-card">
              <Loader2 className="w-6 h-6 animate-spin text-primary mx-auto" />
            </div>
          ) : !user ? (
            <div className="rounded-xl bg-card p-8 shadow-card text-center border border-border/60">
              <Building2 className="w-10 h-10 text-primary mx-auto" />
              <h2 className="mt-3 text-2xl font-bold text-foreground">Sign in to apply</h2>
              <p className="mt-2 text-muted-foreground">Create a free account so we can keep your rates and dashboard tied to your property.</p>
              <Button asChild className="mt-5"><Link to="/signup?next=%2Fhotel-partners">Create account or sign in</Link></Button>
            </div>
          ) : !hotel ? (
            <div className="rounded-xl bg-card p-6 sm:p-8 shadow-card border border-border/60">
              <h2 className="text-2xl font-bold text-foreground">Apply your property</h2>
              <p className="mt-1 text-sm text-muted-foreground">Rates and terms come next, once the property is submitted.</p>
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <div><Label htmlFor="hp-name">Property name *</Label><Input id="hp-name" maxLength={120} value={form.hotel_name} onChange={e => setForm({ ...form, hotel_name: e.target.value })} placeholder="Haveli Ratan Vilas" /></div>
                <div>
                  <Label htmlFor="hp-type">Property type</Label>
                  <select id="hp-type" className="mt-1 h-10 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground"
                    value={form.property_type} onChange={e => setForm({ ...form, property_type: e.target.value })}>
                    {PROPERTY_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div><Label htmlFor="hp-contact">Contact person *</Label><Input id="hp-contact" maxLength={120} value={form.contact_name} onChange={e => setForm({ ...form, contact_name: e.target.value })} /></div>
                <div><Label htmlFor="hp-email">Contact email *</Label><Input id="hp-email" type="email" maxLength={160} value={form.contact_email} onChange={e => setForm({ ...form, contact_email: e.target.value })} /></div>
                <div><Label htmlFor="hp-phone">Phone</Label><Input id="hp-phone" maxLength={30} value={form.contact_phone} onChange={e => setForm({ ...form, contact_phone: e.target.value })} /></div>
                <div><Label htmlFor="hp-city">City *</Label><Input id="hp-city" maxLength={80} value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} /></div>
                <div><Label htmlFor="hp-state">State</Label><Input id="hp-state" maxLength={80} value={form.state} onChange={e => setForm({ ...form, state: e.target.value })} /></div>
                <div><Label htmlFor="hp-rooms">Number of rooms</Label><Input id="hp-rooms" type="number" min={0} value={form.room_count} onChange={e => setForm({ ...form, room_count: e.target.value })} /></div>
                <div className="sm:col-span-2"><Label htmlFor="hp-web">Website</Label><Input id="hp-web" maxLength={200} value={form.website} onChange={e => setForm({ ...form, website: e.target.value })} placeholder="https://" /></div>
                <div className="sm:col-span-2"><Label htmlFor="hp-desc">About the property</Label><Textarea id="hp-desc" maxLength={1500} rows={4} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Heritage haveli, 14 rooms, rooftop dining, walking distance from the old city…" /></div>
              </div>
              <Button className="mt-6" size="lg" disabled={saving} onClick={apply}>
                {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null} Submit application
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="rounded-xl bg-card p-6 shadow-card border border-border/60">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h2 className="text-2xl font-bold text-foreground">{hotel.hotel_name}</h2>
                    <p className="text-sm text-muted-foreground">{hotel.property_type} · {hotel.city}{hotel.state ? `, ${hotel.state}` : ""} · {hotel.room_count} rooms</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${STATUS_STYLES[hotel.status] || "bg-secondary text-muted-foreground"}`}>
                    {hotel.status.replace("_", " ")}
                  </span>
                </div>
                {hotel.status === "approved" ? (
                  <p className="mt-3 text-sm text-emerald-600 flex items-center gap-2"><CheckCircle2 className="w-4 h-4" /> Live partner · commission {Number(hotel.commission_pct)}% on confirmed stays</p>
                ) : hotel.status === "rejected" || hotel.status === "suspended" ? (
                  <p className="mt-3 text-sm text-destructive">This partnership is not active right now.</p>
                ) : (
                  <p className="mt-3 text-sm text-muted-foreground flex items-center gap-2"><Clock className="w-4 h-4" /> Under review — add your rates and terms so we can approve faster.</p>
                )}
                {hotel.review_notes && <p className="mt-2 text-sm text-muted-foreground">Note from our team: {hotel.review_notes}</p>}
              </div>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
                {[
                  { label: "Enquiries", value: String(stats.enquiries), icon: Users },
                  { label: "Confirmed stays", value: String(stats.confirmed), icon: CheckCircle2 },
                  { label: "Room nights", value: String(stats.roomNights), icon: BedDouble },
                  { label: "Stay value", value: inr(stats.revenue), icon: IndianRupee },
                  { label: "Commission", value: inr(stats.commission), icon: TrendingUp },
                ].map(s => (
                  <div key={s.label} className="rounded-xl bg-card p-4 shadow-card border border-border/60">
                    <s.icon className="w-5 h-5 text-primary" />
                    <p className="mt-2 text-2xl font-bold text-foreground">{s.value}</p>
                    <p className="text-xs text-muted-foreground">{s.label}</p>
                  </div>
                ))}
              </div>

              <div className="rounded-xl bg-card p-6 shadow-card border border-border/60">
                <h3 className="text-lg font-bold text-foreground">Rates & terms</h3>
                <p className="text-sm text-muted-foreground">Add a plan per room type. Deactivate a plan instead of deleting it when a season ends.</p>

                <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  <div><Label htmlFor="rp-room">Room type *</Label><Input id="rp-room" maxLength={80} value={rateForm.room_type} onChange={e => setRateForm({ ...rateForm, room_type: e.target.value })} placeholder="Deluxe double" /></div>
                  <div><Label htmlFor="rp-occ">Occupancy</Label><Input id="rp-occ" type="number" min={1} value={rateForm.occupancy} onChange={e => setRateForm({ ...rateForm, occupancy: e.target.value })} /></div>
                  <div><Label htmlFor="rp-rate">Published rate / night (₹) *</Label><Input id="rp-rate" type="number" min={0} value={rateForm.rate_inr} onChange={e => setRateForm({ ...rateForm, rate_inr: e.target.value })} /></div>
                  <div><Label htmlFor="rp-net">Net rate to us (₹)</Label><Input id="rp-net" type="number" min={0} value={rateForm.net_rate_inr} onChange={e => setRateForm({ ...rateForm, net_rate_inr: e.target.value })} /></div>
                  <div>
                    <Label htmlFor="rp-meal">Meal plan</Label>
                    <select id="rp-meal" className="mt-1 h-10 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground"
                      value={rateForm.meal_plan} onChange={e => setRateForm({ ...rateForm, meal_plan: e.target.value })}>
                      {MEAL_PLANS.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                    </select>
                  </div>
                  <div><Label htmlFor="rp-min">Minimum nights</Label><Input id="rp-min" type="number" min={1} value={rateForm.min_nights} onChange={e => setRateForm({ ...rateForm, min_nights: e.target.value })} /></div>
                  <div><Label htmlFor="rp-from">Valid from</Label><Input id="rp-from" type="date" value={rateForm.valid_from} onChange={e => setRateForm({ ...rateForm, valid_from: e.target.value })} /></div>
                  <div><Label htmlFor="rp-to">Valid to</Label><Input id="rp-to" type="date" value={rateForm.valid_to} onChange={e => setRateForm({ ...rateForm, valid_to: e.target.value })} /></div>
                  <div className="sm:col-span-2"><Label htmlFor="rp-cancel">Cancellation policy</Label><Input id="rp-cancel" maxLength={500} value={rateForm.cancellation_policy} onChange={e => setRateForm({ ...rateForm, cancellation_policy: e.target.value })} placeholder="Free cancellation up to 72 hours before check-in" /></div>
                  <div className="sm:col-span-2"><Label htmlFor="rp-terms">Other terms</Label><Input id="rp-terms" maxLength={1000} value={rateForm.terms} onChange={e => setRateForm({ ...rateForm, terms: e.target.value })} placeholder="Airport pickup on request, extra bed ₹800" /></div>
                </div>
                <Button className="mt-4" disabled={saving} onClick={addRate}><Plus className="w-4 h-4 mr-1" /> Add rate plan</Button>

                <div className="mt-6 space-y-3">
                  {rates.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No rate plans yet.</p>
                  ) : rates.map(r => (
                    <div key={r.id} className="rounded-lg bg-secondary/40 p-4 flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-foreground">{r.room_type} <span className="text-xs text-muted-foreground">· sleeps {r.occupancy}</span></p>
                        <p className="text-sm text-muted-foreground">
                          {inr(Number(r.rate_inr))}/night{r.net_rate_inr ? ` · net ${inr(Number(r.net_rate_inr))}` : ""} · {MEAL_PLANS.find(m => m.value === r.meal_plan)?.label} · min {r.min_nights} night(s)
                        </p>
                        {(r.valid_from || r.valid_to) && (
                          <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                            <CalendarDays className="w-3 h-3" /> {r.valid_from || "—"} to {r.valid_to || "—"}
                          </p>
                        )}
                        {r.cancellation_policy && <p className="mt-1 text-xs text-muted-foreground">Cancellation: {r.cancellation_policy}</p>}
                        {r.terms && <p className="text-xs text-muted-foreground">Terms: {r.terms}</p>}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs px-2 py-1 rounded-full ${r.is_active ? "bg-emerald-500/10 text-emerald-600" : "bg-secondary text-muted-foreground"}`}>
                          {r.is_active ? "Active" : "Paused"}
                        </span>
                        <Button size="sm" variant="outline" onClick={() => toggleRate(r)}>{r.is_active ? "Pause" : "Activate"}</Button>
                        <Button size="sm" variant="ghost" aria-label="Delete rate plan" onClick={() => removeRate(r.id)}><Trash2 className="w-4 h-4" /></Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-xl bg-card p-6 shadow-card border border-border/60">
                <h3 className="text-lg font-bold text-foreground">Live enquiries & stays</h3>
                {leads.length === 0 ? (
                  <p className="mt-2 text-sm text-muted-foreground">Nothing yet. Enquiries appear here the moment our team sends a guest your way.</p>
                ) : (
                  <div className="mt-4 space-y-3">
                    {leads.map(l => (
                      <div key={l.id} className="rounded-lg bg-secondary/40 p-4 flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <p className="font-semibold text-foreground">{l.guest_name}{l.guest_country ? ` · ${l.guest_country}` : ""}</p>
                          <p className="text-sm text-muted-foreground">
                            {l.check_in ? new Date(l.check_in).toLocaleDateString() : "Dates flexible"} · {l.nights} night(s) · {l.guests} guest(s){l.room_type ? ` · ${l.room_type}` : ""}
                          </p>
                          <p className="text-sm text-muted-foreground">{inr(Number(l.value_inr))} stay value · {inr(Number(l.commission_inr))} commission</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary">{l.status}</span>
                          {l.status === "enquiry" && (
                            <>
                              <Button size="sm" onClick={() => setLeadStatus(l.id, "confirmed")}>Confirm</Button>
                              <Button size="sm" variant="outline" onClick={() => setLeadStatus(l.id, "declined")}>Decline</Button>
                            </>
                          )}
                          {l.status === "confirmed" && (
                            <Button size="sm" variant="outline" onClick={() => setLeadStatus(l.id, "completed")}>Mark stayed</Button>
                          )}
                        </div>
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
