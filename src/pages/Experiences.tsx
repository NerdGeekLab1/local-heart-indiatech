import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Search, Play } from "lucide-react";
import Navbar from "@/components/Navbar";
import ExperienceCard from "@/components/ExperienceCard";
import Footer from "@/components/Footer";
import { experiences, vibeCategories } from "@/lib/data";

const Experiences = () => {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const filtered = experiences.filter(e => {
    const matchesSearch = e.title.toLowerCase().includes(searchQuery.toLowerCase()) || e.hostCity.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !activeCategory || e.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 mx-auto max-w-7xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground">Unforgettable Experiences</h1>
          <p className="mt-2 text-muted-foreground">Curated moments that you can't find in guidebooks</p>
        </motion.div>

        <div className="mt-8 relative max-w-lg">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search experiences..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full rounded-full bg-card shadow-card pl-11 pr-5 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          {vibeCategories.map(v => (
            <button key={v.label} onClick={() => setActiveCategory(activeCategory === v.label ? null : v.label)}
              className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-all ${activeCategory === v.label ? "bg-primary text-primary-foreground shadow-card" : "bg-secondary text-secondary-foreground hover:shadow-card"}`}>
              <span>{v.emoji}</span> {v.label}
            </button>
          ))}
        </div>

        {/* Video Timeline Section */}
        <div className="mt-12">
          <h2 className="text-xl font-bold text-foreground mb-4">📹 Experience Highlights</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {experiences.slice(0, 4).map((exp, i) => (
              <motion.div key={exp.id} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="relative aspect-[9/16] rounded-lg overflow-hidden group cursor-pointer">
                <img src={exp.image} alt={exp.title} className="h-full w-full object-cover" />
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

        <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filtered.map((exp, i) => (
            <Link to={`/experience/${exp.id}`} key={exp.id}>
              <ExperienceCard experience={exp} index={i} />
            </Link>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-20">
            <p className="text-muted-foreground">No experiences found. Try a different search or category.</p>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default Experiences;
