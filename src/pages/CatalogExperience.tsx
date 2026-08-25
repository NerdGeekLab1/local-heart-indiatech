import { Link, useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import {
  Clock, CalendarRange, Users, MapPin, Star, Lock, ShieldCheck, Check,
  Sparkles, ArrowRight, PartyPopper,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useCurrency } from "@/contexts/CurrencyContext";
import { useCatalogDetail, seasonSummary, MONTH_LABELS, type CatalogHostCard } from "@/hooks/useExperienceCatalog";

const dateLabel = (value?: string | null) =>
  value ? new Date(value).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : null;

const MaskedHostCard = ({ host }: { host: CatalogHostCard }) => (
  <div className="relative overflow-hidden rounded-2xl border border-border bg-card p-5 shadow-card">
    <div className="flex items-start gap-4">
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-secondary">
        <Lock className="h-5 w-5 text-muted-foreground" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="font-semibold text-foreground blur-[3px] select-none">{host.display_name}</p>
          {host.verification_status === "verified" && (
            <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-primary">
              <ShieldCheck className="h-3 w-3" /> Verified
            </span>
          )}
        </div>
        <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{host.headline || "Hosted experience"}</p>
        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
          {host.city_region && <span className="inline-flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{host.city_region}</span>}
          <span className="inline-flex items-center gap-1"><Sparkles className="h-3.5 w-3.5" />{host.price_band}</span>
          {host.review_count > 0 && (
            <span className="inline-flex items-center gap-1"><Star className="h-3.5 w-3.5 fill-primary text-primary" />{host.rating} ({host.review_count})</span>
          )}
        </div>
      </div>
    </div>
  </div>
);

const HostCard = ({ host, catalogTitle }: { host: CatalogHostCard; catalogTitle: string }) => {
  const { format } = useCurrency();
  const target = host.username || host.host_id;
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-card transition-shadow hover:shadow-card-hover">
      <div className="flex items-start gap-4 p-5">
        <img src={host.avatar_url || "/placeholder.svg"} alt={host.full_name || "Host"}
          className="h-12 w-12 shrink-0 rounded-full object-cover" loading="lazy" />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <Link to={`/host/${target}`} className="font-semibold text-foreground hover:text-primary">{host.full_name || "Local host"}</Link>
            {host.verification_status === "verified" && (
              <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-primary">
                <ShieldCheck className="h-3 w-3" /> Verified
              </span>
            )}
          </div>
          <p className="mt-1 text-sm font-medium text-foreground">{host.headline || catalogTitle}</p>
          {host.host_notes && <p className="mt-1 text-sm text-muted-foreground line-clamp-3">{host.host_notes}</p>}
          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
            {host.city && <span className="inline-flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{host.city}</span>}
            {host.duration && <span className="inline-flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{host.duration}</span>}
            <span className="inline-flex items-center gap-1"><Users className="h-3.5 w-3.5" />up to {host.max_guests}</span>
            {host.review_count ? (
              <span className="inline-flex items-center gap-1"><Star className="h-3.5 w-3.5 fill-primary text-primary" />{host.rating} ({host.review_count})</span>
            ) : (
              <span>New host</span>
            )}
          </div>
          {host.meeting_point && <p className="mt-2 text-xs text-muted-foreground">Meeting point: {host.meeting_point}</p>}
          {(host.available_from || host.available_to) && (
            <p className="mt-1 text-xs text-muted-foreground">
              Available {dateLabel(host.available_from) ?? "now"} – {dateLabel(host.available_to) ?? "open ended"}
            </p>
          )}
        </div>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border bg-secondary/40 px-5 py-3">
        <div>
          <p className="text-lg font-bold text-foreground">{format(Number(host.price ?? 0))}</p>
          <p className="text-[11px] uppercase tracking-wide text-muted-foreground">{(host.price_unit || "per_person").replace(/_/g, " ")}</p>
        </div>
        <div className="flex gap-2">
          <Button asChild size="sm" variant="outline" className="rounded-full"><Link to={`/host/${target}`}>View host</Link></Button>
          <Button asChild size="sm" className="rounded-full gap-1"><Link to={`/book/${target}`}>Book now <ArrowRight className="h-3.5 w-3.5" /></Link></Button>
        </div>
      </div>
    </div>
  );
};

const CatalogExperience = () => {
  const { slug } = useParams<{ slug: string }>();
  const { user } = useAuth();
  const { format } = useCurrency();
  const { data, isLoading } = useCatalogDetail(slug, user?.id ?? null);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="mx-auto max-w-6xl px-4 pt-24 pb-16 sm:px-6 lg:px-8">
          <div className="h-64 animate-pulse rounded-3xl bg-secondary" />
          <div className="mt-6 grid gap-4 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-40 animate-pulse rounded-2xl bg-secondary" />)}
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!data?.found) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="mx-auto max-w-2xl px-4 pt-32 pb-24 text-center">
          <h1 className="text-2xl font-bold text-foreground">Experience type not found</h1>
          <p className="mt-2 text-muted-foreground">This experience may have been unpublished.</p>
          <Button asChild className="mt-6 rounded-full"><Link to="/experience-types">Browse experience types</Link></Button>
        </div>
        <Footer />
      </div>
    );
  }

  const c = data.catalog;
  const priceMin = Number(data.price_range?.min ?? c.price_min);
  const priceMax = Number(data.price_range?.max ?? c.price_max);

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>{`${c.title} in India | Travelista`}</title>
        <meta name="description" content={c.summary.slice(0, 155)} />
        <meta property="og:title" content={`${c.title} — hosted by locals across India`} />
        <meta property="og:description" content={c.summary.slice(0, 155)} />
        <meta property="og:type" content="article" />
      </Helmet>
      <Navbar />

      {/* Hero — always public */}
      <section className="relative">
        <div className="relative h-[38vh] min-h-[280px] w-full overflow-hidden">
          <img src={c.hero_image_url || "/placeholder.svg"} alt={c.title} className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-foreground via-foreground/50 to-foreground/10" />
          <div className="absolute inset-x-0 bottom-0 mx-auto max-w-6xl px-4 pb-8 sm:px-6 lg:px-8">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-sm bg-primary px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary-foreground">{c.category}</span>
              {c.sub_category && <span className="rounded-sm bg-card/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary-foreground">{c.sub_category}</span>}
              {c.occasion_type && (
                <span className="inline-flex items-center gap-1 rounded-full bg-card/90 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-primary">
                  <PartyPopper className="h-3 w-3" /> {c.occasion_type}
                </span>
              )}
            </div>
            <h1 className="mt-2 text-3xl font-bold text-primary-foreground sm:text-4xl">{c.title}</h1>
            <p className="mt-2 max-w-2xl text-primary-foreground/85">{c.summary}</p>
          </div>
        </div>
      </section>

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Key facts */}
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { icon: Clock, label: "Typical length", value: c.typical_duration || "Flexible" },
            { icon: CalendarRange, label: "Best season", value: seasonSummary(c.season_months, c.season_label) },
            { icon: Sparkles, label: "Price range", value: `${format(priceMin)} – ${format(priceMax)}` },
            { icon: Users, label: "Hosts offering", value: `${data.host_count} host${data.host_count === 1 ? "" : "s"}` },
          ].map(item => (
            <div key={item.label} className="rounded-2xl border border-border bg-card p-4 shadow-card">
              <item.icon className="h-4 w-4 text-primary" />
              <p className="mt-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{item.label}</p>
              <p className="text-sm font-semibold text-foreground">{item.value}</p>
            </div>
          ))}
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-[1.6fr,1fr]">
          <div className="space-y-8">
            <section>
              <h2 className="text-xl font-bold text-foreground">What this experience is</h2>
              <p className="mt-3 whitespace-pre-line leading-relaxed text-muted-foreground">{c.description}</p>
            </section>

            {c.highlights?.length > 0 && (
              <section>
                <h2 className="text-xl font-bold text-foreground">Highlights</h2>
                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                  {c.highlights.map(h => (
                    <div key={h} className="flex items-start gap-2 rounded-xl bg-secondary/60 p-3 text-sm text-foreground">
                      <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-primary" /> {h}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {c.includes?.length > 0 && (
              <section>
                <h2 className="text-xl font-bold text-foreground">Typically included</h2>
                <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                  {c.includes.map(i => (
                    <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" /> {i}
                    </li>
                  ))}
                </ul>
                <p className="mt-3 text-xs text-muted-foreground">Each host confirms their own inclusions when you book.</p>
              </section>
            )}

            {c.season_months?.length > 0 && c.season_months.length < 12 && (
              <section>
                <h2 className="text-xl font-bold text-foreground">When it runs</h2>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {MONTH_LABELS.map((m, idx) => {
                    const active = c.season_months.includes(idx + 1);
                    return (
                      <span key={m} className={`rounded-full px-2.5 py-1 text-xs font-medium ${active ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"}`}>{m}</span>
                    );
                  })}
                </div>
              </section>
            )}

            {data.occasions?.length > 0 && (
              <section>
                <h2 className="text-xl font-bold text-foreground">Upcoming dates from hosts</h2>
                <div className="mt-3 space-y-3">
                  {data.occasions.map(o => (
                    <div key={o.id} className="flex items-start gap-3 rounded-2xl border border-border bg-card p-4 shadow-card">
                      <PartyPopper className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                      <div>
                        <p className="font-semibold text-foreground">{o.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {[o.event_type, o.city, dateLabel(o.start_date) && `${dateLabel(o.start_date)}${o.end_date ? ` – ${dateLabel(o.end_date)}` : ""}`]
                            .filter(Boolean).join(" · ")}
                        </p>
                        {o.description && <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{o.description}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Host column — gated */}
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
              <h2 className="text-lg font-bold text-foreground">
                {data.host_count} host{data.host_count === 1 ? "" : "s"} offer this
              </h2>
              {data.cities?.length > 0 && (
                <p className="mt-1 text-xs text-muted-foreground">In {data.cities.slice(0, 5).join(" · ")}{data.cities.length > 5 ? " and more" : ""}</p>
              )}

              {data.gated ? (
                <>
                  <div className="mt-4 rounded-xl bg-secondary/70 p-4">
                    <p className="flex items-center gap-2 text-sm font-semibold text-foreground"><Lock className="h-4 w-4 text-primary" /> Host details are protected</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Sign in as a traveler to unlock host names, photos, exact pricing, availability and instant booking.
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <Button asChild size="sm" className="rounded-full"><Link to="/login/traveler">Sign in to see hosts</Link></Button>
                      <Button asChild size="sm" variant="outline" className="rounded-full"><Link to="/signup">Create account</Link></Button>
                    </div>
                  </div>
                  <div className="mt-4 space-y-3">
                    {data.hosts.length === 0 ? (
                      <p className="rounded-xl border border-dashed border-border p-4 text-sm text-muted-foreground">
                        No hosts have published this experience yet. Sign in to get notified when they do.
                      </p>
                    ) : data.hosts.slice(0, 4).map(h => <MaskedHostCard key={h.offering_id} host={h} />)}
                  </div>
                </>
              ) : (
                <div className="mt-4 space-y-3">
                  {data.hosts.length === 0 ? (
                    <p className="rounded-xl border border-dashed border-border p-4 text-sm text-muted-foreground">
                      No host has published this experience yet. Explore hosts nearby and request it directly.
                    </p>
                  ) : data.hosts.map(h => <HostCard key={h.offering_id} host={h} catalogTitle={c.title} />)}
                  <Button asChild variant="outline" className="w-full rounded-full"><Link to="/explore">Explore all hosts</Link></Button>
                </div>
              )}
            </div>
          </aside>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default CatalogExperience;
