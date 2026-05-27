import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Sparkles, Flag, ListChecks, Mail, ShieldCheck, ScrollText, Stamp,
  ChevronRight, Crown, Users, Compass, BookOpen, Bot, MessageCircle,
  Bell, CreditCard, Camera, Trophy, Map, Globe, FileText
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

/**
 * Features Hub — single landing page that documents every newly shipped
 * capability, links to it, and shows the parent → child URL tree across
 * Admin → Host → Traveler roles.
 */

type Feature = {
  icon: typeof Sparkles;
  title: string;
  purpose: string;
  utility: string;
  primaryRoute: string;
  related: { label: string; to: string }[];
  audience: ("admin" | "host" | "traveler" | "public")[];
};

const NEW_FEATURES: Feature[] = [
  {
    icon: Mail,
    title: "Beta Waitlist",
    purpose: "Collect & qualify early-access signups before public launch.",
    utility: "Plan-tier capture, double opt-in via email confirmation, admin review queue.",
    primaryRoute: "/beta-waitlist",
    related: [
      { label: "Confirmation page", to: "/beta-waitlist/confirm" },
      { label: "Admin: Waitlist Manager", to: "/admin/waitlist" },
    ],
    audience: ["public", "admin"],
  },
  {
    icon: Flag,
    title: "Feature Flags",
    purpose: "Gate beta-only experiences globally or per user.",
    utility: "Roll out AI Concierge, advanced moderation, and experiments safely.",
    primaryRoute: "/admin/feature-flags",
    related: [{ label: "Audit Log", to: "/admin/audit-log" }],
    audience: ["admin"],
  },
  {
    icon: ListChecks,
    title: "Onboarding Checklist",
    purpose: "Guided setup steps per role mapped to the roadmap.",
    utility: "Persists across sessions in the database; floats on every page.",
    primaryRoute: "/dashboard/traveler",
    related: [
      { label: "Host onboarding", to: "/dashboard/host" },
      { label: "Admin onboarding", to: "/dashboard/admin" },
    ],
    audience: ["traveler", "host", "admin"],
  },
  {
    icon: ShieldCheck,
    title: "Beta Moderation Tools",
    purpose: "Fast-track approvals and shadow-hide listings.",
    utility: "Flag-gated tools embedded in Host & Admin dashboards.",
    primaryRoute: "/dashboard/admin",
    related: [{ label: "Host moderation surface", to: "/dashboard/host" }],
    audience: ["admin", "host"],
  },
  {
    icon: ScrollText,
    title: "Admin Audit Log",
    purpose: "Track who changed flags or confirmed waitlist users and when.",
    utility: "Filterable timeline with metadata for compliance & debugging.",
    primaryRoute: "/admin/audit-log",
    related: [],
    audience: ["admin"],
  },
  {
    icon: Stamp,
    title: "Traveler Stamp Collection",
    purpose: "Gamified badges for cities, activities, terrain & seasons.",
    utility: "27 tiered stamps (Bronze → Legend) displayed on traveler dashboard.",
    primaryRoute: "/dashboard/traveler?tab=stamps",
    related: [{ label: "Rewards", to: "/rewards" }, { label: "Leaderboard", to: "/leaderboard" }],
    audience: ["traveler"],
  },
  {
    icon: Crown,
    title: "Host Eligibility",
    purpose: "Checklist for hosts who want to welcome foreign travelers.",
    utility: "Public footer entry, used as an onboarding gate.",
    primaryRoute: "/host-eligibility",
    related: [{ label: "Become a Host", to: "/become-host" }],
    audience: ["public", "host"],
  },
  {
    icon: Bot,
    title: "AI Travel Recommender",
    purpose: "Prompt-driven personalized destination suggestions for India.",
    utility: "Multi-turn refinement (budget, days, vibe, season) via Lovable AI Gateway + Gemini.",
    primaryRoute: "/dashboard/traveler",
    related: [{ label: "Explore", to: "/explore" }, { label: "Destinations", to: "/destinations" }],
    audience: ["traveler", "public"],
  },
  {
    icon: MessageCircle,
    title: "AI Travel Guide (Chat)",
    purpose: "Conversational travel companion with streaming answers.",
    utility: "Floating FAB on every page; remembers conversation context per session.",
    primaryRoute: "/",
    related: [],
    audience: ["traveler", "public"],
  },
  {
    icon: Bell,
    title: "Role-based Notifications",
    purpose: "Targeted alerts for travelers, hosts and admins.",
    utility: "Driven by triggers (bookings, approvals, grievances) with read state.",
    primaryRoute: "/dashboard/traveler",
    related: [],
    audience: ["traveler", "host", "admin"],
  },
  {
    icon: CreditCard,
    title: "Subscriptions & Membership",
    purpose: "Tiered plans: Free, Explorer, Adventurer, Nomad.",
    utility: "Unlocks priority booking, discounts, concierge & 12th-trip free benefit.",
    primaryRoute: "/membership",
    related: [{ label: "Plans (admin)", to: "/dashboard/admin?tab=plans" }],
    audience: ["traveler", "admin"],
  },
  {
    icon: Trophy,
    title: "Beta Wanderer Program",
    purpose: "Creator loyalty with missions, leaderboard and badges.",
    utility: "Admin-assigned missions reward points; public leaderboard ranks wanderers.",
    primaryRoute: "/beta-wanderers",
    related: [
      { label: "Apply", to: "/beta-wanderer-apply" },
      { label: "Leaderboard", to: "/leaderboard" },
    ],
    audience: ["traveler", "admin"],
  },
  {
    icon: Map,
    title: "Traveler-led Trips",
    purpose: "Group trips with fixed or split pricing.",
    utility: "Participant tracking, inclusions, real-time status.",
    primaryRoute: "/trips",
    related: [{ label: "Host a Trip", to: "/host-trip" }],
    audience: ["traveler", "host"],
  },
  {
    icon: Camera,
    title: "Video Reviews",
    purpose: "Mandatory video reviews build trust and content library.",
    utility: "In-browser camera recorder; surfaces in destination & host pages.",
    primaryRoute: "/dashboard/traveler?tab=reviews",
    related: [],
    audience: ["traveler"],
  },
  {
    icon: FileText,
    title: "Invoices & Tax (GST 18%)",
    purpose: "Auto-generated invoices for every booking.",
    utility: "Host & traveler visibility; tracked in admin GMV analytics.",
    primaryRoute: "/dashboard/traveler",
    related: [{ label: "Host invoices", to: "/dashboard/host" }],
    audience: ["traveler", "host", "admin"],
  },
];

