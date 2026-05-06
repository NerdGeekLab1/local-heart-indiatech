import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin, ArrowLeft, Clock, IndianRupee, Camera, Sun, Thermometer,
  Star, Users, Play, ChevronRight, Landmark, TreePine, ShoppingBag,
  Heart, Share2, Calendar, Navigation, Eye
} from "lucide-react";
import { Button } from "@/components/ui/button";
import VirtualTour from "@/components/VirtualTour";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { destinations, hosts, experiences, reviews } from "@/lib/data";

const siteIcons: Record<string, React.ElementType> = {
  monument: Landmark, temple: Landmark, palace: Landmark, fort: Landmark,
  nature: TreePine, beach: TreePine, market: ShoppingBag, museum: Camera,
};

const siteGradients: Record<string, string> = {
  monument: "from-primary/20 to-primary/5",
  temple: "from-accent/20 to-accent/5",
  palace: "from-primary/20 to-primary/5",
  fort: "from-destructive/20 to-destructive/5",
  nature: "from-accent/20 to-accent/5",
  beach: "from-accent/20 to-accent/5",
  market: "from-primary/20 to-primary/5",
  museum: "from-muted to-muted/50",
};

const heroImages = [
  "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=1200&q=80",
  "https://images.unsplash.com/photo-1564507592333-c60657eea523?w=800&q=80",
  "https://images.unsplash.com/photo-1585135497273-1a86b09fe70e?w=800&q=80",
  "https://images.unsplash.com/photo-1506461883276-594a12b11cf3?w=800&q=80",
];

