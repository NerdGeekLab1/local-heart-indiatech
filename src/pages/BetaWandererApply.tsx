import { useState } from "react";
import { motion } from "framer-motion";
import { Compass, Camera, Video, MapPin, Send, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

const travelStyleOptions = ["Backpacker", "Adventure Seeker", "Culture Explorer", "Foodie Traveler", "Solo Wanderer", "Group Leader", "Photographer", "Vlogger"];
const destinationOptions = ["Ladakh", "Rajasthan", "Kerala", "Goa", "Varanasi", "Himachal Pradesh", "Northeast India", "Andaman Islands", "Rishikesh", "Spiti Valley"];

const BetaWandererApply = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    fullName: "", email: "", phone: "", city: "", bio: "",
    travelStyles: [] as string[], preferredDestinations: [] as string[],
    instagram: "", youtube: "", videoUrl: "",
  });

  const toggleArray = (arr: string[], item: string) =>
    arr.includes(item) ? arr.filter(x => x !== item) : [...arr, item];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) { toast({ title: "Please sign in first", variant: "destructive" }); return; }
    if (!form.fullName || !form.email || !form.city) { toast({ title: "Name, email, and city are required", variant: "destructive" }); return; }
    setSubmitting(true);
    const { error } = await supabase.from("beta_wanderers").insert({
      user_id: user.id, full_name: form.fullName, email: form.email, phone: form.phone || null,
      city: form.city, bio: form.bio || null, travel_styles: form.travelStyles,
      preferred_destinations: form.preferredDestinations,
      social_links: { instagram: form.instagram, youtube: form.youtube },
      video_url: form.videoUrl || null,
    });
    setSubmitting(false);
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    setSubmitted(true);
    toast({ title: "Application submitted! 🎉" });
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-24 pb-16 px-4 max-w-xl mx-auto text-center">
          <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
            <div className="text-6xl mb-4">🎉</div>
            <h1 className="text-3xl font-bold text-foreground">Application Submitted!</h1>
            <p className="text-muted-foreground mt-2">Our team will review your application and get back to you within 48 hours.</p>
            <div className="flex gap-3 justify-center mt-6">
              <Link to="/beta-wanderers"><Button className="rounded-full">View All Wanderers</Button></Link>
              <Link to="/"><Button variant="outline" className="rounded-full">Go Home</Button></Link>
            </div>
          </motion.div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-20 pb-16 px-4 sm:px-6 lg:px-8 mx-auto max-w-3xl">
        <Link to="/beta-wanderers" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="w-4 h-4" /> Back to Wanderers
        </Link>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          {/* Hero */}
          <div className="rounded-2xl bg-gradient-to-br from-primary/10 via-accent/5 to-secondary p-8 text-center mb-8">
            <div className="text-4xl mb-3">🧭</div>
            <h1 className="text-3xl font-bold text-foreground">Become a Beta Wanderer</h1>
            <p className="text-muted-foreground mt-2 max-w-lg mx-auto">
              Travel to unexplored destinations, shoot videos, share feedback, and earn rewards. Be the eyes and ears of the Travelista community!
            </p>
            <div className="flex gap-4 justify-center mt-4">
              {[
                { icon: Camera, label: "Shoot videos" },
                { icon: MapPin, label: "Explore places" },
                { icon: Video, label: "Share feedback" },
              ].map(p => (
                <div key={p.label} className="flex items-center gap-1 text-xs text-muted-foreground">
                  <p.icon className="w-3.5 h-3.5 text-primary" /> {p.label}
                </div>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="rounded-2xl bg-card p-6 shadow-card space-y-4">
              <h2 className="text-lg font-bold text-foreground">Personal Info</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div><label className="text-sm font-medium text-foreground">Full Name *</label><Input className="mt-1" value={form.fullName} onChange={e => setForm(p => ({ ...p, fullName: e.target.value }))} required /></div>
                <div><label className="text-sm font-medium text-foreground">Email *</label><Input type="email" className="mt-1" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} required /></div>
                <div><label className="text-sm font-medium text-foreground">Phone</label><Input className="mt-1" value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} /></div>
                <div><label className="text-sm font-medium text-foreground">City *</label><Input className="mt-1" value={form.city} onChange={e => setForm(p => ({ ...p, city: e.target.value }))} required /></div>
              </div>
              <div><label className="text-sm font-medium text-foreground">Bio</label>
                <textarea className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm min-h-[80px] mt-1"
                  value={form.bio} onChange={e => setForm(p => ({ ...p, bio: e.target.value }))} placeholder="Tell us about your travel experience..." />
              </div>
            </div>

            <div className="rounded-2xl bg-card p-6 shadow-card space-y-4">
              <h2 className="text-lg font-bold text-foreground">Travel Style</h2>
              <div className="flex flex-wrap gap-2">
                {travelStyleOptions.map(s => (
                  <button key={s} type="button" onClick={() => setForm(p => ({ ...p, travelStyles: toggleArray(p.travelStyles, s) }))}
                    className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${form.travelStyles.includes(s) ? "bg-primary text-primary-foreground border-primary" : "bg-secondary text-foreground border-border hover:border-primary"}`}>
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-2xl bg-card p-6 shadow-card space-y-4">
              <h2 className="text-lg font-bold text-foreground">Preferred Destinations</h2>
              <div className="flex flex-wrap gap-2">
                {destinationOptions.map(d => (
                  <button key={d} type="button" onClick={() => setForm(p => ({ ...p, preferredDestinations: toggleArray(p.preferredDestinations, d) }))}
                    className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${form.preferredDestinations.includes(d) ? "bg-accent text-accent-foreground border-accent" : "bg-secondary text-foreground border-border hover:border-accent"}`}>
                    {d}
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-2xl bg-card p-6 shadow-card space-y-4">
              <h2 className="text-lg font-bold text-foreground">Social & Media</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div><label className="text-sm font-medium text-foreground">Instagram Handle</label><Input className="mt-1" value={form.instagram} onChange={e => setForm(p => ({ ...p, instagram: e.target.value }))} placeholder="@yourusername" /></div>
                <div><label className="text-sm font-medium text-foreground">YouTube Channel</label><Input className="mt-1" value={form.youtube} onChange={e => setForm(p => ({ ...p, youtube: e.target.value }))} /></div>
              </div>
              <div><label className="text-sm font-medium text-foreground">Sample Video URL</label><Input className="mt-1" value={form.videoUrl} onChange={e => setForm(p => ({ ...p, videoUrl: e.target.value }))} placeholder="Link to a travel video you've made" /></div>
            </div>

            <Button type="submit" className="w-full rounded-full gap-2 h-12 text-base" disabled={submitting}>
              {submitting ? "Submitting..." : <><Send className="w-4 h-4" /> Submit Application</>}
            </Button>
          </form>
        </motion.div>
      </div>
      <Footer />
    </div>
  );
};

export default BetaWandererApply;
