import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Globe, Shield, Sparkles, Trophy, Users, Clock, Check, Lock, Flame, ArrowRight } from "lucide-react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";

const LANGS = ["English", "Hindi", "French", "German", "Spanish", "Japanese", "Mandarin", "Italian", "Russian", "Arabic"];
const SPECIALTIES = ["Cultural", "Spiritual", "Adventure", "Culinary", "Wellness", "Wildlife", "Heritage", "Festival"];
const COUNTRIES = ["USA", "UK", "Germany", "France", "Japan", "Australia", "Canada", "Israel", "Spain", "Italy", "Netherlands", "Brazil"];

const schema = z.object({
  full_name: z.string().trim().min(2).max(100),
  email: z.string().trim().email().max(255),
  phone: z.string().trim().max(20).optional().or(z.literal("")),
  city: z.string().trim().min(2).max(80),
  english_proficiency: z.enum(["basic", "conversational", "fluent", "native"]),
  years_hosting: z.number().min(0).max(50),
  foreign_guests_hosted: z.number().min(0).max(10000),
  emergency_contact: z.string().trim().max(120).optional().or(z.literal("")),
  references_count: z.number().min(0).max(100),
  why_host: z.string().trim().min(20).max(800),
});

type Status = "pending" | "under_review" | "approved" | "waitlisted" | "rejected";

interface Existing {
  id: string;
  status: Status;
  eligibility_score: number;
  waitlist_position: number | null;
}

const calcScore = (f: any) => {
  let s = 0;
  if (f.has_kyc) s += 20;
  if (f.has_passport) s += 10;
  if (f.cultural_training) s += 15;
  s += Math.min(20, (f.languages?.length || 0) * 5);
  s += Math.min(15, Number(f.years_hosting || 0) * 3);
  s += Math.min(10, Number(f.foreign_guests_hosted || 0));
  s += Math.min(10, Number(f.references_count || 0) * 2);
  const prof: Record<string, number> = { basic: 0, conversational: 5, fluent: 10, native: 15 };
  s += prof[f.english_proficiency] ?? 0;
  return Math.min(100, s);
};

