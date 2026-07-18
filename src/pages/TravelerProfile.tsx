import { useEffect, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { MapPin, Heart, Compass, Calendar, Star, Globe, Camera, Sparkles, Bookmark, Share2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useBookmarks } from "@/hooks/use-bookmarks";
import { toast } from "@/hooks/use-toast";

const TravelerProfile = () => {
  const { id } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const tab = searchParams.get("tab") || "posts";
  const { isBookmarked, toggle } = useBookmarks();

  const [profile, setProfile] = useState<any>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [trips, setTrips] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [bookmarkedTrips, setBookmarkedTrips] = useState<any[]>([]);
  const [bookmarkedExperiences, setBookmarkedExperiences] = useState<any[]>([]);
  const [bookmarkedPosts, setBookmarkedPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) { setLoading(false); return; }
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
    if (!isUuid) { setLoading(false); return; }
    (async () => {
      setLoading(true);
      const [{ data: profs }, { data: po }, { data: tr }, { data: rv }] = await Promise.all([
        supabase.rpc("get_public_profile", { _id: id }),
        supabase.from("feed_posts").select("*").eq("user_id", id).eq("status", "active").order("created_at", { ascending: false }).limit(48),
        supabase.from("trip_listings").select("*").eq("creator_id", id).order("created_at", { ascending: false }).limit(24),
        supabase.from("reviews").select("*").eq("traveler_id", id).order("created_at", { ascending: false }).limit(20),
      ]);
      setProfile(profs?.[0] || null);
      setPosts(po || []);
      setTrips(tr || []);
      setReviews(rv || []);

      // Load this user's bookmarked items if viewing their own profile
      const { data: { user } } = await supabase.auth.getUser();
      if (user && user.id === id) {
        const { data: bms } = await supabase.from("user_bookmarks").select("item_type,item_id").eq("user_id", user.id);
        const tripIds = (bms || []).filter(b => b.item_type === "trip").map(b => b.item_id);
        const expIds = (bms || []).filter(b => b.item_type === "experience").map(b => b.item_id);
        const postIds = (bms || []).filter(b => b.item_type === "post").map(b => b.item_id);
        const [{ data: btrips }, { data: bexps }, { data: bposts }] = await Promise.all([
          tripIds.length ? supabase.from("trip_listings").select("*").in("id", tripIds) : Promise.resolve({ data: [] as any }),
          expIds.length ? supabase.from("experiences").select("*").in("id", expIds) : Promise.resolve({ data: [] as any }),
          postIds.length ? supabase.from("feed_posts").select("*").in("id", postIds) : Promise.resolve({ data: [] as any }),
        ]);
        setBookmarkedTrips(btrips || []);
        setBookmarkedExperiences(bexps || []);
        setBookmarkedPosts(bposts || []);
      }
      setLoading(false);
    })();
  }, [id]);

  const name = profile ? `${profile.first_name || ""} ${profile.last_name || ""}`.trim() || "Traveler" : "Traveler";
  const totalLikes = posts.reduce((s, p) => s + (p.likes_count || 0), 0);
  const uniqueDestinations = Array.from(new Set([...posts.map(p => p.location).filter(Boolean), ...trips.map(t => t.destination).filter(Boolean)]));
  const ogImage = profile?.avatar_url || posts[0]?.media_url;
  const url = `/traveler/${id}?tab=${tab}`;
  const description = profile?.bio || `${name} — traveler profile: ${posts.length} postcards, ${trips.length} trips across ${uniqueDestinations.length} places.`;

  const share = () => {
    const u = window.location.href;
    if (navigator.share) navigator.share({ title: `${name} on Travelista`, url: u });
    else { navigator.clipboard.writeText(u); toast({ title: "Profile link copied!" }); }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background"><Navbar />
        <div className="pt-24 max-w-5xl mx-auto px-4 space-y-4">
          <Skeleton className="h-48 w-full rounded-3xl" />
          <Skeleton className="h-10 w-72" />
          <Skeleton className="h-64 w-full rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>{`${name} — Traveler on Travelista`}</title>
        <meta name="description" content={description.slice(0, 155)} />
        <link rel="canonical" href={url} />
        <meta property="og:type" content="profile" />
        <meta property="og:title" content={`${name} — Traveler on Travelista`} />
        <meta property="og:description" content={description.slice(0, 200)} />
        <meta property="og:url" content={url} />
        {ogImage && <meta property="og:image" content={ogImage} />}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={`${name} on Travelista`} />
        <meta name="twitter:description" content={description.slice(0, 200)} />
        {ogImage && <meta name="twitter:image" content={ogImage} />}
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "ProfilePage",
          mainEntity: { "@type": "Person", name, description: profile?.bio || undefined, image: profile?.avatar_url || undefined }
        })}</script>
      </Helmet>

      <Navbar />
      <main className="pt-20 pb-24 max-w-5xl mx-auto px-4">
        {/* Hero */}
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary/90 via-orange-500 to-pink-500 text-primary-foreground p-6 sm:p-8 shadow-2xl">
          <div className="absolute -right-16 -top-16 w-64 h-64 rounded-full bg-primary-foreground/10 blur-3xl" />
          <div className="absolute -left-10 bottom-0 w-48 h-48 rounded-full bg-primary-foreground/10 blur-3xl" />
          <div className="relative flex flex-col sm:flex-row gap-6 items-start sm:items-center">
            <div className="p-1 rounded-full bg-gradient-to-tr from-yellow-300 via-pink-300 to-primary-foreground shadow-xl">
              <Avatar className="w-24 h-24 sm:w-28 sm:h-28 ring-4 ring-background">
                <AvatarImage src={profile?.avatar_url || undefined} />
                <AvatarFallback className="text-3xl font-bold bg-background text-foreground">{name.charAt(0)}</AvatarFallback>
              </Avatar>
            </div>
            <div className="flex-1">
              <p className="text-xs uppercase tracking-[0.25em] font-bold opacity-90">Traveler</p>
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">{name}</h1>
              {profile?.bio && <p className="text-sm sm:text-base opacity-95 mt-1 max-w-2xl">{profile.bio}</p>}
              <div className="flex flex-wrap gap-2 mt-3 text-xs font-semibold">
                <span className="px-3 py-1 rounded-full bg-background/25 backdrop-blur">📸 {posts.length} posts</span>
                <span className="px-3 py-1 rounded-full bg-background/25 backdrop-blur flex items-center gap-1"><Heart className="w-3 h-3 fill-current" /> {totalLikes}</span>
                <span className="px-3 py-1 rounded-full bg-background/25 backdrop-blur flex items-center gap-1"><Compass className="w-3 h-3" /> {trips.length} trips</span>
                <span className="px-3 py-1 rounded-full bg-background/25 backdrop-blur flex items-center gap-1"><MapPin className="w-3 h-3" /> {uniqueDestinations.length} places</span>
              </div>
            </div>
            <div className="flex gap-2 sm:flex-col">
              <Link to="/feed"><Button size="sm" variant="secondary" className="rounded-full"><Sparkles className="w-4 h-4 mr-1" /> Feed</Button></Link>
              <Button size="sm" variant="secondary" className="rounded-full" onClick={share}><Share2 className="w-4 h-4 mr-1" /> Share</Button>
            </div>
          </div>
        </section>

        {/* Tabs */}
        <Tabs value={tab} onValueChange={(v) => setSearchParams({ tab: v })} className="mt-6">
          <TabsList className="grid grid-cols-4 w-full sm:w-auto">
            <TabsTrigger value="posts">Posts</TabsTrigger>
            <TabsTrigger value="trips">Trips</TabsTrigger>
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
            <TabsTrigger value="bookmarks">Saved</TabsTrigger>
          </TabsList>

          {/* POSTS */}
          <TabsContent value="posts" className="mt-5">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xl font-bold text-foreground flex items-center gap-2"><Camera className="w-5 h-5 text-primary" /> Recent Posts</h2>
              <Link to="/feed" className="text-xs text-primary font-semibold hover:underline">View on Feed →</Link>
            </div>
            {posts.length === 0 ? (
              <EmptyTab text="No posts shared yet." />
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {posts.map(p => (
                  <div key={p.id} className="relative aspect-square overflow-hidden rounded-xl bg-muted group">
                    {p.media_type === "video" ? (
                      <video src={p.media_url} className="w-full h-full object-cover" muted playsInline />
                    ) : (
                      <img src={p.media_url} alt={p.caption || "post"} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                    )}
                    <button onClick={() => toggle("post", p.id)} className="absolute top-1.5 right-1.5 p-1.5 rounded-full bg-background/80 backdrop-blur hover:bg-background transition" aria-label="Bookmark post">
                      <Bookmark className={`w-3.5 h-3.5 ${isBookmarked("post", p.id) ? "fill-primary text-primary" : "text-foreground"}`} />
                    </button>
                    <div className="absolute inset-0 bg-gradient-to-t from-foreground/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2">
                      <span className="text-[10px] font-bold text-background flex items-center gap-1"><Heart className="w-3 h-3 fill-current" />{p.likes_count}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* TRIPS */}
          <TabsContent value="trips" className="mt-5">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xl font-bold text-foreground flex items-center gap-2"><Compass className="w-5 h-5 text-primary" /> Hosted Trips</h2>
              <span className="text-xs text-muted-foreground">{trips.length} total</span>
            </div>
            {trips.length === 0 ? (
              <EmptyTab text="No trips published yet." />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {trips.map(t => (
                  <TripCard key={t.id} trip={t} bookmarked={isBookmarked("trip", t.id)} onBookmark={() => toggle("trip", t.id)} />
                ))}
              </div>
            )}
          </TabsContent>

          {/* REVIEWS */}
          <TabsContent value="reviews" className="mt-5">
            <h2 className="text-xl font-bold text-foreground mb-3 flex items-center gap-2"><Star className="w-5 h-5 text-primary" /> Reviews Given</h2>
            {reviews.length === 0 ? (
              <EmptyTab text="No reviews yet." />
            ) : (
              <div className="space-y-2">
                {reviews.map(r => (
                  <div key={r.id} className="rounded-xl bg-card border border-border p-3">
                    <div className="flex gap-0.5 mb-1">{Array.from({ length: r.rating }).map((_, i) => <Star key={i} className="w-3 h-3 fill-primary text-primary" />)}</div>
                    <p className="text-sm text-foreground">{r.text}</p>
                    {r.experience_id && (
                      <Link to={`/experience/${r.experience_id}`} className="text-[11px] text-primary font-semibold hover:underline mt-1 inline-block">View experience →</Link>
                    )}
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* BOOKMARKS */}
          <TabsContent value="bookmarks" className="mt-5 space-y-6">
            <h2 className="text-xl font-bold text-foreground flex items-center gap-2"><Bookmark className="w-5 h-5 text-primary" /> Saved</h2>
            {bookmarkedTrips.length === 0 && bookmarkedExperiences.length === 0 && bookmarkedPosts.length === 0 && (
              <EmptyTab text="Nothing saved yet. Tap the bookmark on any post, trip or experience to keep it here." />
            )}
            {bookmarkedTrips.length > 0 && (
              <div>
                <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-2">Trips</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {bookmarkedTrips.map(t => <TripCard key={t.id} trip={t} bookmarked onBookmark={() => toggle("trip", t.id)} />)}
                </div>
              </div>
            )}
            {bookmarkedExperiences.length > 0 && (
              <div>
                <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-2">Experiences</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {bookmarkedExperiences.map(e => (
                    <Link to={`/experience/${e.id}`} key={e.id} className="rounded-2xl bg-card border border-border p-4 hover:shadow-lg hover:border-primary/40 transition-all">
                      <h3 className="font-bold text-foreground line-clamp-2">{e.title}</h3>
                      <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1"><MapPin className="w-3 h-3" />{e.location}</p>
                      <p className="text-sm font-bold text-primary mt-2">₹{Number(e.price).toLocaleString()}</p>
                    </Link>
                  ))}
                </div>
              </div>
            )}
            {bookmarkedPosts.length > 0 && (
              <div>
                <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-2">Postcards</h3>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {bookmarkedPosts.map(p => (
                    <div key={p.id} className="relative aspect-square overflow-hidden rounded-xl bg-muted">
                      {p.media_type === "video"
                        ? <video src={p.media_url} className="w-full h-full object-cover" muted playsInline />
                        : <img src={p.media_url} alt={p.caption || "post"} className="w-full h-full object-cover" loading="lazy" />}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>

        {uniqueDestinations.length > 0 && (
          <section className="mt-8">
            <h2 className="text-xl font-bold text-foreground mb-3 flex items-center gap-2"><Globe className="w-5 h-5 text-primary" /> Atlas</h2>
            <div className="flex flex-wrap gap-2">
              {uniqueDestinations.map(d => (
                <span key={d} className="px-3 py-1.5 rounded-full text-xs font-semibold bg-gradient-to-r from-primary/10 to-pink-500/10 text-foreground border border-primary/20">
                  📍 {d}
                </span>
              ))}
            </div>
          </section>
        )}
      </main>
      <Footer />
    </div>
  );
};

const EmptyTab = ({ text }: { text: string }) => (
  <p className="text-sm text-muted-foreground bg-card border border-border rounded-2xl p-6 text-center">{text}</p>
);

const TripCard = ({ trip, bookmarked, onBookmark }: { trip: any; bookmarked: boolean; onBookmark: () => void }) => (
  <div className="relative rounded-2xl bg-card border border-border p-4 hover:shadow-lg hover:border-primary/40 transition-all group">
    <button onClick={(e) => { e.preventDefault(); onBookmark(); }}
      className="absolute top-2 right-2 p-1.5 rounded-full bg-background/80 hover:bg-background transition z-10"
      aria-label="Bookmark trip">
      <Bookmark className={`w-3.5 h-3.5 ${bookmarked ? "fill-primary text-primary" : "text-foreground"}`} />
    </button>
    <Link to={`/trip/${trip.id}`} className="block">
      <div className="flex items-center gap-2 mb-1">
        <Calendar className="w-3.5 h-3.5 text-primary" />
        <span className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">{trip.trip_type?.replace("_", " ")}</span>
      </div>
      <h3 className="font-bold text-foreground group-hover:text-primary line-clamp-2 pr-6">{trip.title}</h3>
      <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1"><MapPin className="w-3 h-3" />{trip.destination || trip.route || "—"}</p>
      <div className="mt-2 flex items-center justify-between">
        <span className="text-sm font-bold text-primary">₹{Number(trip.total_price).toLocaleString()}</span>
        <span className="text-[10px] text-primary font-semibold">View trip →</span>
      </div>
    </Link>
  </div>
);

export default TravelerProfile;
