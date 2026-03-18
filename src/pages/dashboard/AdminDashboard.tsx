import { useState } from "react";
import { motion } from "framer-motion";
import { Users, DollarSign, TrendingUp, Shield, AlertTriangle, Star, MapPin, Calendar, Settings, FileText, BarChart3, Globe, Flag, Eye, Plus, Trash2, UtensilsCrossed, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { hosts, mockBookings, reviews, experiences, destinations } from "@/lib/data";
import { useLocalStorage } from "@/hooks/use-local-storage";
import EditDialog, { FieldConfig } from "@/components/EditDialog";
import { useToast } from "@/hooks/use-toast";

type Tab = "overview" | "hosts" | "bookings" | "experiences" | "destinations" | "moderation" | "analytics" | "settings";

const destinationFields: FieldConfig[] = [
  { key: "name", label: "City Name", required: true },
  { key: "state", label: "State", required: true },
  { key: "tagline", label: "Tagline", required: true },
  { key: "description", label: "Description", type: "textarea", required: true },
  { key: "hostCount", label: "Host Count", type: "number", required: true },
];

const experienceFields: FieldConfig[] = [
  { key: "title", label: "Title", required: true },
  { key: "description", label: "Description", type: "textarea", required: true },
  { key: "category", label: "Category", type: "select", options: ["Cultural", "Food", "Spiritual", "Wellness", "Adventure", "Wedding", "Village", "Festival", "Medical Care"], required: true },
  { key: "price", label: "Price ($)", type: "number", required: true },
  { key: "duration", label: "Duration", required: true },
];

const settingsFields: FieldConfig[] = [
  { key: "commissionRate", label: "Commission Rate (%)", type: "number", required: true },
  { key: "platformName", label: "Platform Name", required: true },
  { key: "defaultCurrency", label: "Default Currency", type: "select", options: ["USD", "EUR", "GBP", "INR"] },
];

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const { toast } = useToast();
  const totalRevenue = mockBookings.reduce((s, b) => s + b.totalPrice, 0);
  const platformFee = Math.round(totalRevenue * 0.15);

  // CRUD state
  const [customDestinations, setCustomDestinations] = useLocalStorage<any[]>("admin_custom_destinations", []);
  const [hostStatuses, setHostStatuses] = useLocalStorage<Record<string, string>>("admin_host_statuses", {});
  const [bookingOverrides, setBookingOverrides] = useLocalStorage<Record<string, string>>("admin_booking_overrides", {});
  const [flaggedReviews, setFlaggedReviews] = useLocalStorage<string[]>("admin_flagged_reviews", []);
  const [platformSettings, setPlatformSettings] = useLocalStorage("admin_settings", {
    commissionRate: 15, platformName: "Travelista", defaultCurrency: "USD",
  });

  const [editDialog, setEditDialog] = useState<{ open: boolean; title: string; fields: FieldConfig[]; data?: any; onSave: (d: any) => void; onDelete?: () => void }>({
    open: false, title: "", fields: [], onSave: () => {},
  });

  const allDestinations = [...destinations, ...customDestinations];
  const getHostStatus = (id: string) => hostStatuses[id] || "verified";
  const getBookingStatus = (id: string, orig: string) => bookingOverrides[id] || orig;

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
          <p className="mt-1 text-muted-foreground">Platform overview and management · Commission: {platformSettings.commissionRate}%</p>
        </motion.div>

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
                    <div className="flex justify-between"><span className="text-muted-foreground">Destinations</span><span className="font-medium text-foreground">{allDestinations.length}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Total Reviews</span><span className="font-medium text-foreground">{reviews.length}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Flagged Reviews</span><span className="font-medium text-destructive">{flaggedReviews.length}</span></div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Hosts Tab with CRUD */}
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
                    <th className="text-left p-3 font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {hosts.map(h => {
                    const status = getHostStatus(h.id);
                    return (
                      <tr key={h.id} className="border-t border-border hover:bg-secondary/50">
                        <td className="p-3 flex items-center gap-2">
                          <img src={h.image} alt={h.name} className="w-8 h-8 rounded-full object-cover" />
                          <span className="font-medium text-foreground">{h.name}</span>
                        </td>
                        <td className="p-3 text-muted-foreground">{h.city}</td>
                        <td className="p-3 text-muted-foreground">{h.services.join(", ")}</td>
                        <td className="p-3"><Star className="w-3 h-3 fill-primary text-primary inline" /> {h.rating}</td>
                        <td className="p-3"><span className={`text-xs font-medium px-2 py-0.5 rounded-full ${h.safetyScore >= 97 ? "bg-accent/10 text-accent" : "bg-primary/10 text-primary"}`}>{h.safetyScore}/100</span></td>
                        <td className="p-3">
                          <select className="text-xs rounded-md border border-input bg-background px-2 py-1"
                            value={status} onChange={e => { setHostStatuses(p => ({ ...p, [h.id]: e.target.value })); toast({ title: `${h.name} status updated to ${e.target.value}` }); }}>
                            <option value="verified">Verified</option>
                            <option value="pending">Pending</option>
                            <option value="suspended">Suspended</option>
                          </select>
                        </td>
                        <td className="p-3">
                          <Button variant="ghost" size="sm" className="text-xs"><Eye className="w-3 h-3 mr-1" />View</Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Bookings Tab with status override */}
        {activeTab === "bookings" && (
          <div className="mt-6 space-y-3">
            <h2 className="text-xl font-bold text-foreground mb-4">All Bookings ({mockBookings.length})</h2>
            {mockBookings.map(b => {
              const h = hosts.find(x => x.id === b.hostId);
              const status = getBookingStatus(b.id, b.status);
              return (
                <div key={b.id} className="rounded-lg bg-card p-4 shadow-card flex justify-between items-center">
                  <div>
                    <p className="font-medium text-foreground">#{b.id} · {h?.name}, {h?.city}</p>
                    <p className="text-xs text-muted-foreground">{b.startDate} → {b.endDate} · {b.services.join(", ")} · {b.guests} guests</p>
                    {b.message && <p className="text-xs text-muted-foreground italic mt-1">"{b.message}"</p>}
                  </div>
                  <div className="text-right flex items-center gap-3">
                    <p className="font-bold text-foreground">${b.totalPrice}</p>
                    <select className="text-xs rounded-md border border-input bg-background px-2 py-1"
                      value={status} onChange={e => { setBookingOverrides(p => ({ ...p, [b.id]: e.target.value })); toast({ title: `Booking #${b.id} → ${e.target.value}` }); }}>
                      <option value="pending">Pending</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
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

        {/* Destinations Tab with CRUD */}
        {activeTab === "destinations" && (
          <div className="mt-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-foreground">All Destinations ({allDestinations.length})</h2>
              <Button size="sm" className="rounded-full gap-1 text-xs" onClick={() => setEditDialog({
                open: true, title: "Add Destination", fields: destinationFields,
                onSave: (d) => { setCustomDestinations(p => [...p, d]); toast({ title: "Destination added!" }); },
              })}>
                <Plus className="w-3 h-3" /> Add Destination
              </Button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {allDestinations.map((d, i) => {
                const isCustom = i >= destinations.length;
                return (
                  <div key={`${d.name}-${i}`} className="rounded-lg bg-card p-4 shadow-card">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-primary" />
                      <h3 className="font-bold text-foreground">{d.name}</h3>
                      <span className="text-xs bg-secondary text-muted-foreground px-2 py-0.5 rounded-full ml-auto">{d.state}</span>
                    </div>
                    <p className="text-sm text-primary mt-1">{d.tagline}</p>
                    <p className="text-xs text-muted-foreground mt-1">{d.hostCount} hosts</p>
                    <div className="mt-2 flex gap-2">
                      <Button variant="outline" size="sm" className="rounded-full text-xs" onClick={() => setEditDialog({
                        open: true, title: "Edit Destination", fields: destinationFields, data: d,
                        onSave: (data) => {
                          if (isCustom) { const ci = i - destinations.length; setCustomDestinations(p => p.map((x, j) => j === ci ? data : x)); }
                          toast({ title: "Destination updated!" });
                        },
                        onDelete: isCustom ? () => {
                          const ci = i - destinations.length;
                          setCustomDestinations(p => p.filter((_, j) => j !== ci));
                          toast({ title: "Destination removed" });
                        } : undefined,
                      })}>Edit</Button>
                      {isCustom && (
                        <Button variant="outline" size="sm" className="rounded-full text-xs text-destructive" onClick={() => {
                          const ci = i - destinations.length;
                          setCustomDestinations(p => p.filter((_, j) => j !== ci));
                          toast({ title: "Destination removed" });
                        }}>
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Moderation Tab with actions */}
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
                <p className="text-2xl font-bold text-foreground">{flaggedReviews.length}</p>
                <p className="text-xs text-muted-foreground">Flagged Reviews</p>
              </div>
            </div>
            <div>
              <h3 className="font-bold text-foreground mb-3">Reviews to Moderate</h3>
              <div className="space-y-3">
                {reviews.map(r => {
                  const isFlagged = flaggedReviews.includes(r.id);
                  return (
                    <div key={r.id} className={`rounded-lg bg-card p-4 shadow-card flex justify-between items-start ${isFlagged ? "border-2 border-destructive/30" : ""}`}>
                      <div>
                        <p className="text-sm font-medium text-foreground">{r.travelerName} → {hosts.find(h => h.id === r.hostId)?.name}</p>
                        <div className="flex gap-0.5 mt-0.5">{Array.from({ length: r.rating }).map((_, j) => <Star key={j} className="w-3 h-3 fill-primary text-primary" />)}</div>
                        <p className="text-xs text-muted-foreground mt-1">{r.text}</p>
                        {isFlagged && <span className="text-xs text-destructive mt-1 inline-block">⚠️ Flagged for review</span>}
                      </div>
                      <div className="flex gap-2 shrink-0">
                        {!isFlagged ? (
                          <Button variant="outline" size="sm" className="text-xs rounded-full" onClick={() => {
                            setFlaggedReviews(p => [...p, r.id]);
                            toast({ title: "Review flagged", description: `Review by ${r.travelerName} flagged for investigation.` });
                          }}>
                            <Flag className="w-3 h-3 mr-1" /> Flag
                          </Button>
                        ) : (
                          <Button variant="outline" size="sm" className="text-xs rounded-full" onClick={() => {
                            setFlaggedReviews(p => p.filter(id => id !== r.id));
                            toast({ title: "Flag removed" });
                          }}>
                            Unflag
                          </Button>
                        )}
                        <Button variant="ghost" size="sm" className="text-xs"><Eye className="w-3 h-3" /></Button>
                      </div>
                    </div>
                  );
                })}
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
            <div className="rounded-lg bg-card p-5 shadow-card">
              <h3 className="text-sm font-bold text-foreground uppercase tracking-wider mb-3">Food Service Analytics</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { label: "Hosts with Food", value: hosts.filter(h => h.foodInfo).length },
                  { label: "Total Dishes", value: hosts.reduce((s, h) => s + (h.foodInfo?.dishes.length || 0), 0) },
                  { label: "Cuisines", value: new Set(hosts.flatMap(h => h.foodInfo?.cuisines || [])).size },
                  { label: "Avg Dish Price", value: `$${Math.round(hosts.flatMap(h => h.foodInfo?.dishes || []).reduce((s, d) => s + d.price, 0) / Math.max(1, hosts.flatMap(h => h.foodInfo?.dishes || []).length))}` },
                ].map(s => (
                  <div key={s.label} className="text-center">
                    <p className="text-xl font-bold text-foreground">{s.value}</p>
                    <p className="text-xs text-muted-foreground">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Settings Tab — Functional */}
        {activeTab === "settings" && (
          <div className="mt-6 space-y-6 max-w-xl">
            <h2 className="text-xl font-bold text-foreground mb-4">Platform Settings</h2>

            <div className="rounded-lg bg-card p-5 shadow-card space-y-4">
              <h3 className="font-bold text-foreground flex items-center gap-2"><DollarSign className="w-4 h-4 text-primary" /> Commission & Revenue</h3>
              <div>
                <label className="text-sm font-medium text-foreground">Commission Rate (%)</label>
                <input type="number" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm mt-1"
                  value={platformSettings.commissionRate}
                  onChange={e => setPlatformSettings(p => ({ ...p, commissionRate: Number(e.target.value) }))} />
              </div>
              <Button size="sm" className="rounded-full gap-2" onClick={() => toast({ title: "Commission rate updated", description: `New rate: ${platformSettings.commissionRate}%` })}>
                Save
              </Button>
            </div>

            <div className="rounded-lg bg-card p-5 shadow-card space-y-4">
              <h3 className="font-bold text-foreground flex items-center gap-2"><Settings className="w-4 h-4 text-primary" /> General</h3>
              <div>
                <label className="text-sm font-medium text-foreground">Platform Name</label>
                <input className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm mt-1"
                  value={platformSettings.platformName}
                  onChange={e => setPlatformSettings(p => ({ ...p, platformName: e.target.value }))} />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">Default Currency</label>
                <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm mt-1"
                  value={platformSettings.defaultCurrency}
                  onChange={e => setPlatformSettings(p => ({ ...p, defaultCurrency: e.target.value }))}>
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                  <option value="GBP">GBP</option>
                  <option value="INR">INR</option>
                </select>
              </div>
              <Button size="sm" className="rounded-full gap-2" onClick={() => toast({ title: "Settings saved!" })}>
                Save Settings
              </Button>
            </div>

            <div className="rounded-lg bg-card p-5 shadow-card space-y-3">
              <h3 className="font-bold text-foreground flex items-center gap-2"><Shield className="w-4 h-4 text-primary" /> KYC Requirements</h3>
              <p className="text-sm text-muted-foreground">All hosts must complete ID verification, address proof, and background check.</p>
              <Button variant="outline" size="sm" className="rounded-full text-xs" onClick={() => toast({ title: "KYC settings saved" })}>Update Requirements</Button>
            </div>

            <div className="rounded-lg bg-card p-5 shadow-card space-y-3">
              <h3 className="font-bold text-foreground flex items-center gap-2"><Video className="w-4 h-4 text-primary" /> Video Review Policy</h3>
              <p className="text-sm text-muted-foreground">Video reviews are mandatory for all traveler feedback. Videos are used as testimonials with consent.</p>
              <Button variant="outline" size="sm" className="rounded-full text-xs" onClick={() => toast({ title: "Video policy updated" })}>Edit Policy</Button>
            </div>

            <div className="rounded-lg bg-card p-5 shadow-card space-y-3">
              <h3 className="font-bold text-foreground flex items-center gap-2"><FileText className="w-4 h-4 text-primary" /> Terms & Policies</h3>
              <Button variant="outline" size="sm" className="rounded-full text-xs" onClick={() => toast({ title: "This would open the policy editor" })}>Edit Terms</Button>
              <Button variant="outline" size="sm" className="rounded-full text-xs ml-2" onClick={() => toast({ title: "This would open the privacy policy editor" })}>Edit Privacy Policy</Button>
            </div>
          </div>
        )}
      </div>
      <Footer />

      <EditDialog open={editDialog.open} onClose={() => setEditDialog(p => ({ ...p, open: false }))}
        title={editDialog.title} fields={editDialog.fields} initialData={editDialog.data}
        onSave={editDialog.onSave} onDelete={editDialog.onDelete} />
    </div>
  );
};

export default AdminDashboard;
