import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { MapPin, Calendar, Star, Heart, Clock, Settings, Bell, CreditCard, Shield, Globe, MessageCircle } from "lucide-react";
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

type Tab = "overview" | "bookings" | "saved" | "messages" | "settings";

const TravelerDashboard = () => {
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const bookings = mockBookings;
  const savedHosts = hosts.slice(0, 4);
  const recommendedExp = experiences.slice(0, 4);

  const tabs: { id: Tab; label: string; icon: React.ElementType }[] = [
    { id: "overview", label: "Overview", icon: Globe },
    { id: "bookings", label: "My Bookings", icon: Calendar },
    { id: "saved", label: "Saved Hosts", icon: Heart },
    { id: "messages", label: "Messages", icon: MessageCircle },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 mx-auto max-w-6xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-bold text-foreground">Welcome back, Traveler!</h1>
          <p className="mt-1 text-muted-foreground">Manage your bookings and discover new experiences</p>
        </motion.div>

        {/* Tab Navigation */}
        <div className="mt-6 flex gap-1 overflow-x-auto border-b border-border pb-px">
          {tabs.map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id)}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium whitespace-nowrap transition-colors rounded-t-lg ${activeTab === t.id ? "bg-card text-primary border-b-2 border-primary" : "text-muted-foreground hover:text-foreground"}`}>
              <t.icon className="w-4 h-4" /> {t.label}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === "overview" && (
          <>
            <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
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

            {/* Upcoming Bookings Preview */}
            <div className="mt-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-foreground">Upcoming Trips</h2>
                <button onClick={() => setActiveTab("bookings")} className="text-sm text-primary hover:underline">View all</button>
              </div>
              <div className="space-y-3">
                {bookings.filter(b => b.status === "confirmed" || b.status === "pending").slice(0, 2).map(b => {
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
                          <Clock className="w-3 h-3 inline mr-1" />{b.startDate} → {b.endDate} · {b.services.join(", ")}
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
          </>
        )}

        {/* Bookings Tab */}
        {activeTab === "bookings" && (
          <div className="mt-6 space-y-3">
            <h2 className="text-xl font-bold text-foreground mb-4">All Bookings</h2>
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
                    {b.message && <p className="text-sm text-muted-foreground mt-1 italic">"{b.message}"</p>}
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-bold text-foreground">${b.totalPrice}</p>
                    <Link to={`/host/${host.id}`}><Button variant="ghost" size="sm" className="text-xs">View Host</Button></Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Saved Hosts Tab */}
        {activeTab === "saved" && (
          <div className="mt-6">
            <h2 className="text-xl font-bold text-foreground mb-4">Saved Hosts</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {savedHosts.map(h => (
                <Link to={`/host/${h.id}`} key={h.id} className="rounded-lg bg-card p-4 shadow-card flex items-center gap-4 hover:shadow-card-hover transition-shadow">
                  <img src={h.image} alt={h.name} className="w-14 h-14 rounded-full object-cover" />
                  <div className="flex-1">
                    <p className="font-semibold text-foreground">{h.name}, {h.city}</p>
                    <p className="text-sm text-muted-foreground">{h.rating} ★ · ${h.pricePerDay}/day · {h.services.join(", ")}</p>
                    <p className="text-xs text-muted-foreground mt-1">{h.tagline}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Messages Tab */}
        {activeTab === "messages" && (
          <div className="mt-6">
            <h2 className="text-xl font-bold text-foreground mb-4">Messages</h2>
            <div className="space-y-3">
              {hosts.slice(0, 3).map(h => (
                <div key={h.id} className="rounded-lg bg-card p-4 shadow-card flex items-center gap-4">
                  <img src={h.image} alt={h.name} className="w-12 h-12 rounded-full object-cover" />
                  <div className="flex-1">
                    <p className="font-semibold text-foreground">{h.name}, {h.city}</p>
                    <p className="text-sm text-muted-foreground">Last message: "Looking forward to your visit! 🙏"</p>
                  </div>
                  <span className="text-xs text-muted-foreground">2h ago</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === "settings" && (
          <div className="mt-6 space-y-4 max-w-xl">
            <h2 className="text-xl font-bold text-foreground mb-4">Account Settings</h2>
            {[
              { icon: Settings, label: "Profile Information", desc: "Update your name, photo, and bio" },
              { icon: Bell, label: "Notifications", desc: "Manage email and push notifications" },
              { icon: CreditCard, label: "Payment Methods", desc: "Add or remove payment methods" },
              { icon: Shield, label: "Privacy & Security", desc: "Password, 2FA, and data privacy" },
              { icon: Globe, label: "Language & Currency", desc: "Set preferred language and currency" },
            ].map(s => (
              <div key={s.label} className="rounded-lg bg-card p-4 shadow-card flex items-center gap-4 hover:shadow-card-hover transition-shadow cursor-pointer">
                <div className="w-10 h-10 rounded-md bg-primary/10 flex items-center justify-center">
                  <s.icon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-foreground text-sm">{s.label}</p>
                  <p className="text-xs text-muted-foreground">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default TravelerDashboard;
