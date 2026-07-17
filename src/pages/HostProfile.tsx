import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import {
  Star, Shield, Clock, Globe, MapPin, ArrowLeft, MessageCircle, Car,
  Home, Compass, Play, Bed, Users, Gauge, CheckCircle, UtensilsCrossed,
  Leaf, ChefHat, Heart, Share2, Camera, Award, Verified, Calendar,
  Phone, Instagram, X as XIcon, Tag, ChevronLeft, ChevronRight
} from "lucide-react";
import ImageLightbox from "@/components/ImageLightbox";
import VideoModal from "@/components/VideoModal";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { hosts, experiences, reviews } from "@/lib/data";
import { useCurrency } from "@/contexts/CurrencyContext";

const serviceIcons: Record<string, React.ElementType> = {
  Guide: Compass, Stay: Home, Transport: Car, Food: UtensilsCrossed,
};

const serviceColors: Record<string, string> = {
  Guide: "from-primary/20 to-primary/5", Stay: "from-accent/20 to-accent/5",
  Transport: "from-destructive/10 to-destructive/5", Food: "from-primary/15 to-primary/5",
};

const HostProfile = () => {
  const { format } = useCurrency();
  const { toast } = useToast();
  const { id } = useParams();
  const host = hosts.find(h => h.id === id);
  const [activeStayImage, setActiveStayImage] = useState(0);
  const [activeTab, setActiveTab] = useState<"overview" | "stay" | "transport" | "food" | "experiences" | "reviews">("overview");
  const [liked, setLiked] = useState(false);
  const [activeReel, setActiveReel] = useState<number | null>(null);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxImages, setLightboxImages] = useState<string[]>([]);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [videoOpen, setVideoOpen] = useState(false);
  const [roomSliderIndex, setRoomSliderIndex] = useState<Record<string, number>>({});

  const openLightbox = (images: string[], index: number) => {
    setLightboxImages(images);
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  const getRoomSlider = (roomName: string) => roomSliderIndex[roomName] || 0;
  const setRoomSlider = (roomName: string, idx: number) => setRoomSliderIndex(prev => ({ ...prev, [roomName]: idx }));

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
    { id: "overview" as const, label: "Overview", icon: Compass },
    ...(host.stayInfo ? [{ id: "stay" as const, label: "Stay", icon: Home }] : []),
    ...(host.transportInfo ? [{ id: "transport" as const, label: "Transport", icon: Car }] : []),
    ...(host.foodInfo ? [{ id: "food" as const, label: "Food", icon: UtensilsCrossed }] : []),
    { id: "experiences" as const, label: "Experiences", icon: Camera },
    { id: "reviews" as const, label: `Reviews`, icon: Star },
  ];

  // Mock reels data
  const reels = [
    { id: 1, thumbnail: host.image, title: "Morning at the haveli", views: "2.3K", duration: "0:32" },
    { id: 2, thumbnail: host.image, title: "Local market walk", views: "1.8K", duration: "0:45" },
    { id: 3, thumbnail: host.image, title: "Cooking session", views: "3.1K", duration: "1:02" },
    { id: 4, thumbnail: host.image, title: "Sunset point", views: "4.5K", duration: "0:28" },
    { id: 5, thumbnail: host.image, title: "Guest testimonial", views: "1.2K", duration: "0:55" },
    { id: 6, thumbnail: host.image, title: "Hidden gem tour", views: "2.7K", duration: "0:40" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* ═══ Cover Hero ═══ */}
      <div className="relative h-72 sm:h-80 overflow-hidden bg-gradient-to-br from-primary/20 to-accent/10">
        <div className="absolute inset-0 opacity-30">
          <img src={host.image} alt="" className="w-full h-full object-cover blur-2xl scale-110" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-32 relative z-10 pb-16">
        {/* ═══ Profile Header ═══ */}
        <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-end mb-8">
          {/* Avatar */}
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
            className="relative shrink-0">
            <div className="w-36 h-36 sm:w-44 sm:h-44 rounded-3xl overflow-hidden border-4 border-background shadow-elevated">
              <img src={host.image} alt={host.name} className="w-full h-full object-cover" />
            </div>
            {host.verified && (
              <div className="absolute -bottom-2 -right-2 w-10 h-10 rounded-full bg-accent flex items-center justify-center border-3 border-background">
                <Verified className="w-5 h-5 text-accent-foreground" />
              </div>
            )}
          </motion.div>

          {/* Name & Meta */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="flex-1">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold text-foreground">{host.name}</h1>
                <p className="flex items-center gap-1.5 text-muted-foreground mt-1">
                  <MapPin className="w-4 h-4 text-primary" /> {host.city}, India
                </p>
                <p className="text-muted-foreground italic mt-1">"{host.tagline}"</p>
              </div>
              <div className="hidden sm:block text-right">
                <p className="text-3xl font-bold text-foreground">{format(host.pricePerDay)}</p>
                <p className="text-xs text-muted-foreground">per day</p>
              </div>
            </div>

            {/* Stats Bar */}
            <div className="mt-4 flex flex-wrap gap-4">
              <div className="flex items-center gap-1.5 text-sm">
                <Star className="w-4 h-4 fill-primary text-primary" />
                <span className="font-bold text-foreground">{host.rating}</span>
                <span className="text-muted-foreground">({host.reviewCount} reviews)</span>
              </div>
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <Shield className="w-4 h-4 text-accent" />
                Safety: {host.safetyScore}/100
              </div>
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <Clock className="w-4 h-4" />
                Responds {host.responseTime}
              </div>
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <Globe className="w-4 h-4" />
                {host.languages.join(", ")}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3 mb-8">
          <Link to={`/book/${host.id}`}>
            <Button size="lg" className="rounded-full px-8 gap-2 shadow-elevated">
              <MessageCircle className="w-4 h-4" /> Book Now
            </Button>
          </Link>
          <Button size="lg" variant="outline" className="rounded-full px-6 gap-2" onClick={() => setLiked(!liked)}>
            <Heart className={`w-4 h-4 ${liked ? "fill-destructive text-destructive" : ""}`} />
            {liked ? "Saved" : "Save"}
          </Button>
          <Button size="lg" variant="outline" className="rounded-full px-6 gap-2" onClick={() => {
            const url = window.location.href;
            if (navigator.share) {
              navigator.share({ title: `${host.name} on Travelista`, text: `Check out ${host.name}'s hosting in ${host.city}!`, url });
            } else {
              navigator.clipboard.writeText(url);
              toast({ title: "Link copied!", description: "Share link copied to clipboard" });
            }
          }}>
            <Share2 className="w-4 h-4" /> Share
          </Button>
        </div>

        {/* ═══ Services Grid ═══ */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          {host.services.map(s => {
            const Icon = serviceIcons[s] || Compass;
            return (
              <motion.div key={s} whileHover={{ y: -2 }}
                className={`rounded-2xl bg-gradient-to-br ${serviceColors[s] || "from-secondary to-muted"} p-5 text-center cursor-pointer transition-shadow hover:shadow-card`}
                onClick={() => {
                  if (s === "Stay" && host.stayInfo) setActiveTab("stay");
                  if (s === "Transport" && host.transportInfo) setActiveTab("transport");
                  if (s === "Food" && host.foodInfo) setActiveTab("food");
                  if (s === "Guide") setActiveTab("experiences");
                }}
              >
                <Icon className="w-7 h-7 text-primary mx-auto mb-2" />
                <span className="text-sm font-semibold text-foreground">{s}</span>
              </motion.div>
            );
          })}
        </div>

        {/* ═══ Instagram-Style Video Reels ═══ */}
        <motion.section initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
              <Play className="w-5 h-5 text-primary" /> Reels & Stories
            </h2>
            <span className="text-xs text-muted-foreground">{reels.length} videos</span>
          </div>

          <div className="flex gap-3 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide">
            {reels.map((reel, i) => (
              <motion.div
                key={reel.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
                whileHover={{ scale: 1.03, y: -4 }}
                onClick={() => {
                  if (host.introVideoUrl) {
                    setVideoOpen(true);
                  } else {
                    setActiveReel(activeReel === i ? null : i);
                  }
                }}
                className={`relative shrink-0 w-36 sm:w-44 aspect-[9/16] rounded-2xl overflow-hidden cursor-pointer snap-start transition-all duration-300 ${activeReel === i ? "ring-3 ring-primary shadow-elevated" : "shadow-card hover:shadow-card-hover"}`}
              >
                <img src={reel.thumbnail} alt={reel.title} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-foreground/70 via-transparent to-foreground/10" />

                {/* Play Button */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <motion.div
                    animate={activeReel === i ? { scale: [1, 1.2, 1] } : {}}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                    className="w-10 h-10 rounded-full bg-primary/80 backdrop-blur-sm flex items-center justify-center"
                  >
                    <Play className="w-4 h-4 text-primary-foreground ml-0.5" />
                  </motion.div>
                </div>

                {/* Duration Badge */}
                <span className="absolute top-2 right-2 bg-foreground/60 backdrop-blur-sm text-primary-foreground text-[10px] font-medium px-1.5 py-0.5 rounded">
                  {reel.duration}
                </span>

                {/* Bottom Info */}
                <div className="absolute bottom-2 left-2 right-2">
                  <p className="text-primary-foreground text-xs font-semibold leading-tight truncate">{reel.title}</p>
                  <p className="text-primary-foreground/70 text-[10px] flex items-center gap-1 mt-0.5">
                    <Camera className="w-2.5 h-2.5" /> {reel.views} views
                  </p>
                </div>

                {/* Live Indicator for active */}
                {activeReel === i && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="absolute top-2 left-2 flex items-center gap-1 bg-destructive text-primary-foreground text-[10px] font-bold px-2 py-0.5 rounded-full"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-primary-foreground animate-pulse" />
                    PLAYING
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* ═══ Content Tabs ═══ */}
        <div className="sticky top-16 z-20 bg-background/80 backdrop-blur-md border-b border-border mb-6 -mx-4 px-4 sm:-mx-6 sm:px-6">
          <div className="flex gap-1 overflow-x-auto py-2">
            {tabs.map(t => {
              const Icon = t.icon;
              return (
                <button key={t.id} onClick={() => setActiveTab(t.id)}
                  className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium whitespace-nowrap rounded-full transition-all ${activeTab === t.id ? "bg-primary text-primary-foreground shadow-card" : "text-muted-foreground hover:bg-secondary hover:text-foreground"}`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {t.label}
                  {t.id === "reviews" && <span className="text-xs opacity-70">({hostReviews.length})</span>}
                </button>
              );
            })}
          </div>
        </div>

        {/* ═══ Tab Content ═══ */}
        <AnimatePresence mode="wait">
          <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>

            {/* OVERVIEW TAB */}
            {activeTab === "overview" && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                  {/* About */}
                  <div className="rounded-2xl bg-card shadow-card p-6">
                    <h3 className="text-lg font-bold text-foreground mb-3">About {host.name}</h3>
                    <p className="text-muted-foreground leading-relaxed">{host.bio}</p>
                    {host.specialties && (
                      <div className="mt-4 flex flex-wrap gap-2">
                        {host.specialties.map(s => (
                          <span key={s} className="text-xs bg-primary/10 text-primary px-3 py-1 rounded-full font-medium">{s}</span>
                        ))}
                      </div>
                    )}
                    {host.expertiseTags && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {host.expertiseTags.map(t => (
                          <span key={t} className="text-xs bg-accent/10 text-accent px-3 py-1 rounded-full font-medium flex items-center gap-1">
                            <Tag className="w-3 h-3" /> {t}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Highlights Grid */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 p-5">
                      <Award className="w-6 h-6 text-primary mb-2" />
                      <p className="text-2xl font-bold text-foreground">{host.reviewCount}+</p>
                      <p className="text-xs text-muted-foreground">Happy travelers</p>
                    </div>
                    <div className="rounded-2xl bg-gradient-to-br from-accent/10 to-accent/5 p-5">
                      <Shield className="w-6 h-6 text-accent mb-2" />
                      <p className="text-2xl font-bold text-foreground">{host.safetyScore}%</p>
                      <p className="text-xs text-muted-foreground">Safety score</p>
                    </div>
                    <div className="rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 p-5">
                      <Star className="w-6 h-6 text-primary mb-2" />
                      <p className="text-2xl font-bold text-foreground">{host.rating}</p>
                      <p className="text-xs text-muted-foreground">Average rating</p>
                    </div>
                    <div className="rounded-2xl bg-gradient-to-br from-accent/10 to-accent/5 p-5">
                      <Clock className="w-6 h-6 text-accent mb-2" />
                      <p className="text-2xl font-bold text-foreground">{host.responseTime}</p>
                      <p className="text-xs text-muted-foreground">Response time</p>
                    </div>
                  </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-4">
                  <div className="rounded-2xl bg-card shadow-card p-5">
                    <h4 className="text-sm font-bold text-foreground uppercase tracking-wider mb-3">Quick Info</h4>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 text-sm">
                        <Globe className="w-4 h-4 text-primary shrink-0" />
                        <span className="text-muted-foreground">{host.languages.join(", ")}</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm">
                        <MapPin className="w-4 h-4 text-primary shrink-0" />
                        <span className="text-muted-foreground">{host.city}, India</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm">
                        <Calendar className="w-4 h-4 text-primary shrink-0" />
                        <span className="text-muted-foreground">Available year-round</span>
                      </div>
                    </div>
                  </div>

                  {/* Booking Card */}
                  <div className="rounded-2xl bg-primary/5 border border-primary/20 p-5">
                    <p className="text-2xl font-bold text-foreground">{format(host.pricePerDay)}<span className="text-sm font-normal text-muted-foreground">/day</span></p>
                    <p className="text-xs text-muted-foreground mt-1">All services included</p>
                    <Link to={`/book/${host.id}`}>
                      <Button className="w-full mt-4 rounded-full gap-2">
                        <MessageCircle className="w-4 h-4" /> Book {host.name}
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            )}

            {/* STAY TAB */}
            {activeTab === "stay" && host.stayInfo && (
              <div className="space-y-6">
                <div className="rounded-2xl bg-card shadow-card overflow-hidden">
                  <div className="relative aspect-[21/9] overflow-hidden">
                    <motion.img
                      key={activeStayImage}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      src={host.stayInfo.images[activeStayImage]}
                      alt="Property"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-foreground/40 to-transparent" />
                    <div className="absolute bottom-4 left-4">
                      <span className="bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full">{host.stayInfo.propertyType}</span>
                      <h3 className="text-2xl font-bold text-primary-foreground mt-2">{host.stayInfo.propertyName}</h3>
                    </div>
                  </div>
                  <div className="flex gap-2 p-3 overflow-x-auto">
                    {host.stayInfo.images.map((img, i) => (
                      <button key={i} onClick={() => setActiveStayImage(i)}
                        className={`w-20 h-14 rounded-lg overflow-hidden shrink-0 border-2 transition-all ${i === activeStayImage ? "border-primary scale-105" : "border-transparent opacity-60 hover:opacity-100"}`}>
                        <img src={img} alt={`View ${i + 1}`} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                </div>

                <p className="text-muted-foreground leading-relaxed">{host.stayInfo.description}</p>

                <h4 className="text-lg font-bold text-foreground flex items-center gap-2">
                  <Bed className="w-5 h-5 text-primary" /> Available Rooms
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {host.stayInfo.rooms.map(room => (
                    <motion.div key={room.name} whileHover={{ y: -2 }}
                      className="rounded-2xl bg-card shadow-card border border-border overflow-hidden hover:shadow-elevated transition-shadow">
                      {/* Room Image Slider */}
                      {room.images && room.images.length > 0 ? (
                        <div className="relative aspect-video overflow-hidden group">
                          <img src={room.images[getRoomSlider(room.name)]} alt={room.name}
                            className="w-full h-full object-cover cursor-pointer transition-transform"
                            onClick={() => openLightbox(room.images!, getRoomSlider(room.name))} />
                          <div className="absolute inset-0 bg-gradient-to-t from-foreground/40 to-transparent pointer-events-none" />
                          {room.images.length > 1 && (
                            <>
                              <button onClick={(e) => { e.stopPropagation(); setRoomSlider(room.name, getRoomSlider(room.name) === 0 ? room.images!.length - 1 : getRoomSlider(room.name) - 1); }}
                                className="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-background/60 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <ChevronLeft className="w-4 h-4 text-foreground" />
                              </button>
                              <button onClick={(e) => { e.stopPropagation(); setRoomSlider(room.name, getRoomSlider(room.name) === room.images!.length - 1 ? 0 : getRoomSlider(room.name) + 1); }}
                                className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-background/60 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <ChevronRight className="w-4 h-4 text-foreground" />
                              </button>
                              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                                {room.images.map((_, idx) => (
                                  <span key={idx} className={`w-1.5 h-1.5 rounded-full transition-all ${idx === getRoomSlider(room.name) ? "bg-background scale-125" : "bg-background/50"}`} />
                                ))}
                              </div>
                              <span className="absolute bottom-2 right-2 bg-foreground/60 backdrop-blur-sm text-primary-foreground text-[10px] font-medium px-2 py-0.5 rounded cursor-pointer"
                                onClick={() => openLightbox(room.images!, getRoomSlider(room.name))}>
                                📷 {room.images.length} photos
                              </span>
                            </>
                          )}
                          <span className="absolute top-2 left-2 text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded-full font-bold">{room.type}</span>
                        </div>
                      ) : (
                        <div className="aspect-video bg-secondary flex items-center justify-center">
                          <Bed className="w-10 h-10 text-muted-foreground/30" />
                        </div>
                      )}
                      <div className="p-5">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h5 className="font-bold text-foreground">{room.name}</h5>
                            {!room.images?.length && <span className="text-xs bg-secondary text-muted-foreground px-2 py-0.5 rounded-full">{room.type}</span>}
                          </div>
                          <div className="text-right">
                            <p className="text-xl font-bold text-foreground">{format(room.pricePerNight)}</p>
                            <p className="text-xs text-muted-foreground">/night</p>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground mt-2">{room.description}</p>
                        <div className="mt-3 flex gap-3 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1"><Bed className="w-3 h-3" />{room.beds} bed{room.beds > 1 ? "s" : ""}</span>
                          <span className="flex items-center gap-1"><Users className="w-3 h-3" />Max {room.maxGuests}</span>
                        </div>
                        <div className="mt-3 flex flex-wrap gap-1.5">
                          {room.amenities.map(a => (
                            <span key={a} className="text-[11px] bg-secondary text-muted-foreground px-2 py-0.5 rounded-full">{a}</span>
                          ))}
                        </div>
                        <Link to={`/book/${host.id}`}>
                          <Button size="sm" className="w-full mt-3 rounded-full text-xs">Book This Room</Button>
                        </Link>
                      </div>
                    </motion.div>
                  ))}
                </div>

                <div className="rounded-2xl bg-card shadow-card p-5">
                  <h4 className="text-sm font-bold text-foreground uppercase tracking-wider mb-3">Property Amenities</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {host.stayInfo.amenities.map(a => (
                      <span key={a} className="flex items-center gap-1.5 text-sm text-muted-foreground">
                        <CheckCircle className="w-3.5 h-3.5 text-accent shrink-0" /> {a}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="rounded-2xl bg-secondary p-5">
                    <h4 className="text-sm font-bold text-foreground uppercase tracking-wider mb-2">Timing</h4>
                    <p className="text-sm text-muted-foreground">Check-in: {host.stayInfo.checkIn}</p>
                    <p className="text-sm text-muted-foreground">Check-out: {host.stayInfo.checkOut}</p>
                  </div>
                  <div className="rounded-2xl bg-secondary p-5">
                    <h4 className="text-sm font-bold text-foreground uppercase tracking-wider mb-2">House Rules</h4>
                    <ul className="space-y-1">
                      {host.stayInfo.houseRules.map(r => (
                        <li key={r} className="text-sm text-muted-foreground flex items-start gap-1.5">
                          <span className="text-primary mt-0.5">•</span> {r}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* TRANSPORT TAB */}
            {activeTab === "transport" && host.transportInfo && (
              <div className="space-y-6">
                <div className="rounded-2xl bg-card shadow-card p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <Car className="w-6 h-6 text-primary" />
                    <h3 className="text-lg font-bold text-foreground">Transport Services</h3>
                  </div>
                  <p className="text-muted-foreground leading-relaxed">{host.transportInfo.description}</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {host.transportInfo.vehicles.map(v => (
                    <motion.div key={v.model} whileHover={{ y: -2 }}
                      className="rounded-2xl bg-card shadow-card border border-border overflow-hidden hover:shadow-elevated transition-shadow">
                      {/* Vehicle Image */}
                      {v.image ? (
                        <div className="relative aspect-video overflow-hidden">
                          <img src={v.image} alt={v.model} className="w-full h-full object-cover" />
                          <span className="absolute top-2 left-2 text-xs bg-primary text-primary-foreground px-2.5 py-1 rounded-full font-bold">{v.type}</span>
                        </div>
                      ) : (
                        <div className="aspect-video bg-secondary flex items-center justify-center">
                          <Car className="w-10 h-10 text-muted-foreground/30" />
                        </div>
                      )}
                      <div className="p-5">
                        <h4 className="font-bold text-foreground">{v.model}</h4>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground mt-2 mb-3">
                          <span className="flex items-center gap-1"><Users className="w-3 h-3" />{v.capacity} pax</span>
                          <span>{v.ac ? "❄️ AC" : "🌀 Non-AC"}</span>
                          {v.pricePerKm > 0 && <span className="flex items-center gap-1"><Gauge className="w-3 h-3" />{format(v.pricePerKm)}/km</span>}
                        </div>
                        <div className="flex flex-wrap gap-1 mb-3">
                          {v.features.map(f => (
                            <span key={f} className="text-[10px] bg-secondary text-muted-foreground px-2 py-0.5 rounded-full">{f}</span>
                          ))}
                        </div>
                        <div className="flex items-center justify-between">
                          <p className="text-xl font-bold text-foreground">{format(v.pricePerDay)}<span className="text-xs font-normal text-muted-foreground">/day</span></p>
                          <Link to={`/book/${host.id}`}>
                            <Button size="sm" className="rounded-full text-xs">Book</Button>
                          </Link>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="rounded-2xl bg-secondary p-5">
                    <h4 className="text-xs font-bold text-foreground uppercase tracking-wider mb-2">✈️ Airports</h4>
                    {host.transportInfo.airports.map(a => (
                      <p key={a} className="text-sm text-muted-foreground">{a}</p>
                    ))}
                  </div>
                  <div className="rounded-2xl bg-secondary p-5">
                    <h4 className="text-xs font-bold text-foreground uppercase tracking-wider mb-2">🗣️ Driver Languages</h4>
                    <p className="text-sm text-muted-foreground">{host.transportInfo.driverLanguages.join(", ")}</p>
                  </div>
                  <div className="rounded-2xl bg-secondary p-5">
                    <h4 className="text-xs font-bold text-foreground uppercase tracking-wider mb-2">📍 Coverage</h4>
                    <div className="flex flex-wrap gap-1">
                      {host.transportInfo.coverage.map(c => (
                        <span key={c} className="text-xs bg-card text-muted-foreground px-2 py-0.5 rounded-full">{c}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* FOOD TAB */}
            {activeTab === "food" && host.foodInfo && (
              <div className="space-y-6">
                <div className="rounded-2xl bg-card shadow-card p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <UtensilsCrossed className="w-6 h-6 text-primary" />
                    <h3 className="text-lg font-bold text-foreground">Food & Dining</h3>
                  </div>
                  <p className="text-muted-foreground leading-relaxed">{host.foodInfo.description}</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="rounded-2xl bg-secondary p-5">
                    <ChefHat className="w-5 h-5 text-primary mb-2" />
                    <h4 className="text-xs font-bold text-foreground uppercase tracking-wider mb-2">Cuisines</h4>
                    <div className="flex flex-wrap gap-1.5">
                      {host.foodInfo.cuisines.map(c => (
                        <span key={c} className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">{c}</span>
                      ))}
                    </div>
                  </div>
                  <div className="rounded-2xl bg-secondary p-5">
                    <Calendar className="w-5 h-5 text-primary mb-2" />
                    <h4 className="text-xs font-bold text-foreground uppercase tracking-wider mb-2">Meal Types</h4>
                    <div className="flex flex-wrap gap-1.5">
                      {host.foodInfo.mealTypes.map(m => (
                        <span key={m} className="text-xs bg-accent/10 text-accent px-2 py-0.5 rounded-full">{m}</span>
                      ))}
                    </div>
                  </div>
                  <div className="rounded-2xl bg-secondary p-5">
                    <Leaf className="w-5 h-5 text-accent mb-2" />
                    <h4 className="text-xs font-bold text-foreground uppercase tracking-wider mb-2">Dietary</h4>
                    <div className="flex flex-wrap gap-1.5">
                      {host.foodInfo.dietaryOptions.map(d => (
                        <span key={d} className="text-xs bg-card border border-border text-muted-foreground px-2 py-0.5 rounded-full">{d}</span>
                      ))}
                    </div>
                  </div>
                </div>

                <h4 className="text-lg font-bold text-foreground">🍽️ Menu</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {host.foodInfo.dishes.map(dish => (
                    <motion.div key={dish.name} whileHover={{ y: -2 }}
                      className="rounded-2xl bg-card shadow-card border border-border p-5 hover:shadow-elevated transition-shadow">
                      <div className="flex justify-between items-start">
                        <div>
                          <h5 className="font-bold text-foreground">{dish.name}</h5>
                          <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">{dish.cuisine}</span>
                        </div>
                        <p className="text-xl font-bold text-foreground">{format(dish.price)}</p>
                      </div>
                      <p className="mt-2 text-sm text-muted-foreground">{dish.description}</p>
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {dish.dietaryTags.map(t => (
                          <span key={t} className="text-[11px] bg-secondary text-muted-foreground px-2 py-0.5 rounded-full">{t}</span>
                        ))}
                      </div>
                    </motion.div>
                  ))}
                </div>

                <div className="flex flex-wrap gap-2">
                  {host.foodInfo.specialties.map(s => (
                    <span key={s} className="text-sm bg-primary/5 text-foreground border border-primary/20 px-3 py-1.5 rounded-full">⭐ {s}</span>
                  ))}
                </div>

                {(host.foodInfo.minimumOrder || host.foodInfo.advanceNotice) && (
                  <div className="rounded-2xl bg-primary/5 border border-primary/20 p-5">
                    <h4 className="text-sm font-bold text-foreground mb-2">📋 Ordering Info</h4>
                    <div className="space-y-1 text-sm text-muted-foreground">
                      {host.foodInfo.minimumOrder && <p>Minimum: {host.foodInfo.minimumOrder} persons</p>}
                      {host.foodInfo.advanceNotice && <p>Advance notice: {host.foodInfo.advanceNotice}</p>}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* EXPERIENCES TAB */}
            {activeTab === "experiences" && (
              <div>
                {hostExperiences.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {hostExperiences.map(exp => (
                      <Link to={`/experience/${exp.id}`} key={exp.id}>
                        <motion.div whileHover={{ y: -4 }}
                          className="rounded-2xl overflow-hidden bg-card shadow-card hover:shadow-elevated transition-all group">
                          <div className="relative aspect-video overflow-hidden">
                            <img src={exp.image} alt={exp.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                            <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 via-transparent to-transparent" />
                            <span className="absolute top-3 left-3 bg-primary text-primary-foreground text-xs font-bold px-2.5 py-1 rounded-full">{exp.category}</span>
                            <div className="absolute bottom-3 left-3 right-3">
                              <p className="text-primary-foreground font-bold text-sm">{exp.title}</p>
                              <p className="text-primary-foreground/80 text-xs">{format(exp.price)} · {exp.duration}</p>
                            </div>
                          </div>
                        </motion.div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-12">No experiences listed yet.</p>
                )}
              </div>
            )}

            {/* REVIEWS TAB */}
            {activeTab === "reviews" && (
              <div className="space-y-4">
                <div className="rounded-2xl bg-card shadow-card p-6 mb-6">
                  <div className="flex items-center gap-4">
                    <div className="text-center">
                      <p className="text-4xl font-bold text-foreground">{host.rating}</p>
                      <div className="flex gap-0.5 mt-1">
                        {Array.from({ length: 5 }).map((_, j) => (
                          <Star key={j} className={`w-4 h-4 ${j < Math.floor(host.rating) ? "fill-primary text-primary" : "text-muted"}`} />
                        ))}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">{host.reviewCount} reviews</p>
                    </div>
                    <div className="flex-1 space-y-1">
                      {[5, 4, 3, 2, 1].map(n => {
                        const count = hostReviews.filter(r => r.rating === n).length;
                        const pct = hostReviews.length > 0 ? (count / hostReviews.length) * 100 : 0;
                        return (
                          <div key={n} className="flex items-center gap-2 text-xs">
                            <span className="w-3 text-muted-foreground">{n}</span>
                            <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
                              <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${pct}%` }} />
                            </div>
                            <span className="w-6 text-right text-muted-foreground">{count}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {hostReviews.map(review => (
                  <motion.div key={review.id} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                    className="rounded-2xl bg-card shadow-card p-5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
                        {review.travelerName[0]}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-foreground">{review.travelerName} <span className="text-muted-foreground font-normal">· {review.country}</span></p>
                        <div className="flex gap-0.5">
                          {Array.from({ length: review.rating }).map((_, j) => (
                            <Star key={j} className="w-3 h-3 fill-primary text-primary" />
                          ))}
                        </div>
                      </div>
                      {review.experienceType && (
                        <span className="text-xs bg-secondary text-muted-foreground px-2.5 py-1 rounded-full">{review.experienceType}</span>
                      )}
                    </div>
                    <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{review.text}</p>
                    <p className="text-xs text-muted-foreground/60 mt-2">{review.date}</p>
                  </motion.div>
                ))}
              </div>
            )}

          </motion.div>
        </AnimatePresence>
      </div>

      <Footer />

      {/* Lightbox */}
      <ImageLightbox
        images={lightboxImages}
        initialIndex={lightboxIndex}
        open={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
      />

      {/* Video Modal */}
      <VideoModal
        open={videoOpen}
        onClose={() => setVideoOpen(false)}
        videoUrl={host.introVideoUrl}
        title={`${host.name}'s Intro`}
      />
    </div>
  );
};

export default HostProfile;
