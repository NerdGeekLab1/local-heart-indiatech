import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Award, Camera, Compass, MapPin, Search, Sparkles, Trophy, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { STAMP_CATALOG } from "@/lib/stampsCatalog";

type PublicStamp = { stamp_key: string; tier: string; category: string; earned_at?: string };
type PublicWanderer = {
  id: string;
  full_name: string;
  city: string;
  bio: string | null;
  travel_styles: string[] | null;
  preferred_destinations: string[] | null;
  score: number | null;
  missions_completed: number | null;
  total_videos: number | null;
  badge: string | null;
  avatar_url?: string | null;
  stamps?: PublicStamp[] | null;
  stamp_count?: number | null;
};

const BADGES: Record<string, { emoji: string; label: string; className: string }> = {
  explorer: { emoji: "🧭", label: "Explorer", className: "bg-primary/10 text-primary" },
  trailblazer: { emoji: "🔥", label: "Trailblazer", className: "bg-accent/15 text-accent" },
  pioneer: { emoji: "🚀", label: "Pioneer", className: "bg-destructive/10 text-destructive" },
  legend: { emoji: "👑", label: "Legend", className: "bg-primary text-primary-foreground" },
};

const stampKeys = STAMP_CATALOG.map((stamp) => stamp.key);
const makeDemoStamps = (start: number, count: number): PublicStamp[] =>
  Array.from({ length: count }, (_, index) => ({
    stamp_key: stampKeys[(start + index) % stampKeys.length],
    tier: STAMP_CATALOG[(start + index) % STAMP_CATALOG.length].tier,
    category: STAMP_CATALOG[(start + index) % STAMP_CATALOG.length].category,
  }));

const demoWanderers: PublicWanderer[] = [
  { id: "demo-1", full_name: "Vikram Sharma", city: "Delhi", bio: "Solo traveler and vlogger exploring offbeat trails across the Himalayas.", travel_styles: ["Adventure Seeker", "Vlogger", "Solo Wanderer"], preferred_destinations: ["Ladakh", "Spiti Valley", "Himachal Pradesh"], score: 450, missions_completed: 12, total_videos: 28, badge: "trailblazer", stamps: makeDemoStamps(0, 8), stamp_count: 8 },
  { id: "demo-2", full_name: "Ananya Iyer", city: "Bengaluru", bio: "Cultural photographer documenting India's living heritage.", travel_styles: ["Culture Explorer", "Photographer"], preferred_destinations: ["Rajasthan", "Varanasi", "Kerala"], score: 380, missions_completed: 8, total_videos: 15, badge: "explorer", stamps: makeDemoStamps(5, 5), stamp_count: 5 },
  { id: "demo-3", full_name: "Rahul Desai", city: "Mumbai", bio: "Food traveler on a mission to taste every state in India.", travel_styles: ["Foodie Traveler", "Backpacker"], preferred_destinations: ["Goa", "Kerala", "Northeast India"], score: 520, missions_completed: 15, total_videos: 34, badge: "pioneer", stamps: makeDemoStamps(10, 11), stamp_count: 11 },
  { id: "demo-4", full_name: "Priyanka Nair", city: "Kochi", bio: "Backwater explorer sharing Kerala's hidden stories with the world.", travel_styles: ["Solo Wanderer", "Culture Explorer", "Photographer"], preferred_destinations: ["Kerala", "Andaman Islands"], score: 290, missions_completed: 6, total_videos: 12, badge: "explorer", stamps: makeDemoStamps(15, 4), stamp_count: 4 },
];

const initials = (name: string) => name.split(" ").slice(0, 2).map((part) => part[0]).join("").toUpperCase();
const stampDetails = (stamp: PublicStamp) => STAMP_CATALOG.find((item) => item.key === stamp.stamp_key);

