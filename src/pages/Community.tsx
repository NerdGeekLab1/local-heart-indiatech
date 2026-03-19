import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, Heart, Users, BookOpen, MapPin, Clock, ArrowRight, ChevronDown, Star, Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { communityStories, hosts, reviews, travelTips } from "@/lib/data";

const tipCategoryColors: Record<string, string> = {
  safety: "bg-destructive/10 text-destructive",
  culture: "bg-primary/10 text-primary",
  food: "bg-accent/10 text-accent",
  transport: "bg-primary/10 text-primary",
  packing: "bg-secondary text-muted-foreground",
  money: "bg-accent/10 text-accent",
  health: "bg-destructive/10 text-destructive",
};

type Tab = "stories" | "spotlights" | "reviews" | "tips";

const Community = () => {
  const [activeTab, setActiveTab] = useState<Tab>("stories");
  const [expandedStory, setExpandedStory] = useState<string | null>(null);
  const [expandedTip, setExpandedTip] = useState<string | null>(null);

  const tabs: { id: Tab; label: string; icon: React.ElementType }[] = [
    { id: "stories", label: "Traveler Stories", icon: BookOpen },
    { id: "spotlights", label: "Host Spotlights", icon: Heart },
    { id: "reviews", label: "Latest Reviews", icon: MessageCircle },
    { id: "tips", label: "Travel Tips", icon: Lightbulb },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 mx-auto max-w-7xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
          <h1 className="text-4xl sm:text-5xl font-bold text-foreground">Community</h1>
          <p className="mt-3 text-lg text-muted-foreground max-w-2xl mx-auto">Stories, connections, and inspiration from the Travelista family</p>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
          {[
            { label: "Travelers Connected", value: "10,000+", icon: Users },
            { label: "Stories Shared", value: "2,500+", icon: BookOpen },
            { label: "Reviews Written", value: "5,000+", icon: MessageCircle },
            { label: "Hosts Active", value: `${hosts.length * 15}+`, icon: Heart },
          ].map(s => (
            <motion.div key={s.label} whileHover={{ scale: 1.03 }} className="rounded-xl bg-card p-4 shadow-card text-center">
              <s.icon className="w-5 h-5 text-primary mx-auto mb-2" />
              <p className="text-2xl font-bold text-foreground">{s.value}</p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Tab Bar */}
        <div className="flex gap-1 overflow-x-auto border-b border-border pb-px mb-8">
          {tabs.map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id)}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium whitespace-nowrap transition-colors rounded-t-lg ${activeTab === t.id ? "bg-card text-primary border-b-2 border-primary" : "text-muted-foreground hover:text-foreground"}`}>
              <t.icon className="w-4 h-4" /> {t.label}
            </button>
          ))}
        </div>

        {/* Traveler Stories */}
        {activeTab === "stories" && (
          <div className="space-y-6">
            {communityStories.map((story, i) => (
              <motion.div key={story.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="rounded-2xl bg-card shadow-card hover:shadow-card-hover transition-all overflow-hidden"
              >
                <div className="flex flex-col md:flex-row">
                  {/* Image */}
                  {story.image && (
                    <div className="md:w-72 h-48 md:h-auto shrink-0">
                      <img src={story.image} alt={story.hostName} className="w-full h-full object-cover" />
                    </div>
                  )}
                  {/* Content */}
                  <div className="p-6 flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full flex items-center gap-1">
                        <MapPin className="w-3 h-3" /> {story.city}
                      </span>
                      {story.duration && (
                        <span className="text-xs bg-secondary text-muted-foreground px-2 py-0.5 rounded-full flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {story.duration}
                        </span>
                      )}
                    </div>
                    <h3 className="text-lg font-bold text-foreground">{story.title}</h3>
                    <p className="mt-2 text-sm text-muted-foreground">{story.excerpt}</p>

                    <AnimatePresence>
                      {expandedStory === story.id && story.fullStory && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden"
                        >
                          <p className="mt-3 text-sm text-foreground/80 leading-relaxed">{story.fullStory}</p>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <div className="mt-4 flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span className="font-medium text-foreground">{story.travelerName}</span>
                        <span>·</span>
                        <span>{story.country}</span>
                        <span>·</span>
                        <span>with {story.hostName}</span>
                      </div>
                      {story.fullStory && (
                        <Button variant="ghost" size="sm" className="text-xs gap-1"
                          onClick={() => setExpandedStory(expandedStory === story.id ? null : story.id)}>
                          {expandedStory === story.id ? "Read less" : "Read full story"}
                          <ChevronDown className={`w-3 h-3 transition-transform ${expandedStory === story.id ? "rotate-180" : ""}`} />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Host Spotlights */}
        {activeTab === "spotlights" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {hosts.map((h, i) => (
              <motion.div key={h.id}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
              >
                <Link to={`/host/${h.id}`} className="block group">
                  <div className="rounded-2xl bg-card shadow-card hover:shadow-card-hover transition-all p-6 text-center">
                    <div className="relative w-20 h-20 mx-auto mb-4">
                      <img src={h.image} alt={h.name} className="w-20 h-20 rounded-full object-cover group-hover:scale-105 transition-transform" />
                      {h.verified && (
                        <span className="absolute -bottom-1 -right-1 w-6 h-6 bg-accent text-accent-foreground rounded-full flex items-center justify-center text-xs">✓</span>
                      )}
                    </div>
                    <p className="font-bold text-foreground text-lg">{h.name}</p>
                    <p className="text-sm text-muted-foreground">{h.city} · {h.reviewCount} reviews</p>
                    <div className="flex items-center justify-center gap-1 mt-1">
                      <Star className="w-3 h-3 fill-primary text-primary" />
                      <span className="text-sm font-medium text-foreground">{h.rating}</span>
                    </div>
                    <p className="mt-3 text-xs text-muted-foreground italic">"{h.tagline}"</p>
                    <div className="mt-3 flex flex-wrap justify-center gap-1">
                      {h.services.map(s => (
                        <span key={s} className="text-[10px] bg-secondary text-muted-foreground px-2 py-0.5 rounded-full">{s}</span>
                      ))}
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}

        {/* Latest Reviews */}
        {activeTab === "reviews" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {reviews.map((r, i) => {
              const host = hosts.find(h => h.id === r.hostId);
              return (
                <motion.div key={r.id}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                  className="rounded-xl bg-card p-5 shadow-card hover:shadow-card-hover transition-shadow"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">{r.travelerName[0]}</div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground">{r.travelerName} · {r.country}</p>
                      <p className="text-xs text-muted-foreground">about {host?.name}, {host?.city}</p>
                    </div>
                    <div className="flex gap-0.5">
                      {Array.from({ length: r.rating }).map((_, j) => <Star key={j} className="w-3 h-3 fill-primary text-primary" />)}
                    </div>
                  </div>
                  <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{r.text}</p>
                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-xs bg-secondary text-muted-foreground px-2 py-0.5 rounded-full">{r.experienceType}</span>
                    <span className="text-xs text-muted-foreground">{r.date}</span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Travel Tips */}
        {activeTab === "tips" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {travelTips.map((tip, i) => (
              <motion.div key={tip.id}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.04 }}
                onClick={() => setExpandedTip(expandedTip === tip.id ? null : tip.id)}
                className={`rounded-xl p-5 cursor-pointer transition-all ${expandedTip === tip.id ? "bg-card shadow-elevated ring-1 ring-primary/20" : "bg-card shadow-card hover:shadow-card-hover"}`}
              >
                <div className="flex items-start gap-3">
                  <span className="text-2xl">{tip.icon}</span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-foreground text-sm">{tip.title}</h3>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full uppercase tracking-wider ${tipCategoryColors[tip.category] || "bg-secondary text-muted-foreground"}`}>{tip.category}</span>
                    </div>
                    <AnimatePresence>
                      {expandedTip === tip.id ? (
                        <motion.p initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                          className="text-sm text-muted-foreground leading-relaxed overflow-hidden">
                          {tip.content}
                        </motion.p>
                      ) : (
                        <p className="text-sm text-muted-foreground line-clamp-2">{tip.content}</p>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default Community;
