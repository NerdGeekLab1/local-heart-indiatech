import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Users, DollarSign, TrendingUp, Shield, AlertTriangle, Star, MapPin, Calendar, Settings, FileText, BarChart3, Globe, Flag, Eye, Plus, Trash2, UtensilsCrossed, Video, ChevronDown, Ban, CheckCircle, Edit, Compass, MessageSquare, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { hosts, mockBookings, reviews, experiences, destinations } from "@/lib/data";
import { useLocalStorage } from "@/hooks/use-local-storage";
import EditDialog, { FieldConfig } from "@/components/EditDialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

type Tab = "overview" | "hosts" | "bookings" | "experiences" | "destinations" | "trips" | "grievances" | "users" | "wanderers" | "moderation" | "analytics" | "settings";

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
  { key: "category", label: "Category", type: "select", options: ["Cultural", "Food", "Spiritual", "Wellness", "Adventure", "Wedding", "Village", "Festival", "Medical Care", "Bike Tour"], required: true },
  { key: "price", label: "Price ($)", type: "number", required: true },
  { key: "duration", label: "Duration", required: true },
];

const hostEditFields: FieldConfig[] = [
  { key: "name", label: "Host Name", required: true },
  { key: "city", label: "City", required: true },
  { key: "tagline", label: "Tagline", required: true },
  { key: "bio", label: "Bio", type: "textarea", required: true },
  { key: "pricePerDay", label: "Price Per Day ($)", type: "number", required: true },
  { key: "safetyScore", label: "Safety Score", type: "number", required: true },
];

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const { toast } = useToast();
  const totalRevenue = mockBookings.reduce((s, b) => s + b.totalPrice, 0);
  const platformFee = Math.round(totalRevenue * 0.15);

  // CRUD state
  const [customDestinations, setCustomDestinations] = useLocalStorage<any[]>("admin_custom_destinations", []);
  const [hostStatuses, setHostStatuses] = useLocalStorage<Record<string, string>>("admin_host_statuses", {});
  const [hostNotes, setHostNotes] = useLocalStorage<Record<string, string>>("admin_host_notes", {});
  const [bookingOverrides, setBookingOverrides] = useLocalStorage<Record<string, string>>("admin_booking_overrides", {});
  const [flaggedReviews, setFlaggedReviews] = useLocalStorage<string[]>("admin_flagged_reviews", []);
  const [removedReviews, setRemovedReviews] = useLocalStorage<string[]>("admin_removed_reviews", []);
  const [expandedHost, setExpandedHost] = useState<string | null>(null);
  const [platformSettings, setPlatformSettings] = useLocalStorage("admin_settings", {
    commissionRate: 15, platformName: "Travelista", defaultCurrency: "USD",
  });

  const [editDialog, setEditDialog] = useState<{ open: boolean; title: string; fields: FieldConfig[]; data?: any; onSave: (d: any) => void; onDelete?: () => void }>({
    open: false, title: "", fields: [], onSave: () => {},
  });

  // DB-backed data
  const [dbTrips, setDbTrips] = useState<any[]>([]);
  const [dbGrievances, setDbGrievances] = useState<any[]>([]);
  const [dbExperienceRequests, setDbExperienceRequests] = useState<any[]>([]);
  const [tripNotes, setTripNotes] = useState<Record<string, string>>({});
  const [grievanceNotes, setGrievanceNotes] = useState<Record<string, string>>({});
  const [dbUsers, setDbUsers] = useState<any[]>([]);
  const [userRoles, setUserRoles] = useState<any[]>([]);
  const [dbWanderers, setDbWanderers] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const [{ data: trips }, { data: grievances }, { data: expReqs }, { data: profiles }, { data: roles }, { data: wanderers }] = await Promise.all([
        supabase.from("trip_listings").select("*").order("created_at", { ascending: false }),
        supabase.from("grievances").select("*").order("created_at", { ascending: false }),
        supabase.from("experience_requests").select("*").order("created_at", { ascending: false }),
        supabase.from("profiles").select("*").order("created_at", { ascending: false }),
        supabase.from("user_roles").select("*"),
        supabase.from("beta_wanderers").select("*").order("created_at", { ascending: false }),
      ]);
      setDbTrips(trips || []);
      setDbGrievances(grievances || []);
      setDbExperienceRequests(expReqs || []);
      setDbUsers(profiles || []);
      setUserRoles(roles || []);
      setDbWanderers(wanderers || []);
    };
    fetchData();
  }, []);

  const updateWandererStatus = async (id: string, status: string) => {
    await supabase.from("beta_wanderers").update({ status, updated_at: new Date().toISOString() }).eq("id", id);
    setDbWanderers(p => p.map(w => w.id === id ? { ...w, status } : w));
    toast({ title: `Wanderer ${status}` });
  };

  const updateTripStatus = async (id: string, status: string) => {
    await supabase.from("trip_listings").update({ status }).eq("id", id);
    setDbTrips(p => p.map(t => t.id === id ? { ...t, status } : t));
    toast({ title: `Trip ${status}` });
  };

  const updateGrievanceStatus = async (id: string, status: string, resolution?: string) => {
    const update: any = { status, updated_at: new Date().toISOString() };
    if (resolution) update.resolution = resolution;
    if (grievanceNotes[id]) update.admin_notes = grievanceNotes[id];
    await supabase.from("grievances").update(update).eq("id", id);
    setDbGrievances(p => p.map(g => g.id === id ? { ...g, ...update } : g));
    toast({ title: `Grievance ${status}` });
  };

  const updateExperienceRequest = async (id: string, status: string) => {
    await supabase.from("experience_requests").update({ status }).eq("id", id);
    setDbExperienceRequests(p => p.map(e => e.id === id ? { ...e, status } : e));
    toast({ title: `Experience request ${status}` });
  };

  const allDestinations = [...destinations, ...customDestinations];
  const getHostStatus = (id: string) => hostStatuses[id] || "verified";
  const getBookingStatus = (id: string, orig: string) => bookingOverrides[id] || orig;
  const activeReviews = reviews.filter(r => !removedReviews.includes(r.id));

  const statusBadge = (status: string) => {
    const colors: Record<string, string> = {
      verified: "bg-accent/10 text-accent", pending: "bg-primary/10 text-primary",
      suspended: "bg-destructive/10 text-destructive", live: "bg-accent/10 text-accent",
      active: "bg-accent/10 text-accent", approved: "bg-accent/10 text-accent",
      rejected: "bg-destructive/10 text-destructive", open: "bg-primary/10 text-primary",
      resolved: "bg-accent/10 text-accent", closed: "bg-secondary text-muted-foreground",
      in_progress: "bg-primary/10 text-primary",
    };
    return colors[status] || "bg-secondary text-muted-foreground";
  };

  const tabs: { id: Tab; label: string; icon: React.ElementType }[] = [
    { id: "overview", label: "Overview", icon: BarChart3 },
    { id: "hosts", label: "Hosts", icon: Users },
    { id: "bookings", label: "Bookings", icon: Calendar },
    { id: "experiences", label: "Experiences", icon: Globe },
    { id: "trips", label: "Trips", icon: Compass },
    { id: "grievances", label: "Grievances", icon: MessageSquare },
    { id: "users", label: "Users", icon: Users },
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
              {t.id === "trips" && dbTrips.filter(t => t.status === "pending").length > 0 && (
                <span className="w-5 h-5 rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold flex items-center justify-center">
                  {dbTrips.filter(t => t.status === "pending").length}
                </span>
              )}
              {t.id === "grievances" && dbGrievances.filter(g => g.status === "open").length > 0 && (
                <span className="w-5 h-5 rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold flex items-center justify-center">
                  {dbGrievances.filter(g => g.status === "open").length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Overview */}
        {activeTab === "overview" && (
          <>
            <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4">
              {[
                { label: "Total Hosts", value: hosts.length, icon: Users, color: "text-primary" },
                { label: "Total Bookings", value: mockBookings.length, icon: Calendar, color: "text-accent" },
                { label: "GMV", value: `$${totalRevenue}`, icon: DollarSign, color: "text-accent" },
                { label: "Platform Revenue", value: `$${platformFee}`, icon: TrendingUp, color: "text-primary" },
                { label: "Active Trips", value: dbTrips.filter(t => t.status === "active").length, icon: Compass, color: "text-accent" },
                { label: "Open Grievances", value: dbGrievances.filter(g => g.status === "open").length, icon: MessageSquare, color: "text-destructive" },
              ].map(s => (
                <div key={s.label} className="rounded-lg bg-card p-4 shadow-card">
                  <s.icon className={`w-5 h-5 ${s.color} mb-2`} />
                  <p className="text-2xl font-bold text-foreground">{s.value}</p>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                </div>
              ))}
            </div>
            <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div>
                <h2 className="text-xl font-bold text-foreground mb-4">Recent Bookings</h2>
                <div className="space-y-3">
                  {mockBookings.slice(0, 3).map(b => {
                    const h = hosts.find(x => x.id === b.hostId);
                    return (
                      <div key={b.id} className="rounded-lg bg-card p-4 shadow-card flex justify-between items-center">
                        <div>
                          <p className="font-medium text-foreground">#{b.id} · {h?.name}, {h?.city}</p>
                          <p className="text-xs text-muted-foreground">{b.startDate} → {b.endDate}</p>
                        </div>
                        <p className="font-bold text-foreground">${b.totalPrice}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
              <div>
                <h2 className="text-xl font-bold text-foreground mb-4">Pending Actions</h2>
                <div className="space-y-3">
                  {dbTrips.filter(t => t.status === "pending").slice(0, 3).map(t => (
                    <div key={t.id} className="rounded-lg bg-card p-4 shadow-card flex justify-between items-center">
                      <div>
                        <p className="font-medium text-foreground">{t.title}</p>
                        <p className="text-xs text-muted-foreground">Trip · {t.destination || "No destination"}</p>
                      </div>
                      <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">Pending</span>
                    </div>
                  ))}
                  {dbGrievances.filter(g => g.status === "open").slice(0, 3).map(g => (
                    <div key={g.id} className="rounded-lg bg-card p-4 shadow-card flex justify-between items-center">
                      <div>
                        <p className="font-medium text-foreground">{g.subject}</p>
                        <p className="text-xs text-muted-foreground">Grievance · {g.category}</p>
                      </div>
                      <span className="text-xs bg-destructive/10 text-destructive px-2 py-0.5 rounded-full">{g.priority}</span>
                    </div>
                  ))}
                  {dbExperienceRequests.filter(e => e.status === "pending").slice(0, 2).map(e => (
                    <div key={e.id} className="rounded-lg bg-card p-4 shadow-card flex justify-between items-center">
                      <div>
                        <p className="font-medium text-foreground">{e.title}</p>
                        <p className="text-xs text-muted-foreground">Experience Request · {e.category}</p>
                      </div>
                      <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">Pending</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}

        {/* Trips Tab — Approve/Reject */}
        {activeTab === "trips" && (
          <div className="mt-6">
            <h2 className="text-xl font-bold text-foreground mb-4">Trip Listings ({dbTrips.length})</h2>
            {dbTrips.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No trip listings yet.</p>
            ) : (
              <div className="space-y-3">
                {dbTrips.map(trip => (
                  <div key={trip.id} className={`rounded-xl bg-card p-5 shadow-card ${trip.status === "pending" ? "ring-2 ring-primary/20" : ""}`}>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-bold text-foreground">{trip.title}</h3>
                          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusBadge(trip.status)}`}>{trip.status}</span>
                          <span className="text-xs bg-secondary text-muted-foreground px-2 py-0.5 rounded-full capitalize">{trip.nature}</span>
                          <span className="text-xs bg-secondary text-muted-foreground px-2 py-0.5 rounded-full">{trip.trip_type?.replace("_", " ")}</span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {trip.destination && <><MapPin className="w-3 h-3 inline mr-1" />{trip.destination} · </>}
                          ${trip.total_price} ({trip.price_model}) · Max {trip.max_travelers} travelers
                        </p>
                        {trip.route && <p className="text-xs text-muted-foreground mt-1">Route: {trip.route}</p>}
                        {trip.description && <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{trip.description}</p>}
                        <div className="flex gap-1 mt-2">
                          {trip.includes_food && <span className="text-[10px] bg-secondary text-muted-foreground px-2 py-0.5 rounded-full">🍽️</span>}
                          {trip.includes_stay && <span className="text-[10px] bg-secondary text-muted-foreground px-2 py-0.5 rounded-full">🏠</span>}
                          {trip.includes_transport && <span className="text-[10px] bg-secondary text-muted-foreground px-2 py-0.5 rounded-full">🚗</span>}
                          {trip.includes_activities && <span className="text-[10px] bg-secondary text-muted-foreground px-2 py-0.5 rounded-full">🎯</span>}
                        </div>
                      </div>
                      <div className="flex flex-col gap-2 shrink-0">
                        {trip.status === "pending" && (
                          <>
                            <Button size="sm" className="rounded-full text-xs bg-accent text-accent-foreground hover:bg-accent/90"
                              onClick={() => updateTripStatus(trip.id, "active")}>
                              <CheckCircle className="w-3 h-3 mr-1" /> Approve
                            </Button>
                            <Button size="sm" variant="outline" className="rounded-full text-xs text-destructive"
                              onClick={() => updateTripStatus(trip.id, "rejected")}>
                              <Ban className="w-3 h-3 mr-1" /> Reject
                            </Button>
                          </>
                        )}
                        {trip.status === "active" && (
                          <Button size="sm" variant="outline" className="rounded-full text-xs text-destructive"
                            onClick={() => updateTripStatus(trip.id, "suspended")}>
                            <Ban className="w-3 h-3 mr-1" /> Suspend
                          </Button>
                        )}
                        {(trip.status === "rejected" || trip.status === "suspended") && (
                          <Button size="sm" variant="outline" className="rounded-full text-xs"
                            onClick={() => updateTripStatus(trip.id, "active")}>
                            <CheckCircle className="w-3 h-3 mr-1" /> Reactivate
                          </Button>
                        )}
                      </div>
                    </div>
                    <div className="mt-3">
                      <textarea
                        className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm min-h-[50px]"
                        placeholder="Admin note for this trip..."
                        value={tripNotes[trip.id] || ""}
                        onChange={e => setTripNotes(p => ({ ...p, [trip.id]: e.target.value }))}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Experience Requests */}
            {dbExperienceRequests.length > 0 && (
              <div className="mt-10">
                <h2 className="text-xl font-bold text-foreground mb-4">Experience Requests ({dbExperienceRequests.length})</h2>
                <div className="space-y-3">
                  {dbExperienceRequests.map(req => (
                    <div key={req.id} className={`rounded-xl bg-card p-5 shadow-card ${req.status === "pending" ? "ring-2 ring-primary/20" : ""}`}>
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-bold text-foreground">{req.title}</h3>
                            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusBadge(req.status)}`}>{req.status}</span>
                            <span className="text-xs bg-secondary text-muted-foreground px-2 py-0.5 rounded-full">{req.category}</span>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">{req.location} · ${req.price} · {req.duration || "N/A"}</p>
                          {req.description && <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{req.description}</p>}
                        </div>
                        {req.status === "pending" && (
                          <div className="flex gap-2 shrink-0">
                            <Button size="sm" className="rounded-full text-xs bg-accent text-accent-foreground" onClick={() => updateExperienceRequest(req.id, "approved")}>
                              <CheckCircle className="w-3 h-3 mr-1" /> Approve
                            </Button>
                            <Button size="sm" variant="outline" className="rounded-full text-xs text-destructive" onClick={() => updateExperienceRequest(req.id, "rejected")}>
                              <Ban className="w-3 h-3 mr-1" /> Reject
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Grievances Tab */}
        {activeTab === "grievances" && (
          <div className="mt-6">
            <h2 className="text-xl font-bold text-foreground mb-4">Grievances ({dbGrievances.length})</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
              {[
                { label: "Open", value: dbGrievances.filter(g => g.status === "open").length, color: "text-destructive" },
                { label: "In Progress", value: dbGrievances.filter(g => g.status === "in_progress").length, color: "text-primary" },
                { label: "Resolved", value: dbGrievances.filter(g => g.status === "resolved").length, color: "text-accent" },
                { label: "Closed", value: dbGrievances.filter(g => g.status === "closed").length, color: "text-muted-foreground" },
              ].map(s => (
                <div key={s.label} className="rounded-lg bg-card p-4 shadow-card text-center">
                  <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                </div>
              ))}
            </div>
            {dbGrievances.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No grievances filed.</p>
            ) : (
              <div className="space-y-3">
                {dbGrievances.map(g => (
                  <div key={g.id} className={`rounded-xl bg-card p-5 shadow-card ${g.status === "open" ? "ring-2 ring-destructive/20" : ""}`}>
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-bold text-foreground">{g.subject}</h3>
                          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusBadge(g.status)}`}>{g.status}</span>
                          <span className="text-xs bg-secondary text-muted-foreground px-2 py-0.5 rounded-full">{g.category}</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${g.priority === "high" ? "bg-destructive/10 text-destructive" : g.priority === "medium" ? "bg-primary/10 text-primary" : "bg-secondary text-muted-foreground"}`}>
                            {g.priority}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-2">{g.description}</p>
                        {g.resolution && (
                          <div className="mt-2 p-2 bg-accent/5 rounded-lg border border-accent/20">
                            <p className="text-xs font-medium text-accent">Resolution: {g.resolution}</p>
                          </div>
                        )}
                        {g.admin_notes && (
                          <p className="text-xs text-muted-foreground mt-1 italic">Admin notes: {g.admin_notes}</p>
                        )}
                        <p className="text-xs text-muted-foreground mt-2">Filed: {new Date(g.created_at).toLocaleDateString()}</p>
                      </div>
                      <div className="flex flex-col gap-2 shrink-0">
                        {g.status === "open" && (
                          <Button size="sm" className="rounded-full text-xs" onClick={() => updateGrievanceStatus(g.id, "in_progress")}>
                            Take Up
                          </Button>
                        )}
                        {g.status === "in_progress" && (
                          <>
                            <Button size="sm" className="rounded-full text-xs bg-accent text-accent-foreground" onClick={() => updateGrievanceStatus(g.id, "resolved", grievanceNotes[g.id] || "Resolved by admin")}>
                              <CheckCircle className="w-3 h-3 mr-1" /> Resolve
                            </Button>
                            <Button size="sm" variant="outline" className="rounded-full text-xs" onClick={() => updateGrievanceStatus(g.id, "closed")}>
                              Close
                            </Button>
                          </>
                        )}
                        {g.status === "resolved" && (
                          <Button size="sm" variant="outline" className="rounded-full text-xs" onClick={() => updateGrievanceStatus(g.id, "closed")}>
                            Close
                          </Button>
                        )}
                      </div>
                    </div>
                    {(g.status === "open" || g.status === "in_progress") && (
                      <div className="mt-3">
                        <textarea
                          className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm min-h-[50px]"
                          placeholder="Admin notes / resolution details..."
                          value={grievanceNotes[g.id] || ""}
                          onChange={e => setGrievanceNotes(p => ({ ...p, [g.id]: e.target.value }))}
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Hosts Tab */}
        {activeTab === "hosts" && (
          <div className="mt-6">
            <h2 className="text-xl font-bold text-foreground mb-4">All Hosts ({hosts.length})</h2>
            <div className="space-y-3">
              {hosts.map(h => {
                const status = getHostStatus(h.id);
                const isExpanded = expandedHost === h.id;
                const hostBookings = mockBookings.filter(b => b.hostId === h.id);
                return (
                  <div key={h.id} className={`rounded-xl bg-card shadow-card overflow-hidden transition-all ${isExpanded ? "ring-2 ring-primary/20" : ""}`}>
                    <div className="p-4 flex items-center gap-4 cursor-pointer" onClick={() => setExpandedHost(isExpanded ? null : h.id)}>
                      <img src={h.image} alt={h.name} className="w-12 h-12 rounded-full object-cover" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-foreground">{h.name}</p>
                          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusBadge(status)}`}>{status}</span>
                        </div>
                        <p className="text-xs text-muted-foreground">{h.city} · <Star className="w-3 h-3 inline fill-primary text-primary" /> {h.rating}</p>
                      </div>
                      <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                    </div>
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                          <div className="px-4 pb-4 border-t border-border pt-4 space-y-3">
                            <div className="flex flex-wrap gap-2">
                              <select className="text-xs rounded-md border border-input bg-background px-2 py-1.5"
                                value={status} onChange={e => { setHostStatuses(p => ({ ...p, [h.id]: e.target.value })); toast({ title: `${h.name} → ${e.target.value}` }); }}>
                                <option value="verified">✓ Verified</option>
                                <option value="pending">⏳ Pending</option>
                                <option value="suspended">⛔ Suspended</option>
                              </select>
                              <Button size="sm" variant="outline" className="text-xs rounded-full gap-1" onClick={() => setEditDialog({
                                open: true, title: `Edit ${h.name}`, fields: hostEditFields,
                                data: { name: h.name, city: h.city, tagline: h.tagline, bio: h.bio, pricePerDay: h.pricePerDay, safetyScore: h.safetyScore },
                                onSave: (d) => toast({ title: `${d.name} updated` }),
                              })}><Edit className="w-3 h-3" /> Edit</Button>
                            </div>
                            <textarea className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm min-h-[50px]"
                              placeholder="Admin notes..." value={hostNotes[h.id] || ""} onChange={e => setHostNotes(p => ({ ...p, [h.id]: e.target.value }))} />
                            <div className="grid grid-cols-3 gap-3 text-xs text-muted-foreground">
                              <div className="rounded-lg bg-secondary/50 p-3"><p className="font-bold text-foreground mb-1">Bookings</p><p>{hostBookings.length} total · ${hostBookings.reduce((s, b) => s + b.totalPrice, 0)}</p></div>
                              <div className="rounded-lg bg-secondary/50 p-3"><p className="font-bold text-foreground mb-1">Services</p><p>{h.services.join(", ")}</p></div>
                              <div className="rounded-lg bg-secondary/50 p-3"><p className="font-bold text-foreground mb-1">Safety</p><p>{h.safetyScore}/100</p></div>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Bookings Tab */}
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
                    <p className="text-xs text-muted-foreground">{b.startDate} → {b.endDate} · {b.services.join(", ")}</p>
                  </div>
                  <div className="text-right flex items-center gap-3">
                    <p className="font-bold text-foreground">${b.totalPrice}</p>
                    <select className="text-xs rounded-md border border-input bg-background px-2 py-1"
                      value={status} onChange={e => { setBookingOverrides(p => ({ ...p, [b.id]: e.target.value })); toast({ title: `Booking #${b.id} → ${e.target.value}` }); }}>
                      <option value="pending">Pending</option><option value="confirmed">Confirmed</option><option value="completed">Completed</option><option value="cancelled">Cancelled</option>
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
                  <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1"><Star className="w-3 h-3 fill-primary text-primary" />{e.rating}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Destinations Tab */}
        {activeTab === "destinations" && (
          <div className="mt-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-foreground">All Destinations ({allDestinations.length})</h2>
              <Button size="sm" className="rounded-full gap-1 text-xs" onClick={() => setEditDialog({
                open: true, title: "Add Destination", fields: destinationFields,
                onSave: (d) => { setCustomDestinations(p => [...p, d]); toast({ title: "Destination added!" }); },
              })}><Plus className="w-3 h-3" /> Add</Button>
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
                        onSave: (data) => { if (isCustom) { const ci = i - destinations.length; setCustomDestinations(p => p.map((x, j) => j === ci ? data : x)); } toast({ title: "Updated!" }); },
                        onDelete: isCustom ? () => { setCustomDestinations(p => p.filter((_, j) => j !== i - destinations.length)); toast({ title: "Removed" }); } : undefined,
                      })}>Edit</Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Moderation */}
        {activeTab === "moderation" && (
          <div className="mt-6 space-y-6">
            <h2 className="text-xl font-bold text-foreground mb-4">Content Moderation</h2>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              {[
                { label: "Verified Hosts", value: hosts.filter(h => getHostStatus(h.id) === "verified").length, icon: Shield },
                { label: "Flagged Reviews", value: flaggedReviews.length, icon: Flag },
                { label: "Removed Reviews", value: removedReviews.length, icon: Ban },
                { label: "Pending Reports", value: 0, icon: AlertTriangle },
              ].map(s => (
                <div key={s.label} className="rounded-lg bg-card p-5 shadow-card text-center">
                  <s.icon className="w-8 h-8 text-primary mx-auto mb-2" />
                  <p className="text-2xl font-bold text-foreground">{s.value}</p>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                </div>
              ))}
            </div>
            <div>
              <h3 className="font-bold text-foreground mb-3">Reviews to Moderate</h3>
              <div className="space-y-3">
                {activeReviews.map(r => {
                  const isFlagged = flaggedReviews.includes(r.id);
                  return (
                    <div key={r.id} className={`rounded-lg bg-card p-4 shadow-card flex justify-between items-start ${isFlagged ? "border-2 border-destructive/30" : ""}`}>
                      <div>
                        <p className="text-sm font-medium text-foreground">{r.travelerName} → {hosts.find(h => h.id === r.hostId)?.name}</p>
                        <div className="flex gap-0.5 mt-0.5">{Array.from({ length: r.rating }).map((_, j) => <Star key={j} className="w-3 h-3 fill-primary text-primary" />)}</div>
                        <p className="text-xs text-muted-foreground mt-1">{r.text}</p>
                      </div>
                      <div className="flex gap-2 shrink-0">
                        {!isFlagged ? (
                          <Button variant="outline" size="sm" className="text-xs rounded-full" onClick={() => { setFlaggedReviews(p => [...p, r.id]); toast({ title: "Flagged" }); }}>
                            <Flag className="w-3 h-3 mr-1" /> Flag
                          </Button>
                        ) : (
                          <>
                            <Button variant="outline" size="sm" className="text-xs rounded-full" onClick={() => { setFlaggedReviews(p => p.filter(id => id !== r.id)); }}>Unflag</Button>
                            <Button variant="outline" size="sm" className="text-xs rounded-full text-destructive" onClick={() => {
                              setRemovedReviews(p => [...p, r.id]); setFlaggedReviews(p => p.filter(id => id !== r.id)); toast({ title: "Removed", variant: "destructive" });
                            }}><Trash2 className="w-3 h-3 mr-1" /> Remove</Button>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === "users" && (
          <div className="mt-6">
            <h2 className="text-xl font-bold text-foreground mb-4">User Management ({dbUsers.length} users)</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
              {[
                { label: "Total Users", value: dbUsers.length, color: "text-primary" },
                { label: "Travelers", value: userRoles.filter(r => r.role === "traveler").length, color: "text-accent" },
                { label: "Hosts", value: userRoles.filter(r => r.role === "host").length, color: "text-primary" },
                { label: "Admins", value: userRoles.filter(r => r.role === "admin").length, color: "text-destructive" },
              ].map(s => (
                <div key={s.label} className="rounded-lg bg-card p-4 shadow-card text-center">
                  <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                </div>
              ))}
            </div>
            {dbUsers.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No users registered yet.</p>
            ) : (
              <div className="space-y-3">
                {dbUsers.map(u => {
                  const roles = userRoles.filter(r => r.user_id === u.id);
                  return (
                    <div key={u.id} className="rounded-xl bg-card p-4 shadow-card flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
                          {(u.first_name || "U")[0]}
                        </div>
                        <div>
                          <p className="font-semibold text-foreground">{u.first_name} {u.last_name || ""}</p>
                          <p className="text-xs text-muted-foreground">{u.email || "No email"}</p>
                          <div className="flex gap-1 mt-1">
                            {roles.map(r => (
                              <span key={r.id} className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${r.role === "admin" ? "bg-destructive/10 text-destructive" : r.role === "host" ? "bg-primary/10 text-primary" : "bg-accent/10 text-accent"}`}>
                                {r.role}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{u.nationality || "—"}</span>
                        <span>·</span>
                        <span>Joined {new Date(u.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Analytics */}
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
          </div>
        )}

        {/* Settings */}
        {activeTab === "settings" && (
          <div className="mt-6 space-y-6 max-w-xl">
            <h2 className="text-xl font-bold text-foreground mb-4">Platform Settings</h2>
            <div className="rounded-lg bg-card p-5 shadow-card space-y-4">
              <h3 className="font-bold text-foreground flex items-center gap-2"><DollarSign className="w-4 h-4 text-primary" /> Commission & Revenue</h3>
              <div>
                <label className="text-sm font-medium text-foreground">Commission Rate (%)</label>
                <Input type="number" className="mt-1" value={platformSettings.commissionRate}
                  onChange={e => setPlatformSettings(p => ({ ...p, commissionRate: Number(e.target.value) }))} />
              </div>
              <Button size="sm" className="rounded-full gap-2" onClick={() => toast({ title: `Rate: ${platformSettings.commissionRate}%` })}>Save</Button>
            </div>
            <div className="rounded-lg bg-card p-5 shadow-card space-y-4">
              <h3 className="font-bold text-foreground flex items-center gap-2"><Settings className="w-4 h-4 text-primary" /> General</h3>
              <div><label className="text-sm font-medium text-foreground">Platform Name</label>
                <Input className="mt-1" value={platformSettings.platformName} onChange={e => setPlatformSettings(p => ({ ...p, platformName: e.target.value }))} /></div>
              <div><label className="text-sm font-medium text-foreground">Default Currency</label>
                <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm mt-1"
                  value={platformSettings.defaultCurrency} onChange={e => setPlatformSettings(p => ({ ...p, defaultCurrency: e.target.value }))}>
                  <option value="USD">USD ($)</option><option value="EUR">EUR (€)</option><option value="INR">INR (₹)</option>
                </select></div>
              <Button size="sm" className="rounded-full gap-2" onClick={() => toast({ title: "Settings saved" })}>Save</Button>
            </div>
          </div>
        )}
      </div>

      <EditDialog open={editDialog.open} title={editDialog.title} fields={editDialog.fields}
        initialData={editDialog.data} onSave={(d) => { editDialog.onSave(d); setEditDialog(p => ({ ...p, open: false })); }}
        onDelete={editDialog.onDelete ? () => { editDialog.onDelete!(); setEditDialog(p => ({ ...p, open: false })); } : undefined}
        onClose={() => setEditDialog(p => ({ ...p, open: false }))} />
      <Footer />
    </div>
  );
};

export default AdminDashboard;
