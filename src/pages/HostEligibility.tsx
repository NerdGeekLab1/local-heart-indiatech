import { useEffect, useMemo, useRef, useState } from "react";
import { motion, useAnimation, AnimatePresence } from "framer-motion";
import { Globe, Shield, Sparkles, Trophy, Users, Clock, Check, Lock, Flame, ArrowRight, Instagram, Linkedin, Youtube, Facebook, Twitter, Link2, AlertTriangle, PartyPopper } from "lucide-react";
import { z } from "zod";
import confetti from "canvas-confetti";
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

const SOCIAL_FIELDS = [
  { key: "instagram", label: "Instagram", icon: Instagram, placeholder: "https://instagram.com/yourhandle" },
  { key: "linkedin", label: "LinkedIn", icon: Linkedin, placeholder: "https://linkedin.com/in/yourname" },
  { key: "youtube", label: "YouTube", icon: Youtube, placeholder: "https://youtube.com/@yourchannel" },
  { key: "facebook", label: "Facebook", icon: Facebook, placeholder: "https://facebook.com/yourpage" },
  { key: "twitter", label: "X / Twitter", icon: Twitter, placeholder: "https://x.com/yourhandle" },
  { key: "website", label: "Website / Blog", icon: Link2, placeholder: "https://yoursite.com" },
] as const;

// Gamified questionnaire — 12 scenarios measuring cultural fit, hospitality, judgement
const QUESTIONS = [
  { q: "A foreign guest is uncomfortable eating spicy food. You:", options: [
    { t: "Insist they try authentic flavors", p: 0 },
    { t: "Offer a milder version and explain ingredients", p: 10 },
    { t: "Take them to a Western chain instead", p: 3 },
  ]},
  { q: "Your guest wants to photograph a local temple ceremony. You:", options: [
    { t: "Let them — it's a free country", p: 0 },
    { t: "Politely ask the priest first and explain etiquette", p: 10 },
    { t: "Refuse outright", p: 2 },
  ]},
  { q: "A guest falls sick at 2 AM. Your first action:", options: [
    { t: "Wait until morning — clinics are closed", p: 0 },
    { t: "Call my partner-doctor and arrange transport", p: 10 },
    { t: "Give them home remedies and hope", p: 3 },
  ]},
  { q: "Guest requests vegan food in a non-vegan household. You:", options: [
    { t: "Tell them to eat what's served", p: 0 },
    { t: "Pre-plan a vegan menu with local produce", p: 10 },
    { t: "Order delivery every meal", p: 4 },
  ]},
  { q: "Your female solo traveler feels unsafe walking alone. You:", options: [
    { t: "Tell her India is safe, don't worry", p: 0 },
    { t: "Walk with her or arrange a vetted driver", p: 10 },
    { t: "Cancel her outing", p: 4 },
  ]},
  { q: "Best response to a negative review:", options: [
    { t: "Argue publicly", p: 0 },
    { t: "Apologize, learn, offer to make it right", p: 10 },
    { t: "Ignore it", p: 3 },
  ]},
  { q: "A guest offers a generous tip in cash. You:", options: [
    { t: "Accept silently and pocket it", p: 5 },
    { t: "Thank them and declare it for transparency", p: 10 },
    { t: "Refuse and feel insulted", p: 4 },
  ]},
  { q: "A guest accidentally offends a local custom. You:", options: [
    { t: "Embarrass them publicly so they learn", p: 0 },
    { t: "Quietly explain later and smooth it over", p: 10 },
    { t: "Pretend nothing happened", p: 4 },
  ]},
  { q: "Heavy monsoon ruins your planned itinerary. You:", options: [
    { t: "Refund partially and send them home", p: 3 },
    { t: "Pivot to indoor cultural experiences instantly", p: 10 },
    { t: "Stick to the plan anyway", p: 0 },
  ]},
  { q: "A guest asks about your country's politics. You:", options: [
    { t: "Push my personal opinions strongly", p: 2 },
    { t: "Share balanced context and listen", p: 10 },
    { t: "Refuse to discuss anything", p: 5 },
  ]},
  { q: "An LGBTQ+ couple books your homestay. You:", options: [
    { t: "Decline politely citing family", p: 0 },
    { t: "Welcome them like any other guests", p: 10 },
    { t: "Accept but assign separate rooms", p: 2 },
  ]},
  { q: "A guest leaves valuables in your home. You:", options: [
    { t: "Keep quiet — finders keepers", p: 0 },
    { t: "Photograph, secure, and return immediately", p: 10 },
    { t: "Ship later when convenient", p: 5 },
  ]},
];

