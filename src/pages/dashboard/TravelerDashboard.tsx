import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { MapPin, Calendar, Star, MessageCircle, Heart, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { mockBookings, hosts, experiences } from "@/lib/data";

const statusColors: Record<string, string> = {
  pending: "bg-primary/10 text-primary",
  confirmed: "bg-accent/10 text-accent",
  completed: "bg-secondary text-muted-foreground",
  cancelled: "bg-destructive/10 text-destructive",
};

const TravelerDashboard = () => {
  const bookings = mockBookings;
  const savedHosts = hosts.slice(0, 3);
  const recommendedExp = experiences.slice(0, 4);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 mx-auto max-w-6xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-bold text-foreground">Welcome back, Traveler!</h1>
          <p className="mt-1 text-muted-foreground">Manage your bookings and discover new experiences</p>
        </motion.div>

        {/* Stats */}
        <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: "Total Trips", value: "3", icon: MapPin },
            { label: "Upcoming", value: "2", icon: Calendar },
            { label: "Saved Hosts", value: "5", icon: Heart },
            { label: "Reviews Given", value: "2", icon: Star },
          ].map(s => (
            <div key={s.label} className="rounded-lg bg-card p-4 shadow-card">
              <s.icon className="w-5 h-5 text-primary mb-2" />
              <p className="text-2xl font-bold text-foreground">{s.value}</p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Bookings */}
        <div className="mt-10">
          <h2 className="text-xl font-bold text-foreground mb-4">Your Bookings</h2>
          <div className="space-y-3">
            {bookings.map(b => {
              const host = hosts.find(h => h.id === b.hostId);
              if (!host) return null;
              return (
                <div key={b.id} className="rounded-lg bg-card p-4 shadow-card flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  <img src={host.image} alt={host.name} className="w-14 h-14 rounded-full object-cover shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-foreground">{host.name}, {host.city}</h3>
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusColors[b.status]}`}>{b.status}</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      <Clock className="w-3 h-3 inline mr-1" />{b.startDate} → {b.endDate} · {b.services.join(", ")} · {b.guests} guest{b.guests > 1 ? "s" : ""}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-bold text-foreground">${b.totalPrice}</p>
                    <Link to={`/host/${host.id}`}><Button variant="ghost" size="sm" className="text-xs">View Host</Button></Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Saved Hosts */}
        <div className="mt-10">
          <h2 className="text-xl font-bold text-foreground mb-4">Saved Hosts</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {savedHosts.map(h => (
              <Link to={`/host/${h.id}`} key={h.id} className="rounded-lg bg-card p-4 shadow-card flex items-center gap-3 hover:shadow-card-hover transition-shadow">
                <img src={h.image} alt={h.name} className="w-12 h-12 rounded-full object-cover" />
                <div>
                  <p className="font-semibold text-foreground">{h.name}, {h.city}</p>
                  <p className="text-sm text-muted-foreground">{h.rating} ★ · ${h.pricePerDay}/day</p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Recommended */}
        <div className="mt-10">
          <h2 className="text-xl font-bold text-foreground mb-4">Recommended For You</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {recommendedExp.map(exp => (
              <Link to={`/experience/${exp.id}`} key={exp.id} className="group">
                <div className="relative aspect-[3/4] rounded-lg overflow-hidden shadow-card">
                  <img src={exp.image} alt={exp.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  <div className="absolute inset-0 bg-gradient-to-t from-foreground/70 via-transparent to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-3">
                    <p className="text-sm font-semibold text-primary-foreground">{exp.title}</p>
                    <p className="text-xs text-primary-foreground/80">${exp.price} · {exp.duration}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default TravelerDashboard;
