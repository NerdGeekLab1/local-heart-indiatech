import { useState } from "react";
import { motion } from "framer-motion";
import {
  Flame, Gift, Calendar, MapPin, Star, Lock, CheckCircle, Trophy,
  ArrowRight, Sparkles, Zap, Target, TrendingUp, Plane
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { cn } from "@/lib/utils";

const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const streakData = [
  { month: "Jan", completed: true, dest: "Jaipur" },
  { month: "Feb", completed: true, dest: "Varanasi" },
  { month: "Mar", completed: true, dest: "Goa" },
  { month: "Apr", completed: true, dest: "Rishikesh" },
  { month: "May", completed: true, dest: "Manali" },
  { month: "Jun", completed: false, dest: null },
  { month: "Jul", completed: false, dest: null },
  { month: "Aug", completed: false, dest: null },
  { month: "Sep", completed: false, dest: null },
  { month: "Oct", completed: false, dest: null },
  { month: "Nov", completed: false, dest: null },
  { month: "Dec", completed: false, dest: null },
];

const aiSuggestions = [
  { dest: "Udaipur", reason: "You love heritage walks — the City of Lakes awaits", match: 95, img: "🏰", month: "Jun" },
  { dest: "Spiti Valley", reason: "Based on your adventure preference", match: 91, img: "🏔️", month: "Jul" },
  { dest: "Hampi", reason: "History buff? Ancient ruins + bouldering!", match: 88, img: "🏛️", month: "Aug" },
  { dest: "Meghalaya", reason: "Monsoon magic — living root bridges", match: 85, img: "🌿", month: "Sep" },
  { dest: "Rann of Kutch", reason: "Unique landscapes for your feed", match: 82, img: "🌅", month: "Oct" },
  { dest: "Coorg", reason: "Coffee plantations & misty hills", match: 79, img: "☕", month: "Nov" },
  { dest: "Andaman", reason: "Beach finale for your epic year!", match: 96, img: "🏝️", month: "Dec" },
];

const badges = [
  { name: "Explorer", icon: "🧭", desc: "Complete 3 trips", unlocked: true },
  { name: "Adventurer", icon: "⛰️", desc: "Complete 5 trips", unlocked: true },
  { name: "Wanderer", icon: "🌍", desc: "Visit 5 unique cities", unlocked: false },
  { name: "Legend", icon: "👑", desc: "11-month streak", unlocked: false },
  { name: "Free Spirit", icon: "🦋", desc: "Claim your free trip", unlocked: false },
];

const Rewards = () => {
  const [activeTab, setActiveTab] = useState<"streak" | "calendar" | "badges">("streak");
  const currentStreak = streakData.filter(s => s.completed).length;
  const progress = (currentStreak / 11) * 100;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-20 pb-24 lg:pb-12">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          {/* Hero */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-1.5 rounded-full text-sm font-medium mb-4">
              <Flame className="w-4 h-4" /> Travel Streak Challenge
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-2">
              Trip Every Month. <span className="text-primary">12th is Free!</span>
            </h1>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Travel 11 months in a row and earn your 12th trip completely free. Track your streak, unlock badges, and discover AI-curated destinations.
            </p>
          </motion.div>

          {/* Streak Progress Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-card rounded-2xl border border-border p-6 mb-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Flame className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h2 className="font-bold text-lg">{currentStreak}-Month Streak</h2>
                  <p className="text-sm text-muted-foreground">{11 - currentStreak} more for your free trip!</p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-3xl font-bold text-primary">{currentStreak}</span>
                <span className="text-lg text-muted-foreground">/11</span>
              </div>
            </div>
            <Progress value={progress} className="h-3 mb-4" />

            {/* Month Streak Visualizer */}
            <div className="grid grid-cols-6 sm:grid-cols-12 gap-2">
              {streakData.map((s, i) => (
                <div key={i} className="flex flex-col items-center gap-1">
                  <div className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold transition-all",
                    s.completed
                      ? "bg-primary text-primary-foreground shadow-md"
                      : i === currentStreak
                        ? "bg-primary/20 text-primary border-2 border-primary border-dashed animate-pulse"
                        : "bg-muted text-muted-foreground"
                  )}>
                    {s.completed ? <CheckCircle className="w-5 h-5" /> : i === 11 ? <Gift className="w-5 h-5" /> : <Lock className="w-4 h-4" />}
                  </div>
                  <span className="text-[10px] font-medium text-muted-foreground">{s.month}</span>
                  {s.dest && <span className="text-[8px] text-primary truncate w-12 text-center">{s.dest}</span>}
                </div>
              ))}
            </div>

            {/* Free trip indicator */}
            <div className="mt-4 p-3 rounded-xl bg-gradient-to-r from-primary/5 to-chart-3/5 border border-primary/10 flex items-center gap-3">
              <Gift className="w-5 h-5 text-primary shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium">12th Month = <span className="text-primary font-bold">FREE Trip!</span></p>
                <p className="text-xs text-muted-foreground">Complete 11 monthly trips to unlock a complimentary experience worth up to ₹25,000</p>
              </div>
              <Trophy className="w-8 h-8 text-chart-4 opacity-50" />
            </div>
          </motion.div>

          {/* Tabs */}
          <div className="flex gap-2 mb-6">
            {([
              { id: "streak", label: "AI Planner", icon: Sparkles },
              { id: "calendar", label: "Travel Calendar", icon: Calendar },
              { id: "badges", label: "Badges", icon: Trophy },
            ] as const).map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                  activeTab === tab.id
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                )}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>

          {/* AI Destination Suggestions */}
          {activeTab === "streak" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-5 h-5 text-primary" />
                <h3 className="font-semibold text-lg">AI-Curated Destinations For You</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Based on your travel history, preferences, and seasonal trends — here's your perfect year plan.
              </p>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {aiSuggestions.map((s, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="bg-card rounded-xl border border-border p-4 hover:shadow-md transition-shadow group"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{s.img}</span>
                        <div>
                          <h4 className="font-semibold">{s.dest}</h4>
                          <span className="text-[10px] bg-muted px-2 py-0.5 rounded-full text-muted-foreground">{s.month}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 text-xs">
                        <Target className="w-3 h-3 text-chart-3" />
                        <span className="font-bold text-chart-3">{s.match}%</span>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground mb-3">{s.reason}</p>
                    <Button size="sm" variant="outline" className="w-full text-xs rounded-lg group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                      <Plane className="w-3 h-3 mr-1" /> Plan This Trip
                    </Button>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Travel Calendar */}
          {activeTab === "calendar" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary" /> Your 2026 Travel Calendar
              </h3>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {streakData.map((s, i) => (
                  <div key={i} className={cn(
                    "rounded-xl border p-4 transition-all",
                    s.completed
                      ? "bg-primary/5 border-primary/20"
                      : i === currentStreak
                        ? "border-primary/40 border-dashed bg-primary/5"
                        : "bg-card border-border"
                  )}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold">{months[i]} 2026</span>
                      {s.completed ? (
                        <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" /> Completed
                        </span>
                      ) : i === currentStreak ? (
                        <span className="text-[10px] bg-chart-4/10 text-chart-4 px-2 py-0.5 rounded-full font-medium animate-pulse">
                          Book Now
                        </span>
                      ) : i === 11 ? (
                        <span className="text-[10px] bg-chart-3/10 text-chart-3 px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
                          <Gift className="w-3 h-3" /> FREE
                        </span>
                      ) : (
                        <span className="text-[10px] text-muted-foreground">Upcoming</span>
                      )}
                    </div>
                    {s.dest ? (
                      <div className="flex items-center gap-1.5 text-sm">
                        <MapPin className="w-3.5 h-3.5 text-primary" />
                        <span className="font-medium">{s.dest}</span>
                      </div>
                    ) : i === currentStreak ? (
                      <Button size="sm" className="w-full mt-1 text-xs rounded-lg">
                        <ArrowRight className="w-3 h-3 mr-1" /> Find Your Next Trip
                      </Button>
                    ) : (
                      <p className="text-xs text-muted-foreground">Plan your {months[i]} adventure</p>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Badges */}
          {activeTab === "badges" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                <Trophy className="w-5 h-5 text-primary" /> Achievement Badges
              </h3>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {badges.map((b, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.05 }}
                    className={cn(
                      "rounded-xl border p-5 text-center transition-all",
                      b.unlocked ? "bg-card border-primary/20" : "bg-muted/30 border-border opacity-60"
                    )}
                  >
                    <span className="text-4xl block mb-2">{b.icon}</span>
                    <h4 className="font-bold">{b.name}</h4>
                    <p className="text-xs text-muted-foreground mt-1">{b.desc}</p>
                    {b.unlocked ? (
                      <span className="inline-flex items-center gap-1 mt-2 text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                        <CheckCircle className="w-3 h-3" /> Unlocked
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 mt-2 text-[10px] bg-muted text-muted-foreground px-2 py-0.5 rounded-full">
                        <Lock className="w-3 h-3" /> Locked
                      </span>
                    )}
                  </motion.div>
                ))}
              </div>

              {/* Reward Tiers */}
              <div className="mt-8 bg-card rounded-xl border border-border p-6">
                <h4 className="font-semibold mb-4 flex items-center gap-2">
                  <Zap className="w-4 h-4 text-primary" /> Reward Milestones
                </h4>
                <div className="space-y-3">
                  {[
                    { streak: 3, reward: "₹500 discount on next booking", done: true },
                    { streak: 5, reward: "Free experience upgrade (worth ₹2,000)", done: true },
                    { streak: 7, reward: "Priority booking + ₹3,000 credit", done: false },
                    { streak: 9, reward: "VIP host access + ₹5,000 credit", done: false },
                    { streak: 11, reward: "🎉 12th trip completely FREE (up to ₹25,000)", done: false },
                  ].map((m, i) => (
                    <div key={i} className={cn(
                      "flex items-center gap-3 p-3 rounded-lg",
                      m.done ? "bg-primary/5" : "bg-muted/30"
                    )}>
                      <div className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold",
                        m.done ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                      )}>
                        {m.streak}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{m.streak}-Month Streak</p>
                        <p className="text-xs text-muted-foreground">{m.reward}</p>
                      </div>
                      {m.done ? <CheckCircle className="w-4 h-4 text-primary" /> : <Lock className="w-4 h-4 text-muted-foreground" />}
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Rewards;
