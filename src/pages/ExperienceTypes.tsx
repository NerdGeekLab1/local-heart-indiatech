import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import { Users, Clock, CalendarRange, Sparkles, Search, ArrowRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Input } from "@/components/ui/input";
import { useCurrency } from "@/contexts/CurrencyContext";
import { useCatalogList, seasonSummary } from "@/hooks/useExperienceCatalog";

const ExperienceTypes = () => {
  const { data = [], isLoading } = useCatalogList();
  const { format } = useCurrency();
  const [q, setQ] = useState("");
  const [category, setCategory] = useState("All");

  const categories = useMemo(() => ["All", ...Array.from(new Set(data.map(d => d.category)))], [data]);
  const list = useMemo(() => data.filter(d => {
    const matchesCategory = category === "All" || d.category === category;
    const needle = q.trim().toLowerCase();
    const matchesQuery = !needle || `${d.title} ${d.summary} ${d.sub_category ?? ""}`.toLowerCase().includes(needle);
    return matchesCategory && matchesQuery;
  }), [data, category, q]);

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Experience Types in India | Village Stays, Weddings, Food Trails — Travelista</title>
        <meta name="description" content="Browse every kind of hosted Indian experience — village homestays, real weddings, festival immersions, street food trails and treks. Sign in to see the hosts offering each one." />
      </Helmet>
      <Navbar />

      <header className="pt-24 pb-8 px-4 sm:px-6 lg:px-8 mx-auto max-w-7xl">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
            <Sparkles className="h-3.5 w-3.5" /> Curated by Travelista
          </span>
          <h1 className="mt-3 text-3xl font-bold text-foreground sm:text-4xl">Experience types</h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            Every experience starts as a shared idea — a village homestay, a real family wedding, a dawn food trail.
            Read what it involves here, then sign in to see which local hosts offer it and at what price.
          </p>
        </motion.div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={q} onChange={e => setQ(e.target.value)} placeholder="Search wedding, food, trek, homestay…" className="pl-9" />
          </div>
          <div className="flex gap-1.5 overflow-x-auto pb-1">
            {categories.map(c => (
              <button key={c} onClick={() => setCategory(c)}
                className={`whitespace-nowrap rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors ${category === c ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground hover:bg-secondary/70"}`}>
                {c}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="px-4 sm:px-6 lg:px-8 mx-auto max-w-7xl pb-20">
        {isLoading ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-72 animate-pulse rounded-2xl bg-secondary" />
            ))}
          </div>
        ) : list.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border p-12 text-center">
            <p className="font-semibold text-foreground">No experience types match that search</p>
            <p className="mt-1 text-sm text-muted-foreground">Try a broader term like “stay”, “food” or “wedding”.</p>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {list.map((item, i) => (
              <motion.article key={item.id} initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                transition={{ delay: Math.min(i * 0.05, 0.3) }}
                className="group overflow-hidden rounded-2xl bg-card shadow-card transition-shadow hover:shadow-card-hover">
                <Link to={`/experience-type/${item.slug}`} className="block">
                  <div className="relative aspect-[16/10] overflow-hidden">
                    <img src={item.hero_image_url || "/placeholder.svg"} alt={item.title} loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    <div className="absolute inset-0 bg-gradient-to-t from-foreground/70 to-transparent" />
                    <div className="absolute bottom-3 left-3 right-3">
                      <span className="rounded-sm bg-primary/90 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary-foreground">
                        {item.category}
                      </span>
                      <h2 className="mt-1.5 text-lg font-semibold text-primary-foreground">{item.title}</h2>
                    </div>
                    {item.occasion_type && (
                      <span className="absolute right-3 top-3 rounded-full bg-card/90 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-primary">
                        {item.occasion_type}
                      </span>
                    )}
                  </div>
                  <div className="space-y-3 p-4">
                    <p className="line-clamp-2 text-sm text-muted-foreground">{item.summary}</p>
                    <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-muted-foreground">
                      {item.typical_duration && <span className="inline-flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{item.typical_duration}</span>}
                      <span className="inline-flex items-center gap-1"><CalendarRange className="h-3.5 w-3.5" />{seasonSummary(item.season_months, item.season_label)}</span>
                      <span className="inline-flex items-center gap-1"><Users className="h-3.5 w-3.5" />{item.host_count} host{item.host_count === 1 ? "" : "s"}</span>
                    </div>
                    <div className="flex items-center justify-between border-t border-border pt-3">
                      <span className="text-sm font-semibold text-foreground">
                        {format(Number(item.offered_price_min ?? item.price_min))}
                        <span className="font-normal text-muted-foreground"> – {format(Number(item.offered_price_max ?? item.price_max))}</span>
                      </span>
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-primary">
                        View details <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                      </span>
                    </div>
                  </div>
                </Link>
              </motion.article>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default ExperienceTypes;
