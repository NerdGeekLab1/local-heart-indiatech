import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from "recharts";
import { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users, DollarSign, TrendingUp, Shield, AlertTriangle, Star, MapPin, Calendar, Settings, FileText,
  BarChart3, Globe, Flag, Eye, Plus, Trash2, UtensilsCrossed, Video, ChevronDown, Ban, CheckCircle,
  Edit, Compass, MessageSquare, Target, Lock, Receipt, Trophy, Crosshair, Search, Bell, Mail,
  Crown, Gem, Sparkles, UserX, UserCheck, Filter
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { hosts, mockBookings, reviews, experiences, destinations } from "@/lib/data";
import { useLocalStorage } from "@/hooks/use-local-storage";
import EditDialog, { FieldConfig } from "@/components/EditDialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useCurrency } from "@/contexts/CurrencyContext";

type Tab = "overview" | "hosts" | "bookings" | "experiences" | "destinations" | "trips" | "grievances" | "users" | "wanderers" | "missions" | "leaderboard" | "invoices" | "moderation" | "analytics" | "settings";

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
  { key: "price", label: "Price (₹)", type: "number", required: true },
  { key: "duration", label: "Duration", required: true },
  { key: "location", label: "Location", required: true },
  { key: "destination", label: "Destination" },
  { key: "max_guests", label: "Max Guests", type: "number" },
  { key: "difficulty", label: "Difficulty", type: "select", options: ["Easy", "Moderate", "Challenging"] },
];

const hostEditFields: FieldConfig[] = [
  { key: "name", label: "Host Name", required: true },
  { key: "city", label: "City", required: true },
  { key: "tagline", label: "Tagline", required: true },
  { key: "bio", label: "Bio", type: "textarea", required: true },
  { key: "pricePerDay", label: "Price Per Day (₹)", type: "number", required: true },
  { key: "safetyScore", label: "Safety Score", type: "number", required: true },
];

const AVAILABLE_PERMISSIONS = [
  "publish_trips", "book_experiences", "write_reviews", "send_messages",
  "access_premium", "beta_features", "host_events", "manage_listings",
  "view_analytics", "export_data",
];

const SUBSCRIPTION_TIERS = [
  { id: "free", label: "Free", price: 0, color: "text-muted-foreground", icon: Users, perks: ["Basic search", "View listings"] },
  { id: "explorer", label: "Explorer", price: 499, color: "text-primary", icon: Compass, perks: ["Priority booking", "5% discount", "Beta Wanderer access"] },
  { id: "adventurer", label: "Adventurer", price: 999, color: "text-accent", icon: Gem, perks: ["10% discount", "Free cancellation", "Travel deals", "Priority support"] },
  { id: "nomad", label: "Nomad", price: 1999, color: "text-destructive", icon: Crown, perks: ["20% discount", "VIP access", "Free 12th trip", "Exclusive events", "Personal concierge"] },
];

