import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Star, Clock, MapPin, Users, Play, ArrowLeft, CheckCircle, Calendar, Shield, Bike, Mountain, Globe, Heart, Share2, Clock3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { experiences, hosts, reviews } from "@/lib/data";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

// Bike experiences from Experiences page
const bikeExperiences = [
  {
    id: "exp-bike-ladakh", title: "Leh-Ladakh Bike Expedition", description: "Ride through the world's highest motorable passes on a Royal Enfield. Cross Khardung La (18,380 ft) and experience breathtaking Himalayan landscapes.",
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=600&q=80",
    price: 350, duration: "7 Days", category: "Bike Tour", hostId: "arjun-varanasi", hostName: "Arjun", hostCity: "Varanasi", rating: 4.9, reviewCount: 45,
    difficulty: "Hard" as const, groupSize: "4-8", maxGuests: 8,
    includes: ["Royal Enfield 500cc", "Fuel", "Mechanic support", "Camping gear", "Meals", "Permits", "First aid", "Oxygen cylinder"],
    highlights: ["Khardung La Pass", "Pangong Lake", "Nubra Valley", "Magnetic Hill", "Monasteries"],
    vehicleType: "Motorcycle", vehicleDetails: { model: "Royal Enfield Himalayan", capacity: 1, type: "Motorcycle" },
    isYearRound: false, validFrom: "2026-06-01", validTo: "2026-09-30", lastBookingDate: "2026-05-15",
    schedule: [
      { day: "Day 1", title: "Arrival in Leh", desc: "Acclimatization day. Explore Leh Market & Shanti Stupa." },
      { day: "Day 2", title: "Leh to Khardung La", desc: "Ride to world's highest motorable pass at 18,380 ft." },
      { day: "Day 3", title: "Nubra Valley", desc: "Ride through Nubra Valley, visit Diskit Monastery & sand dunes." },
      { day: "Day 4", title: "Nubra to Pangong", desc: "Scenic ride to Pangong Lake via Shyok River route." },
      { day: "Day 5", title: "Pangong Lake", desc: "Sunrise at Pangong, explore the lake's changing colors." },
      { day: "Day 6", title: "Return to Leh", desc: "Ride back via Chang La pass. Evening free." },
      { day: "Day 7", title: "Departure", desc: "Morning market visit, farewell breakfast, departure." },
    ],
  },
  {
    id: "exp-bike-mahabaleshwar", title: "Mahabaleshwar Scooty Tour", description: "Explore the lush Western Ghats on a scooty — visit strawberry farms, ancient temples, and stunning viewpoints.",
    image: "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=600&q=80",
    price: 45, duration: "Full Day", category: "Bike Tour", hostId: "kiran-mumbai", hostName: "Kiran", hostCity: "Mumbai", rating: 4.7, reviewCount: 32,
    difficulty: "Easy" as const, groupSize: "2-6", maxGuests: 6,
    includes: ["Honda Activa", "Helmet", "Route map", "Lunch", "Strawberry farm entry"],
    highlights: ["Arthur's Seat", "Elephant's Head Point", "Strawberry Farms", "Mapro Garden", "Ancient Temples"],
    vehicleType: "Scooter", vehicleDetails: { model: "Honda Activa 6G", capacity: 2, type: "Scooter" },
    isYearRound: true,
    schedule: [
      { day: "8:00 AM", title: "Meet at base", desc: "Pick up your scooty and safety briefing." },
      { day: "9:00 AM", title: "Strawberry Farms", desc: "Visit organic strawberry farms and taste fresh produce." },
      { day: "11:00 AM", title: "Viewpoints", desc: "Arthur's Seat and Elephant's Head Point panoramic views." },
      { day: "1:00 PM", title: "Lunch", desc: "Local Maharashtrian thali at a hilltop restaurant." },
      { day: "3:00 PM", title: "Mapro Garden & Temples", desc: "Explore Mapro Garden and ancient temples." },
      { day: "5:00 PM", title: "Return", desc: "Scenic ride back and drop off." },
    ],
  },
  {
    id: "exp-bike-goa-cruise", title: "Goa Coastal Bike Cruise", description: "Cruise along Goa's scenic coastal roads on a Royal Enfield, stopping at hidden beaches, Portuguese forts, and local tavernas.",
    image: "https://images.unsplash.com/photo-1506929562872-bb421503ef21?w=600&q=80",
    price: 65, duration: "Full Day", category: "Bike Tour", hostId: "meera-goa", hostName: "Meera", hostCity: "Goa", rating: 4.8, reviewCount: 28,
    difficulty: "Easy" as const, groupSize: "2-10", maxGuests: 10,
    includes: ["Royal Enfield Classic 350", "Helmet", "Fuel", "Lunch at beach shack", "GoPro footage"],
    highlights: ["Fort Aguada", "Vagator Beach", "Chapora Fort", "Spice Plantation", "Beach Sunset"],
    vehicleType: "Motorcycle", vehicleDetails: { model: "Royal Enfield Classic 350", capacity: 2, type: "Motorcycle" },
    isYearRound: false, validFrom: "2026-10-01", validTo: "2027-03-31",
    schedule: [
      { day: "7:30 AM", title: "Meet at Panjim", desc: "Bike allocation and coastal route briefing." },
      { day: "9:00 AM", title: "Fort Aguada", desc: "Explore the iconic Portuguese fort and lighthouse." },
      { day: "11:00 AM", title: "Beach Hopping", desc: "Vagator, Anjuna and hidden coves along the coast." },
      { day: "1:00 PM", title: "Beach Shack Lunch", desc: "Fresh seafood lunch at a beachside shack." },
      { day: "3:00 PM", title: "Chapora & Spice Farm", desc: "Chapora Fort views and spice plantation visit." },
      { day: "5:30 PM", title: "Sunset Ride", desc: "Ride along the coast for sunset. GoPro highlights shared." },
    ],
  },
  {
    id: "exp-bike-rajasthan", title: "Royal Rajasthan Bike Safari", description: "Ride through desert landscapes, visit ancient forts, and camp under the stars in the Thar Desert.",
    image: "https://images.unsplash.com/photo-1477587458883-47145ed94245?w=600&q=80",
    price: 280, duration: "5 Days", category: "Bike Tour", hostId: "ravi-jaipur", hostName: "Ravi", hostCity: "Jaipur", rating: 4.9, reviewCount: 19,
    difficulty: "Moderate" as const, groupSize: "4-12", maxGuests: 12,
    includes: ["Royal Enfield Himalayan", "Fuel", "Desert camping", "All meals", "Support vehicle", "Mechanic"],
    highlights: ["Mehrangarh Fort", "Thar Desert", "Jaisalmer", "Sam Sand Dunes", "Village stays"],
    vehicleType: "Motorcycle", vehicleDetails: { model: "Royal Enfield Himalayan", capacity: 1, type: "Motorcycle" },
    isYearRound: false, validFrom: "2026-10-01", validTo: "2027-03-31", lastBookingDate: "2026-09-15",
    schedule: [
      { day: "Day 1", title: "Jaipur to Pushkar", desc: "Ride through Aravalli hills, visit Pushkar Lake & Brahma Temple." },
      { day: "Day 2", title: "Pushkar to Jodhpur", desc: "Desert highway ride. Evening Mehrangarh Fort visit." },
      { day: "Day 3", title: "Jodhpur to Jaisalmer", desc: "Golden city arrival, explore havelis and fort." },
      { day: "Day 4", title: "Sam Sand Dunes", desc: "Desert ride, camel safari, and camping under stars." },
      { day: "Day 5", title: "Return via Village", desc: "Rural Rajasthan villages, farewell dinner in Jodhpur." },
    ],
  },
];

