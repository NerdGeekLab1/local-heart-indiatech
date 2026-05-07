import { useState, useRef } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { MapPin, Users, ArrowRight, Clock, IndianRupee, Camera, ChevronDown, ChevronUp, Landmark, TreePine, ShoppingBag, Sun, Thermometer, Star, Search, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { destinations, hosts } from "@/lib/data";
import { useCurrency } from "@/contexts/CurrencyContext";

const siteIcons: Record<string, React.ElementType> = {
  monument: Landmark, temple: Landmark, palace: Landmark, fort: Landmark,
  nature: TreePine, beach: TreePine, market: ShoppingBag, museum: Camera,
};

const siteColors: Record<string, string> = {
  monument: "bg-primary/10 text-primary", temple: "bg-accent/10 text-accent",
  palace: "bg-primary/10 text-primary", fort: "bg-destructive/10 text-destructive",
  nature: "bg-accent/10 text-accent", beach: "bg-accent/10 text-accent",
  market: "bg-primary/10 text-primary", museum: "bg-secondary text-muted-foreground",
};

const Destinations = () => {
  const { format } = useCurrency();
  const [expandedCity, setExpandedCity] = useState<string | null>(null);
  const [selectedSite, setSelectedSite] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSeason, setSelectedSeason] = useState<string | null>(null);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  const allTags = [...new Set(destinations.flatMap(d => d.experienceTags || []))];
  const seasons = ["Oct – Mar", "Sep – Mar", "Nov – Feb", "Mar – May"];

  const filteredDestinations = destinations.filter(d => {
    const matchesSearch = !searchQuery || d.name.toLowerCase().includes(searchQuery.toLowerCase()) || d.state.toLowerCase().includes(searchQuery.toLowerCase()) || d.tagline.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSeason = !selectedSeason || d.bestSeason === selectedSeason;
    const matchesTag = !selectedTag || d.experienceTags?.includes(selectedTag);
    return matchesSearch && matchesSeason && matchesTag;
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 mx-auto max-w-7xl">
        {/* Hero */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
          <h1 className="text-4xl sm:text-5xl font-bold text-foreground">Explore India's Wonders</h1>
          <p className="mt-3 text-lg text-muted-foreground max-w-2xl mx-auto">
            Pin-drop into India's most extraordinary cities. Discover monuments, temples, palaces, and hidden gems with local hosts.
          </p>
        </motion.div>

        {/* Search & Filters */}
        <div className="mb-6 space-y-4">
          <div className="relative max-w-lg mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input type="text" placeholder="Search destinations..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
              className="w-full rounded-full bg-card shadow-card pl-11 pr-5 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" />
          </div>
          <div className="flex flex-wrap justify-center gap-2">
            <span className="text-xs text-muted-foreground self-center mr-2">Season:</span>
            {seasons.map(s => (
              <button key={s} onClick={() => setSelectedSeason(selectedSeason === s ? null : s)}
                className={`rounded-full px-3 py-1.5 text-xs font-medium transition-all ${selectedSeason === s ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground hover:bg-secondary/80"}`}>
                {s}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap justify-center gap-2">
            <span className="text-xs text-muted-foreground self-center mr-2">Experience:</span>
            {allTags.map(t => (
              <button key={t} onClick={() => setSelectedTag(selectedTag === t ? null : t)}
                className={`rounded-full px-3 py-1.5 text-xs font-medium transition-all ${selectedTag === t ? "bg-accent text-accent-foreground" : "bg-secondary text-secondary-foreground hover:bg-secondary/80"}`}>
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Destination Carousel — moving Quick Jump */}
        <DestinationsCarousel
          items={filteredDestinations}
          activeName={expandedCity}
          onSelect={(name) => setExpandedCity(expandedCity === name ? null : name)}
        />

        {/* Destination Cards */}
        <div className="space-y-6">
          {filteredDestinations.map((d, i) => {
            const cityHosts = hosts.filter(h => h.city === d.name);
            const isExpanded = expandedCity === d.name;

            return (
              <motion.div key={d.name}
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.03 }}
                className={`rounded-2xl bg-card shadow-card transition-all duration-300 overflow-hidden ${isExpanded ? "shadow-elevated ring-2 ring-primary/20" : "hover:shadow-card-hover"}`}
              >
                {/* Card Header */}
                <div className="p-6 cursor-pointer" onClick={() => setExpandedCity(isExpanded ? null : d.name)}>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <MapPin className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <Link to={`/destination/${d.name.toLowerCase()}`} className="text-xl font-bold text-foreground hover:text-primary transition-colors">{d.name}</Link>
                          <p className="text-xs text-muted-foreground">{d.state}</p>
                        </div>
                        <Link to={`/destination/${d.name.toLowerCase()}`} className="text-sm font-medium text-primary ml-2 hover:underline">{d.tagline}</Link>
                      </div>
                      <p className="text-sm text-muted-foreground mt-2">{d.description}</p>

                      <div className="mt-3 flex flex-wrap gap-3">
                        <span className="flex items-center gap-1 text-xs text-muted-foreground"><Users className="w-3 h-3" /> {cityHosts.length > 0 ? `${cityHosts.length} hosts available` : `${d.hostCount} hosts`}</span>
                        {d.bestSeason && <span className="flex items-center gap-1 text-xs text-muted-foreground"><Sun className="w-3 h-3" /> {d.bestSeason}</span>}
                        {d.avgTemp && <span className="flex items-center gap-1 text-xs text-muted-foreground"><Thermometer className="w-3 h-3" /> {d.avgTemp}</span>}
                        {d.sites && <span className="flex items-center gap-1 text-xs text-muted-foreground"><Camera className="w-3 h-3" /> {d.sites.length} sites</span>}
                      </div>

                      {d.highlights && (
                        <div className="mt-3 flex flex-wrap gap-1.5">
                          {d.highlights.map(h => (
                            <span key={h} className="text-xs bg-secondary text-muted-foreground px-2 py-0.5 rounded-full">{h}</span>
                          ))}
                        </div>
                      )}
                      {d.experienceTags && d.experienceTags.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {d.experienceTags.map(tag => (
                            <span key={tag} className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">{tag}</span>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col items-end gap-3 shrink-0">
                      {cityHosts.length > 0 && (
                        <div className="flex -space-x-2">
                          {cityHosts.slice(0, 4).map(h => (
                            <img key={h.id} src={h.image} alt={h.name} className="w-8 h-8 rounded-full border-2 border-card object-cover" />
                          ))}
                          {cityHosts.length > 4 && (
                            <div className="w-8 h-8 rounded-full bg-primary/10 border-2 border-card flex items-center justify-center text-[10px] font-bold text-primary">+{cityHosts.length - 4}</div>
                          )}
                        </div>
                      )}
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${isExpanded ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"}`}>
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Expanded Content */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3 }} className="overflow-hidden">
                      <div className="px-6 pb-6 border-t border-border pt-4">
                        {/* Sites Grid */}
                        {d.sites && d.sites.length > 0 && (
                          <div>
                            <h4 className="font-bold text-foreground mb-4 flex items-center gap-2">
                              <Landmark className="w-4 h-4 text-primary" /> Sites & Monuments to Explore
                            </h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                              {d.sites.map((site) => {
                                const Icon = siteIcons[site.type] || Landmark;
                                const isSelected = selectedSite === `${d.name}-${site.name}`;
                                return (
                                  <motion.div key={site.name} whileHover={{ scale: 1.02 }}
                                    onClick={() => setSelectedSite(isSelected ? null : `${d.name}-${site.name}`)}
                                    className={`rounded-xl p-4 cursor-pointer transition-all ${isSelected ? "bg-primary/5 ring-1 ring-primary/30" : "bg-secondary/50 hover:bg-secondary"}`}>
                                    <div className="flex items-start gap-3">
                                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${siteColors[site.type] || "bg-secondary text-muted-foreground"}`}>
                                        <Icon className="w-4 h-4" />
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <h5 className="font-semibold text-foreground text-sm">{site.name}</h5>
                                        <span className="text-[10px] uppercase tracking-wider text-muted-foreground">{site.type}</span>
                                        <p className="text-xs text-muted-foreground mt-1">{site.description}</p>
                                        <div className="mt-2 flex flex-wrap gap-2 text-[11px]">
                                          {site.entryFee && <span className="flex items-center gap-0.5 text-muted-foreground"><IndianRupee className="w-2.5 h-2.5" /> {site.entryFee}</span>}
                                          {site.bestTime && <span className="flex items-center gap-0.5 text-muted-foreground"><Sun className="w-2.5 h-2.5" /> {site.bestTime}</span>}
                                          {site.duration && <span className="flex items-center gap-0.5 text-muted-foreground"><Clock className="w-2.5 h-2.5" /> {site.duration}</span>}
                                        </div>
                                      </div>
                                    </div>
                                  </motion.div>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        {/* Meet Your Local Hosts - Expanded Comparative View */}
                        {cityHosts.length > 0 && (
                          <div className="mt-6">
                            <h4 className="font-bold text-foreground mb-4 flex items-center gap-2">
                              <Users className="w-4 h-4 text-primary" /> Meet Your Local Hosts in {d.name}
                            </h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              {cityHosts.map(h => (
                                <Link to={`/host/${h.id}`} key={h.id}
                                  className="rounded-2xl bg-card border border-border p-4 hover:shadow-elevated transition-all group">
                                  <div className="flex items-start gap-4">
                                    <img src={h.image} alt={h.name} className="w-16 h-16 rounded-2xl object-cover" />
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center gap-2">
                                        <p className="font-bold text-foreground group-hover:text-primary transition-colors">{h.name}</p>
                                        {h.verified && <span className="text-[10px] bg-accent/10 text-accent px-1.5 py-0.5 rounded-full">✓ Verified</span>}
                                      </div>
                                      <p className="text-xs text-muted-foreground italic truncate">"{h.tagline}"</p>
                                      <div className="flex items-center gap-3 mt-2">
                                        <span className="text-xs font-semibold text-foreground flex items-center gap-0.5">
                                          <Star className="w-3 h-3 fill-primary text-primary" /> {h.rating}
                                        </span>
                                        <span className="text-xs text-muted-foreground">{h.reviewCount} reviews</span>
                                        <span className="text-xs font-bold text-primary">{format(h.pricePerDay)}/day</span>
                                      </div>
                                      {/* Services */}
                                      <div className="mt-2 flex flex-wrap gap-1">
                                        {h.services.map(s => (
                                          <span key={s} className="text-[10px] bg-secondary text-muted-foreground px-2 py-0.5 rounded-full">{s}</span>
                                        ))}
                                      </div>
                                      {/* Expertise */}
                                      {h.expertiseTags && (
                                        <div className="mt-1.5 flex flex-wrap gap-1">
                                          {h.expertiseTags.slice(0, 3).map(t => (
                                            <span key={t} className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full">{t}</span>
                                          ))}
                                        </div>
                                      )}
                                      {/* Languages */}
                                      <p className="text-[10px] text-muted-foreground mt-1">🗣️ {h.languages.join(", ")}</p>
                                    </div>
                                    <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors mt-2" />
                                  </div>
                                </Link>
                              ))}
                            </div>
                          </div>
                        )}

                        <div className="mt-4 flex justify-center">
                          <Link to="/explore">
                            <Button className="rounded-full gap-2">
                              Explore all hosts in {d.name} <ArrowRight className="w-4 h-4" />
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>

        {filteredDestinations.length === 0 && (
          <div className="text-center py-20">
            <p className="text-4xl mb-4">🗺️</p>
            <p className="text-lg font-semibold text-foreground">No destinations match your filters</p>
            <Button variant="outline" className="mt-4 rounded-full" onClick={() => { setSearchQuery(""); setSelectedSeason(null); setSelectedTag(null); }}>Clear filters</Button>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default Destinations;
