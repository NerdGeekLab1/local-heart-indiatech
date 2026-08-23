import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Car, ChevronRight, Clock3, Compass, Heart, Home, Languages, MapPin, MessageCircle, Quote, Share2, ShieldCheck, Sparkles, Star, UtensilsCrossed, Verified } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useCurrency } from "@/contexts/CurrencyContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

type PublicHostData = {
  profile: { id: string; username?: string; full_name: string; city?: string; tagline?: string; bio?: string; avatar_url?: string; cover_url?: string; services?: string[]; specialties?: string[]; languages?: string[]; response_time?: string; years_hosting?: number; social_links?: Record<string, string>; price_per_day?: number; host_since?: string; verification_status?: string };
  experiences: any[];
  reviews: any[];
  properties: any[];
  dishes: any[];
  transports: any[];
  reels?: any[];
};

const serviceIcons: Record<string, React.ElementType> = { Guide: Compass, Stay: Home, Transport: Car, Food: UtensilsCrossed };
/** Clicking a service card jumps to the matching content tab. */
const serviceTabs: Record<string, TabKey> = { Guide: "experiences", Stay: "stay", Transport: "transport", Food: "food" };

type TabKey = "overview" | "stay" | "transport" | "food" | "experiences" | "reviews";

export default function HostProfile() {
  const { id } = useParams();
  const { format } = useCurrency();
  const { toast } = useToast();
  const { user } = useAuth();
  const [data, setData] = useState<PublicHostData | null>(null);
  const [draft, setDraft] = useState<{ tagline: string; bio: string } | null>(null);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<TabKey>("overview");

  useEffect(() => {
    let active = true;
    if (!id) return;
    supabase.rpc("get_public_host", { _identifier: id }).then(({ data: result }) => {
      if (active) { setData(result as PublicHostData | null); setLoading(false); }
    });
    return () => { active = false; };
  }, [id]);

  const rating = useMemo(() => data?.reviews.length
    ? data.reviews.reduce((sum, review) => sum + Number(review.rating || 0), 0) / data.reviews.length
    : 0, [data]);

  if (loading) return <HostProfileSkeleton />;
  if (!data) return <main className="min-h-screen bg-background flex items-center justify-center"><div className="text-center"><h1 className="text-2xl font-bold">Host not found</h1><Link className="mt-3 inline-block text-primary" to="/explore">Back to Explore</Link></div></main>;

  const { profile, experiences, reviews, properties, dishes, transports } = data;
  const isOwner = Boolean(user && user.id === profile.id);
  const editing = draft ?? { tagline: profile.tagline || "", bio: profile.bio || "" };
  const dirty = editing.tagline !== (profile.tagline || "") || editing.bio !== (profile.bio || "");
  /** Owners edit their own tagline/bio inline; everyone else sees a read-only profile. */
  const saveProfile = async () => {
    if (!user || !dirty) return;
    setSaving(true);
    const { error } = await supabase.from("profiles").update({ tagline: editing.tagline, bio: editing.bio }).eq("id", user.id);
    setSaving(false);
    if (error) { toast({ title: "Couldn't save profile", description: error.message, variant: "destructive" }); return; }
    setData(current => current ? { ...current, profile: { ...current.profile, tagline: editing.tagline, bio: editing.bio } } : current);
    setDraft(null);
    toast({ title: "Profile saved" });
  };
  const reels = data.reels ?? [];
  const avatar = profile.avatar_url || "/placeholder.svg";
  const cover = profile.cover_url || profile.avatar_url || "/placeholder.svg";
  const share = async () => {
    if (navigator.share) await navigator.share({ title: `${profile.full_name} on RoamYoo`, url: window.location.href });
    else { await navigator.clipboard.writeText(window.location.href); toast({ title: "Link copied" }); }
  };
  const quickInfo = [
    { label: "Languages", value: (profile.languages || []).join(", "), icon: Languages },
    { label: "Responds in", value: profile.response_time || "", icon: Clock3 },
    { label: "Years hosting", value: profile.years_hosting ? String(profile.years_hosting) : "", icon: ShieldCheck },
    { label: "Host since", value: profile.host_since ? new Date(profile.host_since).getFullYear().toString() : "", icon: Sparkles },
  ].filter(item => item.value);

  const tabs: { key: TabKey; label: string; count?: number }[] = [
    { key: "overview", label: "Overview" },
    { key: "stay", label: "Stay", count: properties.length },
    { key: "transport", label: "Transport", count: transports.length },
    { key: "food", label: "Food", count: dishes.length },
    { key: "experiences", label: "Experiences", count: experiences.length },
    { key: "reviews", label: "Reviews", count: reviews.length },
  ];

  return <div className="min-h-screen bg-background">
    <Navbar />
    <main className="pb-16 pt-20">
      <div className="h-56 bg-secondary sm:h-72"><img src={cover} alt={`${profile.full_name} cover`} className={`h-full w-full object-cover ${profile.cover_url ? "" : "opacity-30"}`} /></div>
      <section className="relative z-10 mx-auto -mt-20 max-w-6xl px-4 sm:px-6">
        <div className="rounded-3xl border border-border bg-card/95 p-5 shadow-elegant backdrop-blur sm:p-7">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
            <img src={avatar} alt={profile.full_name} className="h-32 w-32 rounded-3xl border-4 border-background object-cover shadow-elegant ring-2 ring-primary/40 sm:-mt-24" />
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2"><h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">{profile.full_name}</h1>{profile.verification_status === "verified" && <span className="inline-flex items-center gap-1 rounded-full bg-accent/10 px-2 py-1 text-xs font-semibold text-accent"><Verified className="h-4 w-4" /> Verified host</span>}</div>
              <p className="mt-1 flex items-center gap-1 text-muted-foreground"><MapPin className="h-4 w-4" />{profile.city || "Location not added"}</p>
              {isOwner ? (
                <div className="mt-3 space-y-2" data-testid="host-profile-owner-editor">
                  <Input value={editing.tagline} onChange={event => setDraft({ ...editing, tagline: event.target.value })} placeholder="Add a short tagline" aria-label="Tagline" />
                  <Textarea value={editing.bio} onChange={event => setDraft({ ...editing, bio: event.target.value })} placeholder="Tell travelers about yourself" aria-label="Bio" className="min-h-[90px]" />
                  <div className="flex items-center gap-2">
                    <Button size="sm" className="rounded-full" onClick={saveProfile} disabled={saving || !dirty} data-testid="host-profile-save">{saving ? "Saving…" : "Save changes"}</Button>
                    {dirty && !saving && <Button size="sm" variant="ghost" className="rounded-full" onClick={() => setDraft(null)}>Discard</Button>}
                  </div>
                </div>
              ) : profile.tagline ? <p className="mt-1 text-muted-foreground">{profile.tagline}</p> : null}
              <div className="mt-3 flex flex-wrap items-center gap-3 text-sm">
                <span className="flex items-center gap-1"><Star className="h-4 w-4 fill-primary text-primary" />{rating ? rating.toFixed(1) : "New"} ({reviews.length})</span>
                <span className="text-muted-foreground">·</span>
                <span className="font-semibold">{format(Number(profile.price_per_day || 0))}<span className="text-xs font-normal text-muted-foreground"> / day</span></span>
              </div>
            </div>
            <div className="flex items-center gap-3 sm:flex-col sm:items-end">
              <div className="flex gap-2">
                <Button asChild className="gap-2"><Link to={`/book/${profile.username || profile.id}`}><MessageCircle className="h-4 w-4" />Book now</Link></Button>
                {!isOwner && (
                  <Button
                    variant={favorited ? "default" : "outline"}
                    className="gap-2"
                    onClick={toggleFavorite}
                    disabled={favoriting}
                    data-testid="host-profile-favorite"
                    aria-pressed={favorited}
                  >
                    <Heart className={`h-4 w-4 ${favorited ? "fill-current" : ""}`} />
                    {favorited ? "Saved" : "Save"}
                  </Button>
                )}
                <Button variant="outline" size="icon" onClick={share} aria-label="Share profile"><Share2 className="h-4 w-4" /></Button>
              </div>
              {!isOwner && <p className="text-[11px] text-muted-foreground">{favorited ? "In your traveler dashboard → Saved" : "Save this host to your dashboard"}</p>}
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3 border-t border-border pt-5 sm:grid-cols-4">
            {(profile.services || []).length ? (profile.services || []).map(service => {
              const Icon = serviceIcons[service] || Compass;
              const target = serviceTabs[service] || "overview";
              return (
                <button
                  key={service}
                  type="button"
                  onClick={() => setTab(target)}
                  data-testid={`host-service-${service.toLowerCase()}`}
                  className={`group rounded-2xl border p-4 text-left transition hover:-translate-y-1 hover:border-primary hover:shadow-elegant ${tab === target ? "border-primary bg-primary/10 shadow-card" : "border-border bg-background"}`}
                >
                  <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/25 to-accent/20"><Icon className="h-5 w-5 text-primary" /></span>
                  <p className="mt-3 text-base font-bold text-foreground">{service}</p>
                  <p className="flex items-center gap-1 text-xs font-medium text-primary">Explore options <ChevronRight className="h-3 w-3" /></p>
                </button>
              );
            }) : <div className="col-span-full rounded-lg border border-dashed border-border p-4 text-center text-sm text-muted-foreground">This host is still adding service details.</div>}
          </div>
        </div>

        <nav className="mt-6 flex gap-1 overflow-x-auto rounded-full border border-border bg-card p-1" role="tablist" data-testid="host-tabs">
          {tabs.map(item => (
            <button
              key={item.key}
              role="tab"
              aria-selected={tab === item.key}
              onClick={() => setTab(item.key)}
              className={`shrink-0 rounded-full px-4 py-2.5 text-sm font-semibold transition ${tab === item.key ? "bg-primary text-primary-foreground shadow-card" : "text-muted-foreground hover:bg-secondary hover:text-foreground"}`}
            >
              {item.label}{typeof item.count === "number" && <span className={`ml-1.5 rounded-full px-1.5 py-0.5 text-[10px] ${tab === item.key ? "bg-primary-foreground/20" : "bg-secondary"}`}>{item.count}</span>}
            </button>
          ))}
        </nav>

        <div className="mt-8 grid gap-8 lg:grid-cols-[2fr_1fr]">
          <div className="space-y-8">
            {tab === "overview" && <>
              <section className="rounded-2xl border border-border bg-card p-5">
                <h2 className="flex items-center gap-2 text-xl font-bold"><Sparkles className="h-5 w-5 text-primary" />About {profile.full_name}</h2>
                <p className="mt-3 leading-relaxed text-muted-foreground">{(isOwner ? editing.bio : profile.bio) || "This host has not added a bio yet."}</p>
                {(profile.specialties || []).length ? <div className="mt-4 flex flex-wrap gap-2">{(profile.specialties || []).map(item => <span key={item} className="rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">{item}</span>)}</div> : <p className="mt-3 text-xs text-muted-foreground">Specialties will appear here once added.</p>}
              </section>
              <section data-testid="host-reels">
                <h2 className="text-xl font-bold">Reels &amp; Stories</h2>
                <p className="text-sm text-muted-foreground">Moments straight from {profile.full_name}'s world.</p>
                {reels.length ? (
                  <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
                    {reels.map((reel: any) => (
                      <figure key={reel.id} data-reel-id={reel.id} className="overflow-hidden rounded-2xl border border-border bg-card transition hover:-translate-y-1 hover:shadow-elegant">
                        {reel.media_type === "video"
                          ? <video src={reel.media_url} controls playsInline preload="metadata" className="aspect-[9/16] w-full object-cover" />
                          : <img src={reel.media_url} alt={reel.caption || "Host story"} loading="lazy" className="aspect-[9/16] w-full object-cover" />}
                        <figcaption className="p-3 text-xs text-muted-foreground line-clamp-2">{reel.caption || reel.location || "Story"}</figcaption>
                      </figure>
                    ))}
                  </div>
                ) : <EmptyState text="No reels or stories shared yet." />}
              </section>
            </>}

            {tab === "experiences" && <ListingSection title="Experiences" empty="No approved experiences yet." items={experiences} render={(item) => <><span className="rounded-full bg-primary px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-primary-foreground">{item.category || "Experience"}</span><p className="mt-2 text-base font-bold text-foreground">{item.title}</p><p className="text-sm text-muted-foreground">{item.location}</p><p className="mt-2 font-bold text-primary">{format(Number(item.price || 0))}</p></>} />}
            {tab === "stay" && <ListingSection title="Stay" empty="No properties listed." items={properties} render={(item) => <><span className="rounded-full bg-primary px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-primary-foreground">{item.property_type}</span><p className="mt-2 text-base font-bold text-foreground">{item.property_name}</p><p className="text-sm text-muted-foreground">Up to {item.max_guests || 1} guests</p><p className="mt-2 font-bold text-primary">{format(Number(item.nightly_rate || 0))}<span className="text-xs font-normal text-muted-foreground"> / night</span></p><Tags values={item.amenities} /></>} />}
            {tab === "food" && <ListingSection title="Food menu" empty="No dishes listed." items={dishes} render={(item) => <><span className="rounded-full bg-primary px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-primary-foreground">{item.meal_type}</span><p className="mt-2 text-base font-bold text-foreground">{item.name}</p><p className="text-sm text-muted-foreground">{item.cuisine}{item.description ? ` · ${item.description}` : ""}</p><p className="mt-2 font-bold text-primary">{format(Number(item.price_per_plate || 0))}<span className="text-xs font-normal text-muted-foreground"> / plate</span></p><Tags values={item.dietary_tags} /></>} />}
            {tab === "transport" && <ListingSection title="Transport" empty="No vehicles listed." items={transports} render={(item) => <><span className="rounded-full bg-primary px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-primary-foreground">{item.vehicle_type}</span><p className="mt-2 text-base font-bold text-foreground">{item.model}</p><p className="text-sm text-muted-foreground">{item.capacity} pax · {format(Number(item.price_per_km || 0))}/km</p><p className="mt-2 font-bold text-primary">{format(Number(item.price_per_day || 0))}<span className="text-xs font-normal text-muted-foreground"> / day</span></p><Tags values={item.amenities} /></>} />}
            {tab === "reviews" && (
              <section>
                <h2 className="text-xl font-bold">Traveler reviews</h2>
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  {reviews.length ? reviews.map(review => (
                    <article key={review.id} className="rounded-2xl border border-border bg-card p-5 shadow-card">
                      <Quote className="h-5 w-5 text-primary/50" />
                      <p className="mt-2 text-sm leading-relaxed text-foreground">{review.text || "Video review"}</p>
                      <p className="mt-3 font-medium text-primary">{"★".repeat(Number(review.rating || 0))}</p>
                    </article>
                  )) : <EmptyState text="No traveler reviews yet." />}
                </div>
              </section>
            )}
          </div>

          <aside className="space-y-6">
            <div data-testid="host-quick-info" className="rounded-2xl border border-border bg-card p-5 shadow-card">
                <h2 className="text-sm font-bold uppercase tracking-wide text-primary">Quick info</h2>
                {quickInfo.length ? <dl className="mt-3 space-y-2">
                  {quickInfo.map(item => (
                    <div key={item.label} className="flex items-center gap-3 border-b border-border/60 pb-3 last:border-0 last:pb-0">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10"><item.icon className="h-4 w-4 text-primary" /></span>
                      <div><dt className="text-xs text-muted-foreground">{item.label}</dt><dd className="text-sm font-semibold text-foreground">{item.value}</dd></div>
                    </div>
                  ))}
                </dl> : <p className="mt-3 text-sm text-muted-foreground">Quick information has not been added yet.</p>}
              </div>
            <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
              <h2 className="text-sm font-bold uppercase tracking-wide text-primary">Latest reviews</h2>
              <div className="mt-3 space-y-3">
                {reviews.length ? reviews.slice(0, 3).map(review => (
                  <article key={review.id} className="rounded-lg border border-border/60 bg-background p-3">
                    <p className="text-sm font-medium text-primary">{"★".repeat(Number(review.rating || 0))}</p>
                    <p className="mt-1 text-xs text-muted-foreground line-clamp-3">{review.text || "Video review"}</p>
                  </article>
                )) : <p className="text-sm text-muted-foreground">No reviews yet.</p>}
              </div>
              {reviews.length > 3 && <button onClick={() => setTab("reviews")} className="mt-3 text-xs font-semibold text-primary hover:underline">See all reviews →</button>}
            </div>
          </aside>
        </div>
      </section>
    </main>
    <Footer />
  </div>;
}