const AdminDashboard = () => {
  const [searchParams] = useSearchParams();
  const initialTab = (searchParams.get("tab") as Tab) || "overview";
  const [activeTab, setActiveTab] = useState<Tab>(initialTab);
  const { toast } = useToast();
  const { user } = useAuth();
  const { format } = useCurrency();
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
    commissionRate: 15, platformName: "Travelista", defaultCurrency: "INR",
  });

  const [editDialog, setEditDialog] = useState<{ open: boolean; title: string; fields: FieldConfig[]; data?: any; onSave: (d: any) => void; onDelete?: () => void }>({
    open: false, title: "", fields: [], onSave: () => {},
  });

  // DB-backed data
  const [dbTrips, setDbTrips] = useState<any[]>([]);
  const [dbGrievances, setDbGrievances] = useState<any[]>([]);
  const [dbExperienceRequests, setDbExperienceRequests] = useState<any[]>([]);
  const [dbExperiences, setDbExperiences] = useState<any[]>([]);
  const [tripNotes, setTripNotes] = useState<Record<string, string>>({});
  const [grievanceNotes, setGrievanceNotes] = useState<Record<string, string>>({});
  const [dbUsers, setDbUsers] = useState<any[]>([]);
  const [userRoles, setUserRoles] = useState<any[]>([]);
  const [dbWanderers, setDbWanderers] = useState<any[]>([]);
  const [dbMissions, setDbMissions] = useState<any[]>([]);
  const [dbInvoices, setDbInvoices] = useState<any[]>([]);
  const [dbPermissions, setDbPermissions] = useState<any[]>([]);
  const [dbSubscriptions, setDbSubscriptions] = useState<any[]>([]);
  const [dbTripParticipants, setDbTripParticipants] = useState<any[]>([]);

  // Search & filters
  const [userSearch, setUserSearch] = useState("");
  const [userRoleFilter, setUserRoleFilter] = useState<string>("all");
  const [expandedUser, setExpandedUser] = useState<string | null>(null);
  const [experienceSearch, setExperienceSearch] = useState("");

  // Mission form
  const [missionForm, setMissionForm] = useState({ wandererId: "", title: "", description: "", destination: "", rewardPoints: 100, deadline: "" });
  const [showMissionForm, setShowMissionForm] = useState(false);

  // Permission form inline
  const [permUserId, setPermUserId] = useState("");
  const [permType, setPermType] = useState(AVAILABLE_PERMISSIONS[0]);

  useEffect(() => {
    const fetchData = async () => {
      const [{ data: trips }, { data: grievances }, { data: expReqs }, { data: profiles }, { data: roles }, { data: wanderers }, { data: dbExp }] = await Promise.all([
        supabase.from("trip_listings").select("*").order("created_at", { ascending: false }),
        supabase.from("grievances").select("*").order("created_at", { ascending: false }),
        supabase.from("experience_requests").select("*").order("created_at", { ascending: false }),
        supabase.from("profiles").select("*").order("created_at", { ascending: false }),
        supabase.from("user_roles").select("*"),
        supabase.from("beta_wanderers").select("*").order("created_at", { ascending: false }),
        supabase.from("experiences").select("*").order("created_at", { ascending: false }),
      ]);
      setDbTrips(trips || []);
      setDbGrievances(grievances || []);
      setDbExperienceRequests(expReqs || []);
      setDbUsers(profiles || []);
      setUserRoles(roles || []);
      setDbWanderers(wanderers || []);
      setDbExperiences(dbExp || []);

      const [{ data: missions }, { data: invoices }, { data: perms }, { data: subs }, { data: participants }] = await Promise.all([
        supabase.from("wanderer_missions").select("*").order("created_at", { ascending: false }),
        supabase.from("invoices").select("*").order("created_at", { ascending: false }),
        supabase.from("user_permissions").select("*").order("granted_at", { ascending: false }),
        supabase.from("subscriptions").select("*"),
        supabase.from("trip_participants").select("*"),
      ]);
      setDbMissions(missions || []);
      setDbInvoices(invoices || []);
      setDbPermissions(perms || []);
      setDbSubscriptions(subs || []);
      setDbTripParticipants(participants || []);
    };
    fetchData();
  }, []);

  // Helpers
  const getUserName = (userId: string) => {
    const u = dbUsers.find(u => u.id === userId);
    return u ? `${u.first_name} ${u.last_name || ""}`.trim() : "Unknown";
  };

  const getUserEmail = (userId: string) => {
    const u = dbUsers.find(u => u.id === userId);
    return u?.email || "";
  };

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

  const updateExperience = async (id: string, data: any) => {
    const { error } = await supabase.from("experiences").update({
      title: data.title, description: data.description, category: data.category,
      price: Number(data.price), duration: data.duration, location: data.location,
      destination: data.destination, max_guests: data.max_guests ? Number(data.max_guests) : null,
      difficulty: data.difficulty, updated_at: new Date().toISOString(),
    }).eq("id", id);
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    setDbExperiences(p => p.map(e => e.id === id ? { ...e, ...data, price: Number(data.price) } : e));
    toast({ title: "Experience updated ✓" });
  };

  const updateExperienceStatus = async (id: string, status: string) => {
    await supabase.from("experiences").update({ status, updated_at: new Date().toISOString() }).eq("id", id);
    setDbExperiences(p => p.map(e => e.id === id ? { ...e, status } : e));
    toast({ title: `Experience ${status}` });
  };

  const createMission = async () => {
    if (!user || !missionForm.wandererId || !missionForm.title || !missionForm.destination) {
      toast({ title: "Fill required fields", variant: "destructive" }); return;
    }
    const { data, error } = await supabase.from("wanderer_missions").insert({
      wanderer_id: missionForm.wandererId, assigned_by: user.id,
      title: missionForm.title, description: missionForm.description,
      destination: missionForm.destination, reward_points: missionForm.rewardPoints,
      deadline: missionForm.deadline || null,
    }).select().single();
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    setDbMissions(p => [data, ...p]);
    setMissionForm({ wandererId: "", title: "", description: "", destination: "", rewardPoints: 100, deadline: "" });
    setShowMissionForm(false);
    toast({ title: "Mission assigned! 🎯" });
  };

  const updateMissionStatus = async (id: string, status: string) => {
    const update: any = { status, updated_at: new Date().toISOString() };
    if (status === "completed") update.completed_at = new Date().toISOString();
    await supabase.from("wanderer_missions").update(update).eq("id", id);
    setDbMissions(p => p.map(m => m.id === id ? { ...m, ...update } : m));
    toast({ title: `Mission ${status}` });
  };

  const grantPermission = async (userId?: string) => {
    const targetUser = userId || permUserId;
    if (!user || !targetUser) { toast({ title: "Select a user", variant: "destructive" }); return; }
    const { data, error } = await supabase.from("user_permissions").insert({
      user_id: targetUser, permission: permType, granted_by: user.id,
    }).select().single();
    if (error) {
      if (error.message.includes("duplicate")) toast({ title: "Permission already granted" });
      else toast({ title: "Error", description: error.message, variant: "destructive" });
      return;
    }
    setDbPermissions(p => [data, ...p]);
    toast({ title: "Permission granted ✓" });
  };

  const revokePermission = async (id: string) => {
    await supabase.from("user_permissions").delete().eq("id", id);
    setDbPermissions(p => p.filter(x => x.id !== id));
    toast({ title: "Permission revoked" });
  };

  const updateInvoiceStatus = async (id: string, status: string) => {
    const update: any = { status };
    if (status === "paid") update.paid_at = new Date().toISOString();
    await supabase.from("invoices").update(update).eq("id", id);
    setDbInvoices(p => p.map(i => i.id === id ? { ...i, ...update } : i));
    toast({ title: `Invoice ${status}` });
  };

  const updateSubscription = async (userId: string, tier: string) => {
    const tierInfo = SUBSCRIPTION_TIERS.find(t => t.id === tier);
    const existing = dbSubscriptions.find(s => s.user_id === userId);
    if (existing) {
      await supabase.from("subscriptions").update({ tier: tier as any, amount: tierInfo?.price || 0, updated_at: new Date().toISOString() }).eq("id", existing.id);
      setDbSubscriptions(p => p.map(s => s.user_id === userId ? { ...s, tier, amount: tierInfo?.price || 0 } : s));
    } else {
      const { data } = await supabase.from("subscriptions").insert({ user_id: userId, tier: tier as any, amount: tierInfo?.price || 0 }).select().single();
      if (data) setDbSubscriptions(p => [...p, data]);
    }
    toast({ title: `Subscription → ${tier}` });
  };

  // Filtered users
  const filteredUsers = useMemo(() => {
    let filtered = dbUsers;
    if (userSearch) {
      const q = userSearch.toLowerCase();
      filtered = filtered.filter(u =>
        (u.first_name || "").toLowerCase().includes(q) ||
        (u.last_name || "").toLowerCase().includes(q) ||
        (u.email || "").toLowerCase().includes(q)
      );
    }
    if (userRoleFilter !== "all") {
      const roleUserIds = userRoles.filter(r => r.role === userRoleFilter).map(r => r.user_id);
      filtered = filtered.filter(u => roleUserIds.includes(u.id));
    }
    return filtered;
  }, [dbUsers, userSearch, userRoleFilter, userRoles]);

  // Filtered experiences
  const allExperiences = dbExperiences.length > 0 ? dbExperiences : experiences.map(e => ({ ...e, host_id: null, host_name: e.hostName, host_city: e.hostCity }));
  const filteredExperiences = useMemo(() => {
    if (!experienceSearch) return allExperiences;
    const q = experienceSearch.toLowerCase();
    return allExperiences.filter((e: any) =>
      (e.title || "").toLowerCase().includes(q) ||
      (e.category || "").toLowerCase().includes(q) ||
      (e.location || e.hostCity || "").toLowerCase().includes(q)
    );
  }, [allExperiences, experienceSearch]);

  const allDestinations = [...destinations, ...customDestinations];
  const getHostStatus = (id: string) => hostStatuses[id] || "verified";
  const getBookingStatus = (id: string, orig: string) => bookingOverrides[id] || orig;
  const activeReviews = reviews.filter(r => !removedReviews.includes(r.id));
  const approvedWanderers = dbWanderers.filter(w => w.status === "approved");
  const leaderboard = [...dbWanderers].filter(w => w.status === "approved").sort((a, b) => (b.score || 0) - (a.score || 0));

  const statusBadge = (status: string) => {
    const colors: Record<string, string> = {
      verified: "bg-accent/10 text-accent", pending: "bg-primary/10 text-primary",
      suspended: "bg-destructive/10 text-destructive", live: "bg-accent/10 text-accent",
      active: "bg-accent/10 text-accent", approved: "bg-accent/10 text-accent",
      rejected: "bg-destructive/10 text-destructive", open: "bg-primary/10 text-primary",
      resolved: "bg-accent/10 text-accent", closed: "bg-secondary text-muted-foreground",
      in_progress: "bg-primary/10 text-primary", assigned: "bg-primary/10 text-primary",
      completed: "bg-accent/10 text-accent", paid: "bg-accent/10 text-accent",
      unpaid: "bg-destructive/10 text-destructive", cancelled: "bg-secondary text-muted-foreground",
      banned: "bg-destructive text-destructive-foreground",
    };
    return colors[status] || "bg-secondary text-muted-foreground";
  };

  const tabs: { id: Tab; label: string; icon: React.ElementType; badge?: number }[] = [
    { id: "overview", label: "Overview", icon: BarChart3 },
    { id: "users", label: "Users & ACL", icon: Users },
    { id: "hosts", label: "Hosts", icon: Users },
    { id: "bookings", label: "Bookings", icon: Calendar },
    { id: "invoices", label: "Invoices", icon: Receipt },
    { id: "experiences", label: "Experiences", icon: Globe },
    { id: "trips", label: "Trips", icon: Compass, badge: dbTrips.filter(t => t.status === "pending").length },
    { id: "grievances", label: "Grievances", icon: MessageSquare, badge: dbGrievances.filter(g => g.status === "open").length },
    { id: "wanderers", label: "Wanderers", icon: Target },
    { id: "missions", label: "Missions", icon: Crosshair },
    { id: "leaderboard", label: "Leaderboard", icon: Trophy },
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
              className={`flex items-center gap-1.5 px-3 py-2.5 text-xs font-medium whitespace-nowrap transition-colors rounded-t-lg ${activeTab === t.id ? "bg-card text-primary border-b-2 border-primary" : "text-muted-foreground hover:text-foreground"}`}>
              <t.icon className="w-3.5 h-3.5" /> {t.label}
              {(t.badge || 0) > 0 && (
                <span className="w-4 h-4 rounded-full bg-destructive text-destructive-foreground text-[9px] font-bold flex items-center justify-center">{t.badge}</span>
              )}
            </button>
          ))}
        </div>

        {/* Overview */}
        {activeTab === "overview" && (
          <>
            <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
              {[
                { label: "Users", value: dbUsers.length, icon: Users, color: "text-primary" },
                { label: "Bookings", value: mockBookings.length, icon: Calendar, color: "text-accent" },
                { label: "GMV", value: format(totalRevenue), icon: DollarSign, color: "text-accent" },
                { label: "Revenue", value: format(platformFee), icon: TrendingUp, color: "text-primary" },
                { label: "Trips", value: dbTrips.length, icon: Compass, color: "text-accent" },
                { label: "Grievances", value: dbGrievances.filter(g => g.status === "open").length, icon: MessageSquare, color: "text-destructive" },
                { label: "Subscribers", value: dbSubscriptions.filter(s => s.tier !== "free").length, icon: Crown, color: "text-primary" },
                { label: "Invoices", value: dbInvoices.length, icon: Receipt, color: "text-muted-foreground" },
              ].map(s => (
                <div key={s.label} className="rounded-lg bg-card p-3 shadow-card">
                  <s.icon className={`w-4 h-4 ${s.color} mb-1`} />
                  <p className="text-lg font-bold text-foreground">{s.value}</p>
                  <p className="text-[10px] text-muted-foreground">{s.label}</p>
                </div>
              ))}
            </div>
            <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h2 className="text-lg font-bold text-foreground mb-3">Pending Actions</h2>
                <div className="space-y-2">
                  {dbTrips.filter(t => t.status === "pending").slice(0, 3).map(t => (
                    <div key={t.id} className="rounded-lg bg-card p-3 shadow-card flex justify-between items-center">
                      <div>
                        <p className="font-medium text-foreground text-sm">{t.title}</p>
                        <p className="text-xs text-muted-foreground">Trip · {t.destination || "—"} · by {getUserName(t.creator_id)}</p>
                      </div>
                      <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">Pending</span>
                    </div>
                  ))}
                  {dbGrievances.filter(g => g.status === "open").slice(0, 3).map(g => (
                    <div key={g.id} className="rounded-lg bg-card p-3 shadow-card flex justify-between items-center">
                      <div>
                        <p className="font-medium text-foreground text-sm">{g.subject}</p>
                        <p className="text-xs text-muted-foreground">Grievance · {g.category}</p>
                      </div>
                      <span className="text-xs bg-destructive/10 text-destructive px-2 py-0.5 rounded-full">{g.priority}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h2 className="text-lg font-bold text-foreground mb-3">Subscription Overview</h2>
                <div className="grid grid-cols-2 gap-3">
                  {SUBSCRIPTION_TIERS.map(tier => {
                    const count = tier.id === "free"
                      ? dbUsers.length - dbSubscriptions.filter(s => s.tier !== "free").length
                      : dbSubscriptions.filter(s => s.tier === tier.id).length;
                    return (
                      <div key={tier.id} className="rounded-lg bg-card p-3 shadow-card">
                        <div className="flex items-center gap-2 mb-1">
                          <tier.icon className={`w-4 h-4 ${tier.color}`} />
                          <span className="text-sm font-bold text-foreground">{tier.label}</span>
                        </div>
                        <p className="text-2xl font-bold text-foreground">{count}</p>
                        <p className="text-[10px] text-muted-foreground">{tier.id !== "free" ? `₹${tier.price}/mo` : "Free"}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </>
        )}

        {/* ===== UNIFIED USERS & ACL TAB ===== */}
        {activeTab === "users" && (
          <div className="mt-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <h2 className="text-xl font-bold text-foreground">User Management ({dbUsers.length})</h2>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-4">
              {[
                { label: "Total", value: dbUsers.length, color: "text-primary" },
                { label: "Travelers", value: userRoles.filter(r => r.role === "traveler").length, color: "text-accent" },
                { label: "Hosts", value: userRoles.filter(r => r.role === "host").length, color: "text-primary" },
                { label: "Admins", value: userRoles.filter(r => r.role === "admin").length, color: "text-destructive" },
                { label: "Permissions", value: dbPermissions.length, color: "text-muted-foreground" },
              ].map(s => (
                <div key={s.label} className="rounded-lg bg-card p-3 shadow-card text-center">
                  <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
                  <p className="text-[10px] text-muted-foreground">{s.label}</p>
                </div>
              ))}
            </div>

            {/* Search + Filter */}
            <div className="flex flex-col sm:flex-row gap-3 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input className="pl-9" placeholder="Search by name or email..." value={userSearch} onChange={e => setUserSearch(e.target.value)} />
              </div>
              <select className="h-10 rounded-md border border-input bg-background px-3 text-sm"
                value={userRoleFilter} onChange={e => setUserRoleFilter(e.target.value)}>
                <option value="all">All Roles</option>
                <option value="traveler">Travelers</option>
                <option value="host">Hosts</option>
                <option value="admin">Admins</option>
              </select>
            </div>

            {/* User List */}
            {filteredUsers.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No users found.</p>
            ) : (
              <div className="space-y-2">
                {filteredUsers.map(u => {
                  const roles = userRoles.filter(r => r.user_id === u.id);
                  const perms = dbPermissions.filter(p => p.user_id === u.id);
                  const sub = dbSubscriptions.find(s => s.user_id === u.id);
                  const isExpanded = expandedUser === u.id;

                  return (
                    <div key={u.id} className={`rounded-xl bg-card shadow-card overflow-hidden ${isExpanded ? "ring-2 ring-primary/20" : ""}`}>
                      <div className="p-4 flex items-center gap-3 cursor-pointer" onClick={() => setExpandedUser(isExpanded ? null : u.id)}>
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary shrink-0">
                          {(u.first_name || "U")[0]}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-semibold text-foreground">{u.first_name} {u.last_name || ""}</p>
                            {roles.map(r => (
                              <span key={r.id} className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${r.role === "admin" ? "bg-destructive/10 text-destructive" : r.role === "host" ? "bg-primary/10 text-primary" : "bg-accent/10 text-accent"}`}>
                                {r.role}
                              </span>
                            ))}
                            {sub && sub.tier !== "free" && (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary flex items-center gap-0.5">
                                <Crown className="w-2.5 h-2.5" /> {sub.tier}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground">{u.email || "No email"} · Joined {new Date(u.created_at).toLocaleDateString()}</p>
                        </div>
                        <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform shrink-0 ${isExpanded ? "rotate-180" : ""}`} />
                      </div>

                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                            <div className="px-4 pb-4 border-t border-border pt-4 space-y-4">
                              {/* Quick Actions */}
                              <div className="flex flex-wrap gap-2">
                                <Button size="sm" variant="outline" className="rounded-full text-xs gap-1">
                                  <Mail className="w-3 h-3" /> Send Email
                                </Button>
                                <Button size="sm" variant="outline" className="rounded-full text-xs gap-1">
                                  <Bell className="w-3 h-3" /> Notify
                                </Button>
                                <Button size="sm" variant="outline" className="rounded-full text-xs gap-1">
                                  <MessageSquare className="w-3 h-3" /> Chat
                                </Button>
                                <Button size="sm" variant="outline" className="rounded-full text-xs gap-1 text-destructive">
                                  <UserX className="w-3 h-3" /> Ban
                                </Button>
                              </div>

                              {/* Subscription Management */}
                              <div className="rounded-lg bg-secondary/30 p-3">
                                <p className="text-xs font-bold text-foreground mb-2 flex items-center gap-1"><Crown className="w-3 h-3 text-primary" /> Subscription Tier</p>
                                <div className="flex gap-2 flex-wrap">
                                  {SUBSCRIPTION_TIERS.map(tier => (
                                    <button key={tier.id}
                                      onClick={() => updateSubscription(u.id, tier.id)}
                                      className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${(sub?.tier || "free") === tier.id ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground hover:text-foreground hover:border-foreground/30"}`}>
                                      {tier.label} {tier.price > 0 && `₹${tier.price}`}
                                    </button>
                                  ))}
                                </div>
                              </div>

                              {/* ACL - Inline Permission Management */}
                              <div className="rounded-lg bg-secondary/30 p-3">
                                <p className="text-xs font-bold text-foreground mb-2 flex items-center gap-1"><Lock className="w-3 h-3 text-primary" /> Permissions (ACL)</p>
                                {perms.length > 0 && (
                                  <div className="flex flex-wrap gap-1 mb-2">
                                    {perms.map(p => (
                                      <span key={p.id} className="text-[10px] bg-primary/10 text-primary px-2 py-1 rounded-full flex items-center gap-1">
                                        {p.permission.replace(/_/g, " ")}
                                        <button onClick={(e) => { e.stopPropagation(); revokePermission(p.id); }} className="ml-0.5 hover:text-destructive">×</button>
                                      </span>
                                    ))}
                                  </div>
                                )}
                                <div className="flex gap-2">
                                  <select className="text-xs h-8 rounded-md border border-input bg-background px-2 flex-1"
                                    value={permType} onChange={e => setPermType(e.target.value)}>
                                    {AVAILABLE_PERMISSIONS.map(p => <option key={p} value={p}>{p.replace(/_/g, " ")}</option>)}
                                  </select>
                                  <Button size="sm" className="rounded-full text-xs h-8" onClick={() => grantPermission(u.id)}>
                                    <Plus className="w-3 h-3 mr-1" /> Grant
                                  </Button>
                                </div>
                              </div>

                              {/* User Details */}
                              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                                <div className="rounded-lg bg-secondary/30 p-2">
                                  <p className="text-muted-foreground">Phone</p>
                                  <p className="font-medium text-foreground">{u.phone || "N/A"}</p>
                                </div>
                                <div className="rounded-lg bg-secondary/30 p-2">
                                  <p className="text-muted-foreground">Nationality</p>
                                  <p className="font-medium text-foreground">{u.nationality || "N/A"}</p>
                                </div>
                                <div className="rounded-lg bg-secondary/30 p-2">
                                  <p className="text-muted-foreground">Interests</p>
                                  <p className="font-medium text-foreground">{u.interests?.join(", ") || "N/A"}</p>
                                </div>
                                <div className="rounded-lg bg-secondary/30 p-2">
                                  <p className="text-muted-foreground">Travel Styles</p>
                                  <p className="font-medium text-foreground">{u.travel_styles?.join(", ") || "N/A"}</p>
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ===== TRIPS TAB (Enhanced) ===== */}
        {activeTab === "trips" && (
          <div className="mt-6">
            <h2 className="text-xl font-bold text-foreground mb-4">Trip Listings ({dbTrips.length})</h2>
            {dbTrips.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No trip listings yet.</p>
            ) : (
              <div className="space-y-3">
                {dbTrips.map(trip => {
                  const participants = dbTripParticipants.filter(p => p.trip_id === trip.id);
                  return (
                    <div key={trip.id} className={`rounded-xl bg-card p-5 shadow-card ${trip.status === "pending" ? "ring-2 ring-primary/20" : ""}`}>
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-bold text-foreground">{trip.title}</h3>
                            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusBadge(trip.status)}`}>{trip.status}</span>
                            <span className="text-xs bg-secondary text-muted-foreground px-2 py-0.5 rounded-full capitalize">{trip.nature}</span>
                            <span className="text-xs bg-secondary text-muted-foreground px-2 py-0.5 rounded-full capitalize">{trip.trip_type?.replace(/_/g, " ")}</span>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            {trip.destination && <><MapPin className="w-3 h-3 inline mr-1" />{trip.destination} · </>}
                            {format(trip.total_price)} ({trip.price_model}) · Max {trip.max_travelers} travelers
                          </p>
                          {trip.description && <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{trip.description}</p>}

                          {/* Creator Info */}
                          <div className="mt-2 flex items-center gap-2 text-xs">
                            <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center text-[9px] font-bold text-primary">
                              {getUserName(trip.creator_id)[0]}
                            </div>
                            <span className="text-muted-foreground">Posted by <strong className="text-foreground">{getUserName(trip.creator_id)}</strong></span>
                            <span className="text-muted-foreground">· {getUserEmail(trip.creator_id)}</span>
                          </div>

                          {/* Participants */}
                          {participants.length > 0 && (
                            <div className="mt-2 p-2 bg-secondary/30 rounded-lg">
                              <p className="text-[10px] font-bold text-foreground mb-1">Participants ({participants.length})</p>
                              <div className="flex flex-wrap gap-1">
                                {participants.map(p => (
                                  <span key={p.id} className="text-[10px] bg-accent/10 text-accent px-2 py-0.5 rounded-full">
                                    {getUserName(p.user_id)} ({p.status})
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                          {participants.length === 0 && (
                            <p className="text-[10px] text-muted-foreground mt-1 italic">No participants yet</p>
                          )}

                          {/* Trip Details */}
                          <div className="mt-2 flex flex-wrap gap-2 text-[10px]">
                            {trip.includes_stay && <span className="bg-accent/5 text-accent px-2 py-0.5 rounded-full">🏠 Stay</span>}
                            {trip.includes_food && <span className="bg-accent/5 text-accent px-2 py-0.5 rounded-full">🍽️ Food</span>}
                            {trip.includes_transport && <span className="bg-accent/5 text-accent px-2 py-0.5 rounded-full">🚗 Transport</span>}
                            {trip.includes_activities && <span className="bg-accent/5 text-accent px-2 py-0.5 rounded-full">🎯 Activities</span>}
                            {trip.duration && <span className="bg-secondary text-muted-foreground px-2 py-0.5 rounded-full">{trip.duration}</span>}
                            {trip.start_date && <span className="bg-secondary text-muted-foreground px-2 py-0.5 rounded-full">{new Date(trip.start_date).toLocaleDateString()} → {trip.end_date ? new Date(trip.end_date).toLocaleDateString() : "Open"}</span>}
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
                      <textarea className="mt-3 flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm min-h-[40px]"
                        placeholder="Admin note..." value={tripNotes[trip.id] || ""} onChange={e => setTripNotes(p => ({ ...p, [trip.id]: e.target.value }))} />
                    </div>
                  );
                })}
              </div>
            )}
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
                          <p className="text-sm text-muted-foreground mt-1">{req.location} · {format(req.price)} · {req.duration || "N/A"}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">Submitted by: {getUserName(req.host_id)}</p>
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

        {/* ===== EXPERIENCES TAB (Enhanced with edit/update) ===== */}
        {activeTab === "experiences" && (
          <div className="mt-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <h2 className="text-xl font-bold text-foreground">Experiences ({allExperiences.length})</h2>
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input className="pl-9" placeholder="Search experiences..." value={experienceSearch} onChange={e => setExperienceSearch(e.target.value)} />
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
              {[
                { label: "Total", value: allExperiences.length, color: "text-primary" },
                { label: "Approved", value: allExperiences.filter((e: any) => e.status === "approved").length, color: "text-accent" },
                { label: "Pending", value: allExperiences.filter((e: any) => e.status === "pending").length, color: "text-primary" },
                { label: "Avg Rating", value: (allExperiences.reduce((s: number, e: any) => s + (Number(e.rating) || 0), 0) / Math.max(allExperiences.length, 1)).toFixed(1), color: "text-accent" },
              ].map(s => (
                <div key={s.label} className="rounded-lg bg-card p-3 shadow-card text-center">
                  <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
                  <p className="text-[10px] text-muted-foreground">{s.label}</p>
                </div>
              ))}
            </div>
            <div className="space-y-3">
              {filteredExperiences.map((e: any) => (
                <div key={e.id} className={`rounded-xl bg-card p-4 shadow-card ${e.status === "pending" ? "ring-2 ring-primary/20" : ""}`}>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">{e.category}</span>
                        {e.sub_category && <span className="text-xs bg-secondary text-muted-foreground px-2 py-0.5 rounded-full">{e.sub_category}</span>}
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusBadge(e.status || "approved")}`}>{e.status || "approved"}</span>
                      </div>
                      <h3 className="mt-1 font-bold text-foreground">{e.title}</h3>
                      <p className="text-xs text-muted-foreground mt-1">
                        {e.host_name || e.hostName}, {e.host_city || e.hostCity || e.location} · {format(Number(e.price))} · {e.duration || "N/A"}
                      </p>
                      {e.description && <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{e.description}</p>}
                      <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                        <span className="flex items-center gap-0.5"><Star className="w-3 h-3 fill-primary text-primary" />{e.rating || 0}</span>
                        <span>{e.review_count || 0} reviews</span>
                        <span>Max {e.max_guests || 10} guests</span>
                        {e.difficulty && <span className="capitalize">{e.difficulty}</span>}
                      </div>
                    </div>
                    <div className="flex flex-col gap-2 shrink-0">
                      <Button size="sm" variant="outline" className="rounded-full text-xs gap-1"
                        onClick={() => setEditDialog({
                          open: true, title: `Edit: ${e.title}`, fields: experienceFields,
                          data: { title: e.title, description: e.description, category: e.category, price: e.price, duration: e.duration, location: e.location || e.hostCity, destination: e.destination, max_guests: e.max_guests, difficulty: e.difficulty },
                          onSave: (d) => e.id ? updateExperience(e.id, d) : toast({ title: "Updated (mock)" }),
                        })}>
                        <Edit className="w-3 h-3" /> Edit
                      </Button>
                      {e.status === "pending" && (
                        <Button size="sm" className="rounded-full text-xs bg-accent text-accent-foreground" onClick={() => updateExperienceStatus(e.id, "approved")}>
                          <CheckCircle className="w-3 h-3 mr-1" /> Approve
                        </Button>
                      )}
                      {e.status === "approved" && (
                        <Button size="sm" variant="outline" className="rounded-full text-xs text-destructive" onClick={() => updateExperienceStatus(e.id, "suspended")}>
                          <Ban className="w-3 h-3 mr-1" /> Suspend
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
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
                        <p className="text-xs text-muted-foreground mt-1">Filed by: {getUserName(g.filed_by)} · Against: {getUserName(g.against)}</p>
                        {g.resolution && <div className="mt-2 p-2 bg-accent/5 rounded-lg border border-accent/20"><p className="text-xs font-medium text-accent">Resolution: {g.resolution}</p></div>}
                        {g.admin_notes && <p className="text-xs text-muted-foreground mt-1 italic">Notes: {g.admin_notes}</p>}
                      </div>
                      <div className="flex flex-col gap-2 shrink-0">
                        {g.status === "open" && <Button size="sm" className="rounded-full text-xs" onClick={() => updateGrievanceStatus(g.id, "in_progress")}>Take Up</Button>}
                        {g.status === "in_progress" && (
                          <>
                            <Button size="sm" className="rounded-full text-xs bg-accent text-accent-foreground" onClick={() => updateGrievanceStatus(g.id, "resolved", grievanceNotes[g.id] || "Resolved by admin")}>
                              <CheckCircle className="w-3 h-3 mr-1" /> Resolve
                            </Button>
                            <Button size="sm" variant="outline" className="rounded-full text-xs" onClick={() => updateGrievanceStatus(g.id, "closed")}>Close</Button>
                          </>
                        )}
                        {g.status === "resolved" && <Button size="sm" variant="outline" className="rounded-full text-xs" onClick={() => updateGrievanceStatus(g.id, "closed")}>Close</Button>}
                      </div>
                    </div>
                    {(g.status === "open" || g.status === "in_progress") && (
                      <textarea className="mt-3 flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm min-h-[40px]"
                        placeholder="Admin notes..." value={grievanceNotes[g.id] || ""} onChange={e => setGrievanceNotes(p => ({ ...p, [g.id]: e.target.value }))} />
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
                const hBookings = mockBookings.filter(b => b.hostId === h.id);
                return (
                  <div key={h.id} className={`rounded-xl bg-card shadow-card overflow-hidden ${isExpanded ? "ring-2 ring-primary/20" : ""}`}>
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
                            <textarea className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm min-h-[40px]"
                              placeholder="Admin notes..." value={hostNotes[h.id] || ""} onChange={e => setHostNotes(p => ({ ...p, [h.id]: e.target.value }))} />
                            <div className="grid grid-cols-3 gap-3 text-xs text-muted-foreground">
                              <div className="rounded-lg bg-secondary/50 p-3"><p className="font-bold text-foreground mb-1">Bookings</p><p>{hBookings.length} · {format(hBookings.reduce((s, b) => s + b.totalPrice, 0))}</p></div>
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
                    <p className="font-bold text-foreground">{format(b.totalPrice)}</p>
                    <select className="text-xs rounded-md border border-input bg-background px-2 py-1"
                      value={status} onChange={e => { setBookingOverrides(p => ({ ...p, [b.id]: e.target.value })); toast({ title: `Booking → ${e.target.value}` }); }}>
                      <option value="pending">Pending</option><option value="confirmed">Confirmed</option><option value="completed">Completed</option><option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Invoices Tab */}
        {activeTab === "invoices" && (
          <div className="mt-6">
            <h2 className="text-xl font-bold text-foreground mb-4">Invoices ({dbInvoices.length})</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
              {[
                { label: "Total", value: dbInvoices.length, color: "text-primary" },
                { label: "Paid", value: dbInvoices.filter(i => i.status === "paid").length, color: "text-accent" },
                { label: "Unpaid", value: dbInvoices.filter(i => i.status === "unpaid").length, color: "text-destructive" },
                { label: "Revenue", value: format(dbInvoices.reduce((s: number, i: any) => s + Number(i.total_amount || 0), 0)), color: "text-primary" },
              ].map(s => (
                <div key={s.label} className="rounded-lg bg-card p-4 shadow-card text-center">
                  <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                </div>
              ))}
            </div>
            {dbInvoices.length === 0 ? (
              <div className="text-center py-12">
                <Receipt className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-muted-foreground">No invoices yet.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {dbInvoices.map(inv => (
                  <div key={inv.id} className="rounded-xl bg-card p-4 shadow-card flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-foreground">{inv.invoice_number}</h3>
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusBadge(inv.status)}`}>{inv.status}</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Amount: {format(Number(inv.amount))} · Tax: {format(Number(inv.tax_amount))} · Total: {format(Number(inv.total_amount))}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Host: {getUserName(inv.host_id)} · Traveler: {getUserName(inv.traveler_id)} · {new Date(inv.issued_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      {inv.status === "unpaid" && (
                        <Button size="sm" className="rounded-full text-xs bg-accent text-accent-foreground" onClick={() => updateInvoiceStatus(inv.id, "paid")}>
                          <CheckCircle className="w-3 h-3 mr-1" /> Mark Paid
                        </Button>
                      )}
                      {inv.status === "paid" && <span className="text-xs text-accent font-medium">✓ Paid {inv.paid_at ? new Date(inv.paid_at).toLocaleDateString() : ""}</span>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Destinations Tab */}
        {activeTab === "destinations" && (
          <div className="mt-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-foreground">Destinations ({allDestinations.length})</h2>
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
                    <Button variant="outline" size="sm" className="rounded-full text-xs mt-2" onClick={() => setEditDialog({
                      open: true, title: "Edit Destination", fields: destinationFields, data: d,
                      onSave: (data) => { if (isCustom) { const ci = i - destinations.length; setCustomDestinations(p => p.map((x, j) => j === ci ? data : x)); } toast({ title: "Updated!" }); },
                      onDelete: isCustom ? () => { setCustomDestinations(p => p.filter((_, j) => j !== i - destinations.length)); toast({ title: "Removed" }); } : undefined,
                    })}>Edit</Button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Beta Wanderers Tab */}
        {activeTab === "wanderers" && (
          <div className="mt-6">
            <h2 className="text-xl font-bold text-foreground mb-4">Beta Wanderer Applications ({dbWanderers.length})</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
              {[
                { label: "Total", value: dbWanderers.length, color: "text-primary" },
                { label: "Pending", value: dbWanderers.filter(w => w.status === "pending").length, color: "text-primary" },
                { label: "Approved", value: dbWanderers.filter(w => w.status === "approved").length, color: "text-accent" },
                { label: "Rejected", value: dbWanderers.filter(w => w.status === "rejected").length, color: "text-destructive" },
              ].map(s => (
                <div key={s.label} className="rounded-lg bg-card p-4 shadow-card text-center">
                  <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                </div>
              ))}
            </div>
            {dbWanderers.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No wanderer applications yet.</p>
            ) : (
              <div className="space-y-3">
                {dbWanderers.map(w => (
                  <div key={w.id} className={`rounded-xl bg-card p-5 shadow-card ${w.status === "pending" ? "ring-2 ring-primary/20" : ""}`}>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-3 flex-1">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">{w.full_name[0]}</div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-bold text-foreground">{w.full_name}</h3>
                            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusBadge(w.status)}`}>{w.status}</span>
                            <span className="text-xs bg-secondary text-muted-foreground px-2 py-0.5 rounded-full">{w.badge}</span>
                            <span className="text-xs text-muted-foreground">Score: {w.score || 0}</span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5">{w.city} · {w.email}</p>
                          <div className="flex gap-1 mt-1 flex-wrap">
                            {w.travel_styles?.map((s: string) => (
                              <span key={s} className="text-[10px] bg-primary/5 text-primary px-2 py-0.5 rounded-full">{s}</span>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2 shrink-0">
                        {w.status === "pending" && (
                          <>
                            <Button size="sm" className="rounded-full text-xs bg-accent text-accent-foreground" onClick={() => updateWandererStatus(w.id, "approved")}>
                              <CheckCircle className="w-3 h-3 mr-1" /> Approve
                            </Button>
                            <Button size="sm" variant="outline" className="rounded-full text-xs text-destructive" onClick={() => updateWandererStatus(w.id, "rejected")}>
                              <Ban className="w-3 h-3 mr-1" /> Reject
                            </Button>
                          </>
                        )}
                        {w.status === "approved" && (
                          <Button size="sm" variant="outline" className="rounded-full text-xs text-destructive" onClick={() => updateWandererStatus(w.id, "suspended")}>Suspend</Button>
                        )}
                        {(w.status === "rejected" || w.status === "suspended") && (
                          <Button size="sm" variant="outline" className="rounded-full text-xs" onClick={() => updateWandererStatus(w.id, "approved")}>Reactivate</Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Missions Tab */}
        {activeTab === "missions" && (
          <div className="mt-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-foreground">Mission Assignments ({dbMissions.length})</h2>
              <Button size="sm" className="rounded-full gap-1 text-xs" onClick={() => setShowMissionForm(!showMissionForm)}>
                <Plus className="w-3 h-3" /> Assign Mission
              </Button>
            </div>

            {showMissionForm && (
              <div className="rounded-xl bg-card p-5 shadow-card mb-6 ring-2 ring-primary/20">
                <h3 className="font-bold text-foreground mb-3">New Mission</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-foreground">Wanderer *</label>
                    <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm mt-1"
                      value={missionForm.wandererId} onChange={e => setMissionForm(p => ({ ...p, wandererId: e.target.value }))}>
                      <option value="">Select wanderer...</option>
                      {approvedWanderers.map(w => <option key={w.id} value={w.id}>{w.full_name} ({w.city})</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-foreground">Title *</label>
                    <Input className="mt-1" value={missionForm.title} onChange={e => setMissionForm(p => ({ ...p, title: e.target.value }))} placeholder="e.g. Explore Hampi" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-foreground">Destination *</label>
                    <Input className="mt-1" value={missionForm.destination} onChange={e => setMissionForm(p => ({ ...p, destination: e.target.value }))} placeholder="e.g. Hampi, Karnataka" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-foreground">Reward Points</label>
                    <Input type="number" className="mt-1" value={missionForm.rewardPoints} onChange={e => setMissionForm(p => ({ ...p, rewardPoints: Number(e.target.value) }))} />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-foreground">Deadline</label>
                    <Input type="date" className="mt-1" value={missionForm.deadline} onChange={e => setMissionForm(p => ({ ...p, deadline: e.target.value }))} />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-foreground">Description</label>
                    <Input className="mt-1" value={missionForm.description} onChange={e => setMissionForm(p => ({ ...p, description: e.target.value }))} placeholder="Mission details..." />
                  </div>
                </div>
                <div className="flex gap-2 mt-4">
                  <Button className="rounded-full gap-2" onClick={createMission}><Crosshair className="w-4 h-4" /> Assign</Button>
                  <Button variant="outline" className="rounded-full" onClick={() => setShowMissionForm(false)}>Cancel</Button>
                </div>
              </div>
            )}

            {dbMissions.length === 0 ? (
              <div className="text-center py-12">
                <Crosshair className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-muted-foreground">No missions assigned yet.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {dbMissions.map(m => {
                  const w = dbWanderers.find(w => w.id === m.wanderer_id);
                  return (
                    <div key={m.id} className={`rounded-xl bg-card p-4 shadow-card ${m.status === "assigned" ? "ring-2 ring-primary/20" : ""}`}>
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-bold text-foreground">{m.title}</h3>
                            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusBadge(m.status)}`}>{m.status}</span>
                            <span className="text-xs bg-accent/10 text-accent px-2 py-0.5 rounded-full">+{m.reward_points} pts</span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            <MapPin className="w-3 h-3 inline mr-1" />{m.destination} · Assigned to: {w?.full_name || "Unknown"}
                            {m.deadline && <> · Due: {new Date(m.deadline).toLocaleDateString()}</>}
                          </p>
                          {m.description && <p className="text-xs text-muted-foreground mt-1">{m.description}</p>}
                        </div>
                        <div className="flex gap-2 shrink-0">
                          {m.status === "assigned" && (
                            <Button size="sm" className="rounded-full text-xs bg-accent text-accent-foreground" onClick={() => updateMissionStatus(m.id, "completed")}>
                              <CheckCircle className="w-3 h-3 mr-1" /> Complete
                            </Button>
                          )}
                          {m.status !== "cancelled" && m.status !== "completed" && (
                            <Button size="sm" variant="outline" className="rounded-full text-xs text-destructive" onClick={() => updateMissionStatus(m.id, "cancelled")}>
                              Cancel
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Leaderboard Tab */}
        {activeTab === "leaderboard" && (
          <div className="mt-6">
            <h2 className="text-xl font-bold text-foreground mb-4">🏆 Wanderer Leaderboard</h2>
            {leaderboard.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No approved wanderers yet.</p>
            ) : (
              <div className="space-y-3">
                {leaderboard.map((w, i) => {
                  const missions = dbMissions.filter(m => m.wanderer_id === w.id);
                  const completedMissions = missions.filter(m => m.status === "completed");
                  const totalPoints = completedMissions.reduce((s: number, m: any) => s + (m.reward_points || 0), 0) + (w.score || 0);
                  return (
                    <div key={w.id} className={`rounded-xl bg-card p-5 shadow-card flex items-center gap-4 ${i < 3 ? "ring-2" : ""} ${i === 0 ? "ring-primary/40" : i === 1 ? "ring-primary/20" : i === 2 ? "ring-primary/10" : ""}`}>
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold shrink-0 ${
                        i === 0 ? "bg-primary text-primary-foreground" : i === 1 ? "bg-primary/20 text-primary" : i === 2 ? "bg-primary/10 text-primary" : "bg-secondary text-muted-foreground"
                      }`}>
                        {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `#${i + 1}`}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-bold text-foreground">{w.full_name}</h3>
                          <span className="text-xs bg-secondary text-muted-foreground px-2 py-0.5 rounded-full">{w.badge}</span>
                          <span className="text-xs text-primary font-bold">{totalPoints} pts</span>
                        </div>
                        <p className="text-xs text-muted-foreground">{w.city} · {completedMissions.length}/{missions.length} missions · {w.total_videos || 0} videos</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-2xl font-bold text-foreground">{totalPoints}</p>
                        <p className="text-[10px] text-muted-foreground">Total Score</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
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

        {activeTab === "analytics" && (
          <div className="mt-6 space-y-6">
            <h2 className="text-xl font-bold text-foreground mb-4">Platform Analytics</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { label: "Total Users", value: dbUsers.length },
                { label: "Active Subscriptions", value: dbSubscriptions.filter(s => s.is_active && s.tier !== "free").length },
                { label: "Total Invoices", value: dbInvoices.length },
                { label: "Total Revenue", value: format(dbInvoices.reduce((s, i) => s + Number(i.total_amount || 0), 0)) },
              ].map(s => (
                <div key={s.label} className="rounded-lg bg-card p-4 shadow-card">
                  <p className="text-2xl font-bold text-foreground">{s.value}</p>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                </div>
              ))}
            </div>

            {/* User Growth Chart */}
            <div className="rounded-xl bg-card p-5 shadow-card">
              <h3 className="font-bold text-foreground mb-4">User Signups Over Time</h3>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={(() => {
                  const months: Record<string, number> = {};
                  dbUsers.forEach(u => {
                    const m = new Date(u.created_at).toLocaleDateString("en", { month: "short", year: "2-digit" });
                    months[m] = (months[m] || 0) + 1;
                  });
                  return Object.entries(months).map(([month, count]) => ({ month, users: count }));
                })()}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="month" className="text-xs fill-muted-foreground" />
                  <YAxis className="text-xs fill-muted-foreground" />
                  <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
                  <Line type="monotone" dataKey="users" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ fill: "hsl(var(--primary))" }} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Role Distribution */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="rounded-xl bg-card p-5 shadow-card">
                <h3 className="font-bold text-foreground mb-4">User Roles</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={(() => {
                        const roleCounts: Record<string, number> = {};
                        userRoles.forEach(r => { roleCounts[r.role] = (roleCounts[r.role] || 0) + 1; });
                        return Object.entries(roleCounts).map(([name, value]) => ({ name, value }));
                      })()}
                      cx="50%" cy="50%" outerRadius={70} dataKey="value" label={({ name, value }) => `${name}: ${value}`}
                    >
                      {["hsl(var(--primary))", "hsl(var(--accent))", "hsl(var(--destructive))"].map((color, i) => (
                        <Cell key={i} fill={color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="rounded-xl bg-card p-5 shadow-card">
                <h3 className="font-bold text-foreground mb-4">Subscription Tiers</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={SUBSCRIPTION_TIERS.map(t => ({
                    tier: t.label,
                    count: dbSubscriptions.filter(s => s.tier === t.id).length,
                  }))}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="tier" className="text-xs fill-muted-foreground" />
                    <YAxis className="text-xs fill-muted-foreground" />
                    <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
                    <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Invoice Revenue Chart */}
            <div className="rounded-xl bg-card p-5 shadow-card">
              <h3 className="font-bold text-foreground mb-4">Revenue by Month</h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={(() => {
                  const months: Record<string, number> = {};
                  dbInvoices.forEach(inv => {
                    const m = new Date(inv.created_at).toLocaleDateString("en", { month: "short", year: "2-digit" });
                    months[m] = (months[m] || 0) + Number(inv.total_amount || 0);
                  });
                  return Object.entries(months).map(([month, revenue]) => ({ month, revenue }));
                })()}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="month" className="text-xs fill-muted-foreground" />
                  <YAxis className="text-xs fill-muted-foreground" />
                  <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
                  <Bar dataKey="revenue" fill="hsl(var(--accent))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
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
              <h3 className="font-bold text-foreground flex items-center gap-2"><Crown className="w-4 h-4 text-primary" /> Subscription Tiers</h3>
              <div className="grid grid-cols-2 gap-3">
                {SUBSCRIPTION_TIERS.map(tier => (
                  <div key={tier.id} className="rounded-lg bg-secondary/30 p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <tier.icon className={`w-4 h-4 ${tier.color}`} />
                      <span className="text-sm font-bold text-foreground">{tier.label}</span>
                      <span className="text-xs text-muted-foreground ml-auto">{tier.price > 0 ? `₹${tier.price}/mo` : "Free"}</span>
                    </div>
                    <ul className="text-[10px] text-muted-foreground space-y-0.5">
                      {tier.perks.map(p => <li key={p}>• {p}</li>)}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-lg bg-card p-5 shadow-card space-y-4">
              <h3 className="font-bold text-foreground flex items-center gap-2"><Settings className="w-4 h-4 text-primary" /> General</h3>
              <div><label className="text-sm font-medium text-foreground">Platform Name</label>
                <Input className="mt-1" value={platformSettings.platformName} onChange={e => setPlatformSettings(p => ({ ...p, platformName: e.target.value }))} /></div>
              <div><label className="text-sm font-medium text-foreground">Default Currency</label>
                <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm mt-1"
                  value={platformSettings.defaultCurrency} onChange={e => setPlatformSettings(p => ({ ...p, defaultCurrency: e.target.value }))}>
                  <option value="INR">INR (₹)</option><option value="USD">USD ($)</option><option value="EUR">EUR (€)</option>
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
