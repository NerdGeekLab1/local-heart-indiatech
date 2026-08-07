import { useState, useMemo, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, Play, MapPin, Filter, X, Calendar, Users, Bike,
  Mountain, Heart, Star, Clock, ChevronDown, SlidersHorizontal,
  Waves, Sparkles, Shield, IndianRupee
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import ExperienceCard from "@/components/ExperienceCard";
import Footer from "@/components/Footer";
import { experiences, vibeCategories, destinations, hosts } from "@/lib/data";
import { supabase } from "@/integrations/supabase/client";

const locationOptions = [...new Set(experiences.map(e => e.hostCity))].sort();
const difficultyOptions = ["Easy", "Moderate", "Hard", "Extreme"];
const priceRanges = [
  { label: "Under ₹3,000", min: 0, max: 3000 },
  { label: "₹3,000 – ₹8,000", min: 3000, max: 8000 },
  { label: "₹8,000 – ₹15,000", min: 8000, max: 15000 },
  { label: "₹15,000+", min: 15000, max: Infinity },
];

const bikeExperiences = [
  {
    id: "exp-bike-ladakh", title: "Leh-Ladakh Bike Expedition", description: "Ride through the world's highest motorable passes on a Royal Enfield. Cross Khardung La (18,380 ft) and experience breathtaking Himalayan landscapes.",
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=600&q=80",
    price: 29000, duration: "7 Days", category: "Bike Tour", hostId: "arjun-varanasi", hostName: "Arjun", hostCity: "Varanasi", rating: 4.9, reviewCount: 45,
    difficulty: "Hard" as const, groupSize: "4-8", maxGuests: 8,
    includes: ["Royal Enfield 500cc", "Fuel", "Mechanic support", "Camping gear", "Meals", "Permits", "First aid", "Oxygen cylinder"],
    highlights: ["Khardung La Pass", "Pangong Lake", "Nubra Valley", "Magnetic Hill", "Monasteries"],
    vehicleType: "Motorcycle", vehicleDetails: { model: "Royal Enfield Himalayan", capacity: 1, type: "Motorcycle" },
    isYearRound: false, validFrom: "2026-06-01", validTo: "2026-09-30", lastBookingDate: "2026-05-15",
  },
  {
    id: "exp-bike-mahabaleshwar", title: "Mahabaleshwar Scooty Tour", description: "Explore the lush Western Ghats on a scooty — visit strawberry farms, ancient temples, and stunning viewpoints.",
    image: "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=600&q=80",
    price: 3750, duration: "Full Day", category: "Bike Tour", hostId: "kiran-mumbai", hostName: "Kiran", hostCity: "Mumbai", rating: 4.7, reviewCount: 32,
    difficulty: "Easy" as const, groupSize: "2-6", maxGuests: 6,
    includes: ["Honda Activa", "Helmet", "Route map", "Lunch", "Strawberry farm entry"],
    highlights: ["Arthur's Seat", "Elephant's Head Point", "Strawberry Farms", "Mapro Garden", "Ancient Temples"],
    vehicleType: "Scooter", vehicleDetails: { model: "Honda Activa 6G", capacity: 2, type: "Scooter" },
    isYearRound: true,
  },
  {
    id: "exp-bike-goa-cruise", title: "Goa Coastal Bike Cruise", description: "Cruise along Goa's scenic coastal roads on a Royal Enfield, stopping at hidden beaches, Portuguese forts, and local tavernas.",
    image: "https://images.unsplash.com/photo-1506929562872-bb421503ef21?w=600&q=80",
    price: 5400, duration: "Full Day", category: "Bike Tour", hostId: "meera-goa", hostName: "Meera", hostCity: "Goa", rating: 4.8, reviewCount: 28,
    difficulty: "Easy" as const, groupSize: "2-10", maxGuests: 10,
    includes: ["Royal Enfield Classic 350", "Helmet", "Fuel", "Lunch at beach shack", "GoPro footage"],
    highlights: ["Fort Aguada", "Vagator Beach", "Chapora Fort", "Spice Plantation", "Beach Sunset"],
    vehicleType: "Motorcycle", vehicleDetails: { model: "Royal Enfield Classic 350", capacity: 2, type: "Motorcycle" },
    isYearRound: false, validFrom: "2026-10-01", validTo: "2027-03-31",
  },
  {
    id: "exp-bike-rajasthan", title: "Royal Rajasthan Bike Safari", description: "Ride through desert landscapes, visit ancient forts, and camp under the stars in the Thar Desert.",
    image: "https://images.unsplash.com/photo-1477587458883-47145ed94245?w=600&q=80",
    price: 23200, duration: "5 Days", category: "Bike Tour", hostId: "ravi-jaipur", hostName: "Ravi", hostCity: "Jaipur", rating: 4.9, reviewCount: 19,
    difficulty: "Moderate" as const, groupSize: "4-12", maxGuests: 12,
    includes: ["Royal Enfield Himalayan", "Fuel", "Desert camping", "All meals", "Support vehicle", "Mechanic"],
    highlights: ["Mehrangarh Fort", "Thar Desert", "Jaisalmer", "Sam Sand Dunes", "Village stays"],
    vehicleType: "Motorcycle", vehicleDetails: { model: "Royal Enfield Himalayan", capacity: 1, type: "Motorcycle" },
    isYearRound: false, validFrom: "2026-10-01", validTo: "2027-03-31", lastBookingDate: "2026-09-15",
  },
];

const staticExperiences = [...experiences, ...bikeExperiences];

const allCategories = [
  ...vibeCategories,
  { label: "Bike Tour", emoji: "🏍️" },
  { label: "Wedding", emoji: "💍" },
  { label: "Village", emoji: "🏡" },
  { label: "Festival", emoji: "🪔" },
];

const Experiences = () => {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState<string | null>(null);
  const [selectedPrice, setSelectedPrice] = useState<typeof priceRanges[0] | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState<"rating" | "price_low" | "price_high" | "newest">("rating");
  const [dbExperiences, setDbExperiences] = useState<any[]>([]);

  useEffect(() => {
    supabase.from("experiences").select("*").eq("status", "approved").order("created_at", { ascending: false })
      .then(({ data }) => {
        if (!data) return;
        setDbExperiences(data.map(e => ({
          id: e.id, title: e.title, description: e.description || "",
          image: e.image_url || "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=600&q=80",
          price: Number(e.price), duration: e.duration || "", category: e.category,
          hostId: e.host_id, hostName: e.host_name || "Host", hostCity: e.host_city || e.location || "",
          rating: Number(e.rating) || 4.7, reviewCount: e.review_count || 0,
          difficulty: e.difficulty || "Easy", groupSize: `1-${e.max_guests || 10}`, maxGuests: e.max_guests || 10,
          includes: e.includes || [], highlights: e.highlights || [],
          isYearRound: e.is_year_round, validFrom: e.valid_from, validTo: e.valid_to,
          templateData: e.template_data,
        })));
      });
  }, []);

  const allExperiences = useMemo(() => [...dbExperiences, ...staticExperiences], [dbExperiences]);

  const filtered = useMemo(() => {
    let result = allExperiences.filter(e => {
      const q = searchQuery.toLowerCase();
      const matchesSearch = !q || e.title.toLowerCase().includes(q) || e.hostCity.toLowerCase().includes(q) || e.category.toLowerCase().includes(q);
      const matchesCategory = !activeCategory || e.category === activeCategory;
      const matchesLocation = !selectedLocation || e.hostCity === selectedLocation;
      const matchesDifficulty = !selectedDifficulty || e.difficulty === selectedDifficulty;
      const matchesPrice = !selectedPrice || (e.price >= selectedPrice.min && e.price < selectedPrice.max);
      return matchesSearch && matchesCategory && matchesLocation && matchesDifficulty && matchesPrice;
    });

    result.sort((a, b) => {
      if (sortBy === "rating") return b.rating - a.rating;
      if (sortBy === "price_low") return a.price - b.price;
      if (sortBy === "price_high") return b.price - a.price;
      return 0;
    });

    return result;
  }, [allExperiences, searchQuery, activeCategory, selectedLocation, selectedDifficulty, selectedPrice, sortBy]);

  const activeFilterCount = [selectedLocation, selectedDifficulty, selectedPrice].filter(Boolean).length;

  const clearFilters = () => {
    setSelectedLocation(null);
    setSelectedDifficulty(null);
    setSelectedPrice(null);
    setActiveCategory(null);
    setSearchQuery("");
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <div className="relative pt-20 pb-8 px-4 sm:px-6 lg:px-8 mx-auto max-w-7xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center max-w-2xl mx-auto">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: "spring" }}
            className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <Sparkles className="w-8 h-8 text-primary" />
          </motion.div>
          <h1 className="text-4xl sm:text-5xl font-bold text-foreground">Unforgettable Experiences</h1>
          <p className="mt-3 text-lg text-muted-foreground">Curated adventures, cultural immersions & bike tours across India</p>
        </motion.div>

        {/* Search & Filter Bar */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="mt-8 max-w-3xl mx-auto">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search experiences, cities, categories..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full rounded-xl bg-card shadow-card pl-11 pr-5 py-3.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
            <Button
              variant={showFilters ? "default" : "outline"}
              onClick={() => setShowFilters(!showFilters)}
              className="rounded-xl gap-2 relative"
            >
              <SlidersHorizontal className="w-4 h-4" />
              Filters
              {activeFilterCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
            </Button>
          </div>

          {/* Filter Panel */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-3 rounded-xl bg-card shadow-elevated p-5 overflow-hidden"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-foreground text-sm">Filter Experiences</h3>
                  {activeFilterCount > 0 && (
                    <button onClick={clearFilters} className="text-xs text-primary hover:underline flex items-center gap-1">
                      <X className="w-3 h-3" /> Clear all
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                  {/* Location */}
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-2 block">
                      <MapPin className="w-3 h-3 inline mr-1" /> Location
                    </label>
                    <div className="flex flex-wrap gap-1.5">
                      {locationOptions.map(loc => (
                        <button key={loc}
                          onClick={() => setSelectedLocation(selectedLocation === loc ? null : loc)}
                          className={`text-xs px-2.5 py-1 rounded-full transition-all ${selectedLocation === loc ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground hover:bg-secondary/80"}`}>
                          {loc}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Difficulty */}
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-2 block">
                      <Mountain className="w-3 h-3 inline mr-1" /> Difficulty
                    </label>
                    <div className="flex flex-wrap gap-1.5">
                      {difficultyOptions.map(d => (
                        <button key={d}
                          onClick={() => setSelectedDifficulty(selectedDifficulty === d ? null : d)}
                          className={`text-xs px-2.5 py-1 rounded-full transition-all ${selectedDifficulty === d ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground hover:bg-secondary/80"}`}>
                          {d}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Price */}
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-2 block">
                      <IndianRupee className="w-3 h-3 inline mr-1" /> Price Range
                    </label>
                    <div className="flex flex-wrap gap-1.5">
                      {priceRanges.map(p => (
                        <button key={p.label}
                          onClick={() => setSelectedPrice(selectedPrice?.label === p.label ? null : p)}
                          className={`text-xs px-2.5 py-1 rounded-full transition-all ${selectedPrice?.label === p.label ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground hover:bg-secondary/80"}`}>
                          {p.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Sort */}
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-2 block">
                      <Filter className="w-3 h-3 inline mr-1" /> Sort By
                    </label>
                    <div className="flex flex-wrap gap-1.5">
                      {([["rating", "Top Rated"], ["price_low", "Price ↑"], ["price_high", "Price ↓"]] as const).map(([key, label]) => (
                        <button key={key}
                          onClick={() => setSortBy(key)}
                          className={`text-xs px-2.5 py-1 rounded-full transition-all ${sortBy === key ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground hover:bg-secondary/80"}`}>
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Category Pills */}
        <div className="mt-6 flex flex-wrap gap-2 justify-center max-w-4xl mx-auto">
          {allCategories.map(v => (
            <motion.button
              key={v.label}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveCategory(activeCategory === v.label ? null : v.label)}
              className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-all ${activeCategory === v.label ? "bg-primary text-primary-foreground shadow-card" : "bg-secondary text-secondary-foreground hover:shadow-card"}`}
            >
              <span>{v.emoji}</span> {v.label}
            </motion.button>
          ))}
        </div>
      </div>

      <div className="px-4 sm:px-6 lg:px-8 mx-auto max-w-7xl pb-16">
        {/* 🏍️ Bike Tour Spotlight */}
        {(!activeCategory || activeCategory === "Bike Tour") && !searchQuery && (
          <motion.section initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Bike className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-foreground">🏍️ Bike & Scooty Tours</h2>
                <p className="text-sm text-muted-foreground">Ride through India's most scenic routes</p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {bikeExperiences.map((exp, i) => (
                <Link to={`/experience/${exp.id}`} key={exp.id}>
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    whileHover={{ y: -6 }}
                    className="rounded-2xl overflow-hidden bg-card shadow-card hover:shadow-elevated transition-all group"
                  >
                    <div className="relative aspect-[4/3] overflow-hidden">
                      <img src={exp.image} alt={exp.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                      <div className="absolute inset-0 bg-gradient-to-t from-foreground/70 via-transparent to-transparent" />
                      <div className="absolute top-3 left-3 flex gap-1.5">
                        <span className="bg-primary text-primary-foreground text-[10px] font-bold px-2.5 py-1 rounded-full">
                          {exp.vehicleType === "Motorcycle" ? "🏍️ Bike" : "🛵 Scooty"}
                        </span>
                        {exp.difficulty && (
                          <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${(exp.difficulty as string) === "Extreme" ? "bg-destructive text-destructive-foreground" : exp.difficulty === "Hard" ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"}`}>
                            {exp.difficulty}
                          </span>
                        )}
                      </div>
                      <div className="absolute bottom-3 left-3 right-3">
                        <p className="text-primary-foreground font-bold text-sm line-clamp-2">{exp.title}</p>
                        <p className="text-primary-foreground/70 text-xs mt-0.5">{exp.hostName} • {exp.hostCity}</p>
                      </div>
                    </div>
                    <div className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Clock className="w-3 h-3" /> {exp.duration}
                        </div>
                        <div className="flex items-center gap-1 text-xs">
                          <Star className="w-3 h-3 fill-primary text-primary" />
                          <span className="font-semibold text-foreground">{exp.rating}</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Users className="w-3 h-3" /> Max {exp.maxGuests}
                        </div>
                        <span className="text-lg font-bold text-foreground">₹{exp.price.toLocaleString("en-IN")}</span>
                      </div>
                      {!exp.isYearRound && exp.validFrom && (
                        <div className="mt-2 flex items-center gap-1 text-[10px] text-muted-foreground bg-secondary px-2 py-1 rounded-full w-fit">
                          <Calendar className="w-3 h-3" /> {exp.validFrom} – {exp.validTo}
                        </div>
                      )}
                      {exp.isYearRound && (
                        <div className="mt-2 text-[10px] text-accent bg-accent/10 px-2 py-1 rounded-full w-fit font-medium">
                          ✅ Year-round
                        </div>
                      )}
                    </div>
                  </motion.div>
                </Link>
              ))}
            </div>
          </motion.section>
        )}

        {/* Video Highlights */}
        <div className="mb-10">
          <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
            <Play className="w-5 h-5 text-primary" /> Experience Highlights
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {allExperiences.slice(0, 4).map((exp, i) => (
              <motion.div key={exp.id} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="relative aspect-[9/16] rounded-xl overflow-hidden group cursor-pointer">
                <img src={exp.image} alt={exp.title} className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-foreground/70 via-transparent to-transparent" />
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="w-12 h-12 rounded-full bg-primary/80 flex items-center justify-center backdrop-blur-sm">
                    <Play className="w-5 h-5 text-primary-foreground ml-0.5" />
                  </div>
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-3">
                  <p className="text-xs font-bold text-primary-foreground">{exp.hostName}, {exp.hostCity}</p>
                  <p className="text-sm font-semibold text-primary-foreground line-clamp-2">{exp.title}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Results count */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-muted-foreground">
            {filtered.length} experience{filtered.length !== 1 ? "s" : ""} found
            {activeCategory && <span className="ml-1 text-primary font-medium">in {activeCategory}</span>}
          </p>
          {activeFilterCount > 0 && (
            <button onClick={clearFilters} className="text-xs text-primary hover:underline">Clear all filters</button>
          )}
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filtered.map((exp, i) => (
            <Link to={`/experience/${exp.id}`} key={exp.id}>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: (i % 8) * 0.05 }}
                className="relative"
              >
                <ExperienceCard experience={exp} index={i} />
                <div className="absolute top-3 left-3 flex gap-1.5">
                  {exp.difficulty && (
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${(exp.difficulty as string) === "Extreme" ? "bg-destructive text-destructive-foreground" : exp.difficulty === "Hard" ? "bg-primary text-primary-foreground" : exp.difficulty === "Moderate" ? "bg-accent text-accent-foreground" : "bg-secondary text-secondary-foreground"}`}>
                      {exp.difficulty}
                    </span>
                  )}
                  {exp.category === "Bike Tour" && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary text-primary-foreground">🏍️</span>
                  )}
                </div>
              </motion.div>
            </Link>
          ))}
        </div>

        {filtered.length === 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20">
            <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-muted-foreground" />
            </div>
            <p className="text-lg font-semibold text-foreground">No experiences found</p>
            <p className="text-muted-foreground mt-1">Try adjusting your filters or search query</p>
            <Button onClick={clearFilters} variant="outline" className="mt-4 rounded-full">
              Clear Filters
            </Button>
          </motion.div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default Experiences;