function Tags({ values }: { values?: string[] }) { return <div className="mt-3 flex flex-wrap gap-1.5">{(values || []).map(value => <span key={value} className="rounded-full border border-border bg-secondary px-2.5 py-1 text-[11px] font-medium text-muted-foreground">{value}</span>)}</div>; }

function EmptyState({ text }: { text: string }) { return <div className="mt-3 rounded-2xl border border-dashed border-border bg-card/60 p-6 text-center text-sm text-muted-foreground">{text}</div>; }

function HostProfileSkeleton() {
  return <div className="min-h-screen bg-background"><Navbar /><main className="pb-16 pt-20" aria-label="Loading host profile"><Skeleton className="h-56 w-full rounded-none sm:h-72" /><section className="relative z-10 mx-auto -mt-20 max-w-6xl px-4 sm:px-6"><div className="rounded-3xl border border-border bg-card p-6"><div className="flex gap-5"><Skeleton className="h-32 w-32 shrink-0 rounded-3xl" /><div className="flex-1 space-y-3"><Skeleton className="h-9 w-56" /><Skeleton className="h-4 w-40" /><Skeleton className="h-4 w-72" /></div></div><div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">{[0,1,2,3].map(item => <Skeleton key={item} className="h-28 rounded-2xl" />)}</div></div><Skeleton className="mt-6 h-12 w-full rounded-full" /><div className="mt-8 grid gap-8 lg:grid-cols-[2fr_1fr]"><div className="space-y-4"><Skeleton className="h-48 rounded-2xl" /><div className="grid grid-cols-2 gap-3"><Skeleton className="h-56 rounded-2xl" /><Skeleton className="h-56 rounded-2xl" /></div></div><Skeleton className="h-72 rounded-2xl" /></div></section></main></div>;
}

function ListingSection({ title, empty, items, render }: { title: string; empty: string; items: any[]; render: (item: any) => React.ReactNode }) {
  return <section>
    <h2 className="text-xl font-bold">{title}</h2>
    {items.length
      ? <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {items.map(item => (
            <article key={item.id} className="overflow-hidden rounded-2xl border border-border bg-card shadow-card transition hover:-translate-y-1 hover:border-primary/50 hover:shadow-elegant">
              {(item.photos?.[0] || item.image_url) && (
                <img src={item.photos?.[0] || item.image_url} alt="" loading="lazy" className="h-40 w-full object-cover" />
              )}
              <div className="p-4">{render(item)}</div>
            </article>
          ))}
        </div>
      : <EmptyState text={empty} />}
  </section>;
}
