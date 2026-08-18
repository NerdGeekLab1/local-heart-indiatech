import { useState, useEffect, useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
  DollarSign, Users, Star, Calendar, Clock, TrendingUp, TrendingDown, MessageCircle, Settings, Home, Car, BarChart3,
  Bell, UtensilsCrossed, Plus, Save, Instagram, Facebook, Twitter, Youtube, Linkedin, Ghost, Globe, Tag, Bike, MapPin, Film,
  FileText, Receipt, Heart, Eye, Copy, Phone, Sparkles, ExternalLink
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { propertyTypes, vehicleTypes } from "@/lib/data";
import EditDialog, { FieldConfig } from "@/components/EditDialog";
import { useToast } from "@/hooks/use-toast";
import { sendAppEmail } from "@/lib/appEmails";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import ImageUpload from "@/components/ImageUpload";
import BetaModerationTools from "@/components/admin/BetaModerationTools";
import ListingForm, { ListingModule } from "@/components/ListingForm";
import type { TablesInsert } from "@/integrations/supabase/types";
import HostReelsManager from "@/components/host/HostReelsManager";
import HostActivityFeed from "@/components/host/HostActivityFeed";
import HostAddonsManager from "@/components/host/HostAddonsManager";
import HostMessageThreads from "@/components/host/HostMessageThreads";
import BookingDetailDialog from "@/components/host/BookingDetailDialog";
import ProfileCompleteness, { CompletenessRing } from "@/components/host/ProfileCompleteness";
import { hostCompleteness } from "@/lib/hostCompleteness";

const statusColors: Record<string, string> = {
  pending: "bg-primary/10 text-primary", confirmed: "bg-accent/10 text-accent",
  completed: "bg-secondary text-muted-foreground", cancelled: "bg-destructive/10 text-destructive",
};

type Tab = "overview" | "bookings" | "listings" | "experiences" | "food" | "addons" | "reels" | "reviews" | "earnings" | "invoices" | "messages" | "settings";

const profileFields: FieldConfig[] = [
  { key: "name", label: "Name", required: true },
  { key: "tagline", label: "Tagline", required: true },
  { key: "bio", label: "Bio", type: "textarea", required: true },
  { key: "city", label: "City", required: true },
  { key: "pricePerDay", label: "Price Per Day ($)", type: "number", required: true },
];

const propertyFields: FieldConfig[] = [
  { key: "propertyName", label: "Property Name", required: true },
  { key: "propertyType", label: "Type", type: "select", options: [...propertyTypes], required: true },
  { key: "description", label: "Description", type: "textarea", required: true },
  { key: "checkIn", label: "Check-in", required: true },
  { key: "checkOut", label: "Check-out", required: true },
];

const roomFields: FieldConfig[] = [
  { key: "name", label: "Room Name", required: true },
  { key: "type", label: "Room Type", type: "select", options: ["Private Room", "Shared Room", "Entire Home", "Heritage Suite"], required: true },
  { key: "beds", label: "Beds", type: "number", required: true },
  { key: "maxGuests", label: "Max Guests", type: "number", required: true },
  { key: "pricePerNight", label: "Price/Night ($)", type: "number", required: true },
];

const vehicleFields: FieldConfig[] = [
  { key: "type", label: "Vehicle Type", type: "select", options: [...vehicleTypes], required: true },
  { key: "model", label: "Model", required: true },
  { key: "capacity", label: "Capacity", type: "number", required: true },
  { key: "pricePerDay", label: "Price/Day ($)", type: "number", required: true },
];

const dishFields: FieldConfig[] = [
  { key: "name", label: "Dish Name", required: true },
  { key: "description", label: "Description", type: "textarea", required: true },
  { key: "cuisine", label: "Cuisine", type: "select", options: ["Rajasthani", "North Indian", "South Indian", "Goan", "Street Food", "Mughlai", "Kerala"], required: true },
  { key: "price", label: "Price ($)", type: "number", required: true },
];

const HostDashboard = () => {
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState<Tab>((searchParams.get("tab") as Tab) || "overview");

  useEffect(() => {
    const tab = searchParams.get("tab") as Tab;
    if (tab) setActiveTab(tab);
  }, [searchParams]);
  const { toast } = useToast();
  const { user } = useAuth();
  const [hostBookings, setHostBookings] = useState<any[]>([]);
  const [approvedReelCount, setApprovedReelCount] = useState(0);
  const [openBooking, setOpenBooking] = useState<any | null>(null);
  const [settingsSection, setSettingsSection] = useState<"profile" | "media" | "social" | "preferences">("profile");
  const totalEarnings = hostBookings.reduce((sum: number, b: any) => sum + Number(b.total_price || 0), 0);

  const [hostProfile, setHostProfile] = useState({
    name: "", username: "", tagline: "", bio: "", city: "", pricePerDay: 0, services: [] as string[], specialties: [] as string[],
    languages: [] as string[], responseTime: "", yearsHosting: 0,
  });
  const [socialMedia, setSocialMedia] = useState({
    instagram: "", facebook: "", twitter: "", youtube: "", snapchat: "", linkedin: "", whatsapp: "", website: "",
  });
  const [notifPrefs, setNotifPrefs] = useState({
    emailBookings: true, emailMessages: true, emailPayouts: true, instantBook: false, publicProfile: true, showPhone: false,
  });
  const [pricing, setPricing] = useState({ guidePerDay: 0, cancellationPolicy: "flexible", currency: "INR" });

  const [customVehicles, setCustomVehicles] = useState<any[]>([]);
  const [customDishes, setCustomDishes] = useState<any[]>([]);
  const [customProperties, setCustomProperties] = useState<any[]>([]);
  const [listingEditor, setListingEditor] = useState<{ module: ListingModule; index?: number } | null>(null);

  const [expForm, setExpForm] = useState({
    title: "", description: "", category: "Cultural", location: "", price: 0, duration: "",
    difficulty: "Moderate", maxGuests: 10, isYearRound: true, validFrom: "", validTo: "", lastBookingDate: "",
    vehicleType: "", highlights: "", includes: "", destination: "", subCategory: "", imageUrl: "",
    weddingDate: "", coupleNames: "", weddingHighlights: "", venue: "",
  });
  const blankExpForm = {
    title: "", description: "", category: "Cultural", location: "", price: 0, duration: "",
    difficulty: "Moderate", maxGuests: 10, isYearRound: true, validFrom: "", validTo: "", lastBookingDate: "",
    vehicleType: "", highlights: "", includes: "", destination: "", subCategory: "", imageUrl: "",
    weddingDate: "", coupleNames: "", weddingHighlights: "", venue: "",
  };
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "approved" | "rejected">("all");
  const [showExpForm, setShowExpForm] = useState(false);
  const [showReqForm, setShowReqForm] = useState(false);
  const [reqForm, setReqForm] = useState({ title: "", category: "", description: "", reason: "" });
  const [submittingReq, setSubmittingReq] = useState(false);
  const expTemplates: Record<string, Partial<typeof expForm>> = {
    Wedding: {
      title: "Traditional Indian Wedding Experience", category: "Wedding", subCategory: "Cultural Celebration",
      duration: "3 Days", difficulty: "Easy", maxGuests: 20, price: 15000,
      highlights: "Mehendi ceremony, Sangeet night, Baraat procession, Saat Phere ritual, Traditional cuisine",
      includes: "Traditional attire, All meals, Photography, Cultural guide, Transport",
      description: "Immerse in a real Indian wedding — rituals, music, dance, food. Customize dates, venue, and add-ons as per the couple's schedule.",
      coupleNames: "", weddingDate: "", venue: "",
      weddingHighlights: "Mehendi, Sangeet, Baraat, Saat Phere, Reception",
    },
    Village: {
      title: "Authentic Village Life Stay", category: "Village", subCategory: "Rural Immersion",
      duration: "2 Days", difficulty: "Easy", maxGuests: 8, price: 4500,
      highlights: "Bullock cart ride, Farm visit, Pottery workshop, Folk dance, Home-cooked meals",
      includes: "Mud-house stay, All meals, Local guide, Workshops",
      description: "Live with a village family. Wake to roosters, milk cows, learn pottery, and dine under the stars.",
    },
    Festival: {
      title: "Festival Celebration Tour", category: "Festival", subCategory: "Cultural Event",
      duration: "1 Day", difficulty: "Easy", maxGuests: 15, price: 3500,
      highlights: "Temple visits, Traditional music, Festival food, Rituals participation",
      includes: "Festival pass, Local guide, Traditional snacks, Transport",
      description: "Join locals in celebrating Diwali, Holi, Pongal or other regional festivals with full cultural context.",
    },
    BikeTour: {
      title: "Himalayan Motorcycle Expedition", category: "Bike Tour", subCategory: "Adventure",
      duration: "7 Days", difficulty: "Hard", maxGuests: 6, price: 45000,
      vehicleType: "Royal Enfield Himalayan",
      highlights: "Khardung La pass, Pangong Lake, Nubra Valley, High-altitude camping",
      includes: "Bike rental, Fuel, Permits, Accommodation, Meals, Backup vehicle",
      description: "Ride through the world's highest motorable roads with experienced lead riders.",
    },
  };
  const applyTemplate = (key: string) => {
    const t = expTemplates[key];
    if (t) setExpForm(p => ({ ...p, ...t } as any));
  };
  const [expRequests, setExpRequests] = useState<any[]>([]);
  const [hostInvoices, setHostInvoices] = useState<any[]>([]);
  const [submittingExp, setSubmittingExp] = useState(false);
  const [hostDbReviews, setHostDbReviews] = useState<any[]>([]);
  const [hostMessages, setHostMessages] = useState<any[]>([]);
  const [hostDbProfile, setHostDbProfile] = useState<any>(null);
  const [hostDbExperiences, setHostDbExperiences] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;
    Promise.all([
      supabase.from("experience_requests").select("*").eq("host_id", user.id).order("created_at", { ascending: false }),
      supabase.from("invoices").select("*").eq("host_id", user.id).order("created_at", { ascending: false }),
      supabase.from("bookings").select("*").eq("host_id", user.id).order("created_at", { ascending: false }),
      supabase.from("reviews").select("*").eq("host_id", user.id).order("created_at", { ascending: false }),
      supabase.from("messages").select("*").or(`receiver_id.eq.${user.id},sender_id.eq.${user.id}`).order("created_at", { ascending: false }).limit(50),
      supabase.from("profiles").select("*").eq("id", user.id).maybeSingle(),
      supabase.from("experiences").select("*").eq("host_id", user.id).order("created_at", { ascending: false }),
      supabase.from("host_properties").select("*").eq("host_id", user.id).order("created_at", { ascending: false }),
      supabase.from("host_dishes").select("*").eq("host_id", user.id).order("created_at", { ascending: false }),
      supabase.from("host_transports").select("*").eq("host_id", user.id).order("created_at", { ascending: false }),
    ]).then(([{ data: reqs }, { data: invs }, { data: bks }, { data: revs }, { data: msgs }, { data: prof }, { data: exps }, { data: props }, { data: dishes }, { data: transports }]) => {
      setExpRequests(reqs || []);
      setHostInvoices(invs || []);
      setHostBookings(bks || []);
      setHostDbReviews(revs || []);
      setHostMessages(msgs || []);
      setHostDbExperiences(exps || []);
      setCustomProperties((props || []).map((row: any) => ({ ...row, propertyName: row.property_name, propertyType: row.property_type, nightlyRate: row.nightly_rate, weeklyRate: row.weekly_rate, maxGuests: row.max_guests, houseRules: row.house_rules, checkIn: row.check_in, checkOut: row.check_out, images: row.photos })));
      setCustomDishes((dishes || []).map((row: any) => ({ ...row, mealType: row.meal_type, dietaryTags: row.dietary_tags?.join(", "), pricePerPlate: row.price_per_plate, prepTime: row.prep_time, allergenNotes: row.allergen_notes, images: row.photos })));
      setCustomVehicles((transports || []).map((row: any) => ({ ...row, type: row.vehicle_type, pricePerDay: row.price_per_day, pricePerKm: row.price_per_km, serviceRadius: row.service_radius_km, amenities: row.amenities?.join(", "), images: row.photos })));
      if (prof) {
        setHostDbProfile(prof);
        setHostProfile(p => ({ ...p, name: `${prof.first_name} ${prof.last_name || ""}`.trim(), username: prof.username || "", city: prof.city || "", tagline: prof.tagline || "", bio: prof.bio || "", pricePerDay: Number(prof.price_per_day || 0), services: prof.services || [], specialties: prof.specialties || [], languages: prof.languages || [], responseTime: prof.response_time || "", yearsHosting: Number(prof.years_hosting || 0) }));
        const links = prof.social_links && typeof prof.social_links === "object" && !Array.isArray(prof.social_links) ? prof.social_links as Record<string, string> : {};
        setSocialMedia(p => ({ ...p, ...links }));
        setNotifPrefs(p => ({ ...p, publicProfile: prof.is_public !== false }));
      }
    });

    const refreshBookings = async () => { const { data } = await supabase.from("bookings").select("*").eq("host_id", user.id).order("created_at", { ascending: false }); setHostBookings(data || []); };
    const refreshReviews = async () => { const { data } = await supabase.from("reviews").select("*").eq("host_id", user.id).order("created_at", { ascending: false }); setHostDbReviews(data || []); };
    const refreshExperiences = async () => { const { data } = await supabase.from("experiences").select("*").eq("host_id", user.id).order("created_at", { ascending: false }); setHostDbExperiences(data || []); };
    const refreshInvoices = async () => { const { data } = await supabase.from("invoices").select("*").eq("host_id", user.id).order("created_at", { ascending: false }); setHostInvoices(data || []); };
    const refreshMessages = async () => { const { data } = await supabase.from("messages").select("*").or(`receiver_id.eq.${user.id},sender_id.eq.${user.id}`).order("created_at", { ascending: false }).limit(50); setHostMessages(data || []); };
    const refreshProperties = async () => { const { data } = await supabase.from("host_properties").select("*").eq("host_id", user.id).order("created_at", { ascending: false }); setCustomProperties((data || []).map((row: any) => ({ ...row, propertyName: row.property_name, propertyType: row.property_type, nightlyRate: row.nightly_rate, weeklyRate: row.weekly_rate, maxGuests: row.max_guests, houseRules: row.house_rules, checkIn: row.check_in, checkOut: row.check_out, images: row.photos }))); };
    const refreshDishes = async () => { const { data } = await supabase.from("host_dishes").select("*").eq("host_id", user.id).order("created_at", { ascending: false }); setCustomDishes((data || []).map((row: any) => ({ ...row, mealType: row.meal_type, dietaryTags: row.dietary_tags?.join(", "), pricePerPlate: row.price_per_plate, prepTime: row.prep_time, allergenNotes: row.allergen_notes, images: row.photos }))); };
    const refreshTransports = async () => { const { data } = await supabase.from("host_transports").select("*").eq("host_id", user.id).order("created_at", { ascending: false }); setCustomVehicles((data || []).map((row: any) => ({ ...row, type: row.vehicle_type, pricePerDay: row.price_per_day, pricePerKm: row.price_per_km, serviceRadius: row.service_radius_km, amenities: row.amenities?.join(", "), images: row.photos }))); };
    const channel = supabase.channel(`host-dashboard-${user.id}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "bookings", filter: `host_id=eq.${user.id}` }, refreshBookings)
      .on("postgres_changes", { event: "*", schema: "public", table: "reviews", filter: `host_id=eq.${user.id}` }, refreshReviews)
      .on("postgres_changes", { event: "*", schema: "public", table: "experiences", filter: `host_id=eq.${user.id}` }, refreshExperiences)
      .on("postgres_changes", { event: "*", schema: "public", table: "invoices", filter: `host_id=eq.${user.id}` }, refreshInvoices)
      .on("postgres_changes", { event: "*", schema: "public", table: "messages", filter: `receiver_id=eq.${user.id}` }, refreshMessages)
      .on("postgres_changes", { event: "*", schema: "public", table: "host_properties", filter: `host_id=eq.${user.id}` }, refreshProperties)
      .on("postgres_changes", { event: "*", schema: "public", table: "host_dishes", filter: `host_id=eq.${user.id}` }, refreshDishes)
      .on("postgres_changes", { event: "*", schema: "public", table: "host_transports", filter: `host_id=eq.${user.id}` }, refreshTransports)
      .subscribe();
    return () => { void supabase.removeChannel(channel); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const experienceEditFields: FieldConfig[] = [
    { key: "title", label: "Title", required: true },
    { key: "description", label: "Description", type: "textarea" },
    { key: "category", label: "Category", type: "select", options: ["Cultural", "Food", "Spiritual", "Wellness", "Adventure", "Wedding", "Village", "Festival", "Medical Care", "Bike Tour"] },
    { key: "price", label: "Price (₹)", type: "number" },
    { key: "duration", label: "Duration" },
    { key: "location", label: "Location" },
    { key: "destination", label: "Destination" },
    { key: "max_guests", label: "Max Guests", type: "number" },
    { key: "difficulty", label: "Difficulty", type: "select", options: ["Easy", "Moderate", "Challenging"] },
    { key: "image_url", label: "Image URL" },
  ];

  const updateOwnExperience = async (id: string, data: any) => {
    const { error } = await supabase.from("experiences").update({
      title: data.title, description: data.description, category: data.category,
      price: Number(data.price) || 0, duration: data.duration, location: data.location,
      destination: data.destination, max_guests: data.max_guests ? Number(data.max_guests) : null,
      difficulty: data.difficulty, image_url: data.image_url || null,
      updated_at: new Date().toISOString(),
    }).eq("id", id);
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    setHostDbExperiences(p => p.map(e => e.id === id ? { ...e, ...data, price: Number(data.price) || 0 } : e));
    toast({ title: "Experience updated ✓" });
  };

  const submitExperienceRequest = async () => {
    if (!user || !expForm.title || !expForm.location) { toast({ title: "Title and location required", variant: "destructive" }); return; }
    setSubmittingExp(true);
    const { error } = await supabase.from("experience_requests").insert({
      host_id: user.id, title: expForm.title, description: expForm.description, category: expForm.category,
      location: expForm.location, price: expForm.price, duration: expForm.duration, difficulty: expForm.difficulty,
      max_guests: expForm.maxGuests, is_year_round: expForm.isYearRound,
      valid_from: expForm.isYearRound ? null : expForm.validFrom || null,
      valid_to: expForm.isYearRound ? null : expForm.validTo || null,
      last_booking_date: expForm.lastBookingDate || null,
      vehicle_type: expForm.vehicleType || null, destination: expForm.destination || null,
      sub_category: expForm.subCategory || null,
      highlights: expForm.highlights ? expForm.highlights.split(",").map(s => s.trim()) : [],
      includes: expForm.includes ? expForm.includes.split(",").map(s => s.trim()) : [],
      image_url: expForm.imageUrl || null,
      template_data: expForm.category === "Wedding" ? {
        couple_names: expForm.coupleNames || null,
        wedding_date: expForm.weddingDate || null,
        venue: expForm.venue || null,
        wedding_highlights: expForm.weddingHighlights ? expForm.weddingHighlights.split(",").map(s => s.trim()) : [],
      } : {},
    });
    setSubmittingExp(false);
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Experience request submitted! 🎉", description: "Admin will review and approve." });
    setExpForm(blankExpForm);
    const { data } = await supabase.from("experience_requests").select("*").eq("host_id", user.id).order("created_at", { ascending: false });
    setExpRequests(data || []);
  };

  const addExperience = async () => {
    if (!user || !expForm.title || !expForm.location) { toast({ title: "Title and location required", variant: "destructive" }); return; }
    setSubmittingExp(true);
    const { data, error } = await supabase.from("experiences").insert({
      host_id: user.id, host_name: hostProfile.name, host_city: hostProfile.city,
      title: expForm.title, description: expForm.description, category: expForm.category,
      location: expForm.location, price: expForm.price, duration: expForm.duration, difficulty: expForm.difficulty,
      max_guests: expForm.maxGuests, is_year_round: expForm.isYearRound,
      valid_from: expForm.isYearRound ? null : expForm.validFrom || null,
      valid_to: expForm.isYearRound ? null : expForm.validTo || null,
      last_booking_date: expForm.lastBookingDate || null,
      vehicle_type: expForm.vehicleType || null, destination: expForm.destination || null,
      sub_category: expForm.subCategory || null,
      highlights: expForm.highlights ? expForm.highlights.split(",").map(s => s.trim()) : [],
      includes: expForm.includes ? expForm.includes.split(",").map(s => s.trim()) : [],
      image_url: expForm.imageUrl || null,
      template_data: expForm.category === "Wedding" ? {
        couple_names: expForm.coupleNames || null,
        wedding_date: expForm.weddingDate || null,
        venue: expForm.venue || null,
        wedding_highlights: expForm.weddingHighlights ? expForm.weddingHighlights.split(",").map(s => s.trim()) : [],
      } : {},
      status: "pending",
    }).select().single();
    setSubmittingExp(false);
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Experience added! 🎉", description: "Pending admin approval — will go live shortly." });
    if (data) setHostDbExperiences(p => [data, ...p]);
    setExpForm(blankExpForm);
    setShowExpForm(false);
  };

  const saveUnifiedExperience = async (listing: Record<string, any>) => {
    if (!user) return;
    const tags = (value: unknown) => typeof value === "string" ? value.split(",").map(item => item.trim()).filter(Boolean) : [];
    const { data, error } = await supabase.from("experiences").insert({
      host_id: user.id,
      host_name: hostProfile.name,
      host_city: hostProfile.city,
      title: listing.title,
      description: listing.description,
      category: listing.category,
      location: listing.location,
      price: Number(listing.price) || 0,
      duration: listing.duration,
      max_guests: Number(listing.maxGuests) || null,
      highlights: tags(listing.highlights),
      includes: tags(listing.includes),
      image_url: listing.imageUrl || null,
      is_year_round: true,
      template_data: {
        gallery: listing.images,
        price_type: listing.priceType,
        languages: tags(listing.languages),
        meeting_point: listing.meetingPoint,
        cancellation_policy: listing.cancellationPolicy,
        availability: listing.availability,
      },
      status: "pending",
    }).select().single();
    if (error) { toast({ title: "Unable to save experience", description: error.message, variant: "destructive" }); return; }
    if (data) setHostDbExperiences(current => [data, ...current]);
    setShowExpForm(false);
    toast({ title: "Experience submitted", description: "It is pending admin approval." });
  };

  const submitNewTypeRequest = async () => {
    if (!user || !reqForm.title || !reqForm.category) { toast({ title: "Title and category required", variant: "destructive" }); return; }
    setSubmittingReq(true);
    const { error } = await supabase.from("experience_requests").insert({
      host_id: user.id, title: reqForm.title, category: reqForm.category,
      description: `${reqForm.description}\n\nWhy this experience: ${reqForm.reason}`,
      location: hostProfile.city || "TBD", price: 0,
    });
    setSubmittingReq(false);
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Request sent to admin! ✨", description: "We'll review your idea for a new experience type." });
    setReqForm({ title: "", category: "", description: "", reason: "" });
    setShowReqForm(false);
    const { data } = await supabase.from("experience_requests").select("*").eq("host_id", user.id).order("created_at", { ascending: false });
    setExpRequests(data || []);
  };

  const [editDialog, setEditDialog] = useState<{ open: boolean; title: string; fields: FieldConfig[]; data?: any; onSave: (d: any) => void; onDelete?: () => void }>({
    open: false, title: "", fields: [], onSave: () => {},
  });

  const allVehicles = customVehicles;

  const displayName = hostProfile.name
    || `${hostDbProfile?.first_name ?? ""} ${hostDbProfile?.last_name ?? ""}`.trim()
    || user?.email?.split("@")[0]
    || "Host";
  const displayCity = hostProfile.city || hostDbProfile?.nationality || "";
  const hostSince = hostDbProfile?.created_at ? new Date(hostDbProfile.created_at).getFullYear() : null;
  const ratingAvg = hostDbReviews.length
    ? (hostDbReviews.reduce((sum: number, r: any) => sum + Number(r.rating || 0), 0) / hostDbReviews.length).toFixed(1)
    : null;
  const decidedBookings = hostBookings.filter((b: any) => ["confirmed", "completed", "cancelled"].includes(b.status));
  const acceptanceRate = decidedBookings.length
    ? Math.round(decidedBookings.filter((b: any) => b.status !== "cancelled").length / decidedBookings.length * 100)
    : null;
  const receivedMessages = hostMessages.filter((m: any) => m.receiver_id === user?.id);
  const responseRate = receivedMessages.length
    ? Math.round(receivedMessages.filter((m: any) => m.read).length / receivedMessages.length * 100)
    : null;
  const monthValue = (offset: number) => {
    const ref = new Date();
    ref.setMonth(ref.getMonth() - offset);
    return hostBookings
      .filter((b: any) => { const d = new Date(b.created_at); return d.getMonth() === ref.getMonth() && d.getFullYear() === ref.getFullYear(); })
      .reduce((sum: number, b: any) => sum + Number(b.total_price || 0), 0);
  };
  const thisMonthValue = monthValue(0);
  const lastMonthValue = monthValue(1);
  const monthDelta = lastMonthValue > 0 ? Math.round((thisMonthValue - lastMonthValue) / lastMonthValue * 100) : null;
  const publicProfilePath = hostProfile.username || user?.id || "";
  const publicProfileUrl = publicProfilePath ? `${window.location.origin}/host/${publicProfilePath}` : "";

  const copyPublicLink = async () => {
    if (!publicProfileUrl) return;
    try {
      await navigator.clipboard.writeText(publicProfileUrl);
      toast({ title: "Link copied", description: "Share your public host page anywhere." });
    } catch {
      toast({ title: "Copy failed", description: publicProfileUrl, variant: "destructive" });
    }
  };
  
  const updateBookingStatus = async (id: string, status: string) => {
    const { error } = await supabase.from("bookings").update({ status }).eq("id", id);
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    setHostBookings(p => p.map(b => b.id === id ? { ...b, status } : b));
    if (status === "confirmed") {
      const booking = hostBookings.find(b => b.id === id);
      if (booking?.traveler_id) {
        sendAppEmail({
          template: "booking-confirmation",
          userId: booking.traveler_id,
          idempotencyKey: `booking-confirm-${id}`,
          data: {
            hostName: displayName,
            location: displayCity,
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
    toast({ title: `Booking ${status}` });
  };


  const generateInvoice = async (booking: any) => {
    if (!user) return;
    const invoiceNumber = `INV-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 9999)).padStart(4, "0")}`;
    const amount = Number(booking.total_price || 0);
    const taxAmount = Math.round(amount * 0.18);
    const { data, error } = await supabase.from("invoices").insert({
      invoice_number: invoiceNumber,
      traveler_id: booking.traveler_id,
      host_id: user.id,
      booking_id: booking.id,
      amount,
      tax_amount: taxAmount,
      total_amount: amount + taxAmount,
      currency: "INR",
      status: "unpaid",
    }).select().single();
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    setHostInvoices(p => [data, ...p]);
    toast({ title: `Invoice ${invoiceNumber} generated! 🧾` });
  };

  // Live count of reels approved for the public page (drives the completeness score).
  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const { count } = await supabase.from("feed_posts").select("id", { count: "exact", head: true })
        .eq("user_id", user.id).eq("reel_status", "approved");
      setApprovedReelCount(count ?? 0);
    };
    void load();
    const channel = supabase.channel(`host-reel-count-${user.id}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "feed_posts", filter: `user_id=eq.${user.id}` }, load)
      .subscribe();
    return () => { void supabase.removeChannel(channel); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const completeness = useMemo(() => hostCompleteness({
    coverUrl: hostDbProfile?.cover_url,
    avatarUrl: hostDbProfile?.avatar_url,
    bio: hostProfile.bio,
    tagline: hostProfile.tagline,
    city: hostProfile.city,
    languages: hostProfile.languages,
    responseTime: hostProfile.responseTime,
    yearsHosting: hostProfile.yearsHosting,
    services: hostProfile.services,
    specialties: hostProfile.specialties,
    reelsCount: approvedReelCount,
    amenitiesCount:
      customProperties.reduce((sum, item: any) => sum + (item.amenities?.length || 0), 0) +
      customVehicles.reduce((sum, item: any) => sum + (item.amenities?.length || 0), 0) +
      customDishes.reduce((sum, item: any) => sum + (item.dietary_tags?.length || 0), 0),
  }), [hostDbProfile, hostProfile, approvedReelCount, customProperties, customVehicles, customDishes]);

  const tabs: { id: Tab; label: string; icon: React.ElementType }[] = [
    { id: "overview", label: "Overview", icon: BarChart3 },
    { id: "bookings", label: "Bookings", icon: Calendar },
    { id: "experiences", label: "Experiences", icon: Globe },
    { id: "listings", label: "Property", icon: Home },
    { id: "food", label: "Food Menu", icon: UtensilsCrossed },
    { id: "addons", label: "Add-ons", icon: Sparkles },
    { id: "reels", label: "Reels & Stories", icon: Film },
    { id: "reviews", label: "Reviews", icon: Star },
    { id: "earnings", label: "Earnings", icon: DollarSign },
    { id: "invoices", label: "Invoices", icon: Receipt },
    
    { id: "messages", label: "Messages", icon: MessageCircle },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      {/* Host workspace hero — a saffron banner + side rail keeps it visually distinct from the traveler dashboard */}
      <header className="relative overflow-hidden border-b border-border bg-gradient-to-br from-primary/25 via-accent/10 to-background pt-20">
        {hostDbProfile?.cover_url && (
          <img src={hostDbProfile.cover_url} alt="" aria-hidden className="absolute inset-0 h-full w-full object-cover opacity-20" />
        )}
        <div className="relative mx-auto max-w-6xl px-4 pb-8 pt-6 sm:px-6 lg:px-8">
        <BetaModerationTools scope="host" />
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-wrap items-center gap-4">
          {hostDbProfile?.avatar_url ? (
            <img src={hostDbProfile.avatar_url} alt={displayName} loading="lazy" className="w-16 h-16 rounded-full object-cover shadow-card" />
          ) : (
            <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xl font-bold shadow-card">
              {displayName.charAt(0).toUpperCase()}
            </div>
          )}
          <div className="min-w-0">
            <h1 className="text-3xl font-bold text-foreground">Welcome, {displayName}!</h1>
            <p className="text-muted-foreground">
              {displayCity || "Add your city in Settings"}
              {hostSince ? ` · Host since ${hostSince}` : ""}
            </p>
          </div>
          <div className="flex items-center gap-2 sm:ml-auto">
            <Button asChild size="sm" variant="outline" className="rounded-full gap-1 text-xs">
               <Link to={`/host/${publicProfilePath}`} target="_blank" rel="noreferrer"><Eye className="w-3.5 h-3.5" /> Public view</Link>
            </Button>
            <Button size="sm" variant="outline" className="rounded-full gap-1 text-xs" onClick={copyPublicLink}>
              <Copy className="w-3.5 h-3.5" /> Copy link
            </Button>
          </div>
        </motion.div>

        <div className="mt-5 flex items-center gap-3 rounded-2xl border border-border/60 bg-card/70 p-3 backdrop-blur">
          <CompletenessRing score={completeness.score} size={48} />
          <p className="text-xs text-muted-foreground">
            <span className="font-semibold text-foreground">Host profile {completeness.score}% complete.</span>{" "}
            {completeness.missing.length === 0 ? "Everything travelers look for is set." : `Next: ${completeness.missing[0].label}.`}
          </p>
        </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-4 pb-16 sm:px-6 lg:flex lg:gap-8 lg:px-8">
        {/* Desktop side rail */}
        <aside className="hidden lg:block lg:w-56 lg:shrink-0 lg:pt-8">
          <nav className="sticky top-24 space-y-1">
            {tabs.map(t => (
              <button key={t.id} onClick={() => setActiveTab(t.id)}
                className={`flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${activeTab === t.id ? "bg-primary text-primary-foreground shadow-card" : "text-muted-foreground hover:bg-secondary hover:text-foreground"}`}>
                <t.icon className="h-4 w-4" /> {t.label}
              </button>
            ))}
          </nav>
        </aside>

        <div className="min-w-0 flex-1">
        <div className="mt-4 flex gap-1 overflow-x-auto border-b border-border pb-px lg:hidden">
          {tabs.map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id)}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium whitespace-nowrap transition-colors rounded-t-lg ${activeTab === t.id ? "bg-card text-primary border-b-2 border-primary" : "text-muted-foreground hover:text-foreground"}`}>
              <t.icon className="w-4 h-4" /> {t.label}
            </button>
          ))}
        </div>

        {activeTab === "overview" && (
          <>
            <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { label: "Total Earnings", value: `₹${totalEarnings.toLocaleString("en-IN")}`, icon: DollarSign, color: "text-accent" },
                { label: "Total Bookings", value: `${hostBookings.length}`, icon: Calendar, color: "text-primary" },
                { label: hostDbReviews.length ? `Rating (${hostDbReviews.length})` : "Rating", value: ratingAvg ?? "—", icon: Star, color: "text-primary" },
                { label: "Exp Requests", value: `${expRequests.length}`, icon: FileText, color: "text-muted-foreground" },
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
                      <div key={b.id} className="rounded-lg bg-card p-4 shadow-card flex justify-between items-center">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-foreground">Booking #{b.id.slice(0,8)}</h3>
                            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusColors[b.status] || statusColors.pending}`}>{b.status}</span>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1"><Clock className="w-3 h-3 inline mr-1" />{b.start_date} → {b.end_date}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-foreground">₹{b.total_price}</p>
                          {b.status === "pending" && (
                            <div className="flex gap-2 mt-1">
                              <Button size="sm" onClick={() => updateBookingStatus(b.id, "confirmed")} className="rounded-full text-xs px-3 bg-accent text-accent-foreground hover:bg-accent/90">Accept</Button>
                              <Button size="sm" variant="outline" onClick={() => updateBookingStatus(b.id, "cancelled")} className="rounded-full text-xs px-3">Decline</Button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                </div>
              </div>
              <div className="space-y-4">
                <div className="rounded-lg bg-card p-5 shadow-card">
                  <h3 className="text-sm font-bold text-foreground uppercase tracking-wider mb-3">Performance</h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Response Rate</span>
                      <span className="font-medium text-foreground">{responseRate === null ? "No messages yet" : `${responseRate}%`}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Acceptance Rate</span>
                      <span className="font-medium text-foreground">{acceptanceRate === null ? "No decisions yet" : `${acceptanceRate}%`}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">This Month</span>
                      <span className="font-medium text-foreground">₹{thisMonthValue.toLocaleString("en-IN")}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">vs Last Month</span>
                      {monthDelta === null ? (
                        <span className="font-medium text-muted-foreground">Not enough history</span>
                      ) : (
                        <span className={`font-medium flex items-center gap-1 ${monthDelta >= 0 ? "text-accent" : "text-destructive"}`}>
                          {monthDelta >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                          {monthDelta >= 0 ? "+" : ""}{monthDelta}%
                        </span>
                      )}
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Live Listings</span>
                      <span className="font-medium text-foreground">{hostDbExperiences.filter((e: any) => e.status === "approved").length}</span>
                    </div>
                  </div>
                  <p className="mt-3 text-[11px] text-muted-foreground">All figures come from your live bookings, reviews and messages.</p>
                </div>
                <ProfileCompleteness
                  result={completeness}
                  onJump={() => setActiveTab("settings")}
                  onFix={(fix) => {
                    setActiveTab(fix.tab as Tab);
                    if (fix.section) setSettingsSection(fix.section);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                />
                {user && <HostActivityFeed userId={user.id} earnings={totalEarnings} />}
              </div>
            </div>
          </>
        )}

        {activeTab === "bookings" && (
          <div className="mt-6 space-y-3">
            <h2 className="mb-4 text-xl font-bold text-foreground">All Bookings ({hostBookings.length})</h2>
            {hostBookings.length === 0 ? (
              <div className="py-12 text-center">
                <Calendar className="mx-auto mb-3 h-12 w-12 text-muted-foreground/30" />
                <p className="text-muted-foreground">No bookings yet.</p>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-2xl border border-border" data-testid="host-bookings-table">
                <table className="w-full text-sm">
                  <thead className="bg-secondary/40 text-left text-xs uppercase tracking-wide text-muted-foreground">
                    <tr>
                      <th className="px-4 py-2">Booking</th>
                      <th className="px-4 py-2">Dates</th>
                      <th className="px-4 py-2 text-center">Days</th>
                      <th className="px-4 py-2 text-center">Guests</th>
                      <th className="px-4 py-2">Services</th>
                      <th className="px-4 py-2">Special requests</th>
                      <th className="px-4 py-2 text-right">Total</th>
                      <th className="px-4 py-2">Status</th>
                      <th className="px-4 py-2" />
                    </tr>
                  </thead>
                  <tbody>
                    {hostBookings.map(b => {
                      const days = b.start_date && b.end_date
                        ? Math.max(1, Math.round((new Date(b.end_date).getTime() - new Date(b.start_date).getTime()) / 86400000))
                        : 0;
                      const requests: string[] = b.special_requests || [];
                      return (
                        <tr key={b.id} className="border-t border-border hover:bg-secondary/20">
                          <td className="px-4 py-2 font-medium text-foreground">#{b.id.slice(0, 8)}</td>
                          <td className="px-4 py-2 text-muted-foreground">{b.start_date} → {b.end_date}</td>
                          <td className="px-4 py-2 text-center">{days}</td>
                          <td className="px-4 py-2 text-center">{b.guests ?? 1}</td>
                          <td className="px-4 py-2 text-muted-foreground">{(b.services || []).join(", ") || "—"}</td>
                          <td className="px-4 py-2 text-muted-foreground">{requests.length ? requests.join(", ") : "—"}</td>
                          <td className="px-4 py-2 text-right font-semibold text-foreground">₹{Number(b.total_price || 0).toLocaleString("en-IN")}</td>
                          <td className="px-4 py-2">
                            <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusColors[b.status] || statusColors.pending}`}>{b.status}</span>
                          </td>
                          <td className="px-4 py-2 text-right">
                            <Button size="sm" variant="outline" className="gap-1 rounded-full text-xs" onClick={() => setOpenBooking(b)}>
                              <ExternalLink className="h-3 w-3" /> View
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === "addons" && user && (
          <div className="mt-6">
            <HostAddonsManager userId={user.id} />
          </div>
        )}

        {activeTab === "experiences" && (
          <div className="mt-6 space-y-8">
            {hostDbExperiences.length > 0 && (() => {
              const counts = {
                all: hostDbExperiences.length,
                pending: hostDbExperiences.filter(e => e.status === "pending").length,
                approved: hostDbExperiences.filter(e => e.status === "approved").length,
                rejected: hostDbExperiences.filter(e => e.status === "rejected" || e.status === "suspended").length,
              };
              const visible = hostDbExperiences.filter(e =>
                statusFilter === "all" ? true :
                statusFilter === "rejected" ? (e.status === "rejected" || e.status === "suspended") :
                e.status === statusFilter
              );
              return (
              <div>
                <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
                  <h2 className="text-xl font-bold text-foreground">Your Experiences ({counts.all})</h2>
                  <div className="flex gap-1 bg-secondary/50 rounded-full p-1">
                    {(["all", "pending", "approved", "rejected"] as const).map(s => (
                      <button key={s} onClick={() => setStatusFilter(s)}
                        className={`text-xs px-3 py-1.5 rounded-full font-medium capitalize transition-colors ${statusFilter === s ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>
                        {s} ({counts[s]})
                      </button>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {visible.map(exp => (
                    <div key={exp.id} className="rounded-lg bg-card p-4 shadow-card">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <h4 className="font-semibold text-foreground truncate">{exp.title}</h4>
                          <p className="text-sm text-muted-foreground">₹{exp.price} · {exp.duration} · {exp.category}</p>
                          <span className={`inline-block mt-1 text-[10px] px-2 py-0.5 rounded-full ${
                            exp.status === "approved" ? "bg-accent/10 text-accent" :
                            exp.status === "rejected" || exp.status === "suspended" ? "bg-destructive/10 text-destructive" :
                            "bg-primary/10 text-primary"
                          }`}>
                            {exp.status}
                          </span>
                          {exp.template_data?.couple_names && (
                            <p className="text-[11px] text-muted-foreground mt-1">💍 {exp.template_data.couple_names} · {exp.template_data.wedding_date}</p>
                          )}
                        </div>
                        <Button size="sm" variant="outline" className="rounded-full text-xs"
                          onClick={() => setEditDialog({
                            open: true, title: "Edit Experience", fields: experienceEditFields, data: exp,
                            onSave: (d) => updateOwnExperience(exp.id, d),
                          })}>
                          Edit
                        </Button>
                      </div>
                    </div>
                  ))}
                  {visible.length === 0 && <p className="text-sm text-muted-foreground py-6 text-center sm:col-span-2">No experiences in this status.</p>}
                </div>
              </div>);
            })()}


            <div className="rounded-2xl bg-card p-6 shadow-card">
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <div>
                  <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                    <Plus className="w-5 h-5 text-primary" /> Add Experience
                  </h2>
                  <p className="text-sm text-muted-foreground mt-1">Pick a template (Wedding, Village, Festival, Bike Tour) or start from scratch — fully customizable. Goes live for travelers after admin approval.</p>
                </div>
                <Button onClick={() => { setShowExpForm(s => !s); if (!showExpForm) setShowReqForm(false); }} className="rounded-full gap-2">
                  <Plus className="w-4 h-4" /> {showExpForm ? "Hide Form" : "Add Experience"}
                </Button>
              </div>

              {showExpForm && user && <ListingForm module="experience" userId={user.id} onCancel={() => setShowExpForm(false)} onSave={saveUnifiedExperience} />}
              {false && <>
              <div className="mt-5 mb-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Quick-start templates</p>
                <div className="flex flex-wrap gap-2">
                  {Object.keys(expTemplates).map(k => (
                    <Button key={k} type="button" size="sm" variant="outline" className="rounded-full text-xs" onClick={() => applyTemplate(k)}>
                      {k === "BikeTour" ? "🏍️ Bike Tour" : k === "Wedding" ? "💍 Wedding" : k === "Village" ? "🏡 Village" : "🪔 Festival"}
                    </Button>
                  ))}
                  <Button type="button" size="sm" variant="ghost" className="rounded-full text-xs" onClick={() => setExpForm(blankExpForm)}>
                    Clear
                  </Button>
                </div>
              </div>

              <div className="mb-4">
                <label className="text-sm font-medium text-foreground mb-2 block">Cover Image</label>
                <ImageUpload
                  bucket="experience-images"
                  folder={user?.id || "anon"}
                  currentUrl={expForm.imageUrl || null}
                  onUpload={(url) => setExpForm(p => ({ ...p, imageUrl: url }))}
                  className="w-full h-40"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div><label className="text-sm font-medium text-foreground">Title *</label><Input className="mt-1" value={expForm.title} onChange={e => setExpForm(p => ({ ...p, title: e.target.value }))} placeholder="e.g. Ladakh Bike Expedition" /></div>
                <div><label className="text-sm font-medium text-foreground">Location *</label><Input className="mt-1" value={expForm.location} onChange={e => setExpForm(p => ({ ...p, location: e.target.value }))} placeholder="e.g. Leh, Ladakh" /></div>
                <div><label className="text-sm font-medium text-foreground">Category</label>
                  <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm mt-1" value={expForm.category}
                    onChange={e => setExpForm(p => ({ ...p, category: e.target.value }))}>
                    {["Cultural", "Food", "Spiritual", "Wellness", "Adventure", "Wedding", "Village", "Festival", "Medical Care", "Bike Tour"].map(c => <option key={c} value={c}>{c}</option>)}
                  </select></div>
                <div><label className="text-sm font-medium text-foreground">Sub-Category</label><Input className="mt-1" value={expForm.subCategory} onChange={e => setExpForm(p => ({ ...p, subCategory: e.target.value }))} placeholder="e.g. Motorcycle Tour" /></div>
                <div><label className="text-sm font-medium text-foreground">Price (₹)</label><Input type="number" className="mt-1" value={expForm.price} onChange={e => setExpForm(p => ({ ...p, price: Number(e.target.value) }))} /></div>
                <div><label className="text-sm font-medium text-foreground">Duration</label><Input className="mt-1" value={expForm.duration} onChange={e => setExpForm(p => ({ ...p, duration: e.target.value }))} placeholder="e.g. 7 Days" /></div>
                <div><label className="text-sm font-medium text-foreground">Difficulty</label>
                  <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm mt-1" value={expForm.difficulty}
                    onChange={e => setExpForm(p => ({ ...p, difficulty: e.target.value }))}>
                    {["Easy", "Moderate", "Hard", "Extreme"].map(d => <option key={d} value={d}>{d}</option>)}
                  </select></div>
                <div><label className="text-sm font-medium text-foreground">Max Guests</label><Input type="number" className="mt-1" value={expForm.maxGuests} onChange={e => setExpForm(p => ({ ...p, maxGuests: Number(e.target.value) }))} /></div>
                <div><label className="text-sm font-medium text-foreground">Destination</label><Input className="mt-1" value={expForm.destination} onChange={e => setExpForm(p => ({ ...p, destination: e.target.value }))} /></div>
                <div><label className="text-sm font-medium text-foreground">Vehicle Type (if applicable)</label><Input className="mt-1" value={expForm.vehicleType} onChange={e => setExpForm(p => ({ ...p, vehicleType: e.target.value }))} placeholder="e.g. Royal Enfield Himalayan" /></div>
              </div>

              <div className="mt-4"><label className="text-sm font-medium text-foreground">Description</label>
                <textarea className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm min-h-[80px] mt-1"
                  value={expForm.description} onChange={e => setExpForm(p => ({ ...p, description: e.target.value }))} placeholder="Describe the experience in detail..." />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                <div><label className="text-sm font-medium text-foreground">Highlights (comma-separated)</label><Input className="mt-1" value={expForm.highlights} onChange={e => setExpForm(p => ({ ...p, highlights: e.target.value }))} placeholder="Khardung La, Pangong Lake" /></div>
                <div><label className="text-sm font-medium text-foreground">Includes (comma-separated)</label><Input className="mt-1" value={expForm.includes} onChange={e => setExpForm(p => ({ ...p, includes: e.target.value }))} placeholder="Bike rental, Meals, Permits" /></div>
              </div>

              {expForm.category === "Wedding" && (
                <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div className="rounded-lg border border-primary/30 bg-primary/5 p-4 space-y-3">
                    <p className="text-sm font-bold text-foreground">💍 Wedding details</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div><label className="text-xs font-medium text-muted-foreground">Couple Names</label><Input className="mt-1" value={expForm.coupleNames} onChange={e => setExpForm(p => ({ ...p, coupleNames: e.target.value }))} placeholder="Aarav & Diya" /></div>
                      <div><label className="text-xs font-medium text-muted-foreground">Wedding Date</label><Input type="date" className="mt-1" value={expForm.weddingDate} onChange={e => setExpForm(p => ({ ...p, weddingDate: e.target.value }))} /></div>
                      <div className="sm:col-span-2"><label className="text-xs font-medium text-muted-foreground">Venue</label><Input className="mt-1" value={expForm.venue} onChange={e => setExpForm(p => ({ ...p, venue: e.target.value }))} placeholder="e.g. Umaid Bhawan Palace, Jodhpur" /></div>
                      <div className="sm:col-span-2"><label className="text-xs font-medium text-muted-foreground">Wedding Highlights (comma-separated)</label><Input className="mt-1" value={expForm.weddingHighlights} onChange={e => setExpForm(p => ({ ...p, weddingHighlights: e.target.value }))} placeholder="Mehendi, Sangeet, Baraat, Reception" /></div>
                    </div>
                  </div>

                  {/* Live preview card — mirrors traveler-facing ExperienceCard */}
                  <div className="rounded-lg border border-dashed border-primary/40 bg-card p-4">
                    <p className="text-xs uppercase tracking-wider font-bold text-muted-foreground mb-2">👁 Traveler preview</p>
                    <div className="relative overflow-hidden rounded-lg shadow-card">
                      <div className="aspect-[4/3] overflow-hidden bg-secondary">
                        {expForm.imageUrl
                          ? <img src={expForm.imageUrl} alt="preview" className="h-full w-full object-cover" />
                          : <div className="h-full w-full flex items-center justify-center text-muted-foreground text-xs">Add an image to preview</div>}
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-foreground/20 to-transparent" />
                      <div className="absolute bottom-0 left-0 right-0 p-3">
                        <span className="inline-block text-[10px] uppercase tracking-wider font-bold text-primary-foreground bg-primary/80 px-2 py-0.5 rounded-sm mb-1">
                          💍 Wedding
                        </span>
                        <h3 className="text-base font-semibold text-primary-foreground line-clamp-1">
                          {expForm.title || "Wedding Experience Title"}
                        </h3>
                        {expForm.coupleNames && (
                          <p className="text-xs text-primary-foreground/90 mt-0.5">{expForm.coupleNames}</p>
                        )}
                        <div className="flex items-center justify-between text-[11px] text-primary-foreground/80 mt-1 gap-2">
                          {expForm.weddingDate && (
                            <span>📅 {new Date(expForm.weddingDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>
                          )}
                          {expForm.venue && <span className="truncate">📍 {expForm.venue}</span>}
                        </div>
                      </div>
                    </div>
                    {expForm.weddingHighlights && (
                      <div className="mt-3">
                        <p className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground">Highlights</p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {expForm.weddingHighlights.split(",").map(s => s.trim()).filter(Boolean).map(h => (
                            <span key={h} className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full">{h}</span>
                          ))}
                        </div>
                      </div>
                    )}
                    <p className="mt-3 text-[11px] text-muted-foreground">
                      Updates live as you edit — this is exactly how travelers will see your wedding card.
                    </p>
                  </div>
                </div>
              )}

              <div className="mt-4 rounded-lg bg-secondary/50 p-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="w-4 h-4 accent-primary" checked={expForm.isYearRound} onChange={e => setExpForm(p => ({ ...p, isYearRound: e.target.checked }))} />
                  <span className="text-sm font-medium text-foreground">Year-round availability (12 months open)</span>
                </label>
                {!expForm.isYearRound && (
                  <div className="grid grid-cols-3 gap-3 mt-3">
                    <div><label className="text-xs text-muted-foreground">Valid From</label><Input type="date" className="mt-1" value={expForm.validFrom} onChange={e => setExpForm(p => ({ ...p, validFrom: e.target.value }))} /></div>
                    <div><label className="text-xs text-muted-foreground">Valid To</label><Input type="date" className="mt-1" value={expForm.validTo} onChange={e => setExpForm(p => ({ ...p, validTo: e.target.value }))} /></div>
                    <div><label className="text-xs text-muted-foreground">Last Booking Date</label><Input type="date" className="mt-1" value={expForm.lastBookingDate} onChange={e => setExpForm(p => ({ ...p, lastBookingDate: e.target.value }))} /></div>
                  </div>
                )}
              </div>

              <Button className="mt-4 rounded-full gap-2" onClick={addExperience} disabled={submittingExp}>
                {submittingExp ? "Saving..." : <><Save className="w-4 h-4" /> Publish Experience</>}
              </Button>
              </>}
            </div>

            <div className="rounded-2xl border-2 border-dashed border-primary/30 bg-primary/5 p-6">
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <div>
                  <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                    <FileText className="w-5 h-5 text-primary" /> Request New Experience Type
                  </h2>
                  <p className="text-sm text-muted-foreground mt-1">Got an idea for a new offering — like Spiritual Tour, Heritage Walk, or Tribal Art Workshop? Pitch it to admin to add as a platform-wide category.</p>
                </div>
                <Button variant="outline" onClick={() => { setShowReqForm(s => !s); if (!showReqForm) setShowExpForm(false); }} className="rounded-full gap-2">
                  <Plus className="w-4 h-4" /> {showReqForm ? "Hide Form" : "Request Type"}
                </Button>
              </div>

              {showReqForm && user && (
                <div className="mt-5 space-y-4">
                  <ListingForm module="specialRequest" userId={user.id} onCancel={() => setShowReqForm(false)} onSave={async (listing) => {
                    const payload: TablesInsert<"experience_requests"> = {
                      host_id: user.id, title: String(listing.title), category: String(listing.category),
                      description: String(listing.description), location: hostProfile.city || "TBD",
                      price: Number(listing.price) || 0, image_url: String(listing.imageUrl || "") || null,
                      template_data: JSON.parse(JSON.stringify({ gallery: listing.images, price_type: listing.priceType, includes: listing.includes, availability: listing.availability })),
                    };
                    const { error } = await supabase.from("experience_requests").insert(payload);
                    if (error) { toast({ title: "Unable to send request", description: error.message, variant: "destructive" }); return; }
                    setShowReqForm(false); toast({ title: "Request sent to admin" });
                  }} />
                  {false && <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div><label className="text-sm font-medium text-foreground">Proposed Name *</label><Input className="mt-1" value={reqForm.title} onChange={e => setReqForm(p => ({ ...p, title: e.target.value }))} placeholder="e.g. Spiritual Retreat Tour" /></div>
                    <div><label className="text-sm font-medium text-foreground">Suggested Category *</label><Input className="mt-1" value={reqForm.category} onChange={e => setReqForm(p => ({ ...p, category: e.target.value }))} placeholder="e.g. Spiritual" /></div>
                  </div>
                  <div><label className="text-sm font-medium text-foreground">Describe the experience</label>
                    <textarea className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm min-h-[70px] mt-1"
                      value={reqForm.description} onChange={e => setReqForm(p => ({ ...p, description: e.target.value }))} placeholder="What does it involve? Who is it for?" />
                  </div>
                  <div><label className="text-sm font-medium text-foreground">Why should we add this?</label>
                    <textarea className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm min-h-[60px] mt-1"
                      value={reqForm.reason} onChange={e => setReqForm(p => ({ ...p, reason: e.target.value }))} placeholder="Demand, uniqueness, your expertise..." />
                  </div>
                  <Button onClick={submitNewTypeRequest} disabled={submittingReq} className="rounded-full gap-2">
                    {submittingReq ? "Sending..." : <><FileText className="w-4 h-4" /> Send to Admin</>}
                  </Button></>}
                </div>
              )}
            </div>

            {expRequests.length > 0 && (
              <div>
                <h3 className="text-lg font-bold text-foreground mb-3">Your Experience Requests</h3>
                <div className="space-y-3">
                  {expRequests.map(req => (
                    <div key={req.id} className="rounded-lg bg-card p-4 shadow-card flex justify-between items-center">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold text-foreground">{req.title}</h4>
                          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                            req.status === "approved" ? "bg-accent/10 text-accent" : req.status === "rejected" ? "bg-destructive/10 text-destructive" : "bg-primary/10 text-primary"
                          }`}>{req.status}</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">{req.category} · {req.location} · ₹{req.price}</p>
                      </div>
                      <p className="text-xs text-muted-foreground">{new Date(req.created_at).toLocaleDateString()}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === "listings" && (
          <div className="mt-6 space-y-6">
            <div className="flex items-center justify-between"><h2 className="text-xl font-bold text-foreground">Properties & Vehicles</h2></div>
            {listingEditor && user && (listingEditor.module === "property" || listingEditor.module === "transport") && (
              <ListingForm module={listingEditor.module} userId={user.id}
                 initialData={listingEditor.index === undefined ? undefined : listingEditor.module === "property" ? customProperties[listingEditor.index] : customVehicles[listingEditor.index]}
                 onCancel={() => setListingEditor(null)} onSave={async (listing) => {
                  const target = listingEditor;
                   const existing = target.index === undefined ? null : target.module === "property" ? customProperties[target.index] : customVehicles[target.index];
                   const tags = (value: unknown) => String(value || "").split(",").map(v => v.trim()).filter(Boolean);
                   const query = target.module === "property"
                     ? supabase.from("host_properties").upsert({ ...(existing?.id ? { id: existing.id } : {}), host_id: user.id, property_name: String(listing.propertyName), property_type: String(listing.propertyType), description: String(listing.description), location: String(listing.location), amenities: tags(listing.amenities), house_rules: String(listing.houseRules || ""), nightly_rate: Number(listing.nightlyRate), weekly_rate: Number(listing.weeklyRate), max_guests: Number(listing.maxGuests), check_in: listing.checkIn ? String(listing.checkIn) : null, check_out: listing.checkOut ? String(listing.checkOut) : null, availability: String(listing.availability || ""), photos: Array.isArray(listing.images) ? listing.images as string[] : [] }).select().single()
                     : supabase.from("host_transports").upsert({ ...(existing?.id ? { id: existing.id } : {}), host_id: user.id, vehicle_type: String(listing.type), model: String(listing.model), description: String(listing.description), capacity: Number(listing.capacity), price_per_day: Number(listing.pricePerDay), price_per_km: Number(listing.pricePerKm), service_radius_km: Number(listing.serviceRadius), amenities: tags(listing.amenities), availability: String(listing.availability || ""), photos: Array.isArray(listing.images) ? listing.images as string[] : [] }).select().single();
                   const { error } = await query;
                   if (error) { toast({ title: "Unable to save listing", description: error.message, variant: "destructive" }); return; }
                  setListingEditor(null); toast({ title: `${target.module === "property" ? "Property" : "Transport"} saved` });
                }} />
            )}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-foreground flex items-center gap-2"><Home className="w-4 h-4 text-primary" /> Properties</h3>
                <Button size="sm" className="rounded-full gap-1 text-xs" onClick={() => setListingEditor({ module: "property" })}><Plus className="w-3 h-3" /> Add</Button>
              </div>
              {customProperties.map((prop, i) => (
                <div key={i} className="rounded-lg bg-card p-5 shadow-card mb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Home className="w-5 h-5 text-primary" />
                      <h4 className="font-bold text-foreground">{prop.propertyName}</h4>
                      <span className="text-xs bg-accent/10 text-accent px-2 py-0.5 rounded-full">{prop.propertyType}</span>
                    </div>
                    <Button variant="outline" size="sm" className="rounded-full text-xs" onClick={() => setListingEditor({ module: "property", index: i })}>Edit</Button>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">{prop.description}</p>
                </div>
              ))}
              {customProperties.length === 0 && <p className="text-sm text-muted-foreground py-6 text-center">No properties added yet.</p>}
            </div>
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-foreground flex items-center gap-2"><Car className="w-4 h-4 text-primary" /> Vehicles</h3>
                <Button size="sm" className="rounded-full gap-1 text-xs" onClick={() => setListingEditor({ module: "transport" })}><Plus className="w-3 h-3" /> Add</Button>
              </div>
              {allVehicles.map((v, i) => (
                <div key={i} className="rounded-lg bg-card p-4 shadow-card mb-2 flex justify-between items-start gap-3">
                  <div className="min-w-0">
                    <p className="font-medium text-foreground">{v.model} <span className="text-xs bg-secondary text-muted-foreground px-2 py-0.5 rounded-full ml-1">{v.type}</span></p>
                    <p className="text-xs text-muted-foreground">{v.capacity} pax · ₹{v.pricePerDay}/day{v.pricePerKm ? ` · ₹${v.pricePerKm}/km` : ""}</p>
                    {String(v.amenities || "").trim() && (
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {String(v.amenities).split(",").map((a: string) => a.trim()).filter(Boolean).map((a: string) => (
                          <span key={a} className="rounded-full bg-secondary px-2 py-0.5 text-[11px] text-muted-foreground">{a}</span>
                        ))}
                      </div>
                    )}
                  </div>
                  <Button variant="outline" size="sm" className="rounded-full text-xs" onClick={() => setListingEditor({ module: "transport", index: i })}>Edit</Button>
                </div>
              ))}
              {allVehicles.length === 0 && <p className="text-sm text-muted-foreground py-6 text-center">No vehicles added yet.</p>}
            </div>
          </div>
        )}

        {activeTab === "food" && (
          <div className="mt-6 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-foreground">Food Menu</h2>
              <Button size="sm" className="rounded-full gap-1 text-xs" onClick={() => setListingEditor({ module: "dish" })}><Plus className="w-3 h-3" /> Add Dish</Button>
            </div>
            {listingEditor?.module === "dish" && user && <ListingForm module="dish" userId={user.id} initialData={listingEditor.index === undefined ? undefined : customDishes[listingEditor.index]} onCancel={() => setListingEditor(null)} onSave={async (listing) => { const existing = listingEditor.index === undefined ? null : customDishes[listingEditor.index]; const tags = String(listing.dietaryTags || "").split(",").map(v => v.trim()).filter(Boolean); const { error } = await supabase.from("host_dishes").upsert({ ...(existing?.id ? { id: existing.id } : {}), host_id: user.id, name: String(listing.name), description: String(listing.description), cuisine: String(listing.cuisine), meal_type: String(listing.mealType), dietary_tags: tags, serves: Number(listing.serves), prep_time: String(listing.prepTime || ""), price_per_plate: Number(listing.pricePerPlate), allergen_notes: String(listing.allergenNotes || ""), availability: String(listing.availability || ""), photos: Array.isArray(listing.images) ? listing.images as string[] : [] }).select().single(); if (error) { toast({ title: "Unable to save dish", description: error.message, variant: "destructive" }); return; } setListingEditor(null); toast({ title: "Dish saved" }); }} />}
            {customDishes.map((dish, i) => (
              <div key={i} className="rounded-lg bg-card p-4 shadow-card flex justify-between items-center">
                <div>
                  <h4 className="font-semibold text-foreground">{dish.name}</h4>
                  <p className="text-sm text-muted-foreground">
                    {[dish.cuisine, dish.mealType].filter(Boolean).join(" · ")}
                    {dish.pricePerPlate || dish.price ? ` · ₹${dish.pricePerPlate ?? dish.price}/plate` : ""}
                  </p>
                </div>
                <Button variant="outline" size="sm" className="rounded-full text-xs" onClick={() => setListingEditor({ module: "dish", index: i })}>Edit</Button>
              </div>
            ))}
            {customDishes.length === 0 && <p className="text-muted-foreground text-center py-8">No dishes yet.</p>}
          </div>
        )}

        {activeTab === "reviews" && (
          <div className="mt-6 space-y-4">
            <h2 className="text-xl font-bold text-foreground mb-4">Your Reviews ({hostDbReviews.length})</h2>
            {hostDbReviews.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No reviews yet. Reviews from travelers will appear here.</p>
            ) : hostDbReviews.map(r => (
              <div key={r.id} className="rounded-lg bg-card p-4 shadow-card">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-xs font-bold text-foreground">✦</div>
                  <div>
                    <p className="text-sm font-medium text-foreground">Traveler Review</p>
                    <div className="flex gap-0.5">{Array.from({ length: r.rating }).map((_, j) => <Star key={j} className="w-3 h-3 fill-primary text-primary" />)}</div>
                  </div>
                  {r.has_video && <span className="text-xs bg-accent/10 text-accent px-2 py-0.5 rounded-full ml-auto">📹 Video</span>}
                </div>
                <p className="mt-2 text-sm text-muted-foreground">{r.text}</p>
                <p className="text-xs text-muted-foreground mt-1">{new Date(r.created_at).toLocaleDateString()}</p>
              </div>
            ))}
          </div>
        )}

        {activeTab === "earnings" && (() => {
          const commissionRate = 0.15;
          const now = new Date();
          const thisMonth = hostBookings.filter((b: any) => {
            const d = new Date(b.created_at); return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
          });
          const paidBookings = hostBookings.filter((b: any) => b.status === "confirmed" || b.status === "completed");
          const pendingBookings = hostBookings.filter((b: any) => b.status === "pending");
          const monthTotal = thisMonth.reduce((s: number, b: any) => s + Number(b.total_price || 0), 0);
          const pendingTotal = pendingBookings.reduce((s: number, b: any) => s + Number(b.total_price || 0), 0);
          const netEarnings = totalEarnings * (1 - commissionRate);
          const commissionTotal = totalEarnings * commissionRate;
          return (
            <div className="mt-6 space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="rounded-lg bg-card p-5 shadow-card"><p className="text-xs text-muted-foreground uppercase">Gross Earned</p><p className="text-2xl font-bold text-foreground mt-1">₹{totalEarnings.toLocaleString()}</p></div>
                <div className="rounded-lg bg-card p-5 shadow-card"><p className="text-xs text-muted-foreground uppercase">Net Payout (85%)</p><p className="text-2xl font-bold text-accent mt-1">₹{Math.round(netEarnings).toLocaleString()}</p></div>
                <div className="rounded-lg bg-card p-5 shadow-card"><p className="text-xs text-muted-foreground uppercase">Platform Fee (15%)</p><p className="text-2xl font-bold text-primary mt-1">₹{Math.round(commissionTotal).toLocaleString()}</p></div>
                <div className="rounded-lg bg-card p-5 shadow-card"><p className="text-xs text-muted-foreground uppercase">Pending</p><p className="text-2xl font-bold text-muted-foreground mt-1">₹{Math.round(pendingTotal).toLocaleString()}</p></div>
              </div>

              <div className="rounded-lg bg-card shadow-card overflow-hidden">
                <div className="px-5 py-3 border-b border-border flex items-center justify-between">
                  <h3 className="font-bold text-foreground">Payout History</h3>
                  <span className="text-xs text-muted-foreground">{paidBookings.length} bookings · This month: ₹{Math.round(monthTotal).toLocaleString()}</span>
                </div>
                {hostBookings.length === 0 ? (
                  <div className="text-center py-12 text-sm text-muted-foreground">No booking earnings yet.</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-secondary/40 text-xs uppercase text-muted-foreground">
                        <tr>
                          <th className="text-left px-4 py-2">Booking Ref</th>
                          <th className="text-left px-4 py-2">Date</th>
                          <th className="text-left px-4 py-2">Status</th>
                          <th className="text-right px-4 py-2">Gross</th>
                          <th className="text-right px-4 py-2">Fee (15%)</th>
                          <th className="text-right px-4 py-2">Net Payout</th>
                        </tr>
                      </thead>
                      <tbody>
                        {hostBookings.map((b: any) => {
                          const gross = Number(b.total_price || 0);
                          const fee = gross * commissionRate;
                          const net = gross - fee;
                          return (
                            <tr key={b.id} className="border-t border-border">
                              <td className="px-4 py-2 font-mono text-xs">#{b.id.slice(0, 8)}</td>
                              <td className="px-4 py-2 text-muted-foreground">{new Date(b.created_at).toLocaleDateString()}</td>
                              <td className="px-4 py-2">
                                <span className={`text-xs px-2 py-0.5 rounded-full ${statusColors[b.status] || "bg-secondary text-muted-foreground"}`}>{b.status}</span>
                              </td>
                              <td className="px-4 py-2 text-right">₹{gross.toLocaleString()}</td>
                              <td className="px-4 py-2 text-right text-muted-foreground">-₹{Math.round(fee).toLocaleString()}</td>
                              <td className="px-4 py-2 text-right font-semibold text-accent">₹{Math.round(net).toLocaleString()}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                      <tfoot className="bg-secondary/20 font-semibold">
                        <tr>
                          <td className="px-4 py-2" colSpan={3}>Total</td>
                          <td className="px-4 py-2 text-right">₹{totalEarnings.toLocaleString()}</td>
                          <td className="px-4 py-2 text-right text-muted-foreground">-₹{Math.round(commissionTotal).toLocaleString()}</td>
                          <td className="px-4 py-2 text-right text-accent">₹{Math.round(netEarnings).toLocaleString()}</td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                )}
              </div>
            </div>
          );
        })()}

        {/* Invoices */}
        {activeTab === "invoices" && (
          <div className="mt-6">
            <h2 className="text-xl font-bold text-foreground mb-4">Invoices ({hostInvoices.length})</h2>
            {hostInvoices.length === 0 ? (
              <div className="text-center py-12">
                <Receipt className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-muted-foreground">No invoices yet. Generate invoices from confirmed bookings.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {hostInvoices.map(inv => (
                  <div key={inv.id} className="rounded-lg bg-card p-4 shadow-card flex justify-between items-center">
                    <div>
                      <div className="flex items-center gap-2">
                        <Receipt className="w-4 h-4 text-primary" />
                        <h3 className="font-semibold text-foreground">{inv.invoice_number}</h3>
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                          inv.status === "paid" ? "bg-accent/10 text-accent" : inv.status === "unpaid" ? "bg-destructive/10 text-destructive" : "bg-primary/10 text-primary"
                        }`}>{inv.status}</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">{inv.currency} {inv.total_amount} (incl. tax {inv.currency} {inv.tax_amount})</p>
                      <p className="text-xs text-muted-foreground">Issued: {new Date(inv.issued_at).toLocaleDateString()}</p>
                    </div>
                    <p className="text-lg font-bold text-foreground">{inv.currency} {inv.total_amount}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}


        {activeTab === "messages" && user && (
          <HostMessageThreads userId={user.id} initialThread={searchParams.get("thread")} />
        )}

        {activeTab === "reels" && user && (
          <div className="mt-6">
            <HostReelsManager userId={user.id} />
          </div>
        )}

        {activeTab === "settings" && (
          <div className="mt-6 space-y-6 max-w-xl">
            <h2 className="text-xl font-bold text-foreground">Host Settings</h2>
            {/* Sub-tabs keep the long settings form scannable */}
            <div className="flex flex-wrap gap-2">
              {([
                { id: "profile", label: "Profile" },
                { id: "media", label: "Media & public page" },
                { id: "social", label: "Social" },
                { id: "preferences", label: "Preferences" },
              ] as const).map(section => (
                <button key={section.id} onClick={() => setSettingsSection(section.id)}
                  className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${settingsSection === section.id ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground hover:bg-secondary/80"}`}>
                  {section.label}
                </button>
              ))}
            </div>
            <div className={`rounded-lg bg-card p-5 shadow-card space-y-4 ${settingsSection === "profile" ? "" : "hidden"}`}>
              <h3 className="font-bold text-foreground flex items-center gap-2"><Settings className="w-4 h-4 text-primary" /> Profile</h3>
              <div className="flex items-center gap-4 mb-2">
                <ImageUpload
                  bucket="avatars"
                  crop
                  folder={user?.id || "anon"}
                  currentUrl={hostDbProfile?.avatar_url}
                  onUpload={async (url) => {
                    if (!user) return;
                    const { error } = await supabase.from("profiles").upsert(
                      { id: user.id, avatar_url: url },
                      { onConflict: "id" }
                    );
                    if (error) {
                      toast({ title: "Couldn't save avatar", description: error.message, variant: "destructive" });
                      return;
                    }
                    setHostDbProfile((p: any) => ({ ...(p || {}), avatar_url: url }));
                  }}
                  className="w-20 h-20"
                  shape="circle"
                />
                <div>
                  <p className="text-sm font-medium text-foreground">Profile Photo</p>
                  <p className="text-xs text-muted-foreground">Click to upload (max 5MB)</p>
                </div>
              </div>
              <div className="space-y-3">
                 <div><label className="text-sm font-medium text-foreground">Name</label><Input value={hostProfile.name} onChange={e => setHostProfile(p => ({ ...p, name: e.target.value }))} placeholder="Your full name" /></div>
                 <div><label className="text-sm font-medium text-foreground">Public username</label><Input value={hostProfile.username} onChange={e => setHostProfile(p => ({ ...p, username: e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, "") }))} placeholder="your-name" minLength={3} maxLength={30} /></div>
                 <TagField label="Services offered" values={hostProfile.services} suggestions={["Guide", "Stay", "Transport", "Food"]} onChange={services => setHostProfile(p => ({ ...p, services }))} />
                 <TagField label="Specialties" values={hostProfile.specialties} suggestions={["Adventure", "Culture", "Food", "Wellness", "Photography", "Local Guide"]} onChange={specialties => setHostProfile(p => ({ ...p, specialties }))} />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div><label className="text-sm font-medium text-foreground">City</label><Input value={hostProfile.city} onChange={e => setHostProfile(p => ({ ...p, city: e.target.value }))} placeholder="e.g. Jaipur" /></div>
                  <div><label className="text-sm font-medium text-foreground">Tagline</label><Input value={hostProfile.tagline} onChange={e => setHostProfile(p => ({ ...p, tagline: e.target.value }))} placeholder="One line about your hosting" /></div>
                </div>
                 <TagField label="Languages spoken" values={hostProfile.languages} suggestions={["English", "Hindi", "Punjabi", "Bengali", "Tamil", "Marathi", "Spanish", "French"]} onChange={languages => setHostProfile(p => ({ ...p, languages }))} />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div><label className="text-sm font-medium text-foreground">Typical response time</label><Input value={hostProfile.responseTime} onChange={e => setHostProfile(p => ({ ...p, responseTime: e.target.value }))} placeholder="e.g. within 2 hours" /></div>
                  <div><label className="text-sm font-medium text-foreground">Years hosting</label><Input type="number" min={0} value={hostProfile.yearsHosting} onChange={e => setHostProfile(p => ({ ...p, yearsHosting: Number(e.target.value) }))} /></div>
                </div>
                <div><label className="text-sm font-medium text-foreground">Bio</label>
                  <textarea className="mt-1 flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm min-h-[80px]"
                    value={hostProfile.bio} onChange={e => setHostProfile(p => ({ ...p, bio: e.target.value }))} placeholder="Tell travelers who you are" /></div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div><label className="text-sm font-medium text-foreground">Price/Day (₹)</label><Input type="number" min={0} value={hostProfile.pricePerDay} onChange={e => setHostProfile(p => ({ ...p, pricePerDay: Number(e.target.value) }))} /></div>
                  <div><label className="text-sm font-medium text-foreground">Cancellation policy</label>
                    <select className="mt-1 flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                      value={pricing.cancellationPolicy} onChange={e => setPricing(p => ({ ...p, cancellationPolicy: e.target.value }))}>
                      <option value="flexible">Flexible</option>
                      <option value="moderate">Moderate</option>
                      <option value="strict">Strict</option>
                    </select>
                  </div>
                </div>
              </div>
              <Button size="sm" className="rounded-full gap-2" onClick={async () => {
                if (!user) return;
                const names = hostProfile.name.trim().split(" ");
                const { error } = await supabase.from("profiles").upsert({
                  id: user.id,
                  first_name: names[0] || "",
                  last_name: names.slice(1).join(" ") || "",
                   username: hostProfile.username || null,
                   city: hostProfile.city,
                   tagline: hostProfile.tagline,
                  bio: hostProfile.bio,
                   services: hostProfile.services,
                   specialties: hostProfile.specialties,
                   languages: hostProfile.languages,
                   response_time: hostProfile.responseTime || null,
                   years_hosting: hostProfile.yearsHosting || 0,
                   price_per_day: hostProfile.pricePerDay,
                }, { onConflict: "id" });
                if (error) { toast({ title: "Couldn't save profile", description: error.message, variant: "destructive" }); return; }
                toast({ title: "Profile saved ✅" });
              }}><Save className="w-4 h-4" /> Save profile</Button>
            </div>

            <div className={`rounded-lg bg-card p-5 shadow-card space-y-3 ${settingsSection === "media" ? "" : "hidden"}`}>
              <h3 className="font-bold text-foreground flex items-center gap-2"><Tag className="w-4 h-4 text-primary" /> Cover photo</h3>
              <p className="text-sm text-muted-foreground">Shown as the banner on your public host page.</p>
              <ImageUpload
                bucket="trip-images"
                folder={user?.id || "anon"}
                currentUrl={hostDbProfile?.cover_url}
                onUpload={async (url) => {
                  if (!user) return;
                  const { error } = await supabase.from("profiles").upsert({ id: user.id, cover_url: url || null }, { onConflict: "id" });
                  if (error) { toast({ title: "Couldn't save cover", description: error.message, variant: "destructive" }); return; }
                  setHostDbProfile((p: any) => ({ ...(p || {}), cover_url: url || null }));
                }}
                className="h-32 w-full"
              />
            </div>

            <div className={`rounded-lg bg-card p-5 shadow-card space-y-3 ${settingsSection === "media" ? "" : "hidden"}`}>
              <h3 className="font-bold text-foreground flex items-center gap-2"><Heart className="w-4 h-4 text-primary" /> Reels &amp; Stories</h3>
              <p className="text-sm text-muted-foreground">Posts you share on the feed appear in the Reels &amp; Stories section of your public host page.</p>
              <Button size="sm" variant="outline" className="rounded-full gap-2 text-xs" onClick={() => setActiveTab("reels")}>
                <Plus className="w-3.5 h-3.5" /> Manage reels &amp; stories
              </Button>
            </div>

            <div className={`rounded-lg bg-card p-5 shadow-card space-y-3 ${settingsSection === "media" ? "" : "hidden"}`}>
              <h3 className="font-bold text-foreground flex items-center gap-2"><Eye className="w-4 h-4 text-primary" /> Public page</h3>
              <p className="text-sm text-muted-foreground">This is what travelers see. Share it to get direct bookings.</p>
              <div className="flex items-center gap-2 rounded-md border border-border bg-secondary/30 px-3 py-2">
                <code className="flex-1 truncate text-xs text-muted-foreground">{publicProfileUrl || "Sign in to get your link"}</code>
                <Button size="sm" variant="ghost" className="h-8 gap-1 text-xs" onClick={copyPublicLink}><Copy className="w-3.5 h-3.5" /> Copy</Button>
              </div>
              <Button asChild size="sm" variant="outline" className="rounded-full gap-2 text-xs">
                 <Link to={`/host/${publicProfilePath}`} target="_blank" rel="noreferrer"><Eye className="w-3.5 h-3.5" /> Open public preview</Link>
              </Button>
            </div>

            <div className={`rounded-lg bg-card p-5 shadow-card space-y-4 ${settingsSection === "social" ? "" : "hidden"}`}>
              <h3 className="font-bold text-foreground flex items-center gap-2"><Globe className="w-4 h-4 text-primary" /> Social profiles</h3>
              <div className="space-y-3">
                {([
                  { key: "instagram", label: "Instagram", Icon: Instagram },
                  { key: "facebook", label: "Facebook", Icon: Facebook },
                  { key: "twitter", label: "X (Twitter)", Icon: Twitter },
                  { key: "youtube", label: "YouTube", Icon: Youtube },
                  { key: "snapchat", label: "Snapchat", Icon: Ghost },
                  { key: "linkedin", label: "LinkedIn", Icon: Linkedin },
                  { key: "whatsapp", label: "WhatsApp", Icon: Phone },
                  { key: "website", label: "Website", Icon: Globe },
                ] as const).map(({ key, label, Icon }) => (
                  <div key={key} className="flex items-center gap-2">
                    <Icon className="w-4 h-4 shrink-0 text-muted-foreground" />
                    <Input placeholder={`${label} link or handle`} aria-label={label}
                      value={(socialMedia as Record<string, string>)[key] ?? ""}
                      onChange={e => setSocialMedia(p => ({ ...p, [key]: e.target.value }))} />
                  </div>
                ))}
              </div>
              <Button size="sm" className="rounded-full gap-2" onClick={async () => {
                if (!user) return;
                const { error } = await supabase.from("profiles").upsert(
                  { id: user.id, social_links: socialMedia },
                  { onConflict: "id" }
                );
                if (error) { toast({ title: "Couldn't save socials", description: error.message, variant: "destructive" }); return; }
                toast({ title: "Social links saved ✅" });
              }}><Save className="w-4 h-4" /> Save socials</Button>
            </div>

            <div className={`rounded-lg bg-card p-5 shadow-card space-y-4 ${settingsSection === "preferences" ? "" : "hidden"}`}>
              <h3 className="font-bold text-foreground flex items-center gap-2"><Bell className="w-4 h-4 text-primary" /> Notifications & visibility</h3>
              <div className="space-y-1">
                {([
                  { key: "emailBookings", label: "Email me on new booking requests" },
                  { key: "emailMessages", label: "Email me on new traveler messages" },
                  { key: "emailPayouts", label: "Email me payout and invoice updates" },
                  { key: "instantBook", label: "Allow instant booking without approval" },
                  { key: "publicProfile", label: "Show my profile in public host directory" },
                  { key: "showPhone", label: "Show my phone number to confirmed guests" },
                ] as const).map(({ key, label }) => (
                  <label key={key} className="flex items-center justify-between gap-3 rounded-md px-1 py-2 cursor-pointer hover:bg-secondary/40">
                    <span className="text-sm text-foreground">{label}</span>
                    <input type="checkbox" className="h-4 w-4 accent-primary"
                      checked={Boolean((notifPrefs as Record<string, boolean>)[key])}
                      onChange={e => setNotifPrefs(p => ({ ...p, [key]: e.target.checked }))} />
                  </label>
                ))}
              </div>
               <Button size="sm" className="rounded-full gap-2" onClick={async () => { if (!user) return; const { error } = await supabase.from("profiles").update({ is_public: notifPrefs.publicProfile }).eq("id", user.id); if (error) toast({ title: "Couldn't save visibility", description: error.message, variant: "destructive" }); else toast({ title: "Preferences saved ✅" }); }}><Save className="w-4 h-4" /> Save preferences</Button>
            </div>
          </div>
        )}
        </div>
      </div>

      <BookingDetailDialog
        booking={openBooking}
        onOpenChange={(open) => { if (!open) setOpenBooking(null); }}
        onStatus={(id, status) => { void updateBookingStatus(id, status); setOpenBooking(null); }}
        onInvoice={(booking) => { void generateInvoice(booking); setOpenBooking(null); }}
        onChat={() => { setOpenBooking(null); setActiveTab("messages"); }}
      />

      <EditDialog open={editDialog.open} title={editDialog.title} fields={editDialog.fields}
        initialData={editDialog.data} onSave={(d) => { editDialog.onSave(d); setEditDialog(p => ({ ...p, open: false })); }}
        onDelete={editDialog.onDelete ? () => { editDialog.onDelete!(); setEditDialog(p => ({ ...p, open: false })); } : undefined}
        onClose={() => setEditDialog(p => ({ ...p, open: false }))} />
      <Footer />
    </div>
  );
};

export default HostDashboard;

function TagField({ label, values, suggestions, onChange }: { label: string; values: string[]; suggestions: string[]; onChange: (values: string[]) => void }) {
  return <div><label className="text-sm font-medium text-foreground">{label}</label><div className="mt-2 flex flex-wrap gap-2">{suggestions.map(value => <Button key={value} type="button" size="sm" variant={values.includes(value) ? "default" : "outline"} className="h-8 rounded-full text-xs" onClick={() => onChange(values.includes(value) ? values.filter(item => item !== value) : [...values, value])}>{value}</Button>)}{values.filter(value => !suggestions.includes(value)).map(value => <Button key={value} type="button" size="sm" variant="secondary" className="h-8 rounded-full text-xs" onClick={() => onChange(values.filter(item => item !== value))}>{value} ×</Button>)}</div><Input className="mt-2" placeholder="Type a custom tag and press Enter" onKeyDown={event => { if (event.key !== "Enter") return; event.preventDefault(); const value = event.currentTarget.value.trim(); if (value && !values.includes(value)) onChange([...values, value]); event.currentTarget.value = ""; }} /></div>;
}
