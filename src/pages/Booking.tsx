import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useParams, useSearchParams, Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { CalendarIcon, ArrowLeft, Users, MessageCircle, Check, MapPin, Star, Shield, Lock, ChevronDown, Share2, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ChatPanel from "@/components/ChatPanel";
import { hosts } from "@/lib/data";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

const serviceOptions = [
  { key: "Guide", label: "Local Guide", desc: "Personalized tours & experiences", icon: "🧭", price: 40 },
  { key: "Stay", label: "Homestay", desc: "Authentic local accommodation", icon: "🏡", price: 35 },
  { key: "Transport", label: "Transport", desc: "Vehicle with host as driver", icon: "🚗", price: 50 },
  { key: "Food", label: "Food & Dining", desc: "Home-cooked meals & food experiences", icon: "🍛", price: 20 },
];

const specialRequests = [
  { id: "wipe_tissues", label: "Wipe Tissues", emoji: "🧻" },
  { id: "wine", label: "Wine Bottle", emoji: "🍷" },
  { id: "cake", label: "Birthday Cake", emoji: "🎂" },
  { id: "flowers", label: "Flower Bouquet", emoji: "💐" },
  { id: "candles", label: "Candle Light Setup", emoji: "🕯️" },
  { id: "snacks", label: "Snack Pack", emoji: "🍿" },
  { id: "first_aid", label: "First Aid Kit", emoji: "🩹" },
  { id: "photography", label: "Photography", emoji: "📸" },
];

const Booking = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const host = hosts.find(h => h.id === id);
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [selectedServices, setSelectedServices] = useState<string[]>(
    searchParams.get("service") ? [searchParams.get("service")!] : []
  );
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [guests, setGuests] = useState(1);
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [selectedSpecialRequests, setSelectedSpecialRequests] = useState<string[]>([]);
  const [chatOpen, setChatOpen] = useState(false);

  // Auth gate
  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-24 pb-16 px-4 max-w-2xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="bg-card rounded-2xl p-10 shadow-card">
            <Lock className="w-12 h-12 text-primary mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-foreground">Sign In to Book</h1>
            <p className="mt-2 text-muted-foreground">You need to be logged in to make a booking</p>
            <Link to="/signup">
              <Button className="mt-6 rounded-full px-8">Sign In / Sign Up</Button>
            </Link>
          </motion.div>
        </div>
        <Footer />
      </div>
    );
  }

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

  const toggleSpecialRequest = (id: string) => {
    setSelectedSpecialRequests(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const days = startDate && endDate ? Math.max(1, Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))) : 0;

  // Variable pricing per service
  const servicePricing = selectedServices.reduce((acc, s) => {
    const opt = serviceOptions.find(o => o.key === s);
    return acc + (opt?.price || 0) * days * guests;
  }, 0);
  const specialRequestFee = selectedSpecialRequests.length * 15;
  const serviceFee = Math.round(servicePricing * 0.1);
  const total = servicePricing + specialRequestFee + serviceFee;

  const canProceed = () => {
    if (step === 1) return selectedServices.length > 0;
    if (step === 2) return startDate && endDate && endDate > startDate;
    if (step === 3) return true;
    if (step === 4) return true;
    return false;
  };

  const handleSubmit = async () => {
    if (!user || !startDate || !endDate) return;
    const { error } = await supabase.from("bookings").insert({
      traveler_id: user.id,
      host_id: host.id,
      start_date: startDate.toISOString().split("T")[0],
      end_date: endDate.toISOString().split("T")[0],
      guests,
      services: selectedServices,
      total_price: total,
      message: message || null,
      status: "pending",
    });
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return;
    }
    setSubmitted(true);
    toast({ title: "Booking Sent! 🎉", description: `Your booking has been sent to ${host.name}.` });
  };

  const handleShare = () => {
    const url = window.location.href;
    if (navigator.share) {
      navigator.share({ title: `Book ${host.name}`, text: `Check out ${host.name}'s hosting in ${host.city}!`, url });
    } else {
      navigator.clipboard.writeText(url);
      toast({ title: "Link copied!", description: "Booking link copied to clipboard" });
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 mx-auto max-w-2xl text-center">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-card rounded-2xl p-10 shadow-card">
            <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-6">
              <Check className="w-8 h-8 text-accent" />
            </div>
            <h1 className="text-3xl font-bold text-foreground">Booking Confirmed!</h1>
            <p className="mt-3 text-muted-foreground">Your request has been sent to <strong>{host.name}</strong>.</p>
            <div className="mt-6 p-4 rounded-xl bg-secondary text-left space-y-2">
              <p className="text-sm"><strong>Services:</strong> {selectedServices.join(", ")}</p>
              {startDate && endDate && <p className="text-sm"><strong>Dates:</strong> {format(startDate, "PPP")} – {format(endDate, "PPP")}</p>}
              <p className="text-sm"><strong>Guests:</strong> {guests}</p>
              {selectedSpecialRequests.length > 0 && (
                <p className="text-sm"><strong>Special Requests:</strong> {selectedSpecialRequests.map(id => specialRequests.find(s => s.id === id)?.label).join(", ")}</p>
              )}
              <p className="text-sm font-semibold"><strong>Total:</strong> ${total}</p>
            </div>
            <div className="mt-8 flex gap-3 justify-center flex-wrap">
              <Button variant="outline" className="rounded-full px-6" onClick={() => setChatOpen(true)}>
                <MessageCircle className="w-4 h-4 mr-2" /> Chat with {host.name}
              </Button>
              <Link to="/dashboard/traveler"><Button className="rounded-full px-6">Go to Dashboard</Button></Link>
            </div>
          </motion.div>
        </div>
        <Footer />
        <ChatPanel receiverId={host.id} receiverName={host.name} receiverImage={host.image} isOpen={chatOpen} onClose={() => setChatOpen(false)} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 mx-auto max-w-5xl">
        <div className="flex items-center justify-between mb-6">
          <Link to={`/host/${host.id}`} className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-4 h-4" /> Back to {host.name}'s Profile
          </Link>
          <Button variant="outline" size="sm" className="rounded-full gap-1" onClick={handleShare}>
            <Share2 className="w-4 h-4" /> Share
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {/* Steps */}
            <div className="flex gap-2 mb-8">
              {[1, 2, 3, 4].map(s => (
                <div key={s} className={`flex-1 h-1.5 rounded-full transition-colors ${s <= step ? "bg-primary" : "bg-border"}`} />
              ))}
            </div>

            <motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
              {step === 1 && (
                <div>
                  <h2 className="text-2xl font-bold text-foreground">Select Services</h2>
                  <p className="mt-1 text-muted-foreground">Choose what you'd like — each has individual pricing</p>
                  <div className="mt-6 space-y-3">
                    {serviceOptions.filter(s => host.services.includes(s.key)).map(s => (
                      <button key={s.key} onClick={() => toggleService(s.key)}
                        className={`w-full flex items-center gap-4 rounded-xl p-4 text-left transition-all border ${
                          selectedServices.includes(s.key) ? "border-primary bg-primary/5 shadow-card" : "border-border bg-card hover:border-primary/30"
                        }`}>
                        <span className="text-2xl">{s.icon}</span>
                        <div className="flex-1">
                          <p className="font-semibold text-foreground">{s.label}</p>
                          <p className="text-sm text-muted-foreground">{s.desc}</p>
                        </div>
                        <span className="text-lg font-bold text-primary">${s.price}<span className="text-xs font-normal text-muted-foreground">/day</span></span>
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
                      <Button variant="outline" size="icon" onClick={() => setGuests(Math.max(1, guests - 1))} className="rounded-full">−</Button>
                      <span className="text-lg font-semibold text-foreground w-8 text-center">{guests}</span>
                      <Button variant="outline" size="icon" onClick={() => setGuests(Math.min(10, guests + 1))} className="rounded-full">+</Button>
                    </div>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div>
                  <h2 className="text-2xl font-bold text-foreground">Special Requests</h2>
                  <p className="mt-1 text-muted-foreground">Add extras to make your trip special (+$15 each)</p>
                  <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {specialRequests.map(sr => (
                      <button key={sr.id} onClick={() => toggleSpecialRequest(sr.id)}
                        className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-all ${
                          selectedSpecialRequests.includes(sr.id) ? "border-primary bg-primary/5 shadow-card" : "border-border bg-card hover:border-primary/30"
                        }`}>
                        <span className="text-2xl">{sr.emoji}</span>
                        <span className="text-xs font-medium text-foreground text-center">{sr.label}</span>
                        {selectedSpecialRequests.includes(sr.id) && (
                          <Check className="w-4 h-4 text-primary" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {step === 4 && (
                <div>
                  <h2 className="text-2xl font-bold text-foreground">Message & Confirm</h2>
                  <div className="mt-6 space-y-4">
                    <div>
                      <label className="text-sm font-medium text-foreground mb-2 block">Message to {host.name} (optional)</label>
                      <Textarea value={message} onChange={e => setMessage(e.target.value)} placeholder={`Hi ${host.name}, I'm excited about...`} rows={4} />
                    </div>
                  </div>
                </div>
              )}
            </motion.div>

            <div className="mt-8 flex gap-3">
              {step > 1 && <Button variant="outline" onClick={() => setStep(step - 1)} className="rounded-full px-6">Back</Button>}
              {step < 4 ? (
                <Button onClick={() => setStep(step + 1)} disabled={!canProceed()} className="rounded-full px-8">Continue</Button>
              ) : (
                <Button onClick={handleSubmit} disabled={!canProceed()} className="rounded-full px-8 gap-2">
                  <MessageCircle className="w-4 h-4" /> Confirm Booking
                </Button>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 rounded-2xl bg-card p-5 shadow-card space-y-4">
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

              {/* Pricing breakdown */}
              <div className="border-t border-border pt-4 space-y-2">
                {selectedServices.map(s => {
                  const opt = serviceOptions.find(o => o.key === s);
                  if (!opt) return null;
                  return (
                    <div key={s} className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{opt.icon} {opt.label} (${opt.price} × {days}d × {guests})</span>
                      <span className="text-foreground">${opt.price * days * guests}</span>
                    </div>
                  );
                })}
                {selectedSpecialRequests.length > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">✨ Special requests ({selectedSpecialRequests.length})</span>
                    <span className="text-foreground">${specialRequestFee}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Service fee</span>
                  <span className="text-foreground">${serviceFee}</span>
                </div>
                <div className="flex justify-between text-sm font-semibold border-t border-border pt-2">
                  <span className="text-foreground">Total</span>
                  <span className="text-foreground">${total}</span>
                </div>
              </div>

              {/* Chat button */}
              <Button variant="outline" className="w-full rounded-full gap-2" onClick={() => setChatOpen(true)}>
                <MessageCircle className="w-4 h-4" /> Chat with {host.name}
              </Button>
            </div>
          </div>
        </div>
      </div>
      <Footer />
      <ChatPanel receiverId={host.id} receiverName={host.name} receiverImage={host.image} isOpen={chatOpen} onClose={() => setChatOpen(false)} />
    </div>
  );
};

export default Booking;
