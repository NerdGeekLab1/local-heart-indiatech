import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { MapPin, Calendar, Users, Clock, Bike, Car, Bus, Train, Heart, Filter, Search, Compass, Star, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";

const tripTypeIcons: Record<string, React.ElementType> = {
  bike_tour: Bike, car_trip: Car, bus_trip: Bus, road_trip: Compass, train_trip: Train,
};
const tripTypeLabels: Record<string, string> = {
  bike_tour: "Bike Tour", car_trip: "Car Trip", bus_trip: "Bus Trip", road_trip: "Road Trip", train_trip: "Train Trip",
};
const natureColors: Record<string, string> = {
  adventure: "bg-primary/10 text-primary", spiritual: "bg-accent/10 text-accent", holy: "bg-accent/10 text-accent", cultural: "bg-secondary text-foreground",
};

const Trips = () => {
  const [trips, setTrips] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterNature, setFilterNature] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [liked, setLiked] = useState<string[]>([]);

  useEffect(() => {
    const fetchTrips = async () => {
      const { data } = await supabase.from("trip_listings").select("*").eq("status", "active").order("created_at", { ascending: false });
      setTrips(data || []);
      setLoading(false);
    };
    fetchTrips();
  }, []);

  const filtered = trips.filter(t => {
    const q = searchQuery.toLowerCase();
    const matchSearch = !q || t.title.toLowerCase().includes(q) || (t.destination || "").toLowerCase().includes(q);
    const matchNature = !filterNature || t.nature === filterNature;
    const matchType = !filterType || t.trip_type === filterType;
    return matchSearch && matchNature && matchType;
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="relative pt-20 pb-8 px-4 sm:px-6 lg:px-8 mx-auto max-w-7xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center max-w-2xl mx-auto">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: "spring" }}
            className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <Compass className="w-8 h-8 text-primary" />
          </motion.div>
          <h1 className="text-4xl sm:text-5xl font-bold text-foreground">Published Trips</h1>
          <p className="mt-3 text-lg text-muted-foreground">Join group trips hosted by fellow travelers</p>
        </motion.div>

        {/* Search */}
        <div className="mt-8 max-w-2xl mx-auto">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input type="text" placeholder="Search trips by name or destination..."
              value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
              className="w-full rounded-xl bg-card shadow-card pl-11 pr-5 py-3.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" />
          </div>
        </div>

        {/* Filter pills */}
        <div className="mt-6 flex flex-wrap gap-2 justify-center">
          {["adventure", "spiritual", "holy", "cultural"].map(n => (
            <button key={n} onClick={() => setFilterNature(filterNature === n ? null : n)}
              className={`text-xs px-3 py-1.5 rounded-full font-medium capitalize transition-all ${filterNature === n ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground hover:bg-secondary/80"}`}>
              {n}
            </button>
          ))}
          <span className="text-muted-foreground text-xs self-center mx-1">|</span>
          {Object.entries(tripTypeLabels).map(([key, label]) => (
            <button key={key} onClick={() => setFilterType(filterType === key ? null : key)}
              className={`text-xs px-3 py-1.5 rounded-full font-medium transition-all ${filterType === key ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground hover:bg-secondary/80"}`}>
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 sm:px-6 lg:px-8 mx-auto max-w-7xl pb-16">
        {loading ? (
          <div className="text-center py-16 text-muted-foreground">Loading trips...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-muted-foreground text-lg">No trips found</p>
            <p className="text-sm text-muted-foreground mt-1">Be the first to <Link to="/host-trip" className="text-primary hover:underline">host a trip</Link>!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((trip, i) => {
              const Icon = tripTypeIcons[trip.trip_type] || Compass;
              return (
                <motion.div key={trip.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }} whileHover={{ y: -4 }}>
                  <Link to={`/trip/${trip.id}`}>
                    <div className="rounded-2xl bg-card shadow-card hover:shadow-elevated transition-all overflow-hidden group">
                      <div className="relative aspect-[16/10] overflow-hidden bg-secondary">
                        {trip.image_url ? (
                          <img src={trip.image_url} alt={trip.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Icon className="w-16 h-16 text-muted-foreground/30" />
                          </div>
                        )}
                        <div className="absolute top-3 left-3 flex gap-1.5">
                          <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${natureColors[trip.nature] || "bg-secondary text-foreground"}`}>
                            {trip.nature}
                          </span>
                          <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-card/80 backdrop-blur text-foreground flex items-center gap-1">
                            <Icon className="w-3 h-3" /> {tripTypeLabels[trip.trip_type] || trip.trip_type}
                          </span>
                        </div>
                        <button className="absolute top-3 right-3 w-8 h-8 rounded-full bg-card/80 backdrop-blur flex items-center justify-center"
                          onClick={e => { e.preventDefault(); setLiked(p => p.includes(trip.id) ? p.filter(x => x !== trip.id) : [...p, trip.id]); }}>
                          <Heart className={`w-4 h-4 ${liked.includes(trip.id) ? "fill-destructive text-destructive" : "text-foreground"}`} />
                        </button>
                      </div>
                      <div className="p-4">
                        <h3 className="font-bold text-foreground line-clamp-1">{trip.title}</h3>
                        {trip.destination && (
                          <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1"><MapPin className="w-3 h-3" /> {trip.destination}</p>
                        )}
                        {trip.route && <p className="text-xs text-muted-foreground mt-1 line-clamp-1">📍 {trip.route}</p>}
                        <div className="flex items-center gap-3 mt-3 text-xs text-muted-foreground">
                          {trip.duration && <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {trip.duration}</span>}
                          {trip.start_date && <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {trip.start_date}</span>}
                          <span className="flex items-center gap-1"><Users className="w-3 h-3" /> Max {trip.max_travelers}</span>
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                          {trip.includes_food && <span className="text-[10px] bg-secondary text-muted-foreground px-2 py-0.5 rounded-full">🍽️ Food</span>}
                          {trip.includes_stay && <span className="text-[10px] bg-secondary text-muted-foreground px-2 py-0.5 rounded-full">🏠 Stay</span>}
                          {trip.includes_transport && <span className="text-[10px] bg-secondary text-muted-foreground px-2 py-0.5 rounded-full">🚗 Transport</span>}
                          {trip.includes_activities && <span className="text-[10px] bg-secondary text-muted-foreground px-2 py-0.5 rounded-full">🎯 Activities</span>}
                        </div>
                        <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
                          <div>
                            <span className="text-lg font-bold text-foreground">${trip.total_price}</span>
                            <span className="text-xs text-muted-foreground ml-1">
                              {trip.price_model === "per_person" ? "/person" : trip.price_model === "split" ? " (split)" : " total"}
                            </span>
                          </div>
                          <span className="text-xs text-primary font-medium flex items-center gap-1">View Details <ArrowRight className="w-3 h-3" /></span>
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default Trips;
