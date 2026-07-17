import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Bike, Star, Clock, MapPin, Users, Shield, Calendar, CheckCircle,
  Fuel, Wrench, Camera, Mountain, ArrowLeft, Play, Heart, Share2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const bikeRoutes = [
  {
    id: "ladakh", name: "Leh-Ladakh Expedition", tagline: "Ride the Roof of the World",
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=800&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=600&q=80",
      "https://images.unsplash.com/photo-1506929562872-bb421503ef21?w=600&q=80",
      "https://images.unsplash.com/photo-1477587458883-47145ed94245?w=600&q=80",
    ],
    difficulty: "Hard", duration: "7-10 Days", distance: "1,200+ km", elevation: "18,380 ft",
    price: 350, rating: 4.9, reviewCount: 45, maxRiders: 8,
    route: "Delhi → Manali → Rohtang → Keylong → Sarchu → Leh → Khardung La → Pangong → Leh",
    passes: ["Rohtang La (13,051 ft)", "Baralacha La (16,020 ft)", "Lachalung La (16,616 ft)", "Tanglang La (17,582 ft)", "Khardung La (18,380 ft)"],
    bikes: ["Royal Enfield Himalayan 411cc", "Royal Enfield Classic 350", "KTM 390 Adventure"],
    includes: ["Bike rental & fuel", "Mechanic support vehicle", "Camping gear", "All meals", "Inner Line Permits", "Oxygen cylinders", "First aid kit", "GoPro footage"],
    bestSeason: "June – September",
    tags: ["#Ladakh", "#BikeTrip", "#Himalaya", "#KhardungLa", "#Adventure"],
  },
  {
    id: "rajasthan", name: "Royal Rajasthan Safari", tagline: "Through Forts & Desert Dunes",
    image: "https://images.unsplash.com/photo-1477587458883-47145ed94245?w=800&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1477587458883-47145ed94245?w=600&q=80",
      "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=600&q=80",
    ],
    difficulty: "Moderate", duration: "5 Days", distance: "800 km", elevation: "3,200 ft",
    price: 280, rating: 4.9, reviewCount: 19, maxRiders: 12,
    route: "Jaipur → Jodhpur → Jaisalmer → Sam Dunes → Udaipur → Jaipur",
    passes: [],
    bikes: ["Royal Enfield Himalayan", "Royal Enfield Meteor 350"],
    includes: ["Bike rental", "Desert camping", "All meals", "Heritage stays", "Support vehicle", "Camel ride"],
    bestSeason: "October – March",
    tags: ["#Rajasthan", "#Desert", "#Heritage", "#BikeRide"],
  },
  {
    id: "goa", name: "Goa Coastal Cruise", tagline: "Beach Vibes on Two Wheels",
    image: "https://images.unsplash.com/photo-1506929562872-bb421503ef21?w=800&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1506929562872-bb421503ef21?w=600&q=80",
      "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=600&q=80",
    ],
    difficulty: "Easy", duration: "Full Day", distance: "120 km", elevation: "500 ft",
    price: 65, rating: 4.8, reviewCount: 28, maxRiders: 10,
    route: "Panaji → Fort Aguada → Vagator → Chapora → Anjuna → Panaji",
    passes: [],
    bikes: ["Royal Enfield Classic 350", "Honda Activa 6G (Scooter)"],
    includes: ["Bike/Scooter rental", "Helmet", "Fuel", "Beach shack lunch", "GoPro footage", "Spice plantation entry"],
    bestSeason: "October – March",
    tags: ["#Goa", "#Beach", "#CoastalRide", "#Sunset"],
  },
];

const difficultyColor: Record<string, string> = {
  Easy: "bg-accent/10 text-accent",
  Moderate: "bg-primary/10 text-primary",
  Hard: "bg-destructive/10 text-destructive",
  Extreme: "bg-destructive text-destructive-foreground",
};

