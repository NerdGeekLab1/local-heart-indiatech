import { useCallback, useEffect, useMemo, type ReactNode } from "react";
import { Helmet } from "react-helmet-async";
import { useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ChevronLeft, ChevronRight, Play, Printer, MapPin, Users, Video, Sparkles,
  ShieldCheck, Wallet, Gift, BarChart3, Building2, Megaphone, Globe2,
  Handshake, Target, CalendarClock, TrendingUp,
} from "lucide-react";
import SlideFrame, { Reveal } from "@/components/deck/SlideFrame";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const TBD = ({ label }: { label: string }) => (
  <span className="rounded-md bg-destructive/15 px-2 py-0.5 font-semibold text-destructive">[{label} — add real number]</span>
);

const Kicker = ({ children }: { children: ReactNode }) => (
  <p className="slide-kicker text-primary">{children}</p>
);

const Card = ({
  icon: Icon, title, body, delay = 0,
}: { icon: React.ElementType; title: string; body: ReactNode; delay?: number }) => (
  <Reveal delay={delay}>
    <div className="h-full min-h-[260px] rounded-3xl border border-border bg-card p-8 shadow-card">
      <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
        <Icon className="!h-8 !w-8" />
      </div>
      <h3 className="slide-subtitle mb-3">{title}</h3>
      <p className="slide-body text-muted-foreground">{body}</p>
    </div>
  </Reveal>
);

const Bullets = ({ items, delay = 0.2 }: { items: ReactNode[]; delay?: number }) => (
  <ul className="space-y-6">
    {items.map((it, i) => (
      <Reveal key={i} delay={delay + i * 0.1}>
        <li className="flex items-start gap-5 slide-body-lg">
          <span className="mt-4 h-3 w-3 shrink-0 rounded-full bg-primary" />
          <span>{it}</span>
        </li>
      </Reveal>
    ))}
  </ul>
);

const Head = ({ kicker, title }: { kicker: string; title: string }) => (
  <div className="mb-12">
    <Reveal><Kicker>{kicker}</Kicker></Reveal>
    <Reveal delay={0.08}><h2 className="slide-title mt-3">{title}</h2></Reveal>
  </div>
);

