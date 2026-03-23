import { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Users, ArrowRight, Clock, IndianRupee, Camera, ChevronDown, ChevronUp, Landmark, TreePine, ShoppingBag, Sun, Thermometer, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { destinations, hosts } from "@/lib/data";

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
  const [expandedCity, setExpandedCity] = useState<string | null>(null);
  const [selectedSite, setSelectedSite] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 mx-auto max-w-7xl">
        {/* Hero */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold text-foreground">Explore India's Wonders</h1>
          <p className="mt-3 text-lg text-muted-foreground max-w-2xl mx-auto">
            Pin-drop into India's most extraordinary cities. Discover monuments, temples, palaces, and hidden gems with local hosts.
          </p>
        </motion.div>

        {/* Interactive Map Overview */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
          className="mb-12 rounded-2xl bg-card shadow-elevated p-6 sm:p-8 relative overflow-hidden">
          <div className="absolute inset-0 opacity-5" style={{ backgroundImage: "url('data:image/svg+xml;charset=utf-8,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 800 600%22%3E%3Cpath d=%22M400 50 L550 200 L500 350 L600 500 L350 550 L200 400 L250 250 L350 200Z%22 fill=%22none%22 stroke=%22%23E97451%22 stroke-width=%222%22/%3E%3C/svg%3E')" }} />
          <h2 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-primary" /> Destination Map
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {destinations.map((d, i) => (
              <motion.button key={d.name}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => setExpandedCity(expandedCity === d.name ? null : d.name)}
                className={`relative group rounded-xl p-4 text-center transition-all duration-300 hover:shadow-card-hover cursor-pointer ${expandedCity === d.name ? "bg-primary text-primary-foreground shadow-elevated scale-105" : "bg-secondary hover:bg-secondary/80"}`}
              >
                <div className={`w-10 h-10 rounded-full mx-auto mb-2 flex items-center justify-center text-lg ${expandedCity === d.name ? "bg-primary-foreground/20" : "bg-primary/10"}`}>
                  📍
                </div>
                <p className={`font-bold text-sm ${expandedCity === d.name ? "text-primary-foreground" : "text-foreground"}`}>{d.name}</p>
                <p className={`text-xs mt-0.5 ${expandedCity === d.name ? "text-primary-foreground/80" : "text-muted-foreground"}`}>{d.state}</p>
                {d.sites && d.sites.length > 0 && (
                  <span className={`absolute -top-1 -right-1 w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center ${expandedCity === d.name ? "bg-primary-foreground text-primary" : "bg-primary text-primary-foreground"}`}>
                    {d.sites.length}
                  </span>
                )}
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Destination Cards */}
        <div className="space-y-6">
          {destinations.map((d, i) => {
            const cityHosts = hosts.filter(h => h.city === d.name);
            const isExpanded = expandedCity === d.name;

            return (
              <motion.div key={d.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.03 }}
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

                      {/* Quick Info */}
                      <div className="mt-3 flex flex-wrap gap-3">
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Users className="w-3 h-3" /> {d.hostCount} hosts
                        </span>
                        {d.bestSeason && (
                          <span className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Sun className="w-3 h-3" /> {d.bestSeason}
                          </span>
                        )}
                        {d.avgTemp && (
                          <span className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Thermometer className="w-3 h-3" /> {d.avgTemp}
                          </span>
                        )}
                        {d.sites && (
                          <span className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Camera className="w-3 h-3" /> {d.sites.length} sites to visit
                          </span>
                        )}
                      </div>

                      {/* Highlights */}
                      {d.highlights && (
                        <div className="mt-3 flex flex-wrap gap-1.5">
                          {d.highlights.map(h => (
                            <span key={h} className="text-xs bg-secondary text-muted-foreground px-2 py-0.5 rounded-full">{h}</span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Host Avatars & Expand */}
                    <div className="flex flex-col items-end gap-3 shrink-0">
                      {cityHosts.length > 0 && (
                        <div className="flex -space-x-2">
                          {cityHosts.slice(0, 3).map(h => (
                            <img key={h.id} src={h.image} alt={h.name} className="w-8 h-8 rounded-full border-2 border-card object-cover" />
                          ))}
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
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
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
                                  <motion.div key={site.name}
                                    whileHover={{ scale: 1.02 }}
                                    onClick={() => setSelectedSite(isSelected ? null : `${d.name}-${site.name}`)}
                                    className={`rounded-xl p-4 cursor-pointer transition-all ${isSelected ? "bg-primary/5 ring-1 ring-primary/30" : "bg-secondary/50 hover:bg-secondary"}`}
                                  >
                                    <div className="flex items-start gap-3">
                                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${siteColors[site.type] || "bg-secondary text-muted-foreground"}`}>
                                        <Icon className="w-4 h-4" />
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <h5 className="font-semibold text-foreground text-sm">{site.name}</h5>
                                        <span className="text-[10px] uppercase tracking-wider text-muted-foreground">{site.type}</span>
                                        <p className="text-xs text-muted-foreground mt-1">{site.description}</p>
                                        <div className="mt-2 flex flex-wrap gap-2 text-[11px]">
                                          {site.entryFee && (
                                            <span className="flex items-center gap-0.5 text-muted-foreground">
                                              <IndianRupee className="w-2.5 h-2.5" /> {site.entryFee}
                                            </span>
                                          )}
                                          {site.bestTime && (
                                            <span className="flex items-center gap-0.5 text-muted-foreground">
                                              <Sun className="w-2.5 h-2.5" /> {site.bestTime}
                                            </span>
                                          )}
                                          {site.duration && (
                                            <span className="flex items-center gap-0.5 text-muted-foreground">
                                              <Clock className="w-2.5 h-2.5" /> {site.duration}
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  </motion.div>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        {/* City Hosts */}
                        {cityHosts.length > 0 && (
                          <div className="mt-6">
                            <h4 className="font-bold text-foreground mb-3 flex items-center gap-2">
                              <Users className="w-4 h-4 text-primary" /> Hosts in {d.name}
                            </h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              {cityHosts.map(h => (
                                <Link to={`/host/${h.id}`} key={h.id}
                                  className="flex items-center gap-3 rounded-xl bg-secondary/50 p-3 hover:bg-secondary transition-colors group">
                                  <img src={h.image} alt={h.name} className="w-12 h-12 rounded-full object-cover" />
                                  <div className="flex-1 min-w-0">
                                    <p className="font-semibold text-foreground text-sm group-hover:text-primary transition-colors">{h.name}</p>
                                    <p className="text-xs text-muted-foreground truncate">{h.tagline}</p>
                                    <div className="flex items-center gap-2 mt-0.5">
                                      <span className="text-xs text-muted-foreground flex items-center gap-0.5"><Star className="w-3 h-3 fill-primary text-primary" /> {h.rating}</span>
                                      <span className="text-xs text-muted-foreground">${h.pricePerDay}/day</span>
                                    </div>
                                  </div>
                                  <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
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
      </div>
      <Footer />
    </div>
  );
};

export default Destinations;
