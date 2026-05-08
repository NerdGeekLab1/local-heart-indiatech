import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
  DollarSign, Users, Star, Calendar, Clock, TrendingUp, MessageCircle, Settings, Home, Car, BarChart3,
  Bell, UtensilsCrossed, Plus, Save, Instagram, Facebook, Twitter, Globe, Tag, Bike, MapPin, FileText, Receipt, Heart
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { hosts, reviews, experiences, propertyTypes, vehicleTypes } from "@/lib/data";
import { useLocalStorage } from "@/hooks/use-local-storage";
import EditDialog, { FieldConfig } from "@/components/EditDialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import ImageUpload from "@/components/ImageUpload";

const host = hosts[0];
const hostReviews = reviews.filter(r => r.hostId === host.id);
const hostExperiences = experiences.filter(e => e.hostId === host.id);

const statusColors: Record<string, string> = {
  pending: "bg-primary/10 text-primary", confirmed: "bg-accent/10 text-accent",
  completed: "bg-secondary text-muted-foreground", cancelled: "bg-destructive/10 text-destructive",
};

type Tab = "overview" | "bookings" | "listings" | "experiences" | "food" | "reviews" | "earnings" | "invoices" | "messages" | "settings" | "weddings";

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
  const totalEarnings = hostBookings.reduce((sum: number, b: any) => sum + Number(b.total_price || 0), 0);

  const [hostProfile, setHostProfile] = useLocalStorage("host_profile", {
    name: host.name, tagline: host.tagline, bio: host.bio, city: host.city, pricePerDay: host.pricePerDay,
  });
  const [socialMedia, setSocialMedia] = useLocalStorage("host_social_media", { instagram: "", facebook: "", twitter: "", website: "" });
  const [pricing, setPricing] = useLocalStorage("host_pricing", { guidePerDay: host.pricePerDay, cancellationPolicy: "flexible", currency: "USD" });
  
  const [customExperiences, setCustomExperiences] = useLocalStorage<any[]>("host_custom_experiences", []);
  const [customVehicles, setCustomVehicles] = useLocalStorage<any[]>("host_custom_vehicles", []);
  const [customDishes, setCustomDishes] = useLocalStorage<any[]>("host_custom_dishes", host.foodInfo?.dishes || []);
  const [customProperties, setCustomProperties] = useLocalStorage<any[]>("host_custom_properties", host.stayInfo ? [host.stayInfo] : []);
  const [customRooms, setCustomRooms] = useLocalStorage<any[]>("host_custom_rooms", host.stayInfo?.rooms || []);

  const [expForm, setExpForm] = useState({
    title: "", description: "", category: "Cultural", location: "", price: 0, duration: "",
    difficulty: "Moderate", maxGuests: 10, isYearRound: true, validFrom: "", validTo: "", lastBookingDate: "",
    vehicleType: "", highlights: "", includes: "", destination: "", subCategory: "", imageUrl: "",
  });
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
    ]).then(([{ data: reqs }, { data: invs }, { data: bks }, { data: revs }, { data: msgs }, { data: prof }, { data: exps }]) => {
      setExpRequests(reqs || []);
      setHostInvoices(invs || []);
      setHostBookings(bks || []);
      setHostDbReviews(revs || []);
      setHostMessages(msgs || []);
      setHostDbExperiences(exps || []);
      if (prof) {
        setHostDbProfile(prof);
        setHostProfile(p => ({ ...p, name: `${prof.first_name} ${prof.last_name || ""}`.trim(), city: prof.nationality || p.city, bio: prof.bio || p.bio }));
      }
    });
  }, [user]);

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
    });
    setSubmittingExp(false);
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Experience request submitted! 🎉", description: "Admin will review and approve." });
    setExpForm({ title: "", description: "", category: "Cultural", location: "", price: 0, duration: "", difficulty: "Moderate", maxGuests: 10, isYearRound: true, validFrom: "", validTo: "", lastBookingDate: "", vehicleType: "", highlights: "", includes: "", destination: "", subCategory: "", imageUrl: "" });
    const { data } = await supabase.from("experience_requests").select("*").eq("host_id", user.id).order("created_at", { ascending: false });
    setExpRequests(data || []);
  };

  const [editDialog, setEditDialog] = useState<{ open: boolean; title: string; fields: FieldConfig[]; data?: any; onSave: (d: any) => void; onDelete?: () => void }>({
    open: false, title: "", fields: [], onSave: () => {},
  });

  const allExperiences = [...hostExperiences, ...customExperiences];
  const allVehicles = [...(host.transportInfo?.vehicles || []), ...customVehicles];
  
  const updateBookingStatus = async (id: string, status: string) => {
    const { error } = await supabase.from("bookings").update({ status }).eq("id", id);
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    setHostBookings(p => p.map(b => b.id === id ? { ...b, status } : b));
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

  const tabs: { id: Tab; label: string; icon: React.ElementType }[] = [
    { id: "overview", label: "Overview", icon: BarChart3 },
    { id: "bookings", label: "Bookings", icon: Calendar },
    { id: "experiences", label: "Experiences", icon: Globe },
    { id: "listings", label: "Property", icon: Home },
    { id: "food", label: "Food Menu", icon: UtensilsCrossed },
    { id: "reviews", label: "Reviews", icon: Star },
    { id: "earnings", label: "Earnings", icon: DollarSign },
    { id: "invoices", label: "Invoices", icon: Receipt },
    { id: "weddings", label: "Upcoming Weddings", icon: Heart },
    { id: "messages", label: "Messages", icon: MessageCircle },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 mx-auto max-w-6xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-4">
          <img src={host.image} alt={hostProfile.name} className="w-16 h-16 rounded-full object-cover shadow-card" />
          <div>
            <h1 className="text-3xl font-bold text-foreground">Welcome, {hostProfile.name}!</h1>
            <p className="text-muted-foreground">{hostProfile.city} · Host since 2024</p>
          </div>
        </motion.div>

        <div className="mt-6 flex gap-1 overflow-x-auto border-b border-border pb-px">
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
                { label: "Total Earnings", value: `$${totalEarnings}`, icon: DollarSign, color: "text-accent" },
                { label: "Total Bookings", value: `${hostBookings.length}`, icon: Calendar, color: "text-primary" },
                { label: "Rating", value: `${host.rating}`, icon: Star, color: "text-primary" },
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
                    <div className="flex justify-between"><span className="text-muted-foreground">Response Rate</span><span className="font-medium text-foreground">98%</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Acceptance Rate</span><span className="font-medium text-foreground">95%</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">This Month</span><span className="font-medium text-accent flex items-center gap-1"><TrendingUp className="w-3 h-3" /> +23%</span></div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {activeTab === "bookings" && (
          <div className="mt-6 space-y-3">
            <h2 className="text-xl font-bold text-foreground mb-4">All Bookings ({hostBookings.length})</h2>
            {hostBookings.length === 0 ? (
              <div className="text-center py-12">
                <Calendar className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-muted-foreground">No bookings yet.</p>
              </div>
            ) : hostBookings.map(b => (
              <div key={b.id} className="rounded-lg bg-card p-4 shadow-card flex justify-between items-center">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-foreground">#{b.id.slice(0,8)}</h3>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusColors[b.status] || statusColors.pending}`}>{b.status}</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">{b.start_date} → {b.end_date} · {(b.services || []).join(", ")} · {b.guests} guest(s)</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-foreground">₹{b.total_price}</p>
                  {b.status === "pending" && (
                    <div className="flex gap-2 mt-2">
                      <Button size="sm" onClick={() => updateBookingStatus(b.id, "confirmed")} className="rounded-full bg-accent text-accent-foreground text-xs px-3">Accept</Button>
                      <Button size="sm" variant="outline" onClick={() => updateBookingStatus(b.id, "cancelled")} className="rounded-full text-xs px-3">Decline</Button>
                    </div>
                  )}
                  {(b.status === "confirmed" || b.status === "completed") && (
                    <Button size="sm" variant="outline" onClick={() => generateInvoice(b)} className="rounded-full text-xs px-3 gap-1 mt-1">
                      <Receipt className="w-3 h-3" /> Invoice
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === "experiences" && (
          <div className="mt-6 space-y-8">
            {hostDbExperiences.length > 0 && (
              <div>
                <h2 className="text-xl font-bold text-foreground mb-4">Your Live Experiences ({hostDbExperiences.length})</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {hostDbExperiences.map(exp => (
                    <div key={exp.id} className="rounded-lg bg-card p-4 shadow-card">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <h4 className="font-semibold text-foreground truncate">{exp.title}</h4>
                          <p className="text-sm text-muted-foreground">₹{exp.price} · {exp.duration} · {exp.category}</p>
                          <span className={`inline-block mt-1 text-[10px] px-2 py-0.5 rounded-full ${exp.status === "approved" ? "bg-accent/10 text-accent" : "bg-primary/10 text-primary"}`}>
                            {exp.status}
                          </span>
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
                </div>
              </div>
            )}

            {allExperiences.length > 0 && (
              <div>
                <h2 className="text-xl font-bold text-foreground mb-4">Sample Experiences ({allExperiences.length})</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {allExperiences.map(exp => (
                    <div key={exp.id} className="rounded-lg bg-card p-4 shadow-card">
                      <h4 className="font-semibold text-foreground">{exp.title}</h4>
                      <p className="text-sm text-muted-foreground">${exp.price} · {exp.duration} · {exp.category}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="rounded-2xl bg-card p-6 shadow-card">
              <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                <Plus className="w-5 h-5 text-primary" /> Request New Experience
              </h2>
              <p className="text-sm text-muted-foreground mb-4">Submit a new experience for admin approval. Include all details for faster processing.</p>

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
                <div><label className="text-sm font-medium text-foreground">Price ($)</label><Input type="number" className="mt-1" value={expForm.price} onChange={e => setExpForm(p => ({ ...p, price: Number(e.target.value) }))} /></div>
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

              <Button className="mt-4 rounded-full gap-2" onClick={submitExperienceRequest} disabled={submittingExp}>
                {submittingExp ? "Submitting..." : <><FileText className="w-4 h-4" /> Submit for Approval</>}
              </Button>
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
                        <p className="text-xs text-muted-foreground mt-1">{req.category} · {req.location} · ${req.price}</p>
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
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-foreground flex items-center gap-2"><Home className="w-4 h-4 text-primary" /> Properties</h3>
                <Button size="sm" className="rounded-full gap-1 text-xs" onClick={() => setEditDialog({
                  open: true, title: "Add Property", fields: propertyFields,
                  onSave: (d) => { setCustomProperties(p => [...p, d]); toast({ title: "Property added!" }); },
                })}><Plus className="w-3 h-3" /> Add</Button>
              </div>
              {customProperties.map((prop, i) => (
                <div key={i} className="rounded-lg bg-card p-5 shadow-card mb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Home className="w-5 h-5 text-primary" />
                      <h4 className="font-bold text-foreground">{prop.propertyName}</h4>
                      <span className="text-xs bg-accent/10 text-accent px-2 py-0.5 rounded-full">{prop.propertyType}</span>
                    </div>
                    <Button variant="outline" size="sm" className="rounded-full text-xs" onClick={() => setEditDialog({
                      open: true, title: "Edit", fields: propertyFields, data: prop,
                      onSave: (d) => { setCustomProperties(p => p.map((x, j) => j === i ? { ...x, ...d } : x)); toast({ title: "Updated!" }); },
                    })}>Edit</Button>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">{prop.description}</p>
                </div>
              ))}
            </div>
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-foreground flex items-center gap-2"><Car className="w-4 h-4 text-primary" /> Vehicles</h3>
                <Button size="sm" className="rounded-full gap-1 text-xs" onClick={() => setEditDialog({
                  open: true, title: "Add Vehicle", fields: vehicleFields,
                  onSave: (d) => { setCustomVehicles(p => [...p, d]); toast({ title: "Vehicle added!" }); },
                })}><Plus className="w-3 h-3" /> Add</Button>
              </div>
              {allVehicles.map((v, i) => (
                <div key={i} className="rounded-lg bg-card p-4 shadow-card mb-2 flex justify-between items-center">
                  <div>
                    <p className="font-medium text-foreground">{v.model} <span className="text-xs bg-secondary text-muted-foreground px-2 py-0.5 rounded-full ml-1">{v.type}</span></p>
                    <p className="text-xs text-muted-foreground">{v.capacity} pax · ${v.pricePerDay}/day</p>
                  </div>
                  <Button variant="outline" size="sm" className="rounded-full text-xs" onClick={() => setEditDialog({
                    open: true, title: "Edit Vehicle", fields: vehicleFields, data: v,
                    onSave: (d) => { const ci = i - (host.transportInfo?.vehicles?.length || 0); if (ci >= 0) setCustomVehicles(p => p.map((x, j) => j === ci ? { ...x, ...d } : x)); toast({ title: "Updated!" }); },
                  })}>Edit</Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "food" && (
          <div className="mt-6 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-foreground">Food Menu</h2>
              <Button size="sm" className="rounded-full gap-1 text-xs" onClick={() => setEditDialog({
                open: true, title: "Add Dish", fields: dishFields,
                onSave: (d) => { setCustomDishes(p => [...p, d]); toast({ title: "Dish added!" }); },
              })}><Plus className="w-3 h-3" /> Add Dish</Button>
            </div>
            {customDishes.map((dish, i) => (
              <div key={i} className="rounded-lg bg-card p-4 shadow-card flex justify-between items-center">
                <div>
                  <h4 className="font-semibold text-foreground">{dish.name}</h4>
                  <p className="text-sm text-muted-foreground">{dish.cuisine} · ${dish.price}/person</p>
                </div>
                <Button variant="outline" size="sm" className="rounded-full text-xs" onClick={() => setEditDialog({
                  open: true, title: "Edit Dish", fields: dishFields, data: dish,
                  onSave: (d) => { setCustomDishes(p => p.map((x, j) => j === i ? { ...x, ...d } : x)); toast({ title: "Updated!" }); },
                  onDelete: () => { setCustomDishes(p => p.filter((_, j) => j !== i)); toast({ title: "Removed" }); },
                })}>Edit</Button>
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

        {activeTab === "earnings" && (
          <div className="mt-6 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="rounded-lg bg-card p-5 shadow-card"><p className="text-xs text-muted-foreground uppercase">Total Earned</p><p className="text-3xl font-bold text-foreground mt-1">${totalEarnings}</p></div>
              <div className="rounded-lg bg-card p-5 shadow-card"><p className="text-xs text-muted-foreground uppercase">This Month</p><p className="text-3xl font-bold text-accent mt-1">$270</p></div>
              <div className="rounded-lg bg-card p-5 shadow-card"><p className="text-xs text-muted-foreground uppercase">Pending</p><p className="text-3xl font-bold text-primary mt-1">$80</p></div>
            </div>
          </div>
        )}

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

        {activeTab === "weddings" && (
          <div className="mt-6"><WeddingsTab /></div>
        )}

        {activeTab === "messages" && (
          <div className="mt-6">
            <h2 className="text-xl font-bold text-foreground mb-4">Messages ({hostMessages.length})</h2>
            {hostMessages.length === 0 ? (
              <div className="text-center py-12">
                <MessageCircle className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-muted-foreground">No messages yet. Traveler inquiries will appear here.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {hostMessages.map(m => (
                  <div key={m.id} className={`rounded-lg bg-card p-4 shadow-card flex items-center gap-4 ${!m.read && m.receiver_id === user?.id ? "border-l-4 border-primary" : ""}`}>
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
                      {m.sender_id === user?.id ? "You" : "📨"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-foreground text-sm">{m.sender_id === user?.id ? "You" : "Traveler"}</p>
                      <p className="text-xs text-muted-foreground truncate">{m.content}</p>
                    </div>
                    <span className="text-xs text-muted-foreground shrink-0">{new Date(m.created_at).toLocaleDateString()}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "settings" && (
          <div className="mt-6 space-y-6 max-w-xl">
            <h2 className="text-xl font-bold text-foreground mb-4">Host Settings</h2>
            <div className="rounded-lg bg-card p-5 shadow-card space-y-4">
              <h3 className="font-bold text-foreground flex items-center gap-2"><Settings className="w-4 h-4 text-primary" /> Profile</h3>
              <div className="flex items-center gap-4 mb-2">
                <ImageUpload
                  bucket="avatars"
                  folder={user?.id || "anon"}
                  currentUrl={hostDbProfile?.avatar_url}
                  onUpload={async (url) => {
                    if (user) {
                      await supabase.from("profiles").update({ avatar_url: url }).eq("id", user.id);
                      setHostDbProfile((p: any) => ({ ...p, avatar_url: url }));
                    }
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
                <div><label className="text-sm font-medium text-foreground">Name</label><Input value={hostProfile.name} onChange={e => setHostProfile(p => ({ ...p, name: e.target.value }))} /></div>
                <div><label className="text-sm font-medium text-foreground">City</label><Input value={hostProfile.city} onChange={e => setHostProfile(p => ({ ...p, city: e.target.value }))} /></div>
                <div><label className="text-sm font-medium text-foreground">Bio</label>
                  <textarea className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm min-h-[80px]"
                    value={hostProfile.bio} onChange={e => setHostProfile(p => ({ ...p, bio: e.target.value }))} /></div>
                <div><label className="text-sm font-medium text-foreground">Price/Day ($)</label><Input type="number" value={hostProfile.pricePerDay} onChange={e => setHostProfile(p => ({ ...p, pricePerDay: Number(e.target.value) }))} /></div>
              </div>
              <Button size="sm" className="rounded-full gap-2" onClick={async () => {
                if (!user) return;
                const names = hostProfile.name.split(" ");
                await supabase.from("profiles").update({
                  first_name: names[0] || "",
                  last_name: names.slice(1).join(" ") || "",
                  bio: hostProfile.bio,
                }).eq("id", user.id);
                toast({ title: "Profile saved! ✅" });
              }}><Save className="w-4 h-4" /> Save</Button>
            </div>
            <div className="rounded-lg bg-card p-5 shadow-card space-y-4">
              <h3 className="font-bold text-foreground flex items-center gap-2"><Globe className="w-4 h-4 text-primary" /> Social</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-2"><Instagram className="w-4 h-4 text-muted-foreground" /><Input placeholder="Instagram" value={socialMedia.instagram} onChange={e => setSocialMedia(p => ({ ...p, instagram: e.target.value }))} /></div>
                <div className="flex items-center gap-2"><Facebook className="w-4 h-4 text-muted-foreground" /><Input placeholder="Facebook" value={socialMedia.facebook} onChange={e => setSocialMedia(p => ({ ...p, facebook: e.target.value }))} /></div>
              </div>
              <Button size="sm" className="rounded-full gap-2" onClick={() => toast({ title: "Saved!" })}><Save className="w-4 h-4" /> Save</Button>
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

export default HostDashboard;