const ROUTE_TREE: { label: string; to: string; children?: { label: string; to: string }[] }[] = [
  { label: "Home", to: "/", children: [
    { label: "Explore Hosts", to: "/explore" },
    { label: "Experiences", to: "/experiences" },
    { label: "Destinations", to: "/destinations" },
  ]},
  { label: "Trips", to: "/trips", children: [
    { label: "Trip Detail", to: "/trip/:id" },
    { label: "Trip Leader", to: "/trip-leader/:id" },
    { label: "Host a Trip", to: "/host-trip" },
  ]},
  { label: "Host", to: "/become-host", children: [
    { label: "Host Profile", to: "/host/:id" },
    { label: "Host Eligibility", to: "/host-eligibility" },
    { label: "Booking", to: "/book/:id" },
    { label: "Host Dashboard", to: "/dashboard/host" },
  ]},
  { label: "Community", to: "/community", children: [
    { label: "Blog Detail", to: "/blog/:id" },
    { label: "Resources", to: "/resources" },
    { label: "Resource Guide", to: "/resource/:slug" },
  ]},
  { label: "Beta", to: "/beta-waitlist", children: [
    { label: "Confirm Email", to: "/beta-waitlist/confirm" },
    { label: "Beta Wanderers", to: "/beta-wanderers" },
    { label: "Apply as Wanderer", to: "/beta-wanderer-apply" },
    { label: "Wanderer Profile", to: "/beta-wanderer/:id" },
  ]},
  { label: "Rewards", to: "/rewards", children: [
    { label: "Membership", to: "/membership" },
    { label: "Referrals", to: "/referrals" },
    { label: "Leaderboard", to: "/leaderboard" },
  ]},
  { label: "Traveler Dashboard", to: "/dashboard/traveler", children: [
    { label: "Stamp Collection", to: "/dashboard/traveler?tab=stamps" },
    { label: "Grievances", to: "/grievances" },
  ]},
  { label: "Admin", to: "/dashboard/admin", children: [
    { label: "Feature Flags", to: "/admin/feature-flags" },
    { label: "Waitlist Manager", to: "/admin/waitlist" },
    { label: "Audit Log", to: "/admin/audit-log" },
  ]},
  { label: "Support", to: "/help", children: [
    { label: "Safety", to: "/safety" },
    { label: "Terms", to: "/terms" },
    { label: "Docs", to: "/docs" },
  ]},
];

const audienceColor: Record<string, string> = {
  admin: "bg-fuchsia-500/10 text-fuchsia-500 border-fuchsia-500/30",
  host: "bg-amber-500/10 text-amber-600 border-amber-500/30",
  traveler: "bg-emerald-500/10 text-emerald-600 border-emerald-500/30",
  public: "bg-sky-500/10 text-sky-600 border-sky-500/30",
};

