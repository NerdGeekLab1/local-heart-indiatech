import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from "recharts";
import { useState, useEffect, useMemo, Fragment } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import TestModePanel from "@/components/admin/TestModePanel";

import { Link, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users, DollarSign, TrendingUp, Shield, AlertTriangle, Star, MapPin, Calendar, Settings, FileText,
  BarChart3, Globe, Flag, Eye, Plus, Trash2, UtensilsCrossed, Video, ChevronDown, Ban, CheckCircle,
  Edit, Compass, MessageSquare, Target, Lock, Receipt, Trophy, Crosshair, Search, Bell, Mail,
  Crown, Gem, Sparkles, UserX, UserCheck, Filter, Key, Clock, Beaker
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { destinations } from "@/lib/data";
import { useLocalStorage } from "@/hooks/use-local-storage";
import EditDialog, { FieldConfig } from "@/components/EditDialog";
import { useToast } from "@/hooks/use-toast";
import { sendAppEmail } from "@/lib/appEmails";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useCurrency } from "@/contexts/CurrencyContext";
import ConfigurationTab from "@/components/admin/ConfigurationTab";
import EmailTemplatesTab from "@/components/admin/EmailTemplatesTab";
import SubscriptionPlansTab from "@/components/admin/SubscriptionPlansTab";
import WeddingsTab from "@/components/admin/WeddingsTab";
import BetaModerationTools from "@/components/admin/BetaModerationTools";
import FeedModerationPanel from "@/components/admin/FeedModerationPanel";
import ReelsModerationPanel from "@/components/admin/ReelsModerationPanel";
import ReviewModerationPanel from "@/components/admin/ReviewModerationPanel";
import AdminPagination from "@/components/admin/AdminPagination";
import BookingsPanel from "@/components/admin/BookingsPanel";
import DocsTab from "@/components/admin/DocsTab";
import WebsiteCMSTab from "@/components/admin/WebsiteCMSTab";
import ContentManagerTab from "@/components/admin/ContentManagerTab";
import ChatPanel from "@/components/ChatPanel";
import { Heart, Menu, BookOpen, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import ApplicationDetailDialog from "@/components/admin/ApplicationDetailDialog";


type Tab = "overview" | "hosts" | "hostWaitlist" | "bookings" | "experiences" | "destinations" | "trips" | "grievances" | "users" | "wanderers" | "missions" | "leaderboard" | "invoices" | "feedModeration" | "reelsModeration" | "reviewModeration" | "analytics" | "settings" | "configuration" | "emails" | "plans" | "weddings" | "audit" | "testmode" | "docs" | "websiteCms" | "content";

const ADMIN_TAB_KEY = "travelista.admin.activeTab";
const ADMIN_NAV_KEY = "travelista.admin.navCollapsed";



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
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = (searchParams.get("tab") as Tab)
    || (typeof localStorage !== "undefined" ? (localStorage.getItem(ADMIN_TAB_KEY) as Tab | null) : null)
    || "overview";
  const [activeTab, setActiveTabState] = useState<Tab>(initialTab);
  const [navCollapsed, setNavCollapsed] = useState<boolean>(() => {
    try { return localStorage.getItem(ADMIN_NAV_KEY) === "1"; } catch { return false; }
  });
  const toggleNav = () => setNavCollapsed(c => {
    try { localStorage.setItem(ADMIN_NAV_KEY, c ? "0" : "1"); } catch { /* storage unavailable */ }
    return !c;
  });
  const [detailApp, setDetailApp] = useState<{ kind: "eligibility" | "profile"; row: any } | null>(null);


  // Controlled + persisted: survives tab switches, visibility changes and reloads
  const setActiveTab = (tab: Tab) => {
    setActiveTabState(tab);
    try { localStorage.setItem(ADMIN_TAB_KEY, tab); } catch { /* storage unavailable */ }
    const next = new URLSearchParams(searchParams);
    next.set("tab", tab);
    setSearchParams(next, { replace: true });
  };

  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { format } = useCurrency();

  // CRUD state
  const [customDestinations, setCustomDestinations] = useLocalStorage<any[]>("admin_custom_destinations", []);
  const [hostStatuses, setHostStatuses] = useLocalStorage<Record<string, string>>("admin_host_statuses", {});
  const [hostNotes, setHostNotes] = useLocalStorage<Record<string, string>>("admin_host_notes", {});
  const [bookingOverrides, setBookingOverrides] = useLocalStorage<Record<string, string>>("admin_booking_overrides", {});
  const [flaggedReviews, setFlaggedReviews] = useLocalStorage<string[]>("admin_flagged_reviews", []);
  const [removedReviews, setRemovedReviews] = useLocalStorage<string[]>("admin_removed_reviews", []);
  const [expandedHost, setExpandedHost] = useState<string | null>(null);
  const [platformSettings, setPlatformSettings] = useLocalStorage("admin_settings", {
    commissionRate: 15, platformName: "RoamYoo", defaultCurrency: "INR",
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
  const [dbHostApplications, setDbHostApplications] = useState<any[]>([]);
  const [dbHostProfileApps, setDbHostProfileApps] = useState<any[]>([]);
  const [dbBetaWaitlist, setDbBetaWaitlist] = useState<any[]>([]);
  const [activeAdminChat, setActiveAdminChat] = useState<{ id: string; name: string } | null>(null);
  const [dbBookings, setDbBookings] = useState<any[]>([]);
  const [dbFeedPosts, setDbFeedPosts] = useState<any[]>([]);
  const [dbReviews, setDbReviews] = useState<any[]>([]);
  const totalRevenue = dbBookings.reduce((sum, booking) => sum + Number(booking.total_price || 0), 0);
  const platformFee = Math.round(totalRevenue * 0.15);
  const [dataRefreshKey, setDataRefreshKey] = useState(0);
  const [lastSynced, setLastSynced] = useState<Date | null>(null);



  // Search & filters
  const [userSearch, setUserSearch] = useState("");
  const [userRoleFilter, setUserRoleFilter] = useState<string>("all");
  const [expandedUser, setExpandedUser] = useState<string | null>(null);
  const [experienceSearch, setExperienceSearch] = useState("");
  const [experienceStatusFilter, setExperienceStatusFilter] = useState<"all" | "pending" | "approved" | "rejected">("all");
  const [auditLog, setAuditLog] = useState<any[]>([]);
  const [auditLogReloadKey, setAuditLogReloadKey] = useState(0);
  const [auditEntityFilter, setAuditEntityFilter] = useState<string>("all");

  // Mission form
  const [missionForm, setMissionForm] = useState({ wandererId: "", title: "", description: "", destination: "", rewardPoints: 100, deadline: "" });
  const [showMissionForm, setShowMissionForm] = useState(false);

  // Permission form inline
  const [permUserId, setPermUserId] = useState("");
  const [permType, setPermType] = useState(AVAILABLE_PERMISSIONS[0]);

  // Cached admin data layer — switching tabs reuses the cache instead of refetching
  const { data: adminData, isLoading: adminLoading } = useQuery({
    queryKey: ["admin-console-data", dataRefreshKey],
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    placeholderData: (prev: any) => prev,
    queryFn: async () => {
      const [{ data: trips }, { data: grievances }, { data: expReqs }, { data: profiles }, { data: roles }, { data: wanderers }, { data: dbExp }, { data: hostApps }, { data: betaSignups }] = await Promise.all([
        supabase.from("trip_listings").select("*").order("created_at", { ascending: false }),
        supabase.from("grievances").select("*").order("created_at", { ascending: false }),
        supabase.from("experience_requests").select("*").order("created_at", { ascending: false }),
        supabase.from("profiles").select("*").order("created_at", { ascending: false }),
        supabase.from("user_roles").select("*"),
        supabase.from("beta_wanderers").select("*").order("created_at", { ascending: false }),
        supabase.from("experiences").select("*").order("created_at", { ascending: false }),
        supabase.from("host_eligibility").select("*").order("created_at", { ascending: false }),
        supabase.from("beta_waitlist").select("*").order("created_at", { ascending: false }),
      ]);

      const [{ data: missions }, { data: invoices }, { data: perms }, { data: subs }, { data: participants }, { data: bookingRows }, { data: posts }, { data: reviewRows }, { data: hostProfileApps }] = await Promise.all([
        supabase.from("wanderer_missions").select("*").order("created_at", { ascending: false }),
        supabase.from("invoices").select("*").order("created_at", { ascending: false }),
        supabase.from("user_permissions").select("*").order("granted_at", { ascending: false }),
        supabase.from("subscriptions").select("*"),
        supabase.from("trip_participants").select("*"),
        supabase.from("bookings").select("*").order("created_at", { ascending: false }),
        supabase.from("feed_posts").select("*").order("created_at", { ascending: false }),
        supabase.from("reviews").select("*").order("created_at", { ascending: false }),
        supabase.from("host_applications").select("*").order("created_at", { ascending: false }),
      ]);

      return {
        trips, grievances, expReqs, profiles, roles, wanderers, dbExp, hostApps, betaSignups,
        missions, invoices, perms, subs, participants, bookingRows, posts, reviewRows, hostProfileApps,
      };
    },
  });

  useEffect(() => {
    if (!adminData) return;
    setDbTrips(adminData.trips || []);
    setDbGrievances(adminData.grievances || []);
    setDbExperienceRequests(adminData.expReqs || []);
    setDbUsers(adminData.profiles || []);
    setUserRoles(adminData.roles || []);
    setDbWanderers(adminData.wanderers || []);
    setDbExperiences(adminData.dbExp || []);
    setDbHostApplications(adminData.hostApps || []);
    setDbBetaWaitlist(adminData.betaSignups || []);
    setDbMissions(adminData.missions || []);
    setDbInvoices(adminData.invoices || []);
    setDbPermissions(adminData.perms || []);
    setDbSubscriptions(adminData.subs || []);
    setDbTripParticipants(adminData.participants || []);
    setDbBookings(adminData.bookingRows || []);
    setDbFeedPosts(adminData.posts || []);
    setDbReviews(adminData.reviewRows || []);
    setDbHostProfileApps(adminData.hostProfileApps || []);
    setLastSynced(new Date());
  }, [adminData]);


  // Live analytics: re-pull platform data every 60s while the console is open
  useEffect(() => {
    const id = setInterval(() => setDataRefreshKey(k => k + 1), 60000);
    return () => clearInterval(id);
  }, []);

  // Keep operational tables fresh without polling. RLS still controls which rows
  // are delivered, and the channel is always removed when the console unmounts.
  useEffect(() => {
    let refreshTimer: ReturnType<typeof setTimeout> | undefined;
    const refreshAdminData = () => {
      if (refreshTimer) clearTimeout(refreshTimer);
      refreshTimer = setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ["admin-console-data"] });
      }, 150);
    };

    const notifyChange = (label: string) => (payload: any) => {
      refreshAdminData();
      const action = payload.eventType === "INSERT" ? "New" : "Updated";
      toast({
        title: `${action} ${label}`,
        description: "The admin table has been refreshed with the latest data.",
      });
    };

    const channel = supabase
      .channel("admin-operational-tables")
      .on("postgres_changes", { event: "*", schema: "public", table: "host_applications" }, notifyChange("host application"))
      .on("postgres_changes", { event: "*", schema: "public", table: "host_eligibility" }, notifyChange("beta host application"))
      .on("postgres_changes", { event: "*", schema: "public", table: "beta_wanderers" }, notifyChange("Beta Wanderer application"))
      .on("postgres_changes", { event: "*", schema: "public", table: "reviews" }, notifyChange("review"))
      .on("postgres_changes", { event: "*", schema: "public", table: "bookings" }, notifyChange("booking"))
      .subscribe();

    return () => {
      if (refreshTimer) clearTimeout(refreshTimer);
      supabase.removeChannel(channel);
    };
  }, [queryClient, toast]);


  // Audit log loader — refreshes when an admin action bumps the reload key
  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("admin_audit_log")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(200);
      setAuditLog(data || []);
    })();
  }, [auditLogReloadKey]);

  // Live audit log — new admin actions appear without a manual refresh
  useEffect(() => {
    const channel = supabase
      .channel("admin-audit-log-live")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "admin_audit_log" }, (payload) => {
        setAuditLog((current: any[]) => [payload.new as any, ...current.filter(row => row.id !== (payload.new as any).id)].slice(0, 200));
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
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
    const trip = dbTrips.find(t => t.id === id);
    if (trip?.creator_id) {
      sendAppEmail({
        template: "itinerary-update",
        userId: trip.creator_id,
        idempotencyKey: `itinerary-${id}-${status}`,
        data: {
          tripTitle: trip.title,
          updatedBy: "The RoamYoo team",
          changeSummary: `Trip listing status changed to ${status}`,
          newStartDate: trip.start_date ?? undefined,
          newEndDate: trip.end_date ?? undefined,
          itineraryUrl: `${window.location.origin}/trip/${id}`,
        },
      });
    }
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
    if (!user) return;
    const previous = dbExperiences.find(e => e.id === id)?.status ?? null;
    await supabase.from("experiences").update({ status, updated_at: new Date().toISOString() }).eq("id", id);
    const actionMap: Record<string, string> = {
      approved: previous === "approved" ? "re_approve" : (previous && previous !== "pending" ? "re_approve" : "approve"),
      rejected: "reject",
      suspended: "suspend",
      pending: "reset",
    };
    await supabase.from("admin_audit_log").insert({
      admin_id: user.id,
      entity_type: "experience",
      entity_id: id,
      action: actionMap[status] ?? status,
      previous_status: previous,
      new_status: status,
    });
    setDbExperiences(p => p.map(e => e.id === id ? { ...e, status } : e));
    setAuditLogReloadKey(k => k + 1);
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

  const sendUserEmail = async (targetUser: any) => {
    if (!user || !targetUser.email) { toast({ title: "No email on this profile", variant: "destructive" }); return; }
    const { error } = await supabase.from("email_notifications").insert({
      recipient_user_id: targetUser.id,
      recipient_email: targetUser.email,
      subject: "RoamYoo account update",
      template_name: "admin_user_email",
      trigger_event: "admin_user_management",
      body_html: `<p>Hi ${targetUser.first_name || "traveler"},</p><p>Your RoamYoo account has an update from the admin team. Please sign in to review your latest status and messages.</p>`,
      payload: { user_id: targetUser.id, action: "send_email" },
      sent_by: user.id,
    });
    if (error) { toast({ title: "Email failed", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Email queued" });
  };

  const notifyUser = async (targetUser: any) => {
    if (!user) return;
    const { error } = await supabase.from("messages").insert({
      sender_id: user.id,
      receiver_id: targetUser.id,
      content: "RoamYoo admin notification: please review your dashboard for the latest account updates.",
    });
    if (error) { toast({ title: "Notification failed", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Notification sent" });
  };

  const banUser = async (targetUser: any) => {
    if (!user) return;
    const alreadyBanned = dbPermissions.some(p => p.user_id === targetUser.id && p.permission === "account_banned");
    if (!alreadyBanned) {
      const { data, error } = await supabase.from("user_permissions").insert({
        user_id: targetUser.id,
        permission: "account_banned",
        granted_by: user.id,
      }).select().single();
      if (error && !error.message.includes("duplicate")) { toast({ title: "Ban failed", description: error.message, variant: "destructive" }); return; }
      if (data) setDbPermissions(p => [data, ...p]);
    }
    await supabase.from("admin_audit_log").insert({
      admin_id: user.id,
      entity_type: "profile",
      entity_id: targetUser.id,
      action: "ban",
      new_status: "banned",
      metadata: { email: targetUser.email },
    });
    setAuditLogReloadKey(k => k + 1);
    toast({ title: `${targetUser.email || "User"} marked banned` });
  };

  const updateHostProfileAppStatus = async (app: any, status: string) => {
    if (!user) return;
    const previousStatus = app.status;
    const shouldApprove = status === "approved" || status === "verified";
    const { data: approved, error } = shouldApprove
      ? await supabase.rpc("approve_host_profile_application", { _application_id: app.id })
      : await supabase.from("host_applications")
        .update({ status, reviewed_by: user.id, reviewed_at: new Date().toISOString() })
        .eq("id", app.id)
        .select()
        .single();
    if (error) { toast({ title: "Update failed", description: error.message, variant: "destructive" }); return; }
    if (!shouldApprove) await supabase.from("admin_audit_log").insert({
      admin_id: user.id, entity_type: "host_application", entity_id: app.id,
      action: status, previous_status: previousStatus, new_status: status,
      metadata: { email: app.email, city: app.city },
    });
    setAuditLogReloadKey(k => k + 1);
    const resultingStatus = shouldApprove ? "approved" : status;
    setDbHostProfileApps(p => p.map(a => a.id === app.id ? { ...a, ...(approved || {}), status: resultingStatus } : a));
    const approvedUserId = approved?.user_id ?? app.user_id;
    if (shouldApprove && approvedUserId && !userRoles.some(r => r.user_id === approvedUserId && r.role === "host")) {
      setUserRoles(p => [...p.filter(r => r.user_id !== approvedUserId), { id: `host-${approvedUserId}`, user_id: approvedUserId, role: "host" }]);
    }
    if (shouldApprove) {
      sendAppEmail({
        template: "host-acceptance",
        recipientEmail: app.email,
        idempotencyKey: `host-accept-${app.id}`,
        data: {
          hostName: app.full_name,
          city: app.city,
          loginUrl: `${window.location.origin}/login/host`,
          onboardingUrl: `${window.location.origin}/host-onboarding`,
        },
      });
    }
    toast({ title: status === "approved" ? "Host approved and activated" : `Host profile application → ${status}` });
  };

  const updateHostApplicationStatus = async (application: any, status: string) => {
    if (!user) return;
    if (status === "approved") {
      const { data, error } = await supabase.rpc("approve_host_application", { _application_id: application.id });
      if (error) { toast({ title: "Approval failed", description: error.message, variant: "destructive" }); return; }
      setDbHostApplications(p => p.map(a => a.id === application.id ? data : a));
      if (!userRoles.some(r => r.user_id === application.user_id && r.role === "host")) {
        setUserRoles(p => [...p, { id: `host-${application.user_id}`, user_id: application.user_id, role: "host" }]);
      }
      toast({ title: "Host approved and moved to People" });
      return;
    }
    const update = { status, reviewed_by: user.id, reviewed_at: new Date().toISOString(), updated_at: new Date().toISOString() };
    const { error } = await supabase.from("host_eligibility").update(update).eq("id", application.id);
    if (error) { toast({ title: "Update failed", description: error.message, variant: "destructive" }); return; }
    await supabase.from("admin_audit_log").insert({
      admin_id: user.id,
      entity_type: "host_eligibility",
      entity_id: application.id,
      action: status,
      previous_status: application.status,
      new_status: status,
      metadata: { user_id: application.user_id, email: application.email },
    });
    setDbHostApplications(p => p.map(a => a.id === application.id ? { ...a, ...update } : a));
    setAuditLogReloadKey(k => k + 1);
    toast({ title: `Host application ${status.replace("_", " ")}` });
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
  const allExperiences = dbExperiences;
  const filteredExperiences = useMemo(() => {
    let list = allExperiences;
    if (experienceStatusFilter !== "all") {
      list = list.filter((e: any) => {
        if (experienceStatusFilter === "rejected") return e.status === "rejected" || e.status === "suspended";
        return e.status === experienceStatusFilter;
      });
    }
    if (!experienceSearch) return list;
    const q = experienceSearch.toLowerCase();
    return list.filter((e: any) =>
      (e.title || "").toLowerCase().includes(q) ||
      (e.category || "").toLowerCase().includes(q) ||
      (e.location || e.hostCity || "").toLowerCase().includes(q)
    );
  }, [allExperiences, experienceSearch, experienceStatusFilter]);

  const allDestinations = [...destinations, ...customDestinations];
  const getHostStatus = (id: string) => hostStatuses[id] || "verified";
  const getBookingStatus = (id: string, orig: string) => bookingOverrides[id] || orig;

  // Pagination for tabular views
  const [bookingsPage, setBookingsPage] = useState(0);
  const [usersPage, setUsersPage] = useState(0);
  const [hostQueuePage, setHostQueuePage] = useState(0);
  const [hostProfilePage, setHostProfilePage] = useState(0);
  const [wanderersPage, setWanderersPage] = useState(0);
  const TABLE_PAGE_SIZE = 10;
  const [bookingsPageSize, setBookingsPageSize] = useState(10);

  // Host application filters & sorting
  const [hostAppSearch, setHostAppSearch] = useState("");
  const [hostAppStatus, setHostAppStatus] = useState<string>("all");
  const [hostAppProgram, setHostAppProgram] = useState<"all" | "foreign" | "profile">("all");
  const [hostAppSort, setHostAppSort] = useState<"newest" | "oldest" | "score" | "name">("newest");

  const updateBookingStatus = async (id: string, status: string) => {
    const { error } = await supabase.from("bookings").update({ status }).eq("id", id);
    if (error) { toast({ title: "Update failed", description: error.message, variant: "destructive" }); return; }
    setDbBookings(p => p.map(b => b.id === id ? { ...b, status } : b));
    if (status === "confirmed") {
      const booking = dbBookings.find(b => b.id === id);
      if (booking?.traveler_id) {
        sendAppEmail({
          template: "booking-confirmation",
          userId: booking.traveler_id,
          idempotencyKey: `booking-confirm-${id}`,
          data: {
            experienceTitle: (booking.services || []).join(", ") || "your trip",
            startDate: booking.start_date,
            endDate: booking.end_date,
            guests: booking.guests,
            totalPrice: booking.total_price ? `₹${Number(booking.total_price).toLocaleString("en-IN")}` : undefined,
            bookingUrl: `${window.location.origin}/dashboard/traveler?tab=bookings`,
          },
        });
      }
    }
    toast({ title: `Booking → ${status}` });
  };

  const resendBookingEmail = async (id: string) => {
    if (!user) return;
    const booking = dbBookings.find(b => b.id === id);
    if (!booking?.traveler_id) {
      toast({ title: "Email unavailable", description: "This booking has no traveler account.", variant: "destructive" });
      return;
    }
    const attemptId = crypto.randomUUID();
    const result = await sendAppEmail({
      template: "booking-confirmation",
      userId: booking.traveler_id,
      idempotencyKey: `booking-confirm-resend-${id}-${attemptId}`,
      data: {
        experienceTitle: (booking.services || []).join(", ") || "your trip",
        startDate: booking.start_date,
        endDate: booking.end_date,
        guests: booking.guests,
        totalPrice: booking.total_price ? `₹${Number(booking.total_price).toLocaleString("en-IN")}` : undefined,
        bookingUrl: `${window.location.origin}/dashboard/traveler?tab=bookings`,
      },
    });
    await supabase.from("admin_audit_log").insert({
      admin_id: user.id, entity_type: "booking", entity_id: id, action: "resend_email",
      notes: result.error ? "Transactional email resend failed" : "Transactional email resend queued",
      metadata: { template: "booking-confirmation", attempt_id: attemptId, success: !result.error },
    });
    setAuditLogReloadKey(k => k + 1);
    toast({ title: result.error ? "Resend failed" : "Booking email queued", variant: result.error ? "destructive" : "default" });
  };

  const resendHostApplicationEmail = async (app: any) => {
    if (!user || !app?.email) return;
    const attemptId = crypto.randomUUID();
    const result = await sendAppEmail({
      template: "host-acceptance", recipientEmail: app.email,
      idempotencyKey: `host-accept-resend-${app.id}-${attemptId}`,
      data: { hostName: app.full_name, city: app.city, loginUrl: `${window.location.origin}/login/host`, onboardingUrl: `${window.location.origin}/host-onboarding` },
    });
    await supabase.from("admin_audit_log").insert({
      admin_id: user.id, entity_type: "host_application", entity_id: app.id, action: "resend_email",
      previous_status: app.status, new_status: app.status,
      notes: result.error ? "Host acceptance resend failed" : "Host acceptance resend queued",
      metadata: { template: "host-acceptance", attempt_id: attemptId, success: !result.error },
    });
    setAuditLogReloadKey(k => k + 1);
    toast({ title: result.error ? "Resend failed" : "Host email queued", variant: result.error ? "destructive" : "default" });
  };

  const approvedWanderers = dbWanderers.filter(w => w.status === "approved");
  const leaderboard = [...dbWanderers].filter(w => w.status === "approved").sort((a, b) => (b.score || 0) - (a.score || 0));
  const matchesHostSearch = (a: any) =>
    !hostAppSearch.trim() ||
    `${a.full_name ?? ""} ${a.email ?? ""} ${a.city ?? ""} ${a.state ?? ""}`.toLowerCase().includes(hostAppSearch.trim().toLowerCase());

  const sortHostApps = (list: any[]) => [...list].sort((a, b) => {
    if (hostAppSort === "oldest") return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
    if (hostAppSort === "score") return (b.eligibility_score || 0) - (a.eligibility_score || 0);
    if (hostAppSort === "name") return String(a.full_name || "").localeCompare(String(b.full_name || ""));
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  const hostQueue = useMemo(() => sortHostApps(
    dbHostApplications
      .filter(a => a.status !== "approved")
      .filter(a => hostAppProgram !== "profile")
      .filter(a => hostAppStatus === "all" || a.status === hostAppStatus)
      .filter(matchesHostSearch)
  ), [dbHostApplications, hostAppStatus, hostAppProgram, hostAppSearch, hostAppSort]);

  const hostProfileQueue = useMemo(() => sortHostApps(
    dbHostProfileApps
      .filter(() => hostAppProgram !== "foreign")
      .filter(a => hostAppStatus === "all" || a.status === hostAppStatus)
      .filter(matchesHostSearch)
  ), [dbHostProfileApps, hostAppStatus, hostAppProgram, hostAppSearch, hostAppSort]);

  const auditEntriesFor = (entityId: string) => auditLog.filter(l => l.entity_id === entityId).map(l => ({
    id: l.id, action: l.action, previous_status: l.previous_status, new_status: l.new_status,
    notes: l.notes, created_at: l.created_at, metadata: l.metadata,
  }));
  const approvedHostApplications = dbHostApplications.filter(a => a.status === "approved");
  // Live registered hosts = profiles that hold the host role in the database
  const registeredHosts = useMemo(() => {
    const hostIds = new Set(userRoles.filter(r => r.role === "host").map(r => r.user_id));
    return dbUsers
      .filter(u => hostIds.has(u.id))
      .map(u => {
        const app = dbHostApplications.find(a => a.user_id === u.id);
        return {
          ...u,
          full_name: `${u.first_name || ""} ${u.last_name || ""}`.trim() || u.email || "Host",
          city: u.city || app?.city || "—",
          application: app || null,
          listings: dbExperiences.filter((e: any) => e.host_id === u.id).length,
          tripsHosted: dbTrips.filter((t: any) => t.creator_id === u.id).length,
          bookingsCount: dbBookings.filter((b: any) => b.host_id === u.id).length,
          revenue: dbInvoices.filter((i: any) => i.host_id === u.id).reduce((s: number, i: any) => s + Number(i.total_amount || 0), 0),
        };
      });
  }, [dbUsers, userRoles, dbHostApplications, dbExperiences, dbTrips, dbBookings, dbInvoices]);

  const bannedUserIds = new Set(dbPermissions.filter(p => p.permission === "account_banned").map(p => p.user_id));

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

  const tabs: { id: Tab; label: string; icon: React.ElementType; badge?: number; group: string }[] = [
    { id: "overview", label: "Overview", icon: BarChart3, group: "Insights" },
    { id: "analytics", label: "Analytics", icon: TrendingUp, group: "Insights" },

    { id: "users", label: "User Management", icon: Users, group: "People" },
    { id: "hostWaitlist", label: "Host Waitlist", icon: UserCheck, badge: hostQueue.length, group: "People" },
    { id: "hosts", label: "Hosts", icon: Users, group: "People" },
    { id: "wanderers", label: "Wanderers", icon: Target, group: "People" },
    { id: "leaderboard", label: "Leaderboard", icon: Trophy, group: "People" },

    { id: "experiences", label: "Experiences", icon: Globe, group: "Catalog" },
    { id: "destinations", label: "Destinations", icon: MapPin, group: "Catalog" },
    { id: "trips", label: "Trips", icon: Compass, badge: dbTrips.filter(t => t.status === "pending").length, group: "Catalog" },
    { id: "weddings", label: "Weddings", icon: Heart, group: "Catalog" },

    { id: "bookings", label: "Bookings", icon: Calendar, group: "Operations" },
    { id: "invoices", label: "Invoices", icon: Receipt, group: "Operations" },
    { id: "missions", label: "Missions", icon: Crosshair, group: "Operations" },
    { id: "grievances", label: "Grievances", icon: MessageSquare, badge: dbGrievances.filter(g => g.status === "open").length, group: "Operations" },
    { id: "feedModeration", label: "Feed Moderation", icon: Shield, badge: dbFeedPosts.filter(p => p.status === "pending").length, group: "Moderation" },
    { id: "reelsModeration", label: "Reels & Stories", icon: Film, badge: dbFeedPosts.filter(p => (p.reel_status || "pending") === "pending").length, group: "Moderation" },
    { id: "reviewModeration", label: "Review Moderation", icon: Star, badge: flaggedReviews.length, group: "Moderation" },
    { id: "audit", label: "Audit Log", icon: FileText, group: "Operations" },

    { id: "plans", label: "Subscription Plans", icon: Crown, group: "Settings" },
    { id: "emails", label: "Emails", icon: Mail, group: "Settings" },
    { id: "configuration", label: "Configuration", icon: Key, group: "Settings" },
    { id: "settings", label: "General", icon: Settings, group: "Settings" },
    { id: "testmode", label: "Test Mode", icon: Beaker, group: "Settings" },

    { id: "websiteCms", label: "Website CMS", icon: Globe, group: "Content" },
    { id: "content", label: "Content Manager", icon: BookOpen, group: "Content" },

    { id: "docs", label: "Docs", icon: BookOpen, group: "Docs" },

  ];

  const groupedTabs = tabs.reduce<Record<string, typeof tabs>>((acc, t) => {
    (acc[t.group] ||= []).push(t); return acc;
  }, {});
  const activeTabMeta = tabs.find(t => t.id === activeTab);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-20 pb-16 px-4 sm:px-6 lg:px-8 mx-auto max-w-[1500px]">
        <BetaModerationTools scope="admin" />
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar */}
          <aside className={`lg:shrink-0 transition-all duration-200 ${navCollapsed ? "lg:w-16" : "lg:w-64"}`}>
            <div className="lg:sticky lg:top-24 rounded-2xl bg-card shadow-card p-3 max-h-[80vh] overflow-y-auto">
              <div className={`py-2 mb-2 border-b border-border flex items-center gap-2 ${navCollapsed ? "justify-center px-0" : "justify-between px-2"}`}>
                {!navCollapsed && (
                  <div className="min-w-0">
                    <h1 className="text-lg font-bold text-foreground">Admin Console</h1>
                    <p className="text-[11px] text-muted-foreground">Commission: {platformSettings.commissionRate}%</p>
                  </div>
                )}
                <button onClick={toggleNav} aria-label={navCollapsed ? "Expand admin menu" : "Collapse admin menu"} title={navCollapsed ? "Expand menu" : "Collapse menu"}
                  className="shrink-0 rounded-lg p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors">
                  {navCollapsed ? <PanelLeftOpen className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
                </button>
              </div>
              <nav className="space-y-3">
                {Object.entries(groupedTabs).map(([group, items]) => (
                  <div key={group}>
                    {!navCollapsed && <p className="px-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">{group}</p>}
                    <div className="space-y-0.5">
                      {items.map(t => (
                        <button key={t.id} onClick={() => setActiveTab(t.id)} title={t.label}
                          className={`w-full flex items-center gap-2 py-2 text-sm rounded-lg transition-colors ${navCollapsed ? "justify-center px-0 relative" : "justify-between px-2.5"} ${activeTab === t.id ? "bg-primary text-primary-foreground font-medium" : "text-foreground hover:bg-secondary"}`}>
                          <span className={`flex items-center gap-2 min-w-0 ${navCollapsed ? "justify-center" : ""}`}>
                            <t.icon className="w-4 h-4 shrink-0" />
                            {!navCollapsed && <span className="truncate">{t.label}</span>}
                          </span>
                          {(t.badge || 0) > 0 && (
                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${navCollapsed ? "absolute -top-0.5 -right-0.5" : ""} ${activeTab === t.id && !navCollapsed ? "bg-primary-foreground text-primary" : "bg-destructive text-destructive-foreground"}`}>
                              {t.badge}
                            </span>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </nav>
            </div>

          </aside>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} key={activeTab}
              className="mb-4 flex items-center gap-2 text-sm text-muted-foreground">
              <Menu className="w-4 h-4" />
              <span>Admin</span>
              <span>/</span>
              <span className="text-foreground font-medium">{activeTabMeta?.label}</span>
            </motion.div>

        {/* Overview */}
        {activeTab === "overview" && (
          <>
            <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
              {[
                { label: "Users", value: dbUsers.length, icon: Users, color: "text-primary" },
                { label: "Bookings", value: dbBookings.length, icon: Calendar, color: "text-accent" },
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
              <div className="lg:col-span-2 rounded-lg bg-card p-4 shadow-card">
                <h2 className="text-lg font-bold text-foreground mb-2">Beta Operations</h2>
                <p className="text-sm text-muted-foreground mb-3">Use these controls for rollout flags, public beta signups, host review queues, and audit history.</p>
                <div className="grid sm:grid-cols-4 gap-3 mb-3">
                  <div className="rounded-lg bg-secondary/40 p-3"><p className="text-lg font-bold text-foreground">{dbBetaWaitlist.length}</p><p className="text-[10px] text-muted-foreground">Beta signups</p></div>
                  <div className="rounded-lg bg-secondary/40 p-3"><p className="text-lg font-bold text-foreground">{dbBetaWaitlist.filter(w => w.status === "confirmed").length}</p><p className="text-[10px] text-muted-foreground">Confirmed</p></div>
                  <div className="rounded-lg bg-secondary/40 p-3"><p className="text-lg font-bold text-foreground">{hostQueue.length}</p><p className="text-[10px] text-muted-foreground">Host queue</p></div>
                  <div className="rounded-lg bg-secondary/40 p-3"><p className="text-lg font-bold text-foreground">{approvedHostApplications.length}</p><p className="text-[10px] text-muted-foreground">Approved hosts</p></div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button asChild variant="outline" size="sm"><Link to="/admin/feature-flags"><Flag className="w-4 h-4 mr-1" /> Feature Flags</Link></Button>
                  <Button asChild variant="outline" size="sm"><Link to="/admin/waitlist"><Mail className="w-4 h-4 mr-1" /> Beta Waitlist</Link></Button>
                  <Button variant="outline" size="sm" onClick={() => setActiveTab("hostWaitlist")}><UserCheck className="w-4 h-4 mr-1" /> Host Waitlist</Button>
                  <Button asChild variant="outline" size="sm"><Link to="/admin/audit-log"><FileText className="w-4 h-4 mr-1" /> Audit Log</Link></Button>
                  <Button asChild variant="outline" size="sm"><Link to="/feed"><Sparkles className="w-4 h-4 mr-1" /> Traveler Feed</Link></Button>
                </div>
              </div>
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
            ) : (() => {
              const pageCount = Math.max(1, Math.ceil(filteredUsers.length / TABLE_PAGE_SIZE));
              const safePage = Math.min(usersPage, pageCount - 1);
              const paged = filteredUsers.slice(safePage * TABLE_PAGE_SIZE, (safePage + 1) * TABLE_PAGE_SIZE);
              return (
                <div className="rounded-2xl border border-border bg-card shadow-card overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-secondary/40 text-xs uppercase tracking-wider text-muted-foreground">
                        <tr>
                          <th className="text-left font-semibold px-3 py-2.5">User</th>
                          <th className="text-left font-semibold px-3 py-2.5">Role</th>
                          <th className="text-left font-semibold px-3 py-2.5">Plan</th>
                          <th className="text-left font-semibold px-3 py-2.5">Phone</th>
                          <th className="text-left font-semibold px-3 py-2.5">Permissions</th>
                          <th className="text-left font-semibold px-3 py-2.5">Joined</th>
                          <th className="text-right font-semibold px-3 py-2.5">Manage</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {paged.map(u => {
                          const roles = userRoles.filter(r => r.user_id === u.id);
                          const perms = dbPermissions.filter(p => p.user_id === u.id);
                          const sub = dbSubscriptions.find(s => s.user_id === u.id);
                          const isExpanded = expandedUser === u.id;

                          return (
                            <Fragment key={u.id}>
                              <tr className={isExpanded ? "bg-primary/5" : "hover:bg-secondary/20"}>
                                <td className="px-3 py-2.5">
                                  <div className="flex items-center gap-2.5">
                                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary shrink-0">
                                      {(u.first_name || "U")[0]}
                                    </div>
                                    <div className="min-w-0">
                                      <p className="font-medium text-foreground whitespace-nowrap">{u.first_name} {u.last_name || ""}</p>
                                      <p className="text-xs text-muted-foreground truncate max-w-[200px]">{u.email || "No email"}</p>
                                    </div>
                                  </div>
                                </td>
                                <td className="px-3 py-2.5">
                                  <div className="flex gap-1 flex-wrap">
                                    {roles.length === 0 && <span className="text-xs text-muted-foreground">—</span>}
                                    {roles.map(r => (
                                      <span key={r.id} className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${r.role === "admin" ? "bg-destructive/10 text-destructive" : r.role === "host" ? "bg-primary/10 text-primary" : "bg-accent/10 text-accent"}`}>
                                        {r.role}
                                      </span>
                                    ))}
                                  </div>
                                </td>
                                <td className="px-3 py-2.5">
                                  <span className="text-xs capitalize text-muted-foreground flex items-center gap-1">
                                    {sub && sub.tier !== "free" && <Crown className="w-3 h-3 text-primary" />}
                                    {sub?.tier || "free"}
                                  </span>
                                </td>
                                <td className="px-3 py-2.5 text-xs text-muted-foreground whitespace-nowrap">{u.phone || "—"}</td>
                                <td className="px-3 py-2.5 text-xs text-muted-foreground">{perms.length}</td>
                                <td className="px-3 py-2.5 text-xs text-muted-foreground whitespace-nowrap">{new Date(u.created_at).toLocaleDateString()}</td>
                                <td className="px-3 py-2.5 text-right">
                                  <Button variant="outline" size="sm" className="rounded-full text-xs gap-1" onClick={() => setExpandedUser(isExpanded ? null : u.id)}>
                                    {isExpanded ? "Close" : "Manage"}
                                    <ChevronDown className={`w-3 h-3 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                                  </Button>
                                </td>
                              </tr>
                              {isExpanded && (
                                <tr className="bg-secondary/10">
                                  <td colSpan={7} className="px-4 pb-4 pt-3">
                                    <div className="space-y-4">
                                      {/* Quick Actions */}
                                      <div className="flex flex-wrap gap-2">
                                        <Button size="sm" variant="outline" className="rounded-full text-xs gap-1" onClick={() => sendUserEmail(u)}>
                                          <Mail className="w-3 h-3" /> Send Email
                                        </Button>
                                        <Button size="sm" variant="outline" className="rounded-full text-xs gap-1" onClick={() => notifyUser(u)}>
                                          <Bell className="w-3 h-3" /> Notify
                                        </Button>
                                        <Button size="sm" variant="outline" className="rounded-full text-xs gap-1" onClick={() => setActiveAdminChat({ id: u.id, name: `${u.first_name || "User"} ${u.last_name || ""}`.trim() })}>
                                          <MessageSquare className="w-3 h-3" /> Chat
                                        </Button>
                                        <Button size="sm" variant="outline" className="rounded-full text-xs gap-1 text-destructive" onClick={() => banUser(u)} disabled={bannedUserIds.has(u.id)}>
                                          <UserX className="w-3 h-3" /> {bannedUserIds.has(u.id) ? "Banned" : "Ban"}
                                        </Button>
                                      </div>

                                      {/* Subscription Management */}
                                      <div className="rounded-lg bg-card p-3 border border-border">
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

                                      {/* ACL */}
                                      <div className="rounded-lg bg-card p-3 border border-border">
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

                                      {/* Details */}
                                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                                        <div className="rounded-lg bg-card p-2 border border-border">
                                          <p className="text-muted-foreground">Phone</p>
                                          <p className="font-medium text-foreground">{u.phone || "N/A"}</p>
                                        </div>
                                        <div className="rounded-lg bg-card p-2 border border-border">
                                          <p className="text-muted-foreground">Nationality</p>
                                          <p className="font-medium text-foreground">{u.nationality || "N/A"}</p>
                                        </div>
                                        <div className="rounded-lg bg-card p-2 border border-border">
                                          <p className="text-muted-foreground">Interests</p>
                                          <p className="font-medium text-foreground">{u.interests?.join(", ") || "N/A"}</p>
                                        </div>
                                        <div className="rounded-lg bg-card p-2 border border-border">
                                          <p className="text-muted-foreground">Travel Styles</p>
                                          <p className="font-medium text-foreground">{u.travel_styles?.join(", ") || "N/A"}</p>
                                        </div>
                                      </div>
                                    </div>
                                  </td>
                                </tr>
                              )}
                            </Fragment>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                  <div className="px-3 pb-3">
                    <AdminPagination page={safePage} total={filteredUsers.length} pageSize={TABLE_PAGE_SIZE} onPage={setUsersPage} />
                  </div>
                </div>
              );
            })()}
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
            <div className="flex gap-1 bg-secondary/40 rounded-full p-1 mb-4 w-fit">
              {(["all", "pending", "approved", "rejected"] as const).map(s => {
                const count = s === "all" ? allExperiences.length :
                  s === "rejected" ? allExperiences.filter((e: any) => e.status === "rejected" || e.status === "suspended").length :
                  allExperiences.filter((e: any) => e.status === s).length;
                return (
                  <button key={s} onClick={() => setExperienceStatusFilter(s)}
                    className={`text-xs px-3 py-1.5 rounded-full font-medium capitalize transition-colors ${experienceStatusFilter === s ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>
                    {s} ({count})
                  </button>
                );
              })}
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
                        <>
                          <Button size="sm" className="rounded-full text-xs bg-accent text-accent-foreground" onClick={() => updateExperienceStatus(e.id, "approved")}>
                            <CheckCircle className="w-3 h-3 mr-1" /> Approve
                          </Button>
                          <Button size="sm" variant="outline" className="rounded-full text-xs text-destructive" onClick={() => updateExperienceStatus(e.id, "rejected")}>
                            <Ban className="w-3 h-3 mr-1" /> Reject
                          </Button>
                        </>
                      )}
                      {e.status === "approved" && (
                        <Button size="sm" variant="outline" className="rounded-full text-xs text-destructive" onClick={() => updateExperienceStatus(e.id, "suspended")}>
                          <Ban className="w-3 h-3 mr-1" /> Suspend
                        </Button>
                      )}
                      {(e.status === "rejected" || e.status === "suspended") && (
                        <Button size="sm" className="rounded-full text-xs bg-accent text-accent-foreground" onClick={() => updateExperienceStatus(e.id, "approved")}>
                          <CheckCircle className="w-3 h-3 mr-1" /> Re-approve
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

        {/* Host Waitlist Tab */}
        {activeTab === "hostWaitlist" && (
          <div className="mt-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div>
                <h2 className="text-xl font-bold text-foreground">Host Waitlist ({hostQueue.length})</h2>
                <p className="text-sm text-muted-foreground">Review host applications before approval. Approved hosts are assigned the host role and appear under People → User Management.</p>
              </div>
              <Button asChild variant="outline" size="sm"><Link to="/host-eligibility">Public host application</Link></Button>
            </div>

            <div className="flex flex-wrap items-center gap-2 mb-4">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input className="pl-9 h-9" placeholder="Search name, email or city…" value={hostAppSearch}
                  onChange={e => { setHostAppSearch(e.target.value); setHostQueuePage(0); setHostProfilePage(0); }} />
              </div>
              <select aria-label="Filter by program" className="h-9 rounded-md border border-input bg-background px-2 text-sm text-foreground"
                value={hostAppProgram} onChange={e => { setHostAppProgram(e.target.value as any); setHostQueuePage(0); setHostProfilePage(0); }}>
                <option value="all">All programs</option>
                <option value="foreign">Host foreign travelers</option>
                <option value="profile">Host profiles (Become a Host)</option>
              </select>
              <select aria-label="Filter by status" className="h-9 rounded-md border border-input bg-background px-2 text-sm text-foreground"
                value={hostAppStatus} onChange={e => { setHostAppStatus(e.target.value); setHostQueuePage(0); setHostProfilePage(0); }}>
                <option value="all">All statuses</option>
                <option value="pending">Pending</option>
                <option value="under_review">Under review</option>
                <option value="waitlisted">Waitlisted</option>
                <option value="verified">Verified</option>
                                   <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
              <select aria-label="Sort applications" className="h-9 rounded-md border border-input bg-background px-2 text-sm text-foreground"
                value={hostAppSort} onChange={e => setHostAppSort(e.target.value as any)}>
                <option value="newest">Newest first</option>
                <option value="oldest">Oldest first</option>
                <option value="score">Highest score</option>
                <option value="name">Name A–Z</option>
              </select>
              {(hostAppSearch || hostAppStatus !== "all" || hostAppProgram !== "all" || hostAppSort !== "newest") && (
                <Button size="sm" variant="ghost" className="text-xs" onClick={() => { setHostAppSearch(""); setHostAppStatus("all"); setHostAppProgram("all"); setHostAppSort("newest"); }}>
                  Clear filters
                </Button>
              )}
            </div>

            {hostQueue.length === 0 ? (
              <div className="rounded-lg bg-card p-8 text-center shadow-card">
                <UserCheck className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
                <p className="font-medium text-foreground">No matching host applications</p>
                <p className="text-sm text-muted-foreground">Adjust the filters above, or wait for new applications from /host-eligibility.</p>
              </div>
            ) : (() => {
              const pageCount = Math.max(1, Math.ceil(hostQueue.length / TABLE_PAGE_SIZE));
              const safePage = Math.min(hostQueuePage, pageCount - 1);
              const paged = hostQueue.slice(safePage * TABLE_PAGE_SIZE, (safePage + 1) * TABLE_PAGE_SIZE);
              return (
                <div className="rounded-2xl border border-border bg-card shadow-card overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-secondary/40 text-xs uppercase tracking-wider text-muted-foreground">
                        <tr>
                          <th className="text-left font-semibold px-3 py-2.5">Applicant</th>
                          <th className="text-left font-semibold px-3 py-2.5">City</th>
                          <th className="text-left font-semibold px-3 py-2.5">Score</th>
                          <th className="text-left font-semibold px-3 py-2.5">Quiz</th>
                          <th className="text-left font-semibold px-3 py-2.5">Languages</th>
                          <th className="text-left font-semibold px-3 py-2.5">KYC</th>
                          <th className="text-left font-semibold px-3 py-2.5">Status</th>
                          <th className="text-right font-semibold px-3 py-2.5">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {paged.map(app => (
                          <tr key={app.id} className="hover:bg-secondary/20 align-top">
                            <td className="px-3 py-2.5">
                              <p className="font-medium text-foreground whitespace-nowrap">{app.full_name}</p>
                              <p className="text-xs text-muted-foreground">{app.email}</p>
                              <p className="text-xs text-muted-foreground capitalize">{app.badge} · {app.english_proficiency} English</p>
                            </td>
                            <td className="px-3 py-2.5 text-muted-foreground whitespace-nowrap">{app.city}</td>
                            <td className="px-3 py-2.5 font-semibold text-primary whitespace-nowrap">{app.eligibility_score}/100</td>
                            <td className="px-3 py-2.5 text-muted-foreground whitespace-nowrap">{app.questionnaire_score || 0}/100</td>
                            <td className="px-3 py-2.5 text-xs text-muted-foreground max-w-[180px]">
                              <span className="line-clamp-2">{app.languages?.join(", ") || "—"}</span>
                            </td>
                            <td className="px-3 py-2.5 text-xs text-muted-foreground">{app.has_kyc ? "Provided" : "Missing"}</td>
                            <td className="px-3 py-2.5">
                              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusBadge(app.status)}`}>{app.status.replace("_", " ")}</span>
                            </td>
                            <td className="px-3 py-2.5 text-right whitespace-nowrap">
                              <div className="flex gap-1.5 justify-end flex-wrap">
                                <Button size="sm" variant="secondary" className="rounded-full text-xs" onClick={() => setDetailApp({ kind: "eligibility", row: app })}>
                                  <FileText className="w-3 h-3 mr-1" /> View full
                                </Button>

                                <Button size="sm" className="rounded-full text-xs bg-accent text-accent-foreground hover:bg-accent/90" onClick={() => updateHostApplicationStatus(app, "approved")}>
                                  <CheckCircle className="w-3 h-3 mr-1" /> Approve
                                </Button>
                                <Button size="sm" variant="outline" className="rounded-full text-xs" onClick={() => updateHostApplicationStatus(app, "under_review")}>
                                  <Eye className="w-3 h-3 mr-1" /> Review
                                </Button>
                                <Button size="sm" variant="outline" className="rounded-full text-xs" onClick={() => updateHostApplicationStatus(app, "waitlisted")}>
                                  <Clock className="w-3 h-3 mr-1" /> Waitlist
                                </Button>
                                <Button size="sm" variant="outline" className="rounded-full text-xs text-destructive" onClick={() => updateHostApplicationStatus(app, "rejected")}>
                                  <Ban className="w-3 h-3 mr-1" /> Reject
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="px-3 pb-3">
                    <AdminPagination page={safePage} total={hostQueue.length} pageSize={TABLE_PAGE_SIZE} onPage={setHostQueuePage} />
                  </div>
                </div>
              );
            })()}

            {/* Host profile applications submitted from /become-host */}
            <div className="mt-8">
              <div className="flex items-center justify-between gap-3 mb-3 flex-wrap">
                <div>
                  <h3 className="text-lg font-bold text-foreground">Host profile applications ({hostProfileQueue.length} of {dbHostProfileApps.length})</h3>
                  <p className="text-sm text-muted-foreground">Submissions from the public “Become a Host” form, including homestay, transport and food details.</p>
                </div>
                <Button asChild variant="outline" size="sm"><Link to="/become-host">Open form</Link></Button>
              </div>
              {hostProfileQueue.length === 0 ? (
                <div data-testid="host-profile-apps-empty" className="rounded-2xl border border-border bg-card p-8 text-center shadow-card">
                  <UserCheck className="w-9 h-9 text-muted-foreground/40 mx-auto mb-2" />
                  <p className="font-medium text-foreground">No matching host profile applications</p>
                  <p className="text-sm text-muted-foreground">New submissions from /become-host land here for verification.</p>
                </div>
              ) : (
                <div data-testid="host-profile-apps-table" className="rounded-2xl border border-border bg-card shadow-card overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-secondary/40 text-xs uppercase tracking-wider text-muted-foreground">
                        <tr>
                          <th className="text-left font-semibold px-3 py-2.5">Applicant</th>
                          <th className="text-left font-semibold px-3 py-2.5">Location</th>
                          <th className="text-left font-semibold px-3 py-2.5">Services</th>
                          <th className="text-left font-semibold px-3 py-2.5">Details</th>
                          <th className="text-left font-semibold px-3 py-2.5">Photos</th>
                          <th className="text-right font-semibold px-3 py-2.5">Rate / day</th>
                          <th className="text-right font-semibold px-3 py-2.5">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {hostProfileQueue.slice(Math.min(hostProfilePage, Math.max(0, Math.ceil(hostProfileQueue.length / TABLE_PAGE_SIZE) - 1)) * TABLE_PAGE_SIZE, (Math.min(hostProfilePage, Math.max(0, Math.ceil(hostProfileQueue.length / TABLE_PAGE_SIZE) - 1)) + 1) * TABLE_PAGE_SIZE).map(a => (
                          <tr key={a.id} className="hover:bg-secondary/20 align-top">
                            <td className="px-3 py-2.5">
                              <p className="font-medium text-foreground whitespace-nowrap">{a.full_name}</p>
                              <p className="text-xs text-muted-foreground">{a.email}</p>
                              <p className="text-xs text-muted-foreground">{a.phone}</p>
                            </td>
                            <td className="px-3 py-2.5 text-muted-foreground whitespace-nowrap">{a.city}, {a.state}</td>
                            <td className="px-3 py-2.5 text-xs text-muted-foreground">{(a.services || []).join(", ") || "—"}</td>
                            <td className="px-3 py-2.5 text-xs text-muted-foreground max-w-[260px]">
                              {a.homestay_details?.rooms && <p>Stay: {a.homestay_details.rooms} rooms · {a.homestay_details.check_in || "—"}–{a.homestay_details.check_out || "—"} · ₹{a.homestay_details.nightly_rate || "—"}/night</p>}
                              {a.transport_details?.vehicle_type && <p>Transport: {a.transport_details.vehicle_type} · {a.transport_details.capacity || "—"} seats · ₹{a.transport_details.per_km || "—"}/km</p>}
                              {a.food_details?.cuisines && <p>Food: {a.food_details.cuisines} · ₹{a.food_details.price_per_plate || "—"}/plate</p>}
                              {!a.homestay_details?.rooms && !a.transport_details?.vehicle_type && !a.food_details?.cuisines && "—"}
                            </td>
                            <td className="px-3 py-2.5">
                              <div className="flex gap-1">
                                {(a.photos || []).slice(0, 3).map((p: string) => (
                                  <img key={p} src={p} alt="" className="w-8 h-8 rounded object-cover border border-border" />
                                ))}
                                {(a.photos || []).length === 0 && <span className="text-xs text-muted-foreground">—</span>}
                              </div>
                            </td>
                            <td className="px-3 py-2.5 text-right font-semibold text-foreground whitespace-nowrap">{a.price_per_day ? format(Number(a.price_per_day)) : "—"}</td>
                            <td className="px-3 py-2.5 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <Button size="sm" variant="secondary" className="rounded-full text-xs" onClick={() => setDetailApp({ kind: "profile", row: a })}>
                                  <FileText className="w-3 h-3 mr-1" /> View full
                                </Button>
                                <select className="text-xs rounded-md border border-input bg-background px-2 py-1"
                                  value={a.status}
                                  onChange={e => updateHostProfileAppStatus(a, e.target.value)}>
                                  <option value="pending">Pending</option>
                                  <option value="under_review">Under review</option>
                                  <option value="verified">Verified</option>
                                  <option value="rejected">Rejected</option>
                                </select>
                              </div>
                            </td>

                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="px-3 pb-3">
                    <AdminPagination alwaysShow page={Math.min(hostProfilePage, Math.max(0, Math.ceil(hostProfileQueue.length / TABLE_PAGE_SIZE) - 1))}
                      total={hostProfileQueue.length} pageSize={TABLE_PAGE_SIZE} onPage={setHostProfilePage} />
                  </div>
                </div>

              )}
            </div>
          </div>
        )}

        {/* Hosts Tab */}
        {activeTab === "hosts" && (
          <div className="mt-6">
            <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
              <h2 className="text-xl font-bold text-foreground">
                Hosts ({registeredHosts.length} registered)
              </h2>
              <Button size="sm" variant="outline" className="rounded-full text-xs gap-1.5" onClick={() => setDataRefreshKey(k => k + 1)}>
                <TrendingUp className="w-3.5 h-3.5" /> Refresh live data
              </Button>
            </div>

            {/* Live registered hosts pulled from the database */}
            <div className="mb-6 rounded-xl bg-card p-4 shadow-card">
              <h3 className="font-bold text-foreground mb-1">Registered hosts (live)</h3>
              <p className="text-xs text-muted-foreground mb-3">
                Every account carrying the host role, with their real listings, trips, bookings and revenue.
              </p>
              {registeredHosts.length === 0 ? (
                <p className="text-sm text-muted-foreground">No hosts registered yet. Approve a host application to add one.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead className="text-muted-foreground">
                      <tr className="border-b border-border">
                        <th className="text-left py-2">Host</th>
                        <th className="text-left">City</th>
                        <th className="text-right">Listings</th>
                        <th className="text-right">Trips</th>
                        <th className="text-right">Bookings</th>
                        <th className="text-right">Revenue</th>
                        <th className="text-right">Joined</th>
                        <th className="text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {registeredHosts.map(h => (
                        <tr key={h.id} className="border-b border-border last:border-0">
                          <td className="py-2">
                            <p className="font-semibold text-foreground">{h.full_name}</p>
                            <p className="text-[11px] text-muted-foreground">{h.email}</p>
                          </td>
                          <td>{h.city}</td>
                          <td className="text-right">{h.listings}</td>
                          <td className="text-right">{h.tripsHosted}</td>
                          <td className="text-right">{h.bookingsCount}</td>
                          <td className="text-right">{format(h.revenue)}</td>
                          <td className="text-right">{h.created_at ? new Date(h.created_at).toLocaleDateString() : "—"}</td>
                          <td className="text-right">
                            <div className="inline-flex gap-1">
                              <Button size="sm" variant="outline" className="rounded-full text-[11px] h-7 px-2 gap-1"
                                onClick={() => setActiveAdminChat({ id: h.id, name: h.full_name })}>
                                <MessageSquare className="w-3 h-3" /> Chat
                              </Button>
                              <Button size="sm" variant="outline" className="rounded-full text-[11px] h-7 px-2 gap-1 text-destructive"
                                onClick={() => banUser(h)} disabled={bannedUserIds.has(h.id)}>
                                <Ban className="w-3 h-3" /> {bannedUserIds.has(h.id) ? "Banned" : "Ban"}
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {approvedHostApplications.length > 0 && (
              <div className="mb-5 rounded-lg bg-card p-4 shadow-card">
                <h3 className="font-bold text-foreground mb-2">Approved host applications</h3>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
                  {approvedHostApplications.map(app => (
                    <div key={app.id} className="rounded-lg border border-border p-3 text-sm">
                      <p className="font-semibold text-foreground">{app.full_name}</p>
                      <p className="text-xs text-muted-foreground">{app.city} · {app.email}</p>
                      <span className="mt-2 inline-flex text-[10px] bg-accent/10 text-accent px-2 py-0.5 rounded-full">In People as host</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Bookings Tab */}
        {activeTab === "bookings" && (
          <div className="mt-6">
            <h2 className="text-xl font-bold text-foreground mb-4">All Bookings ({dbBookings.length})</h2>
            <BookingsPanel
              rows={dbBookings.map(b => ({
                id: b.id as string, ref: `#${(b.id as string).slice(0, 8)}`,
                host: getUserName(b.host_id), traveler: getUserName(b.traveler_id),
                dates: `${b.start_date} → ${b.end_date}`, guests: b.guests ?? "—",
                total: Number(b.total_price || 0), status: b.status || "pending",
              }))}
              loading={adminLoading}
              page={bookingsPage}
              pageSize={bookingsPageSize}
              onPage={setBookingsPage}
              onPageSize={setBookingsPageSize}
              formatCurrency={format}
              onStatusChange={updateBookingStatus}
              onResendEmail={resendBookingEmail}
              onRefresh={() => setDataRefreshKey(k => k + 1)}
            />
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
            ) : (() => {
              const pageCount = Math.max(1, Math.ceil(dbWanderers.length / TABLE_PAGE_SIZE));
              const safePage = Math.min(wanderersPage, pageCount - 1);
              const paged = dbWanderers.slice(safePage * TABLE_PAGE_SIZE, (safePage + 1) * TABLE_PAGE_SIZE);
              return (
                <div className="rounded-2xl border border-border bg-card shadow-card overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-secondary/40 text-xs uppercase tracking-wider text-muted-foreground">
                        <tr>
                          <th className="text-left font-semibold px-3 py-2.5">Wanderer</th>
                          <th className="text-left font-semibold px-3 py-2.5">City</th>
                          <th className="text-left font-semibold px-3 py-2.5">Styles</th>
                          <th className="text-left font-semibold px-3 py-2.5">Badge</th>
                          <th className="text-left font-semibold px-3 py-2.5">Score</th>
                          <th className="text-left font-semibold px-3 py-2.5">Status</th>
                          <th className="text-right font-semibold px-3 py-2.5">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {paged.map(w => (
                          <tr key={w.id} className={w.status === "pending" ? "bg-primary/5" : "hover:bg-secondary/20"}>
                            <td className="px-3 py-2.5">
                              <p className="font-medium text-foreground whitespace-nowrap">{w.full_name}</p>
                              <p className="text-xs text-muted-foreground">{w.email}</p>
                            </td>
                            <td className="px-3 py-2.5 text-muted-foreground whitespace-nowrap">{w.city}</td>
                            <td className="px-3 py-2.5 text-xs text-muted-foreground max-w-[200px]">
                              <span className="line-clamp-2">{w.travel_styles?.join(", ") || "—"}</span>
                            </td>
                            <td className="px-3 py-2.5 text-xs capitalize text-muted-foreground">{w.badge || "—"}</td>
                            <td className="px-3 py-2.5 font-semibold text-foreground">{w.score || 0}</td>
                            <td className="px-3 py-2.5">
                              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusBadge(w.status)}`}>{w.status}</span>
                            </td>
                            <td className="px-3 py-2.5 text-right whitespace-nowrap">
                              <div className="flex gap-1.5 justify-end flex-wrap">
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
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="px-3 pb-3">
                    <AdminPagination page={safePage} total={dbWanderers.length} pageSize={TABLE_PAGE_SIZE} onPage={setWanderersPage} />
                  </div>
                </div>
              );
            })()}
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
        {/* ===== FEED MODERATION TAB ===== */}
        {activeTab === "feedModeration" && (
          <div className="mt-6 space-y-6">
            <div>
              <h2 className="text-xl font-bold text-foreground">Feed Moderation</h2>
              <p className="text-sm text-muted-foreground mt-1">Approve, remove, and restore Traveler Feed posts. All actions are written to the audit log.</p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { label: "Active Posts", value: dbFeedPosts.filter(p => p.status === "active").length, icon: Shield },
                { label: "Pending", value: dbFeedPosts.filter(p => p.status === "pending").length, icon: Clock },
                { label: "Removed", value: dbFeedPosts.filter(p => p.status === "removed").length, icon: Ban },
                { label: "Total Posts", value: dbFeedPosts.length, icon: FileText },
              ].map(s => (
                <div key={s.label} className="rounded-lg bg-card p-5 shadow-card text-center">
                  <s.icon className="w-8 h-8 text-primary mx-auto mb-2" />
                  <p className="text-2xl font-bold text-foreground">{s.value}</p>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                </div>
              ))}
            </div>
            <FeedModerationPanel />
          </div>
        )}

        {/* ===== REELS & STORIES MODERATION TAB ===== */}
        {activeTab === "reelsModeration" && (
          <div className="mt-6 space-y-6">
            <div>
              <h2 className="text-xl font-bold text-foreground">Reels &amp; Stories Moderation</h2>
              <p className="text-sm text-muted-foreground mt-1">Approve or reject host reels. Only approved reels are visible on public host profiles.</p>
            </div>
            <ReelsModerationPanel />
          </div>
        )}


        {/* ===== REVIEW MODERATION TAB ===== */}
        {activeTab === "reviewModeration" && (
          <div className="mt-6 space-y-6">
            <div>
              <h2 className="text-xl font-bold text-foreground">Review Moderation</h2>
              <p className="text-sm text-muted-foreground mt-1">Flag and remove traveler reviews from live platform data.</p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { label: "Live Reviews", value: dbReviews.length, icon: Star },
                { label: "Verified Hosts", value: registeredHosts.length, icon: Shield },
                { label: "Flagged Reviews", value: flaggedReviews.length, icon: Flag },
                { label: "Removed Reviews", value: removedReviews.length, icon: Ban },
              ].map(s => (
                <div key={s.label} className="rounded-lg bg-card p-5 shadow-card text-center">
                  <s.icon className="w-8 h-8 text-primary mx-auto mb-2" />
                  <p className="text-2xl font-bold text-foreground">{s.value}</p>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                </div>
              ))}
            </div>
            <ReviewModerationPanel
              dbReviews={dbReviews}
              mockReviews={[]}
              getUserName={getUserName}
              getMockHostName={() => "Unknown host"}
            />
          </div>
        )}

        {activeTab === "analytics" && (
          <div className="mt-6 space-y-6">
            <div className="flex items-center justify-between gap-3 flex-wrap mb-4">
              <div>
                <h2 className="text-xl font-bold text-foreground">Platform Analytics</h2>
                <p className="text-xs text-muted-foreground">
                  Live database metrics · auto-refresh every 60s
                  {lastSynced ? ` · last synced ${lastSynced.toLocaleTimeString()}` : ""}
                </p>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" className="rounded-full text-xs gap-1.5" onClick={() => setDataRefreshKey(k => k + 1)}>
                  <TrendingUp className="w-3.5 h-3.5" /> Refresh now
                </Button>
                <Link to="/admin/performance">
                  <Button size="sm" variant="outline" className="rounded-full text-xs gap-1.5">
                    <BarChart3 className="w-3.5 h-3.5" /> Performance profiler
                  </Button>
                </Link>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { label: "Total Users", value: dbUsers.length },
                { label: "Hosts", value: userRoles.filter(r => r.role === "host").length },
                { label: "Travelers", value: userRoles.filter(r => r.role === "traveler").length },
                { label: "Active Subscriptions", value: dbSubscriptions.filter(s => s.is_active && s.tier !== "free").length },
                { label: "Bookings", value: dbBookings.length },
                { label: "Booking Value", value: format(dbBookings.reduce((s, b) => s + Number(b.total_price || 0), 0)) },
                { label: "Invoiced Revenue", value: format(dbInvoices.reduce((s, i) => s + Number(i.total_amount || 0), 0)) },
                { label: "Trips Listed", value: dbTrips.length },
                { label: "Experiences", value: dbExperiences.length },
                { label: "Feed Posts", value: dbFeedPosts.length },
                { label: "Reviews", value: dbReviews.length },
                { label: "Open Grievances", value: dbGrievances.filter(g => g.status === "open").length },
              ].map(s => (
                <div key={s.label} className="rounded-lg bg-card p-4 shadow-card">
                  <p className="text-2xl font-bold text-foreground">{s.value}</p>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                </div>
              ))}
            </div>

            {/* Bookings & revenue trend (real data) */}
            <div className="rounded-xl bg-card p-5 shadow-card">
              <h3 className="font-bold text-foreground mb-4">Bookings &amp; Revenue by Month</h3>
              {dbBookings.length === 0 && (
                <p className="text-sm text-muted-foreground mb-2">No bookings recorded yet — this chart fills automatically as travelers book.</p>
              )}
              <ResponsiveContainer width="100%" height={250}>

                <BarChart data={(() => {
                  const months: Record<string, { month: string; bookings: number; revenue: number }> = {};
                  dbBookings.forEach(b => {
                    const m = new Date(b.created_at).toLocaleDateString("en", { month: "short", year: "2-digit" });
                    months[m] ||= { month: m, bookings: 0, revenue: 0 };
                    months[m].bookings += 1;
                    months[m].revenue += Number(b.total_price || 0);
                  });
                  return Object.values(months);
                })()}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="month" className="text-xs fill-muted-foreground" />
                  <YAxis className="text-xs fill-muted-foreground" />
                  <RechartsTooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
                  <Bar dataKey="bookings" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="revenue" fill="hsl(var(--accent))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Top destinations from real trip listings */}
            <div className="rounded-xl bg-card p-5 shadow-card">
              <h3 className="font-bold text-foreground mb-4">Top Destinations (live trips)</h3>
              {dbTrips.length === 0 ? (
                <p className="text-sm text-muted-foreground">No trips listed yet.</p>
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={(() => {
                    const counts: Record<string, number> = {};
                    dbTrips.forEach((t: any) => {
                      const d = t.destination || "Unspecified";
                      counts[d] = (counts[d] || 0) + 1;
                    });
                    return Object.entries(counts)
                      .map(([destination, trips]) => ({ destination, trips }))
                      .sort((a, b) => b.trips - a.trips)
                      .slice(0, 8);
                  })()}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="destination" className="text-xs fill-muted-foreground" />
                    <YAxis allowDecimals={false} className="text-xs fill-muted-foreground" />
                    <RechartsTooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
                    <Bar dataKey="trips" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
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
                  <RechartsTooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
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
                    <RechartsTooltip />
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
                    <RechartsTooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
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
                  <RechartsTooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
                  <Bar dataKey="revenue" fill="hsl(var(--accent))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Configuration */}
        {activeTab === "configuration" && <ConfigurationTab />}
        {activeTab === "emails" && <EmailTemplatesTab />}

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

        {activeTab === "plans" && <SubscriptionPlansTab />}
        {activeTab === "weddings" && <WeddingsTab admin />}
        {activeTab === "testmode" && <div className="mt-2"><TestModePanel /></div>}
        {activeTab === "docs" && <DocsTab />}
        {activeTab === "websiteCms" && <WebsiteCMSTab />}
        {activeTab === "content" && <ContentManagerTab />}


        {activeTab === "audit" && (
          <div className="space-y-4 mt-2">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                  <FileText className="w-5 h-5 text-primary" /> Admin Audit Log
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Every approve, reject, suspend, and re-approve action recorded with timestamp and admin ID.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-muted-foreground" />
                <select
                  value={auditEntityFilter}
                  onChange={e => setAuditEntityFilter(e.target.value)}
                  className="h-9 rounded-md border border-input bg-background px-3 text-sm"
                >
                  <option value="all">All entities</option>
                  <option value="experience">Experiences</option>
                </select>
              </div>
            </div>

            <div className="rounded-lg bg-card shadow-card overflow-hidden">
              {auditLog.length === 0 ? (
                <p className="p-8 text-sm text-center text-muted-foreground">No audit entries yet — moderation actions will show up here.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-secondary/40 text-xs uppercase tracking-wider text-muted-foreground">
                      <tr>
                        <th className="text-left font-semibold px-4 py-2.5">When</th>
                        <th className="text-left font-semibold px-4 py-2.5">Admin</th>
                        <th className="text-left font-semibold px-4 py-2.5">Entity</th>
                        <th className="text-left font-semibold px-4 py-2.5">Action</th>
                        <th className="text-left font-semibold px-4 py-2.5">Status change</th>
                        <th className="text-left font-semibold px-4 py-2.5">Reference ID</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {auditLog
                        .filter(a => auditEntityFilter === "all" || a.entity_type === auditEntityFilter)
                        .map(a => {
                          const adminName = getUserName(a.admin_id) || "Admin";
                          const adminEmail = getUserEmail(a.admin_id);
                          return (
                            <tr key={a.id} className="hover:bg-secondary/20">
                              <td className="px-4 py-2.5 whitespace-nowrap text-muted-foreground text-xs">
                                {new Date(a.created_at).toLocaleString()}
                              </td>
                              <td className="px-4 py-2.5">
                                <div className="font-medium text-foreground">{adminName}</div>
                                {adminEmail && <div className="text-[11px] text-muted-foreground">{adminEmail}</div>}
                                <code className="text-[10px] text-muted-foreground">{a.admin_id.slice(0, 8)}…</code>
                              </td>
                              <td className="px-4 py-2.5 capitalize text-foreground">{a.entity_type}</td>
                              <td className="px-4 py-2.5">
                                <span className={`text-xs font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                                  a.action === "approve" || a.action === "re_approve"
                                    ? "bg-accent/10 text-accent"
                                    : a.action === "reject" || a.action === "suspend"
                                      ? "bg-destructive/10 text-destructive"
                                      : "bg-secondary text-foreground"
                                }`}>
                                  {a.action.replace("_", " ")}
                                </span>
                              </td>
                              <td className="px-4 py-2.5 text-xs text-muted-foreground">
                                {a.previous_status || "—"} → <strong className="text-foreground">{a.new_status || "—"}</strong>
                              </td>
                              <td className="px-4 py-2.5">
                                <code className="text-[11px] text-muted-foreground">{a.entity_id.slice(0, 8)}…</code>
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
          </div>
        </div>
      </div>

      <EditDialog open={editDialog.open} title={editDialog.title} fields={editDialog.fields}
        initialData={editDialog.data} onSave={(d) => { editDialog.onSave(d); setEditDialog(p => ({ ...p, open: false })); }}
        onDelete={editDialog.onDelete ? () => { editDialog.onDelete!(); setEditDialog(p => ({ ...p, open: false })); } : undefined}
        onClose={() => setEditDialog(p => ({ ...p, open: false }))} />
      {activeAdminChat && (
        <ChatPanel
          receiverId={activeAdminChat.id}
          receiverName={activeAdminChat.name}
          isOpen={!!activeAdminChat}
          onClose={() => setActiveAdminChat(null)}
        />
      )}
      <ApplicationDetailDialog
        open={!!detailApp}
        onClose={() => setDetailApp(null)}
        record={detailApp?.row ?? null}
        title={detailApp?.kind === "profile" ? `Host profile — ${detailApp?.row?.full_name ?? ""}` : `Host application — ${detailApp?.row?.full_name ?? ""}`}
        groups={detailApp?.kind === "profile" ? [
          { label: "Applicant", keys: ["full_name", "email", "phone", "city", "state", "tagline", "bio"] },
          { label: "Services & pricing", keys: ["services", "languages", "specialties", "price_per_day"] },
          { label: "Homestay", keys: ["homestay_details"] },
          { label: "Transport", keys: ["transport_details"] },
          { label: "Food", keys: ["food_details"] },
        ] : [
          { label: "Applicant", keys: ["full_name", "email", "phone", "city", "emergency_contact"] },
          { label: "Experience", keys: ["years_hosting", "foreign_guests_hosted", "references_count", "english_proficiency", "languages", "country_focus", "hosting_specialties"] },
          { label: "Credibility", keys: ["has_kyc", "has_passport", "cultural_training", "eligibility_score", "social_score", "questionnaire_score", "badge", "waitlist_position"] },
          { label: "Motivation", keys: ["why_host"] },
        ]}
        onStatus={s => detailApp && (detailApp.kind === "profile"
          ? updateHostProfileAppStatus(detailApp.row, s)
          : updateHostApplicationStatus(detailApp.row, s))}
        statuses={detailApp?.kind === "profile" ? [
          { value: "approved", label: "Approve host", icon: "approve" },
          { value: "verified", label: "Verify profile", icon: "review" },
          { value: "under_review", label: "Mark under review", icon: "review" },
          { value: "rejected", label: "Reject", icon: "reject" },
        ] : [
          { value: "approved", label: "Approve host", icon: "approve" },
          { value: "under_review", label: "Mark under review", icon: "review" },
          { value: "waitlisted", label: "Waitlist", icon: "wait" },
          { value: "rejected", label: "Reject", icon: "reject" },
        ]}
        auditEntries={detailApp?.row?.id ? auditEntriesFor(detailApp.row.id) : []}
        onResendEmail={detailApp?.row?.status === "approved" ? () => resendHostApplicationEmail(detailApp.row) : undefined}
      />


      <Footer />
    </div>
  );
};

export default AdminDashboard;
