import { Link, useLocation } from "react-router-dom";
import { ChevronRight, Home } from "lucide-react";
import { useMemo } from "react";

const LABELS: Record<string, string> = {
  dashboard: "Dashboard",
  admin: "Admin",
  host: "Host",
  "host-dashboard": "Host Dashboard",
  "traveler-dashboard": "Traveler Dashboard",
  "admin-dashboard": "Admin Dashboard",
  traveler: "Traveler",
  trip: "Trip",
  "trip-leader": "Trip Leader",
  trips: "Trips",
  destination: "Destination",
  destinations: "Destinations",
  experience: "Experience",
  experiences: "Experiences",
  feed: "Feed",
  rewards: "Rewards",
  leaderboard: "Leaderboard",
  membership: "Membership",
  "beta-wanderers": "Beta Wanderers",
  "beta-waitlist": "Beta Waitlist",
  "beta-wanderer": "Beta Wanderer",
  "beta-wanderer-apply": "Apply",
  confirm: "Confirm",
  apply: "Apply",
  help: "Help Centre",
  docs: "Docs",
  safety: "Safety",
  terms: "Terms",
  resources: "Resources",
  referrals: "Referrals",
  features: "Features",
  community: "Community",
  explore: "Explore",
  booking: "Booking",
  "become-host": "Become a Host",
  "host-eligibility": "Host Application",
  grievances: "Grievances",
  "audit-log": "Audit Log",
  "feature-flags": "Feature Flags",
  waitlist: "Waitlist",
  signup: "Sign Up",
  "admin-login": "Admin Login",
  blog: "Blog",
  "bike-tours": "Bike Tours",
};

const humanize = (seg: string) => LABELS[seg] || seg.replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase());

// Paths that exist only as URL prefixes (no route of their own) get remapped or de-linked
const PATH_ALIASES: Record<string, string> = {
  "/admin": "/dashboard/admin",
  "/dashboard/admin": "/dashboard/admin",
  "/trip": "/trips",
  "/experience": "/experiences",
  "/destination": "/destinations",
  "/resource": "/resources",
  "/beta-wanderer": "/beta-wanderers",
  "/blog": "/community",
  "/trip-leader": "/trips",
  "/beta-waitlist": "/beta-waitlist",
};

const NON_NAVIGABLE = new Set(["/dashboard", "/host", "/book", "/traveler", "/auth"]);

const resolveHref = (href: string): string | undefined => {
  if (NON_NAVIGABLE.has(href)) return undefined;
  return PATH_ALIASES[href] ?? href;
};

interface Crumb { label: string; href?: string }

interface BreadcrumbsProps {
  items?: Crumb[];
  className?: string;
}

const Breadcrumbs = ({ items, className }: BreadcrumbsProps) => {
  const location = useLocation();
  const auto = useMemo<Crumb[]>(() => {
    const segs = location.pathname.split("/").filter(Boolean);
    return segs.map((s, i) => {
      const rawHref = "/" + segs.slice(0, i + 1).join("/");
      // Truncate long IDs/UUIDs
      const isUuid = /^[0-9a-f]{8}-/i.test(s);
      const label = isUuid ? s.slice(0, 8) + "…" : humanize(s);
      const isLast = i === segs.length - 1;
      return { label, href: isLast ? undefined : resolveHref(rawHref) };
    });
  }, [location.pathname]);

  const crumbs = items ?? auto;
  if (crumbs.length === 0) return null;


  return (
    <nav aria-label="Breadcrumb" className={`text-xs text-muted-foreground ${className ?? ""}`}>
      <ol className="flex items-center flex-wrap gap-1">
        <li className="flex items-center gap-1">
          <Link to="/" className="hover:text-primary flex items-center gap-1"><Home className="w-3 h-3" /> Home</Link>
        </li>
        {crumbs.map((c, i) => (
          <li key={i} className="flex items-center gap-1">
            <ChevronRight className="w-3 h-3 opacity-50" />
            {c.href ? (
              <Link to={c.href} className="hover:text-primary">{c.label}</Link>
            ) : (
              <span className="text-foreground font-medium" aria-current="page">{c.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
};

export default Breadcrumbs;