export default function FeaturesHub() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 space-y-12">
        <motion.header
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-3xl mx-auto"
        >
          <Badge variant="outline" className="mb-4 gap-1.5">
            <Sparkles className="w-3.5 h-3.5" /> What's new
          </Badge>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">
            Features Hub
          </h1>
          <p className="mt-3 text-muted-foreground">
            Navigate every recently shipped capability, understand its purpose,
            and see how each role — Admin, Host, Traveler — flows into it.
          </p>
        </motion.header>

        {/* New Features grid */}
        <section>
          <h2 className="text-2xl font-semibold mb-5 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" /> New & beta features
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {NEW_FEATURES.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
              >
                <Card className="p-5 h-full flex flex-col gap-3 hover:border-primary/40 transition-colors">
                  <div className="flex items-start justify-between gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary grid place-items-center">
                      <f.icon className="w-5 h-5" />
                    </div>
                    <div className="flex flex-wrap gap-1 justify-end">
                      {f.audience.map(a => (
                        <span key={a} className={`text-[10px] px-1.5 py-0.5 rounded border ${audienceColor[a]}`}>
                          {a}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">{f.title}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{f.purpose}</p>
                  </div>
                  <p className="text-xs text-muted-foreground/80 leading-relaxed">{f.utility}</p>

                  <div className="mt-auto pt-3 border-t border-border space-y-1.5">
                    <Link
                      to={f.primaryRoute}
                      className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
                    >
                      Open <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                    {f.related.length > 0 && (
                      <div className="flex flex-wrap gap-x-3 gap-y-1">
                        {f.related.map(r => (
                          <Link key={r.to} to={r.to} className="text-xs text-muted-foreground hover:text-foreground">
                            · {r.label}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Relational flow */}
        <section>
          <h2 className="text-2xl font-semibold mb-5 flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" /> Relational flow — Admin → Host → Traveler
          </h2>
          <Card className="p-6">
            <div className="grid md:grid-cols-3 gap-6 text-sm">
              <div>
                <h3 className="font-semibold mb-2 text-fuchsia-500">Admin</h3>
                <ol className="space-y-1.5 list-decimal pl-4 text-muted-foreground">
                  <li>Toggles feature flags → unlocks beta UI for selected users.</li>
                  <li>Approves host applications & moderates listings.</li>
                  <li>Confirms beta waitlist → upgrades user tier.</li>
                  <li>All actions recorded in audit log.</li>
                </ol>
              </div>
              <div>
                <h3 className="font-semibold mb-2 text-amber-600">Host</h3>
                <ol className="space-y-1.5 list-decimal pl-4 text-muted-foreground">
                  <li>Completes onboarding checklist & eligibility.</li>
                  <li>Publishes experiences, trips, weddings, transport.</li>
                  <li>Receives moderation flags from admin.</li>
                  <li>Manages bookings & invoices for travelers.</li>
                </ol>
              </div>
              <div>
                <h3 className="font-semibold mb-2 text-emerald-600">Traveler</h3>
                <ol className="space-y-1.5 list-decimal pl-4 text-muted-foreground">
                  <li>Joins waitlist or signs up; completes onboarding.</li>
                  <li>Discovers hosts, books experiences/trips.</li>
                  <li>Earns stamps, streaks & loyalty rewards.</li>
                  <li>Files grievances if needed → admin mediates.</li>
                </ol>
              </div>
            </div>
          </Card>
        </section>

        {/* Route tree */}
        <section>
          <h2 className="text-2xl font-semibold mb-5 flex items-center gap-2">
            <Compass className="w-5 h-5 text-primary" /> Route hierarchy (parent → child)
          </h2>
          <Card className="p-6">
            <ul className="space-y-4">
              {ROUTE_TREE.map(node => (
                <li key={node.to}>
                  <Link to={node.to} className="font-semibold text-foreground hover:text-primary">
                    {node.label} <span className="text-xs text-muted-foreground font-mono">{node.to}</span>
                  </Link>
                  {node.children && (
                    <ul className="mt-2 ml-5 border-l border-border pl-4 space-y-1">
                      {node.children.map(c => (
                        <li key={c.to} className="text-sm">
                          {c.to.includes(":") ? (
                            <span className="text-muted-foreground">
                              {c.label} <span className="font-mono text-xs">{c.to}</span>
                            </span>
                          ) : (
                            <Link to={c.to} className="text-muted-foreground hover:text-foreground">
                              {c.label} <span className="font-mono text-xs opacity-70">{c.to}</span>
                            </Link>
                          )}
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              ))}
            </ul>
          </Card>
        </section>

        <section className="text-center pb-6">
          <Link
            to="/docs"
            className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
          >
            <BookOpen className="w-4 h-4" /> Read the full in-app documentation
          </Link>
        </section>
      </main>

      <Footer />
    </div>
  );
}
