import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { MapPin, Calendar, Users, Clock, Bike, Car, Bus, Compass, Train, ArrowLeft, Share2, Heart, CheckCircle, Shield, HelpCircle, Flame, TrendingUp, Star, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

const tripTypeLabels: Record<string, string> = {
  bike_tour: "🏍️ Bike Tour", car_trip: "🚗 Car Trip", bus_trip: "🚌 Bus Trip", road_trip: "🛣️ Road Trip", train_trip: "🚂 Train Trip",
};
const tripTypeIcons: Record<string, React.ElementType> = {
  bike_tour: Bike, car_trip: Car, bus_trip: Bus, road_trip: Compass, train_trip: Train,
};

const tripFAQs = [
  { q: "How do I join this trip?", a: "Click 'Join This Trip' and submit a booking request. The trip organizer will confirm your spot within 24 hours." },
  { q: "Can I cancel after joining?", a: "Yes, free cancellation up to 7 days before the start date. After that, a 50% refund applies." },
  { q: "What should I bring?", a: "The organizer will share a packing list after confirmation. Essentials: ID proof, comfortable clothing, personal medication." },
  { q: "Is travel insurance included?", a: "Basic platform insurance is included. We recommend getting additional travel insurance for adventure trips." },
  { q: "What if the trip gets cancelled?", a: "Full refund if cancelled by the organizer. We also help find alternative trips." },
];

const TripDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const { toast } = useToast();
  const [trip, setTrip] = useState<any>(null);
  const [creator, setCreator] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [openFAQ, setOpenFAQ] = useState<number | null>(null);
  const [joinedCount] = useState(() => Math.floor(Math.random() * 6) + 2);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      const { data } = await supabase.from("trip_listings").select("*").eq("id", id).single();
      if (data) {
        setTrip(data);
        const { data: profile } = await supabase.from("profiles").select("*").eq("id", data.creator_id).single();
        setCreator(profile);
      }
      setLoading(false);
    };
    fetchData();
  }, [id]);

  if (loading) return <div className="min-h-screen bg-background"><Navbar /><div className="pt-24 text-center text-muted-foreground">Loading...</div></div>;
  if (!trip) return <div className="min-h-screen bg-background"><Navbar /><div className="pt-24 text-center text-muted-foreground">Trip not found</div></div>;

  const share = () => {
    if (navigator.share) navigator.share({ title: trip.title, url: window.location.href });
    else { navigator.clipboard.writeText(window.location.href); toast({ title: "Link copied!" }); }
  };

  const TripIcon = tripTypeIcons[trip.trip_type] || Compass;
  const spotsLeft = (trip.max_travelers || 10) - joinedCount;
  const isTrending = joinedCount >= 5;
  const isPopular = joinedCount >= 3;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-20 px-4 sm:px-6 lg:px-8 mx-auto max-w-5xl pb-16">
        <Link to="/trips" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="w-4 h-4" /> Back to Trips
        </Link>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          {trip.image_url && (
            <div className="relative aspect-[21/9] rounded-2xl overflow-hidden mb-6">
              <img src={trip.image_url} alt={trip.title} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-background/60 to-transparent" />
              {/* Tags overlay */}
              <div className="absolute top-4 left-4 flex gap-2">
                {isTrending && (
                  <span className="flex items-center gap-1 text-xs font-bold px-3 py-1 rounded-full bg-destructive text-destructive-foreground">
                    <Flame className="w-3 h-3" /> HOT
                  </span>
                )}
                {isPopular && (
                  <span className="flex items-center gap-1 text-xs font-bold px-3 py-1 rounded-full bg-primary text-primary-foreground">
                    <TrendingUp className="w-3 h-3" /> Popular
                  </span>
                )}
                {trip.nature === "spiritual" || trip.nature === "holy" ? (
                  <span className="text-xs font-bold px-3 py-1 rounded-full bg-accent text-accent-foreground">⭐ Must Go</span>
                ) : null}
              </div>
            </div>
          )}

          {/* Tags row */}
          <div className="flex flex-wrap gap-2 mb-3">
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-primary/10 text-primary capitalize">{trip.nature}</span>
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-secondary text-foreground">
              {tripTypeLabels[trip.trip_type] || trip.trip_type}
            </span>
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-secondary text-muted-foreground">
              {trip.trip_direction === "round_trip" ? "🔄 Round Trip" : "➡️ One Way"}
            </span>
            {isTrending && <span className="text-xs font-bold px-3 py-1 rounded-full bg-destructive/10 text-destructive flex items-center gap-1"><Flame className="w-3 h-3" /> Trending</span>}
          </div>

          <h1 className="text-3xl sm:text-4xl font-bold text-foreground">{trip.title}</h1>
          {trip.destination && <p className="text-muted-foreground mt-1 flex items-center gap-1"><MapPin className="w-4 h-4" /> {trip.destination}</p>}

          {/* Joined travelers banner */}
          <div className="mt-4 flex items-center gap-3 rounded-xl bg-primary/5 border border-primary/10 px-4 py-3">
            <div className="flex -space-x-2">
              {Array.from({ length: Math.min(joinedCount, 5) }).map((_, i) => (
                <div key={i} className="w-8 h-8 rounded-full bg-primary/20 border-2 border-background flex items-center justify-center text-xs font-bold text-primary">
                  {String.fromCharCode(65 + i)}
                </div>
              ))}
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">{joinedCount} travelers joined</p>
              <p className="text-xs text-muted-foreground">{spotsLeft > 0 ? `${spotsLeft} spots left` : "Fully booked!"}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
            <div className="lg:col-span-2 space-y-6">
              {trip.description && (
                <div className="rounded-2xl bg-card p-6 shadow-card">
                  <h2 className="text-lg font-bold text-foreground mb-3">About This Trip</h2>
                  <p className="text-muted-foreground whitespace-pre-line">{trip.description}</p>
                </div>
              )}

              {trip.route && (
                <div className="rounded-2xl bg-card p-6 shadow-card">
                  <h2 className="text-lg font-bold text-foreground mb-3 flex items-center gap-2"><MapPin className="w-5 h-5 text-primary" /> Route</h2>
                  <p className="text-muted-foreground">{trip.route}</p>
                </div>
              )}

              {/* Date & Vehicle Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="rounded-2xl bg-card p-5 shadow-card">
                  <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2"><Calendar className="w-4 h-4 text-primary" /> Travel Dates</h3>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <p><span className="font-medium text-foreground">Start:</span> {trip.start_date || "TBD"}</p>
                    {trip.end_date && <p><span className="font-medium text-foreground">End:</span> {trip.end_date}</p>}
                    <p><span className="font-medium text-foreground">Duration:</span> {trip.duration || "Flexible"}</p>
                  </div>
                </div>
                <div className="rounded-2xl bg-card p-5 shadow-card">
                  <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2"><TripIcon className="w-4 h-4 text-primary" /> Vehicle & Transport</h3>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <p><span className="font-medium text-foreground">Type:</span> {tripTypeLabels[trip.trip_type] || trip.trip_type}</p>
                    <p><span className="font-medium text-foreground">Direction:</span> {trip.trip_direction === "round_trip" ? "Round Trip" : "One Way"}</p>
                    {trip.includes_transport && <p className="flex items-center gap-1 text-accent"><CheckCircle className="w-3 h-3" /> Transport included in price</p>}
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { label: "Duration", value: trip.duration || "Flexible", icon: Clock },
                  { label: "Max Travelers", value: trip.max_travelers, icon: Users },
                  { label: "Joined", value: `${joinedCount}/${trip.max_travelers || 10}`, icon: Star },
                  { label: "Price Model", value: trip.price_model, icon: Compass },
                ].map(s => (
                  <div key={s.label} className="rounded-xl bg-card p-4 shadow-card text-center">
                    <s.icon className="w-5 h-5 text-primary mx-auto mb-1" />
                    <p className="text-sm font-bold text-foreground capitalize">{s.value}</p>
                    <p className="text-[10px] text-muted-foreground">{s.label}</p>
                  </div>
                ))}
              </div>

              {/* Inclusions */}
              <div className="rounded-2xl bg-card p-6 shadow-card">
                <h2 className="text-lg font-bold text-foreground mb-3">What's Included</h2>
                <div className="grid grid-cols-2 gap-3">
                  {trip.includes_food && <div className="flex items-center gap-2 text-sm text-muted-foreground"><CheckCircle className="w-4 h-4 text-accent" /> Food & Meals</div>}
                  {trip.includes_stay && <div className="flex items-center gap-2 text-sm text-muted-foreground"><CheckCircle className="w-4 h-4 text-accent" /> Accommodation</div>}
                  {trip.includes_transport && <div className="flex items-center gap-2 text-sm text-muted-foreground"><CheckCircle className="w-4 h-4 text-accent" /> Transport</div>}
                  {trip.includes_activities && <div className="flex items-center gap-2 text-sm text-muted-foreground"><CheckCircle className="w-4 h-4 text-accent" /> Activities</div>}
                </div>
                {trip.inclusions && trip.inclusions.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {trip.inclusions.map((inc: string) => (
                      <span key={inc} className="text-xs bg-secondary text-foreground px-3 py-1 rounded-full">{inc}</span>
                    ))}
                  </div>
                )}
              </div>

              {trip.highlights && trip.highlights.length > 0 && (
                <div className="rounded-2xl bg-card p-6 shadow-card">
                  <h2 className="text-lg font-bold text-foreground mb-3">Highlights</h2>
                  <div className="flex flex-wrap gap-2">
                    {trip.highlights.map((h: string) => (
                      <span key={h} className="text-sm bg-primary/5 text-primary border border-primary/20 px-3 py-1.5 rounded-full">{h}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* FAQ Section */}
              <div className="rounded-2xl bg-card p-6 shadow-card">
                <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2"><HelpCircle className="w-5 h-5 text-primary" /> Frequently Asked Questions</h2>
                <div className="space-y-2">
                  {tripFAQs.map((faq, i) => (
                    <div key={i} className="rounded-xl border border-border overflow-hidden">
                      <button onClick={() => setOpenFAQ(openFAQ === i ? null : i)}
                        className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-foreground hover:bg-secondary/50 transition-colors text-left">
                        {faq.q}
                        {openFAQ === i ? <ChevronUp className="w-4 h-4 text-muted-foreground shrink-0" /> : <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />}
                      </button>
                      {openFAQ === i && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="px-4 pb-3">
                          <p className="text-sm text-muted-foreground">{faq.a}</p>
                        </motion.div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 space-y-4">
                <div className="rounded-2xl bg-card p-5 shadow-card">
                  <div className="flex items-baseline gap-1 mb-2">
                    <span className="text-3xl font-bold text-foreground">${trip.total_price}</span>
                    <span className="text-sm text-muted-foreground">
                      {trip.price_model === "per_person" ? "/person" : trip.price_model === "split" ? " (split equally)" : " total"}
                    </span>
                  </div>
                  {spotsLeft <= 3 && spotsLeft > 0 && (
                    <p className="text-xs text-destructive font-semibold mb-3">🔥 Only {spotsLeft} spots left!</p>
                  )}
                  {user ? (
                    <Button className="w-full rounded-full" size="lg" onClick={() => toast({ title: "Booking request sent!" })} disabled={spotsLeft <= 0}>
                      {spotsLeft > 0 ? "Join This Trip" : "Fully Booked"}
                    </Button>
                  ) : (
                    <Link to="/signup"><Button className="w-full rounded-full" size="lg">Sign Up to Join</Button></Link>
                  )}
                  <div className="flex gap-2 mt-3">
                    <Button variant="outline" className="flex-1 rounded-full gap-1 text-sm"><Heart className="w-4 h-4" /> Save</Button>
                    <Button variant="outline" className="flex-1 rounded-full gap-1 text-sm" onClick={share}><Share2 className="w-4 h-4" /> Share</Button>
                  </div>
                </div>

                {/* Creator / Traveler Info */}
                {creator && (
                  <div className="rounded-2xl bg-card p-5 shadow-card">
                    <h3 className="text-sm font-bold text-foreground mb-3">Trip Organizer</h3>
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-lg font-bold text-primary">
                        {creator.avatar_url ? (
                          <img src={creator.avatar_url} alt={creator.first_name} className="w-full h-full rounded-full object-cover" />
                        ) : (creator.first_name?.[0] || "?")}
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">{creator.first_name} {creator.last_name || ""}</p>
                        {creator.nationality && <p className="text-xs text-muted-foreground">📍 {creator.nationality}</p>}
                      </div>
                    </div>
                    {creator.bio && <p className="text-xs text-muted-foreground mt-3 line-clamp-3">{creator.bio}</p>}
                    {creator.travel_styles && creator.travel_styles.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-1">
                        {creator.travel_styles.map((s: string) => (
                          <span key={s} className="text-[10px] bg-secondary text-muted-foreground px-2 py-0.5 rounded-full">{s}</span>
                        ))}
                      </div>
                    )}
                    {creator.interests && creator.interests.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {creator.interests.map((i: string) => (
                          <span key={i} className="text-[10px] bg-primary/5 text-primary px-2 py-0.5 rounded-full">{i}</span>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                <div className="rounded-2xl bg-primary/5 border border-primary/20 p-5">
                  <h3 className="text-sm font-bold text-foreground mb-2">🛡️ Safety</h3>
                  <ul className="space-y-1.5 text-xs text-muted-foreground">
                    <li className="flex items-start gap-1.5"><Shield className="w-3 h-3 text-accent mt-0.5" /> Verified trip organizer</li>
                    <li className="flex items-start gap-1.5"><Shield className="w-3 h-3 text-accent mt-0.5" /> Secure payment via platform</li>
                    <li className="flex items-start gap-1.5"><Shield className="w-3 h-3 text-accent mt-0.5" /> 24/7 support during trip</li>
                    <li className="flex items-start gap-1.5"><Shield className="w-3 h-3 text-accent mt-0.5" /> Free cancellation up to 7 days</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
      <Footer />
    </div>
  );
};

export default TripDetail;