const HostEligibility = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [existing, setExisting] = useState<Existing | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [waitlistCount, setWaitlistCount] = useState<number>(0);
  const [approvedCount, setApprovedCount] = useState<number>(0);

  const [form, setForm] = useState({
    full_name: "", email: "", phone: "", city: "",
    country_focus: [] as string[], languages: [] as string[],
    english_proficiency: "conversational" as "basic"|"conversational"|"fluent"|"native",
    years_hosting: 0, foreign_guests_hosted: 0,
    has_passport: false, has_kyc: false, cultural_training: false,
    emergency_contact: "", references_count: 0,
    hosting_specialties: [] as string[], why_host: "",
  });

  const score = useMemo(() => calcScore(form), [form]);
  const tier = score >= 80 ? "Elite" : score >= 60 ? "Verified" : score >= 40 ? "Aspiring" : "Newcomer";

  useEffect(() => {
    (async () => {
      const [{ data: mine }, { count: wl }, { count: ap }] = await Promise.all([
        user ? supabase.from("host_eligibility").select("id, status, eligibility_score, waitlist_position").eq("user_id", user.id).maybeSingle() : Promise.resolve({ data: null } as any),
        supabase.from("host_eligibility").select("*", { count: "exact", head: true }).in("status", ["pending", "under_review", "waitlisted"]),
        supabase.from("host_eligibility").select("*", { count: "exact", head: true }).eq("status", "approved"),
      ]);
      if (mine) setExisting(mine as Existing);
      setWaitlistCount(wl ?? 0);
      setApprovedCount(ap ?? 0);
      setLoading(false);
    })();
  }, [user]);

  const toggleArr = (key: keyof typeof form, val: string) => {
    const arr = form[key] as string[];
    setForm({ ...form, [key]: arr.includes(val) ? arr.filter(x => x !== val) : [...arr, val] });
  };

  const submit = async () => {
    if (!user) { toast({ title: "Please sign in first", variant: "destructive" }); return; }
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      toast({ title: "Check your inputs", description: parsed.error.issues[0]?.message, variant: "destructive" });
      return;
    }
    setSubmitting(true);
    const eligibility_score = calcScore(form);
    const status: Status = eligibility_score >= 70 ? "under_review" : "waitlisted";
    const waitlist_position = status === "waitlisted" ? waitlistCount + 1 : null;
    const { error } = await supabase.from("host_eligibility").insert({
      user_id: user.id, ...form, eligibility_score, status, waitlist_position,
    });
    setSubmitting(false);
    if (error) { toast({ title: "Submission failed", description: error.message, variant: "destructive" }); return; }
    setExisting({ id: "new", status, eligibility_score, waitlist_position });
    toast({ title: status === "under_review" ? "🎉 You qualify for fast-track review!" : `You're #${waitlist_position} on the waitlist`, description: "We'll notify you as spots open." });
  };

  if (loading) return <div className="min-h-screen bg-background"><Navbar /><div className="pt-32 text-center text-muted-foreground">Loading...</div></div>;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 mx-auto max-w-5xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
          <Badge className="mb-4 bg-primary/10 text-primary border-primary/20 gap-1.5"><Globe className="w-3 h-3" /> Global Host Program</Badge>
          <h1 className="text-4xl sm:text-5xl font-bold text-foreground tracking-tight">Host Foreign Travelers</h1>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">An exclusive, vetted program for India's most credible hosts. Earn 3x more, build international reputation.</p>
          <div className="mt-6 flex justify-center gap-3 flex-wrap">
            <div className="rounded-full border border-border bg-card px-4 py-2 text-sm flex items-center gap-2"><Flame className="w-4 h-4 text-primary" /> <span className="font-semibold text-foreground">{waitlistCount}</span><span className="text-muted-foreground">on waitlist</span></div>
            <div className="rounded-full border border-border bg-card px-4 py-2 text-sm flex items-center gap-2"><Check className="w-4 h-4 text-accent" /> <span className="font-semibold text-foreground">{approvedCount}</span><span className="text-muted-foreground">approved hosts</span></div>
            <div className="rounded-full border border-border bg-card px-4 py-2 text-sm flex items-center gap-2"><Clock className="w-4 h-4 text-muted-foreground" /> <span className="text-muted-foreground">Cohort closes in</span><span className="font-semibold text-foreground">14 days</span></div>
          </div>
        </motion.div>

        {existing && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
            <Card className="border-primary/30 bg-gradient-to-br from-primary/5 to-accent/5">
              <CardHeader>
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <CardTitle className="flex items-center gap-2"><Shield className="w-5 h-5 text-primary" /> Your Application</CardTitle>
                    <CardDescription>Status: <span className="font-semibold uppercase tracking-wide">{existing.status.replace("_", " ")}</span></CardDescription>
                  </div>
                  <Badge variant="outline" className="text-base px-3 py-1.5">Score: {existing.eligibility_score}/100</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <Progress value={existing.eligibility_score} className="h-3" />
                {existing.waitlist_position && (
                  <p className="mt-4 text-sm text-foreground">You're <span className="font-bold text-primary">#{existing.waitlist_position}</span> in line. Refer 3 hosts to jump 10 spots → <Link to="/referrals" className="underline">Referrals</Link></p>
                )}
                {existing.status === "approved" && <p className="mt-4 text-sm text-accent font-medium">✓ Approved — your "Globally Verified" badge is live.</p>}
              </CardContent>
            </Card>
          </motion.div>
        )}

        {!existing && (
          <div className="grid sm:grid-cols-3 gap-4 mb-10">
            {[
              { icon: Trophy, title: "3x Earnings", desc: "Foreign guests pay premium rates for trusted hosts" },
              { icon: Users, title: "Global Network", desc: "Featured to travelers from 40+ countries" },
              { icon: Sparkles, title: "Verified Badge", desc: "Stand out with the 'Globally Verified' mark" },
            ].map((b, i) => (
              <motion.div key={b.title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                <Card className="h-full hover:shadow-card-hover transition-shadow">
                  <CardContent className="pt-6">
                    <b.icon className="w-8 h-8 text-primary mb-3" />
                    <h3 className="font-semibold text-foreground">{b.title}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{b.desc}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}

        {!existing && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Eligibility Check</CardTitle>
              <CardDescription>Be honest — our team verifies every claim. Score 70+ for fast-track review.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-foreground">Live Eligibility Score</span>
                  <Badge className="bg-primary text-primary-foreground">{tier} · {score}/100</Badge>
                </div>
                <Progress value={score} className="h-2" />
                <p className="text-xs text-muted-foreground mt-2">{score >= 70 ? "🚀 You'll be fast-tracked for review" : `${70 - score} more points to skip the waitlist`}</p>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium block mb-1">Full Name *</label>
                  <Input value={form.full_name} onChange={e => setForm({ ...form, full_name: e.target.value })} maxLength={100} />
                </div>
                <div>
                  <label className="text-sm font-medium block mb-1">Email *</label>
                  <Input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} maxLength={255} />
                </div>
                <div>
                  <label className="text-sm font-medium block mb-1">Phone</label>
                  <Input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} maxLength={20} />
                </div>
                <div>
                  <label className="text-sm font-medium block mb-1">City *</label>
                  <Input value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} maxLength={80} />
                </div>
                <div>
                  <label className="text-sm font-medium block mb-1">English Proficiency *</label>
                  <Select value={form.english_proficiency} onValueChange={(v: any) => setForm({ ...form, english_proficiency: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="basic">Basic</SelectItem>
                      <SelectItem value="conversational">Conversational</SelectItem>
                      <SelectItem value="fluent">Fluent</SelectItem>
                      <SelectItem value="native">Native</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium block mb-1">Years Hosting</label>
                  <Input type="number" min={0} max={50} value={form.years_hosting} onChange={e => setForm({ ...form, years_hosting: Number(e.target.value) })} />
                </div>
                <div>
                  <label className="text-sm font-medium block mb-1">Foreign Guests Hosted</label>
                  <Input type="number" min={0} value={form.foreign_guests_hosted} onChange={e => setForm({ ...form, foreign_guests_hosted: Number(e.target.value) })} />
                </div>
                <div>
                  <label className="text-sm font-medium block mb-1">Verified References</label>
                  <Input type="number" min={0} value={form.references_count} onChange={e => setForm({ ...form, references_count: Number(e.target.value) })} />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium block mb-2">Languages (5pts each, max 20)</label>
                <div className="flex flex-wrap gap-2">
                  {LANGS.map(l => (
                    <button key={l} onClick={() => toggleArr("languages", l)} className={`rounded-full px-3 py-1.5 text-xs font-medium transition-all ${form.languages.includes(l) ? "bg-primary text-primary-foreground" : "bg-secondary hover:bg-secondary/80"}`}>{l}</button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium block mb-2">Target Countries</label>
                <div className="flex flex-wrap gap-2">
                  {COUNTRIES.map(c => (
                    <button key={c} onClick={() => toggleArr("country_focus", c)} className={`rounded-full px-3 py-1.5 text-xs font-medium transition-all ${form.country_focus.includes(c) ? "bg-primary text-primary-foreground" : "bg-secondary hover:bg-secondary/80"}`}>{c}</button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium block mb-2">Hosting Specialties</label>
                <div className="flex flex-wrap gap-2">
                  {SPECIALTIES.map(s => (
                    <button key={s} onClick={() => toggleArr("hosting_specialties", s)} className={`rounded-full px-3 py-1.5 text-xs font-medium transition-all ${form.hosting_specialties.includes(s) ? "bg-primary text-primary-foreground" : "bg-secondary hover:bg-secondary/80"}`}>{s}</button>
                  ))}
                </div>
              </div>

              <div className="space-y-3 rounded-lg border border-border p-4 bg-secondary/30">
                <p className="text-sm font-medium text-foreground">Credibility checks</p>
                {[
                  { k: "has_kyc", label: "KYC verified (Aadhaar/PAN)", pts: 20 },
                  { k: "has_passport", label: "Valid passport on file", pts: 10 },
                  { k: "cultural_training", label: "Completed cultural sensitivity training", pts: 15 },
                ].map(c => (
                  <label key={c.k} className="flex items-center gap-3 cursor-pointer">
                    <Checkbox checked={(form as any)[c.k]} onCheckedChange={(v) => setForm({ ...form, [c.k]: !!v })} />
                    <span className="text-sm flex-1">{c.label}</span>
                    <Badge variant="outline" className="text-xs">+{c.pts}</Badge>
                  </label>
                ))}
              </div>

              <div>
                <label className="text-sm font-medium block mb-1">Emergency Contact</label>
                <Input value={form.emergency_contact} onChange={e => setForm({ ...form, emergency_contact: e.target.value })} placeholder="Name & phone" maxLength={120} />
              </div>

              <div>
                <label className="text-sm font-medium block mb-1">Why host foreign travelers? *</label>
                <Textarea value={form.why_host} onChange={e => setForm({ ...form, why_host: e.target.value })} rows={4} maxLength={800} placeholder="Min 20 chars — share what makes you uniquely qualified..." />
                <p className="text-xs text-muted-foreground mt-1">{form.why_host.length}/800</p>
              </div>

              <div className="flex items-center justify-between flex-wrap gap-3 pt-2">
                <p className="text-xs text-muted-foreground flex items-center gap-1.5"><Lock className="w-3 h-3" /> Verified by our trust team within 48 hours</p>
                <Button onClick={submit} disabled={submitting || !user} size="lg" className="rounded-full gap-2">
                  {submitting ? "Submitting..." : score >= 70 ? "Apply for Fast-Track" : "Join Waitlist"} <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
              {!user && <p className="text-xs text-destructive text-right">Sign in to submit your application.</p>}
            </CardContent>
          </Card>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default HostEligibility;