const shuffle = <T,>(arr: T[]): T[] => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

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

const urlOk = (s: string) => !s || /^https?:\/\/.+\..+/i.test(s.trim());

type Status = "pending" | "under_review" | "approved" | "waitlisted" | "rejected";

interface Existing {
  id: string;
  status: Status;
  eligibility_score: number;
  waitlist_position: number | null;
  questionnaire_score?: number;
  social_score?: number;
  badge?: string;
}

const calcSocialScore = (links: Record<string, string>) => {
  const filled = SOCIAL_FIELDS.filter(f => urlOk(links[f.key] || "") && (links[f.key] || "").trim().length > 0).length;
  return Math.min(15, filled * 3);
};

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
  s += calcSocialScore(f.social_links || {});
  return Math.min(100, s);
};

const badgeFor = (total: number) =>
  total >= 80 ? "elite" : total >= 60 ? "verified" : total >= 40 ? "aspiring" : "newcomer";

const fireConfetti = () => {
  const end = Date.now() + 1200;
  const colors = ["#F59E0B", "#EF4444", "#10B981", "#FCD34D"];
  (function frame() {
    confetti({ particleCount: 4, angle: 60, spread: 70, origin: { x: 0 }, colors });
    confetti({ particleCount: 4, angle: 120, spread: 70, origin: { x: 1 }, colors });
    if (Date.now() < end) requestAnimationFrame(frame);
  })();
};

