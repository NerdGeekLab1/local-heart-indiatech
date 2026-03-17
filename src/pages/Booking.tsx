import { useState } from "react";
import { useParams, useSearchParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { CalendarIcon, ArrowLeft, Users, MessageCircle, Check, MapPin, Star, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { hosts } from "@/lib/data";
import { useToast } from "@/hooks/use-toast";

const serviceOptions = [
  { key: "Guide", label: "Local Guide", desc: "Personalized tours & experiences", icon: "🧭" },
  { key: "Stay", label: "Homestay", desc: "Authentic local accommodation", icon: "🏡" },
  { key: "Transport", label: "Transport", desc: "Vehicle with host as driver", icon: "🚗" },
];

const Booking = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const host = hosts.find(h => h.id === id);
  const { toast } = useToast();

  const [step, setStep] = useState(1);
  const [selectedServices, setSelectedServices] = useState<string[]>(
    searchParams.get("service") ? [searchParams.get("service")!] : []
  );
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [guests, setGuests] = useState(1);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);

  if (!host) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground">Host not found</h1>
          <Link to="/explore" className="text-primary mt-2 inline-block hover:underline">Back to Explore</Link>
        </div>
      </div>
    );
  }

  const toggleService = (s: string) => {
    setSelectedServices(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);
  };

  const days = startDate && endDate ? Math.max(1, Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))) : 0;
  const basePrice = days * host.pricePerDay * guests;
  const serviceFee = Math.round(basePrice * 0.1);
  const total = basePrice + serviceFee;

  const canProceed = () => {
    if (step === 1) return selectedServices.length > 0;
    if (step === 2) return startDate && endDate && endDate > startDate;
    if (step === 3) return name.trim() && email.trim();
    return false;
  };

  const handleSubmit = () => {
    setSubmitted(true);
    toast({ title: "Inquiry Sent!", description: `Your booking request has been sent to ${host.name}. They'll respond within ${host.responseTime}.` });
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
            <h1 className="text-3xl font-bold text-foreground">Inquiry Sent!</h1>
            <p className="mt-3 text-muted-foreground">Your booking request has been sent to <strong>{host.name}</strong> in {host.city}. They typically respond within {host.responseTime}.</p>
            <div className="mt-6 p-4 rounded-lg bg-secondary text-left space-y-2">
              <p className="text-sm"><strong>Services:</strong> {selectedServices.join(", ")}</p>
              {startDate && endDate && <p className="text-sm"><strong>Dates:</strong> {format(startDate, "PPP")} – {format(endDate, "PPP")}</p>}
              <p className="text-sm"><strong>Guests:</strong> {guests}</p>
              <p className="text-sm font-semibold"><strong>Estimated Total:</strong> ${total}</p>
            </div>
            <div className="mt-8 flex gap-3 justify-center">
              <Link to={`/host/${host.id}`}><Button variant="outline" className="rounded-full px-6">View Host Profile</Button></Link>
              <Link to="/dashboard/traveler"><Button className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90 px-6">Go to Dashboard</Button></Link>
            </div>
          </motion.div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 mx-auto max-w-5xl">
        <Link to={`/host/${host.id}`} className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="w-4 h-4" /> Back to {host.name}'s Profile
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2">
            {/* Steps */}
            <div className="flex gap-2 mb-8">
              {[1, 2, 3].map(s => (
                <div key={s} className={`flex-1 h-1.5 rounded-full transition-colors ${s <= step ? "bg-primary" : "bg-border"}`} />
              ))}
            </div>

            <motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }}>
              {step === 1 && (
                <div>
                  <h2 className="text-2xl font-bold text-foreground">Select Services</h2>
                  <p className="mt-1 text-muted-foreground">Choose what you'd like from {host.name}</p>
                  <div className="mt-6 space-y-3">
                    {serviceOptions.filter(s => host.services.includes(s.key)).map(s => (
                      <button
                        key={s.key}
                        onClick={() => toggleService(s.key)}
                        className={`w-full flex items-center gap-4 rounded-lg p-4 text-left transition-all border ${
                          selectedServices.includes(s.key)
                            ? "border-primary bg-primary/5 shadow-card"
                            : "border-border bg-card hover:border-primary/30"
                        }`}
                      >
                        <span className="text-2xl">{s.icon}</span>
                        <div className="flex-1">
                          <p className="font-semibold text-foreground">{s.label}</p>
                          <p className="text-sm text-muted-foreground">{s.desc}</p>
                        </div>
                        {selectedServices.includes(s.key) && (
                          <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                            <Check className="w-4 h-4 text-primary-foreground" />
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {step === 2 && (
                <div>
                  <h2 className="text-2xl font-bold text-foreground">Choose Dates & Guests</h2>
                  <p className="mt-1 text-muted-foreground">When would you like to visit {host.city}?</p>
                  <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-foreground mb-2 block">Start Date</label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !startDate && "text-muted-foreground")}>
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {startDate ? format(startDate, "PPP") : "Pick a date"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar mode="single" selected={startDate} onSelect={setStartDate} disabled={(d) => d < new Date()} initialFocus className="p-3 pointer-events-auto" />
                        </PopoverContent>
                      </Popover>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-foreground mb-2 block">End Date</label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !endDate && "text-muted-foreground")}>
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {endDate ? format(endDate, "PPP") : "Pick a date"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar mode="single" selected={endDate} onSelect={setEndDate} disabled={(d) => d < (startDate || new Date())} initialFocus className="p-3 pointer-events-auto" />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>
                  <div className="mt-4">
                    <label className="text-sm font-medium text-foreground mb-2 block">Number of Guests</label>
                    <div className="flex items-center gap-3">
                      <Button variant="outline" size="icon" onClick={() => setGuests(Math.max(1, guests - 1))} className="rounded-full"><span className="text-lg">−</span></Button>
                      <span className="text-lg font-semibold text-foreground w-8 text-center">{guests}</span>
                      <Button variant="outline" size="icon" onClick={() => setGuests(Math.min(10, guests + 1))} className="rounded-full"><span className="text-lg">+</span></Button>
                    </div>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div>
                  <h2 className="text-2xl font-bold text-foreground">Your Details & Message</h2>
                  <p className="mt-1 text-muted-foreground">Tell {host.name} about yourself and your trip</p>
                  <div className="mt-6 space-y-4">
                    <div>
                      <label className="text-sm font-medium text-foreground mb-2 block">Full Name</label>
                      <Input value={name} onChange={e => setName(e.target.value)} placeholder="Your full name" />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-foreground mb-2 block">Email</label>
                      <Input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-foreground mb-2 block">Message to {host.name} (optional)</label>
                      <Textarea value={message} onChange={e => setMessage(e.target.value)} placeholder={`Hi ${host.name}, I'm interested in...`} rows={4} />
                    </div>
                  </div>
                </div>
              )}
            </motion.div>

            <div className="mt-8 flex gap-3">
              {step > 1 && (
                <Button variant="outline" onClick={() => setStep(step - 1)} className="rounded-full px-6">Back</Button>
              )}
              {step < 3 ? (
                <Button onClick={() => setStep(step + 1)} disabled={!canProceed()} className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90 px-8">
                  Continue
                </Button>
              ) : (
                <Button onClick={handleSubmit} disabled={!canProceed()} className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90 px-8 gap-2">
                  <MessageCircle className="w-4 h-4" /> Send Inquiry
                </Button>
              )}
            </div>
          </div>

          {/* Sidebar - Host Summary */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 rounded-lg bg-card p-5 shadow-card space-y-4">
              <div className="flex items-center gap-3">
                <img src={host.image} alt={host.name} className="w-14 h-14 rounded-full object-cover" />
                <div>
                  <h3 className="font-semibold text-foreground">{host.name}</h3>
                  <p className="text-sm text-muted-foreground flex items-center gap-1"><MapPin className="w-3 h-3" /> {host.city}</p>
                </div>
              </div>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1"><Star className="w-3 h-3 fill-primary text-primary" /> {host.rating}</span>
                <span className="flex items-center gap-1"><Shield className="w-3 h-3 text-accent" /> Verified</span>
              </div>
              <div className="border-t border-border pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">${host.pricePerDay} × {days || 0} day{days !== 1 ? "s" : ""} × {guests} guest{guests !== 1 ? "s" : ""}</span>
                  <span className="text-foreground">${basePrice}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Service fee</span>
                  <span className="text-foreground">${serviceFee}</span>
                </div>
                <div className="flex justify-between text-sm font-semibold border-t border-border pt-2">
                  <span className="text-foreground">Total</span>
                  <span className="text-foreground">${total}</span>
                </div>
              </div>
              {selectedServices.length > 0 && (
                <div className="text-xs text-muted-foreground">
                  Selected: {selectedServices.join(", ")}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Booking;
