import { Link } from "react-router-dom";
import { Star } from "lucide-react";
import { motion } from "framer-motion";
import type { Host } from "@/lib/data";

interface HostCardProps {
  host: Host;
  index?: number;
}

const HostCard = ({ host, index = 0 }: HostCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
    >
      <Link to={`/host/${host.id}`} className="group block">
        <div className="relative rounded-lg bg-card p-2 shadow-card transition-all duration-300 hover:shadow-card-hover">
          <div className="relative aspect-[3/4] overflow-hidden rounded-md">
            <img src={host.image} alt={host.name} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
            {host.verified && (
              <div className="absolute bottom-3 left-3 flex items-center gap-2 rounded-full bg-foreground/20 px-3 py-1 backdrop-blur-md">
                <div className="h-2 w-2 rounded-full bg-accent animate-pulse-soft" />
                <span className="text-xs font-medium text-primary-foreground">Verified Host</span>
              </div>
            )}
          </div>
          <div className="mt-3 px-1 pb-2">
            <div className="flex justify-between items-start">
              <h3 className="text-lg font-semibold text-foreground">{host.name}, {host.city}</h3>
              <span className="flex items-center gap-1 text-sm font-medium text-foreground">
                <Star className="w-3 h-3 fill-primary text-primary" /> {host.rating}
              </span>
            </div>
            <p className="text-sm text-muted-foreground line-clamp-1">{host.tagline}</p>
            <div className="mt-3 flex gap-2">
              {host.services.map(s => (
                <span key={s} className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground border border-border px-2 py-0.5 rounded-sm">
                  {s}
                </span>
              ))}
            </div>
            <p className="mt-2 text-sm font-semibold text-foreground">From ${host.pricePerDay}<span className="font-normal text-muted-foreground">/day</span></p>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default HostCard;
