import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { DollarSign, Users, Star, Calendar, Clock, TrendingUp, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { mockBookings, hosts, reviews } from "@/lib/data";

const host = hosts[0]; // Mock: logged in as Ravi
const hostBookings = mockBookings.filter(b => b.hostId === host.id);
const hostReviews = reviews.filter(r => r.hostId === host.id);

const statusColors: Record<string, string> = {
  pending: "bg-primary/10 text-primary",
  confirmed: "bg-accent/10 text-accent",
  completed: "bg-secondary text-muted-foreground",
  cancelled: "bg-destructive/10 text-destructive",
};

const HostDashboard = () => {
  const totalEarnings = hostBookings.reduce((sum, b) => sum + b.totalPrice, 0);

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

        {/* Stats */}
        <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-4">
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

        <div className="mt-10 grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Bookings */}
          <div className="lg:col-span-2">
            <h2 className="text-xl font-bold text-foreground mb-4">Booking Requests</h2>
            <div className="space-y-3">
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

            {/* Recent Reviews */}
            <h2 className="text-xl font-bold text-foreground mb-4 mt-8">Recent Reviews</h2>
            <div className="space-y-3">
              {hostReviews.slice(0, 3).map(r => (
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
          </div>

          {/* Side Panel */}
          <div className="space-y-4">
            <div className="rounded-lg bg-card p-5 shadow-card">
              <h3 className="text-sm font-bold text-foreground uppercase tracking-wider mb-3">Quick Actions</h3>
              <div className="space-y-2">
                <Button variant="outline" className="w-full justify-start gap-2 rounded-lg"><Calendar className="w-4 h-4" /> Update Availability</Button>
                <Button variant="outline" className="w-full justify-start gap-2 rounded-lg"><DollarSign className="w-4 h-4" /> Edit Pricing</Button>
                <Button variant="outline" className="w-full justify-start gap-2 rounded-lg"><MessageCircle className="w-4 h-4" /> View Messages</Button>
                <Link to={`/host/${host.id}`}><Button variant="outline" className="w-full justify-start gap-2 rounded-lg"><Users className="w-4 h-4" /> View Public Profile</Button></Link>
              </div>
            </div>

            <div className="rounded-lg bg-card p-5 shadow-card">
              <h3 className="text-sm font-bold text-foreground uppercase tracking-wider mb-3">Performance</h3>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Response Rate</span>
                  <span className="font-medium text-foreground">98%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Acceptance Rate</span>
                  <span className="font-medium text-foreground">95%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">This Month</span>
                  <span className="font-medium text-accent flex items-center gap-1"><TrendingUp className="w-3 h-3" /> +23%</span>
                </div>
              </div>
            </div>

            <div className="rounded-lg bg-primary/5 border border-primary/20 p-5">
              <h3 className="text-sm font-bold text-foreground mb-2">💡 Tip</h3>
              <p className="text-sm text-muted-foreground">Hosts who respond within 1 hour get 40% more bookings. Keep notifications on!</p>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default HostDashboard;