const slides: { id: string; title: string; content: ReactNode }[] = [
  {
    id: "cover",
    title: "RoamYoo",
    content: (
      <div className="flex h-full flex-col justify-center">
        <motion.div
          className="absolute -right-40 -top-40 h-[720px] w-[720px] rounded-full bg-primary/15 blur-3xl"
          animate={{ scale: [1, 1.12, 1], opacity: [0.6, 0.9, 0.6] }}
          transition={{ duration: 9, repeat: Infinity }}
        />
        <Reveal><Kicker>Investor overview · MVP live · Seed round</Kicker></Reveal>
        <Reveal delay={0.12}>
          <h1 className="slide-title-lg mt-6 max-w-[1400px]">Book a person, not just a place.</h1>
        </Reveal>
        <Reveal delay={0.24}>
          <p className="slide-body-lg mt-8 max-w-[1150px] text-muted-foreground">
            RoamYoo turns India&apos;s local hosts into the front door for foreign travellers: verified
            homestays, food, transport and guided experiences, wrapped in a social travel feed.
          </p>
        </Reveal>
        <Reveal delay={0.36}>
          <div className="mt-14 flex gap-4 slide-body text-muted-foreground">
            <span className="rounded-full border border-border bg-card px-7 py-3">roamyoo.com</span>
            <span className="rounded-full border border-border bg-card px-7 py-3">Product live in beta</span>
            <span className="rounded-full border border-border bg-card px-7 py-3">India · inbound travel</span>
          </div>
        </Reveal>
      </div>
    ),
  },
  {
    id: "problem",
    title: "The problem",
    content: (
      <>
        <Head kicker="Problem" title="Foreign travellers want India, but not the friction" />
        <div className="grid flex-1 grid-cols-2 gap-16">
          <Bullets items={[
            <>Trust is the blocker: no way to verify who is actually hosting you.</>,
            <>Listings sell rooms, not people. The guide, the cook, the driver stay invisible.</>,
            <>Booking India means juggling WhatsApp, cash, and five separate vendors.</>,
            <>Great local hosts have no distribution and no digital storefront.</>,
          ]} />
          <Reveal delay={0.3}>
            <div className="flex h-full flex-col justify-center gap-6 rounded-3xl border border-border bg-secondary/60 p-10">
              <p className="slide-caption text-muted-foreground">Inbound tourists to India, latest year</p>
              <p className="slide-title"><TBD label="inbound arrivals" /></p>
              <p className="slide-caption text-muted-foreground">Share booking any local, human-led experience</p>
              <p className="slide-title"><TBD label="experience share" /></p>
            </div>
          </Reveal>
        </div>
      </>
    ),
  },
  {
    id: "solution",
    title: "The solution",
    content: (
      <>
        <Head kicker="Solution" title="One verified host. Every part of the trip." />
        <div className="grid flex-1 grid-cols-3 gap-8">
          <Card icon={ShieldCheck} title="Verified hosts" body="KYC, milestone verification badges and mandatory video reviews before a host can scale." />
          <Card icon={MapPin} title="Whole-trip booking" body="Stay, food, transport and experiences from a single host profile, with transparent pricing." delay={0.1} />
          <Card icon={Video} title="Social discovery" body="A story-and-reel feed maps real traveller footage to places, so demand starts with inspiration." delay={0.2} />
        </div>
      </>
    ),
  },
  {
    id: "product",
    title: "Product capabilities",
    content: (
      <>
        <Head kicker="MVP shipped" title="What is already live in the product" />
        <div className="grid flex-1 grid-cols-4 grid-rows-2 gap-6">
          {[
            [Users, "Host storefronts", "Tabbed profiles: stay, transport, food, experiences, reviews."],
            [MapPin, "Destinations engine", "80+ destinations with mapped sites, itineraries and local hosts."],
            [Video, "Story feed & reels", "Likes, comments, tags, map sidebar, moderation queue."],
            [Sparkles, "AI trip concierge", "Chat recommendations tuned to budget, dates and interests."],
            [Wallet, "Bookings & invoices", "Add-ons, variable pricing, GST invoices, status tracking."],
            [Gift, "Rewards & stamps", "Streaks, redemption catalog, referral codes, fraud checks."],
            [BarChart3, "Host dashboard", "Listings, schedule, live activity, performance analytics."],
            [ShieldCheck, "Admin control room", "Verification, moderation, CMS, feature flags, audit log."],
          ].map(([Icon, t, b], i) => (
            <Reveal key={t as string} delay={i * 0.07}>
              <div className="h-full rounded-2xl border border-border bg-card p-7 shadow-card">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10 text-accent">
                  {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                  {(() => { const C = Icon as any; return <C className="!h-6 !w-6" />; })()}
                </div>
                <h3 className="slide-body-lg font-semibold">{t as string}</h3>
                <p className="slide-caption mt-3 text-muted-foreground">{b as string}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </>
    ),
  },
  {
    id: "how",
    title: "How it works",
    content: (
      <>
        <Head kicker="Experience" title="From a reel to a booked trip in four steps" />
        <div className="grid flex-1 grid-cols-4 items-center gap-8">
          {[
            ["Discover", "Traveller finds a story or reel from a real trip."],
            ["Meet the host", "Verified profile with stay, food, transport, reviews."],
            ["Book the trip", "Dates, add-ons, special requests, instant invoice."],
            ["Share back", "Video review, stamps and rewards fuel the next traveller."],
          ].map(([t, b], i) => (
            <Reveal key={t} delay={i * 0.12}>
              <div className="rounded-3xl border border-border bg-card p-9 shadow-card">
                <p className="slide-title text-primary/30">0{i + 1}</p>
                <h3 className="slide-subtitle mt-4">{t}</h3>
                <p className="slide-body mt-4 text-muted-foreground">{b}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </>
    ),
  },
  {
    id: "traction",
    title: "Traction",
    content: (
      <>
        <Head kicker="Traction" title="Where the MVP stands today" />
        <div className="grid grid-cols-4 gap-8">
          {["Hosts onboarded", "Travellers signed up", "Bookings to date", "GMV to date"].map((k, i) => (
            <Reveal key={k} delay={i * 0.1}>
              <div className="rounded-3xl border border-border bg-secondary/60 p-9">
                <p className="slide-caption text-muted-foreground">{k}</p>
                <p className="slide-subtitle mt-5"><TBD label={k} /></p>
              </div>
            </Reveal>
          ))}
        </div>
        <Reveal delay={0.5}>
          <p className="slide-body mt-14 max-w-[1500px] text-muted-foreground">
            Qualitative traction is real and shippable today: destinations, host tooling, feed, rewards and
            the admin control room are all in production. Every number above stays blank until we drop in
            live dashboard figures, so the deck never carries an unverified claim.
          </p>
        </Reveal>
      </>
    ),
  },
  {
    id: "market",
    title: "Market",
    content: (
      <>
        <Head kicker="Market" title="Inbound India is the wedge, domestic is the volume" />
        <div className="grid flex-1 grid-cols-3 gap-8">
          <Card icon={Globe2} title="Wedge: foreign travellers" body={<>High spend per trip, high trust requirement, low competition on human-led supply. <TBD label="TAM" /></>} />
          <Card icon={Users} title="Expand: Indian diaspora" body="Returning families and NRIs who want curated, verified local ground handling." delay={0.1} />
          <Card icon={TrendingUp} title="Scale: domestic explorers" body="Weekend trips and group departures monetised through the same host base." delay={0.2} />
        </div>
      </>
    ),
  },
  {
    id: "model",
    title: "Business model",
    content: (
      <>
        <Head kicker="Business model" title="Four revenue lines on one host network" />
        <div className="grid flex-1 grid-cols-2 gap-10">
          <Reveal>
            <div className="h-full rounded-3xl border border-border bg-card p-10 shadow-card">
              <h3 className="slide-subtitle mb-7">Traveller memberships (live)</h3>
              <div className="space-y-4 slide-body">
                {[["Free", "₹0"], ["Explorer", "₹499"], ["Adventurer", "₹999"], ["Nomad", "₹1,999"]].map(([n, p]) => (
                  <div key={n} className="flex items-center justify-between rounded-xl bg-secondary/70 px-7 py-4">
                    <span>{n}</span><span className="font-semibold text-primary">{p}</span>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
          <div className="space-y-6">
            <Bullets delay={0.15} items={[
              <>Commission on every booking — take rate <TBD label="take rate" /></>,
              <>Host subscriptions for premium placement and analytics.</>,
              <>Hotel and homestay partnership fees for verified distribution.</>,
              <>Brand and destination campaigns inside the story feed.</>,
            ]} />
          </div>
        </div>
      </>
    ),
  },
  {
    id: "gtm",
    title: "Go-to-market",
    content: (
      <>
        <Head kicker="Go-to-market" title="Influencers create demand, hotels create supply" />
        <div className="grid flex-1 grid-cols-3 gap-8">
          <Card icon={Megaphone} title="Travel influencer engine" body="Creators travel with hosts, publish to their audience and into our feed, and earn per booking through tracked referral codes." />
          <Card icon={Building2} title="Hotel & homestay partnerships" body="City-by-city onboarding of boutique hotels and homestays, verified and bundled with local hosts." delay={0.1} />
          <Card icon={Handshake} title="Inbound distribution" body="Foreign agents, hostels, visa and flight partners, and expat communities as referral channels." delay={0.2} />
        </div>
      </>
    ),
  },
  {
    id: "marketing",
    title: "Marketing plan",
    content: (
      <>
        <Head kicker="Marketing plan" title="One funnel, four owned channels" />
        <div className="grid flex-1 grid-cols-4 gap-6">
          {[
            ["Attract", ["Creator reels & YouTube trip films", "SEO on destination and experience pages", "Reddit, Facebook expat groups"]],
            ["Convert", ["Free trip plan from AI concierge", "Verified host badges and video reviews", "Transparent all-in pricing"]],
            ["Retain", ["Stamps, streaks, 12th trip free", "Membership perks", "Post-trip story prompts"]],
            ["Refer", ["Traveller referral codes", "Creator affiliate payouts", "Host-to-host invites"]],
          ].map(([t, list], i) => (
            <Reveal key={t as string} delay={i * 0.1}>
              <div className="h-full rounded-3xl border border-border bg-card p-8 shadow-card">
                <h3 className="slide-subtitle mb-6 text-primary">{t as string}</h3>
                <ul className="space-y-4 slide-body text-muted-foreground">
                  {(list as string[]).map((l) => <li key={l}>· {l}</li>)}
                </ul>
              </div>
            </Reveal>
          ))}
        </div>
        <Reveal delay={0.5}>
          <p className="slide-caption mt-10 text-muted-foreground">
            Full 90-day plan with budgets, owners and targets: roamyoo.com/marketing-plan
          </p>
        </Reveal>
      </>
    ),
  },
  {
    id: "moat",
    title: "Why we win",
    content: (
      <>
        <Head kicker="Defensibility" title="Why this is hard to copy" />
        <div className="grid flex-1 grid-cols-2 gap-16">
          <Bullets items={[
            <>Verified human supply: KYC plus video reviews, built over months, not scraped.</>,
            <>Whole-trip data per host — stay, food, transport, experiences in one graph.</>,
            <>Content flywheel: every trip returns a reel that sells the next one.</>,
            <>Operating layer already built: admin verification, moderation, CMS, audit.</>,
          ]} />
          <Reveal delay={0.3}>
            <div className="flex h-full flex-col justify-center gap-8 rounded-3xl border border-primary/25 bg-primary/10 p-12">
              <p className="slide-subtitle">OTAs sell rooms. Marketplaces sell tours.</p>
              <p className="slide-title text-primary">We sell the host.</p>
            </div>
          </Reveal>
        </div>
      </>
    ),
  },
  {
    id: "roadmap",
    title: "Roadmap",
    content: (
      <>
        <Head kicker="Roadmap" title="Next four quarters" />
        <div className="grid flex-1 grid-cols-4 gap-6">
          {[
            ["Now", ["Payments live (Razorpay/Stripe)", "Hotel partner onboarding", "Creator programme cohort 1"]],
            ["Q+1", ["Multi-city group departures", "Host mobile app", "Foreign-language support"]],
            ["Q+2", ["Agent & reseller portal", "Trip insurance and safety SOS", "Dynamic pricing"]],
            ["Q+3", ["Second inbound market", "Loyalty coalition", "API for partners"]],
          ].map(([t, list], i) => (
            <Reveal key={t as string} delay={i * 0.1}>
              <div className="h-full rounded-3xl border border-border bg-card p-8 shadow-card">
                <div className="mb-5 flex items-center gap-3 text-primary">
                  <CalendarClock className="!h-7 !w-7" /><span className="slide-body-lg font-semibold">{t as string}</span>
                </div>
                <ul className="space-y-4 slide-body text-muted-foreground">
                  {(list as string[]).map((l) => <li key={l}>· {l}</li>)}
                </ul>
              </div>
            </Reveal>
          ))}
        </div>
      </>
    ),
  },
  {
    id: "team",
    title: "Team",
    content: (
      <>
        <Head kicker="Team" title="Who is building RoamYoo" />
        <div className="grid flex-1 grid-cols-3 gap-8">
          {["Founder", "Product & engineering", "Growth & partnerships"].map((r, i) => (
            <Reveal key={r} delay={i * 0.1}>
              <div className="h-full rounded-3xl border border-border bg-card p-10 shadow-card">
                <div className="mb-6 h-24 w-24 rounded-full bg-secondary" />
                <h3 className="slide-subtitle">{r}</h3>
                <p className="slide-body mt-4 text-muted-foreground"><TBD label={`${r} name & bio`} /></p>
              </div>
            </Reveal>
          ))}
        </div>
      </>
    ),
  },
  {
    id: "ask",
    title: "The ask",
    content: (
      <>
        <Head kicker="The ask" title="Raising to turn a working MVP into a market" />
        <div className="grid flex-1 grid-cols-2 gap-16">
          <Reveal>
            <div className="flex h-full flex-col justify-center gap-8 rounded-3xl border border-border bg-secondary/60 p-12">
              <p className="slide-caption text-muted-foreground">Round size</p>
              <p className="slide-subtitle"><TBD label="round size" /></p>
              <p className="slide-caption text-muted-foreground">Runway</p>
              <p className="slide-subtitle"><TBD label="runway months" /></p>
            </div>
          </Reveal>
          <Bullets delay={0.2} items={[
            <>Creator marketing engine and paid acquisition in inbound source markets.</>,
            <>Host and hotel onboarding teams in the first five destination clusters.</>,
            <>Payments, trust and safety, and mobile apps.</>,
            <>18 months of runway to <TBD label="target metric" />.</>,
          ]} />
        </div>
      </>
    ),
  },
  {
    id: "close",
    title: "Thank you",
    content: (
      <div className="flex h-full flex-col justify-center">
        <motion.div
          className="absolute -left-52 bottom-0 h-[640px] w-[640px] rounded-full bg-accent/15 blur-3xl"
          animate={{ scale: [1, 1.15, 1] }}
          transition={{ duration: 10, repeat: Infinity }}
        />
        <Reveal><Kicker>Let&apos;s talk</Kicker></Reveal>
        <Reveal delay={0.1}><h2 className="slide-title-lg mt-6">India, hosted by people who live there.</h2></Reveal>
        <Reveal delay={0.24}>
          <p className="slide-body-lg mt-10 text-muted-foreground">
            <TBD label="founder email & phone" />
          </p>
        </Reveal>
      </div>
    ),
  },
];

const InvestorDeck = () => {
  const [params, setParams] = useSearchParams();
  const printMode = params.has("print");
  const index = Math.min(Math.max(Number(params.get("slide") ?? 1) - 1, 0), slides.length - 1);
  const slide = slides[index];

  const go = useCallback(
    (next: number) => {
      const clamped = Math.min(Math.max(next, 0), slides.length - 1);
      const p = new URLSearchParams(params);
      p.set("slide", String(clamped + 1));
      setParams(p, { replace: true });
    },
    [params, setParams],
  );

  useEffect(() => {
    document.title = `${index + 1}/${slides.length} — ${slide.title} · RoamYoo investor deck`;
  }, [index, slide.title]);

  useEffect(() => {
    if (printMode) return;
    const onKey = (e: KeyboardEvent) => {
      if (["ArrowRight", "ArrowDown", " ", "PageDown"].includes(e.key)) { e.preventDefault(); go(index + 1); }
      if (["ArrowLeft", "ArrowUp", "PageUp"].includes(e.key)) { e.preventDefault(); go(index - 1); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go, index, printMode]);

  const meta = useMemo(
    () => ({
      title: "RoamYoo investor deck — India, hosted by locals",
      description:
        "RoamYoo investor overview: MVP product capabilities, business model, influencer-led marketing plan and hotel partnership strategy for inbound India travel.",
    }),
    [],
  );

  if (printMode) {
    return (
      <div className="deck-print bg-background">
        {slides.map((s) => (
          <SlideFrame key={s.id} scaleToFit={false} className="!h-[1080px] !w-[1920px]">
            {s.content}
          </SlideFrame>
        ))}
      </div>
    );
  }

  return (
    <main className="fixed inset-0 flex flex-col bg-secondary/40">
      <Helmet>
        <title>{meta.title}</title>
        <meta name="description" content={meta.description} />
        <meta name="robots" content="noindex" />
      </Helmet>

      <header className="flex items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <h1 className="text-sm font-semibold tracking-tight sm:text-base">RoamYoo · Investor deck</h1>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => document.documentElement.requestFullscreen?.()}>
            <Play /> Present
          </Button>
          <Button variant="outline" size="sm" asChild>
            <a href="/investor-deck?print" target="_blank" rel="noreferrer"><Printer /> PDF</a>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <a href="/marketing-plan"><Target /> Marketing plan</a>
          </Button>
        </div>
      </header>

      <div className="relative min-h-0 flex-1 px-2 pb-2 sm:px-6 sm:pb-4">
        <div className="h-full w-full overflow-hidden rounded-2xl border border-border bg-background shadow-elevated">
          <motion.div key={slide.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }} className="h-full w-full">
            <SlideFrame>{slide.content}</SlideFrame>
          </motion.div>
        </div>
      </div>

      <nav className="flex items-center justify-between gap-4 px-4 pb-4 sm:px-6" aria-label="Slide navigation">
        <Button variant="outline" size="sm" onClick={() => go(index - 1)} disabled={index === 0}>
          <ChevronLeft /> Back
        </Button>
        <div className="flex flex-wrap items-center justify-center gap-1.5">
          {slides.map((s, i) => (
            <button
              key={s.id}
              onClick={() => go(i)}
              aria-label={`Go to ${s.title}`}
              aria-current={i === index}
              className={cn("h-2.5 rounded-full transition-all", i === index ? "w-8 bg-primary" : "w-2.5 bg-border hover:bg-primary/40")}
            />
          ))}
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-muted-foreground">{index + 1} / {slides.length}</span>
          <Button size="sm" onClick={() => go(index + 1)} disabled={index === slides.length - 1}>
            Next <ChevronRight />
          </Button>
        </div>
      </nav>
    </main>
  );
};

export default InvestorDeck;