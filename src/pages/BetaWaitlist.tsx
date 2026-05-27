import { useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, Check, Mail, Compass, Gem, Crown } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const PLANS = [
  { id: "explorer", name: "Explorer", price: "₹499", icon: Compass, perks: ["Priority booking", "5% off", "Beta Wanderer access"] },
  { id: "adventurer", name: "Adventurer", price: "₹999", icon: Gem, perks: ["10% off", "Free cancellation", "Priority support"] },
  { id: "nomad", name: "Nomad", price: "₹1,999", icon: Crown, perks: ["20% off", "VIP access", "Free 12th trip", "Concierge"] },
];

export default function BetaWaitlist() {
  const { toast } = useToast();
  const [form, setForm] = useState({ email: "", full_name: "", city: "", interest: "", plan_interest: "explorer", referral_source: "" });
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const { error } = await supabase.functions.invoke("beta-waitlist", {
      body: { action: "join", ...form, origin: window.location.origin },
    });
    if (error) {
      toast({ title: "Couldn't join waitlist", description: error.message, variant: "destructive" });
      setSubmitting(false);
      return;
    }
    setDone(true);
    setSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-16 max-w-5xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-6">
            <Sparkles className="w-4 h-4" /> <span className="text-sm font-medium">Early access · Public beta</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-4">Be first to wander with Travelista</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">Join the waitlist to unlock founding-member pricing, exclusive Beta Wanderer missions, and curated India experiences.</p>
        </motion.div>

        <section className="grid md:grid-cols-3 gap-4 mb-12">
          {PLANS.map((p) => (
            <div key={p.id} className="rounded-2xl border bg-card p-6">
              <div className="flex items-center gap-3 mb-3"><p.icon className="w-5 h-5 text-primary" /><h3 className="font-semibold">{p.name}</h3></div>
              <p className="text-3xl font-bold mb-4">{p.price}<span className="text-sm font-normal text-muted-foreground">/mo</span></p>
              <ul className="space-y-2 text-sm">{p.perks.map(x => <li key={x} className="flex gap-2"><Check className="w-4 h-4 text-primary shrink-0 mt-0.5" />{x}</li>)}</ul>
            </div>
          ))}
        </section>

        <section className="rounded-2xl border bg-card p-8 max-w-2xl mx-auto">
          {done ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 rounded-full bg-primary/10 text-primary inline-flex items-center justify-center mb-4"><Mail className="w-8 h-8" /></div>
              <h2 className="text-2xl font-bold mb-2">You're on the list!</h2>
              <p className="text-muted-foreground">Check your inbox for a confirmation email. We'll reach out as beta spots open.</p>
            </div>
          ) : (
            <form onSubmit={submit} className="space-y-4">
              <h2 className="text-2xl font-bold mb-2">Reserve your spot</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div><Label>Full name</Label><Input required value={form.full_name} onChange={e => setForm({ ...form, full_name: e.target.value })} /></div>
                <div><Label>Email</Label><Input required type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} /></div>
                <div><Label>City</Label><Input value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} /></div>
                <div>
                  <Label>Interested plan</Label>
                  <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm" value={form.plan_interest} onChange={e => setForm({ ...form, plan_interest: e.target.value })}>
                    {PLANS.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>
              </div>
              <div><Label>What kind of travel excites you?</Label><Textarea rows={3} value={form.interest} onChange={e => setForm({ ...form, interest: e.target.value })} /></div>
              <div><Label>How did you hear about us?</Label><Input value={form.referral_source} onChange={e => setForm({ ...form, referral_source: e.target.value })} /></div>
              <Button type="submit" disabled={submitting} className="w-full" size="lg">{submitting ? "Joining..." : "Join the waitlist"}</Button>
            </form>
          )}
        </section>
      </main>
      <Footer />
    </div>
  );
}
