import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { DollarSign, Users, Star, Calendar, Clock, TrendingUp, MessageCircle, Settings, Home, Car, BarChart3, Bell, UtensilsCrossed, Plus, Save, Instagram, Facebook, Twitter, Globe, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { mockBookings, hosts, reviews, experiences, propertyTypes, vehicleTypes } from "@/lib/data";
import { useLocalStorage } from "@/hooks/use-local-storage";
import EditDialog, { FieldConfig } from "@/components/EditDialog";
import { useToast } from "@/hooks/use-toast";

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

type Tab = "overview" | "bookings" | "listings" | "food" | "reviews" | "earnings" | "messages" | "settings";

const profileFields: FieldConfig[] = [
  { key: "name", label: "Name", required: true },
  { key: "tagline", label: "Tagline", required: true },
  { key: "bio", label: "Bio", type: "textarea", required: true },
  { key: "city", label: "City", required: true },
  { key: "pricePerDay", label: "Price Per Day ($)", type: "number", required: true },
  { key: "responseTime", label: "Response Time" },
];

const experienceFields: FieldConfig[] = [
  { key: "title", label: "Title", required: true },
  { key: "description", label: "Description", type: "textarea", required: true },
  { key: "price", label: "Price ($)", type: "number", required: true },
  { key: "duration", label: "Duration", required: true },
  { key: "category", label: "Category", type: "select", options: ["Cultural", "Food", "Spiritual", "Wellness", "Adventure", "Wedding", "Village", "Festival", "Medical Care"], required: true },
];

const propertyFields: FieldConfig[] = [
  { key: "propertyName", label: "Property Name", required: true },
  { key: "propertyType", label: "Property Type", type: "select", options: [...propertyTypes], required: true },
  { key: "description", label: "Description", type: "textarea", required: true },
  { key: "checkIn", label: "Check-in Time", required: true },
  { key: "checkOut", label: "Check-out Time", required: true },
];

const roomFields: FieldConfig[] = [
  { key: "name", label: "Room Name", required: true },
  { key: "type", label: "Room Type", type: "select", options: ["Private Room", "Shared Room", "Entire Home", "Heritage Suite"], required: true },
  { key: "beds", label: "Beds", type: "number", required: true },
  { key: "maxGuests", label: "Max Guests", type: "number", required: true },
  { key: "pricePerNight", label: "Price Per Night ($)", type: "number", required: true },
  { key: "description", label: "Description", type: "textarea" },
];

const vehicleFields: FieldConfig[] = [
  { key: "type", label: "Vehicle Type", type: "select", options: [...vehicleTypes], required: true },
  { key: "model", label: "Model", required: true },
  { key: "capacity", label: "Capacity", type: "number", required: true },
  { key: "pricingModel", label: "Pricing Model", type: "select", options: ["per_day", "per_km", "both"], required: true },
  { key: "pricePerDay", label: "Price Per Day ($)", type: "number", required: true },
  { key: "pricePerKm", label: "Price Per Km ($)", type: "number" },
];

const dishFields: FieldConfig[] = [
  { key: "name", label: "Dish Name", required: true },
  { key: "description", label: "Description", type: "textarea", required: true },
  { key: "cuisine", label: "Cuisine", type: "select", options: ["Rajasthani", "North Indian", "South Indian", "Goan", "Thai", "Chinese", "Mexican", "Italian", "Street Food", "Mughlai", "Kerala", "Ayurvedic"], required: true },
  { key: "price", label: "Price ($)", type: "number", required: true },
];

const HostDashboard = () => {
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const { toast } = useToast();
  const totalEarnings = hostBookings.reduce((sum, b) => sum + b.totalPrice, 0);

  // CRUD State
  const [hostProfile, setHostProfile] = useLocalStorage("host_profile", {
    name: host.name, tagline: host.tagline, bio: host.bio, city: host.city,
    pricePerDay: host.pricePerDay, responseTime: host.responseTime,
  });
  const [socialMedia, setSocialMedia] = useLocalStorage("host_social_media", {
    instagram: "", facebook: "", twitter: "", website: "",
  });
  const [pricing, setPricing] = useLocalStorage("host_pricing", {
    guidePerDay: host.pricePerDay,
    stayCommission: 0,
    foodMinOrder: host.foodInfo?.minimumOrder || 2,
    cancellationPolicy: "flexible",
    currency: "USD",
  });
  const [bookingStatuses, setBookingStatuses] = useLocalStorage<Record<string, string>>("host_booking_statuses", {});
  const [customExperiences, setCustomExperiences] = useLocalStorage<any[]>("host_custom_experiences", []);
  const [customVehicles, setCustomVehicles] = useLocalStorage<any[]>("host_custom_vehicles", []);
  const [customDishes, setCustomDishes] = useLocalStorage<any[]>("host_custom_dishes", host.foodInfo?.dishes || []);
  const [customProperties, setCustomProperties] = useLocalStorage<any[]>("host_custom_properties", host.stayInfo ? [host.stayInfo] : []);
  const [customRooms, setCustomRooms] = useLocalStorage<any[]>("host_custom_rooms", host.stayInfo?.rooms || []);
  const [hostSettings, setHostSettings] = useLocalStorage("host_settings", {
    notifications: { bookings: true, messages: true, reviews: true },
    availability: "available",
  });

  // Dialog state
  const [editDialog, setEditDialog] = useState<{ open: boolean; title: string; fields: FieldConfig[]; data?: any; onSave: (d: any) => void; onDelete?: () => void }>({
    open: false, title: "", fields: [], onSave: () => {},
  });

  const allExperiences = [...hostExperiences, ...customExperiences];
  const allVehicles = [...(host.transportInfo?.vehicles || []), ...customVehicles];

  const getBookingStatus = (id: string, original: string) => bookingStatuses[id] || original;

  const updateBookingStatus = (id: string, status: string) => {
    setBookingStatuses(p => ({ ...p, [id]: status }));
    toast({ title: `Booking #${id} ${status}`, description: `Status updated to ${status}` });
  };

  const tabs: { id: Tab; label: string; icon: React.ElementType }[] = [
    { id: "overview", label: "Overview", icon: BarChart3 },
    { id: "bookings", label: "Bookings", icon: Calendar },
    { id: "listings", label: "Listings", icon: Home },
    { id: "food", label: "Food Menu", icon: UtensilsCrossed },
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
                  {hostBookings.slice(0, 3).map(b => {
                    const status = getBookingStatus(b.id, b.status);
                    return (
                      <div key={b.id} className="rounded-lg bg-card p-4 shadow-card">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold text-foreground">Booking #{b.id}</h3>
                              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusColors[status] || statusColors.pending}`}>{status}</span>
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">
                              <Clock className="w-3 h-3 inline mr-1" />{b.startDate} → {b.endDate} · {b.services.join(", ")}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-foreground">${b.totalPrice}</p>
                            {status === "pending" && (
                              <div className="flex gap-2 mt-1">
                                <Button size="sm" onClick={() => updateBookingStatus(b.id, "confirmed")} className="rounded-full text-xs px-3 bg-accent text-accent-foreground hover:bg-accent/90">Accept</Button>
                                <Button size="sm" variant="outline" onClick={() => updateBookingStatus(b.id, "cancelled")} className="rounded-full text-xs px-3">Decline</Button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
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
              </div>
            </div>
          </>
        )}

        {/* Bookings Tab */}
        {activeTab === "bookings" && (
          <div className="mt-6 space-y-3">
            <h2 className="text-xl font-bold text-foreground mb-4">All Booking Requests</h2>
            {hostBookings.map(b => {
              const status = getBookingStatus(b.id, b.status);
              return (
                <div key={b.id} className="rounded-lg bg-card p-4 shadow-card">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-foreground">Booking #{b.id}</h3>
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusColors[status] || statusColors.pending}`}>{status}</span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        <Clock className="w-3 h-3 inline mr-1" />{b.startDate} → {b.endDate} · {b.services.join(", ")} · {b.guests} guest{b.guests > 1 ? "s" : ""}
                      </p>
                      {b.message && <p className="text-sm text-muted-foreground mt-1 italic">"{b.message}"</p>}
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-foreground">${b.totalPrice}</p>
                      {status === "pending" && (
                        <div className="flex gap-2 mt-2">
                          <Button size="sm" onClick={() => updateBookingStatus(b.id, "confirmed")} className="rounded-full bg-accent text-accent-foreground hover:bg-accent/90 text-xs px-3">Accept</Button>
                          <Button size="sm" variant="outline" onClick={() => updateBookingStatus(b.id, "cancelled")} className="rounded-full text-xs px-3">Decline</Button>
                        </div>
                      )}
                      {status === "confirmed" && (
                        <Button size="sm" variant="outline" onClick={() => updateBookingStatus(b.id, "completed")} className="rounded-full text-xs px-3 mt-2">Mark Complete</Button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Listings Tab */}
        {activeTab === "listings" && (
          <div className="mt-6 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-foreground">Your Listings</h2>
            </div>

            {/* Properties */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-foreground flex items-center gap-2"><Home className="w-4 h-4 text-primary" /> Properties</h3>
                <Button size="sm" className="rounded-full gap-1 text-xs" onClick={() => setEditDialog({
                  open: true, title: "Add Property", fields: propertyFields,
                  onSave: (d) => { setCustomProperties(p => [...p, { ...d, images: [], rooms: [], amenities: [], houseRules: [] }]); toast({ title: "Property added!" }); },
                })}>
                  <Plus className="w-3 h-3" /> Add Property
                </Button>
              </div>
              <div className="space-y-3">
                {customProperties.map((prop, i) => (
                  <div key={`${prop.propertyName}-${i}`} className="rounded-lg bg-card p-5 shadow-card">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Home className="w-5 h-5 text-primary" />
                        <h4 className="font-bold text-foreground">{prop.propertyName}</h4>
                        <span className="text-xs bg-accent/10 text-accent px-2 py-0.5 rounded-full">{prop.propertyType}</span>
                      </div>
                      <Button variant="outline" size="sm" className="rounded-full text-xs" onClick={() => setEditDialog({
                        open: true, title: "Edit Property", fields: propertyFields, data: prop,
                        onSave: (d) => { setCustomProperties(p => p.map((x, j) => j === i ? { ...x, ...d } : x)); toast({ title: "Property updated!" }); },
                        onDelete: customProperties.length > 1 ? () => { setCustomProperties(p => p.filter((_, j) => j !== i)); toast({ title: "Property removed" }); } : undefined,
                      })}>Edit</Button>
                    </div>
                    <p className="text-sm text-muted-foreground">{prop.description}</p>
                    <p className="text-xs text-muted-foreground mt-1">Check-in: {prop.checkIn} · Check-out: {prop.checkOut}</p>
                  </div>
                ))}
              </div>

              {/* Rooms */}
              <div className="mt-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-foreground text-sm">Rooms</h4>
                  <Button size="sm" variant="outline" className="rounded-full gap-1 text-xs" onClick={() => setEditDialog({
                    open: true, title: "Add Room", fields: roomFields,
                    onSave: (d) => { setCustomRooms(p => [...p, { ...d, amenities: [] }]); toast({ title: "Room added!" }); },
                  })}>
                    <Plus className="w-3 h-3" /> Add Room
                  </Button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {customRooms.map((room, i) => (
                    <div key={`${room.name}-${i}`} className="rounded-lg bg-secondary/50 p-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium text-foreground text-sm">{room.name}</p>
                          <p className="text-xs text-muted-foreground">{room.type} · {room.beds} bed(s) · {room.maxGuests} guests</p>
                          <p className="text-xs font-medium text-primary mt-1">${room.pricePerNight}/night</p>
                        </div>
                        <Button variant="ghost" size="sm" className="text-xs" onClick={() => setEditDialog({
                          open: true, title: "Edit Room", fields: roomFields, data: room,
                          onSave: (d) => { setCustomRooms(p => p.map((x, j) => j === i ? { ...x, ...d } : x)); toast({ title: "Room updated!" }); },
                          onDelete: () => { setCustomRooms(p => p.filter((_, j) => j !== i)); toast({ title: "Room removed" }); },
                        })}>Edit</Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Vehicles */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-foreground flex items-center gap-2"><Car className="w-4 h-4 text-primary" /> Vehicles</h3>
                <Button size="sm" className="rounded-full gap-1 text-xs" onClick={() => setEditDialog({
                  open: true, title: "Add Vehicle", fields: vehicleFields,
                  onSave: (d) => { setCustomVehicles(p => [...p, { ...d, ac: true, features: [] }]); toast({ title: "Vehicle added!" }); },
                })}>
                  <Plus className="w-3 h-3" /> Add Vehicle
                </Button>
              </div>
              <div className="space-y-2">
                {allVehicles.map((v, i) => (
                  <div key={`${v.model}-${i}`} className="rounded-lg bg-card p-4 shadow-card flex justify-between items-center">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-foreground">{v.model}</p>
                        <span className="text-xs bg-secondary text-muted-foreground px-2 py-0.5 rounded-full">{v.type}</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">{v.capacity} pax · {v.ac ? "AC" : "Non-AC"}</p>
                      <div className="flex gap-2 mt-1">
                        {v.pricePerDay > 0 && <span className="text-xs font-medium text-primary">${v.pricePerDay}/day</span>}
                        {v.pricePerKm > 0 && <span className="text-xs font-medium text-accent">${v.pricePerKm}/km</span>}
                        {v.pricingModel && <span className="text-[10px] bg-secondary text-muted-foreground px-1.5 py-0.5 rounded-full">{v.pricingModel.replace("_", " ")}</span>}
                      </div>
                    </div>
                    <Button variant="outline" size="sm" className="rounded-full text-xs" onClick={() => setEditDialog({
                      open: true, title: "Edit Vehicle", fields: vehicleFields, data: v,
                      onSave: (d) => {
                        const isCustom = i >= (host.transportInfo?.vehicles?.length || 0);
                        if (isCustom) { const ci = i - (host.transportInfo?.vehicles?.length || 0); setCustomVehicles(p => p.map((x, j) => j === ci ? { ...x, ...d } : x)); }
                        toast({ title: "Vehicle updated!" });
                      },
                      onDelete: i >= (host.transportInfo?.vehicles?.length || 0) ? () => {
                        const ci = i - (host.transportInfo?.vehicles?.length || 0);
                        setCustomVehicles(p => p.filter((_, j) => j !== ci));
                        toast({ title: "Vehicle removed" });
                      } : undefined,
                    })}>Edit</Button>
                  </div>
                ))}
              </div>
            </div>

            {/* Experiences */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-foreground">Your Experiences</h3>
                <Button size="sm" className="rounded-full gap-1 text-xs" onClick={() => setEditDialog({
                  open: true, title: "Add Experience", fields: experienceFields,
                  onSave: (d) => {
                    setCustomExperiences(p => [...p, { ...d, id: `custom-${Date.now()}`, hostId: host.id, hostName: host.name, hostCity: host.city, image: host.image, rating: 0, reviewCount: 0 }]);
                    toast({ title: "Experience added!" });
                  },
                })}>
                  <Plus className="w-3 h-3" /> Add Experience
                </Button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {allExperiences.map((exp, i) => (
                  <div key={exp.id} className="rounded-lg bg-card p-4 shadow-card">
                    <h4 className="font-semibold text-foreground">{exp.title}</h4>
                    <p className="text-sm text-muted-foreground">${exp.price} · {exp.duration} · {exp.category}</p>
                    <Button variant="outline" size="sm" className="mt-2 rounded-full text-xs" onClick={() => setEditDialog({
                      open: true, title: "Edit Experience", fields: experienceFields, data: exp,
                      onSave: (d) => {
                        const isCustom = i >= hostExperiences.length;
                        if (isCustom) { const ci = i - hostExperiences.length; setCustomExperiences(p => p.map((x, j) => j === ci ? { ...x, ...d } : x)); }
                        toast({ title: "Experience updated!" });
                      },
                      onDelete: i >= hostExperiences.length ? () => {
                        const ci = i - hostExperiences.length;
                        setCustomExperiences(p => p.filter((_, j) => j !== ci));
                        toast({ title: "Experience removed" });
                      } : undefined,
                    })}>Edit</Button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Food Menu Tab */}
        {activeTab === "food" && (
          <div className="mt-6 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-foreground">Food Menu</h2>
              <Button size="sm" className="rounded-full gap-1 text-xs" onClick={() => setEditDialog({
                open: true, title: "Add Dish", fields: dishFields,
                onSave: (d) => { setCustomDishes(p => [...p, { ...d, dietaryTags: [] }]); toast({ title: "Dish added!" }); },
              })}>
                <Plus className="w-3 h-3" /> Add Dish
              </Button>
            </div>
            <div className="space-y-3">
              {customDishes.map((dish, i) => (
                <div key={`${dish.name}-${i}`} className="rounded-lg bg-card p-4 shadow-card flex justify-between items-center">
                  <div>
                    <h4 className="font-semibold text-foreground">{dish.name}</h4>
                    <p className="text-sm text-muted-foreground">{dish.cuisine} · ${dish.price}/person</p>
                    <p className="text-xs text-muted-foreground mt-1">{dish.description}</p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <Button variant="outline" size="sm" className="rounded-full text-xs" onClick={() => setEditDialog({
                      open: true, title: "Edit Dish", fields: dishFields, data: dish,
                      onSave: (d) => { setCustomDishes(p => p.map((x, j) => j === i ? { ...x, ...d } : x)); toast({ title: "Dish updated!" }); },
                      onDelete: () => { setCustomDishes(p => p.filter((_, j) => j !== i)); toast({ title: "Dish removed" }); },
                    })}>Edit</Button>
                  </div>
                </div>
              ))}
              {customDishes.length === 0 && (
                <p className="text-muted-foreground text-center py-8">No dishes yet. Add your first dish to start your food menu!</p>
              )}
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
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusColors[getBookingStatus(b.id, b.status)]}`}>{getBookingStatus(b.id, b.status)}</span>
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
          <div className="mt-6 space-y-6 max-w-xl">
            <h2 className="text-xl font-bold text-foreground mb-4">Host Settings</h2>

            {/* Profile Edit */}
            <div className="rounded-lg bg-card p-5 shadow-card space-y-4">
              <h3 className="font-bold text-foreground flex items-center gap-2"><Settings className="w-4 h-4 text-primary" /> Profile Information</h3>
              <div className="space-y-3">
                <div><label className="text-sm font-medium text-foreground">Name</label><Input value={hostProfile.name} onChange={e => setHostProfile(p => ({ ...p, name: e.target.value }))} /></div>
                <div><label className="text-sm font-medium text-foreground">Tagline</label><Input value={hostProfile.tagline} onChange={e => setHostProfile(p => ({ ...p, tagline: e.target.value }))} /></div>
                <div><label className="text-sm font-medium text-foreground">Bio</label>
                  <textarea className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm min-h-[80px]"
                    value={hostProfile.bio} onChange={e => setHostProfile(p => ({ ...p, bio: e.target.value }))} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="text-sm font-medium text-foreground">City</label><Input value={hostProfile.city} onChange={e => setHostProfile(p => ({ ...p, city: e.target.value }))} /></div>
                  <div><label className="text-sm font-medium text-foreground">Price/Day ($)</label><Input type="number" value={hostProfile.pricePerDay} onChange={e => setHostProfile(p => ({ ...p, pricePerDay: Number(e.target.value) }))} /></div>
                </div>
              </div>
              <Button size="sm" className="rounded-full gap-2" onClick={() => toast({ title: "Profile saved!" })}>
                <Save className="w-4 h-4" /> Save Profile
              </Button>
            </div>

            {/* Pricing */}
            <div className="rounded-lg bg-card p-5 shadow-card space-y-4">
              <h3 className="font-bold text-foreground flex items-center gap-2"><Tag className="w-4 h-4 text-primary" /> Pricing</h3>
              <div className="space-y-3">
                <div><label className="text-sm font-medium text-foreground">Guide Rate ($/day)</label><Input type="number" value={pricing.guidePerDay} onChange={e => setPricing(p => ({ ...p, guidePerDay: Number(e.target.value) }))} /></div>
                <div><label className="text-sm font-medium text-foreground">Food Minimum Order (guests)</label><Input type="number" value={pricing.foodMinOrder} onChange={e => setPricing(p => ({ ...p, foodMinOrder: Number(e.target.value) }))} /></div>
                <div>
                  <label className="text-sm font-medium text-foreground">Cancellation Policy</label>
                  <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm mt-1"
                    value={pricing.cancellationPolicy} onChange={e => setPricing(p => ({ ...p, cancellationPolicy: e.target.value }))}>
                    <option value="flexible">Flexible — Full refund 24h before</option>
                    <option value="moderate">Moderate — Full refund 5 days before</option>
                    <option value="strict">Strict — 50% refund up to 7 days before</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground">Currency</label>
                  <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm mt-1"
                    value={pricing.currency} onChange={e => setPricing(p => ({ ...p, currency: e.target.value }))}>
                    <option value="USD">USD ($)</option><option value="EUR">EUR (€)</option><option value="GBP">GBP (£)</option><option value="INR">INR (₹)</option>
                  </select>
                </div>
              </div>
              <Button size="sm" className="rounded-full gap-2" onClick={() => toast({ title: "Pricing saved!" })}>
                <Save className="w-4 h-4" /> Save Pricing
              </Button>
            </div>

            {/* Social Media */}
            <div className="rounded-lg bg-card p-5 shadow-card space-y-4">
              <h3 className="font-bold text-foreground flex items-center gap-2"><Globe className="w-4 h-4 text-primary" /> Social Media</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-2"><Instagram className="w-4 h-4 text-muted-foreground" /><Input placeholder="Instagram handle" value={socialMedia.instagram} onChange={e => setSocialMedia(p => ({ ...p, instagram: e.target.value }))} /></div>
                <div className="flex items-center gap-2"><Facebook className="w-4 h-4 text-muted-foreground" /><Input placeholder="Facebook page URL" value={socialMedia.facebook} onChange={e => setSocialMedia(p => ({ ...p, facebook: e.target.value }))} /></div>
                <div className="flex items-center gap-2"><Twitter className="w-4 h-4 text-muted-foreground" /><Input placeholder="Twitter handle" value={socialMedia.twitter} onChange={e => setSocialMedia(p => ({ ...p, twitter: e.target.value }))} /></div>
                <div className="flex items-center gap-2"><Globe className="w-4 h-4 text-muted-foreground" /><Input placeholder="Website URL" value={socialMedia.website} onChange={e => setSocialMedia(p => ({ ...p, website: e.target.value }))} /></div>
              </div>
              <Button size="sm" className="rounded-full gap-2" onClick={() => toast({ title: "Social media saved!" })}>
                <Save className="w-4 h-4" /> Save Social
              </Button>
            </div>

            {/* Notifications */}
            <div className="rounded-lg bg-card p-5 shadow-card space-y-3">
              <h3 className="font-bold text-foreground flex items-center gap-2"><Bell className="w-4 h-4 text-primary" /> Notifications</h3>
              {(["bookings", "messages", "reviews"] as const).map(key => (
                <label key={key} className="flex items-center justify-between cursor-pointer">
                  <span className="text-sm text-foreground capitalize">{key} notifications</span>
                  <input type="checkbox" className="w-4 h-4 accent-primary" checked={hostSettings.notifications[key]}
                    onChange={e => setHostSettings(p => ({ ...p, notifications: { ...p.notifications, [key]: e.target.checked } }))} />
                </label>
              ))}
            </div>

            {/* Availability */}
            <div className="rounded-lg bg-card p-5 shadow-card space-y-3">
              <h3 className="font-bold text-foreground flex items-center gap-2"><Calendar className="w-4 h-4 text-primary" /> Availability</h3>
              <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={hostSettings.availability} onChange={e => setHostSettings(p => ({ ...p, availability: e.target.value }))}>
                <option value="available">Available</option>
                <option value="busy">Busy — Not taking bookings</option>
                <option value="vacation">On Vacation</option>
              </select>
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

export default HostDashboard;
