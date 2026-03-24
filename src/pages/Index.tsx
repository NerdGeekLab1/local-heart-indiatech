import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Shield, Users, Sparkles, Star, MapPin, Play, Heart, Mountain, UtensilsCrossed, Compass, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import HostCard from "@/components/HostCard";
import ExperienceCard from "@/components/ExperienceCard";
import Footer from "@/components/Footer";
import heroImage from "@/assets/hero-jaipur.jpg";
import { hosts, experiences, vibeCategories, communityReels, destinations, blogPosts } from "@/lib/data";

const floatingAnimation = {
  animate: { y: [0, -10, 0] },
  transition: { duration: 4, repeat: Infinity, ease: "easeInOut" },
};

const Index = () => {
  const stats = [
    { label: "Verified Hosts", value: "500+", icon: Users },
    { label: "Experiences", value: "1,200+", icon: Compass },
    { label: "Cities", value: "50+", icon: MapPin },
    { label: "Happy Travelers", value: "25,000+", icon: Heart },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="relative h-[90vh] min-h-[600px] flex items-center overflow-hidden">
        <img src={heroImage} alt="Golden hour over Jaipur" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-foreground/60 via-foreground/30 to-transparent" />

        {/* Floating Elements */}
        <motion.div {...floatingAnimation} className="absolute top-[20%] right-[15%] hidden lg:block w-16 h-16 rounded-full bg-primary/20 backdrop-blur-sm" />
        <motion.div animate={{ y: [0, -15, 0] }} transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }} className="absolute top-[40%] right-[8%] hidden lg:block w-10 h-10 rounded-full bg-accent/20 backdrop-blur-sm" />

        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 w-full">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="max-w-xl">
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}
              className="inline-flex items-center gap-2 bg-primary-foreground/10 backdrop-blur-md px-4 py-1.5 rounded-full text-primary-foreground/90 text-sm mb-4">
              <Sparkles className="w-4 h-4 text-primary" /> Trusted by 25,000+ travelers worldwide
            </motion.div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-primary-foreground leading-[1.1]">
              Book a person,<br />not just a place.
            </h1>
            <p className="mt-4 text-lg text-primary-foreground/80 leading-relaxed max-w-md">
              Connect with verified local hosts for authentic Indian experiences — homestays, guided tours, and cultural immersion.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/explore">
                <Button size="lg" className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90 px-8 gap-2">
                  Explore Hosts <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <Link to="/become-host">
                <Button size="lg" variant="outline" className="rounded-full border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 px-8">
                  Become a Host
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Animated Stats Bar */}
      <section className="relative -mt-16 z-20 px-4 sm:px-6 lg:px-8 mx-auto max-w-5xl">
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="bg-card rounded-2xl shadow-elevated p-6 grid grid-cols-2 sm:grid-cols-4 gap-6">
          {stats.map((s, i) => (
            <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
              className="text-center">
              <s.icon className="w-6 h-6 text-primary mx-auto mb-2" />
              <p className="text-2xl font-bold text-foreground">{s.value}</p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Vibes */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 mx-auto max-w-7xl">
        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground">Travel by Vibe</h2>
          <p className="mt-2 text-muted-foreground">What kind of India are you looking for?</p>
          <div className="mt-6 flex flex-wrap gap-3">
            {vibeCategories.map((v, i) => (
              <motion.div key={v.label} initial={{ opacity: 0, scale: 0.8 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}>
                <Link to={`/experiences`}>
                  <button className="flex items-center gap-2 rounded-full bg-secondary px-5 py-2.5 text-sm font-medium text-secondary-foreground shadow-card hover:shadow-card-hover transition-all hover:-translate-y-0.5">
                    <span>{v.emoji}</span> {v.label}
                  </button>
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Featured Hosts */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 mx-auto max-w-7xl">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground">Featured Hosts</h2>
            <p className="mt-2 text-muted-foreground">Verified locals ready to show you the real India</p>
          </div>
          <Link to="/explore" className="hidden sm:flex items-center gap-1 text-sm font-medium text-primary hover:underline">
            View all <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {hosts.slice(0, 6).map((host, i) => (
            <HostCard key={host.id} host={host} index={i} />
          ))}
        </div>
      </section>

      {/* Trending Reels */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-secondary">
        <div className="mx-auto max-w-7xl">
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground flex items-center gap-2">
                <Play className="w-7 h-7 text-primary" /> Trending Reels
              </h2>
              <p className="mt-2 text-muted-foreground">See what travelers are sharing right now</p>
            </div>
            <Link to="/community" className="hidden sm:flex items-center gap-1 text-sm font-medium text-primary hover:underline">
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {communityReels.filter(r => r.featured).slice(0, 5).map((reel, i) => (
              <motion.div key={reel.id} initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}>
                <Link to="/community" className="block">
                  <div className="relative aspect-[9/16] rounded-2xl overflow-hidden group cursor-pointer shadow-card hover:shadow-elevated transition-all">
                    <img src={reel.thumbnail} alt={reel.caption} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-gradient-to-t from-foreground/70 via-transparent to-transparent" />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="w-12 h-12 rounded-full bg-primary/90 flex items-center justify-center backdrop-blur-sm">
                        <Play className="w-5 h-5 text-primary-foreground ml-0.5" />
                      </div>
                    </div>
                    <div className="absolute bottom-3 left-3 right-3">
                      <p className="text-xs font-bold text-primary-foreground">{reel.travelerName}</p>
                      <p className="text-[10px] text-primary-foreground/80 line-clamp-1">{reel.caption}</p>
                      <div className="flex items-center gap-2 mt-1 text-[10px] text-primary-foreground/60">
                        <span className="flex items-center gap-0.5"><Heart className="w-2.5 h-2.5" /> {(reel.likes / 1000).toFixed(1)}K</span>
                        <span>· {reel.city}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Experiences */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 mx-auto max-w-7xl">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground">Unforgettable Experiences</h2>
            <p className="mt-2 text-muted-foreground">Curated moments you can't find in guidebooks</p>
          </div>
          <Link to="/experiences" className="hidden sm:flex items-center gap-1 text-sm font-medium text-primary hover:underline">
            View all <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {experiences.slice(0, 8).map((exp, i) => (
            <ExperienceCard key={exp.id} experience={exp} index={i} />
          ))}
        </div>
      </section>

      {/* Popular Destinations */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-secondary">
        <div className="mx-auto max-w-7xl">
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground flex items-center gap-2">
                <Globe className="w-7 h-7 text-primary" /> Popular Destinations
              </h2>
              <p className="mt-2 text-muted-foreground">Explore India's most loved cities</p>
            </div>
            <Link to="/destinations" className="hidden sm:flex items-center gap-1 text-sm font-medium text-primary hover:underline">
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {destinations.slice(0, 6).map((d, i) => (
              <motion.div key={d.name} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}>
                <Link to={`/destination/${d.name.toLowerCase()}`} className="block group">
                  <div className="rounded-2xl bg-card shadow-card hover:shadow-card-hover transition-all p-5 text-center group-hover:-translate-y-1">
                    <div className="w-12 h-12 rounded-full bg-primary/10 mx-auto mb-3 flex items-center justify-center text-xl">📍</div>
                    <p className="font-bold text-foreground text-sm">{d.name}</p>
                    <p className="text-xs text-muted-foreground">{d.state}</p>
                    <p className="text-xs text-primary mt-1">{d.hostCount} hosts</p>
                    {d.experienceTags && (
                      <div className="mt-2 flex flex-wrap justify-center gap-1">
                        {d.experienceTags.slice(0, 2).map(tag => (
                          <span key={tag} className="text-[9px] bg-secondary text-muted-foreground px-1.5 py-0.5 rounded-full">{tag}</span>
                        ))}
                      </div>
                    )}
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Blog Preview */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 mx-auto max-w-7xl">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground">From the Blog</h2>
            <p className="mt-2 text-muted-foreground">Stories, guides, and insights from the Travelista community</p>
          </div>
          <Link to="/community?tab=blog" className="hidden sm:flex items-center gap-1 text-sm font-medium text-primary hover:underline">
            Read more <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {blogPosts.slice(0, 3).map((post, i) => (
            <motion.div key={post.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
              <Link to="/community?tab=blog" className="block group">
                <div className="rounded-2xl bg-card shadow-card hover:shadow-card-hover transition-all overflow-hidden">
                  <div className="h-40 overflow-hidden">
                    <img src={post.image} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  </div>
                  <div className="p-5">
                    <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full">{post.category}</span>
                    <h3 className="font-bold text-foreground text-sm mt-2 line-clamp-2">{post.title}</h3>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{post.excerpt}</p>
                    <p className="text-xs text-muted-foreground mt-3">{post.date} · {post.readTime}</p>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-secondary">
        <div className="mx-auto max-w-7xl">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground">Built on Trust</h2>
            <p className="mt-2 text-muted-foreground max-w-lg mx-auto">Every host is verified. Every payment is secured. Every journey is protected.</p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: Shield, title: "Verified Hosts", desc: "KYC-verified identity, background checks, and video testimonials from past travelers." },
              { icon: Users, title: "Real Connections", desc: "Chat with your host before booking. Know who you're traveling with — not just where." },
              { icon: Sparkles, title: "Secure Payments", desc: "Escrow-based payments with multi-currency support. Pay only when you're satisfied." },
            ].map((item, i) => (
              <motion.div key={item.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.15 }}
                className="bg-card rounded-lg p-6 shadow-card">
                <div className="w-10 h-10 rounded-md bg-primary/10 flex items-center justify-center mb-4">
                  <item.icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground">{item.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground">Ready to experience the real India?</h2>
            <p className="mt-4 text-muted-foreground text-lg">Join thousands of travelers who chose connection over convenience.</p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Link to="/explore">
                <Button size="lg" className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90 px-8 gap-2">
                  Find Your Host <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <Link to="/signup">
                <Button size="lg" variant="outline" className="rounded-full px-8 gap-2">
                  Sign Up Free <Sparkles className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