const BikeToursDetail = () => {
  const [activeRoute, setActiveRoute] = useState(bikeRoutes[0]);
  const [liked, setLiked] = useState<string[]>([]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <div className="relative h-[50vh] min-h-[350px] overflow-hidden">
        <img src={activeRoute.image} alt={activeRoute.name} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-10 mx-auto max-w-6xl">
          <Link to="/experiences" className="inline-flex items-center gap-1 text-sm text-primary-foreground/80 hover:text-primary-foreground mb-3">
            <ArrowLeft className="w-4 h-4" /> Experiences
          </Link>
          <div className="flex items-center gap-2 mb-2">
            <Bike className="w-6 h-6 text-primary" />
            <span className="text-xs uppercase tracking-wider font-bold text-primary-foreground bg-primary/80 px-2 py-0.5 rounded-sm">Bike & Scooty Tours</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-bold text-primary-foreground">{activeRoute.name}</h1>
          <p className="text-primary-foreground/80 text-lg mt-1">{activeRoute.tagline}</p>
        </div>
      </div>

      <div className="px-4 sm:px-6 lg:px-8 mx-auto max-w-6xl py-8">
        {/* Route Selector */}
        <div className="flex gap-3 overflow-x-auto pb-4 mb-8">
          {bikeRoutes.map(r => (
            <button key={r.id} onClick={() => setActiveRoute(r)}
              className={`shrink-0 rounded-2xl overflow-hidden w-48 transition-all ${
                activeRoute.id === r.id ? "ring-2 ring-primary shadow-elevated scale-105" : "shadow-card hover:shadow-card-hover"
              }`}>
              <div className="relative aspect-[16/10]">
                <img src={r.image} alt={r.name} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-foreground/70 to-transparent" />
                <div className="absolute bottom-2 left-2 right-2">
                  <p className="text-primary-foreground text-xs font-bold truncate">{r.name}</p>
                  <p className="text-primary-foreground/70 text-[10px]">${r.price} • {r.duration}</p>
                </div>
              </div>
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: "Duration", value: activeRoute.duration, icon: Clock },
                { label: "Distance", value: activeRoute.distance, icon: MapPin },
                { label: "Max Altitude", value: activeRoute.elevation, icon: Mountain },
                { label: "Max Riders", value: `${activeRoute.maxRiders}`, icon: Users },
              ].map(s => (
                <div key={s.label} className="rounded-xl bg-card p-4 shadow-card text-center">
                  <s.icon className="w-5 h-5 text-primary mx-auto mb-1" />
                  <p className="text-lg font-bold text-foreground">{s.value}</p>
                  <p className="text-[10px] text-muted-foreground">{s.label}</p>
                </div>
              ))}
            </div>

            {/* Route */}
            <div className="rounded-2xl bg-card p-6 shadow-card">
              <h2 className="text-lg font-bold text-foreground mb-3 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-primary" /> Route
              </h2>
              <p className="text-muted-foreground">{activeRoute.route}</p>
              {activeRoute.passes.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm font-bold text-foreground mb-2">Mountain Passes</p>
                  <div className="flex flex-wrap gap-2">
                    {activeRoute.passes.map(p => (
                      <span key={p} className="text-xs bg-primary/10 text-primary px-3 py-1 rounded-full">{p}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Bikes */}
            <div className="rounded-2xl bg-card p-6 shadow-card">
              <h2 className="text-lg font-bold text-foreground mb-3 flex items-center gap-2">
                <Bike className="w-5 h-5 text-primary" /> Available Bikes
              </h2>
              <div className="flex flex-wrap gap-2">
                {activeRoute.bikes.map(b => (
                  <span key={b} className="text-sm bg-secondary text-foreground px-4 py-2 rounded-xl font-medium">{b}</span>
                ))}
              </div>
            </div>

            {/* Gallery */}
            <div>
              <h2 className="text-lg font-bold text-foreground mb-3 flex items-center gap-2">
                <Camera className="w-5 h-5 text-primary" /> Gallery
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {activeRoute.gallery.map((img, i) => (
                  <motion.div key={i} whileHover={{ scale: 1.03 }} className="relative aspect-[4/3] rounded-xl overflow-hidden shadow-card group cursor-pointer">
                    <img src={img} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/20 transition-colors flex items-center justify-center">
                      <Play className="w-10 h-10 text-primary-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* What's Included */}
            <div className="rounded-2xl bg-card p-6 shadow-card">
              <h2 className="text-lg font-bold text-foreground mb-3 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-accent" /> What's Included
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {activeRoute.includes.map(inc => (
                  <div key={inc} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CheckCircle className="w-4 h-4 text-accent shrink-0" /> {inc}
                  </div>
                ))}
              </div>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-2">
              {activeRoute.tags.map(tag => (
                <span key={tag} className="text-sm bg-primary/5 text-primary border border-primary/20 px-3 py-1.5 rounded-full font-medium">{tag}</span>
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-4">
              <div className="rounded-2xl bg-card p-5 shadow-card">
                <div className="flex items-center gap-2 mb-3">
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${difficultyColor[activeRoute.difficulty]}`}>
                    {activeRoute.difficulty}
                  </span>
                  <div className="flex items-center gap-1 text-sm">
                    <Star className="w-4 h-4 fill-primary text-primary" />
                    <span className="font-bold text-foreground">{activeRoute.rating}</span>
                    <span className="text-muted-foreground">({activeRoute.reviewCount})</span>
                  </div>
                </div>
                <div className="flex items-baseline gap-1 mb-1">
                  <span className="text-3xl font-bold text-foreground">${activeRoute.price}</span>
                  <span className="text-sm text-muted-foreground">/ person</span>
                </div>
                <p className="text-xs text-muted-foreground mb-4">Best season: {activeRoute.bestSeason}</p>
                <Link to="/explore">
                  <Button className="w-full rounded-full" size="lg">Book This Tour</Button>
                </Link>
                <div className="flex gap-2 mt-3">
                  <Button variant="outline" className="flex-1 rounded-full gap-1 text-sm"
                    onClick={() => setLiked(p => p.includes(activeRoute.id) ? p.filter(x => x !== activeRoute.id) : [...p, activeRoute.id])}>
                    <Heart className={`w-4 h-4 ${liked.includes(activeRoute.id) ? "fill-destructive text-destructive" : ""}`} />
                    Save
                  </Button>
                  <Button variant="outline" className="flex-1 rounded-full gap-1 text-sm"
                    onClick={() => { navigator.clipboard.writeText(window.location.href); }}>
                    <Share2 className="w-4 h-4" /> Share
                  </Button>
                </div>
              </div>

              <div className="rounded-2xl bg-primary/5 border border-primary/20 p-5">
                <h3 className="text-sm font-bold text-foreground mb-2">🛡️ Safety Guarantee</h3>
                <ul className="space-y-1.5 text-xs text-muted-foreground">
                  <li className="flex items-start gap-1.5"><Shield className="w-3 h-3 text-accent mt-0.5 shrink-0" /> Certified mechanic on every trip</li>
                  <li className="flex items-start gap-1.5"><Shield className="w-3 h-3 text-accent mt-0.5 shrink-0" /> First aid & oxygen support</li>
                  <li className="flex items-start gap-1.5"><Shield className="w-3 h-3 text-accent mt-0.5 shrink-0" /> Full insurance coverage</li>
                  <li className="flex items-start gap-1.5"><Shield className="w-3 h-3 text-accent mt-0.5 shrink-0" /> 24/7 emergency support</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default BikeToursDetail;
