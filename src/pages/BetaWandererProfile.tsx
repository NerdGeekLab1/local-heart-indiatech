import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Award, CalendarDays, CheckCircle2, Globe, MapPin, Sparkles, Target, Trophy, Video } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { STAMP_CATALOG, TIER_STYLES, type StampTier } from "@/lib/stampsCatalog";

type PublicStamp = { stamp_key: string; tier: StampTier; category: string; earned_at?: string };
type PublicMission = { id?: string; title: string; description?: string; destination: string; status: string; reward_points?: number; completed_at?: string };

const makeDemoStamps = (start: number, count: number): PublicStamp[] => Array.from({ length: count }, (_, index) => {
  const stamp = STAMP_CATALOG[(start + index) % STAMP_CATALOG.length];
  return { stamp_key: stamp.key, tier: stamp.tier, category: stamp.category };
});

const demoWanderers: Record<string, any> = {
  "demo-1": { full_name: "Vikram Sharma", city: "Delhi", bio: "Solo traveler and vlogger exploring offbeat trails across the Himalayas. I've been on the road for three years, covering over 50,000 km across India.", travel_styles: ["Adventure Seeker", "Vlogger", "Solo Wanderer"], preferred_destinations: ["Ladakh", "Spiti Valley", "Himachal Pradesh"], score: 450, missions_completed: 12, total_videos: 28, badge: "trailblazer", social_links: { instagram: "@vikram_trails", youtube: "VikramTrails" }, stamps: makeDemoStamps(0, 8), stamp_count: 8, missions: [{ title: "Himalayan Homestay Stories", description: "Documented family-run stays and the people preserving mountain hospitality.", destination: "Spiti Valley", status: "completed", reward_points: 250, completed_at: "2026-08-18" }, { title: "Leave No Trace Trail", description: "Led a trail clean-up and published a responsible trekking guide.", destination: "Ladakh", status: "completed", reward_points: 150, completed_at: "2026-07-06" }] },
  "demo-2": { full_name: "Ananya Iyer", city: "Bengaluru", bio: "Cultural photographer documenting India's living heritage. My lens captures stories that words cannot.", travel_styles: ["Culture Explorer", "Photographer"], preferred_destinations: ["Rajasthan", "Varanasi", "Kerala"], score: 380, missions_completed: 8, total_videos: 15, badge: "explorer", social_links: { instagram: "@ananya_captures" }, stamps: makeDemoStamps(5, 5), stamp_count: 5 },
  "demo-3": { full_name: "Rahul Desai", city: "Mumbai", bio: "Food traveler on a mission to taste every state in India, from street kitchens to royal thalis.", travel_styles: ["Foodie Traveler", "Backpacker"], preferred_destinations: ["Goa", "Kerala", "Northeast India"], score: 520, missions_completed: 15, total_videos: 34, badge: "pioneer", social_links: { instagram: "@rahul_eats", youtube: "RahulDesaiFood" }, stamps: makeDemoStamps(10, 11), stamp_count: 11 },
  "demo-4": { full_name: "Priyanka Nair", city: "Kochi", bio: "Backwater explorer and Ayurveda enthusiast sharing Kerala's hidden stories with the world.", travel_styles: ["Solo Wanderer", "Culture Explorer", "Photographer"], preferred_destinations: ["Kerala", "Andaman Islands"], score: 290, missions_completed: 6, total_videos: 12, badge: "explorer", social_links: { instagram: "@priyanka_wanders" }, stamps: makeDemoStamps(15, 4), stamp_count: 4 },
};

const BADGES: Record<string, { emoji: string; label: string }> = { explorer: { emoji: "🧭", label: "Explorer" }, trailblazer: { emoji: "🔥", label: "Trailblazer" }, pioneer: { emoji: "🚀", label: "Pioneer" }, legend: { emoji: "👑", label: "Legend" } };
const initials = (name: string) => name.split(" ").slice(0, 2).map((part) => part[0]).join("").toUpperCase();

