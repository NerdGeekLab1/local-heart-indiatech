import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Car, Compass, Home, MapPin, MessageCircle, Share2, Star, UtensilsCrossed, Verified } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useCurrency } from "@/contexts/CurrencyContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

type PublicHostData = {
  profile: { id: string; username?: string; full_name: string; city?: string; tagline?: string; bio?: string; avatar_url?: string; services?: string[]; specialties?: string[]; social_links?: Record<string, string>; price_per_day?: number; host_since?: string };
  experiences: any[];
  reviews: any[];
  properties: any[];
  dishes: any[];
  transports: any[];
};

const serviceIcons: Record<string, React.ElementType> = { Guide: Compass, Stay: Home, Transport: Car, Food: UtensilsCrossed };

export default function HostProfile() {
  const { id } = useParams();
  const { format } = useCurrency();
  const { toast } = useToast();
  const [data, setData] = useState<PublicHostData | null>(null);
  const [loading, setLoading] = useState(true);

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

  if (loading) return <div className="min-h-screen bg-background"><Navbar /><main className="mx-auto max-w-6xl px-4 pt-28"><Skeleton className="h-56 w-full rounded-lg" /><Skeleton className="mt-6 h-12 w-1/2" /></main></div>;
  if (!data) return <main className="min-h-screen bg-background flex items-center justify-center"><div className="text-center"><h1 className="text-2xl font-bold">Host not found</h1><Link className="mt-3 inline-block text-primary" to="/explore">Back to Explore</Link></div></main>;

  const { profile, experiences, reviews, properties, dishes, transports } = data;
  const avatar = profile.avatar_url || "/placeholder.svg";
  const share = async () => {
    if (navigator.share) await navigator.share({ title: `${profile.full_name} on RoamYoo`, url: window.location.href });
    else { await navigator.clipboard.writeText(window.location.href); toast({ title: "Link copied" }); }
  };

  return <div className="min-h-screen bg-background">
    <Navbar />
    <main className="pb-16 pt-20">
      <div className="h-56 bg-secondary sm:h-72"><img src={avatar} alt="" className="h-full w-full object-cover opacity-30" /></div>
      <section className="relative z-10 mx-auto -mt-20 max-w-6xl px-4 sm:px-6">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end">
          <img src={avatar} alt={profile.full_name} className="h-36 w-36 rounded-lg border-4 border-background object-cover shadow-card" />
          <div className="flex-1">
            <div className="flex items-center gap-2"><h1 className="text-3xl font-bold text-foreground">{profile.full_name}</h1><Verified className="h-5 w-5 text-accent" /></div>
            <p className="mt-1 flex items-center gap-1 text-muted-foreground"><MapPin className="h-4 w-4" />{profile.city || "Location not added"}</p>
            {profile.tagline && <p className="mt-1 text-muted-foreground">{profile.tagline}</p>}
          </div>
          <div className="sm:text-right"><p className="text-2xl font-bold">{format(Number(profile.price_per_day || 0))}</p><p className="text-xs text-muted-foreground">per day</p></div>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <Button asChild className="gap-2"><Link to={`/book/${profile.id}`}><MessageCircle className="h-4 w-4" />Book now</Link></Button>
          <Button variant="outline" onClick={share} className="gap-2"><Share2 className="h-4 w-4" />Share</Button>
          <span className="flex items-center gap-1 text-sm"><Star className="h-4 w-4 fill-primary text-primary" />{rating ? rating.toFixed(1) : "New"} ({reviews.length})</span>
        </div>

        <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {(profile.services || []).map(service => { const Icon = serviceIcons[service] || Compass; return <div key={service} className="rounded-lg border border-border bg-card p-4 text-center"><Icon className="mx-auto h-6 w-6 text-primary" /><p className="mt-2 font-medium">{service}</p></div>; })}
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-[2fr_1fr]">
          <div className="space-y-8">
            <section><h2 className="text-xl font-bold">About {profile.full_name}</h2><p className="mt-3 leading-relaxed text-muted-foreground">{profile.bio || "This host has not added a bio yet."}</p><div className="mt-3 flex flex-wrap gap-2">{(profile.specialties || []).map(item => <span key={item} className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">{item}</span>)}</div></section>
            <ListingSection title="Experiences" empty="No approved experiences yet." items={experiences} render={(item) => <><p className="font-semibold">{item.title}</p><p className="text-sm text-muted-foreground">{item.location} · {format(Number(item.price || 0))}</p></>} />
            <ListingSection title="Properties" empty="No properties listed." items={properties} render={(item) => <><p className="font-semibold">{item.property_name}</p><p className="text-sm text-muted-foreground">{item.property_type} · {format(Number(item.nightly_rate || 0))}/night</p><Tags values={item.amenities} /></>} />
            <ListingSection title="Food menu" empty="No dishes listed." items={dishes} render={(item) => <><p className="font-semibold">{item.name}</p><p className="text-sm text-muted-foreground">{item.cuisine} · {item.meal_type} · {format(Number(item.price_per_plate || 0))}/plate</p><Tags values={item.dietary_tags} /></>} />
            <ListingSection title="Transport" empty="No vehicles listed." items={transports} render={(item) => <><p className="font-semibold">{item.model}</p><p className="text-sm text-muted-foreground">{item.vehicle_type} · {item.capacity} passengers · {format(Number(item.price_per_day || 0))}/day</p><Tags values={item.amenities} /></>} />
          </div>
          <aside><h2 className="text-xl font-bold">Traveler reviews</h2><div className="mt-3 space-y-3">{reviews.length ? reviews.map(review => <article key={review.id} className="rounded-lg border border-border bg-card p-4"><p className="font-medium">{"★".repeat(Number(review.rating || 0))}</p><p className="mt-2 text-sm text-muted-foreground">{review.text || "Video review"}</p></article>) : <p className="text-sm text-muted-foreground">No reviews yet.</p>}</div></aside>
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