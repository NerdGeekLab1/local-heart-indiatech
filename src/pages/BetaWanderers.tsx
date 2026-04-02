import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Compass, MapPin, Camera, Video, Award, Star, Users, Search, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";

const badgeColors: Record<string, string> = {
  explorer: "bg-primary/10 text-primary",
  trailblazer: "bg-accent/10 text-accent",
  pioneer: "bg-destructive/10 text-destructive",
  legend: "bg-primary text-primary-foreground",
};

const badgeEmojis: Record<string, string> = {
  explorer: "🧭", trailblazer: "🔥", pioneer: "🚀", legend: "👑",
};

// Demo wanderers for display
const demoWanderers = [
  { id: "demo-1", full_name: "Vikram Sharma", city: "Delhi", bio: "Solo traveler & vlogger exploring offbeat trails across Himalayas.", travel_styles: ["Adventure Seeker", "Vlogger", "Solo Wanderer"], preferred_destinations: ["Ladakh", "Spiti Valley", "Himachal Pradesh"], score: 450, missions_completed: 12, total_videos: 28, badge: "trailblazer", status: "approved" },
  { id: "demo-2", full_name: "Ananya Iyer", city: "Bangalore", bio: "Cultural photographer documenting India's living heritage.", travel_styles: ["Culture Explorer", "Photographer"], preferred_destinations: ["Rajasthan", "Varanasi", "Kerala"], score: 380, missions_completed: 8, total_videos: 15, badge: "explorer", status: "approved" },
  { id: "demo-3", full_name: "Rahul Desai", city: "Mumbai", bio: "Foodie traveler on a mission to taste every state in India.", travel_styles: ["Foodie Traveler", "Backpacker"], preferred_destinations: ["Goa", "Kerala", "Northeast India"], score: 520, missions_completed: 15, total_videos: 34, badge: "pioneer", status: "approved" },
  { id: "demo-4", full_name: "Priyanka Nair", city: "Kochi", bio: "Backwater explorer & ayurveda enthusiast sharing Kerala secrets.", travel_styles: ["Solo Wanderer", "Culture Explorer", "Photographer"], preferred_destinations: ["Kerala", "Andaman Islands"], score: 290, missions_completed: 6, total_videos: 12, badge: "explorer", status: "approved" },
];

const BetaWanderers = () => {
  const [wanderers, setWanderers] = useState<any[]>(demoWanderers);
  const [search, setSearch] = useState("");

  useEffect(() => {
    supabase.from("beta_wanderers").select("*").eq("status", "approved").order("score", { ascending: false })
      .then(({ data }) => { if (data && data.length > 0) setWanderers([...demoWanderers, ...data]); });
  }, []);

  const filtered = wanderers.filter(w =>
    w.full_name.toLowerCase().includes(search.toLowerCase()) ||
    w.city.toLowerCase().includes(search.toLowerCase()) ||
    w.travel_styles?.some((s: string) => s.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-20 pb-16 px-4 sm:px-6 lg:px-8 mx-auto max-w-6xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          {/* Hero */}
          <div className="rounded-2xl bg-gradient-to-br from-primary/10 via-accent/5 to-secondary p-8 sm:p-12 text-center mb-8">
            <div className="text-5xl mb-4">🧭</div>
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground">Beta Wanderers</h1>
            <p className="text-muted-foreground mt-2 max-w-xl mx-auto">
              Our community explorers travel to new places, create content, and share authentic feedback to help fellow travelers.
            </p>
            <div className="flex gap-6 justify-center mt-6">
              {[
                { icon: Camera, label: "Video Reviews", value: `${wanderers.reduce((s, w) => s + (w.total_videos || 0), 0)}+` },
                { icon: MapPin, label: "Destinations", value: "15+" },
                { icon: Users, label: "Wanderers", value: `${wanderers.length}` },
              ].map(s => (
                <div key={s.label} className="text-center">
                  <s.icon className="w-5 h-5 text-primary mx-auto mb-1" />
                  <p className="text-lg font-bold text-foreground">{s.value}</p>
                  <p className="text-[10px] text-muted-foreground">{s.label}</p>
                </div>
              ))}
            </div>
            <Link to="/beta-wanderer-apply">
              <Button className="mt-6 rounded-full gap-2 px-8">
                <Compass className="w-4 h-4" /> Apply to Join
              </Button>
            </Link>
          </div>

          {/* Search */}
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input className="pl-10" placeholder="Search by name, city, or travel style..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>

          {/* Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((w, i) => (
              <motion.div key={w.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                className="rounded-xl bg-card shadow-card overflow-hidden hover:shadow-elevated transition-shadow group">
                <div className="h-2 bg-gradient-to-r from-primary via-accent to-primary" />
                <div className="p-5">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-lg font-bold text-primary">
                      {w.full_name[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-foreground truncate">{w.full_name}</h3>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${badgeColors[w.badge] || badgeColors.explorer}`}>
                          {badgeEmojis[w.badge] || "🧭"} {w.badge}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground flex items-center gap-1"><MapPin className="w-3 h-3" /> {w.city}</p>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mt-3 line-clamp-2">{w.bio}</p>
                  <div className="flex flex-wrap gap-1 mt-3">
                    {w.travel_styles?.slice(0, 3).map((s: string) => (
                      <span key={s} className="text-[10px] bg-secondary text-foreground px-2 py-0.5 rounded-full">{s}</span>
                    ))}
                  </div>
                  <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-border text-center">
                    <div><p className="text-sm font-bold text-foreground">{w.score}</p><p className="text-[10px] text-muted-foreground">Score</p></div>
                    <div><p className="text-sm font-bold text-foreground">{w.missions_completed}</p><p className="text-[10px] text-muted-foreground">Missions</p></div>
                    <div><p className="text-sm font-bold text-foreground">{w.total_videos}</p><p className="text-[10px] text-muted-foreground">Videos</p></div>
                  </div>
                  <Link to={`/beta-wanderer/${w.id}`}>
                    <Button variant="outline" size="sm" className="w-full mt-4 rounded-full text-xs gap-1">
                      View Profile <ArrowRight className="w-3 h-3" />
                    </Button>
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
      <Footer />
    </div>
  );
};

export default BetaWanderers;
