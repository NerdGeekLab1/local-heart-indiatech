import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import {
  Megaphone, Building2, Globe2, Users, Search, Video, Gift, Handshake,
  CalendarClock, Target, BarChart3, Presentation,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";

const Section = ({
  id, kicker, title, children,
}: { id: string; kicker: string; title: string; children: React.ReactNode }) => (
  <section id={id} className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:px-8">
    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">{kicker}</p>
    <h2 className="mt-2 text-2xl font-bold sm:text-3xl">{title}</h2>
    <div className="mt-8">{children}</div>
  </section>
);

const Tile = ({
  icon: Icon, title, points,
}: { icon: React.ElementType; title: string; points: string[] }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-80px" }}
    transition={{ duration: 0.45 }}
    className="rounded-2xl border border-border bg-card p-6 shadow-card"
  >
    <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
      <Icon className="h-5 w-5" />
    </div>
    <h3 className="font-semibold">{title}</h3>
    <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
      {points.map((p) => <li key={p}>· {p}</li>)}
    </ul>
  </motion.div>
);

const phases = [
  {
    phase: "Days 1–30 · Foundations",
    items: [
      "Sign 10 travel creators (mix of 50k–500k followers) on a per-booking referral deal.",
      "Onboard the first 25 boutique hotels and homestays in Jaipur, Udaipur, Rishikesh, Goa, Kochi.",
      "Publish 20 destination and experience pages targeted at English-language inbound search.",
      "Set up tracking: referral codes, UTM discipline, one weekly acquisition review.",
    ],
  },
  {
    phase: "Days 31–60 · Demand",
    items: [
      "Ship 3 creator trip films plus 30 short reels into the in-app feed and creator channels.",
      "Start paid retargeting on visitors of destination pages in top inbound source markets.",
      "Launch expat and backpacker community seeding: Reddit, Facebook groups, hostel partnerships.",
      "Turn on the AI trip plan as the lead magnet with email capture and follow-up.",
    ],
  },
  {
    phase: "Days 61–90 · Compounding",
    items: [
      "Creator affiliate leaderboard with tiered payouts for booked trips.",
      "Hotel co-marketing: bundled host experiences promoted to their existing guests.",
      "Referral loop live for travellers, stamps and streak rewards promoted post-trip.",
      "Double down on the two channels with the lowest cost per booking; cut the rest.",
    ],
  },
];

const MarketingPlan = () => (
  <div className="min-h-screen bg-background">
    <Helmet>
      <title>RoamYoo marketing plan — inbound traveller acquisition</title>
      <meta
        name="description"
        content="RoamYoo's 90-day marketing plan: travel influencer partnerships, hotel onboarding, SEO, community seeding and referral loops to acquire foreign travellers."
      />
    </Helmet>
    <Navbar />

    <header className="relative overflow-hidden border-b border-border">
      <motion.div
        className="absolute -right-32 -top-32 h-[420px] w-[420px] rounded-full bg-primary/15 blur-3xl"
        animate={{ scale: [1, 1.15, 1] }}
        transition={{ duration: 9, repeat: Infinity }}
      />
      <div className="mx-auto max-w-6xl px-4 pb-14 pt-28 sm:px-6 lg:px-8">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Growth plan</p>
        <h1 className="mt-3 max-w-3xl text-3xl font-bold leading-tight sm:text-5xl">
          Acquiring foreign travellers, one verified host at a time
        </h1>
        <p className="mt-5 max-w-2xl text-muted-foreground">
          Creators build the demand, hotels and homestays build the supply, and rewards keep both coming
          back. This is the plan we execute alongside the MVP.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Button asChild><a href="/investor-deck"><Presentation className="h-4 w-4" /> View investor deck</a></Button>
          <Button variant="outline" asChild><a href="#phases"><CalendarClock className="h-4 w-4" /> 90-day plan</a></Button>
        </div>
      </div>
    </header>

    <Section id="audience" kicker="Who we go after" title="Three audiences, in priority order">
      <div className="grid gap-5 sm:grid-cols-3">
        <Tile icon={Globe2} title="Foreign travellers" points={["Solo and couple travellers, 25–45", "Culture, food and slow travel intent", "English-language search and creator content"]} />
        <Tile icon={Users} title="Indian diaspora & NRIs" points={["Returning families needing ground handling", "Higher trip value, repeat seasonality", "Reached via diaspora communities"]} />
        <Tile icon={Target} title="Domestic explorers" points={["Weekend and group departures", "Fills host capacity off-season", "Referral-heavy, low acquisition cost"]} />
      </div>
    </Section>

    <Section id="channels" kicker="Channels" title="Where growth actually comes from">
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <Tile icon={Megaphone} title="Travel influencer engine" points={["Creators travel with real hosts", "Content published on their channels and our feed", "Paid per booked trip via referral codes", "Monthly creator cohorts, leaderboard payouts"]} />
        <Tile icon={Building2} title="Hotel & homestay partnerships" points={["City-cluster onboarding with a verification pack", "Bundled host experiences for their guests", "Co-marketing to their existing bookings", "Dedicated partner dashboard and support"]} />
        <Tile icon={Search} title="Search & content" points={["Destination, experience and host pages", "Guides answering real inbound questions", "Structured data for rich results", "Blog and traveller story indexing"]} />
        <Tile icon={Video} title="Social & community" points={["Short-form reels from every trip", "Reddit, Facebook expat and backpacker groups", "Hostel and cafe partnerships on the ground"]} />
        <Tile icon={Gift} title="Rewards & referrals" points={["Stamps, streaks and the 12th trip free", "Traveller referral codes with tracked history", "Membership perks driving repeat trips"]} />
        <Tile icon={Handshake} title="Inbound partners" points={["Foreign travel agents and tour resellers", "Visa, flight and insurance partners", "University and volunteer programmes"]} />
      </div>
    </Section>

    <Section id="phases" kicker="Execution" title="The first 90 days">
      <div className="space-y-5">
        {phases.map((p, i) => (
          <motion.div
            key={p.phase}
            initial={{ opacity: 0, x: -16 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.45, delay: i * 0.05 }}
            className="rounded-2xl border border-border bg-card p-6 shadow-card"
          >
            <h3 className="font-semibold text-primary">{p.phase}</h3>
            <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
              {p.items.map((it) => <li key={it}>· {it}</li>)}
            </ul>
          </motion.div>
        ))}
      </div>
    </Section>

    <Section id="metrics" kicker="Measurement" title="What we hold ourselves to">
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {["Cost per booked trip", "Creator-attributed bookings", "Host activation rate", "Repeat trip rate"].map((m) => (
          <div key={m} className="rounded-2xl border border-border bg-secondary/60 p-6">
            <BarChart3 className="h-5 w-5 text-primary" />
            <p className="mt-3 font-semibold">{m}</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Target set from the first 30 days of live data — no assumed figures.
            </p>
          </div>
        ))}
      </div>
    </Section>

    <Footer />
  </div>
);

export default MarketingPlan;
