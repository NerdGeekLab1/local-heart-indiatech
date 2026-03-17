import { motion } from "framer-motion";
import { Users, DollarSign, TrendingUp, Shield, AlertTriangle, Star, MapPin, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { hosts, mockBookings, reviews, experiences, destinations } from "@/lib/data";

const AdminDashboard = () => {
  const totalRevenue = mockBookings.reduce((s, b) => s + b.totalPrice, 0);
  const platformFee = Math.round(totalRevenue * 0.15);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 mx-auto max-w-7xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
          <p className="mt-1 text-muted-foreground">Platform overview and management</p>
        </motion.div>

        {/* Key Metrics */}
        <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-4">
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

        <div className="mt-10 grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Hosts Table */}
          <div className="lg:col-span-2">
            <h2 className="text-xl font-bold text-foreground mb-4">All Hosts</h2>
            <div className="rounded-lg bg-card shadow-card overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-secondary">
                  <tr>
                    <th className="text-left p-3 font-medium text-muted-foreground">Host</th>
                    <th className="text-left p-3 font-medium text-muted-foreground">City</th>
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
                      <td className="p-3"><span className="flex items-center gap-1"><Star className="w-3 h-3 fill-primary text-primary" />{h.rating}</span></td>
                      <td className="p-3"><span className={`text-xs font-medium px-2 py-0.5 rounded-full ${h.safetyScore >= 97 ? "bg-accent/10 text-accent" : "bg-primary/10 text-primary"}`}>{h.safetyScore}/100</span></td>
                      <td className="p-3"><span className="text-xs font-medium px-2 py-0.5 rounded-full bg-accent/10 text-accent">{h.verified ? "Verified" : "Pending"}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Recent Bookings */}
            <h2 className="text-xl font-bold text-foreground mb-4 mt-8">Recent Bookings</h2>
            <div className="space-y-3">
              {mockBookings.map(b => {
                const host = hosts.find(h => h.id === b.hostId);
                return (
                  <div key={b.id} className="rounded-lg bg-card p-4 shadow-card flex justify-between items-center">
                    <div>
                      <p className="font-medium text-foreground">#{b.id} · {host?.name}, {host?.city}</p>
                      <p className="text-xs text-muted-foreground">{b.startDate} → {b.endDate} · {b.services.join(", ")}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-foreground">${b.totalPrice}</p>
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${b.status === "confirmed" ? "bg-accent/10 text-accent" : b.status === "pending" ? "bg-primary/10 text-primary" : "bg-secondary text-muted-foreground"}`}>{b.status}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <div className="rounded-lg bg-card p-5 shadow-card">
              <h3 className="text-sm font-bold text-foreground uppercase tracking-wider mb-3">Platform Health</h3>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Active Hosts</span>
                  <span className="font-medium text-foreground">{hosts.length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Experiences Listed</span>
                  <span className="font-medium text-foreground">{experiences.length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Destinations</span>
                  <span className="font-medium text-foreground">{destinations.length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Total Reviews</span>
                  <span className="font-medium text-foreground">{reviews.length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Avg. Host Rating</span>
                  <span className="font-medium text-accent">{(hosts.reduce((s, h) => s + h.rating, 0) / hosts.length).toFixed(1)}</span>
                </div>
              </div>
            </div>

            <div className="rounded-lg bg-card p-5 shadow-card">
              <h3 className="text-sm font-bold text-foreground uppercase tracking-wider mb-3">Top Destinations</h3>
              <div className="space-y-2">
                {destinations.slice(0, 5).map(d => (
                  <div key={d.name} className="flex justify-between items-center text-sm">
                    <span className="flex items-center gap-1 text-foreground"><MapPin className="w-3 h-3 text-primary" />{d.name}</span>
                    <span className="text-muted-foreground">{d.hostCount} hosts</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-lg bg-card p-5 shadow-card">
              <h3 className="text-sm font-bold text-foreground uppercase tracking-wider mb-3">Moderation</h3>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <AlertTriangle className="w-4 h-4 text-primary" />
                  <span>0 reports pending review</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Shield className="w-4 h-4 text-accent" />
                  <span>All hosts KYC-verified</span>
                </div>
              </div>
              <Button variant="outline" className="w-full mt-3 rounded-lg text-sm">Review Content</Button>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default AdminDashboard;
