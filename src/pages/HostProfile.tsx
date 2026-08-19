import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Car, Clock3, Compass, Home, Languages, MapPin, MessageCircle, Share2, ShieldCheck, Sparkles, Star, UtensilsCrossed, Verified } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useCurrency } from "@/contexts/CurrencyContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { hostCompleteness } from "@/lib/hostCompleteness";
import { CompletenessRing } from "@/components/host/ProfileCompleteness";

type PublicHostData = {
  profile: { id: string; username?: string; full_name: string; city?: string; tagline?: string; bio?: string; avatar_url?: string; cover_url?: string; services?: string[]; specialties?: string[]; languages?: string[]; response_time?: string; years_hosting?: number; social_links?: Record<string, string>; price_per_day?: number; host_since?: string };
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
  const [data, setData] = useState<PublicHostData | null>(null);
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

  const completeness = useMemo(() => hostCompleteness({
    coverUrl: data?.profile.cover_url,
    avatarUrl: data?.profile.avatar_url,
    bio: data?.profile.bio,
    tagline: data?.profile.tagline,
    city: data?.profile.city,
    languages: data?.profile.languages,
    responseTime: data?.profile.response_time,
    yearsHosting: data?.profile.years_hosting,
    services: data?.profile.services,
    specialties: data?.profile.specialties,
    reelsCount: data?.reels?.length ?? 0,
    amenitiesCount:
      (data?.properties ?? []).reduce((sum: number, item: any) => sum + (item.amenities?.length || 0), 0) +
      (data?.transports ?? []).reduce((sum: number, item: any) => sum + (item.amenities?.length || 0), 0) +
      (data?.dishes ?? []).reduce((sum: number, item: any) => sum + (item.dietary_tags?.length || 0), 0),
  }), [data]);

  if (loading) return <div className="min-h-screen bg-background"><Navbar /><main className="mx-auto max-w-6xl px-4 pt-28"><Skeleton className="h-56 w-full rounded-lg" /><Skeleton className="mt-6 h-12 w-1/2" /></main></div>;
  if (!data) return <main className="min-h-screen bg-background flex items-center justify-center"><div className="text-center"><h1 className="text-2xl font-bold">Host not found</h1><Link className="mt-3 inline-block text-primary" to="/explore">Back to Explore</Link></div></main>;

  const { profile, experiences, reviews, properties, dishes, transports } = data;
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
        <div className="rounded-lg border border-border bg-card p-5 shadow-card sm:p-6">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
            <img src={avatar} alt={profile.full_name} className="h-32 w-32 rounded-2xl border-4 border-background object-cover shadow-card sm:-mt-20" />
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2"><h1 className="text-3xl font-bold text-foreground">{profile.full_name}</h1><span className="inline-flex items-center gap-1 rounded-full bg-accent/10 px-2 py-1 text-xs font-semibold text-accent"><Verified className="h-4 w-4" /> Verified host</span></div>
              <p className="mt-1 flex items-center gap-1 text-muted-foreground"><MapPin className="h-4 w-4" />{profile.city || "Location not added"}</p>
              {profile.tagline && <p className="mt-1 text-muted-foreground">{profile.tagline}</p>}
              <div className="mt-3 flex flex-wrap items-center gap-3 text-sm">
                <span className="flex items-center gap-1"><Star className="h-4 w-4 fill-primary text-primary" />{rating ? rating.toFixed(1) : "New"} ({reviews.length})</span>
                <span className="text-muted-foreground">·</span>
                <span className="font-semibold">{format(Number(profile.price_per_day || 0))}<span className="text-xs font-normal text-muted-foreground"> / day</span></span>
              </div>
            </div>
            <div className="flex items-center gap-3 sm:flex-col sm:items-end">
              <div className="flex items-center gap-2" title="How complete this host profile is" data-testid="host-completeness-badge">
                <CompletenessRing score={completeness.score} size={44} />
                <span className="text-xs text-muted-foreground">profile<br />complete</span>
              </div>
              <div className="flex gap-2">
                <Button asChild className="gap-2"><Link to={`/book/${profile.username || profile.id}`}><MessageCircle className="h-4 w-4" />Book now</Link></Button>
                <Button variant="outline" size="icon" onClick={share} aria-label="Share profile"><Share2 className="h-4 w-4" /></Button>
              </div>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3 border-t border-border pt-5 sm:grid-cols-4">
            {(profile.services || []).map(service => {
              const Icon = serviceIcons[service] || Compass;
              const target = serviceTabs[service] || "overview";
              return (
                <button
                  key={service}
                  type="button"
                  onClick={() => setTab(target)}
                  data-testid={`host-service-${service.toLowerCase()}`}
                  className={`group rounded-lg border p-4 text-left transition hover:-translate-y-0.5 hover:border-primary hover:shadow-card ${tab === target ? "border-primary bg-primary/10" : "border-border bg-background"}`}
                >
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10"><Icon className="h-5 w-5 text-primary" /></span>
                  <p className="mt-3 font-semibold">{service}</p>
                  <p className="text-xs text-muted-foreground">Explore options →</p>
                </button>
              );
            })}
          </div>
        </div>

        <nav className="mt-6 flex gap-1 overflow-x-auto border-b border-border" role="tablist" data-testid="host-tabs">
          {tabs.map(item => (
            <button
              key={item.key}
              role="tab"
              aria-selected={tab === item.key}
              onClick={() => setTab(item.key)}
              className={`shrink-0 border-b-2 px-4 py-3 text-sm font-medium transition ${tab === item.key ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}
            >
              {item.label}{typeof item.count === "number" && <span className="ml-1 text-xs text-muted-foreground">({item.count})</span>}
            </button>
          ))}
        </nav>

        <div className="mt-8 grid gap-8 lg:grid-cols-[2fr_1fr]">
          <div className="space-y-8">
            {tab === "overview" && <>
              <section><h2 className="text-xl font-bold">About {profile.full_name}</h2><p className="mt-3 leading-relaxed text-muted-foreground">{profile.bio || "This host has not added a bio yet."}</p><div className="mt-3 flex flex-wrap gap-2">{(profile.specialties || []).map(item => <span key={item} className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">{item}</span>)}</div></section>
              <section data-testid="host-reels">
                <h2 className="text-xl font-bold">Reels &amp; Stories</h2>
                {reels.length ? (
                  <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
                    {reels.map((reel: any) => (
                      <figure key={reel.id} data-reel-id={reel.id} className="overflow-hidden rounded-lg border border-border bg-card">
                        {reel.media_type === "video"
                          ? <video src={reel.media_url} controls playsInline preload="metadata" className="aspect-[9/16] w-full object-cover" />
                          : <img src={reel.media_url} alt={reel.caption || "Host story"} loading="lazy" className="aspect-[9/16] w-full object-cover" />}
                        <figcaption className="p-3 text-xs text-muted-foreground line-clamp-2">{reel.caption || reel.location || "Story"}</figcaption>
                      </figure>
                    ))}
                  </div>
                ) : <p className="mt-2 text-sm text-muted-foreground">No reels or stories shared yet.</p>}
              </section>
            </>}

            {tab === "experiences" && <ListingSection title="Experiences" empty="No approved experiences yet." items={experiences} render={(item) => <><p className="font-semibold">{item.title}</p><p className="text-sm text-muted-foreground">{item.location} · {format(Number(item.price || 0))}</p></>} />}
            {tab === "stay" && <ListingSection title="Stay" empty="No properties listed." items={properties} render={(item) => <><p className="font-semibold">{item.property_name}</p><p className="text-sm text-muted-foreground">{item.property_type} · {format(Number(item.nightly_rate || 0))}/night</p><Tags values={item.amenities} /></>} />}
            {tab === "food" && <ListingSection title="Food menu" empty="No dishes listed." items={dishes} render={(item) => <><p className="font-semibold">{item.name}</p><p className="text-sm text-muted-foreground">{item.cuisine} · {item.meal_type} · {format(Number(item.price_per_plate || 0))}/plate</p><Tags values={item.dietary_tags} /></>} />}
            {tab === "transport" && <ListingSection title="Transport" empty="No vehicles listed." items={transports} render={(item) => <><p className="font-semibold">{item.model}</p><p className="text-sm text-muted-foreground">{item.vehicle_type} · {item.capacity} passengers · {format(Number(item.price_per_day || 0))}/day</p><Tags values={item.amenities} /></>} />}
            {tab === "reviews" && (
              <section>
                <h2 className="text-xl font-bold">Traveler reviews</h2>
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  {reviews.length ? reviews.map(review => (
                    <article key={review.id} className="rounded-lg border border-border bg-card p-4">
                      <p className="font-medium text-primary">{"★".repeat(Number(review.rating || 0))}</p>
                      <p className="mt-2 text-sm text-muted-foreground">{review.text || "Video review"}</p>
                    </article>
                  )) : <p className="text-sm text-muted-foreground">No reviews yet.</p>}
                </div>
              </section>
            )}
          </div>

          <aside className="space-y-6">
            {quickInfo.length > 0 && (
              <div data-testid="host-quick-info" className="rounded-lg border border-border bg-card p-5">
                <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Quick info</h2>
                <dl className="mt-3 space-y-2">
                  {quickInfo.map(item => (
                    <div key={item.label} className="flex items-center gap-3 border-b border-border/60 pb-3 last:border-0 last:pb-0">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10"><item.icon className="h-4 w-4 text-primary" /></span>
                      <div><dt className="text-xs text-muted-foreground">{item.label}</dt><dd className="text-sm font-semibold text-foreground">{item.value}</dd></div>
                    </div>
                  ))}
                </dl>
              </div>
            )}
            <div className="rounded-lg border border-border bg-card p-5">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Latest reviews</h2>
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

function Tags({ values }: { values?: string[] }) { return <div className="mt-2 flex flex-wrap gap-1">{(values || []).map(value => <span key={value} className="rounded-full bg-secondary px-2 py-1 text-xs text-muted-foreground">{value}</span>)}</div>; }

function ListingSection({ title, empty, items, render }: { title: string; empty: string; items: any[]; render: (item: any) => React.ReactNode }) {
  return <section><h2 className="text-xl font-bold">{title}</h2>{items.length ? <div className="mt-3 grid gap-3 sm:grid-cols-2">{items.map(item => <article key={item.id} className="rounded-lg border border-border bg-card p-4">{render(item)}</article>)}</div> : <p className="mt-2 text-sm text-muted-foreground">{empty}</p>}</section>;
}
