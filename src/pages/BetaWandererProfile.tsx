import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { MapPin, Camera, Video, Award, Star, Compass, ArrowLeft, Trophy, Target, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";

const demoWanderers: Record<string, any> = {
  "demo-1": { full_name: "Vikram Sharma", city: "Delhi", bio: "Solo traveler & vlogger exploring offbeat trails across the Himalayas. I've been on the road for 3 years, covering over 50,000 km across India.", travel_styles: ["Adventure Seeker", "Vlogger", "Solo Wanderer"], preferred_destinations: ["Ladakh", "Spiti Valley", "Himachal Pradesh"], score: 450, missions_completed: 12, total_videos: 28, badge: "trailblazer", social_links: { instagram: "@vikram_trails", youtube: "VikramTrails" } },
  "demo-2": { full_name: "Ananya Iyer", city: "Bangalore", bio: "Cultural photographer documenting India's living heritage. My lens captures stories that words can't.", travel_styles: ["Culture Explorer", "Photographer"], preferred_destinations: ["Rajasthan", "Varanasi", "Kerala"], score: 380, missions_completed: 8, total_videos: 15, badge: "explorer", social_links: { instagram: "@ananya_captures", youtube: "" } },
  "demo-3": { full_name: "Rahul Desai", city: "Mumbai", bio: "Foodie traveler on a mission to taste every state in India. From street food to royal thalis, I document it all.", travel_styles: ["Foodie Traveler", "Backpacker"], preferred_destinations: ["Goa", "Kerala", "Northeast India"], score: 520, missions_completed: 15, total_videos: 34, badge: "pioneer", social_links: { instagram: "@rahul_eats", youtube: "RahulDesaiFood" } },
  "demo-4": { full_name: "Priyanka Nair", city: "Kochi", bio: "Backwater explorer & ayurveda enthusiast sharing Kerala's hidden secrets with the world.", travel_styles: ["Solo Wanderer", "Culture Explorer", "Photographer"], preferred_destinations: ["Kerala", "Andaman Islands"], score: 290, missions_completed: 6, total_videos: 12, badge: "explorer", social_links: { instagram: "@priyanka_wanders", youtube: "" } },
};

const missions = [
  { title: "Spiti Valley 5-Day Coverage", status: "completed", date: "Jan 2026" },
  { title: "Varanasi Ghat Life Documentary", status: "completed", date: "Dec 2025" },
  { title: "Goa Monsoon Hidden Gems", status: "in_progress", date: "Mar 2026" },
  { title: "Meghalaya Living Root Bridges", status: "upcoming", date: "May 2026" },
];

const BetaWandererProfile = () => {
  const { id } = useParams();
  const [wanderer, setWanderer] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    if (demoWanderers[id]) { setWanderer(demoWanderers[id]); setLoading(false); return; }
    supabase.from("beta_wanderers").select("*").eq("id", id).single()
      .then(({ data }) => { setWanderer(data); setLoading(false); });
  }, [id]);

  if (loading) return <div className="min-h-screen bg-background"><Navbar /><div className="pt-24 text-center text-muted-foreground">Loading...</div></div>;
  if (!wanderer) return <div className="min-h-screen bg-background"><Navbar /><div className="pt-24 text-center text-muted-foreground">Wanderer not found</div></div>;

  const badgeEmojis: Record<string, string> = { explorer: "🧭", trailblazer: "🔥", pioneer: "🚀", legend: "👑" };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-20 pb-16 px-4 sm:px-6 lg:px-8 mx-auto max-w-4xl">
        <Link to="/beta-wanderers" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="w-4 h-4" /> Back to Wanderers
        </Link>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          {/* Hero */}
          <div className="rounded-2xl bg-gradient-to-br from-primary/10 via-accent/5 to-secondary p-8">
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <div className="w-24 h-24 rounded-full bg-primary/20 border-4 border-primary flex items-center justify-center text-3xl font-bold text-primary">
                {wanderer.full_name[0]}
              </div>
              <div className="text-center sm:text-left flex-1">
                <div className="flex items-center gap-2 justify-center sm:justify-start flex-wrap">
                  <h1 className="text-2xl sm:text-3xl font-bold text-foreground">{wanderer.full_name}</h1>
                  <span className="text-xs font-bold px-3 py-1 rounded-full bg-accent text-accent-foreground">
                    {badgeEmojis[wanderer.badge]} {wanderer.badge}
                  </span>
                </div>
                <p className="text-muted-foreground mt-1 flex items-center gap-1 justify-center sm:justify-start"><MapPin className="w-4 h-4" /> {wanderer.city}</p>
                <p className="text-sm text-muted-foreground mt-2">{wanderer.bio}</p>
              </div>
              <div className="text-center shrink-0">
                <div className="w-20 h-20 rounded-full bg-primary/10 border-2 border-primary flex flex-col items-center justify-center">
                  <Trophy className="w-5 h-5 text-primary" />
                  <span className="text-lg font-bold text-primary">{wanderer.score}</span>
                </div>
                <p className="text-[10px] text-muted-foreground mt-1">Wanderer Score</p>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
            {[
              { label: "Score", value: wanderer.score, icon: Trophy },
              { label: "Missions", value: wanderer.missions_completed, icon: Target },
              { label: "Videos", value: wanderer.total_videos, icon: Video },
              { label: "Destinations", value: wanderer.preferred_destinations?.length || 0, icon: MapPin },
            ].map(s => (
              <div key={s.label} className="rounded-xl bg-card p-4 shadow-card text-center">
                <s.icon className="w-5 h-5 text-primary mx-auto mb-1" />
                <p className="text-lg font-bold text-foreground">{s.value}</p>
                <p className="text-[10px] text-muted-foreground">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Travel Styles */}
          <div className="mt-8 rounded-2xl bg-card p-6 shadow-card">
            <h2 className="text-lg font-bold text-foreground mb-3">Travel Style</h2>
            <div className="flex flex-wrap gap-2">
              {wanderer.travel_styles?.map((s: string) => (
                <span key={s} className="text-xs bg-primary/10 text-primary px-3 py-1.5 rounded-full">{s}</span>
              ))}
            </div>
          </div>

          {/* Preferred Destinations */}
          <div className="mt-6 rounded-2xl bg-card p-6 shadow-card">
            <h2 className="text-lg font-bold text-foreground mb-3 flex items-center gap-2"><Globe className="w-5 h-5 text-primary" /> Preferred Destinations</h2>
            <div className="flex flex-wrap gap-2">
              {wanderer.preferred_destinations?.map((d: string) => (
                <span key={d} className="text-xs bg-accent/10 text-accent px-3 py-1.5 rounded-full border border-accent/20">{d}</span>
              ))}
            </div>
          </div>

          {/* Missions */}
          <div className="mt-6 rounded-2xl bg-card p-6 shadow-card">
            <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2"><Target className="w-5 h-5 text-primary" /> Missions</h2>
            <div className="space-y-3">
              {missions.map((m, i) => (
                <div key={i} className="flex items-center gap-3 rounded-lg bg-secondary/50 p-3">
                  <div className={`w-2 h-2 rounded-full ${m.status === "completed" ? "bg-accent" : m.status === "in_progress" ? "bg-primary" : "bg-muted-foreground"}`} />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">{m.title}</p>
                    <p className="text-xs text-muted-foreground">{m.date}</p>
                  </div>
                  <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                    m.status === "completed" ? "bg-accent/10 text-accent" : m.status === "in_progress" ? "bg-primary/10 text-primary" : "bg-secondary text-muted-foreground"
                  }`}>{m.status.replace("_", " ")}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Social */}
          {wanderer.social_links && (
            <div className="mt-6 rounded-2xl bg-card p-6 shadow-card">
              <h2 className="text-lg font-bold text-foreground mb-3">Social</h2>
              <div className="flex gap-4">
                {wanderer.social_links.instagram && <p className="text-sm text-muted-foreground">📸 {wanderer.social_links.instagram}</p>}
                {wanderer.social_links.youtube && <p className="text-sm text-muted-foreground">▶️ {wanderer.social_links.youtube}</p>}
              </div>
            </div>
          )}
        </motion.div>
      </div>
      <Footer />
    </div>
  );
};

export default BetaWandererProfile;