const BetaWandererProfile = () => {
  const { id } = useParams();
  const [wanderer, setWanderer] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) { setLoading(false); return; }
    if (demoWanderers[id]) { setWanderer(demoWanderers[id]); setLoading(false); return; }
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) { setLoading(false); return; }
    supabase.rpc("get_public_wanderer_showcase", { _id: id }).then(({ data }) => { setWanderer(data?.[0] || null); setLoading(false); });
  }, [id]);

  if (loading) return <div className="min-h-screen bg-background"><Navbar /><div className="pt-28 text-center text-muted-foreground">Loading Wanderer profile...</div></div>;
  if (!wanderer) return <div className="min-h-screen bg-background"><Navbar /><div className="mx-auto max-w-lg px-4 pt-28 text-center"><p className="text-xl font-bold text-foreground">Wanderer not found</p><Button asChild variant="outline" className="mt-4"><Link to="/beta-wanderers">Back to Wanderers</Link></Button></div></div>;

  const badge = BADGES[wanderer.badge] || BADGES.explorer;
  const stamps: PublicStamp[] = wanderer.stamps || [];
  const missions: PublicMission[] = wanderer.missions || [];
  const collectionPercent = Math.round((Number(wanderer.stamp_count || stamps.length) / STAMP_CATALOG.length) * 100);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="mx-auto max-w-5xl px-4 pb-16 pt-20 sm:px-6 lg:px-8">
        <Button asChild variant="ghost" size="sm" className="mb-4 -ml-3 gap-1"><Link to="/beta-wanderers"><ArrowLeft className="h-4 w-4" /> All Wanderers</Link></Button>

        <motion.section initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="overflow-hidden rounded-lg border border-border bg-card">
          <div className="h-28 bg-gradient-to-r from-primary/20 via-accent/10 to-secondary sm:h-36" />
          <div className="px-5 pb-6 sm:px-8">
            <div className="-mt-14 flex flex-col gap-5 sm:-mt-16 sm:flex-row sm:items-end">
              <Avatar className="h-28 w-28 border-4 border-card shadow-elevated sm:h-32 sm:w-32"><AvatarImage src={wanderer.avatar_url || undefined} alt={`${wanderer.full_name}'s display picture`} className="object-cover" /><AvatarFallback className="bg-primary text-3xl font-bold text-primary-foreground">{initials(wanderer.full_name)}</AvatarFallback></Avatar>
              <div className="flex-1 sm:pb-2"><div className="flex flex-wrap items-center gap-2"><h1 className="text-3xl font-bold text-foreground">{wanderer.full_name}</h1><span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">{badge.emoji} {badge.label}</span></div><p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground"><MapPin className="h-4 w-4" /> {wanderer.city}</p></div>
              <div className="flex items-center gap-3 rounded-md bg-secondary px-4 py-3"><Trophy className="h-6 w-6 text-primary" /><div><p className="text-xl font-bold text-foreground">{wanderer.score || 0}</p><p className="text-[10px] text-muted-foreground">Wanderer score</p></div></div>
            </div>
            <p className="mt-5 max-w-3xl text-sm leading-6 text-muted-foreground sm:text-base">{wanderer.bio}</p>
          </div>
        </motion.section>

        <section className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[{ label: "Score", value: wanderer.score || 0, icon: Trophy }, { label: "Missions", value: wanderer.missions_completed || 0, icon: Target }, { label: "Videos", value: wanderer.total_videos || 0, icon: Video }, { label: "Stamps", value: wanderer.stamp_count || stamps.length, icon: Award }].map((item) => <div key={item.label} className="rounded-lg border border-border bg-card p-4"><item.icon className="h-5 w-5 text-primary" /><p className="mt-3 text-2xl font-bold text-foreground">{item.value}</p><p className="text-xs text-muted-foreground">{item.label}</p></div>)}
        </section>

        <div className="mt-5 grid gap-5 lg:grid-cols-[1.6fr_1fr]">
          <div className="space-y-5"><section className="rounded-lg border border-border bg-card p-5 sm:p-6">
            <div className="flex items-start justify-between gap-4"><div><h2 className="flex items-center gap-2 text-lg font-bold text-foreground"><Sparkles className="h-5 w-5 text-primary" /> Stamp collection</h2><p className="mt-1 text-sm text-muted-foreground">Proof of places explored and experiences completed</p></div><span className="text-sm font-bold text-primary">{wanderer.stamp_count || stamps.length}/{STAMP_CATALOG.length}</span></div>
            <div className="mt-4 h-2 overflow-hidden rounded-full bg-secondary"><motion.div initial={{ width: 0 }} animate={{ width: `${collectionPercent}%` }} transition={{ duration: 0.7 }} className="h-full bg-primary" /></div>
            {stamps.length ? <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">{stamps.map((stamp) => { const detail = STAMP_CATALOG.find((item) => item.key === stamp.stamp_key); const tier = TIER_STYLES[stamp.tier] || TIER_STYLES.bronze; return <div key={stamp.stamp_key} className="rounded-md border border-border bg-secondary/40 p-3 text-center"><div className="text-3xl">{detail?.emoji || "🏅"}</div><p className="mt-2 line-clamp-1 text-xs font-bold text-foreground">{detail?.title || stamp.stamp_key}</p><span className={`mt-2 inline-block rounded-full px-2 py-0.5 text-[9px] font-bold ${tier.bg}`}>{tier.label}</span></div>; })}</div> : <div className="mt-5 rounded-md border border-dashed border-border p-8 text-center"><Award className="mx-auto h-7 w-7 text-muted-foreground" /><p className="mt-2 text-sm text-muted-foreground">The first stamp is waiting to be earned.</p></div>}
          </section>
          <section className="rounded-lg border border-border bg-card p-5 sm:p-6">
            <div className="flex items-start justify-between gap-4"><div><h2 className="flex items-center gap-2 text-lg font-bold text-foreground"><Target className="h-5 w-5 text-primary" /> Completed missions</h2><p className="mt-1 text-sm text-muted-foreground">Field assignments completed for the Wanderer program</p></div><span className="text-sm font-bold text-primary">{missions.length} shown</span></div>
            {missions.length ? <div className="mt-5 space-y-3">{missions.map((mission, index) => <article key={mission.id || `${mission.title}-${index}`} className="rounded-md border border-border bg-secondary/30 p-4"><div className="flex items-start justify-between gap-3"><div><h3 className="font-bold text-foreground">{mission.title}</h3><p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground"><MapPin className="h-3.5 w-3.5" /> {mission.destination}</p></div><span className="inline-flex items-center gap-1 rounded-full bg-accent/10 px-2 py-1 text-[10px] font-bold text-accent"><CheckCircle2 className="h-3 w-3" /> Completed</span></div>{mission.description && <p className="mt-3 text-sm leading-6 text-muted-foreground">{mission.description}</p>}<div className="mt-3 flex flex-wrap gap-3 text-xs text-muted-foreground">{mission.completed_at && <span className="inline-flex items-center gap-1"><CalendarDays className="h-3.5 w-3.5" /> {new Date(mission.completed_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>}{Number(mission.reward_points || 0) > 0 && <span className="font-semibold text-primary">+{mission.reward_points} points</span>}</div></article>)}</div> : <div className="mt-5 rounded-md border border-dashed border-border p-7 text-center"><Target className="mx-auto h-7 w-7 text-muted-foreground" /><p className="mt-2 text-sm text-muted-foreground">Completed mission details will appear here.</p></div>}
          </section></div>

          <div className="space-y-5">
            <section className="rounded-lg border border-border bg-card p-5"><h2 className="text-base font-bold text-foreground">Travel style</h2><div className="mt-3 flex flex-wrap gap-2">{wanderer.travel_styles?.map((style: string) => <span key={style} className="rounded-full bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary">{style}</span>)}</div></section>
            <section className="rounded-lg border border-border bg-card p-5"><h2 className="flex items-center gap-2 text-base font-bold text-foreground"><Globe className="h-4 w-4 text-primary" /> Dream destinations</h2><div className="mt-3 flex flex-wrap gap-2">{wanderer.preferred_destinations?.map((destination: string) => <span key={destination} className="rounded-full border border-border px-3 py-1.5 text-xs text-foreground">{destination}</span>)}</div></section>
            {wanderer.social_links && Object.values(wanderer.social_links).some(Boolean) && <section className="rounded-lg border border-border bg-card p-5"><h2 className="text-base font-bold text-foreground">Follow the journey</h2><div className="mt-3 space-y-2">{wanderer.social_links.instagram && <p className="text-sm text-muted-foreground">📸 {wanderer.social_links.instagram}</p>}{wanderer.social_links.youtube && <p className="text-sm text-muted-foreground">▶️ {wanderer.social_links.youtube}</p>}</div></section>}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default BetaWandererProfile;