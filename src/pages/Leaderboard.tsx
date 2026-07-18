import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Trophy, Medal, Star, TrendingUp, Award, Crown, Flame, Target, Video, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";

const demoLeaderboard = [
  { id: "demo-3", full_name: "Rahul Desai", city: "Mumbai", score: 520, missions_completed: 15, total_videos: 34, badge: "pioneer", weeklyScore: 120, monthlyScore: 520 },
  { id: "demo-1", full_name: "Vikram Sharma", city: "Delhi", score: 450, missions_completed: 12, total_videos: 28, badge: "trailblazer", weeklyScore: 85, monthlyScore: 450 },
  { id: "demo-2", full_name: "Ananya Iyer", city: "Bangalore", score: 380, missions_completed: 8, total_videos: 15, badge: "explorer", weeklyScore: 65, monthlyScore: 380 },
  { id: "demo-4", full_name: "Priyanka Nair", city: "Kochi", score: 290, missions_completed: 6, total_videos: 12, badge: "explorer", weeklyScore: 45, monthlyScore: 290 },
  { id: "demo-5", full_name: "Arjun Patel", city: "Ahmedabad", score: 210, missions_completed: 5, total_videos: 9, badge: "explorer", weeklyScore: 30, monthlyScore: 210 },
];

const badgeColors: Record<string, string> = {
  explorer: "bg-primary/10 text-primary",
  trailblazer: "bg-accent/10 text-accent",
  pioneer: "bg-destructive/10 text-destructive",
  legend: "bg-primary text-primary-foreground",
};

const podiumColors = ["from-yellow-400 to-amber-500", "from-gray-300 to-gray-400", "from-orange-400 to-orange-600"];
const podiumIcons = [Crown, Medal, Award];

const rewards = [
  { tier: "Legend", minScore: 1000, perks: ["₹5,000 travel credit", "Exclusive badge", "Featured on homepage", "Priority missions"], icon: Crown, color: "text-yellow-500" },
  { tier: "Pioneer", minScore: 500, perks: ["₹2,000 travel credit", "Pioneer badge", "Early access to trips"], icon: Flame, color: "text-destructive" },
  { tier: "Trailblazer", minScore: 250, perks: ["₹500 travel credit", "Trailblazer badge", "Community shoutout"], icon: TrendingUp, color: "text-accent" },
  { tier: "Explorer", minScore: 0, perks: ["Explorer badge", "Leaderboard visibility"], icon: Target, color: "text-primary" },
];

