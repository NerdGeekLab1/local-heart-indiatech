import { useEffect, useState } from "react";
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
import { useCurrency } from "@/contexts/CurrencyContext";
import SpecialRequestEditor, { CustomRequest } from "@/components/booking/SpecialRequestEditor";
import BookingMapPreview from "@/components/booking/BookingMapPreview";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { usePlatformSettings } from "@/hooks/usePlatformSettings";
import { computeBookingCharges } from "@/lib/bookingCharges";


/** Service catalogue — prices are always derived from the host's own live listings. */
const serviceCatalogue = [
  { key: "Guide", label: "Local Guide", desc: "Personalized tours & experiences", icon: "🧭" },
  { key: "Stay", label: "Homestay", desc: "Authentic local accommodation", icon: "🏡" },
  { key: "Transport", label: "Transport", desc: "Vehicle with host as driver", icon: "🚗" },
  { key: "Food", label: "Food & Dining", desc: "Home-cooked meals & food experiences", icon: "🍛" },
];

type HostAddon = { id: string; name: string; emoji: string; description?: string | null; price: number };

const minPrice = (rows: any[] | undefined, field: string) => {
  const values = (rows || []).map(row => Number(row?.[field] || 0)).filter(value => value > 0);
  return values.length ? Math.min(...values) : 0;
};


