import { useState } from "react";
import { motion } from "framer-motion";
import { Check, Upload, MapPin, Globe, Camera, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useToast } from "@/hooks/use-toast";

const steps = ["Personal Info", "Services", "About You", "Pricing & Availability"];

const BecomeHost = () => {
  const [step, setStep] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const { toast } = useToast();

  const [form, setForm] = useState({
    name: "", email: "", phone: "", city: "", state: "",
    services: [] as string[], languages: [] as string[],
    bio: "", tagline: "", specialties: [] as string[],
    pricePerDay: "", hasHomestay: false, hasTransport: false,
    homestayRooms: "", vehicleType: "",
  });

  const update = (key: string, value: any) => setForm(prev => ({ ...prev, [key]: value }));
  const toggleArray = (key: string, val: string) => {
    const arr = form[key as keyof typeof form] as string[];
    update(key, arr.includes(val) ? arr.filter(x => x !== val) : [...arr, val]);
  };

  const handleSubmit = () => {
    setSubmitted(true);
    toast({ title: "Application Submitted!", description: "We'll review your profile and get back to you within 48 hours." });
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 mx-auto max-w-2xl text-center">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-card rounded-lg p-10 shadow-card">
            <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-6">
              <Check className="w-8 h-8 text-accent" />
            </div>
            <h1 className="text-3xl font-bold text-foreground">Application Submitted!</h1>
            <p className="mt-3 text-muted-foreground">Thank you, {form.name}! We'll review your application and get back to you within 48 hours.</p>
            <p className="mt-2 text-sm text-muted-foreground">Next steps: KYC verification → Profile review → Go live!</p>
          </motion.div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 mx-auto max-w-3xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground">Become a Host</h1>
          <p className="mt-2 text-muted-foreground">Share your India with the world. Monetize your knowledge, hospitality, and local expertise.</p>
        </motion.div>

        {/* Step Indicators */}
        <div className="mt-8 flex gap-1">
          {steps.map((s, i) => (
            <div key={s} className="flex-1">
              <div className={`h-1.5 rounded-full transition-colors ${i <= step ? "bg-primary" : "bg-border"}`} />
              <p className={`mt-2 text-xs font-medium ${i <= step ? "text-foreground" : "text-muted-foreground"}`}>{s}</p>
            </div>
          ))}
        </div>

        <motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="mt-8 bg-card rounded-lg p-6 shadow-card">
          {step === 0 && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-foreground">Personal Information</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-foreground mb-1 block">Full Name *</label>
                  <Input value={form.name} onChange={e => update("name", e.target.value)} placeholder="Your full name" />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-1 block">Email *</label>
                  <Input type="email" value={form.email} onChange={e => update("email", e.target.value)} placeholder="you@example.com" />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-1 block">Phone *</label>
                  <Input value={form.phone} onChange={e => update("phone", e.target.value)} placeholder="+91 98765 43210" />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-1 block">City *</label>
                  <Input value={form.city} onChange={e => update("city", e.target.value)} placeholder="e.g. Jaipur" />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1 block">State *</label>
                <Input value={form.state} onChange={e => update("state", e.target.value)} placeholder="e.g. Rajasthan" />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Languages Spoken</label>
                <div className="flex flex-wrap gap-2">
                  {["English", "Hindi", "Tamil", "Malayalam", "Marathi", "Bengali", "Gujarati", "Punjabi", "Kannada", "Telugu", "Urdu", "Sanskrit", "French", "German", "Spanish"].map(l => (
                    <button key={l} onClick={() => toggleArray("languages", l)} className={`rounded-full px-3 py-1.5 text-xs font-medium transition-all ${form.languages.includes(l) ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground hover:bg-secondary/80"}`}>
                      {l}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-foreground">What services will you offer?</h2>
              <div className="space-y-3">
                {[
                  { key: "Guide", icon: "🧭", title: "Local Guide", desc: "Lead personalized tours, show hidden spots, share local culture" },
                  { key: "Stay", icon: "🏡", title: "Homestay", desc: "Host travelers in your home with authentic local experience" },
                  { key: "Transport", icon: "🚗", title: "Transportation", desc: "Provide vehicle and driving services for travel within your region" },
                ].map(s => (
                  <button key={s.key} onClick={() => toggleArray("services", s.key)} className={`w-full flex items-center gap-4 rounded-lg p-4 text-left transition-all border ${form.services.includes(s.key) ? "border-primary bg-primary/5" : "border-border bg-card hover:border-primary/30"}`}>
                    <span className="text-2xl">{s.icon}</span>
                    <div className="flex-1">
                      <p className="font-semibold text-foreground">{s.title}</p>
                      <p className="text-sm text-muted-foreground">{s.desc}</p>
                    </div>
                    {form.services.includes(s.key) && <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center"><Check className="w-4 h-4 text-primary-foreground" /></div>}
                  </button>
                ))}
              </div>

              {form.services.includes("Stay") && (
                <div className="p-4 rounded-lg bg-secondary">
                  <h3 className="text-sm font-semibold text-foreground mb-2">Homestay Details</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <Input value={form.homestayRooms} onChange={e => update("homestayRooms", e.target.value)} placeholder="Number of rooms" />
                  </div>
                </div>
              )}

              {form.services.includes("Transport") && (
                <div className="p-4 rounded-lg bg-secondary">
                  <h3 className="text-sm font-semibold text-foreground mb-2">Vehicle Details</h3>
                  <Input value={form.vehicleType} onChange={e => update("vehicleType", e.target.value)} placeholder="e.g. Maruti Swift, Toyota Innova" />
                </div>
              )}
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-foreground">Tell Your Story</h2>
              <div>
                <label className="text-sm font-medium text-foreground mb-1 block">Tagline *</label>
                <Input value={form.tagline} onChange={e => update("tagline", e.target.value)} placeholder="e.g. Your gateway to the Pink City's hidden gems" maxLength={80} />
                <p className="text-xs text-muted-foreground mt-1">{form.tagline.length}/80 characters</p>
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1 block">Bio *</label>
                <Textarea value={form.bio} onChange={e => update("bio", e.target.value)} placeholder="Share your story — what makes your region special, your background, and why you love hosting..." rows={5} maxLength={500} />
                <p className="text-xs text-muted-foreground mt-1">{form.bio.length}/500 characters</p>
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Specialties</label>
                <div className="flex flex-wrap gap-2">
                  {["Spiritual", "Adventure", "Cultural", "Wedding", "Village", "Food", "Festival", "Wellness"].map(s => (
                    <button key={s} onClick={() => toggleArray("specialties", s)} className={`rounded-full px-3 py-1.5 text-xs font-medium transition-all ${form.specialties.includes(s) ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground hover:bg-secondary/80"}`}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>
              <div className="p-4 rounded-lg border border-dashed border-border bg-secondary/50 text-center">
                <Camera className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm font-medium text-foreground">Upload Profile Photos</p>
                <p className="text-xs text-muted-foreground">Add up to 5 photos that showcase you and your experiences</p>
                <Button variant="outline" size="sm" className="mt-3 rounded-full gap-2"><Upload className="w-3 h-3" /> Choose Files</Button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-foreground">Pricing & Availability</h2>
              <div>
                <label className="text-sm font-medium text-foreground mb-1 block">Price per Day (USD) *</label>
                <Input type="number" value={form.pricePerDay} onChange={e => update("pricePerDay", e.target.value)} placeholder="e.g. 45" />
                <p className="text-xs text-muted-foreground mt-1">Average hosts in India charge $30–$60/day</p>
              </div>
              <div className="p-4 rounded-lg bg-secondary">
                <h3 className="text-sm font-semibold text-foreground mb-2">What's Included</h3>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>✓ Travelista takes 15% commission per booking</li>
                  <li>✓ You set your own prices and availability</li>
                  <li>✓ Payments processed securely via the platform</li>
                  <li>✓ Cancel or modify bookings anytime before confirmation</li>
                </ul>
              </div>
              <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                <h3 className="text-sm font-semibold text-foreground mb-1">Next Steps After Submission</h3>
                <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
                  <li>We review your application (24-48 hours)</li>
                  <li>KYC verification (ID + address proof)</li>
                  <li>Profile goes live on Travelista</li>
                  <li>Start receiving booking inquiries!</li>
                </ol>
              </div>
            </div>
          )}
        </motion.div>

        <div className="mt-6 flex gap-3">
          {step > 0 && <Button variant="outline" onClick={() => setStep(step - 1)} className="rounded-full px-6">Back</Button>}
          {step < steps.length - 1 ? (
            <Button onClick={() => setStep(step + 1)} className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90 px-8 gap-2">
              Continue <ArrowRight className="w-4 h-4" />
            </Button>
          ) : (
            <Button onClick={handleSubmit} className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90 px-8 gap-2">
              Submit Application <Check className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default BecomeHost;
