import { useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { MapPin, Users, ArrowRight, Clock, IndianRupee, Camera, ChevronDown, ChevronUp, Landmark, TreePine, ShoppingBag, Sun, Thermometer, Star, Search, X, Map as MapIcon, CalendarDays } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SiteMarkerMap from "@/components/admin/SiteMarkerMap";
import { usePublicDestinations, type PublicDestination } from "@/hooks/useDestinations";
import { useDbHosts } from "@/hooks/use-db-hosts";
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
  const { data: destinations = [], isLoading } = usePublicDestinations();
  const { hosts } = useDbHosts();

  const [expandedCity, setExpandedCity] = useState<string | null>(null);
  const [selectedSite, setSelectedSite] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedState, setSelectedState] = useState<string | null>(null);
  const [selectedSeason, setSelectedSeason] = useState<string | null>(null);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  // Every filter option comes from the admin-managed destination rows.
  const states = useMemo(
    () => [...new Set(destinations.map(d => d.state).filter(Boolean))].sort(),
    [destinations],
  );
  const seasons = useMemo(
    () => [...new Set(destinations.map(d => d.best_season).filter(Boolean))].sort() as string[],
    [destinations],
  );
  const allTags = useMemo(
    () => [...new Set(destinations.flatMap(d => d.experience_tags || []))].sort(),
    [destinations],
  );

  const hostsByCity = useMemo(() => {
    const map = new Map<string, typeof hosts>();
    for (const h of hosts) {
      const key = (h.city || "").toLowerCase();
      if (!key) continue;
      map.set(key, [...(map.get(key) || []), h]);
    }
    return map;
  }, [hosts]);

  const activeFilters = [selectedState, selectedSeason, selectedTag, searchQuery.trim() || null].filter(Boolean).length;
  const clearFilters = () => {
    setSearchQuery("");
    setSelectedState(null);
    setSelectedSeason(null);
    setSelectedTag(null);
  };

  const filteredDestinations = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return destinations.filter(d => {
      const matchesSearch = !q ||
        `${d.name} ${d.state} ${d.tagline} ${(d.highlights || []).join(" ")}`.toLowerCase().includes(q);
      const matchesState = !selectedState || d.state === selectedState;
      const matchesSeason = !selectedSeason || d.best_season === selectedSeason;
      const matchesTag = !selectedTag || (d.experience_tags || []).includes(selectedTag);
      return matchesSearch && matchesState && matchesSeason && matchesTag;
    });
  }, [destinations, searchQuery, selectedState, selectedSeason, selectedTag]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 mx-auto max-w-7xl">
        {/* Hero */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
          <h1 className="text-4xl sm:text-5xl font-bold text-foreground">Explore India's Wonders</h1>
          <p className="mt-3 text-lg text-muted-foreground max-w-2xl mx-auto">
            Pin-drop into India's most extraordinary places. Discover monuments, temples, palaces and hidden gems with local hosts.
          </p>
        </motion.div>

        {/* Search & Filters */}
        <div className="mb-6 space-y-4">
          <div className="relative max-w-lg mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input type="text" placeholder="Search destinations, states or highlights…" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
              className="w-full rounded-full bg-card shadow-card pl-11 pr-5 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" />
          </div>

          <FilterRow label="Region" options={states} value={selectedState} onChange={setSelectedState} activeClass="bg-primary text-primary-foreground" />
          <FilterRow label="Season" options={seasons} value={selectedSeason} onChange={setSelectedSeason} activeClass="bg-primary text-primary-foreground" />
          <FilterRow label="Experience" options={allTags} value={selectedTag} onChange={setSelectedTag} activeClass="bg-accent text-accent-foreground" />

          <div className="flex items-center justify-center gap-3 text-sm text-muted-foreground">
            <span>{filteredDestinations.length} of {destinations.length} destinations</span>
            {activeFilters > 0 && (
              <Button variant="ghost" size="sm" className="gap-1 rounded-full" onClick={clearFilters}>
                <X className="w-3 h-3" /> Clear filters
              </Button>
            )}
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[0, 1, 2, 3].map(i => <Skeleton key={i} className="h-40 w-full rounded-2xl" />)}
          </div>
        ) : (
          <>
            <DestinationsCarousel
              items={filteredDestinations}
              activeName={expandedCity}
              hostsByCity={hostsByCity}
              onSelect={(name) => setExpandedCity(expandedCity === name ? null : name)}
            />

            <div className="space-y-6">
              {filteredDestinations.map((d, i) => {
                const cityHosts = hostsByCity.get(d.name.toLowerCase()) || [];
                const isExpanded = expandedCity === d.name;
                const pins = (d.sites || []).filter(s => s.latitude != null && s.longitude != null);

                return (
                  <motion.div key={d.id}
                    initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: Math.min(i, 8) * 0.03 }}
                    className={`rounded-2xl bg-card shadow-card transition-all duration-300 overflow-hidden ${isExpanded ? "shadow-elevated ring-2 ring-primary/20" : "hover:shadow-card-hover"}`}
                  >
                    <div className="p-6 cursor-pointer" onClick={() => setExpandedCity(isExpanded ? null : d.name)}>
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex flex-wrap items-center gap-3 mb-2">
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                              <MapPin className="w-5 h-5 text-primary" />
                            </div>
                            <div>
                              <Link to={`/destination/${d.slug}`} onClick={e => e.stopPropagation()} className="text-xl font-bold text-foreground hover:text-primary transition-colors">{d.name}</Link>
                              <p className="text-xs text-muted-foreground">{d.state}</p>
                            </div>
                            <Link to={`/destination/${d.slug}`} onClick={e => e.stopPropagation()} className="text-sm font-medium text-primary ml-2 hover:underline">{d.tagline}</Link>
                          </div>
                          <p className="text-sm text-muted-foreground mt-2">{d.description}</p>

                          <div className="mt-3 flex flex-wrap gap-3">
                            <span className="flex items-center gap-1 text-xs text-muted-foreground"><Users className="w-3 h-3" /> {cityHosts.length} host{cityHosts.length === 1 ? "" : "s"} available</span>
                            {d.best_season && <span className="flex items-center gap-1 text-xs text-muted-foreground"><Sun className="w-3 h-3" /> {d.best_season}</span>}
                            {d.avg_temp && <span className="flex items-center gap-1 text-xs text-muted-foreground"><Thermometer className="w-3 h-3" /> {d.avg_temp}</span>}
                            {d.sites.length > 0 && <span className="flex items-center gap-1 text-xs text-muted-foreground"><Camera className="w-3 h-3" /> {d.sites.length} sites</span>}
                            {(d.itinerary || []).length > 0 && <span className="flex items-center gap-1 text-xs text-muted-foreground"><CalendarDays className="w-3 h-3" /> {d.itinerary.length}-day route</span>}
                          </div>

                          {(d.highlights || []).length > 0 && (
                            <div className="mt-3 flex flex-wrap gap-1.5">
                              {d.highlights.map(h => (
                                <span key={h} className="text-xs bg-secondary text-muted-foreground px-2 py-0.5 rounded-full">{h}</span>
                              ))}
                            </div>
                          )}
                          {(d.experience_tags || []).length > 0 && (
                            <div className="mt-2 flex flex-wrap gap-1.5">
                              {d.experience_tags.map(tag => (
                                <button key={tag} onClick={e => { e.stopPropagation(); setSelectedTag(selectedTag === tag ? null : tag); }}
                                  className={`text-[10px] px-2 py-0.5 rounded-full font-medium transition-colors ${selectedTag === tag ? "bg-accent text-accent-foreground" : "bg-primary/10 text-primary hover:bg-primary/20"}`}>
                                  {tag}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>

                        <div className="flex flex-col items-end gap-3 shrink-0">
                          {cityHosts.length > 0 && (
                            <div className="flex -space-x-2">
                              {cityHosts.slice(0, 4).map(h => (
                                <img key={h.id} src={h.avatar_url || "/placeholder.svg"} alt={h.name} loading="lazy" className="w-8 h-8 rounded-full border-2 border-card object-cover" />
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

                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3 }} className="overflow-hidden">
                          <div className="px-6 pb-6 border-t border-border pt-4">
                            {pins.length > 0 && (
                              <div className="mb-6">
                                <h4 className="font-bold text-foreground mb-3 flex items-center gap-2">
                                  <MapIcon className="w-4 h-4 text-primary" /> Map of {d.name}
                                </h4>
                                <SiteMarkerMap
                                  markers={pins.map(s => ({ id: s.id, name: s.name, type: s.type, latitude: Number(s.latitude), longitude: Number(s.longitude) }))}
                                  center={d.latitude && d.longitude ? { lat: Number(d.latitude), lng: Number(d.longitude) } : null}
                                  activeId={pins.find(s => selectedSite === `${d.id}-${s.id}`)?.id}
                                  onMarkerClick={(id) => setSelectedSite(`${d.id}-${id}`)}
                                  height="300px"
                                  zoom={11}
                                />
                              </div>
                            )}

                            {d.sites.length > 0 && (
                              <div>
                                <h4 className="font-bold text-foreground mb-4 flex items-center gap-2">
                                  <Landmark className="w-4 h-4 text-primary" /> Sites & Monuments to Explore
                                </h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                  {d.sites.map(site => {
                                    const Icon = siteIcons[site.type] || Landmark;
                                    const isSelected = selectedSite === `${d.id}-${site.id}`;
                                    return (
                                      <motion.div key={site.id} whileHover={{ scale: 1.02 }}
                                        onClick={() => setSelectedSite(isSelected ? null : `${d.id}-${site.id}`)}
                                        className={`rounded-xl p-4 cursor-pointer transition-all ${isSelected ? "bg-primary/5 ring-1 ring-primary/30" : "bg-secondary/50 hover:bg-secondary"}`}>
                                        <div className="flex items-start gap-3">
                                          {site.image_url ? (
                                            <img src={site.image_url} alt={site.name} loading="lazy" className="w-12 h-12 rounded-lg object-cover shrink-0" />
                                          ) : (
                                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${siteColors[site.type] || "bg-secondary text-muted-foreground"}`}>
                                              <Icon className="w-4 h-4" />
                                            </div>
                                          )}
                                          <div className="flex-1 min-w-0">
                                            <h5 className="font-semibold text-foreground text-sm">{site.name}</h5>
                                            <span className="text-[10px] uppercase tracking-wider text-muted-foreground">{site.type}</span>
                                            <p className="text-xs text-muted-foreground mt-1">{site.description}</p>
                                            <div className="mt-2 flex flex-wrap gap-2 text-[11px]">
                                              {site.entry_fee && <span className="flex items-center gap-0.5 text-muted-foreground"><IndianRupee className="w-2.5 h-2.5" /> {site.entry_fee}</span>}
                                              {site.best_time && <span className="flex items-center gap-0.5 text-muted-foreground"><Sun className="w-2.5 h-2.5" /> {site.best_time}</span>}
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

                            {(d.itinerary || []).length > 0 && (
                              <div className="mt-6">
                                <h4 className="font-bold text-foreground mb-3 flex items-center gap-2">
                                  <CalendarDays className="w-4 h-4 text-primary" /> Suggested itinerary
                                </h4>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                  {d.itinerary.map((day, j) => (
                                    <div key={j} className="rounded-xl bg-secondary/50 p-4">
                                      <p className="text-sm font-semibold text-foreground">{day.title}</p>
                                      <ul className="mt-2 space-y-1">
                                        {(day.places || []).map(p => (
                                          <li key={p} className="text-xs text-muted-foreground flex items-start gap-1.5">
                                            <MapPin className="w-3 h-3 text-primary mt-0.5 shrink-0" /> {p}
                                          </li>
                                        ))}
                                      </ul>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {cityHosts.length > 0 && (
                              <div className="mt-6">
                                <h4 className="font-bold text-foreground mb-4 flex items-center gap-2">
                                  <Users className="w-4 h-4 text-primary" /> Meet Your Local Hosts in {d.name}
                                </h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                  {cityHosts.map(h => (
                                    <Link to={`/host/${h.username || h.id}`} key={h.id}
                                      className="rounded-2xl bg-card border border-border p-4 hover:shadow-elevated transition-all group">
                                      <div className="flex items-start gap-4">
                                        <img src={h.avatar_url || "/placeholder.svg"} alt={h.name} loading="lazy" className="w-16 h-16 rounded-2xl object-cover" />
                                        <div className="flex-1 min-w-0">
                                          <p className="font-bold text-foreground group-hover:text-primary transition-colors truncate">{h.name}</p>
                                          {h.tagline && <p className="text-xs text-muted-foreground italic truncate">"{h.tagline}"</p>}
                                          <div className="flex items-center gap-3 mt-2">
                                            <span className="text-xs font-semibold text-foreground flex items-center gap-0.5">
                                              <Star className="w-3 h-3 fill-primary text-primary" /> {h.rating || "New"}
                                            </span>
                                            <span className="text-xs text-muted-foreground">{h.reviewCount} reviews</span>
                                            {h.pricePerDay > 0 && <span className="text-xs font-bold text-primary">{format(h.pricePerDay)}/day</span>}
                                          </div>
                                          <div className="mt-2 flex flex-wrap gap-1">
                                            {(h.services || []).slice(0, 4).map(s => (
                                              <span key={s} className="text-[10px] bg-secondary text-muted-foreground px-2 py-0.5 rounded-full">{s}</span>
                                            ))}
                                          </div>
                                          {(h.specialties || []).length > 0 && (
                                            <div className="mt-1.5 flex flex-wrap gap-1">
                                              {h.specialties.slice(0, 3).map(t => (
                                                <span key={t} className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full">{t}</span>
                                              ))}
                                            </div>
                                          )}
                                          {(h.languages || []).length > 0 && <p className="text-[10px] text-muted-foreground mt-1">🗣️ {h.languages.join(", ")}</p>}
                                        </div>
                                        <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors mt-2" />
                                      </div>
                                    </Link>
                                  ))}
                                </div>
                              </div>
                            )}

                            <div className="mt-4 flex flex-wrap justify-center gap-3">
                              <Link to={`/destination/${d.slug}`}>
                                <Button variant="outline" className="rounded-full gap-2">Full {d.name} guide</Button>
                              </Link>
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
                <Button variant="outline" className="mt-4 rounded-full" onClick={clearFilters}>Clear filters</Button>
              </div>
            )}
          </>
        )}
      </div>
      <Footer />
    </div>
  );
};

const FilterRow = ({ label, options, value, onChange, activeClass }: {
  label: string; options: string[]; value: string | null; onChange: (v: string | null) => void; activeClass: string;
}) => {
  const [showAll, setShowAll] = useState(false);
  if (options.length === 0) return null;
  const visible = showAll ? options : options.slice(0, 12);
  return (
    <div className="flex flex-wrap justify-center gap-2">
      <span className="text-xs text-muted-foreground self-center mr-2">{label}:</span>
      {visible.map(o => (
        <button key={o} onClick={() => onChange(value === o ? null : o)}
          className={`rounded-full px-3 py-1.5 text-xs font-medium transition-all ${value === o ? activeClass : "bg-secondary text-secondary-foreground hover:bg-secondary/80"}`}>
          {o}
        </button>
      ))}
      {options.length > 12 && (
        <button onClick={() => setShowAll(!showAll)} className="rounded-full px-3 py-1.5 text-xs font-semibold text-primary hover:underline">
          {showAll ? "Show less" : `+${options.length - 12} more`}
        </button>
      )}
    </div>
  );
};

interface CarouselProps {
  items: PublicDestination[];
  activeName: string | null;
  hostsByCity: Map<string, { id: string }[]>;
  onSelect: (name: string) => void;
}

const DestinationsCarousel = ({ items, activeName, hostsByCity, onSelect }: CarouselProps) => {
  const autoplay = useRef(Autoplay({ delay: 2200, stopOnInteraction: false, stopOnMouseEnter: true }));
  const [emblaRef] = useEmblaCarousel(
    { loop: true, dragFree: true, align: "start", containScroll: "trimSnaps" },
    [autoplay.current]
  );

  if (items.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.2 }}
      className="mb-12 rounded-2xl bg-gradient-to-br from-primary/5 via-card to-accent/5 shadow-elevated p-6 sm:p-8 relative overflow-hidden"
    >
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
          <MapPin className="w-5 h-5 text-primary" /> Quick Jump
        </h2>
        <span className="text-xs text-muted-foreground">{items.length} destinations · auto-scrolling</span>
      </div>
      <div className="overflow-hidden -mx-2" ref={emblaRef}>
        <div className="flex">
          {items.map(d => {
            const cityHosts = hostsByCity.get(d.name.toLowerCase()) || [];
            const isActive = activeName === d.name;
            return (
              <div key={d.id} className="shrink-0 px-2 basis-1/2 sm:basis-1/3 md:basis-1/5 lg:basis-[14.2857%]">
                <button
                  onClick={() => onSelect(d.name)}
                  className={`w-full relative rounded-xl p-4 text-center transition-all duration-300 hover:shadow-card-hover cursor-pointer ${
                    isActive ? "bg-primary text-primary-foreground shadow-elevated scale-[1.03]" : "bg-card hover:bg-secondary/60"
                  }`}
                >
                  <div className={`w-10 h-10 rounded-full mx-auto mb-2 flex items-center justify-center text-lg ${isActive ? "bg-primary-foreground/20" : "bg-primary/10"}`}>📍</div>
                  <p className={`font-bold text-sm truncate ${isActive ? "text-primary-foreground" : "text-foreground"}`}>{d.name}</p>
                  <p className={`text-xs mt-0.5 truncate ${isActive ? "text-primary-foreground/80" : "text-muted-foreground"}`}>{d.state}</p>
                  {cityHosts.length > 0 && (
                    <span className={`absolute -top-1 -right-1 w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center ${isActive ? "bg-primary-foreground text-primary" : "bg-primary text-primary-foreground"}`}>
                      {cityHosts.length}
                    </span>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
};

export default Destinations;
