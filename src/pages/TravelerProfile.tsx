import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { MapPin, Heart, Compass, Calendar, Star, Globe, Camera, Sparkles, Award, Receipt } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

const TravelerProfile = () => {
  const { id } = useParams();
  const [profile, setProfile] = useState<any>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [trips, setTrips] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    (async () => {
      setLoading(true);
      const [{ data: prof }, { data: po }, { data: tr }, { data: rv }] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", id).maybeSingle(),
        supabase.from("feed_posts").select("*").eq("user_id", id).eq("status", "active").order("created_at", { ascending: false }).limit(24),
        supabase.from("trip_listings").select("*").eq("creator_id", id).order("created_at", { ascending: false }).limit(12),
        supabase.from("reviews").select("*").eq("traveler_id", id).order("created_at", { ascending: false }).limit(10),
      ]);
      setProfile(prof);
      setPosts(po || []);
      setTrips(tr || []);
      setReviews(rv || []);
      setLoading(false);
    })();
  }, [id]);

  const name = profile ? `${profile.first_name || ""} ${profile.last_name || ""}`.trim() || "Traveler" : "Traveler";
  const totalLikes = posts.reduce((s, p) => s + (p.likes_count || 0), 0);
  const uniqueDestinations = Array.from(new Set([...posts.map(p => p.location).filter(Boolean), ...trips.map(t => t.destination).filter(Boolean)]));

  if (loading) {
    return (
      <div className="min-h-screen bg-background"><Navbar />
        <div className="pt-24 max-w-5xl mx-auto px-4 space-y-4">
          <Skeleton className="h-48 w-full rounded-3xl" />
          <Skeleton className="h-64 w-full rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-20 pb-24 max-w-5xl mx-auto px-4">
        {/* Hero */}
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary/90 via-orange-500 to-pink-500 text-primary-foreground p-6 sm:p-8 shadow-2xl">
          <div className="absolute -right-16 -top-16 w-64 h-64 rounded-full bg-primary-foreground/10 blur-3xl" />
          <div className="absolute -left-10 bottom-0 w-48 h-48 rounded-full bg-primary-foreground/10 blur-3xl" />
          <div className="relative flex flex-col sm:flex-row gap-6 items-start sm:items-center">
            <div className="p-1 rounded-full bg-gradient-to-tr from-yellow-300 via-pink-300 to-primary-foreground shadow-xl">
              <Avatar className="w-24 h-24 sm:w-28 sm:h-28 ring-4 ring-background">
                <AvatarImage src={profile?.avatar_url || undefined} />
                <AvatarFallback className="text-3xl font-bold bg-background text-foreground">{name.charAt(0)}</AvatarFallback>
              </Avatar>
            </div>
            <div className="flex-1">
              <p className="text-xs uppercase tracking-[0.25em] font-bold opacity-90">Traveler</p>
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">{name}</h1>
              {profile?.bio && <p className="text-sm sm:text-base opacity-95 mt-1 max-w-2xl">{profile.bio}</p>}
              <div className="flex flex-wrap gap-2 mt-3 text-xs font-semibold">
                <span className="px-3 py-1 rounded-full bg-background/25 backdrop-blur">📸 {posts.length} posts</span>
                <span className="px-3 py-1 rounded-full bg-background/25 backdrop-blur flex items-center gap-1"><Heart className="w-3 h-3 fill-current" /> {totalLikes}</span>
                <span className="px-3 py-1 rounded-full bg-background/25 backdrop-blur flex items-center gap-1"><Compass className="w-3 h-3" /> {trips.length} trips</span>
                <span className="px-3 py-1 rounded-full bg-background/25 backdrop-blur flex items-center gap-1"><MapPin className="w-3 h-3" /> {uniqueDestinations.length} places</span>
              </div>
            </div>
            <div className="flex gap-2 sm:flex-col">
              <Link to="/feed"><Button size="sm" variant="secondary" className="rounded-full"><Sparkles className="w-4 h-4 mr-1" /> Feed</Button></Link>
            </div>
          </div>
        </section>

        {/* Trips */}
        <section className="mt-8">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xl font-bold text-foreground flex items-center gap-2"><Compass className="w-5 h-5 text-primary" /> Hosted Trips</h2>
            <span className="text-xs text-muted-foreground">{trips.length} total</span>
          </div>
          {trips.length === 0 ? (
            <p className="text-sm text-muted-foreground bg-card border border-border rounded-2xl p-6 text-center">No trips published yet.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {trips.map(t => (
                <Link to={`/trip/${t.id}`} key={t.id} className="rounded-2xl bg-card border border-border p-4 hover:shadow-lg hover:border-primary/40 transition-all group">
                  <div className="flex items-center gap-2 mb-1">
                    <Calendar className="w-3.5 h-3.5 text-primary" />
                    <span className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">{t.trip_type?.replace("_", " ")}</span>
                  </div>
                  <h3 className="font-bold text-foreground group-hover:text-primary line-clamp-2">{t.title}</h3>
                  <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1"><MapPin className="w-3 h-3" />{t.destination || t.route || "—"}</p>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-sm font-bold text-primary">₹{Number(t.total_price).toLocaleString()}</span>
                    <span className="text-[10px] text-muted-foreground">{t.status}</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* Posts grid */}
        <section className="mt-8">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xl font-bold text-foreground flex items-center gap-2"><Camera className="w-5 h-5 text-primary" /> Recent Posts</h2>
            <Link to="/feed" className="text-xs text-primary font-semibold hover:underline">View on Feed →</Link>
          </div>
          {posts.length === 0 ? (
            <p className="text-sm text-muted-foreground bg-card border border-border rounded-2xl p-6 text-center">No posts shared yet.</p>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {posts.map(p => (
                <div key={p.id} className="relative aspect-square overflow-hidden rounded-xl bg-muted group">
                  {p.media_type === "video" ? (
                    <video src={p.media_url} className="w-full h-full object-cover" muted playsInline />
                  ) : (
                    <img src={p.media_url} alt={p.caption || "post"} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-foreground/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2">
                    <span className="text-[10px] font-bold text-background flex items-center gap-1"><Heart className="w-3 h-3 fill-current" />{p.likes_count}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Reviews */}
        {reviews.length > 0 && (
          <section className="mt-8">
            <h2 className="text-xl font-bold text-foreground mb-3 flex items-center gap-2"><Star className="w-5 h-5 text-primary" /> Reviews Given</h2>
            <div className="space-y-2">
              {reviews.slice(0, 5).map(r => (
                <div key={r.id} className="rounded-xl bg-card border border-border p-3">
                  <div className="flex gap-0.5 mb-1">{Array.from({ length: r.rating }).map((_, i) => <Star key={i} className="w-3 h-3 fill-primary text-primary" />)}</div>
                  <p className="text-sm text-foreground">{r.text}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Destinations chip cloud */}
        {uniqueDestinations.length > 0 && (
          <section className="mt-8">
            <h2 className="text-xl font-bold text-foreground mb-3 flex items-center gap-2"><Globe className="w-5 h-5 text-primary" /> Atlas</h2>
            <div className="flex flex-wrap gap-2">
              {uniqueDestinations.map(d => (
                <span key={d} className="px-3 py-1.5 rounded-full text-xs font-semibold bg-gradient-to-r from-primary/10 to-pink-500/10 text-foreground border border-primary/20">
                  📍 {d}
                </span>
              ))}
            </div>
          </section>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default TravelerProfile;
