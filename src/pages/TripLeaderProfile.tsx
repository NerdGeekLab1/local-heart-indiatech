import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { MapPin, Star, Users, Compass, Trophy, Camera, Clock, ArrowLeft, Award, TrendingUp, Calendar, Shield, Bike, Car } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { useCurrency } from "@/contexts/CurrencyContext";

const badges = [
  { name: "Road Warrior", emoji: "🏍️", desc: "Led 10+ bike trips" },
  { name: "Explorer", emoji: "🧭", desc: "Covered 5+ destinations" },
  { name: "5-Star Leader", emoji: "⭐", desc: "Average rating 4.8+" },
  { name: "Community Fav", emoji: "❤️", desc: "100+ travelers hosted" },
];

const pastTripsMock = [
  { title: "Ladakh Bike Expedition", destination: "Leh, Ladakh", date: "Feb 2026", travelers: 8, rating: 4.9, image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400" },
  { title: "Rajasthan Heritage Tour", destination: "Jaipur → Jodhpur", date: "Dec 2025", travelers: 6, rating: 4.8, image: "https://images.unsplash.com/photo-1477587458883-47145ed94245?w=400" },
  { title: "Goa Coastal Ride", destination: "Goa", date: "Oct 2025", travelers: 10, rating: 4.7, image: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=400" },
  { title: "Kerala Backwater Trail", destination: "Alleppey → Munnar", date: "Aug 2025", travelers: 5, rating: 4.9, image: "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=400" },
];

const highlights = [
  { name: "Khardung La Pass", emoji: "🏔️" },
  { name: "Pangong Lake", emoji: "🏞️" },
  { name: "Thar Desert", emoji: "🏜️" },
  { name: "Dudhsagar Falls", emoji: "💧" },
  { name: "Munnar Tea Gardens", emoji: "🍵" },
  { name: "Fort Aguada", emoji: "🏰" },
];

const TripLeaderProfile = () => {
  const { id } = useParams();
  const { format } = useCurrency();
  const [profile, setProfile] = useState<any>(null);
  const [trips, setTrips] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      if (!id) return;
      const [{ data: prof }, { data: trps }] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", id).single(),
        supabase.from("trip_listings").select("*").eq("creator_id", id).eq("status", "active").order("created_at", { ascending: false }),
      ]);
      setProfile(prof);
      setTrips(trps || []);
      setLoading(false);
    };
    fetch();
  }, [id]);

  if (loading) return <div className="min-h-screen bg-background"><Navbar /><div className="pt-24 text-center text-muted-foreground">Loading...</div></div>;

  const totalTravelers = pastTripsMock.reduce((s, t) => s + t.travelers, 0);
  const avgRating = (pastTripsMock.reduce((s, t) => s + t.rating, 0) / pastTripsMock.length).toFixed(1);
  const leaderScore = Math.round(Number(avgRating) * 20 + pastTripsMock.length * 5 + totalTravelers);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-20 px-4 sm:px-6 lg:px-8 mx-auto max-w-5xl pb-16">
        <Link to="/trips" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="w-4 h-4" /> Back to Trips
        </Link>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          {/* Hero */}
          <div className="relative rounded-2xl bg-gradient-to-br from-primary/10 via-accent/5 to-secondary overflow-hidden p-8">
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <div className="w-24 h-24 rounded-full bg-primary/20 border-4 border-primary flex items-center justify-center text-3xl font-bold text-primary">
                {profile?.first_name?.[0] || "T"}
              </div>
              <div className="text-center sm:text-left flex-1">
                <div className="flex items-center gap-2 justify-center sm:justify-start flex-wrap">
                  <h1 className="text-2xl sm:text-3xl font-bold text-foreground">{profile?.first_name || "Trip Leader"} {profile?.last_name || ""}</h1>
                  <span className="text-xs font-bold px-3 py-1 rounded-full bg-primary text-primary-foreground flex items-center gap-1"><Compass className="w-3 h-3" /> Trip Leader</span>
                </div>
                <p className="text-muted-foreground mt-1">{profile?.bio || "Leading adventures across India"}</p>
                <div className="flex items-center gap-4 mt-3 justify-center sm:justify-start flex-wrap">
                  {profile?.travel_styles?.map((s: string) => (
                    <span key={s} className="text-xs bg-secondary text-foreground px-2 py-0.5 rounded-full">{s}</span>
                  ))}
                </div>
              </div>
              <div className="text-center shrink-0">
                <div className="w-20 h-20 rounded-full bg-accent/10 border-2 border-accent flex flex-col items-center justify-center">
                  <Trophy className="w-5 h-5 text-accent" />
                  <span className="text-lg font-bold text-accent">{leaderScore}</span>
                </div>
                <p className="text-[10px] text-muted-foreground mt-1">Leader Score</p>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mt-6">
            {[
              { label: "Trips Led", value: pastTripsMock.length + trips.length, icon: Compass },
              { label: "Travelers", value: totalTravelers + "+", icon: Users },
              { label: "Avg Rating", value: avgRating, icon: Star },
              { label: "Destinations", value: "6+", icon: MapPin },
              { label: "Leader Score", value: leaderScore, icon: Trophy },
            ].map(s => (
              <div key={s.label} className="rounded-xl bg-card p-4 shadow-card text-center">
                <s.icon className="w-5 h-5 text-primary mx-auto mb-1" />
                <p className="text-lg font-bold text-foreground">{s.value}</p>
                <p className="text-[10px] text-muted-foreground">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Badges */}
          <div className="mt-8">
            <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2"><Award className="w-5 h-5 text-primary" /> Achievements</h2>
            <div className="flex gap-3 overflow-x-auto pb-2">
              {badges.map(b => (
                <div key={b.name} className="shrink-0 w-32 rounded-xl bg-card p-4 shadow-card text-center hover:shadow-elevated transition-shadow">
                  <span className="text-2xl">{b.emoji}</span>
                  <p className="text-xs font-bold text-foreground mt-2">{b.name}</p>
                  <p className="text-[10px] text-muted-foreground mt-1">{b.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Highlight Reels */}
          <div className="mt-8">
            <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2"><Camera className="w-5 h-5 text-primary" /> Top Highlights</h2>
            <div className="flex gap-3 overflow-x-auto pb-2">
              {highlights.map(h => (
                <motion.div key={h.name} whileHover={{ scale: 1.05 }}
                  className="shrink-0 w-24 aspect-[9/16] rounded-2xl bg-gradient-to-br from-primary/20 to-accent/10 flex flex-col items-center justify-center cursor-pointer">
                  <span className="text-2xl mb-1">{h.emoji}</span>
                  <p className="text-[10px] font-bold text-foreground text-center px-1 leading-tight">{h.name}</p>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Past Trips */}
          <div className="mt-8">
            <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2"><Clock className="w-5 h-5 text-primary" /> Past Trips</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {pastTripsMock.map((t, i) => (
                <motion.div key={i} whileHover={{ y: -4 }} className="rounded-xl bg-card shadow-card overflow-hidden group">
                  <div className="aspect-video relative overflow-hidden">
                    <img src={t.image} alt={t.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                    <div className="absolute top-2 right-2 flex items-center gap-1 bg-background/80 backdrop-blur-sm rounded-full px-2 py-0.5">
                      <Star className="w-3 h-3 fill-primary text-primary" />
                      <span className="text-xs font-bold text-foreground">{t.rating}</span>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-foreground">{t.title}</h3>
                    <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1"><MapPin className="w-3 h-3" /> {t.destination}</p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-muted-foreground flex items-center gap-1"><Calendar className="w-3 h-3" /> {t.date}</span>
                      <span className="text-xs text-muted-foreground flex items-center gap-1"><Users className="w-3 h-3" /> {t.travelers} joined</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Active Trips */}
          {trips.length > 0 && (
            <div className="mt-8">
              <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2"><TrendingUp className="w-5 h-5 text-primary" /> Active Trips</h2>
              <div className="space-y-3">
                {trips.map(t => (
                  <Link to={`/trip/${t.id}`} key={t.id}>
                    <div className="rounded-xl bg-card p-5 shadow-card hover:shadow-elevated transition-shadow flex justify-between items-center">
                      <div>
                        <h3 className="font-bold text-foreground">{t.title}</h3>
                        <p className="text-xs text-muted-foreground mt-1">{t.destination} · {format(t.total_price)} · {t.duration || "Flexible"}</p>
                      </div>
                      <Button size="sm" className="rounded-full text-xs">View Trip</Button>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Reviews */}
          <div className="mt-8">
            <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2"><Star className="w-5 h-5 text-primary" /> Traveler Reviews</h2>
            <div className="space-y-3">
              {[
                { name: "Sarah M.", country: "USA", rating: 5, text: "Incredible trip leader! Made Ladakh absolutely magical. Every detail was perfectly planned.", date: "Feb 2026" },
                { name: "Thomas K.", country: "Germany", rating: 5, text: "Best road trip I've ever been on. The group was amazing and the leader knew every hidden gem.", date: "Dec 2025" },
                { name: "Aiko T.", country: "Japan", rating: 4, text: "Great experience, well organized. Would love to join another trip!", date: "Oct 2025" },
              ].map((r, i) => (
                <div key={i} className="rounded-xl bg-card p-4 shadow-card">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">{r.name[0]}</div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{r.name} <span className="text-xs text-muted-foreground">· {r.country}</span></p>
                      <div className="flex gap-0.5">{Array.from({ length: r.rating }).map((_, j) => <Star key={j} className="w-3 h-3 fill-primary text-primary" />)}</div>
                    </div>
                    <span className="text-xs text-muted-foreground ml-auto">{r.date}</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">{r.text}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
      <Footer />
    </div>
  );
};

export default TripLeaderProfile;
