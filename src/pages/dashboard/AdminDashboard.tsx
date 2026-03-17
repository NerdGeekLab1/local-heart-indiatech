import { useState } from "react";
import { motion } from "framer-motion";
import { Users, DollarSign, TrendingUp, Shield, AlertTriangle, Star, MapPin, Calendar, Settings, FileText, BarChart3, Globe, Flag, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { hosts, mockBookings, reviews, experiences, destinations } from "@/lib/data";

type Tab = "overview" | "hosts" | "bookings" | "experiences" | "destinations" | "moderation" | "analytics" | "settings";

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const totalRevenue = mockBookings.reduce((s, b) => s + b.totalPrice, 0);
  const platformFee = Math.round(totalRevenue * 0.15);

  const tabs: { id: Tab; label: string; icon: React.ElementType }[] = [
    { id: "overview", label: "Overview", icon: BarChart3 },
    { id: "hosts", label: "Hosts", icon: Users },
    { id: "bookings", label: "Bookings", icon: Calendar },
    { id: "experiences", label: "Experiences", icon: Globe },
    { id: "destinations", label: "Destinations", icon: MapPin },
    { id: "moderation", label: "Moderation", icon: Shield },
    { id: "analytics", label: "Analytics", icon: TrendingUp },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 mx-auto max-w-7xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
          <p className="mt-1 text-muted-foreground">Platform overview and management</p>
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
                { label: "Total Hosts", value: hosts.length, icon: Users, color: "text-primary" },
                { label: "Total Bookings", value: mockBookings.length, icon: Calendar, color: "text-accent" },
                { label: "GMV", value: `$${totalRevenue}`, icon: DollarSign, color: "text-accent" },
                { label: "Platform Revenue", value: `$${platformFee}`, icon: TrendingUp, color: "text-primary" },
              ].map(s => (
                <div key={s.label} className="rounded-lg bg-card p-4 shadow-card">
                  <s.icon className={`w-5 h-5 ${s.color} mb-2`} />
                  <p className="text-2xl font-bold text-foreground">{s.value}</p>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                </div>
              ))}
            </div>

            <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <div>
                  <h2 className="text-xl font-bold text-foreground mb-4">Recent Bookings</h2>
                  <div className="space-y-3">
                    {mockBookings.slice(0, 3).map(b => {
                      const h = hosts.find(x => x.id === b.hostId);
                      return (
                        <div key={b.id} className="rounded-lg bg-card p-4 shadow-card flex justify-between items-center">
                          <div>
                            <p className="font-medium text-foreground">#{b.id} · {h?.name}, {h?.city}</p>
                            <p className="text-xs text-muted-foreground">{b.startDate} → {b.endDate} · {b.services.join(", ")}</p>
                          </div>
                          <p className="font-bold text-foreground">${b.totalPrice}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="rounded-lg bg-card p-5 shadow-card">
                  <h3 className="text-sm font-bold text-foreground uppercase tracking-wider mb-3">Platform Health</h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between"><span className="text-muted-foreground">Active Hosts</span><span className="font-medium text-foreground">{hosts.length}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Experiences</span><span className="font-medium text-foreground">{experiences.length}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Destinations</span><span className="font-medium text-foreground">{destinations.length}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Total Reviews</span><span className="font-medium text-foreground">{reviews.length}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Avg Rating</span><span className="font-medium text-accent">{(hosts.reduce((s, h) => s + h.rating, 0) / hosts.length).toFixed(1)}</span></div>
                  </div>
                </div>
                <div className="rounded-lg bg-card p-5 shadow-card">
                  <h3 className="text-sm font-bold text-foreground uppercase tracking-wider mb-3">Moderation</h3>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground"><AlertTriangle className="w-4 h-4 text-primary" /><span>0 reports pending</span></div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground"><Shield className="w-4 h-4 text-accent" /><span>All hosts KYC-verified</span></div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Hosts Tab */}
        {activeTab === "hosts" && (
          <div className="mt-6">
            <h2 className="text-xl font-bold text-foreground mb-4">All Hosts ({hosts.length})</h2>
            <div className="rounded-lg bg-card shadow-card overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-secondary">
                  <tr>
                    <th className="text-left p-3 font-medium text-muted-foreground">Host</th>
                    <th className="text-left p-3 font-medium text-muted-foreground">City</th>
                    <th className="text-left p-3 font-medium text-muted-foreground">Services</th>
                    <th className="text-left p-3 font-medium text-muted-foreground">Rating</th>
                    <th className="text-left p-3 font-medium text-muted-foreground">Safety</th>
                    <th className="text-left p-3 font-medium text-muted-foreground">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {hosts.map(h => (
                    <tr key={h.id} className="border-t border-border hover:bg-secondary/50">
                      <td className="p-3 flex items-center gap-2">
                        <img src={h.image} alt={h.name} className="w-8 h-8 rounded-full object-cover" />
                        <span className="font-medium text-foreground">{h.name}</span>
                      </td>
                      <td className="p-3 text-muted-foreground">{h.city}</td>
                      <td className="p-3 text-muted-foreground">{h.services.join(", ")}</td>
                      <td className="p-3"><Star className="w-3 h-3 fill-primary text-primary inline" /> {h.rating}</td>
                      <td className="p-3"><span className={`text-xs font-medium px-2 py-0.5 rounded-full ${h.safetyScore >= 97 ? "bg-accent/10 text-accent" : "bg-primary/10 text-primary"}`}>{h.safetyScore}/100</span></td>
                      <td className="p-3"><span className="text-xs font-medium px-2 py-0.5 rounded-full bg-accent/10 text-accent">{h.verified ? "Verified" : "Pending"}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Bookings Tab */}
        {activeTab === "bookings" && (
          <div className="mt-6 space-y-3">
            <h2 className="text-xl font-bold text-foreground mb-4">All Bookings ({mockBookings.length})</h2>
            {mockBookings.map(b => {
              const h = hosts.find(x => x.id === b.hostId);
              return (
                <div key={b.id} className="rounded-lg bg-card p-4 shadow-card flex justify-between items-center">
                  <div>
                    <p className="font-medium text-foreground">#{b.id} · {h?.name}, {h?.city}</p>
                    <p className="text-xs text-muted-foreground">{b.startDate} → {b.endDate} · {b.services.join(", ")} · {b.guests} guests</p>
                    {b.message && <p className="text-xs text-muted-foreground italic mt-1">"{b.message}"</p>}
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-foreground">${b.totalPrice}</p>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${b.status === "confirmed" ? "bg-accent/10 text-accent" : b.status === "pending" ? "bg-primary/10 text-primary" : "bg-secondary text-muted-foreground"}`}>{b.status}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Experiences Tab */}
        {activeTab === "experiences" && (
          <div className="mt-6">
            <h2 className="text-xl font-bold text-foreground mb-4">All Experiences ({experiences.length})</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {experiences.map(e => (
                <div key={e.id} className="rounded-lg bg-card p-4 shadow-card">
                  <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">{e.category}</span>
                  <h3 className="mt-2 font-bold text-foreground">{e.title}</h3>
                  <p className="text-xs text-muted-foreground mt-1">{e.hostName}, {e.hostCity} · ${e.price} · {e.duration}</p>
                  <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1"><Star className="w-3 h-3 fill-primary text-primary" />{e.rating} ({e.reviewCount} reviews)</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Destinations Tab */}
        {activeTab === "destinations" && (
          <div className="mt-6">
            <h2 className="text-xl font-bold text-foreground mb-4">All Destinations ({destinations.length})</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {destinations.map(d => (
                <div key={d.name} className="rounded-lg bg-card p-4 shadow-card">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-primary" />
                    <h3 className="font-bold text-foreground">{d.name}</h3>
                    <span className="text-xs bg-secondary text-muted-foreground px-2 py-0.5 rounded-full ml-auto">{d.state}</span>
                  </div>
                  <p className="text-sm text-primary mt-1">{d.tagline}</p>
                  <p className="text-xs text-muted-foreground mt-1">{d.hostCount} hosts</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Moderation Tab */}
        {activeTab === "moderation" && (
          <div className="mt-6 space-y-6">
            <h2 className="text-xl font-bold text-foreground mb-4">Content Moderation</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="rounded-lg bg-card p-5 shadow-card text-center">
                <AlertTriangle className="w-8 h-8 text-primary mx-auto mb-2" />
                <p className="text-2xl font-bold text-foreground">0</p>
                <p className="text-xs text-muted-foreground">Pending Reports</p>
              </div>
              <div className="rounded-lg bg-card p-5 shadow-card text-center">
                <Shield className="w-8 h-8 text-accent mx-auto mb-2" />
                <p className="text-2xl font-bold text-foreground">{hosts.length}</p>
                <p className="text-xs text-muted-foreground">Verified Hosts</p>
              </div>
              <div className="rounded-lg bg-card p-5 shadow-card text-center">
                <Flag className="w-8 h-8 text-destructive mx-auto mb-2" />
                <p className="text-2xl font-bold text-foreground">0</p>
                <p className="text-xs text-muted-foreground">Flagged Content</p>
              </div>
            </div>
            <div>
              <h3 className="font-bold text-foreground mb-3">Recent Reviews to Monitor</h3>
              <div className="space-y-3">
                {reviews.slice(0, 4).map(r => (
                  <div key={r.id} className="rounded-lg bg-card p-4 shadow-card flex justify-between items-start">
                    <div>
                      <p className="text-sm font-medium text-foreground">{r.travelerName} → {hosts.find(h => h.id === r.hostId)?.name}</p>
                      <p className="text-xs text-muted-foreground mt-1">{r.text}</p>
                    </div>
                    <Button variant="ghost" size="sm" className="text-xs shrink-0"><Eye className="w-3 h-3 mr-1" />Review</Button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === "analytics" && (
          <div className="mt-6 space-y-6">
            <h2 className="text-xl font-bold text-foreground mb-4">Platform Analytics</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { label: "Monthly Active Users", value: "2,450" },
                { label: "Avg Booking Value", value: `$${Math.round(totalRevenue / mockBookings.length)}` },
                { label: "Conversion Rate", value: "8.3%" },
                { label: "Repeat Bookings", value: "34%" },
              ].map(s => (
                <div key={s.label} className="rounded-lg bg-card p-4 shadow-card">
                  <p className="text-2xl font-bold text-foreground">{s.value}</p>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="rounded-lg bg-card p-5 shadow-card">
                <h3 className="text-sm font-bold text-foreground uppercase tracking-wider mb-3">Top Cities by Bookings</h3>
                {["Jaipur", "Delhi", "Goa", "Varanasi", "Udaipur"].map((city, i) => (
                  <div key={city} className="flex justify-between text-sm py-1">
                    <span className="text-muted-foreground">{i + 1}. {city}</span>
                    <span className="font-medium text-foreground">{[35, 28, 22, 18, 15][i]}%</span>
                  </div>
                ))}
              </div>
              <div className="rounded-lg bg-card p-5 shadow-card">
                <h3 className="text-sm font-bold text-foreground uppercase tracking-wider mb-3">Top Experience Categories</h3>
                {["Cultural", "Food", "Wellness", "Spiritual", "Adventure"].map((cat, i) => (
                  <div key={cat} className="flex justify-between text-sm py-1">
                    <span className="text-muted-foreground">{cat}</span>
                    <span className="font-medium text-foreground">{[30, 25, 18, 15, 12][i]}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === "settings" && (
          <div className="mt-6 space-y-4 max-w-xl">
            <h2 className="text-xl font-bold text-foreground mb-4">Platform Settings</h2>
            {[
              { icon: DollarSign, label: "Commission Rate", desc: "Currently 15% platform fee on all bookings" },
              { icon: Shield, label: "KYC Requirements", desc: "Manage verification requirements for hosts" },
              { icon: FileText, label: "Terms & Policies", desc: "Edit platform terms, privacy policy, and guidelines" },
              { icon: Settings, label: "General Settings", desc: "Platform name, currencies, languages, and regions" },
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

export default AdminDashboard;
