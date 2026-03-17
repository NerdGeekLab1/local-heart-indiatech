import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { DollarSign, Users, Star, Calendar, Clock, TrendingUp, MessageCircle, Settings, Home, Car, BarChart3, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { mockBookings, hosts, reviews, experiences } from "@/lib/data";

const host = hosts[0];
const hostBookings = mockBookings.filter(b => b.hostId === host.id);
const hostReviews = reviews.filter(r => r.hostId === host.id);
const hostExperiences = experiences.filter(e => e.hostId === host.id);

const statusColors: Record<string, string> = {
  pending: "bg-primary/10 text-primary",
  confirmed: "bg-accent/10 text-accent",
  completed: "bg-secondary text-muted-foreground",
  cancelled: "bg-destructive/10 text-destructive",
};

type Tab = "overview" | "bookings" | "listings" | "reviews" | "earnings" | "messages" | "settings";

const HostDashboard = () => {
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const totalEarnings = hostBookings.reduce((sum, b) => sum + b.totalPrice, 0);

  const tabs: { id: Tab; label: string; icon: React.ElementType }[] = [
    { id: "overview", label: "Overview", icon: BarChart3 },
    { id: "bookings", label: "Bookings", icon: Calendar },
    { id: "listings", label: "Listings", icon: Home },
    { id: "reviews", label: "Reviews", icon: Star },
    { id: "earnings", label: "Earnings", icon: DollarSign },
    { id: "messages", label: "Messages", icon: MessageCircle },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 mx-auto max-w-6xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-4">
          <img src={host.image} alt={host.name} className="w-16 h-16 rounded-full object-cover shadow-card" />
          <div>
            <h1 className="text-3xl font-bold text-foreground">Welcome, {host.name}!</h1>
            <p className="text-muted-foreground">{host.city} · Host since 2024</p>
          </div>
        </motion.div>

        {/* Tabs */}
        <div className="mt-6 flex gap-1 overflow-x-auto border-b border-border pb-px">
          {tabs.map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id)}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium whitespace-nowrap transition-colors rounded-t-lg ${activeTab === t.id ? "bg-card text-primary border-b-2 border-primary" : "text-muted-foreground hover:text-foreground"}`}>
              <t.icon className="w-4 h-4" /> {t.label}
            </button>
          ))}
        </div>

        {/* Overview */}
        {activeTab === "overview" && (
          <>
            <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { label: "Total Earnings", value: `$${totalEarnings}`, icon: DollarSign, color: "text-accent" },
                { label: "Total Bookings", value: `${hostBookings.length}`, icon: Calendar, color: "text-primary" },
                { label: "Rating", value: `${host.rating}`, icon: Star, color: "text-primary" },
                { label: "Reviews", value: `${host.reviewCount}`, icon: Users, color: "text-muted-foreground" },
              ].map(s => (
                <div key={s.label} className="rounded-lg bg-card p-4 shadow-card">
                  <s.icon className={`w-5 h-5 ${s.color} mb-2`} />
                  <p className="text-2xl font-bold text-foreground">{s.value}</p>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                </div>
              ))}
            </div>

            <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <h2 className="text-xl font-bold text-foreground mb-4">Recent Booking Requests</h2>
                <div className="space-y-3">
                  {hostBookings.slice(0, 3).map(b => (
                    <div key={b.id} className="rounded-lg bg-card p-4 shadow-card">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-foreground">Booking #{b.id}</h3>
                            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusColors[b.status]}`}>{b.status}</span>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            <Clock className="w-3 h-3 inline mr-1" />{b.startDate} → {b.endDate} · {b.services.join(", ")}
                          </p>
                        </div>
                        <p className="font-bold text-foreground">${b.totalPrice}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="space-y-4">
                <div className="rounded-lg bg-card p-5 shadow-card">
                  <h3 className="text-sm font-bold text-foreground uppercase tracking-wider mb-3">Performance</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm"><span className="text-muted-foreground">Response Rate</span><span className="font-medium text-foreground">98%</span></div>
                    <div className="flex justify-between text-sm"><span className="text-muted-foreground">Acceptance Rate</span><span className="font-medium text-foreground">95%</span></div>
                    <div className="flex justify-between text-sm"><span className="text-muted-foreground">This Month</span><span className="font-medium text-accent flex items-center gap-1"><TrendingUp className="w-3 h-3" /> +23%</span></div>
                  </div>
                </div>
                <div className="rounded-lg bg-primary/5 border border-primary/20 p-5">
                  <h3 className="text-sm font-bold text-foreground mb-2">💡 Tip</h3>
                  <p className="text-sm text-muted-foreground">Hosts who respond within 1 hour get 40% more bookings.</p>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Bookings Tab */}
        {activeTab === "bookings" && (
          <div className="mt-6 space-y-3">
            <h2 className="text-xl font-bold text-foreground mb-4">All Booking Requests</h2>
            {hostBookings.map(b => (
              <div key={b.id} className="rounded-lg bg-card p-4 shadow-card">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-foreground">Booking #{b.id}</h3>
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusColors[b.status]}`}>{b.status}</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      <Clock className="w-3 h-3 inline mr-1" />{b.startDate} → {b.endDate} · {b.services.join(", ")} · {b.guests} guest{b.guests > 1 ? "s" : ""}
                    </p>
                    {b.message && <p className="text-sm text-muted-foreground mt-1 italic">"{b.message}"</p>}
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-foreground">${b.totalPrice}</p>
                    {b.status === "pending" && (
                      <div className="flex gap-2 mt-2">
                        <Button size="sm" className="rounded-full bg-accent text-accent-foreground hover:bg-accent/90 text-xs px-3">Accept</Button>
                        <Button size="sm" variant="outline" className="rounded-full text-xs px-3">Decline</Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Listings Tab */}
        {activeTab === "listings" && (
          <div className="mt-6 space-y-6">
            <h2 className="text-xl font-bold text-foreground mb-4">Your Listings</h2>

            {host.stayInfo && (
              <div className="rounded-lg bg-card p-5 shadow-card">
                <div className="flex items-center gap-2 mb-2">
                  <Home className="w-5 h-5 text-primary" />
                  <h3 className="font-bold text-foreground">{host.stayInfo.propertyName}</h3>
                  <span className="text-xs bg-accent/10 text-accent px-2 py-0.5 rounded-full ml-auto">Active</span>
                </div>
                <p className="text-sm text-muted-foreground">{host.stayInfo.propertyType} · {host.stayInfo.rooms.length} rooms</p>
                <div className="mt-3 flex gap-2">
                  <Button variant="outline" size="sm" className="rounded-full text-xs">Edit Listing</Button>
                  <Button variant="outline" size="sm" className="rounded-full text-xs">Update Photos</Button>
                </div>
              </div>
            )}

            {host.transportInfo && (
              <div className="rounded-lg bg-card p-5 shadow-card">
                <div className="flex items-center gap-2 mb-2">
                  <Car className="w-5 h-5 text-primary" />
                  <h3 className="font-bold text-foreground">Transport Services</h3>
                  <span className="text-xs bg-accent/10 text-accent px-2 py-0.5 rounded-full ml-auto">Active</span>
                </div>
                <p className="text-sm text-muted-foreground">{host.transportInfo.vehicles.length} vehicles listed</p>
                <Button variant="outline" size="sm" className="mt-3 rounded-full text-xs">Edit Vehicles</Button>
              </div>
            )}

            <h3 className="font-bold text-foreground mt-6">Your Experiences</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {hostExperiences.map(exp => (
                <div key={exp.id} className="rounded-lg bg-card p-4 shadow-card">
                  <h4 className="font-semibold text-foreground">{exp.title}</h4>
                  <p className="text-sm text-muted-foreground">${exp.price} · {exp.duration} · {exp.category}</p>
                  <Button variant="outline" size="sm" className="mt-2 rounded-full text-xs">Edit</Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Reviews Tab */}
        {activeTab === "reviews" && (
          <div className="mt-6 space-y-4">
            <h2 className="text-xl font-bold text-foreground mb-4">Your Reviews ({hostReviews.length})</h2>
            {hostReviews.map(r => (
              <div key={r.id} className="rounded-lg bg-card p-4 shadow-card">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-xs font-bold text-foreground">{r.travelerName[0]}</div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{r.travelerName} · {r.country}</p>
                    <div className="flex gap-0.5">{Array.from({ length: r.rating }).map((_, j) => <Star key={j} className="w-3 h-3 fill-primary text-primary" />)}</div>
                  </div>
                  <span className="ml-auto text-xs text-muted-foreground">{r.date}</span>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">{r.text}</p>
              </div>
            ))}
          </div>
        )}

        {/* Earnings Tab */}
        {activeTab === "earnings" && (
          <div className="mt-6 space-y-6">
            <h2 className="text-xl font-bold text-foreground mb-4">Earnings</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="rounded-lg bg-card p-5 shadow-card">
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Total Earned</p>
                <p className="text-3xl font-bold text-foreground mt-1">${totalEarnings}</p>
              </div>
              <div className="rounded-lg bg-card p-5 shadow-card">
                <p className="text-xs text-muted-foreground uppercase tracking-wider">This Month</p>
                <p className="text-3xl font-bold text-accent mt-1">$270</p>
              </div>
              <div className="rounded-lg bg-card p-5 shadow-card">
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Pending Payout</p>
                <p className="text-3xl font-bold text-primary mt-1">$80</p>
              </div>
            </div>
            <h3 className="font-bold text-foreground mt-4">Transaction History</h3>
            <div className="space-y-2">
              {hostBookings.map(b => (
                <div key={b.id} className="rounded-lg bg-card p-4 shadow-card flex justify-between items-center">
                  <div>
                    <p className="font-medium text-foreground text-sm">Booking #{b.id}</p>
                    <p className="text-xs text-muted-foreground">{b.startDate} · {b.services.join(", ")}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-foreground">${b.totalPrice}</p>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusColors[b.status]}`}>{b.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Messages Tab */}
        {activeTab === "messages" && (
          <div className="mt-6">
            <h2 className="text-xl font-bold text-foreground mb-4">Messages</h2>
            <div className="space-y-3">
              {["Sarah M. (USA)", "Thomas K. (Germany)", "Yuki T. (Japan)"].map((name, i) => (
                <div key={name} className="rounded-lg bg-card p-4 shadow-card flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-sm font-bold text-foreground">{name[0]}</div>
                  <div className="flex-1">
                    <p className="font-semibold text-foreground text-sm">{name}</p>
                    <p className="text-xs text-muted-foreground">Inquiry about {["Jaipur tour", "Homestay booking", "Wedding experience"][i]}</p>
                  </div>
                  <span className="text-xs text-muted-foreground">{["1h", "3h", "1d"][i]} ago</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === "settings" && (
          <div className="mt-6 space-y-4 max-w-xl">
            <h2 className="text-xl font-bold text-foreground mb-4">Host Settings</h2>
            {[
              { icon: Settings, label: "Profile & Bio", desc: "Edit your public profile, tagline, and photo" },
              { icon: Calendar, label: "Availability", desc: "Set your calendar and blackout dates" },
              { icon: DollarSign, label: "Pricing", desc: "Update daily rates and service pricing" },
              { icon: Bell, label: "Notifications", desc: "Booking alerts, messages, and review notifications" },
              { icon: Home, label: "Property Details", desc: "Update room info, amenities, and photos" },
              { icon: Car, label: "Transport Fleet", desc: "Manage vehicles and pricing" },
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

export default HostDashboard;
