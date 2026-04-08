import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
  MapPin, Calendar, Star, Heart, Clock, Settings, Bell, CreditCard, Shield, Globe,
  MessageCircle, Video, Save, Instagram, Facebook, Twitter, Compass, FileText, AlertTriangle, Target,
  Receipt, Trophy, Flame, Gift, CheckCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { mockBookings, hosts, experiences } from "@/lib/data";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { useToast } from "@/hooks/use-toast";
import VideoRecorder from "@/components/VideoRecorder";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

const statusColors: Record<string, string> = {
  pending: "bg-primary/10 text-primary", confirmed: "bg-accent/10 text-accent",
  completed: "bg-secondary text-muted-foreground", cancelled: "bg-destructive/10 text-destructive",
};

type Tab = "overview" | "bookings" | "trips" | "saved" | "wanderer" | "grievances" | "messages" | "reviews" | "invoices" | "rewards" | "settings";

const TravelerDashboard = () => {
  const [searchParams] = useSearchParams();
  const initialTab = (searchParams.get("tab") as Tab) || "overview";
  const [activeTab, setActiveTab] = useState<Tab>(initialTab);
  const { toast } = useToast();
  const { user } = useAuth();
  const bookings = mockBookings;
  const recommendedExp = experiences.slice(0, 4);

  const [profile, setProfile] = useLocalStorage("traveler_profile", {
    name: "Alex Traveler", email: "alex@example.com", phone: "+1 555-0123", bio: "Love exploring!",
    currency: "USD", language: "English",
  });
  const [socialMedia, setSocialMedia] = useLocalStorage("traveler_social_media", { instagram: "", facebook: "", twitter: "", website: "" });
  const [notifSettings, setNotifSettings] = useLocalStorage("traveler_notifications", { bookings: true, messages: true, deals: true, reviews: true });
  const [savedHostIds, setSavedHostIds] = useLocalStorage<string[]>("traveler_saved_hosts", hosts.slice(0, 4).map(h => h.id));
  const [reviewingBooking, setReviewingBooking] = useState<string | null>(null);
  const [reviewText, setReviewText] = useState("");
  const [reviewRating, setReviewRating] = useState(5);
  const [videoConsent, setVideoConsent] = useState<string | null>(null);
  const [submittedReviews, setSubmittedReviews] = useLocalStorage<any[]>("traveler_reviews", []);

  // DB data
  const [myTrips, setMyTrips] = useState<any[]>([]);
  const [myGrievances, setMyGrievances] = useState<any[]>([]);
  const [myInvoices, setMyInvoices] = useState<any[]>([]);
  const [myStreaks, setMyStreaks] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;
    Promise.all([
      supabase.from("trip_listings").select("*").eq("creator_id", user.id).order("created_at", { ascending: false }),
      supabase.from("grievances").select("*").eq("filed_by", user.id).order("created_at", { ascending: false }),
      supabase.from("invoices").select("*").eq("traveler_id", user.id).order("created_at", { ascending: false }),
      supabase.from("travel_streaks").select("*").eq("user_id", user.id).order("month", { ascending: true }),
    ]).then(([{ data: trips }, { data: grievances }, { data: invoices }, { data: streaks }]) => {
      setMyTrips(trips || []);
      setMyGrievances(grievances || []);
      setMyInvoices(invoices || []);
      setMyStreaks(streaks || []);
    });
  }, [user]);

  const toggleSaveHost = (hostId: string) => {
    setSavedHostIds(p => p.includes(hostId) ? p.filter(id => id !== hostId) : [...p, hostId]);
    toast({ title: savedHostIds.includes(hostId) ? "Removed" : "Saved!" });
  };

  const submitReview = () => {
    if (!videoConsent) { toast({ title: "Video required", variant: "destructive" }); return; }
    if (!reviewText.trim()) { toast({ title: "Please write a review", variant: "destructive" }); return; }
    setSubmittedReviews(p => [...p, { bookingId: reviewingBooking, text: reviewText, rating: reviewRating, videoUrl: videoConsent, date: new Date().toISOString() }]);
    toast({ title: "Review submitted! 🎉" });
    setReviewingBooking(null); setReviewText(""); setReviewRating(5); setVideoConsent(null);
  };

  const actualSavedHosts = hosts.filter(h => savedHostIds.includes(h.id));

  const tabs: { id: Tab; label: string; icon: React.ElementType }[] = [
    { id: "overview", label: "Overview", icon: Globe },
    { id: "bookings", label: "Bookings", icon: Calendar },
    { id: "trips", label: "My Trips", icon: Compass },
    { id: "invoices", label: "Invoices", icon: Receipt },
    { id: "rewards", label: "Rewards", icon: Trophy },
    { id: "saved", label: "Saved", icon: Heart },
    { id: "wanderer", label: "🧭 Wanderer", icon: Target },
    { id: "grievances", label: "Grievances", icon: AlertTriangle },
    { id: "messages", label: "Messages", icon: MessageCircle },
    { id: "reviews", label: "Reviews", icon: Star },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 mx-auto max-w-6xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-bold text-foreground">Welcome back, {profile.name}!</h1>
          <p className="mt-1 text-muted-foreground">Manage your bookings, trips and experiences</p>
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
                { label: "Total Trips", value: myTrips.length || "3", icon: MapPin },
                { label: "Upcoming", value: "2", icon: Calendar },
                { label: "Saved Hosts", value: `${actualSavedHosts.length}`, icon: Heart },
                { label: "Grievances", value: `${myGrievances.length}`, icon: AlertTriangle },
              ].map(s => (
                <div key={s.label} className="rounded-lg bg-card p-4 shadow-card">
                  <s.icon className="w-5 h-5 text-primary mb-2" />
                  <p className="text-2xl font-bold text-foreground">{s.value}</p>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                </div>
              ))}
            </div>
            <div className="mt-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-foreground">Upcoming Trips</h2>
                <button onClick={() => setActiveTab("bookings")} className="text-sm text-primary hover:underline">View all</button>
              </div>
              <div className="space-y-3">
                {bookings.filter(b => b.status === "confirmed" || b.status === "pending").slice(0, 2).map(b => {
                  const host = hosts.find(h => h.id === b.hostId);
                  if (!host) return null;
                  return (
                    <div key={b.id} className="rounded-lg bg-card p-4 shadow-card flex items-center gap-4">
                      <img src={host.image} alt={host.name} className="w-14 h-14 rounded-full object-cover shrink-0" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-foreground">{host.name}, {host.city}</h3>
                          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusColors[b.status]}`}>{b.status}</span>
                        </div>
                        <p className="text-sm text-muted-foreground"><Clock className="w-3 h-3 inline mr-1" />{b.startDate} → {b.endDate}</p>
                      </div>
                      <p className="font-bold text-foreground">${b.totalPrice}</p>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="mt-10">
              <h2 className="text-xl font-bold text-foreground mb-4">Recommended For You</h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {recommendedExp.map(exp => (
                  <Link to={`/experience/${exp.id}`} key={exp.id} className="group">
                    <div className="relative aspect-[3/4] rounded-lg overflow-hidden shadow-card">
                      <img src={exp.image} alt={exp.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                      <div className="absolute inset-0 bg-gradient-to-t from-foreground/70 via-transparent to-transparent" />
                      <div className="absolute bottom-0 left-0 right-0 p-3">
                        <p className="text-sm font-semibold text-primary-foreground">{exp.title}</p>
                        <p className="text-xs text-primary-foreground/80">${exp.price} · {exp.duration}</p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Bookings */}
        {activeTab === "bookings" && (
          <div className="mt-6 space-y-3">
            <h2 className="text-xl font-bold text-foreground mb-4">All Bookings</h2>
            {bookings.map(b => {
              const host = hosts.find(h => h.id === b.hostId);
              if (!host) return null;
              const hasReview = submittedReviews.some(r => r.bookingId === b.id);
              return (
                <div key={b.id} className="rounded-lg bg-card p-4 shadow-card">
                  <div className="flex items-center gap-4">
                    <img src={host.image} alt={host.name} className="w-14 h-14 rounded-full object-cover shrink-0" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-foreground">{host.name}, {host.city}</h3>
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusColors[b.status]}`}>{b.status}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">{b.startDate} → {b.endDate} · {b.services.join(", ")}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-bold text-foreground">${b.totalPrice}</p>
                      {b.status === "completed" && !hasReview && (
                        <Button size="sm" className="rounded-full text-xs gap-1 mt-1" onClick={() => setReviewingBooking(b.id)}>
                          <Video className="w-3 h-3" /> Review
                        </Button>
                      )}
                      {hasReview && <span className="text-xs text-accent block mt-1">✓ Reviewed</span>}
                    </div>
                  </div>
                  {reviewingBooking === b.id && (
                    <div className="mt-4 pt-4 border-t border-border space-y-4">
                      <div className="flex gap-1">{[1, 2, 3, 4, 5].map(n => (
                        <button key={n} onClick={() => setReviewRating(n)}>
                          <Star className={`w-6 h-6 ${n <= reviewRating ? "fill-primary text-primary" : "text-muted-foreground"}`} />
                        </button>
                      ))}</div>
                      <textarea className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm min-h-[80px]"
                        placeholder="Share your experience..." value={reviewText} onChange={e => setReviewText(e.target.value)} />
                      <VideoRecorder label="Video Feedback (Required)" required onVideoReady={(url) => setVideoConsent(url)} />
                      <div className="flex gap-2">
                        <Button onClick={submitReview} className="rounded-full gap-2"><Save className="w-4 h-4" /> Submit</Button>
                        <Button variant="outline" className="rounded-full" onClick={() => { setReviewingBooking(null); setVideoConsent(null); }}>Cancel</Button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* My Trips */}
        {activeTab === "trips" && (
          <div className="mt-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-foreground">My Published Trips ({myTrips.length})</h2>
              <Link to="/host-trip"><Button size="sm" className="rounded-full gap-1 text-xs"><Compass className="w-3 h-3" /> Host a Trip</Button></Link>
            </div>
            {myTrips.length === 0 ? (
              <div className="text-center py-12">
                <Compass className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-muted-foreground">You haven't hosted any trips yet.</p>
                <Link to="/host-trip"><Button className="mt-3 rounded-full">Create Your First Trip</Button></Link>
              </div>
            ) : (
              <div className="space-y-3">
                {myTrips.map(trip => (
                  <Link to={`/trip/${trip.id}`} key={trip.id}>
                    <div className="rounded-lg bg-card p-4 shadow-card flex justify-between items-center hover:shadow-elevated transition-shadow">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-foreground">{trip.title}</h3>
                          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                            trip.status === "active" ? "bg-accent/10 text-accent" : trip.status === "pending" ? "bg-primary/10 text-primary" : "bg-destructive/10 text-destructive"
                          }`}>{trip.status}</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">{trip.destination || "No destination"} · ${trip.total_price} · {trip.trip_type?.replace("_", " ")}</p>
                      </div>
                      <p className="text-xs text-muted-foreground">{new Date(trip.created_at).toLocaleDateString()}</p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Saved Hosts */}
        {activeTab === "saved" && (
          <div className="mt-6">
            <h2 className="text-xl font-bold text-foreground mb-4">Saved Hosts</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {actualSavedHosts.map(h => (
                <div key={h.id} className="rounded-lg bg-card p-4 shadow-card flex items-center gap-4">
                  <Link to={`/host/${h.id}`} className="flex items-center gap-4 flex-1">
                    <img src={h.image} alt={h.name} className="w-14 h-14 rounded-full object-cover" />
                    <div><p className="font-semibold text-foreground">{h.name}, {h.city}</p>
                      <p className="text-sm text-muted-foreground">{h.rating} ★ · ${h.pricePerDay}/day</p></div>
                  </Link>
                  <button onClick={() => toggleSaveHost(h.id)} className="p-2 hover:bg-secondary rounded-md">
                    <Heart className="w-5 h-5 fill-destructive text-destructive" />
                  </button>
                </div>
              ))}
              {actualSavedHosts.length === 0 && <p className="text-muted-foreground text-center py-8 col-span-2">No saved hosts yet.</p>}
            </div>
          </div>
        )}

        {/* Beta Wanderer */}
        {activeTab === "wanderer" && (
          <div className="mt-6">
            <div className="rounded-2xl bg-gradient-to-br from-primary/10 via-accent/5 to-secondary p-8 text-center mb-6">
              <div className="text-4xl mb-3">🧭</div>
              <h2 className="text-2xl font-bold text-foreground">Beta Wanderer Program</h2>
              <p className="text-muted-foreground mt-2 max-w-lg mx-auto">
                Travel to unexplored destinations, shoot videos, share feedback, and earn rewards as a community explorer.
              </p>
              <div className="flex gap-3 justify-center mt-4">
                <Link to="/beta-wanderer-apply"><Button className="rounded-full gap-2"><Target className="w-4 h-4" /> Apply Now</Button></Link>
                <Link to="/beta-wanderers"><Button variant="outline" className="rounded-full">View All Wanderers</Button></Link>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { icon: "📸", title: "Shoot Videos", desc: "Document your travels with authentic video content" },
                { icon: "🗺️", title: "Explore Places", desc: "Visit new and offbeat destinations across India" },
                { icon: "🏆", title: "Earn Rewards", desc: "Build your score, earn badges, and get featured" },
              ].map(b => (
                <div key={b.title} className="rounded-xl bg-card p-5 shadow-card text-center">
                  <span className="text-3xl">{b.icon}</span>
                  <h3 className="font-bold text-foreground mt-2">{b.title}</h3>
                  <p className="text-xs text-muted-foreground mt-1">{b.desc}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Grievances */}
        {activeTab === "grievances" && (
          <div className="mt-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-foreground">My Grievances ({myGrievances.length})</h2>
              <Link to="/grievances"><Button size="sm" className="rounded-full gap-1 text-xs"><AlertTriangle className="w-3 h-3" /> File New</Button></Link>
            </div>
            {myGrievances.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No grievances filed.</p>
            ) : (
              <div className="space-y-3">
                {myGrievances.map(g => (
                  <div key={g.id} className="rounded-lg bg-card p-4 shadow-card">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-foreground">{g.subject}</h3>
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                        g.status === "open" ? "bg-destructive/10 text-destructive" : g.status === "resolved" ? "bg-accent/10 text-accent" : "bg-primary/10 text-primary"
                      }`}>{g.status}</span>
                      <span className="text-xs bg-secondary text-muted-foreground px-2 py-0.5 rounded-full">{g.category}</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{g.description}</p>
                    {g.resolution && <p className="text-sm text-accent mt-2">Resolution: {g.resolution}</p>}
                    <p className="text-xs text-muted-foreground mt-2">Filed: {new Date(g.created_at).toLocaleDateString()}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Invoices */}
        {activeTab === "invoices" && (
          <div className="mt-6">
            <h2 className="text-xl font-bold text-foreground mb-4">My Invoices ({myInvoices.length})</h2>
            {myInvoices.length === 0 ? (
              <div className="text-center py-12">
                <Receipt className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-muted-foreground">No invoices yet. Invoices will appear here after bookings.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {myInvoices.map(inv => (
                  <div key={inv.id} className="rounded-lg bg-card p-4 shadow-card flex justify-between items-center">
                    <div>
                      <div className="flex items-center gap-2">
                        <Receipt className="w-4 h-4 text-primary" />
                        <h3 className="font-semibold text-foreground">{inv.invoice_number}</h3>
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                          inv.status === "paid" ? "bg-accent/10 text-accent" : inv.status === "unpaid" ? "bg-destructive/10 text-destructive" : "bg-primary/10 text-primary"
                        }`}>{inv.status}</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Amount: {inv.currency} {inv.total_amount} · Tax: {inv.currency} {inv.tax_amount}
                      </p>
                      <p className="text-xs text-muted-foreground">Issued: {new Date(inv.issued_at).toLocaleDateString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-foreground">{inv.currency} {inv.total_amount}</p>
                      {inv.paid_at && <p className="text-[10px] text-accent">Paid {new Date(inv.paid_at).toLocaleDateString()}</p>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Rewards */}
        {activeTab === "rewards" && (
          <div className="mt-6 space-y-6">
            <div className="rounded-2xl bg-gradient-to-br from-primary/10 via-accent/5 to-secondary p-8 text-center">
              <Flame className="w-10 h-10 text-primary mx-auto mb-2" />
              <h2 className="text-2xl font-bold text-foreground">Travel Streak Challenge</h2>
              <p className="text-muted-foreground mt-1">Travel 11 months in a row and get your 12th trip FREE!</p>
            </div>

            <div className="grid grid-cols-11 gap-1.5">
              {Array.from({ length: 11 }).map((_, i) => {
                const streak = myStreaks[i];
                const completed = streak?.completed || false;
                const monthLabel = streak ? new Date(streak.month).toLocaleString('default', { month: 'short' }) : `M${i + 1}`;
                return (
                  <div key={i} className={`aspect-square rounded-lg flex flex-col items-center justify-center text-xs font-bold transition-all ${
                    completed ? "bg-primary text-primary-foreground shadow-md" : "bg-muted text-muted-foreground"
                  }`}>
                    <span>{monthLabel}</span>
                    {completed && <CheckCircle className="w-3 h-3 mt-0.5" />}
                  </div>
                );
              })}
            </div>

            {(() => {
              const completedCount = myStreaks.filter(s => s.completed).length;
              const remaining = 11 - completedCount;
              return (
                <div className="flex items-center gap-3 rounded-xl bg-card p-5 shadow-card">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                    <Gift className="w-7 h-7 text-primary-foreground" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-foreground">12th Month — FREE Trip!</h3>
                    <p className="text-sm text-muted-foreground">
                      {remaining > 0 
                        ? `Complete ${remaining} more month${remaining > 1 ? 's' : ''} to unlock a complimentary trip worth up to ₹15,000`
                        : "🎉 Congratulations! You've unlocked your free trip!"}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-primary">{completedCount}/11</p>
                    <p className="text-[10px] text-muted-foreground">months done</p>
                  </div>
                </div>
              );
            })()}

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { icon: "🗺️", title: "Explorer", desc: "3 trips completed", threshold: 3 },
                { icon: "🧭", title: "Navigator", desc: "5 trips completed", threshold: 5 },
                { icon: "⛰️", title: "Adventurer", desc: "8 trips completed", threshold: 8 },
                { icon: "🏆", title: "Legend", desc: "11 trips completed", threshold: 11 },
              ].map(b => {
                const unlocked = myStreaks.filter(s => s.completed).length >= b.threshold;
                return (
                  <div key={b.title} className={`rounded-xl p-4 text-center shadow-card ${unlocked ? "bg-card" : "bg-muted/50 opacity-60"}`}>
                    <span className="text-2xl">{b.icon}</span>
                    <h4 className="font-bold text-foreground text-sm mt-1">{b.title}</h4>
                    <p className="text-[10px] text-muted-foreground">{b.desc}</p>
                    {unlocked && <span className="text-[10px] text-accent font-medium">✓ Unlocked</span>}
                  </div>
                );
              })}
            </div>

            <div className="text-center">
              <Link to="/rewards">
                <Button className="rounded-full gap-2"><Trophy className="w-4 h-4" /> View Full Rewards Hub</Button>
              </Link>
            </div>
          </div>
        )}

        {/* Messages */}
        {activeTab === "messages" && (
          <div className="mt-6">
            <h2 className="text-xl font-bold text-foreground mb-4">Messages</h2>
            {hosts.slice(0, 3).map(h => (
              <div key={h.id} className="rounded-lg bg-card p-4 shadow-card flex items-center gap-4 mb-3">
                <img src={h.image} alt={h.name} className="w-12 h-12 rounded-full object-cover" />
                <div className="flex-1"><p className="font-semibold text-foreground">{h.name}</p><p className="text-sm text-muted-foreground">Looking forward to your visit! 🙏</p></div>
                <span className="text-xs text-muted-foreground">2h ago</span>
              </div>
            ))}
          </div>
        )}

        {/* Reviews */}
        {activeTab === "reviews" && (
          <div className="mt-6 space-y-4">
            <h2 className="text-xl font-bold text-foreground mb-4">My Reviews ({submittedReviews.length})</h2>
            {submittedReviews.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No reviews yet.</p>
            ) : submittedReviews.map((r, i) => {
              const booking = bookings.find(b => b.id === r.bookingId);
              const h = booking ? hosts.find(x => x.id === booking.hostId) : null;
              return (
                <div key={i} className="rounded-lg bg-card p-4 shadow-card">
                  <div className="flex items-center gap-2">
                    <div className="flex gap-0.5">{Array.from({ length: r.rating }).map((_, j) => <Star key={j} className="w-3 h-3 fill-primary text-primary" />)}</div>
                    <span className="text-sm text-muted-foreground">for {h?.name || "Unknown"}</span>
                    {r.videoUrl && <span className="text-xs bg-accent/10 text-accent px-2 py-0.5 rounded-full ml-auto"><Video className="w-3 h-3 inline" /> Video</span>}
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">{r.text}</p>
                </div>
              );
            })}
          </div>
        )}

        {/* Settings */}
        {activeTab === "settings" && (
          <div className="mt-6 space-y-6 max-w-xl">
            <h2 className="text-xl font-bold text-foreground mb-4">Account Settings</h2>
            <div className="rounded-lg bg-card p-5 shadow-card space-y-4">
              <h3 className="font-bold text-foreground flex items-center gap-2"><Settings className="w-4 h-4 text-primary" /> Profile</h3>
              <div className="space-y-3">
                <div><label className="text-sm font-medium text-foreground">Name</label><Input value={profile.name} onChange={e => setProfile(p => ({ ...p, name: e.target.value }))} /></div>
                <div><label className="text-sm font-medium text-foreground">Email</label><Input type="email" value={profile.email} onChange={e => setProfile(p => ({ ...p, email: e.target.value }))} /></div>
                <div><label className="text-sm font-medium text-foreground">Phone</label><Input value={profile.phone} onChange={e => setProfile(p => ({ ...p, phone: e.target.value }))} /></div>
                <div><label className="text-sm font-medium text-foreground">Bio</label>
                  <textarea className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm min-h-[80px]"
                    value={profile.bio} onChange={e => setProfile(p => ({ ...p, bio: e.target.value }))} /></div>
              </div>
              <Button size="sm" className="rounded-full gap-2" onClick={() => toast({ title: "Saved!" })}><Save className="w-4 h-4" /> Save</Button>
            </div>
            <div className="rounded-lg bg-card p-5 shadow-card space-y-4">
              <h3 className="font-bold text-foreground flex items-center gap-2"><Globe className="w-4 h-4 text-primary" /> Social</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-2"><Instagram className="w-4 h-4 text-muted-foreground" /><Input placeholder="Instagram" value={socialMedia.instagram} onChange={e => setSocialMedia(p => ({ ...p, instagram: e.target.value }))} /></div>
                <div className="flex items-center gap-2"><Facebook className="w-4 h-4 text-muted-foreground" /><Input placeholder="Facebook" value={socialMedia.facebook} onChange={e => setSocialMedia(p => ({ ...p, facebook: e.target.value }))} /></div>
              </div>
              <Button size="sm" className="rounded-full gap-2" onClick={() => toast({ title: "Saved!" })}><Save className="w-4 h-4" /> Save</Button>
            </div>
            <div className="rounded-lg bg-card p-5 shadow-card space-y-3">
              <h3 className="font-bold text-foreground flex items-center gap-2"><Bell className="w-4 h-4 text-primary" /> Notifications</h3>
              {(["bookings", "messages", "deals", "reviews"] as const).map(key => (
                <label key={key} className="flex items-center justify-between cursor-pointer">
                  <span className="text-sm text-foreground capitalize">{key}</span>
                  <input type="checkbox" className="w-4 h-4 accent-primary" checked={notifSettings[key]}
                    onChange={e => setNotifSettings(p => ({ ...p, [key]: e.target.checked }))} />
                </label>
              ))}
            </div>
            <div className="rounded-lg bg-card p-5 shadow-card space-y-3">
              <h3 className="font-bold text-foreground flex items-center gap-2"><Shield className="w-4 h-4 text-primary" /> Security</h3>
              <Button variant="outline" size="sm" className="rounded-full text-xs" onClick={() => toast({ title: "Password reset sent" })}>Change Password</Button>
            </div>
            <div className="rounded-lg bg-card p-5 shadow-card space-y-3">
              <h3 className="font-bold text-foreground flex items-center gap-2"><CreditCard className="w-4 h-4 text-primary" /> Payment</h3>
              <div className="flex items-center gap-3 p-3 bg-secondary rounded-lg">
                <CreditCard className="w-5 h-5 text-muted-foreground" />
                <div><p className="text-sm font-medium text-foreground">•••• 4242</p><p className="text-xs text-muted-foreground">Expires 12/27</p></div>
                <span className="ml-auto text-xs bg-accent/10 text-accent px-2 py-0.5 rounded-full">Default</span>
              </div>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default TravelerDashboard;