const HostEligibility = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [existing, setExisting] = useState<Existing | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [waitlistCount, setWaitlistCount] = useState<number>(0);
  const [approvedCount, setApprovedCount] = useState<number>(0);
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({});
  const [quizResult, setQuizResult] = useState<{ score: number; passed: boolean } | null>(null);
  const [quizOrder, setQuizOrder] = useState<number[]>([]);
  const [optionOrders, setOptionOrders] = useState<Record<number, number[]>>({});
  const [step, setStep] = useState(0);
  const quizControls = useAnimation();
  const resultRef = useRef<HTMLDivElement>(null);
  const quizRef = useRef<HTMLDivElement>(null);

  const openQuiz = () => {
    const order = shuffle(QUESTIONS.map((_, i) => i));
    const opts: Record<number, number[]> = {};
    order.forEach(qi => { opts[qi] = shuffle(QUESTIONS[qi].options.map((_, i) => i)); });
    setQuizOrder(order);
    setOptionOrders(opts);
    setStep(0);
    setQuizAnswers({});
    setQuizResult(null);
    setShowQuiz(true);
    setTimeout(() => quizRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
  };

  const [form, setForm] = useState({
    full_name: "", email: "", phone: "", city: "",
    country_focus: [] as string[], languages: [] as string[],
    english_proficiency: "conversational" as "basic"|"conversational"|"fluent"|"native",
    years_hosting: 0, foreign_guests_hosted: 0,
    has_passport: false, has_kyc: false, cultural_training: false,
    emergency_contact: "", references_count: 0,
    hosting_specialties: [] as string[], why_host: "",
    social_links: {} as Record<string, string>,
  });

  const score = useMemo(() => calcScore(form), [form]);
  const tier = score >= 80 ? "Elite" : score >= 60 ? "Verified" : score >= 40 ? "Aspiring" : "Newcomer";
  const socialScore = useMemo(() => calcSocialScore(form.social_links), [form.social_links]);

  useEffect(() => {
    (async () => {
      const [{ data: mine }, { count: wl }, { count: ap }] = await Promise.all([
        user ? supabase.from("host_eligibility").select("id, status, eligibility_score, waitlist_position, questionnaire_score, social_score, badge").eq("user_id", user.id).maybeSingle() : Promise.resolve({ data: null } as any),
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

  const updateSocial = (k: string, v: string) =>
    setForm({ ...form, social_links: { ...form.social_links, [k]: v } });

  const submit = async () => {
    if (!user) { toast({ title: "Please sign in first", variant: "destructive" }); return; }
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      toast({ title: "Check your inputs", description: parsed.error.issues[0]?.message, variant: "destructive" });
      return;
    }
    for (const f of SOCIAL_FIELDS) {
      const v = form.social_links[f.key];
      if (v && !urlOk(v)) {
        toast({ title: `Invalid ${f.label} URL`, description: "Use a full https:// link", variant: "destructive" });
        return;
      }
    }
    setSubmitting(true);
    const eligibility_score = calcScore(form);
    const social_score = calcSocialScore(form.social_links);
    const status: Status = eligibility_score >= 70 ? "under_review" : "waitlisted";
    const waitlist_position = status === "waitlisted" ? waitlistCount + 1 : null;
    const badge = badgeFor(eligibility_score);
    const { data, error } = await supabase.from("host_eligibility").insert({
      user_id: user.id, ...form, eligibility_score, social_score, badge, status, waitlist_position,
    }).select("id").single();
    setSubmitting(false);
    if (error) { toast({ title: "Submission failed", description: error.message, variant: "destructive" }); return; }
    setExisting({ id: data!.id, status, eligibility_score, waitlist_position, social_score, badge });
    toast({ title: status === "under_review" ? "🎉 You qualify for fast-track review!" : `You're #${waitlist_position} on the waitlist`, description: "Now take the credibility quiz to boost your score." });
    setTimeout(() => openQuiz(), 600);
  };

  const handleAnswer = (qi: number, oi: number) => {
    if (quizResult) return;
    setQuizAnswers(prev => ({ ...prev, [qi]: oi }));
    if (step < quizOrder.length - 1) {
      setTimeout(() => setStep(s => s + 1), 350);
    }
  };

  const submitQuiz = async () => {
    if (Object.keys(quizAnswers).length < quizOrder.length) {
      toast({ title: "Answer every question", variant: "destructive" });
      quizControls.start({ x: [0, -10, 10, -8, 8, -4, 4, 0], transition: { duration: 0.5 } });
      return;
    }
    const total = quizOrder.reduce((acc, qi) => acc + (QUESTIONS[qi].options[quizAnswers[qi]]?.p ?? 0), 0);
    const max = quizOrder.length * 10;
    const pct = Math.round((total / max) * 100);
    const passed = pct >= 70;

    if (existing?.id && existing.id !== "new") {
      const newTotal = Math.min(100, (existing.eligibility_score || 0) + Math.floor(pct / 10));
      const newBadge = badgeFor(newTotal);
      await supabase.from("host_eligibility").update({
        questionnaire_score: pct,
        questionnaire_answers: quizAnswers,
        eligibility_score: newTotal,
        badge: newBadge,
      }).eq("id", existing.id);
      setExisting({ ...existing, eligibility_score: newTotal, questionnaire_score: pct, badge: newBadge });
    }

    setQuizResult({ score: pct, passed });
    if (passed) {
      fireConfetti();
      setTimeout(() => fireConfetti(), 500);
      setTimeout(() => fireConfetti(), 1100);
    } else {
      quizControls.start({ x: [0, -16, 16, -12, 12, -6, 6, 0], transition: { duration: 0.6 } });
    }
    setTimeout(() => resultRef.current?.scrollIntoView({ behavior: "smooth", block: "center" }), 100);
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
                    <CardDescription>Status: <span className="font-semibold uppercase tracking-wide">{existing.status.replace("_", " ")}</span> · Badge: <span className="font-semibold capitalize">{existing.badge ?? badgeFor(existing.eligibility_score)}</span></CardDescription>
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
                {!existing.questionnaire_score && (
                  <Button onClick={openQuiz} className="mt-4 rounded-full gap-2" size="sm">
                    <Sparkles className="w-4 h-4" /> Take the Credibility Quiz
                  </Button>
                )}
                {!!existing.questionnaire_score && (
                  <p className="mt-4 text-sm text-muted-foreground">Quiz score: <span className="font-semibold text-foreground">{existing.questionnaire_score}%</span></p>
                )}
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

              {/* Social proof */}
              <div className="rounded-lg border border-border p-4 bg-secondary/30">
                <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                  <div>
                    <p className="text-sm font-medium text-foreground">Social proof (optional)</p>
                    <p className="text-xs text-muted-foreground">3 pts per verified link · max 15 pts. Helps us trust you faster.</p>
                  </div>
                  <Badge variant="outline" className="text-xs">Social score: {socialScore}/15</Badge>
                </div>
                <div className="grid sm:grid-cols-2 gap-3">
                  {SOCIAL_FIELDS.map(f => (
                    <div key={f.key} className="flex items-center gap-2">
                      <f.icon className="w-4 h-4 text-muted-foreground shrink-0" />
                      <Input
                        value={form.social_links[f.key] || ""}
                        onChange={e => updateSocial(f.key, e.target.value)}
                        placeholder={f.placeholder}
                        maxLength={300}
                        className={form.social_links[f.key] && !urlOk(form.social_links[f.key]) ? "border-destructive" : ""}
                      />
                    </div>
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
                  {submitting ? "Submitting..." : "Submit Application"} <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
              {!user && <p className="text-xs text-destructive text-right">Sign in to submit your application.</p>}
            </CardContent>
          </Card>
        )}

        {/* Gamified post-waitlist quiz */}
        {showQuiz && (
          <motion.div ref={quizRef} animate={quizControls} className="mt-10">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
            <Card className="border-accent/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Sparkles className="w-5 h-5 text-accent" /> Credibility Quiz</CardTitle>
                <CardDescription>7 quick scenarios. Score 70%+ to unlock the <strong>Globally Verified</strong> badge and jump the waitlist.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {QUESTIONS.map((q, i) => (
                  <div key={i} className="space-y-2">
                    <p className="text-sm font-medium text-foreground"><span className="text-primary">Q{i + 1}.</span> {q.q}</p>
                    <div className="grid gap-2">
                      {q.options.map((opt, j) => {
                        const selected = quizAnswers[i] === j;
                        return (
                          <button
                            key={j}
                            onClick={() => !quizResult && setQuizAnswers({ ...quizAnswers, [i]: j })}
                            disabled={!!quizResult}
                            className={`text-left text-sm rounded-lg border px-3 py-2 transition-all ${selected ? "border-primary bg-primary/10" : "border-border hover:border-primary/40"}`}
                          >
                            {opt.t}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}

                {!quizResult && (
                  <Button onClick={submitQuiz} size="lg" className="rounded-full w-full gap-2">
                    <Trophy className="w-4 h-4" /> Submit Quiz
                  </Button>
                )}

                {quizResult && (
                  <motion.div
                    ref={resultRef}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className={`rounded-xl p-6 text-center ${quizResult.passed ? "bg-gradient-to-br from-accent/15 to-primary/15 border border-accent/30" : "bg-destructive/10 border border-destructive/30"}`}
                  >
                    {quizResult.passed ? (
                      <>
                        <PartyPopper className="w-12 h-12 text-accent mx-auto mb-2" />
                        <h3 className="text-2xl font-bold text-foreground">Congratulations! 🎉</h3>
                        <p className="text-muted-foreground mt-1">You scored <strong>{quizResult.score}%</strong>. Your credibility has been boosted.</p>
                        <Badge className="mt-4 bg-accent text-accent-foreground text-sm px-4 py-1.5">Globally Verified</Badge>
                      </>
                    ) : (
                      <>
                        <AlertTriangle className="w-12 h-12 text-destructive mx-auto mb-2" />
                        <h3 className="text-2xl font-bold text-foreground">Not eligible yet</h3>
                        <p className="text-muted-foreground mt-1">You scored <strong>{quizResult.score}%</strong>. Improve your social score, complete cultural training, then retake.</p>
                        <Button asChild variant="outline" className="mt-4 rounded-full">
                          <Link to="/resources">Improve Your Score</Link>
                        </Button>
                      </>
                    )}
                    <div className="mt-6 pt-6 border-t border-border/50 text-left max-w-md mx-auto">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-foreground">Final Eligibility Score</span>
                        <Badge className="bg-primary text-primary-foreground">{badgeFor(existing?.eligibility_score ?? score)} · {existing?.eligibility_score ?? score}/100</Badge>
                      </div>
                      <Progress value={existing?.eligibility_score ?? score} className="h-2" />
                    </div>
                  </motion.div>
                )}
              </CardContent>
            </Card>
            </motion.div>
          </motion.div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default HostEligibility;
