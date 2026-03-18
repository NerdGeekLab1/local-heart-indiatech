import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Star, Shield, Clock, Globe, MapPin, ArrowLeft, MessageCircle, Car, Home, Compass, Play, Bed, Users, Gauge, CheckCircle, UtensilsCrossed, Leaf, ChefHat } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { hosts, experiences, reviews } from "@/lib/data";

const serviceIcons: Record<string, React.ElementType> = {
  Guide: Compass,
  Stay: Home,
  Transport: Car,
  Food: UtensilsCrossed,
};

const HostProfile = () => {
  const { id } = useParams();
  const host = hosts.find(h => h.id === id);
  const [activeStayImage, setActiveStayImage] = useState(0);
  const [activeTab, setActiveTab] = useState<"overview" | "stay" | "transport" | "food" | "experiences" | "reviews">("overview");

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

  const hostExperiences = experiences.filter(e => e.hostId === host.id);
  const hostReviews = reviews.filter(r => r.hostId === host.id);
  const tabs = [
    { id: "overview" as const, label: "Overview" },
    ...(host.stayInfo ? [{ id: "stay" as const, label: "Stay & Rooms" }] : []),
    ...(host.transportInfo ? [{ id: "transport" as const, label: "Transport" }] : []),
    ...(host.foodInfo ? [{ id: "food" as const, label: "Food & Dining" }] : []),
    { id: "experiences" as const, label: "Experiences" },
    { id: "reviews" as const, label: `Reviews (${hostReviews.length})` },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-20 pb-16 px-4 sm:px-6 lg:px-8 mx-auto max-w-6xl">
        <Link to="/explore" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="w-4 h-4" /> Back to Explore
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="lg:col-span-1">
            <div className="rounded-lg bg-card p-2 shadow-card">
              <div className="aspect-[3/4] rounded-md overflow-hidden">
                <img src={host.image} alt={host.name} className="h-full w-full object-cover" />
              </div>
            </div>
            <div className="mt-4 space-y-3">
              <div className="rounded-lg bg-card p-4 shadow-card flex items-center gap-3">
                <Shield className="w-5 h-5 text-accent" />
                <div>
                  <p className="text-sm font-semibold text-foreground">Safety Score: {host.safetyScore}/100</p>
                  <p className="text-xs text-muted-foreground">Identity verified via KYC</p>
                </div>
              </div>
              <div className="rounded-lg bg-card p-4 shadow-card flex items-center gap-3">
                <Clock className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-sm font-semibold text-foreground">Responds {host.responseTime}</p>
                  <p className="text-xs text-muted-foreground">Typically very responsive</p>
                </div>
              </div>
              <div className="rounded-lg bg-card p-4 shadow-card flex items-center gap-3">
                <Star className="w-5 h-5 fill-primary text-primary" />
                <div>
                  <p className="text-sm font-semibold text-foreground">{host.rating} · {host.reviewCount} reviews</p>
                  <p className="text-xs text-muted-foreground">Consistently highly rated</p>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="lg:col-span-2">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-3xl font-bold text-foreground">{host.name}</h1>
                <p className="flex items-center gap-1 text-muted-foreground mt-1">
                  <MapPin className="w-4 h-4" /> {host.city}, India
                </p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-foreground">${host.pricePerDay}</p>
                <p className="text-xs text-muted-foreground">per day</p>
              </div>
            </div>
            <p className="mt-1 text-lg text-muted-foreground italic">"{host.tagline}"</p>

            <div className="mt-4 flex flex-wrap gap-3">
              <Link to={`/book/${host.id}`}>
                <Button size="lg" className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90 px-8 gap-2">
                  <MessageCircle className="w-4 h-4" /> Book Now
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="rounded-full px-8">Save Host</Button>
            </div>

            {/* Tabs */}
            <div className="mt-6 flex gap-1 overflow-x-auto border-b border-border pb-px">
              {tabs.map(t => (
                <button key={t.id} onClick={() => setActiveTab(t.id)}
                  className={`px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors rounded-t-lg ${activeTab === t.id ? "bg-card text-primary border-b-2 border-primary" : "text-muted-foreground hover:text-foreground"}`}>
                  {t.label}
                </button>
              ))}
            </div>

            {/* Overview Tab */}
            {activeTab === "overview" && (
              <div className="mt-6 space-y-6">
                <div>
                  <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider mb-2">About</h3>
                  <p className="text-muted-foreground leading-relaxed">{host.bio}</p>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider mb-2">Languages</h3>
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">{host.languages.join(", ")}</span>
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider mb-3">Services Offered</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {host.services.map(s => {
                      const Icon = serviceIcons[s] || Compass;
                      return (
                        <div key={s} className="rounded-lg bg-secondary p-4 flex flex-col items-center gap-2">
                          <Icon className="w-6 h-6 text-primary" />
                          <span className="text-sm font-medium text-foreground">{s}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider mb-3">📹 Video Testimonials</h3>
                  <div className="grid grid-cols-3 gap-3">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="relative aspect-[9/16] rounded-lg overflow-hidden bg-secondary group cursor-pointer">
                        <img src={host.image} alt="testimonial" className="w-full h-full object-cover opacity-70" />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-10 h-10 rounded-full bg-primary/80 flex items-center justify-center backdrop-blur-sm group-hover:scale-110 transition-transform">
                            <Play className="w-4 h-4 text-primary-foreground ml-0.5" />
                          </div>
                        </div>
                        <div className="absolute bottom-2 left-2 text-xs font-medium text-primary-foreground bg-foreground/40 backdrop-blur-sm px-2 py-0.5 rounded">
                          Traveler #{i}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Stay Tab */}
            {activeTab === "stay" && host.stayInfo && (
              <div className="mt-6 space-y-6">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Home className="w-5 h-5 text-primary" />
                    <h3 className="text-lg font-bold text-foreground">{host.stayInfo.propertyName}</h3>
                  </div>
                  <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">{host.stayInfo.propertyType}</span>
                  <p className="mt-3 text-muted-foreground leading-relaxed">{host.stayInfo.description}</p>
                </div>
                <div>
                  <div className="aspect-video rounded-lg overflow-hidden bg-secondary">
                    <img src={host.stayInfo.images[activeStayImage]} alt="Property" className="w-full h-full object-cover" />
                  </div>
                  <div className="mt-2 flex gap-2">
                    {host.stayInfo.images.map((img, i) => (
                      <button key={i} onClick={() => setActiveStayImage(i)}
                        className={`w-16 h-16 rounded-md overflow-hidden border-2 transition-colors ${i === activeStayImage ? "border-primary" : "border-transparent"}`}>
                        <img src={img} alt={`View ${i + 1}`} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider mb-3">Available Rooms</h3>
                  <div className="space-y-3">
                    {host.stayInfo.rooms.map(room => (
                      <div key={room.name} className="rounded-lg bg-card border border-border p-4 shadow-card">
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-bold text-foreground">{room.name}</h4>
                            <span className="text-xs bg-secondary text-muted-foreground px-2 py-0.5 rounded-full">{room.type}</span>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-bold text-foreground">${room.pricePerNight}</p>
                            <p className="text-xs text-muted-foreground">per night</p>
                          </div>
                        </div>
                        <p className="mt-2 text-sm text-muted-foreground">{room.description}</p>
                        <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1"><Bed className="w-3 h-3" />{room.beds} bed{room.beds > 1 ? "s" : ""}</span>
                          <span className="flex items-center gap-1"><Users className="w-3 h-3" />Max {room.maxGuests} guests</span>
                        </div>
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {room.amenities.map(a => (
                            <span key={a} className="text-xs bg-secondary text-muted-foreground px-2 py-0.5 rounded-full">{a}</span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider mb-3">Property Amenities</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {host.stayInfo.amenities.map(a => (
                      <div key={a} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <CheckCircle className="w-3 h-3 text-accent shrink-0" /> {a}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="rounded-lg bg-secondary p-4">
                    <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider mb-2">Check-in / Check-out</h4>
                    <p className="text-sm text-muted-foreground">Check-in: {host.stayInfo.checkIn}</p>
                    <p className="text-sm text-muted-foreground">Check-out: {host.stayInfo.checkOut}</p>
                  </div>
                  <div className="rounded-lg bg-secondary p-4">
                    <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider mb-2">House Rules</h4>
                    <ul className="space-y-1">
                      {host.stayInfo.houseRules.map(r => (
                        <li key={r} className="text-sm text-muted-foreground flex items-start gap-1">
                          <span className="text-primary">•</span> {r}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* Transport Tab */}
            {activeTab === "transport" && host.transportInfo && (
              <div className="mt-6 space-y-6">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Car className="w-5 h-5 text-primary" />
                    <h3 className="text-lg font-bold text-foreground">Transport Services</h3>
                  </div>
                  <p className="text-muted-foreground leading-relaxed">{host.transportInfo.description}</p>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider mb-3">Available Vehicles</h3>
                  <div className="space-y-3">
                    {host.transportInfo.vehicles.map(v => (
                      <div key={v.model} className="rounded-lg bg-card border border-border p-4 shadow-card">
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">{v.type}</span>
                              <h4 className="font-bold text-foreground">{v.model}</h4>
                            </div>
                            <div className="mt-2 flex items-center gap-4 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1"><Users className="w-3 h-3" />{v.capacity} passengers</span>
                              <span>{v.ac ? "❄️ AC" : "🌀 Non-AC"}</span>
                              {v.pricePerKm > 0 && <span className="flex items-center gap-1"><Gauge className="w-3 h-3" />${v.pricePerKm}/km</span>}
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-bold text-foreground">${v.pricePerDay}</p>
                            <p className="text-xs text-muted-foreground">per day</p>
                          </div>
                        </div>
                        <div className="mt-3 flex flex-wrap gap-1.5">
                          {v.features.map(f => (
                            <span key={f} className="text-xs bg-secondary text-muted-foreground px-2 py-0.5 rounded-full">{f}</span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="rounded-lg bg-secondary p-4">
                    <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider mb-2">Airport Transfers</h4>
                    {host.transportInfo.airports.map(a => (
                      <p key={a} className="text-sm text-muted-foreground flex items-center gap-1">✈️ {a}</p>
                    ))}
                  </div>
                  <div className="rounded-lg bg-secondary p-4">
                    <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider mb-2">Driver Languages</h4>
                    <p className="text-sm text-muted-foreground">{host.transportInfo.driverLanguages.join(", ")}</p>
                  </div>
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider mb-2">Coverage Area</h4>
                  <div className="flex flex-wrap gap-2">
                    {host.transportInfo.coverage.map(c => (
                      <span key={c} className="text-xs bg-card border border-border text-muted-foreground px-3 py-1 rounded-full flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-primary" />{c}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Food Tab */}
            {activeTab === "food" && host.foodInfo && (
              <div className="mt-6 space-y-6">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <UtensilsCrossed className="w-5 h-5 text-primary" />
                    <h3 className="text-lg font-bold text-foreground">Food & Dining</h3>
                  </div>
                  <p className="text-muted-foreground leading-relaxed">{host.foodInfo.description}</p>
                </div>

                {/* Cuisines & Meal Types */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="rounded-lg bg-secondary p-4">
                    <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider mb-2 flex items-center gap-1">
                      <ChefHat className="w-3 h-3" /> Cuisines
                    </h4>
                    <div className="flex flex-wrap gap-1.5">
                      {host.foodInfo.cuisines.map(c => (
                        <span key={c} className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">{c}</span>
                      ))}
                    </div>
                  </div>
                  <div className="rounded-lg bg-secondary p-4">
                    <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider mb-2">Meal Types</h4>
                    <div className="flex flex-wrap gap-1.5">
                      {host.foodInfo.mealTypes.map(m => (
                        <span key={m} className="text-xs bg-accent/10 text-accent px-2 py-0.5 rounded-full">{m}</span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Dietary Options */}
                <div>
                  <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider mb-2 flex items-center gap-1">
                    <Leaf className="w-3 h-3 text-accent" /> Dietary Options
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {host.foodInfo.dietaryOptions.map(d => (
                      <span key={d} className="text-xs bg-card border border-border text-muted-foreground px-3 py-1 rounded-full flex items-center gap-1">
                        <CheckCircle className="w-3 h-3 text-accent" /> {d}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Menu / Dishes */}
                <div>
                  <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider mb-3">🍽️ Menu</h3>
                  <div className="space-y-3">
                    {host.foodInfo.dishes.map(dish => (
                      <div key={dish.name} className="rounded-lg bg-card border border-border p-4 shadow-card">
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-bold text-foreground">{dish.name}</h4>
                            <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">{dish.cuisine}</span>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-bold text-foreground">${dish.price}</p>
                            <p className="text-xs text-muted-foreground">per person</p>
                          </div>
                        </div>
                        <p className="mt-2 text-sm text-muted-foreground">{dish.description}</p>
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {dish.dietaryTags.map(t => (
                            <span key={t} className="text-xs bg-secondary text-muted-foreground px-2 py-0.5 rounded-full">{t}</span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Specialties */}
                <div>
                  <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider mb-2">Signature Specialties</h4>
                  <div className="flex flex-wrap gap-2">
                    {host.foodInfo.specialties.map(s => (
                      <span key={s} className="text-sm bg-primary/5 text-foreground border border-primary/20 px-3 py-1.5 rounded-full">⭐ {s}</span>
                    ))}
                  </div>
                </div>

                {/* Ordering Info */}
                <div className="rounded-lg bg-primary/5 border border-primary/20 p-4">
                  <h4 className="text-sm font-bold text-foreground mb-2">📋 Ordering Information</h4>
                  <div className="space-y-1 text-sm text-muted-foreground">
                    {host.foodInfo.minimumOrder && <p>Minimum order: {host.foodInfo.minimumOrder} persons</p>}
                    {host.foodInfo.advanceNotice && <p>Advance notice: {host.foodInfo.advanceNotice}</p>}
                    <p>All meals are freshly prepared. Prices are per person.</p>
                  </div>
                </div>
              </div>
            )}

            {/* Experiences Tab */}
            {activeTab === "experiences" && (
              <div className="mt-6">
                {hostExperiences.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {hostExperiences.map(exp => (
                      <Link to={`/experience/${exp.id}`} key={exp.id} className="group rounded-lg overflow-hidden shadow-card hover:shadow-card-hover transition-shadow">
                        <div className="relative aspect-video overflow-hidden">
                          <img src={exp.image} alt={exp.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                          <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 via-transparent to-transparent" />
                          <div className="absolute bottom-2 left-2 right-2">
                            <p className="text-sm font-semibold text-primary-foreground">{exp.title}</p>
                            <p className="text-xs text-primary-foreground/80">${exp.price} · {exp.duration} · {exp.category}</p>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-8">No experiences listed yet.</p>
                )}
              </div>
            )}

            {/* Reviews Tab */}
            {activeTab === "reviews" && (
              <div className="mt-6 space-y-4">
                {hostReviews.map(review => (
                  <div key={review.id} className="rounded-lg bg-card p-4 shadow-card">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-xs font-bold text-foreground">
                        {review.travelerName[0]}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">{review.travelerName} <span className="text-muted-foreground font-normal">· {review.country}</span></p>
                        <div className="flex gap-0.5">
                          {Array.from({ length: review.rating }).map((_, j) => (
                            <Star key={j} className="w-3 h-3 fill-primary text-primary" />
                          ))}
                        </div>
                      </div>
                      {review.experienceType && (
                        <span className="ml-auto text-xs bg-secondary px-2 py-0.5 rounded-full text-muted-foreground">{review.experienceType}</span>
                      )}
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{review.text}</p>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default HostProfile;
