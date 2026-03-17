import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { MapPin, Users, ArrowRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { destinations, hosts } from "@/lib/data";

const Destinations = () => (
  <div className="min-h-screen bg-background">
    <Navbar />
    <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 mx-auto max-w-7xl">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl sm:text-4xl font-bold text-foreground">Destinations</h1>
        <p className="mt-2 text-muted-foreground">Explore India's most extraordinary cities with local hosts</p>
      </motion.div>

      <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {destinations.map((d, i) => {
          const cityHosts = hosts.filter(h => h.city === d.name);
          return (
            <motion.div key={d.name} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}>
              <div className="rounded-lg bg-card shadow-card hover:shadow-card-hover transition-shadow p-6 h-full flex flex-col">
                <div className="flex items-center gap-2 mb-3">
                  <MapPin className="w-5 h-5 text-primary" />
                  <h3 className="text-lg font-bold text-foreground">{d.name}</h3>
                  <span className="text-xs bg-secondary text-muted-foreground px-2 py-0.5 rounded-full ml-auto">{d.state}</span>
                </div>
                <p className="text-primary font-medium text-sm mb-2">{d.tagline}</p>
                <p className="text-sm text-muted-foreground flex-1">{d.description}</p>
                <div className="mt-4 flex items-center justify-between">
                  <span className="flex items-center gap-1 text-xs text-muted-foreground"><Users className="w-3 h-3" />{d.hostCount} hosts</span>
                  {cityHosts.length > 0 && (
                    <div className="flex -space-x-2">
                      {cityHosts.slice(0, 3).map(h => (
                        <img key={h.id} src={h.image} alt={h.name} className="w-6 h-6 rounded-full border-2 border-card object-cover" />
                      ))}
                    </div>
                  )}
                </div>
                <Link to="/explore" className="mt-3 flex items-center gap-1 text-sm text-primary font-medium hover:underline">
                  Explore hosts <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
    <Footer />
  </div>
);

export default Destinations;
