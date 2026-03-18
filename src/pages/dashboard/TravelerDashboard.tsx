import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { MapPin, Calendar, Star, Heart, Clock, Settings, Bell, CreditCard, Shield, Globe, MessageCircle, Video, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { mockBookings, hosts, experiences } from "@/lib/data";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { useToast } from "@/hooks/use-toast";
import VideoRecorder from "@/components/VideoRecorder";

const statusColors: Record<string, string> = {
  pending: "bg-primary/10 text-primary",
  confirmed: "bg-accent/10 text-accent",
  completed: "bg-secondary text-muted-foreground",
  cancelled: "bg-destructive/10 text-destructive",
};

type Tab = "overview" | "bookings" | "saved" | "messages" | "reviews" | "settings";

const TravelerDashboard = () => {
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const { toast } = useToast();
  const bookings = mockBookings;
  const savedHosts = hosts.slice(0, 4);
  const recommendedExp = experiences.slice(0, 4);

  // Settings state
  const [profile, setProfile] = useLocalStorage("traveler_profile", {
    name: "Alex Traveler", email: "alex@example.com", phone: "+1 555-0123", bio: "Love exploring cultures and trying local food!",
    currency: "USD", language: "English",
  });
  const [notifSettings, setNotifSettings] = useLocalStorage("traveler_notifications", {
    bookings: true, messages: true, deals: true, reviews: true,
  });
  const [savedHostIds, setSavedHostIds] = useLocalStorage<string[]>("traveler_saved_hosts", hosts.slice(0, 4).map(h => h.id));

  // Review state
  const [reviewingBooking, setReviewingBooking] = useState<string | null>(null);
  const [reviewText, setReviewText] = useState("");
  const [reviewRating, setReviewRating] = useState(5);
  const [videoConsent, setVideoConsent] = useState<string | null>(null);
  const [submittedReviews, setSubmittedReviews] = useLocalStorage<any[]>("traveler_reviews", []);

  const toggleSaveHost = (hostId: string) => {
    setSavedHostIds(p => p.includes(hostId) ? p.filter(id => id !== hostId) : [...p, hostId]);
    toast({ title: savedHostIds.includes(hostId) ? "Host removed from saved" : "Host saved!" });
  };

  const submitReview = () => {
    if (!videoConsent) { toast({ title: "Video required", description: "Please record or upload a video review to submit your feedback.", variant: "destructive" }); return; }
    if (!reviewText.trim()) { toast({ title: "Please write a review", variant: "destructive" }); return; }
    setSubmittedReviews(p => [...p, { bookingId: reviewingBooking, text: reviewText, rating: reviewRating, videoUrl: videoConsent, date: new Date().toISOString() }]);
    toast({ title: "Review submitted! 🎉", description: "Thank you for your video feedback!" });
    setReviewingBooking(null); setReviewText(""); setReviewRating(5); setVideoConsent(null);
  };

  const tabs: { id: Tab; label: string; icon: React.ElementType }[] = [
    { id: "overview", label: "Overview", icon: Globe },
    { id: "bookings", label: "My Bookings", icon: Calendar },
    { id: "saved", label: "Saved Hosts", icon: Heart },
    { id: "messages", label: "Messages", icon: MessageCircle },
    { id: "reviews", label: "My Reviews", icon: Star },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  const actualSavedHosts = hosts.filter(h => savedHostIds.includes(h.id));

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 mx-auto max-w-6xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-bold text-foreground">Welcome back, {profile.name}!</h1>
          <p className="mt-1 text-muted-foreground">Manage your bookings and discover new experiences</p>
        </motion.div>

        <div className="mt-6 flex gap-1 overflow-x-auto border-b border-border pb-px">
          {tabs.map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id)}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium whitespace-nowrap transition-colors rounded-t-lg ${activeTab === t.id ? "bg-card text-primary border-b-2 border-primary" : "text-muted-foreground hover:text-foreground"}`}>
              <t.icon className="w-4 h-4" /> {t.label}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === "overview" && (
          <>
            <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { label: "Total Trips", value: "3", icon: MapPin },
                { label: "Upcoming", value: "2", icon: Calendar },
                { label: "Saved Hosts", value: `${actualSavedHosts.length}`, icon: Heart },
                { label: "Reviews Given", value: `${submittedReviews.length}`, icon: Star },
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
                    <div key={b.id} className="rounded-lg bg-card p-4 shadow-card flex flex-col sm:flex-row items-start sm:items-center gap-4">
                      <img src={host.image} alt={host.name} className="w-14 h-14 rounded-full object-cover shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-semibold text-foreground">{host.name}, {host.city}</h3>
                          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusColors[b.status]}`}>{b.status}</span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-0.5">
                          <Clock className="w-3 h-3 inline mr-1" />{b.startDate} → {b.endDate} · {b.services.join(", ")}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="font-bold text-foreground">${b.totalPrice}</p>
                        <Link to={`/host/${host.id}`}><Button variant="ghost" size="sm" className="text-xs">View Host</Button></Link>
                      </div>
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

        {/* Bookings Tab */}
        {activeTab === "bookings" && (
          <div className="mt-6 space-y-3">
            <h2 className="text-xl font-bold text-foreground mb-4">All Bookings</h2>
            {bookings.map(b => {
              const host = hosts.find(h => h.id === b.hostId);
              if (!host) return null;
              const hasReview = submittedReviews.some(r => r.bookingId === b.id);
              return (
                <div key={b.id} className="rounded-lg bg-card p-4 shadow-card">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                    <img src={host.image} alt={host.name} className="w-14 h-14 rounded-full object-cover shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-foreground">{host.name}, {host.city}</h3>
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusColors[b.status]}`}>{b.status}</span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-0.5">
                        <Clock className="w-3 h-3 inline mr-1" />{b.startDate} → {b.endDate} · {b.services.join(", ")} · {b.guests} guest{b.guests > 1 ? "s" : ""}
                      </p>
                      {b.message && <p className="text-sm text-muted-foreground mt-1 italic">"{b.message}"</p>}
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-bold text-foreground">${b.totalPrice}</p>
                      <Link to={`/host/${host.id}`}><Button variant="ghost" size="sm" className="text-xs">View Host</Button></Link>
                      {b.status === "completed" && !hasReview && (
                        <Button size="sm" className="rounded-full text-xs gap-1 mt-1" onClick={() => setReviewingBooking(b.id)}>
                          <Video className="w-3 h-3" /> Leave Review
                        </Button>
                      )}
                      {hasReview && <span className="text-xs text-accent block mt-1">✓ Reviewed</span>}
                    </div>
                  </div>

                  {/* Review Form with Video */}
                  {reviewingBooking === b.id && (
                    <div className="mt-4 pt-4 border-t border-border space-y-4">
                      <h4 className="font-bold text-foreground text-sm">Leave a Review for {host.name}</h4>
                      <div>
                        <label className="text-sm font-medium text-foreground">Rating</label>
                        <div className="flex gap-1 mt-1">
                          {[1, 2, 3, 4, 5].map(n => (
                            <button key={n} onClick={() => setReviewRating(n)}>
                              <Star className={`w-6 h-6 ${n <= reviewRating ? "fill-primary text-primary" : "text-muted-foreground"}`} />
                            </button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-foreground">Your Review</label>
                        <textarea className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm min-h-[80px] mt-1"
                          placeholder="Share your experience..."
                          value={reviewText} onChange={e => setReviewText(e.target.value)} />
                      </div>
                      <VideoRecorder
                        label="Video Consent & Feedback (Required for testimonials)"
                        required
                        onVideoReady={(url) => { setVideoConsent(url); toast({ title: "Video ready!" }); }}
                      />
                      <div className="flex gap-2">
                        <Button onClick={submitReview} className="rounded-full gap-2">
                          <Save className="w-4 h-4" /> Submit Review
                        </Button>
                        <Button variant="outline" className="rounded-full" onClick={() => { setReviewingBooking(null); setVideoConsent(null); }}>Cancel</Button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Saved Hosts Tab */}
        {activeTab === "saved" && (
          <div className="mt-6">
            <h2 className="text-xl font-bold text-foreground mb-4">Saved Hosts</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {actualSavedHosts.map(h => (
                <div key={h.id} className="rounded-lg bg-card p-4 shadow-card flex items-center gap-4 hover:shadow-card-hover transition-shadow">
                  <Link to={`/host/${h.id}`} className="flex items-center gap-4 flex-1">
                    <img src={h.image} alt={h.name} className="w-14 h-14 rounded-full object-cover" />
                    <div className="flex-1">
                      <p className="font-semibold text-foreground">{h.name}, {h.city}</p>
                      <p className="text-sm text-muted-foreground">{h.rating} ★ · ${h.pricePerDay}/day · {h.services.join(", ")}</p>
                      <p className="text-xs text-muted-foreground mt-1">{h.tagline}</p>
                    </div>
                  </Link>
                  <button onClick={() => toggleSaveHost(h.id)} className="shrink-0 p-2 hover:bg-secondary rounded-md">
                    <Heart className="w-5 h-5 fill-destructive text-destructive" />
                  </button>
                </div>
              ))}
              {actualSavedHosts.length === 0 && <p className="text-muted-foreground text-center py-8 col-span-2">No saved hosts yet. Browse hosts and save your favorites!</p>}
            </div>
          </div>
        )}

        {/* Messages Tab */}
        {activeTab === "messages" && (
          <div className="mt-6">
            <h2 className="text-xl font-bold text-foreground mb-4">Messages</h2>
            <div className="space-y-3">
              {hosts.slice(0, 3).map(h => (
                <div key={h.id} className="rounded-lg bg-card p-4 shadow-card flex items-center gap-4">
                  <img src={h.image} alt={h.name} className="w-12 h-12 rounded-full object-cover" />
                  <div className="flex-1">
                    <p className="font-semibold text-foreground">{h.name}, {h.city}</p>
                    <p className="text-sm text-muted-foreground">Last message: "Looking forward to your visit! 🙏"</p>
                  </div>
                  <span className="text-xs text-muted-foreground">2h ago</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* My Reviews Tab */}
        {activeTab === "reviews" && (
          <div className="mt-6 space-y-4">
            <h2 className="text-xl font-bold text-foreground mb-4">My Reviews ({submittedReviews.length})</h2>
            {submittedReviews.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No reviews yet. Complete a trip and leave a video review!</p>
            ) : (
              submittedReviews.map((r, i) => {
                const booking = bookings.find(b => b.id === r.bookingId);
                const h = booking ? hosts.find(x => x.id === booking.hostId) : null;
                return (
                  <div key={i} className="rounded-lg bg-card p-4 shadow-card">
                    <div className="flex items-center gap-2">
                      <div className="flex gap-0.5">{Array.from({ length: r.rating }).map((_, j) => <Star key={j} className="w-3 h-3 fill-primary text-primary" />)}</div>
                      <span className="text-sm text-muted-foreground">for {h?.name || "Unknown Host"}</span>
                      {r.videoUrl && <span className="text-xs bg-accent/10 text-accent px-2 py-0.5 rounded-full ml-auto flex items-center gap-1"><Video className="w-3 h-3" /> Video attached</span>}
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">{r.text}</p>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* Settings Tab — Functional */}
        {activeTab === "settings" && (
          <div className="mt-6 space-y-6 max-w-xl">
            <h2 className="text-xl font-bold text-foreground mb-4">Account Settings</h2>

            {/* Profile Edit */}
            <div className="rounded-lg bg-card p-5 shadow-card space-y-4">
              <h3 className="font-bold text-foreground flex items-center gap-2"><Settings className="w-4 h-4 text-primary" /> Profile Information</h3>
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-foreground">Name</label>
                  <Input value={profile.name} onChange={e => setProfile(p => ({ ...p, name: e.target.value }))} />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground">Email</label>
                  <Input type="email" value={profile.email} onChange={e => setProfile(p => ({ ...p, email: e.target.value }))} />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground">Phone</label>
                  <Input value={profile.phone} onChange={e => setProfile(p => ({ ...p, phone: e.target.value }))} />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground">Bio</label>
                  <textarea className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm min-h-[80px]"
                    value={profile.bio} onChange={e => setProfile(p => ({ ...p, bio: e.target.value }))} />
                </div>
              </div>
              <Button size="sm" className="rounded-full gap-2" onClick={() => toast({ title: "Profile saved!", description: "Your changes have been saved." })}>
                <Save className="w-4 h-4" /> Save Profile
              </Button>
            </div>

            {/* Notifications */}
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

            {/* Preferences */}
            <div className="rounded-lg bg-card p-5 shadow-card space-y-3">
              <h3 className="font-bold text-foreground flex items-center gap-2"><Globe className="w-4 h-4 text-primary" /> Preferences</h3>
              <div>
                <label className="text-sm font-medium text-foreground">Currency</label>
                <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm mt-1"
                  value={profile.currency} onChange={e => setProfile(p => ({ ...p, currency: e.target.value }))}>
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                  <option value="INR">INR (₹)</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">Language</label>
                <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm mt-1"
                  value={profile.language} onChange={e => setProfile(p => ({ ...p, language: e.target.value }))}>
                  <option value="English">English</option>
                  <option value="Hindi">Hindi</option>
                  <option value="French">French</option>
                  <option value="Spanish">Spanish</option>
                </select>
              </div>
            </div>

            {/* Security */}
            <div className="rounded-lg bg-card p-5 shadow-card space-y-3">
              <h3 className="font-bold text-foreground flex items-center gap-2"><Shield className="w-4 h-4 text-primary" /> Security</h3>
              <Button variant="outline" size="sm" className="rounded-full text-xs" onClick={() => toast({ title: "Password reset email sent" })}>Change Password</Button>
              <Button variant="outline" size="sm" className="rounded-full text-xs ml-2" onClick={() => toast({ title: "2FA enabled" })}>Enable 2FA</Button>
            </div>

            {/* Payment */}
            <div className="rounded-lg bg-card p-5 shadow-card space-y-3">
              <h3 className="font-bold text-foreground flex items-center gap-2"><CreditCard className="w-4 h-4 text-primary" /> Payment Methods</h3>
              <div className="flex items-center gap-3 p-3 bg-secondary rounded-lg">
                <CreditCard className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium text-foreground">•••• •••• •••• 4242</p>
                  <p className="text-xs text-muted-foreground">Expires 12/27</p>
                </div>
                <span className="ml-auto text-xs bg-accent/10 text-accent px-2 py-0.5 rounded-full">Default</span>
              </div>
              <Button variant="outline" size="sm" className="rounded-full text-xs" onClick={() => toast({ title: "Add payment method", description: "This would open a payment form in production." })}>+ Add Payment Method</Button>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default TravelerDashboard;
