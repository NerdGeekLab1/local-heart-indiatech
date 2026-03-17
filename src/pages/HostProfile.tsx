import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Star, Shield, Clock, Globe, MapPin, ArrowLeft, MessageCircle, Car, Home, Compass } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { hosts } from "@/lib/data";

const serviceIcons: Record<string, React.ElementType> = {
  Guide: Compass,
  Stay: Home,
  Transport: Car,
};

const HostProfile = () => {
  const { id } = useParams();
  const host = hosts.find(h => h.id === id);

  if (!host) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground">Host not found</h1>
          <Link to="/explore" className="text-primary mt-2 inline-block hover:underline">Back to Explore</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-20 pb-16 px-4 sm:px-6 lg:px-8 mx-auto max-w-5xl">
        <Link to="/explore" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="w-4 h-4" /> Back to Explore
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left - Photo & Quick Info */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="lg:col-span-1">
            <div className="rounded-lg bg-card p-2 shadow-card">
              <div className="aspect-[3/4] rounded-md overflow-hidden">
                <img src={host.image} alt={host.name} className="h-full w-full object-cover" />
              </div>
            </div>
            {/* Trust Metrics */}
            <div className="mt-4 space-y-3">
              <div className="rounded-lg bg-card p-4 shadow-card flex items-center gap-3">
                <Shield className="w-5 h-5 text-accent" />
                <div>
                  <p className="text-sm font-semibold text-foreground">Safety Score: {host.safetyScore}/100</p>
                  <p className="text-xs text-muted-foreground">Identity verified via KYC</p>
                </div>
              </div>
              <div className="rounded-lg bg-card p-4 shadow-card flex items-center gap-3">
                <Clock className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-sm font-semibold text-foreground">Responds {host.responseTime}</p>
                  <p className="text-xs text-muted-foreground">Typically very responsive</p>
                </div>
              </div>
              <div className="rounded-lg bg-card p-4 shadow-card flex items-center gap-3">
                <Star className="w-5 h-5 fill-primary text-primary" />
                <div>
                  <p className="text-sm font-semibold text-foreground">{host.rating} · {host.reviewCount} reviews</p>
                  <p className="text-xs text-muted-foreground">Consistently highly rated</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right - Details */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="lg:col-span-2">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-3xl font-bold text-foreground">{host.name}</h1>
                <p className="flex items-center gap-1 text-muted-foreground mt-1">
                  <MapPin className="w-4 h-4" /> {host.city}, India
                </p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-foreground">${host.pricePerDay}</p>
                <p className="text-xs text-muted-foreground">per day</p>
              </div>
            </div>

            <p className="mt-1 text-lg text-muted-foreground italic">"{host.tagline}"</p>

            <div className="mt-6">
              <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider mb-2">About</h3>
              <p className="text-muted-foreground leading-relaxed">{host.bio}</p>
            </div>

            {/* Languages */}
            <div className="mt-6">
              <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider mb-2">Languages</h3>
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">{host.languages.join(", ")}</span>
              </div>
            </div>

            {/* Services */}
            <div className="mt-6">
              <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider mb-3">Services Offered</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {host.services.map(s => {
                  const Icon = serviceIcons[s] || Compass;
                  return (
                    <div key={s} className="rounded-lg bg-secondary p-4 flex flex-col items-center gap-2">
                      <Icon className="w-6 h-6 text-primary" />
                      <span className="text-sm font-medium text-foreground">{s}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* CTA */}
            <div className="mt-8 flex flex-wrap gap-3">
              <Button size="lg" className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90 px-8 gap-2">
                <MessageCircle className="w-4 h-4" /> Inquire Now
              </Button>
              <Button size="lg" variant="outline" className="rounded-full px-8">
                Save Host
              </Button>
            </div>

            {/* Reviews placeholder */}
            <div className="mt-10">
              <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider mb-4">Traveler Reviews</h3>
              <div className="space-y-4">
                {[
                  { name: "Sarah M.", country: "USA", text: "Ravi made Jaipur feel like home. His knowledge of hidden spots is incredible!", rating: 5 },
                  { name: "Thomas K.", country: "Germany", text: "An unforgettable experience. The homestay was warm and the food was amazing.", rating: 5 },
                ].map((review, i) => (
                  <div key={i} className="rounded-lg bg-card p-4 shadow-card">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-xs font-bold text-foreground">
                        {review.name[0]}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">{review.name} <span className="text-muted-foreground font-normal">· {review.country}</span></p>
                        <div className="flex gap-0.5">
                          {Array.from({ length: review.rating }).map((_, j) => (
                            <Star key={j} className="w-3 h-3 fill-primary text-primary" />
                          ))}
                        </div>
                      </div>
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{review.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default HostProfile;
