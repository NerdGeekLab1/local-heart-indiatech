import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Shield, Users, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import HostCard from "@/components/HostCard";
import ExperienceCard from "@/components/ExperienceCard";
import Footer from "@/components/Footer";
import heroImage from "@/assets/hero-jaipur.jpg";
import { hosts, experiences, vibeCategories } from "@/lib/data";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="relative h-[90vh] min-h-[600px] flex items-center overflow-hidden">
        <img src={heroImage} alt="Golden hour over Jaipur" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-foreground/60 via-foreground/30 to-transparent" />
        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 w-full">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-xl"
          >
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

      {/* Vibes */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 mx-auto max-w-7xl">
        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground">Travel by Vibe</h2>
          <p className="mt-2 text-muted-foreground">What kind of India are you looking for?</p>
          <div className="mt-6 flex flex-wrap gap-3">
            {vibeCategories.map(v => (
              <button key={v.label} className="flex items-center gap-2 rounded-full bg-secondary px-5 py-2.5 text-sm font-medium text-secondary-foreground shadow-card hover:shadow-card-hover transition-all hover:-translate-y-0.5">
                <span>{v.emoji}</span> {v.label}
              </button>
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
          {hosts.map((host, i) => (
            <HostCard key={host.id} host={host} index={i} />
          ))}
        </div>
      </section>

      {/* Experiences */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 mx-auto max-w-7xl">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground">Unforgettable Experiences</h2>
            <p className="mt-2 text-muted-foreground">Curated moments you can't find in guidebooks</p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {experiences.map((exp, i) => (
            <ExperienceCard key={exp.id} experience={exp} index={i} />
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
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="bg-card rounded-lg p-6 shadow-card"
              >
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
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