const allExperiences = [...experiences, ...bikeExperiences];

const ExperienceDetail = () => {
  const { id } = useParams();
  const { toast } = useToast();
  const { user } = useAuth();
  const [liked, setLiked] = useState(false);
  const exp = allExperiences.find(e => e.id === id);

  if (!exp) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground">Experience not found</h1>
          <Link to="/experiences" className="text-primary mt-2 inline-block hover:underline">Back to Experiences</Link>
        </div>
      </div>
    );
  }

  const host = hosts.find(h => h.id === exp.hostId);
  const hostReviews = reviews.filter(r => r.hostId === exp.hostId).slice(0, 3);
  const isBike = "vehicleType" in exp;
  const schedule = "schedule" in exp ? (exp as any).schedule : null;
  const includes = exp.includes || [];
  const highlights = exp.highlights || [];
  const validFrom = "validFrom" in exp ? (exp as any).validFrom : null;
  const validTo = "validTo" in exp ? (exp as any).validTo : null;
  const lastBookingDate = "lastBookingDate" in exp ? (exp as any).lastBookingDate : null;
  const isYearRound = "isYearRound" in exp ? (exp as any).isYearRound : true;
  const maxGuests = "maxGuests" in exp ? (exp as any).maxGuests : null;
  const vehicleDetails = "vehicleDetails" in exp ? (exp as any).vehicleDetails : null;

  const fallbackTimeline = [
    { day: "Start", title: "Meet your host", desc: `${exp.hostName} picks you up or meets you at the starting point` },
    { day: "Morning", title: "Immersive experience begins", desc: exp.description },
    { day: "Midday", title: "Local meal included", desc: "Enjoy authentic local cuisine prepared by or recommended by your host" },
    { day: "Afternoon", title: "Deeper exploration", desc: "Visit hidden gems and interact with locals for a truly authentic experience" },
    { day: "End", title: "Farewell & memories", desc: "Exchange contacts, get local tips, and take home unforgettable memories" },
  ];

  const timeline = schedule || fallbackTimeline;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-20 pb-16">
        {/* Hero Image */}
        <div className="relative h-[50vh] min-h-[350px] overflow-hidden">
          <img src={exp.image} alt={exp.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 via-transparent to-foreground/20" />
          <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-10 mx-auto max-w-5xl">
            <Link to="/experiences" className="inline-flex items-center gap-1 text-sm text-primary-foreground/80 hover:text-primary-foreground mb-3">
              <ArrowLeft className="w-4 h-4" /> Experiences
            </Link>
            <div className="flex flex-wrap gap-2 mb-2">
              <span className="inline-block text-xs uppercase tracking-wider font-bold text-primary-foreground bg-primary/80 px-2 py-0.5 rounded-sm">
                {exp.category}
              </span>
              {isBike && vehicleDetails && (
                <span className="inline-block text-xs uppercase tracking-wider font-bold text-primary-foreground bg-accent/80 px-2 py-0.5 rounded-sm">
                  {vehicleDetails.type === "Motorcycle" ? "🏍️ Bike" : "🛵 Scooty"}
                </span>
              )}
              {exp.difficulty && (
                <span className={`inline-block text-xs uppercase tracking-wider font-bold px-2 py-0.5 rounded-sm ${exp.difficulty === "Hard" || exp.difficulty === "Extreme" ? "bg-destructive/80 text-destructive-foreground" : "bg-secondary/80 text-secondary-foreground"}`}>
                  {exp.difficulty}
                </span>
              )}
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-primary-foreground">{exp.title}</h1>
            <div className="flex items-center gap-4 mt-3 text-sm text-primary-foreground/90 flex-wrap">
              <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {exp.hostCity}</span>
              <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {exp.duration}</span>
              <span className="flex items-center gap-1"><Star className="w-4 h-4 fill-primary text-primary" /> {exp.rating} ({exp.reviewCount} reviews)</span>
              {maxGuests && <span className="flex items-center gap-1"><Users className="w-4 h-4" /> Max {maxGuests} guests</span>}
            </div>
          </div>
        </div>

        <div className="px-4 sm:px-6 lg:px-8 mx-auto max-w-5xl">
          {/* Action buttons */}
          <div className="flex flex-wrap gap-3 mt-6 mb-8">
            <Button variant="outline" className="rounded-full gap-2" onClick={() => setLiked(!liked)}>
              <Heart className={`w-4 h-4 ${liked ? "fill-destructive text-destructive" : ""}`} /> {liked ? "Saved" : "Save"}
            </Button>
            <Button variant="outline" className="rounded-full gap-2" onClick={() => {
              const url = window.location.href;
              if (navigator.share) { navigator.share({ title: exp.title, url }); }
              else { navigator.clipboard.writeText(url); toast({ title: "Link copied!" }); }
            }}>
              <Share2 className="w-4 h-4" /> Share
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              {/* About */}
              <div>
                <h2 className="text-xl font-bold text-foreground mb-3">About This Experience</h2>
                <p className="text-muted-foreground leading-relaxed">{exp.description}</p>
              </div>

              {/* Availability & Dates */}
              <div className="rounded-2xl bg-card shadow-card p-5">
                <h2 className="text-lg font-bold text-foreground mb-3 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-primary" /> Availability & Dates
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="rounded-xl bg-secondary p-3 text-center">
                    <p className="text-xs text-muted-foreground">Availability</p>
                    <p className="font-bold text-foreground text-sm mt-1">{isYearRound ? "Year-Round" : "Seasonal"}</p>
                  </div>
                  {validFrom && (
                    <div className="rounded-xl bg-secondary p-3 text-center">
                      <p className="text-xs text-muted-foreground">Starts</p>
                      <p className="font-bold text-foreground text-sm mt-1">{new Date(validFrom).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</p>
                    </div>
                  )}
                  {validTo && (
                    <div className="rounded-xl bg-secondary p-3 text-center">
                      <p className="text-xs text-muted-foreground">Ends</p>
                      <p className="font-bold text-foreground text-sm mt-1">{new Date(validTo).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</p>
                    </div>
                  )}
                  {lastBookingDate && (
                    <div className="rounded-xl bg-destructive/5 border border-destructive/20 p-3 text-center">
                      <p className="text-xs text-destructive">Last Booking</p>
                      <p className="font-bold text-destructive text-sm mt-1">{new Date(lastBookingDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Vehicle Info for Bike Tours */}
              {isBike && vehicleDetails && (
                <div className="rounded-2xl bg-card shadow-card p-5">
                  <h2 className="text-lg font-bold text-foreground mb-3 flex items-center gap-2">
                    <Bike className="w-5 h-5 text-primary" /> Vehicle Details
                  </h2>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="rounded-xl bg-secondary p-3 text-center">
                      <p className="text-xs text-muted-foreground">Vehicle</p>
                      <p className="font-bold text-foreground text-sm mt-1">{vehicleDetails.model}</p>
                    </div>
                    <div className="rounded-xl bg-secondary p-3 text-center">
                      <p className="text-xs text-muted-foreground">Type</p>
                      <p className="font-bold text-foreground text-sm mt-1">{vehicleDetails.type}</p>
                    </div>
                    <div className="rounded-xl bg-secondary p-3 text-center">
                      <p className="text-xs text-muted-foreground">Capacity</p>
                      <p className="font-bold text-foreground text-sm mt-1">{vehicleDetails.capacity} rider{vehicleDetails.capacity > 1 ? "s" : ""}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Highlights */}
              {highlights.length > 0 && (
                <div>
                  <h2 className="text-xl font-bold text-foreground mb-3">Highlights</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {highlights.map((h: string) => (
                      <div key={h} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <CheckCircle className="w-4 h-4 text-accent shrink-0" />
                        {h}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* What's Included */}
              {includes.length > 0 && (
                <div>
                  <h2 className="text-xl font-bold text-foreground mb-3">What's Included</h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {includes.map((item: string) => (
                      <div key={item} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Shield className="w-4 h-4 text-primary shrink-0" />
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Schedule/Timeline */}
              <div>
                <h2 className="text-xl font-bold text-foreground mb-4">
                  {schedule ? "📅 Detailed Schedule" : "Experience Timeline"}
                </h2>
                <div className="space-y-0">
                  {timeline.map((item: any, i: number) => (
                    <motion.div key={i} initial={{ opacity: 0, x: -10 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                      className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className={`w-3 h-3 rounded-full ${i === 0 ? "bg-primary" : "bg-border"} shrink-0 mt-1.5`} />
                        {i < timeline.length - 1 && <div className="w-0.5 flex-1 bg-border" />}
                      </div>
                      <div className="pb-6">
                        <p className="text-xs font-bold uppercase tracking-wider text-primary">{item.day || item.time}</p>
                        <h3 className="text-sm font-semibold text-foreground mt-0.5">{item.title}</h3>
                        <p className="text-sm text-muted-foreground mt-0.5">{item.desc}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Video Section */}
              <div>
                <h2 className="text-xl font-bold text-foreground mb-3">📹 Past Experience Videos</h2>
                <div className="grid grid-cols-2 gap-3">
                  {[1, 2].map(i => (
                    <div key={i} className="relative aspect-video rounded-lg overflow-hidden bg-secondary group cursor-pointer">
                      <img src={exp.image} alt="video" className="w-full h-full object-cover opacity-80" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-14 h-14 rounded-full bg-primary/80 flex items-center justify-center backdrop-blur-sm group-hover:scale-110 transition-transform">
                          <Play className="w-6 h-6 text-primary-foreground ml-0.5" />
                        </div>
                      </div>
                      <div className="absolute bottom-2 left-2 text-xs font-medium text-primary-foreground bg-foreground/40 backdrop-blur-sm px-2 py-0.5 rounded">
                        {exp.title} • Clip {i}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Reviews */}
              <div>
                <h2 className="text-xl font-bold text-foreground mb-4">What Travelers Say</h2>
                <div className="space-y-3">
                  {hostReviews.map(r => (
                    <div key={r.id} className="rounded-lg bg-card p-4 shadow-card">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-xs font-bold text-foreground">{r.travelerName[0]}</div>
                        <div>
                          <p className="text-sm font-medium text-foreground">{r.travelerName} <span className="text-muted-foreground font-normal">· {r.country}</span></p>
                          <div className="flex gap-0.5">{Array.from({ length: r.rating }).map((_, j) => <Star key={j} className="w-3 h-3 fill-primary text-primary" />)}</div>
                        </div>
                      </div>
                      <p className="mt-2 text-sm text-muted-foreground">{r.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 space-y-4">
                <div className="rounded-2xl bg-card p-5 shadow-card">
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-bold text-foreground">${exp.price}</span>
                    <span className="text-sm text-muted-foreground">/ person</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">{exp.duration}</p>
                  {exp.groupSize && <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1"><Users className="w-3 h-3" /> Group: {exp.groupSize}</p>}
                  
                  {/* Quick info */}
                  <div className="mt-3 space-y-2 text-sm">
                    {exp.difficulty && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Mountain className="w-4 h-4 text-primary" />
                        <span>Difficulty: <strong className="text-foreground">{exp.difficulty}</strong></span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Globe className="w-4 h-4 text-primary" />
                      <span>{exp.hostCity}, India</span>
                    </div>
                    {isYearRound ? (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Calendar className="w-4 h-4 text-accent" />
                        <span className="text-accent font-medium">Open year-round</span>
                      </div>
                    ) : validFrom && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Calendar className="w-4 h-4 text-primary" />
                        <span>{new Date(validFrom).toLocaleDateString("en-US", { month: "short" })} – {validTo ? new Date(validTo).toLocaleDateString("en-US", { month: "short", year: "numeric" }) : "TBD"}</span>
                      </div>
                    )}
                  </div>

                  {user ? (
                    <Link to={host ? `/book/${host.id}` : "/explore"}>
                      <Button className="w-full mt-4 rounded-full bg-primary text-primary-foreground hover:bg-primary/90" size="lg">
                        Book This Experience
                      </Button>
                    </Link>
                  ) : (
                    <Link to="/signup">
                      <Button className="w-full mt-4 rounded-full" size="lg">
                        Sign In to Book
                      </Button>
                    </Link>
                  )}
                  {lastBookingDate && (
                    <p className="text-xs text-destructive text-center mt-2">⚠️ Book by {new Date(lastBookingDate).toLocaleDateString()}</p>
                  )}
                </div>

                {host && (
                  <Link to={`/host/${host.id}`} className="block rounded-2xl bg-card p-4 shadow-card hover:shadow-elevated transition-shadow">
                    <p className="text-xs uppercase tracking-wider font-bold text-muted-foreground mb-2">Your Host</p>
                    <div className="flex items-center gap-3">
                      <img src={host.image} alt={host.name} className="w-12 h-12 rounded-full object-cover" />
                      <div>
                        <p className="font-semibold text-foreground">{host.name}</p>
                        <p className="text-sm text-muted-foreground">{host.city} · {host.rating} ★</p>
                      </div>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-1">
                      {host.services.map(s => (
                        <span key={s} className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full">{s}</span>
                      ))}
                    </div>
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ExperienceDetail;
