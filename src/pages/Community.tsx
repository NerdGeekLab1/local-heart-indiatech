import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, Heart, Users, BookOpen, MapPin, Clock, ArrowRight, ChevronDown, Star, Lightbulb, Play, Hash, Eye, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { communityStories, communityReels, hosts, reviews, travelTips, blogPosts } from "@/lib/data";

const tipCategoryColors: Record<string, string> = {
  safety: "bg-destructive/10 text-destructive",
  culture: "bg-primary/10 text-primary",
  food: "bg-accent/10 text-accent",
  transport: "bg-primary/10 text-primary",
  packing: "bg-secondary text-muted-foreground",
  money: "bg-accent/10 text-accent",
  health: "bg-destructive/10 text-destructive",
};

type Tab = "reels" | "stories" | "spotlights" | "reviews" | "blog" | "tips";

const Community = () => {
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState<Tab>((searchParams.get("tab") as Tab) || "reels");
  const [expandedStory, setExpandedStory] = useState<string | null>(null);
  const [expandedTip, setExpandedTip] = useState<string | null>(null);
  const [likedReels, setLikedReels] = useState<Set<string>>(new Set());
  const [selectedReel, setSelectedReel] = useState<string | null>(null);

  const toggleLike = (id: string) => {
    setLikedReels(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const tabs: { id: Tab; label: string; icon: React.ElementType }[] = [
    { id: "reels", label: "Reels", icon: Play },
    { id: "stories", label: "Stories", icon: BookOpen },
    { id: "spotlights", label: "Hosts", icon: Heart },
    { id: "reviews", label: "Reviews", icon: MessageCircle },
    { id: "blog", label: "Blog", icon: Sparkles },
    { id: "tips", label: "Tips", icon: Lightbulb },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 mx-auto max-w-7xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
          <h1 className="text-4xl sm:text-5xl font-bold text-foreground">Community</h1>
          <p className="mt-3 text-lg text-muted-foreground max-w-2xl mx-auto">Stories, reels, and inspiration from the Travelista family</p>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
          {[
            { label: "Travelers Connected", value: "10,000+", icon: Users },
            { label: "Reels Shared", value: "8,500+", icon: Play },
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

        {/* REELS TAB - Instagram Style */}
        {activeTab === "reels" && (
          <div>
            {/* Featured Reels - Large */}
            <div className="mb-8">
              <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" /> Featured Reels
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                {communityReels.filter(r => r.featured).map((reel, i) => (
                  <motion.div
                    key={reel.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.08 }}
                    onClick={() => setSelectedReel(selectedReel === reel.id ? null : reel.id)}
                    className="relative aspect-[9/16] rounded-2xl overflow-hidden group cursor-pointer shadow-card hover:shadow-elevated transition-all"
                  >
                    <img src={reel.thumbnail} alt={reel.caption} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-foreground/10 to-transparent" />

                    {/* Play Button */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <motion.div whileHover={{ scale: 1.2 }} className="w-14 h-14 rounded-full bg-primary/90 backdrop-blur-sm flex items-center justify-center shadow-elevated">
                        <Play className="w-6 h-6 text-primary-foreground ml-0.5" />
                      </motion.div>
                    </div>

                    {/* Duration */}
                    <div className="absolute top-3 right-3 bg-foreground/60 backdrop-blur-sm text-primary-foreground text-[10px] px-2 py-0.5 rounded-full">
                      {reel.duration}
                    </div>

                    {/* Content */}
                    <div className="absolute bottom-0 left-0 right-0 p-3">
                      <p className="text-xs font-bold text-primary-foreground">{reel.travelerName} · {reel.country}</p>
                      <p className="text-[11px] text-primary-foreground/90 line-clamp-2 mt-0.5">{reel.caption}</p>
                      <div className="flex items-center gap-3 mt-1.5 text-[10px] text-primary-foreground/70">
                        <span className="flex items-center gap-0.5"><Heart className="w-3 h-3" /> {(reel.likes / 1000).toFixed(1)}K</span>
                        <span className="flex items-center gap-0.5"><MessageCircle className="w-3 h-3" /> {reel.comments}</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* All Reels Grid */}
            <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
              <Play className="w-5 h-5 text-primary" /> All Reels
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {communityReels.map((reel, i) => (
                <motion.div
                  key={reel.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                  className="rounded-2xl bg-card shadow-card hover:shadow-card-hover transition-all overflow-hidden"
                >
                  {/* Thumbnail */}
                  <div className="relative aspect-[9/16] overflow-hidden group cursor-pointer" onClick={() => setSelectedReel(selectedReel === reel.id ? null : reel.id)}>
                    <img src={reel.thumbnail} alt={reel.caption} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 via-transparent to-transparent" />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="w-12 h-12 rounded-full bg-primary/90 flex items-center justify-center backdrop-blur-sm">
                        <Play className="w-5 h-5 text-primary-foreground ml-0.5" />
                      </div>
                    </div>
                    <div className="absolute top-2 right-2 bg-foreground/60 backdrop-blur-sm text-primary-foreground text-[10px] px-1.5 py-0.5 rounded-full">
                      {reel.duration}
                    </div>
                    <div className="absolute bottom-2 left-2 right-2">
                      <div className="flex items-center gap-2 text-[10px] text-primary-foreground/80">
                        <span className="flex items-center gap-0.5"><Eye className="w-2.5 h-2.5" /> {(reel.likes / 1000).toFixed(1)}K</span>
                        <span>·</span>
                        <span>{reel.city}</span>
                      </div>
                    </div>
                  </div>

                  {/* Caption & Hashtags */}
                  <div className="p-3">
                    <div className="flex items-center gap-2 mb-1.5">
                      <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary">
                        {reel.travelerName[0]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-foreground truncate">{reel.travelerName}</p>
                        <p className="text-[10px] text-muted-foreground">with {reel.hostName} · {reel.city}</p>
                      </div>
                    </div>
                    <p className="text-xs text-foreground/80 line-clamp-2">{reel.caption}</p>
                    <div className="mt-2 flex flex-wrap gap-1">
                      {reel.hashtags.slice(0, 3).map(tag => (
                        <span key={tag} className="text-[10px] text-primary font-medium">{tag}</span>
                      ))}
                    </div>
                    <div className="mt-2 flex items-center justify-between">
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <button onClick={() => toggleLike(reel.id)} className="flex items-center gap-0.5 hover:text-destructive transition-colors">
                          <Heart className={`w-3.5 h-3.5 ${likedReels.has(reel.id) ? "fill-destructive text-destructive" : ""}`} />
                          {reel.likes + (likedReels.has(reel.id) ? 1 : 0)}
                        </button>
                        <span className="flex items-center gap-0.5">
                          <MessageCircle className="w-3.5 h-3.5" /> {reel.comments}
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

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
                  {story.image && (
                    <div className="md:w-72 h-48 md:h-auto shrink-0">
                      <img src={story.image} alt={story.hostName} className="w-full h-full object-cover" />
                    </div>
                  )}
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
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
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
              <motion.div key={h.id} initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}>
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

        {/* Reviews */}
        {activeTab === "reviews" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {reviews.map((r, i) => {
              const host = hosts.find(h => h.id === r.hostId);
              return (
                <motion.div key={r.id} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}
                  className="rounded-xl bg-card p-5 shadow-card hover:shadow-card-hover transition-shadow">
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

        {/* Blog */}
        {activeTab === "blog" && (
          <div>
            {/* Featured Blog */}
            {blogPosts.filter(b => b.featured).slice(0, 1).map(post => (
              <motion.div key={post.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl bg-card shadow-elevated overflow-hidden mb-8">
                <div className="grid grid-cols-1 md:grid-cols-2">
                  <div className="h-64 md:h-auto">
                    <img src={post.image} alt={post.title} className="w-full h-full object-cover" />
                  </div>
                  <div className="p-8 flex flex-col justify-center">
                    <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full w-fit">{post.category}</span>
                    <h2 className="text-2xl font-bold text-foreground mt-3">{post.title}</h2>
                    <p className="mt-3 text-muted-foreground">{post.excerpt}</p>
                    <div className="mt-4 flex items-center gap-3">
                      <img src={post.authorImage} alt={post.author} className="w-8 h-8 rounded-full object-cover" />
                      <div>
                        <p className="text-sm font-medium text-foreground">{post.author}</p>
                        <p className="text-xs text-muted-foreground">{post.date} · {post.readTime} read</p>
                      </div>
                    </div>
                    <Link to={`/community?tab=blog`}>
                      <Button className="mt-4 rounded-full gap-2 w-fit">
                        Read Article <ArrowRight className="w-4 h-4" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}

            {/* Blog Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {blogPosts.map((post, i) => (
                <motion.div key={post.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}
                  className="rounded-2xl bg-card shadow-card hover:shadow-card-hover transition-all overflow-hidden group">
                  <div className="h-48 overflow-hidden">
                    <img src={post.image} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  </div>
                  <div className="p-5">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full">{post.category}</span>
                      <span className="text-[10px] text-muted-foreground">{post.readTime} read</span>
                    </div>
                    <h3 className="font-bold text-foreground text-sm line-clamp-2">{post.title}</h3>
                    <p className="mt-1.5 text-xs text-muted-foreground line-clamp-2">{post.excerpt}</p>
                    <div className="mt-3 flex flex-wrap gap-1">
                      {post.tags.slice(0, 3).map(tag => (
                        <span key={tag} className="text-[10px] text-primary font-medium flex items-center gap-0.5">
                          <Hash className="w-2.5 h-2.5" />{tag}
                        </span>
                      ))}
                    </div>
                    <div className="mt-3 flex items-center gap-2 pt-3 border-t border-border">
                      <img src={post.authorImage} alt={post.author} className="w-6 h-6 rounded-full object-cover" />
                      <p className="text-xs text-muted-foreground">{post.author} · {post.date}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
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