const BetaWanderers = () => {
  const [wanderers, setWanderers] = useState<PublicWanderer[]>(demoWanderers);
  const [search, setSearch] = useState("");

  useEffect(() => {
    supabase.rpc("get_public_wanderers_showcase").then(({ data }) => {
      if (data?.length) setWanderers([...demoWanderers, ...(data as PublicWanderer[])]);
    });
  }, []);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return wanderers;
    return wanderers.filter((wanderer) =>
      [wanderer.full_name, wanderer.city, ...(wanderer.travel_styles || []), ...(wanderer.preferred_destinations || [])]
        .some((value) => value.toLowerCase().includes(term)),
    );
  }, [search, wanderers]);

  const totalVideos = wanderers.reduce((sum, wanderer) => sum + (wanderer.total_videos || 0), 0);
  const totalStamps = wanderers.reduce((sum, wanderer) => sum + Number(wanderer.stamp_count || 0), 0);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 pb-16 pt-20 sm:px-6 lg:px-8">
        <motion.section initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="overflow-hidden rounded-lg border border-border bg-card">
          <div className="grid gap-8 p-6 sm:p-10 lg:grid-cols-[1fr_auto] lg:items-end">
            <div>
              <span className="inline-flex items-center gap-2 text-sm font-semibold text-primary"><Compass className="h-4 w-4" /> RoamYoo field community</span>
              <h1 className="mt-3 max-w-2xl text-3xl font-bold text-foreground sm:text-5xl">Meet the Beta Wanderers</h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">Travel storytellers collecting real experiences, local knowledge, and proof of every adventure.</p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Button asChild className="gap-2"><Link to="/beta-wanderer-apply"><Compass className="h-4 w-4" /> Apply to join</Link></Button>
                <Button asChild variant="outline" className="gap-2"><Link to="/leaderboard"><Trophy className="h-4 w-4" /> Leaderboard</Link></Button>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-5 border-t border-border pt-6 lg:border-l lg:border-t-0 lg:pl-8 lg:pt-0">
              {[{ icon: Users, value: wanderers.length, label: "Wanderers" }, { icon: Camera, value: `${totalVideos}+`, label: "Stories" }, { icon: Award, value: totalStamps, label: "Stamps" }].map((item) => (
                <div key={item.label} className="min-w-16 text-center"><item.icon className="mx-auto h-5 w-5 text-primary" /><p className="mt-1 text-xl font-bold text-foreground">{item.value}</p><p className="text-xs text-muted-foreground">{item.label}</p></div>
              ))}
            </div>
          </div>
        </motion.section>

        <div className="my-7 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div><h2 className="text-xl font-bold text-foreground">Community explorers</h2><p className="text-sm text-muted-foreground">{filtered.length} profiles to discover</p></div>
          <div className="relative w-full sm:w-80"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input aria-label="Search Wanderers" className="pl-10" placeholder="Search name, city, style..." value={search} onChange={(event) => setSearch(event.target.value)} /></div>
        </div>

        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((wanderer, index) => {
            const badge = BADGES[wanderer.badge || "explorer"] || BADGES.explorer;
            const visibleStamps = (wanderer.stamps || []).slice(0, 4);
            return (
              <motion.article key={wanderer.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.035 }} className="group flex h-full flex-col overflow-hidden rounded-lg border border-border bg-card transition-shadow hover:shadow-elevated">
                <div className="h-20 bg-gradient-to-r from-primary/15 via-accent/10 to-secondary" />
                <div className="-mt-10 flex flex-1 flex-col px-5 pb-5">
                  <div className="flex items-end justify-between gap-3">
                    <Avatar className="h-20 w-20 border-4 border-card shadow-card"><AvatarImage src={wanderer.avatar_url || undefined} alt={`${wanderer.full_name}'s display picture`} className="object-cover" /><AvatarFallback className="bg-primary text-xl font-bold text-primary-foreground">{initials(wanderer.full_name)}</AvatarFallback></Avatar>
                    <span className={`mb-1 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold ${badge.className}`}>{badge.emoji} {badge.label}</span>
                  </div>
                  <h3 className="mt-3 text-lg font-bold text-foreground">{wanderer.full_name}</h3>
                  <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground"><MapPin className="h-3.5 w-3.5" /> {wanderer.city}</p>
                  <p className="mt-3 line-clamp-2 min-h-10 text-sm leading-5 text-muted-foreground">{wanderer.bio}</p>
                  <div className="mt-3 flex min-h-6 flex-wrap gap-1.5">{wanderer.travel_styles?.slice(0, 3).map((style) => <span key={style} className="rounded-full bg-secondary px-2 py-1 text-[10px] font-medium text-secondary-foreground">{style}</span>)}</div>

                  <div className="mt-4 rounded-md bg-secondary/50 p-3">
                    <div className="flex items-center justify-between"><p className="flex items-center gap-1.5 text-xs font-semibold text-foreground"><Sparkles className="h-3.5 w-3.5 text-primary" /> Stamp collection</p><span className="text-xs font-bold text-primary">{wanderer.stamp_count || 0}/{STAMP_CATALOG.length}</span></div>
                    <div className="mt-2 flex h-9 items-center gap-1.5">
                      {visibleStamps.length ? visibleStamps.map((stamp) => { const detail = stampDetails(stamp); return <span key={stamp.stamp_key} title={detail?.title || stamp.stamp_key} className="flex h-8 w-8 items-center justify-center rounded-full border border-border bg-card text-base">{detail?.emoji || "🏅"}</span>; }) : <span className="text-xs text-muted-foreground">First stamp is waiting to be earned</span>}
                      {Number(wanderer.stamp_count || 0) > 4 && <span className="text-xs font-semibold text-muted-foreground">+{Number(wanderer.stamp_count) - 4}</span>}
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-3 border-y border-border py-3 text-center">
                    <div><p className="font-bold text-foreground">{wanderer.score || 0}</p><p className="text-[10px] text-muted-foreground">Score</p></div>
                    <div className="border-x border-border"><p className="font-bold text-foreground">{wanderer.missions_completed || 0}</p><p className="text-[10px] text-muted-foreground">Missions</p></div>
                    <div><p className="font-bold text-foreground">{wanderer.total_videos || 0}</p><p className="text-[10px] text-muted-foreground">Videos</p></div>
                  </div>
                  <Button asChild variant="outline" size="sm" className="mt-4 w-full gap-1"><Link to={`/beta-wanderer/${wanderer.id}`}>View profile <ArrowRight className="h-3.5 w-3.5" /></Link></Button>
                </div>
              </motion.article>
            );
          })}
        </section>

        {!filtered.length && <div className="py-16 text-center"><Search className="mx-auto h-8 w-8 text-muted-foreground" /><p className="mt-3 font-semibold text-foreground">No Wanderers found</p><p className="text-sm text-muted-foreground">Try another name, city, or travel style.</p></div>}
      </main>
      <Footer />
    </div>
  );
};

export default BetaWanderers;