const DestinationDetail = () => {
  const { name } = useParams();
  const destination = destinations.find(d => d.name.toLowerCase() === name?.toLowerCase());
  const [selectedSite, setSelectedSite] = useState<number | null>(null);
  const [activeHeroImg, setActiveHeroImg] = useState(0);
  const [liked, setLiked] = useState(false);

  if (!destination) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground">Destination not found</h1>
          <Link to="/destinations" className="text-primary mt-2 inline-block hover:underline">Back to Destinations</Link>
        </div>
      </div>
    );
  }

  const cityHosts = hosts.filter(h => h.city === destination.name);
  const cityExperiences = experiences.filter(e => e.hostCity === destination.name);
  const cityReviews = reviews.filter(r => cityHosts.some(h => h.id === r.hostId));

  // Build a fallback "sites" list from highlights when the dataset doesn't include detailed sites
  const fallbackSites = (destination.highlights || []).map((h, idx) => ({
    name: h,
    type: idx % 4 === 0 ? "monument" : idx % 4 === 1 ? "temple" : idx % 4 === 2 ? "nature" : "market",
    description: `A signature ${destination.name} attraction — must-see while in the region.`,
    bestTime: destination.bestSeason || "Anytime",
    duration: "1-2 hrs",
  }));
  const sitesToShow: any[] = (destination.sites && destination.sites.length > 0) ? destination.sites : fallbackSites;

  // Build a 3-day sample itinerary from the available sites
  const itinerary = sitesToShow.length > 0 ? [
    { day: "Day 1 — Arrival & Iconic Sights", places: sitesToShow.slice(0, 2).map(s => s.name) },
    { day: "Day 2 — Culture & Cuisine", places: sitesToShow.slice(2, 4).map(s => s.name).concat([`Local food trail in ${destination.name}`]) },
    { day: "Day 3 — Hidden Gems", places: sitesToShow.slice(4, 6).map(s => s.name).concat([`Sunset point & local market`]) },
  ].filter(d => d.places.length > 0) : [];

  // Map embed (OpenStreetMap — no API key)
  const firstSite = sitesToShow.find((s: any) => s.lat && s.lng);
  const mapCenter = firstSite ? `${firstSite.lat},${firstSite.lng}` : null;
  const mapBbox = firstSite
    ? `${firstSite.lng - 0.15},${firstSite.lat - 0.15},${firstSite.lng + 0.15},${firstSite.lat + 0.15}`
    : null;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Immersive Hero */}
      <div className="relative h-[70vh] min-h-[500px] overflow-hidden">
        <motion.div
          key={activeHeroImg}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          className="absolute inset-0"
        >
          <img src={heroImages[activeHeroImg % heroImages.length]} alt={destination.name}
            className="w-full h-full object-cover" />
        </motion.div>
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-foreground/30 to-transparent" />

        {/* Hero Content */}
        <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-10 max-w-7xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <Link to="/destinations" className="inline-flex items-center gap-1 text-primary-foreground/80 text-sm mb-4 hover:text-primary-foreground">
              <ArrowLeft className="w-4 h-4" /> All Destinations
            </Link>
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-primary text-sm font-semibold tracking-wider uppercase">{destination.state}</p>
                <h1 className="text-5xl sm:text-7xl font-bold text-primary-foreground leading-none mt-1">{destination.name}</h1>
                <p className="text-xl text-primary-foreground/90 mt-2 italic">{destination.tagline}</p>
                <div className="mt-4 flex flex-wrap gap-3">
                  {destination.bestSeason && (
                    <span className="flex items-center gap-1.5 text-sm text-primary-foreground/80 bg-primary-foreground/10 backdrop-blur-md px-3 py-1.5 rounded-full">
                      <Calendar className="w-3.5 h-3.5" /> {destination.bestSeason}
                    </span>
                  )}
                  {destination.avgTemp && (
                    <span className="flex items-center gap-1.5 text-sm text-primary-foreground/80 bg-primary-foreground/10 backdrop-blur-md px-3 py-1.5 rounded-full">
                      <Thermometer className="w-3.5 h-3.5" /> {destination.avgTemp}
                    </span>
                  )}
                  <span className="flex items-center gap-1.5 text-sm text-primary-foreground/80 bg-primary-foreground/10 backdrop-blur-md px-3 py-1.5 rounded-full">
                    <Users className="w-3.5 h-3.5" /> {destination.hostCount} Local Hosts
                  </span>
                  {sitesToShow.length > 0 && (
                    <span className="flex items-center gap-1.5 text-sm text-primary-foreground/80 bg-primary-foreground/10 backdrop-blur-md px-3 py-1.5 rounded-full">
                      <Camera className="w-3.5 h-3.5" /> {sitesToShow.length} Sites
                    </span>
                  )}
                </div>
              </div>
              <div className="hidden sm:flex gap-2">
                <Button size="icon" variant="ghost" onClick={() => setLiked(!liked)}
                  className="rounded-full bg-primary-foreground/10 backdrop-blur-md text-primary-foreground hover:bg-primary-foreground/20">
                  <Heart className={`w-5 h-5 ${liked ? "fill-destructive text-destructive" : ""}`} />
                </Button>
                <Button size="icon" variant="ghost"
                  className="rounded-full bg-primary-foreground/10 backdrop-blur-md text-primary-foreground hover:bg-primary-foreground/20">
                  <Share2 className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Photo Thumbnails */}
        <div className="absolute bottom-6 right-6 hidden md:flex gap-2">
          {heroImages.slice(0, 4).map((img, i) => (
            <button key={i} onClick={() => setActiveHeroImg(i)}
              className={`w-14 h-14 rounded-lg overflow-hidden border-2 transition-all ${i === activeHeroImg ? "border-primary scale-110" : "border-primary-foreground/30 opacity-70 hover:opacity-100"}`}>
              <img src={img} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Description */}
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="mb-10">
          <p className="text-lg text-muted-foreground leading-relaxed max-w-3xl">{destination.description}</p>
          {destination.highlights && (
            <div className="mt-4 flex flex-wrap gap-2">
              {destination.highlights.map(h => (
                <span key={h} className="text-sm bg-secondary text-foreground px-3 py-1.5 rounded-full font-medium">{h}</span>
              ))}
            </div>
          )}
        </motion.div>

        {/* === 3D-Style Interactive Site Explorer === */}
        {sitesToShow.length > 0 && (
          <motion.section initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
            className="mb-14">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
                <Landmark className="w-6 h-6 text-primary" /> Sites & Monuments
              </h2>
              <span className="text-sm text-muted-foreground">{sitesToShow.length} places to explore</span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
              {/* Site List */}
              <div className="lg:col-span-2 space-y-2 max-h-[600px] overflow-y-auto pr-2">
                {sitesToShow.map((site, i) => {
                  const Icon = siteIcons[site.type] || Landmark;
                  const isActive = selectedSite === i;
                  return (
                    <motion.button
                      key={site.name}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      onClick={() => setSelectedSite(isActive ? null : i)}
                      className={`w-full text-left rounded-xl p-4 transition-all duration-300 ${isActive ? "bg-primary text-primary-foreground shadow-elevated scale-[1.02]" : "bg-card shadow-card hover:shadow-card-hover"}`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${isActive ? "bg-primary-foreground/20" : "bg-primary/10"}`}>
                          <Icon className={`w-5 h-5 ${isActive ? "text-primary-foreground" : "text-primary"}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className={`font-bold text-sm ${isActive ? "text-primary-foreground" : "text-foreground"}`}>{site.name}</h4>
                          <p className={`text-xs capitalize ${isActive ? "text-primary-foreground/70" : "text-muted-foreground"}`}>{site.type}</p>
                        </div>
                        <ChevronRight className={`w-4 h-4 shrink-0 transition-transform ${isActive ? "rotate-90 text-primary-foreground" : "text-muted-foreground"}`} />
                      </div>
                    </motion.button>
                  );
                })}
              </div>

              {/* Site Detail Panel */}
              <div className="lg:col-span-3">
                <AnimatePresence mode="wait">
                  {selectedSite !== null && sitesToShow[selectedSite] ? (
                    <motion.div
                      key={selectedSite}
                      initial={{ opacity: 0, y: 20, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -20, scale: 0.98 }}
                      transition={{ duration: 0.3 }}
                      className="rounded-2xl overflow-hidden bg-card shadow-elevated"
                    >
                      {/* Site Hero Image */}
                      <div className={`relative h-56 bg-gradient-to-br ${siteGradients[sitesToShow[selectedSite].type] || "from-secondary to-muted"}`}>
                        <div className="absolute inset-0 flex items-center justify-center">
                          {(() => {
                            const Icon = siteIcons[sitesToShow[selectedSite].type] || Landmark;
                            return <Icon className="w-24 h-24 text-primary/20" />;
                          })()}
                        </div>
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-card to-transparent h-20" />
                        <div className="absolute top-4 right-4 flex gap-2">
                          <span className="bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full uppercase">
                            {sitesToShow[selectedSite].type}
                          </span>
                        </div>
                      </div>

                      <div className="p-6 -mt-8 relative">
                        <h3 className="text-2xl font-bold text-foreground">{sitesToShow[selectedSite].name}</h3>
                        <p className="mt-2 text-muted-foreground leading-relaxed">{sitesToShow[selectedSite].description}</p>

                        <div className="mt-5 grid grid-cols-3 gap-3">
                          {sitesToShow[selectedSite].entryFee && (
                            <div className="rounded-xl bg-secondary p-3 text-center">
                              <IndianRupee className="w-4 h-4 text-primary mx-auto mb-1" />
                              <p className="text-xs text-muted-foreground">Entry Fee</p>
                              <p className="text-sm font-bold text-foreground">{sitesToShow[selectedSite].entryFee}</p>
                            </div>
                          )}
                          {sitesToShow[selectedSite].bestTime && (
                            <div className="rounded-xl bg-secondary p-3 text-center">
                              <Sun className="w-4 h-4 text-primary mx-auto mb-1" />
                              <p className="text-xs text-muted-foreground">Best Time</p>
                              <p className="text-sm font-bold text-foreground">{sitesToShow[selectedSite].bestTime}</p>
                            </div>
                          )}
                          {sitesToShow[selectedSite].duration && (
                            <div className="rounded-xl bg-secondary p-3 text-center">
                              <Clock className="w-4 h-4 text-primary mx-auto mb-1" />
                              <p className="text-xs text-muted-foreground">Duration</p>
                              <p className="text-sm font-bold text-foreground">{sitesToShow[selectedSite].duration}</p>
                            </div>
                          )}
                        </div>

                        {/* Fake Video Review */}
                        <div className="mt-5">
                          <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                            <Play className="w-4 h-4 text-primary" /> Traveler Video Review
                          </h4>
                          <div className="relative aspect-video rounded-xl overflow-hidden bg-secondary group cursor-pointer">
                            <img src={heroImages[(selectedSite + 1) % heroImages.length]} alt="Video review" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                            <div className="absolute inset-0 bg-foreground/20 flex items-center justify-center">
                              <motion.div
                                whileHover={{ scale: 1.15 }}
                                className="w-16 h-16 rounded-full bg-primary/90 backdrop-blur-sm flex items-center justify-center shadow-elevated"
                              >
                                <Play className="w-7 h-7 text-primary-foreground ml-1" />
                              </motion.div>
                            </div>
                            <div className="absolute bottom-3 left-3 bg-foreground/60 backdrop-blur-sm text-primary-foreground text-xs px-3 py-1 rounded-full">
                              2:45 • Sarah M. from USA
                            </div>
                          </div>
                        </div>

                        <div className="mt-4 flex gap-2">
                          <Button className="rounded-full gap-2 flex-1">
                            <Navigation className="w-4 h-4" /> Get Directions
                          </Button>
                          <VirtualTour siteName={sitesToShow[selectedSite].name} siteType={sitesToShow[selectedSite].type} />
                        </div>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="rounded-2xl bg-card shadow-card border-2 border-dashed border-border flex items-center justify-center h-[500px]"
                    >
                      <div className="text-center p-8">
                        <MapPin className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                        <p className="text-lg font-semibold text-muted-foreground">Select a site to explore</p>
                        <p className="text-sm text-muted-foreground/70 mt-1">Click on any monument or site from the list</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.section>
        )}

        {/* === Map === */}
        {mapBbox && (
          <motion.section initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="mb-14">
            <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
              <MapPin className="w-6 h-6 text-primary" /> {destination.name} on the Map
            </h2>
            <div className="rounded-2xl overflow-hidden shadow-card aspect-[16/9] bg-secondary">
              <iframe
                title={`Map of ${destination.name}`}
                width="100%"
                height="100%"
                loading="lazy"
                src={`https://www.openstreetmap.org/export/embed.html?bbox=${mapBbox}&layer=mapnik&marker=${mapCenter}`}
                style={{ border: 0 }}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Pinned location:{" "}
              <a href={`https://www.openstreetmap.org/?mlat=${firstSite?.lat}&mlon=${firstSite?.lng}#map=12/${firstSite?.lat}/${firstSite?.lng}`}
                target="_blank" rel="noreferrer" className="text-primary hover:underline">View larger map</a>
            </p>
          </motion.section>
        )}

        {/* === Sample Itinerary === */}
        {itinerary.length > 0 && (
          <motion.section initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="mb-14">
            <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
              <Calendar className="w-6 h-6 text-primary" /> Sample 3-Day Itinerary
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {itinerary.map((day, i) => (
                <motion.div key={day.day}
                  initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }} viewport={{ once: true }}
                  className="rounded-2xl bg-card shadow-card p-5 border-t-4 border-primary">
                  <p className="text-xs uppercase tracking-wider text-primary font-bold">Day {i + 1}</p>
                  <h3 className="font-bold text-foreground mt-1 mb-3">{day.day.split(" — ")[1] || day.day}</h3>
                  <ul className="space-y-2">
                    {day.places.map(p => (
                      <li key={p} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <ChevronRight className="w-3.5 h-3.5 text-primary mt-0.5 shrink-0" />
                        <span>{p}</span>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-3 italic">
              Tip: Book a verified local host below for a fully customized itinerary tailored to your interests and pace.
            </p>
          </motion.section>
        )}


        <motion.section initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="mb-14">
          <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
            <Play className="w-6 h-6 text-primary" /> Video Reviews from Travelers
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {[1, 2, 3, 4, 5].map(i => (
              <motion.div key={i}
                whileHover={{ scale: 1.03, y: -4 }}
                className="relative aspect-[9/16] rounded-2xl overflow-hidden bg-secondary group cursor-pointer shadow-card hover:shadow-elevated transition-shadow"
              >
                <img src={heroImages[i % heroImages.length]} alt={`Review ${i}`} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-foreground/70 via-transparent to-foreground/10" />
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="w-12 h-12 rounded-full bg-primary/90 flex items-center justify-center backdrop-blur-sm">
                    <Play className="w-5 h-5 text-primary-foreground ml-0.5" />
                  </div>
                </div>
                <div className="absolute bottom-3 left-3 right-3">
                  <div className="flex items-center gap-1 mb-1">
                    {Array.from({ length: 5 }).map((_, j) => (
                      <Star key={j} className="w-3 h-3 fill-primary text-primary" />
                    ))}
                  </div>
                  <p className="text-primary-foreground text-xs font-semibold">Traveler #{i}</p>
                  <p className="text-primary-foreground/70 text-[10px]">2 weeks ago</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Local Hosts */}
        {cityHosts.length > 0 && (
          <motion.section initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="mb-14">
            <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
              <Users className="w-6 h-6 text-primary" /> Meet Your Local Hosts
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {cityHosts.map(host => (
                <Link to={`/host/${host.id}`} key={host.id}>
                  <motion.div whileHover={{ y: -4 }}
                    className="rounded-2xl bg-card shadow-card hover:shadow-elevated transition-all p-5 group">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-2xl overflow-hidden shrink-0">
                        <img src={host.image} alt={host.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-foreground group-hover:text-primary transition-colors">{host.name}</h3>
                        <p className="text-sm text-muted-foreground truncate">{host.tagline}</p>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-xs text-muted-foreground flex items-center gap-0.5">
                            <Star className="w-3 h-3 fill-primary text-primary" /> {host.rating}
                          </span>
                          <span className="text-xs text-muted-foreground">${host.pricePerDay}/day</span>
                          <span className="text-xs text-muted-foreground">{host.services.length} services</span>
                        </div>
                      </div>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {host.services.map(s => (
                        <span key={s} className="text-xs bg-secondary text-muted-foreground px-2 py-0.5 rounded-full">{s}</span>
                      ))}
                    </div>
                  </motion.div>
                </Link>
              ))}
            </div>
          </motion.section>
        )}

        {/* Experiences */}
        {cityExperiences.length > 0 && (
          <motion.section initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="mb-14">
            <h2 className="text-2xl font-bold text-foreground mb-6">
              Experiences in {destination.name}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {cityExperiences.map(exp => (
                <Link to={`/experience/${exp.id}`} key={exp.id}>
                  <motion.div whileHover={{ y: -4 }}
                    className="rounded-2xl overflow-hidden bg-card shadow-card hover:shadow-elevated transition-all group">
                    <div className="relative aspect-video overflow-hidden">
                      <img src={exp.image} alt={exp.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 to-transparent" />
                      <span className="absolute top-3 left-3 bg-primary text-primary-foreground text-xs font-bold px-2.5 py-1 rounded-full">
                        {exp.category}
                      </span>
                      <div className="absolute bottom-3 left-3">
                        <p className="text-primary-foreground font-bold text-sm">{exp.title}</p>
                      </div>
                    </div>
                    <div className="p-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">{exp.duration}</span>
                        <span className="text-lg font-bold text-foreground">${exp.price}</span>
                      </div>
                    </div>
                  </motion.div>
                </Link>
              ))}
            </div>
          </motion.section>
        )}

        {/* Traveler Reviews */}
        {cityReviews.length > 0 && (
          <motion.section initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="mb-14">
            <h2 className="text-2xl font-bold text-foreground mb-6">
              What Travelers Say
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {cityReviews.map(review => (
                <div key={review.id} className="rounded-2xl bg-card shadow-card p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
                      {review.travelerName[0]}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">{review.travelerName}</p>
                      <p className="text-xs text-muted-foreground">{review.country} · {review.date}</p>
                    </div>
                    <div className="ml-auto flex gap-0.5">
                      {Array.from({ length: review.rating }).map((_, j) => (
                        <Star key={j} className="w-3 h-3 fill-primary text-primary" />
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">{review.text}</p>
                </div>
              ))}
            </div>
          </motion.section>
        )}

        {/* CTA */}
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="rounded-2xl bg-primary p-8 sm:p-12 text-center">
          <h2 className="text-3xl font-bold text-primary-foreground">Ready to explore {destination.name}?</h2>
          <p className="mt-2 text-primary-foreground/80 max-w-xl mx-auto">
            Connect with verified local hosts for an authentic, safe, and unforgettable experience.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <Link to="/explore">
              <Button size="lg" className="rounded-full bg-primary-foreground text-primary hover:bg-primary-foreground/90 px-8">
                Find a Host
              </Button>
            </Link>
            <Link to="/experiences">
              <Button size="lg" variant="outline" className="rounded-full border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 px-8">
                Browse Experiences
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>

      <Footer />
    </div>
  );
};

export default DestinationDetail;
