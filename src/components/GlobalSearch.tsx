import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Search, X, MapPin, Users, Compass, Globe } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { hosts, destinations } from "@/lib/data";

interface SearchResult {
  type: "host" | "experience" | "trip" | "destination";
  id: string;
  title: string;
  subtitle: string;
  icon: React.ElementType;
}

const GlobalSearch = ({ onClose }: { onClose: () => void }) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!query.trim()) { setResults([]); return; }
    const timeout = setTimeout(async () => {
      setLoading(true);
      const q = query.toLowerCase();
      const items: SearchResult[] = [];

      // Search mock hosts
      hosts.filter(h =>
        h.name.toLowerCase().includes(q) || h.city.toLowerCase().includes(q)
      ).slice(0, 3).forEach(h => {
        items.push({ type: "host", id: h.id, title: h.name, subtitle: `${h.city} · ★${h.rating}`, icon: Users });
      });

      // Search destinations
      destinations.filter(d =>
        d.name.toLowerCase().includes(q) || d.state.toLowerCase().includes(q)
      ).slice(0, 3).forEach(d => {
        items.push({ type: "destination", id: d.name.toLowerCase(), title: d.name, subtitle: d.state, icon: MapPin });
      });

      // Search DB experiences
      const { data: exps } = await supabase
        .from("experiences")
        .select("id, title, category, location")
        .or(`title.ilike.%${query}%,category.ilike.%${query}%,location.ilike.%${query}%`)
        .eq("status", "approved")
        .limit(4);

      exps?.forEach(e => {
        items.push({ type: "experience", id: e.id, title: e.title, subtitle: `${e.category} · ${e.location}`, icon: Globe });
      });

      // Search DB trips
      const { data: trips } = await supabase
        .from("trip_listings")
        .select("id, title, destination, trip_type")
        .or(`title.ilike.%${query}%,destination.ilike.%${query}%`)
        .eq("status", "active")
        .limit(4);

      trips?.forEach(t => {
        items.push({ type: "trip", id: t.id, title: t.title, subtitle: `${t.destination || "Various"} · ${t.trip_type?.replace("_", " ")}`, icon: Compass });
      });

      setResults(items);
      setLoading(false);
    }, 300);

    return () => clearTimeout(timeout);
  }, [query]);

  const handleSelect = (r: SearchResult) => {
    onClose();
    switch (r.type) {
      case "host": navigate(`/host/${r.id}`); break;
      case "experience": navigate(`/experience/${r.id}`); break;
      case "trip": navigate(`/trip/${r.id}`); break;
      case "destination": navigate(`/destination/${r.id}`); break;
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] bg-foreground/50 backdrop-blur-sm flex items-start justify-center pt-20 px-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
          className="w-full max-w-xl bg-card rounded-2xl shadow-elevated overflow-hidden"
          onClick={e => e.stopPropagation()}
        >
          <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
            <Search className="w-5 h-5 text-muted-foreground shrink-0" />
            <input
              ref={inputRef}
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search hosts, experiences, trips, destinations..."
              className="flex-1 bg-transparent text-foreground text-sm outline-none placeholder:text-muted-foreground"
            />
            <button onClick={onClose} className="p-1 hover:bg-secondary rounded-md">
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>

          <div className="max-h-[60vh] overflow-y-auto">
            {loading && (
              <div className="p-4 text-center text-sm text-muted-foreground">Searching...</div>
            )}
            {!loading && query && results.length === 0 && (
              <div className="p-8 text-center">
                <Search className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">No results for "{query}"</p>
              </div>
            )}
            {results.map((r, i) => (
              <button
                key={`${r.type}-${r.id}-${i}`}
                onClick={() => handleSelect(r)}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-secondary/50 transition-colors text-left"
              >
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <r.icon className="w-4 h-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{r.title}</p>
                  <p className="text-xs text-muted-foreground truncate">{r.subtitle}</p>
                </div>
                <span className="text-[10px] font-medium text-muted-foreground bg-secondary px-2 py-0.5 rounded-full capitalize">
                  {r.type}
                </span>
              </button>
            ))}
          </div>

          {!query && (
            <div className="p-4 text-center text-xs text-muted-foreground">
              Type to search across the entire platform
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default GlobalSearch;