const Leaderboard = () => {
  const [wanderers, setWanderers] = useState(demoLeaderboard);
  const [period, setPeriod] = useState("all");

  useEffect(() => {
    supabase.from("beta_wanderers").select("*").eq("status", "approved").order("score", { ascending: false })
      .then(({ data }) => {
        if (data && data.length > 0) {
          const merged = [...demoLeaderboard, ...data.map(d => ({ ...d, weeklyScore: Math.floor((d.score || 0) * 0.2), monthlyScore: d.score || 0 }))];
          merged.sort((a, b) => (b.score || 0) - (a.score || 0));
          setWanderers(merged);
        }
      });
  }, []);

  const sorted = [...wanderers].sort((a, b) => {
    if (period === "weekly") return (b.weeklyScore || 0) - (a.weeklyScore || 0);
    if (period === "monthly") return (b.monthlyScore || 0) - (a.monthlyScore || 0);
    return (b.score || 0) - (a.score || 0);
  });

  const getScore = (w: any) => period === "weekly" ? w.weeklyScore : period === "monthly" ? w.monthlyScore : w.score;
  const top3 = sorted.slice(0, 3);
  const rest = sorted.slice(3);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-20 pb-16 px-4 sm:px-6 lg:px-8 mx-auto max-w-5xl">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-1.5 rounded-full text-sm font-medium mb-4">
            <Trophy className="w-4 h-4" /> Leaderboard
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground">Top Wanderers</h1>
          <p className="text-muted-foreground mt-2">Recognizing our most active community explorers</p>
        </motion.div>

        {/* Period Filter */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex bg-secondary rounded-full p-1 gap-1">
            {[{ key: "all", label: "All Time" }, { key: "monthly", label: "This Month" }, { key: "weekly", label: "This Week" }].map(p => (
              <button key={p.key} onClick={() => setPeriod(p.key)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${period === p.key ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>
                {p.label}
              </button>
            ))}
          </div>
        </div>

        <Tabs defaultValue="rankings" className="space-y-6">
          <TabsList className="w-full max-w-md mx-auto grid grid-cols-2">
            <TabsTrigger value="rankings">Rankings</TabsTrigger>
            <TabsTrigger value="rewards">Rewards Tiers</TabsTrigger>
          </TabsList>

          <TabsContent value="rankings">
            {/* Podium */}
            <div className="flex items-end justify-center gap-3 mb-8">
              {[1, 0, 2].map(idx => {
                const w = top3[idx];
                if (!w) return null;
                const Icon = podiumIcons[idx];
                const height = idx === 0 ? "h-36" : idx === 1 ? "h-28" : "h-24";
                return (
                  <motion.div key={w.id} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.15 }}
                    className="flex flex-col items-center">
                    <div className="w-14 h-14 rounded-full bg-primary/20 flex items-center justify-center text-xl font-bold text-primary mb-2 ring-2 ring-primary/30">
                      {w.full_name[0]}
                    </div>
                    <p className="text-sm font-bold text-foreground truncate max-w-[100px]">{w.full_name}</p>
                    <p className="text-xs text-muted-foreground">{getScore(w)} pts</p>
                    <div className={`${height} w-24 rounded-t-xl bg-gradient-to-b ${podiumColors[idx]} mt-2 flex items-start justify-center pt-3`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="bg-card border border-border rounded-b-lg w-24 py-1 text-center text-xs font-bold text-foreground">
                      #{idx + 1}
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Rest of rankings */}
            <div className="space-y-2">
              {rest.map((w, i) => (
                <motion.div key={w.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                  className="flex items-center gap-4 bg-card rounded-xl p-4 shadow-card hover:shadow-card-hover transition-shadow">
                  <span className="text-lg font-bold text-muted-foreground w-8 text-center">#{i + 4}</span>
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">{w.full_name[0]}</div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-foreground truncate">{w.full_name}</p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1"><MapPin className="w-3 h-3" />{w.city}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-bold text-foreground">{getScore(w)}</p>
                    <p className="text-[10px] text-muted-foreground">points</p>
                  </div>
                  <div className="hidden sm:flex gap-3 text-center">
                    <div><p className="text-xs font-bold text-foreground">{w.missions_completed}</p><p className="text-[10px] text-muted-foreground">Missions</p></div>
                    <div><p className="text-xs font-bold text-foreground">{w.total_videos}</p><p className="text-[10px] text-muted-foreground">Videos</p></div>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${badgeColors[w.badge] || badgeColors.explorer}`}>{w.badge}</span>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="rewards">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {rewards.map((r, i) => (
                <motion.div key={r.tier} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                  className="bg-card rounded-xl p-6 shadow-card border border-border">
                  <div className="flex items-center gap-3 mb-4">
                    <r.icon className={`w-8 h-8 ${r.color}`} />
                    <div>
                      <h3 className="text-lg font-bold text-foreground">{r.tier}</h3>
                      <p className="text-xs text-muted-foreground">{r.minScore}+ points required</p>
                    </div>
                  </div>
                  <ul className="space-y-2">
                    {r.perks.map(p => (
                      <li key={p} className="flex items-center gap-2 text-sm text-foreground">
                        <Star className="w-3 h-3 text-primary flex-shrink-0" /> {p}
                      </li>
                    ))}
                  </ul>
                </motion.div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
      <Footer />
    </div>
  );
};

export default Leaderboard;