const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const Booking = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const mockHost = hosts.find(h => h.id === id);
  const { user } = useAuth();
  const { toast } = useToast();
  const { format: formatCurrency } = useCurrency();
  const { settings: platformSettings } = usePlatformSettings();
  const navigate = useNavigate();

  // Real hosts live in the database and are resolved by uuid or username slug.
  const [dbHost, setDbHost] = useState<typeof mockHost | null>(null);
  const [hostLoading, setHostLoading] = useState(!mockHost);
  /** Live prices + add-ons published by this host. */
  const [hostRates, setHostRates] = useState<Record<string, number>>({});
  const [hostAddons, setHostAddons] = useState<HostAddon[]>([]);

  useEffect(() => {
    if (!id || mockHost) { setHostLoading(false); return; }
    let active = true;
    setHostLoading(true);
    supabase.rpc("get_public_host", { _identifier: id }).then(({ data }) => {
      if (!active) return;
      const result = data as any;
      const profile = result?.profile;
      if (profile) {
        const reviews = result?.reviews ?? [];
        const rating = reviews.length
          ? reviews.reduce((sum: number, r: any) => sum + Number(r.rating || 0), 0) / reviews.length
          : 0;
        setDbHost({
          id: profile.id,
          name: profile.full_name || "Host",
          city: profile.city || "",
          image: profile.avatar_url || "/placeholder.svg",
          rating: rating ? Number(rating.toFixed(1)) : 0,
          services: profile.services ?? [],
        } as any);
        setHostRates({
          Guide: Number(profile.price_per_day || 0),
          Stay: minPrice(result?.properties, "nightly_rate"),
          Transport: minPrice(result?.transports, "price_per_day"),
          Food: minPrice(result?.dishes, "price_per_plate"),
        });
        setHostAddons((result?.addons ?? []).map((addon: any) => ({ ...addon, price: Number(addon.price || 0) })));
      } else {
        setDbHost(null);
      }
      setHostLoading(false);
    });
    return () => { active = false; };
  }, [id, mockHost]);

  const host = mockHost ?? dbHost;
  const isRealHost = !!host && UUID_RE.test(host.id);
  /** Only services the host actually priced can be booked. */
  const serviceOptions = serviceCatalogue
    .map(service => ({ ...service, price: hostRates[service.key] ?? 0 }))
    .filter(service => service.price > 0);



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
  const [customRequests, setCustomRequests] = useState<CustomRequest[]>([]);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [draftReady, setDraftReady] = useState(false);

  const draftKey = user && id ? `travelista-booking-draft:${user.id}:${id}` : null;
  useEffect(() => {
    if (!draftKey) return;
    try {
      const saved = JSON.parse(window.localStorage.getItem(draftKey) || "null");
      if (saved) {
        setStep(Math.min(4, Math.max(1, Number(saved.step) || 1)));
        setSelectedServices(Array.isArray(saved.selectedServices) ? saved.selectedServices : []);
        setStartDate(saved.startDate ? new Date(saved.startDate) : undefined);
        setEndDate(saved.endDate ? new Date(saved.endDate) : undefined);
        setGuests(Number(saved.guests) || 1);
        setMessage(saved.message || "");
        setSelectedSpecialRequests(Array.isArray(saved.selectedSpecialRequests) ? saved.selectedSpecialRequests : []);
        setCustomRequests(Array.isArray(saved.customRequests) ? saved.customRequests : []);
      }
    } catch {
      window.localStorage.removeItem(draftKey);
    }
    setDraftReady(true);
  }, [draftKey]);

  useEffect(() => {
    if (!draftKey || !draftReady || submitted) return;
    window.localStorage.setItem(draftKey, JSON.stringify({ step, selectedServices, startDate: startDate?.toISOString(), endDate: endDate?.toISOString(), guests, message, selectedSpecialRequests, customRequests }));
  }, [customRequests, draftKey, draftReady, endDate, guests, message, selectedServices, selectedSpecialRequests, startDate, step, submitted]);



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

  if (hostLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="mx-auto max-w-5xl px-4 pt-28">
          <div className="h-40 animate-pulse rounded-2xl bg-secondary" />
        </div>
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
  const chosenAddons = hostAddons.filter(addon => selectedSpecialRequests.includes(addon.id));
  const specialRequestFee = chosenAddons.reduce((sum, addon) => sum + addon.price, 0);
  const allRequestLabels = [...chosenAddons.map(addon => addon.name), ...customRequests.map(item => `${item.type}: ${item.detail}`)];

  const charges = computeBookingCharges(servicePricing + specialRequestFee, platformSettings);
  const serviceFee = charges.platformFee;
  const total = charges.total;

  const canProceed = () => {
    if (step === 1) return selectedServices.length > 0;
    if (step === 2) return startDate && endDate && endDate > startDate;
    if (step === 3) return true;
    if (step === 4) return true;
    return false;
  };

  const handleSubmit = async () => {
    if (!user || !startDate || !endDate) return;
    // Demo hosts (from static data) can't be booked in the DB – their IDs aren't UUIDs.
    if (!isRealHost) {
      toast({
        title: "Demo host — booking not available",
        description: "This is a sample host profile. Try booking a verified host from Explore.",
        variant: "destructive",
      });
      setSubmitted(true);
      return;
    }
    const { data: created, error } = await supabase.from("bookings").insert({
      traveler_id: user.id,
      host_id: host.id,
      start_date: startDate.toISOString().split("T")[0],
      end_date: endDate.toISOString().split("T")[0],
      guests,
      services: selectedServices,
      special_requests: allRequestLabels,
      total_price: total,
      platform_fee: charges.platformFee,
      handling_charge: charges.handlingCharge,
      gst_amount: charges.gstAmount,
      commission_amount: charges.platformFee + charges.handlingCharge,

      message: message || null,
      status: "pending",
    }).select().maybeSingle();
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return;
    }
    setSubmitted(true);
    if (created) { setCreatedBooking(created as ItineraryBooking); setItineraryOpen(true); }
    if (draftKey) window.localStorage.removeItem(draftKey);
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
              {chosenAddons.map(addon => <div key={addon.id} className="flex justify-between gap-3 text-sm"><span><strong>{addon.emoji} {addon.name}</strong>{addon.description ? <span className="block text-xs text-muted-foreground">{addon.description}</span> : null}</span><span>{formatCurrency(addon.price)}</span></div>)}
              {customRequests.map(item => <p key={`${item.type}-${item.detail}`} className="text-sm"><strong>{item.type}:</strong> {item.detail}</p>)}
              <p className="text-sm"><strong>Platform fee:</strong> {formatCurrency(charges.platformFee)} · <strong>Handling:</strong> {formatCurrency(charges.handlingCharge)} · <strong>GST:</strong> {formatCurrency(charges.gstAmount)}</p>
              <p className="text-sm font-semibold"><strong>Total:</strong> {formatCurrency(total)}</p>
            </div>
            <div className="mt-8 flex gap-3 justify-center flex-wrap">
            <div className="mt-8 flex gap-3 justify-center flex-wrap">
              {createdBooking && (
                <Button variant="outline" className="rounded-full px-6" onClick={() => setItineraryOpen(true)}>
                  <CalendarDays className="w-4 h-4 mr-2" /> View full itinerary
                </Button>
              )}
              <Button variant="outline" className="rounded-full px-6" onClick={() => setChatOpen(true)}>
                <MessageCircle className="w-4 h-4 mr-2" /> Chat with {host.name}
              </Button>
              <Link to="/dashboard/traveler"><Button className="rounded-full px-6">Go to Dashboard</Button></Link>
            </div>
          </motion.div>
        </div>
        <Footer />
        <BookingItineraryDialog booking={createdBooking} hostName={host.name} open={itineraryOpen} onOpenChange={setItineraryOpen} />
        {isRealHost && <ChatPanel receiverId={host.id} receiverName={host.name} receiverImage={host.image} isOpen={chatOpen} onClose={() => setChatOpen(false)} />}
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
                  <p className="mt-1 text-muted-foreground">Rates below come straight from {host.name}'s live listings</p>
                  {serviceOptions.length === 0 && (
                    <p className="mt-4 rounded-xl border border-border bg-card p-4 text-sm text-muted-foreground">
                      {host.name} hasn't published prices yet. Message them to arrange a custom trip.
                    </p>
                  )}
                  <div className="mt-6 space-y-3">

                    {serviceOptions.filter(s => !host.services?.length || host.services.includes(s.key)).map(s => (
                      <button key={s.key} onClick={() => toggleService(s.key)}
                        className={`w-full flex items-center gap-4 rounded-xl p-4 text-left transition-all border ${
                          selectedServices.includes(s.key) ? "border-primary bg-primary/5 shadow-card" : "border-border bg-card hover:border-primary/30"
                        }`}>
                        <span className="text-2xl">{s.icon}</span>
                        <div className="flex-1">
                          <p className="font-semibold text-foreground">{s.label}</p>
                          <p className="text-sm text-muted-foreground">{s.desc}</p>
                        </div>
                        <span className="text-lg font-bold text-primary">{formatCurrency(s.price)}<span className="text-xs font-normal text-muted-foreground">/day</span></span>
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
                <SpecialRequestEditor
                  hostName={host.name}
                  addons={hostAddons}
                  selectedAddonIds={selectedSpecialRequests}
                  onToggleAddon={toggleSpecialRequest}
                  customRequests={customRequests}
                  onChangeCustom={setCustomRequests}
                  formatCurrency={formatCurrency}
                />
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
                <Button onClick={() => setConfirmOpen(true)} disabled={!canProceed()} className="rounded-full px-8 gap-2">
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

              <BookingMapPreview city={host.city} hostName={host.name} />

              {/* Pricing breakdown */}
              <div className="border-t border-border pt-4 space-y-2">
                {selectedServices.map(s => {
                  const opt = serviceOptions.find(o => o.key === s);
                  if (!opt) return null;
                  return (
                    <div key={s} className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{opt.icon} {opt.label} ({formatCurrency(opt.price)} × {days}d × {guests})</span>
                      <span className="text-foreground">{formatCurrency(opt.price * days * guests)}</span>
                    </div>
                  );
                })}
                {chosenAddons.map(addon => (
                  <div key={addon.id} className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{addon.emoji} {addon.name}</span>
                    <span className="text-foreground">{formatCurrency(addon.price)}</span>
                  </div>
                ))}

                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Platform fee ({platformSettings.platform_fee_percent}%)</span>
                  <span className="text-foreground">{formatCurrency(charges.platformFee)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Handling charges</span>
                  <span className="text-foreground">{formatCurrency(charges.handlingCharge)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">GST ({platformSettings.gst_percent}%)</span>
                  <span className="text-foreground">{formatCurrency(charges.gstAmount)}</span>
                </div>
                <div className="flex justify-between text-sm font-semibold border-t border-border pt-2">
                  <span className="text-foreground">Total</span>
                  <span className="text-foreground">{formatCurrency(total)}</span>
                </div>
              </div>

              {/* Chat button */}
              <Button
                variant="outline"
                className="w-full rounded-full gap-2"
                onClick={() => {
                  if (!isRealHost) {
                    toast({ title: "Demo host", description: "Chat is available with verified hosts only." });
                    return;
                  }
                  setChatOpen(true);
                }}
                disabled={!isRealHost}
                title={isRealHost ? undefined : "Chat is available with verified hosts only"}
              >
                <MessageCircle className="w-4 h-4" /> Chat with {host.name}
              </Button>
              {!isRealHost && (
                <p className="text-[11px] text-muted-foreground text-center">
                  This is a sample host — chat & bookings work with verified hosts.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
      <Footer />
      {isRealHost && <ChatPanel receiverId={host.id} receiverName={host.name} receiverImage={host.image} isOpen={chatOpen} onClose={() => setChatOpen(false)} />}
      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent data-testid="booking-confirm-dialog">
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm your request details</AlertDialogTitle>
            <AlertDialogDescription>
              {host.name} will review and confirm each item before your trip.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-2 rounded-xl bg-secondary/40 p-4 text-sm">
            <p><strong>Services:</strong> {selectedServices.join(", ") || "—"}</p>
            {startDate && endDate && <p><strong>Dates:</strong> {format(startDate, "PPP")} – {format(endDate, "PPP")}</p>}
            <p><strong>Guests:</strong> {guests}</p>
            {chosenAddons.length || customRequests.length ? <div><strong>Special requests:</strong><ul className="mt-1 space-y-1">{chosenAddons.map(addon => <li key={addon.id} className="flex justify-between gap-3"><span>{addon.emoji} {addon.name}{addon.description ? ` — ${addon.description}` : ""}</span><span>{formatCurrency(addon.price)}</span></li>)}{customRequests.map(item => <li key={`${item.type}-${item.detail}`}>{item.type}: {item.detail}</li>)}</ul></div> : <p><strong>Special requests:</strong> None</p>}
            <p className="font-semibold"><strong>Total:</strong> {formatCurrency(total)}</p>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep editing</AlertDialogCancel>
            <AlertDialogAction onClick={handleSubmit}>Send booking request</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Booking;
