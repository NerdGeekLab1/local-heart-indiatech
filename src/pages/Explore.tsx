import { useState, useMemo } from "react";
import { Search, Filter, X, MapPin, Calendar, Tag, Award } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "@/components/Navbar";
import HostCard from "@/components/HostCard";
import Footer from "@/components/Footer";
import { hosts, vibeCategories } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const cities = [...new Set(hosts.map(h => h.city))];
const allExpertise = [...new Set(hosts.flatMap(h => h.expertiseTags || []))];
const specialTags = ["Explorer", "Travel Curator", "Adventurer", "Local Guide", "Cultural Expert", "Foodie Host"];

const Explore = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeVibe, setActiveVibe] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null);
  const [selectedExpertise, setSelectedExpertise] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const toggleExpertise = (e: string) => setSelectedExpertise(prev => prev.includes(e) ? prev.filter(x => x !== e) : [...prev, e]);
  const toggleTag = (t: string) => setSelectedTags(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t]);

  const activeFilterCount = [selectedCity, selectedMonth, selectedExpertise.length > 0, selectedTags.length > 0, activeVibe].filter(Boolean).length;

  const clearFilters = () => {
    setSelectedCity(null);
    setSelectedMonth(null);
    setSelectedExpertise([]);
    setSelectedTags([]);
    setActiveVibe(null);
    setSearchQuery("");
  };

  const filteredHosts = useMemo(() => {
    return hosts.filter(h => {
      const matchesSearch = !searchQuery || h.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        h.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
        h.tagline.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCity = !selectedCity || h.city === selectedCity;
      const matchesExpertise = selectedExpertise.length === 0 || selectedExpertise.some(e => h.expertiseTags?.includes(e));
      const matchesTags = selectedTags.length === 0 || selectedTags.some(t => h.expertiseTags?.includes(t));
      const matchesVibe = !activeVibe || h.specialties?.includes(activeVibe) || h.expertiseTags?.some(t => t.toLowerCase().includes(activeVibe!.toLowerCase()));
      return matchesSearch && matchesCity && matchesExpertise && matchesTags && matchesVibe;
    });
  }, [searchQuery, selectedCity, selectedMonth, selectedExpertise, selectedTags, activeVibe]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 mx-auto max-w-7xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground">Explore Hosts</h1>
          <p className="mt-2 text-muted-foreground">Find verified local companions across India</p>
        </motion.div>

        {/* Search & Filter Bar */}
        <div className="mt-8 flex gap-3 items-center">
          <div className="relative flex-1 max-w-lg">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by city, name, or vibe..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-full bg-card shadow-card pl-11 pr-5 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
          <Button
            variant={showFilters ? "default" : "outline"}
            className="rounded-full gap-2"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="w-4 h-4" />
            Filters
            {activeFilterCount > 0 && (
              <span className="w-5 h-5 rounded-full bg-primary-foreground text-primary text-xs flex items-center justify-center font-bold">{activeFilterCount}</span>
            )}
          </Button>
          {activeFilterCount > 0 && (
            <Button variant="ghost" size="sm" onClick={clearFilters} className="gap-1 text-muted-foreground">
              <X className="w-3 h-3" /> Clear
            </Button>
          )}
        </div>

        {/* Expanded Filters Panel */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="mt-4 rounded-2xl bg-card shadow-card p-6 space-y-5 border border-border">
                {/* Location Filter */}
                <div>
                  <h4 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-primary" /> Location
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {cities.map(city => (
                      <button key={city} onClick={() => setSelectedCity(selectedCity === city ? null : city)}
                        className={`rounded-full px-3 py-1.5 text-xs font-medium transition-all ${selectedCity === city ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground hover:bg-secondary/80"}`}>
                        {city}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Month Filter */}
                <div>
                  <h4 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-primary" /> Available Month
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {months.map(m => (
                      <button key={m} onClick={() => setSelectedMonth(selectedMonth === m ? null : m)}
                        className={`rounded-full px-3 py-1.5 text-xs font-medium transition-all ${selectedMonth === m ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground hover:bg-secondary/80"}`}>
                        {m}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Expertise Filter */}
                <div>
                  <h4 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
                    <Award className="w-4 h-4 text-primary" /> Expertise
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {allExpertise.map(e => (
                      <button key={e} onClick={() => toggleExpertise(e)}
                        className={`rounded-full px-3 py-1.5 text-xs font-medium transition-all ${selectedExpertise.includes(e) ? "bg-accent text-accent-foreground" : "bg-secondary text-secondary-foreground hover:bg-secondary/80"}`}>
                        {e}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Explorer & Travel Tags */}
                <div>
                  <h4 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
                    <Tag className="w-4 h-4 text-primary" /> Explorer & Travel Tags
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {specialTags.map(t => (
                      <button key={t} onClick={() => toggleTag(t)}
                        className={`rounded-full px-3 py-1.5 text-xs font-medium transition-all ${selectedTags.includes(t) ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground hover:bg-secondary/80"}`}>
                        🏷️ {t}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Active Filters Tags */}
        {activeFilterCount > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {selectedCity && <Badge variant="secondary" className="gap-1">📍 {selectedCity} <X className="w-3 h-3 cursor-pointer" onClick={() => setSelectedCity(null)} /></Badge>}
            {selectedMonth && <Badge variant="secondary" className="gap-1">📅 {selectedMonth} <X className="w-3 h-3 cursor-pointer" onClick={() => setSelectedMonth(null)} /></Badge>}
            {selectedExpertise.map(e => <Badge key={e} variant="secondary" className="gap-1">🏅 {e} <X className="w-3 h-3 cursor-pointer" onClick={() => toggleExpertise(e)} /></Badge>)}
            {selectedTags.map(t => <Badge key={t} variant="secondary" className="gap-1">🏷️ {t} <X className="w-3 h-3 cursor-pointer" onClick={() => toggleTag(t)} /></Badge>)}
            {activeVibe && <Badge variant="secondary" className="gap-1">✨ {activeVibe} <X className="w-3 h-3 cursor-pointer" onClick={() => setActiveVibe(null)} /></Badge>}
          </div>
        )}

        {/* Vibes */}
        <div className="mt-6 flex flex-wrap gap-2">
          {vibeCategories.map(v => (
            <button
              key={v.label}
              onClick={() => setActiveVibe(activeVibe === v.label ? null : v.label)}
              className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-all ${
                activeVibe === v.label
                  ? "bg-primary text-primary-foreground shadow-card"
                  : "bg-secondary text-secondary-foreground hover:shadow-card"
              }`}
            >
              <span>{v.emoji}</span> {v.label}
            </button>
          ))}
        </div>

        {/* Results Count */}
        <div className="mt-6 flex items-center justify-between">
          <p className="text-sm text-muted-foreground">{filteredHosts.length} host{filteredHosts.length !== 1 ? "s" : ""} found</p>
        </div>

        {/* Grid */}
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredHosts.map((host, i) => (
            <HostCard key={host.id} host={host} index={i} />
          ))}
        </div>

        {filteredHosts.length === 0 && (
          <div className="text-center py-20">
            <p className="text-4xl mb-4">🔍</p>
            <p className="text-lg font-semibold text-foreground">No hosts found</p>
            <p className="text-muted-foreground mt-1">Try adjusting your filters or search query</p>
            <Button variant="outline" className="mt-4 rounded-full" onClick={clearFilters}>Clear all filters</Button>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default Explore;
