import { useState } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import {
  Bike, Car, Bus, Map, Mountain, Heart, Compass, Plus,
  Calendar, Users, DollarSign, Check, ArrowRight, Sparkles,
  UtensilsCrossed, Home, Tent, Package
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import ImageUpload from "@/components/ImageUpload";

const tripTypes = [
  { id: "bike_tour", label: "Bike Tour", icon: Bike, emoji: "🏍️" },
  { id: "car_trip", label: "Car Trip", icon: Car, emoji: "🚗" },
  { id: "road_trip", label: "Road Trip", icon: Map, emoji: "🛣️" },
  { id: "bus_trip", label: "Bus Trip", icon: Bus, emoji: "🚌" },
  { id: "trek", label: "Trekking", icon: Mountain, emoji: "🥾" },
  { id: "camping", label: "Camping", icon: Tent, emoji: "⛺" },
];

const tripNatures = [
  { id: "adventure", label: "Adventure", emoji: "🧗" },
  { id: "spiritual", label: "Holy / Spiritual", emoji: "🕉️" },
  { id: "cultural", label: "Cultural", emoji: "🏛️" },
  { id: "wellness", label: "Wellness", emoji: "🧘" },
  { id: "romantic", label: "Romantic", emoji: "💕" },
  { id: "party", label: "Party / Social", emoji: "🎉" },
];

const inclusionOptions = [
  { id: "food", label: "Food & Meals", icon: UtensilsCrossed, emoji: "🍛" },
  { id: "stay", label: "Accommodation", icon: Home, emoji: "🏨" },
  { id: "activities", label: "Activities", icon: Compass, emoji: "🎯" },
  { id: "transport", label: "Transport", icon: Car, emoji: "🚗" },
];

const HostTrip = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    title: "", description: "", tripType: "", nature: "",
    route: "", destination: "", duration: "",
    maxTravelers: 10, totalPrice: 0, priceModel: "fixed",
    includesFood: false, includesStay: false, includesActivities: false, includesTransport: true,
    tripDirection: "round_trip",
    highlights: [""],
    inclusions: [""],
    startDate: "", endDate: "", imageUrl: "",
  });

  const [submitting, setSubmitting] = useState(false);

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-24 pb-16 px-4 max-w-2xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="bg-card rounded-2xl p-10 shadow-card">
            <Sparkles className="w-12 h-12 text-primary mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-foreground">Host Your Own Trip</h1>
            <p className="mt-2 text-muted-foreground">Sign in to create and share trips with fellow travelers</p>
            <Link to="/signup">
              <Button className="mt-6 rounded-full px-8">Sign Up to Get Started</Button>
            </Link>
          </motion.div>
        </div>
        <Footer />
      </div>
    );
  }

  const updateForm = (key: string, value: any) => setForm(p => ({ ...p, [key]: value }));

  const addHighlight = () => setForm(p => ({ ...p, highlights: [...p.highlights, ""] }));
  const updateHighlight = (i: number, v: string) => setForm(p => ({ ...p, highlights: p.highlights.map((h, j) => j === i ? v : h) }));

  const addInclusion = () => setForm(p => ({ ...p, inclusions: [...p.inclusions, ""] }));
  const updateInclusion = (i: number, v: string) => setForm(p => ({ ...p, inclusions: p.inclusions.map((h, j) => j === i ? v : h) }));

  const handleSubmit = async () => {
    if (!form.title || !form.tripType || !form.nature) {
      toast({ title: "Please fill required fields", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.from("trip_listings").insert({
      creator_id: user.id,
      title: form.title,
      description: form.description,
      trip_type: form.tripType,
      nature: form.nature,
      route: form.route,
      destination: form.destination,
      duration: form.duration,
      max_travelers: form.maxTravelers,
      price_model: form.priceModel,
      total_price: form.totalPrice,
      includes_food: form.includesFood,
      includes_stay: form.includesStay,
      includes_activities: form.includesActivities,
      includes_transport: form.includesTransport,
      trip_direction: form.tripDirection,
      highlights: form.highlights.filter(Boolean),
      inclusions: form.inclusions.filter(Boolean),
      start_date: form.startDate || null,
      end_date: form.endDate || null,
      image_url: form.imageUrl || null,
    } as any);

    setSubmitting(false);
    if (error) {
      toast({ title: "Error creating trip", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Trip listed! 🎉", description: "Your trip is now live for other travelers to join." });
      navigate("/dashboard/traveler");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 mx-auto max-w-3xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="text-center mb-8">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring" }}
              className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Compass className="w-8 h-8 text-primary" />
            </motion.div>
            <h1 className="text-3xl font-bold text-foreground">Host a Trip</h1>
            <p className="mt-2 text-muted-foreground">Create a group trip for fellow travelers to join</p>
          </div>

          {/* Progress */}
          <div className="flex gap-2 mb-8">
            {[1, 2, 3, 4].map(s => (
              <div key={s} className={`flex-1 h-1.5 rounded-full transition-colors ${s <= step ? "bg-primary" : "bg-border"}`} />
            ))}
          </div>

          <motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="bg-card rounded-2xl p-6 shadow-card">

            {step === 1 && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-foreground">Trip Basics</h2>
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">Trip Title *</label>
                  <Input value={form.title} onChange={e => updateForm("title", e.target.value)} placeholder="e.g., Ladakh Bike Expedition 2026" />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">Cover Image</label>
                  <ImageUpload
                    bucket="trip-images"
                    folder={user.id}
                    currentUrl={form.imageUrl || null}
                    onUpload={(url) => updateForm("imageUrl", url)}
                    className="w-full h-40"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">Description</label>
                  <Textarea value={form.description} onChange={e => updateForm("description", e.target.value)} placeholder="Describe the trip experience..." rows={4} />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">Trip Type *</label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {tripTypes.map(t => (
                      <button key={t.id} onClick={() => updateForm("tripType", t.id)}
                        className={`flex items-center gap-2 p-3 rounded-xl border transition-all text-left ${
                          form.tripType === t.id ? "border-primary bg-primary/5 shadow-card" : "border-border hover:border-primary/30"
                        }`}>
                        <span className="text-lg">{t.emoji}</span>
                        <span className="text-sm font-medium text-foreground">{t.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">Nature of Trip *</label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {tripNatures.map(n => (
                      <button key={n.id} onClick={() => updateForm("nature", n.id)}
                        className={`flex items-center gap-2 p-3 rounded-xl border transition-all text-left ${
                          form.nature === n.id ? "border-primary bg-primary/5 shadow-card" : "border-border hover:border-primary/30"
                        }`}>
                        <span className="text-lg">{n.emoji}</span>
                        <span className="text-sm font-medium text-foreground">{n.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-foreground">Route & Details</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">Destination</label>
                    <Input value={form.destination} onChange={e => updateForm("destination", e.target.value)} placeholder="e.g., Leh-Ladakh" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">Duration</label>
                    <Input value={form.duration} onChange={e => updateForm("duration", e.target.value)} placeholder="e.g., 7 Days" />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">Route</label>
                  <Input value={form.route} onChange={e => updateForm("route", e.target.value)} placeholder="e.g., Delhi → Manali → Leh → Pangong → Delhi" />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">Trip Direction</label>
                  <div className="flex gap-2">
                    {[{ id: "round_trip", label: "Round Trip 🔄" }, { id: "one_way", label: "One Way →" }].map(d => (
                      <button key={d.id} onClick={() => updateForm("tripDirection", d.id)}
                        className={`flex-1 p-3 rounded-xl border text-sm font-medium transition-all ${
                          form.tripDirection === d.id ? "border-primary bg-primary/5" : "border-border"
                        }`}>{d.label}</button>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">Start Date</label>
                    <Input type="date" value={form.startDate} onChange={e => updateForm("startDate", e.target.value)} />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">End Date</label>
                    <Input type="date" value={form.endDate} onChange={e => updateForm("endDate", e.target.value)} />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">Max Travelers</label>
                  <div className="flex items-center gap-3">
                    <Button variant="outline" size="icon" className="rounded-full" onClick={() => updateForm("maxTravelers", Math.max(2, form.maxTravelers - 1))}>−</Button>
                    <span className="text-lg font-bold text-foreground w-8 text-center">{form.maxTravelers}</span>
                    <Button variant="outline" size="icon" className="rounded-full" onClick={() => updateForm("maxTravelers", Math.min(50, form.maxTravelers + 1))}>+</Button>
                  </div>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-foreground">What's Included</h2>
                <div className="grid grid-cols-2 gap-3">
                  {inclusionOptions.map(inc => {
                    const key = `includes${inc.id.charAt(0).toUpperCase() + inc.id.slice(1)}` as keyof typeof form;
                    const isSelected = form[key] as boolean;
                    return (
                      <button key={inc.id} onClick={() => updateForm(key, !isSelected)}
                        className={`flex items-center gap-3 p-4 rounded-xl border transition-all ${
                          isSelected ? "border-primary bg-primary/5" : "border-border"
                        }`}>
                        <span className="text-xl">{inc.emoji}</span>
                        <span className="text-sm font-medium text-foreground">{inc.label}</span>
                        {isSelected && <Check className="w-4 h-4 text-primary ml-auto" />}
                      </button>
                    );
                  })}
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">Trip Highlights</label>
                  {form.highlights.map((h, i) => (
                    <Input key={i} value={h} onChange={e => updateHighlight(i, e.target.value)}
                      placeholder={`Highlight ${i + 1}`} className="mb-2" />
                  ))}
                  <Button variant="outline" size="sm" onClick={addHighlight} className="rounded-full gap-1 text-xs">
                    <Plus className="w-3 h-3" /> Add Highlight
                  </Button>
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">Detailed Inclusions</label>
                  {form.inclusions.map((inc, i) => (
                    <Input key={i} value={inc} onChange={e => updateInclusion(i, e.target.value)}
                      placeholder={`e.g., Breakfast, Tent, Guide`} className="mb-2" />
                  ))}
                  <Button variant="outline" size="sm" onClick={addInclusion} className="rounded-full gap-1 text-xs">
                    <Plus className="w-3 h-3" /> Add Inclusion
                  </Button>
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-foreground">Pricing</h2>
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">Pricing Model</label>
                  <div className="flex gap-2">
                    {[{ id: "fixed", label: "Fixed Cost 💰" }, { id: "per_person", label: "Per Person 👤" }, { id: "split", label: "Cost Split ÷" }].map(p => (
                      <button key={p.id} onClick={() => updateForm("priceModel", p.id)}
                        className={`flex-1 p-3 rounded-xl border text-sm font-medium transition-all ${
                          form.priceModel === p.id ? "border-primary bg-primary/5" : "border-border"
                        }`}>{p.label}</button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    {form.priceModel === "per_person" ? "Price Per Person ($)" : form.priceModel === "split" ? "Total Trip Cost to Split ($)" : "Total Price ($)"}
                  </label>
                  <Input type="number" value={form.totalPrice} onChange={e => updateForm("totalPrice", Number(e.target.value))} placeholder="0" />
                </div>

                {/* Summary */}
                <div className="rounded-xl bg-primary/5 border border-primary/20 p-5 space-y-2">
                  <h3 className="font-bold text-foreground text-sm">Trip Summary</h3>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <span className="text-muted-foreground">Title:</span><span className="text-foreground font-medium">{form.title || "—"}</span>
                    <span className="text-muted-foreground">Type:</span><span className="text-foreground">{tripTypes.find(t => t.id === form.tripType)?.label || "—"}</span>
                    <span className="text-muted-foreground">Nature:</span><span className="text-foreground">{tripNatures.find(n => n.id === form.nature)?.label || "—"}</span>
                    <span className="text-muted-foreground">Destination:</span><span className="text-foreground">{form.destination || "—"}</span>
                    <span className="text-muted-foreground">Max travelers:</span><span className="text-foreground">{form.maxTravelers}</span>
                    <span className="text-muted-foreground">Direction:</span><span className="text-foreground">{form.tripDirection === "round_trip" ? "Round Trip" : "One Way"}</span>
                    <span className="text-muted-foreground">Price:</span><span className="text-foreground font-bold">${form.totalPrice}</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {form.includesFood && <span className="text-[10px] bg-accent/10 text-accent px-2 py-0.5 rounded-full">🍛 Food</span>}
                    {form.includesStay && <span className="text-[10px] bg-accent/10 text-accent px-2 py-0.5 rounded-full">🏨 Stay</span>}
                    {form.includesActivities && <span className="text-[10px] bg-accent/10 text-accent px-2 py-0.5 rounded-full">🎯 Activities</span>}
                    {form.includesTransport && <span className="text-[10px] bg-accent/10 text-accent px-2 py-0.5 rounded-full">🚗 Transport</span>}
                  </div>
                </div>
              </div>
            )}
          </motion.div>

          {/* Navigation */}
          <div className="mt-6 flex gap-3 justify-between">
            {step > 1 ? (
              <Button variant="outline" onClick={() => setStep(step - 1)} className="rounded-full px-6">Back</Button>
            ) : <div />}
            {step < 4 ? (
              <Button onClick={() => setStep(step + 1)} className="rounded-full px-8 gap-2">
                Continue <ArrowRight className="w-4 h-4" />
              </Button>
            ) : (
              <Button onClick={handleSubmit} disabled={submitting} className="rounded-full px-8 gap-2">
                {submitting ? "Publishing..." : "Publish Trip 🚀"}
              </Button>
            )}
          </div>
        </motion.div>
      </div>
      <Footer />
    </div>
  );
};

export default HostTrip;
