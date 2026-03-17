import { useState } from "react";
import { Search } from "lucide-react";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import HostCard from "@/components/HostCard";
import Footer from "@/components/Footer";
import { hosts, vibeCategories } from "@/lib/data";

const Explore = () => {
  const [activeVibe, setActiveVibe] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredHosts = hosts.filter(h =>
    h.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    h.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
    h.tagline.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 mx-auto max-w-7xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground">Explore Hosts</h1>
          <p className="mt-2 text-muted-foreground">Find verified local companions across India</p>
        </motion.div>

        {/* Search */}
        <div className="mt-8 relative max-w-lg">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by city, name, or vibe..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-full bg-card shadow-card pl-11 pr-5 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>

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

        {/* Grid */}
        <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredHosts.map((host, i) => (
            <HostCard key={host.id} host={host} index={i} />
          ))}
        </div>

        {filteredHosts.length === 0 && (
          <div className="text-center py-20">
            <p className="text-muted-foreground">No hosts found. Try a different search.</p>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default Explore;
