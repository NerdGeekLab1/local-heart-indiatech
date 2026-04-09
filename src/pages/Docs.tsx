import { useState } from "react";
import { motion } from "framer-motion";
import {
  BookOpen, Code, Database, Users, Shield, Globe, Zap, Layers, ChevronRight,
  Server, Key, FileText, GitBranch, Terminal, Cpu, Clock, Activity
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const sections = [
  {
    id: "overview", icon: Globe, title: "Project Overview",
    content: `**Travelista** is a social travel marketplace connecting international travelers with verified local hosts across India.

**Vision**: Book a person, not just a place. Hosts offer guided tours, homestays, transport, food, and cultural immersion.

**User Roles**:
- **Traveler** — Discover, book, and review authentic Indian experiences
- **Host** — Offer services, manage listings, earn revenue
- **Admin** — Platform oversight, approvals, analytics, grievance mediation

**Live URL**: \`${window.location.origin}\`
**Project ID**: \`036bddb0-0514-4547-af40-cccfd3c2162d\``
  },
  {
    id: "architecture", icon: Layers, title: "Architecture",
    content: `**Frontend**: React 18 + TypeScript 5 + Vite 5 + Tailwind CSS v3
**UI Library**: shadcn/ui (Radix primitives + Tailwind)
**Animations**: Framer Motion
**Routing**: React Router v6
**State**: TanStack Query + Lovable Cloud
**Backend**: Lovable Cloud — PostgreSQL, Auth, Edge Functions, Storage
**AI**: Lovable AI Gateway (Gemini Flash)
**Icons**: Lucide React

**Directory Structure**:
\`\`\`
src/
├── components/          # Reusable UI
│   ├── ui/              # shadcn primitives
│   ├── Navbar.tsx       # Global nav + profile dropdown
│   ├── Footer.tsx       # Global footer
│   ├── HostCard.tsx     # Host display card
│   ├── ExperienceCard.tsx
│   ├── AIRecommendWidget.tsx   # AI auto-suggest
│   ├── AIChatRecommender.tsx   # AI chat FAB
│   ├── NotificationPanel.tsx   # Role-based notifications
│   ├── MobileBottomNav.tsx     # Mobile sticky nav
│   └── VideoRecorder.tsx       # Video review capture
├── pages/
│   ├── Index.tsx               # Homepage
│   ├── Explore.tsx             # Host discovery + filters
│   ├── Experiences.tsx         # Experience marketplace
│   ├── Trips.tsx               # Trip listings
│   ├── Destinations.tsx        # City guides
│   ├── Community.tsx           # Stories + blog
│   ├── Booking.tsx             # Booking flow
│   ├── Signup.tsx              # Auth pages
│   ├── BlogDetail.tsx          # Full article view
│   └── dashboard/
│       ├── TravelerDashboard.tsx  # Bookings, rewards, streaks
│       ├── HostDashboard.tsx      # Listings, invoices, earnings
│       └── AdminDashboard.tsx     # Full platform management
├── contexts/
│   ├── AuthContext.tsx         # Auth state + role detection
│   └── CurrencyContext.tsx     # Multi-currency formatting
├── integrations/supabase/
│   ├── client.ts              # Auto-generated client
│   └── types.ts               # Auto-generated types
├── hooks/                     # Custom hooks
├── lib/
│   ├── data.ts                # Mock data + interfaces
│   └── utils.ts               # Utility functions
└── index.css                  # Design tokens + theme
\`\`\`

**Edge Functions**:
\`\`\`
supabase/functions/
├── ai-recommend/index.ts       # AI destination recommendations
└── create-demo-accounts/index.ts # Demo account seeder
\`\`\``
  },
  {
    id: "database", icon: Database, title: "Database Schema",
    content: `**13 Tables** with Row-Level Security (RLS) on all:

| Table | Purpose | Key Fields |
|-------|---------|------------|
| \`profiles\` | User profiles linked to auth | first_name, email, interests, travel_styles |
| \`user_roles\` | Role management (enum: admin/host/traveler) | user_id, role |
| \`user_permissions\` | Granular ACL per user | permission, granted_by, expires_at |
| \`experiences\` | Experience listings | title, category, price, host_id, rating |
| \`experience_requests\` | Host-submitted experience proposals | status (pending/approved/rejected) |
| \`bookings\` | Booking records | traveler_id, host_id, status, total_price |
| \`invoices\` | Payment invoices | invoice_number, amount, tax_amount, status |
| \`reviews\` | Ratings + video testimonials | rating, text, video_url, has_video |
| \`messages\` | User-to-user messaging | sender_id, receiver_id, content, read |
| \`grievances\` | Dispute management | subject, category, priority, resolution |
| \`trip_listings\` | Trip packages | destination, price_model, inclusions |
| \`travel_streaks\` | Monthly gamified streak tracking | month, completed, booking_id |
| \`beta_wanderers\` | Beta wanderer program members | score, badge, missions_completed |
| \`wanderer_missions\` | Admin-assigned missions | destination, reward_points, deadline |

**Database Functions**:
- \`handle_new_user()\` — Trigger: auto-creates profile + assigns 'traveler' role on signup
- \`has_role(uuid, app_role)\` — Security definer: checks user role without RLS recursion

**RLS Pattern**: All tables enforce user-specific access. Admins use \`has_role()\` for elevated access.`
  },
  {
    id: "api", icon: Code, title: "API & Routes",
    content: `**Frontend Routes (30+)**:

| Route | Page | Auth |
|-------|------|------|
| \`/\` | Homepage | Public |
| \`/explore\` | Host discovery | Public |
| \`/experiences\` | Experience marketplace | Public |
| \`/experience/:id\` | Experience detail | Public |
| \`/host/:id\` | Host profile | Public |
| \`/book/:id\` | Booking flow | Required |
| \`/destinations\` | City listing | Public |
| \`/destination/:name\` | City detail | Public |
| \`/community\` | Stories + blog | Public |
| \`/blog/:id\` | Full article | Public |
| \`/trips\` | Trip listings | Public |
| \`/trip/:id\` | Trip detail | Public |
| \`/signup\` | Registration | Public |
| \`/become-host\` | Host application | Public |
| \`/dashboard/traveler\` | Traveler panel | Required |
| \`/dashboard/host\` | Host panel | Required |
| \`/dashboard/admin\` | Admin panel | Admin |
| \`/rewards\` | Gamified rewards hub | Required |
| \`/leaderboard\` | Beta wanderer rankings | Public |
| \`/beta-wanderers\` | Wanderer directory | Public |
| \`/grievances\` | File a grievance | Required |
| \`/help\` | Help center | Public |
| \`/safety\` | Safety info | Public |
| \`/terms\` | Terms & policies | Public |
| \`/docs\` | This documentation | Public |

**Edge Function Endpoints**:

| Function | Method | Purpose |
|----------|--------|---------|
| \`ai-recommend\` | POST | AI destination recommendations (chat + suggest modes) |
| \`create-demo-accounts\` | POST | Seed demo traveler/host/admin accounts |

**AI Recommend Request**:
\`\`\`json
{
  "mode": "suggest" | "chat",
  "messages": [{"role": "user", "content": "..."}],
  "preferences": {"interests": [], "travelStyles": []}
}
\`\`\`
- \`suggest\` mode returns structured JSON with recommendations
- \`chat\` mode streams SSE tokens for conversational UI`
  },
  {
    id: "auth", icon: Users, title: "Authentication & Roles",
    content: `**Auth Provider**: Lovable Cloud (email/password + Google OAuth)

**Role System**:
- Roles stored in \`user_roles\` table (NOT on profiles)
- Security definer function \`has_role()\` prevents RLS recursion
- Three roles: \`admin\`, \`host\`, \`traveler\`
- Default role assigned on signup via \`handle_new_user()\` trigger

**Granular ACL**:
- \`user_permissions\` table for feature-specific access
- Permissions: publish_trips, book_experiences, write_reviews, send_messages, access_premium, beta_features, host_events, manage_listings, view_analytics, export_data
- Admin can grant/revoke per user with optional expiry

**Demo Accounts** (for testing):
| Email | Password | Role |
|-------|----------|------|
| \`demo.traveler@travelista.app\` | \`demo123456\` | Traveler |
| \`demo.host@travelista.app\` | \`demo123456\` | Host |
| \`demo.admin@travelista.app\` | \`demo123456\` | Admin |

**Security**:
- JWT validation in edge functions
- RLS policies on all 13 tables
- No client-side admin checks
- Server-side role validation via \`has_role()\``
  },
  {
    id: "features", icon: Zap, title: "Feature List",
    content: `**✅ Implemented Features**:

- [x] Host discovery with multi-filter search (city, month, expertise, tags, vibes)
- [x] Experience marketplace with 10+ categories and sub-categories
- [x] Destination guides with site explorer and video reviews
- [x] Multi-step booking flow with service selection and pricing
- [x] Community hub: reels, stories, blog with detail views
- [x] Role-based dashboards (Traveler, Host, Admin)
- [x] Invoice generation (host→traveler) with 18% GST calculation
- [x] Gamified rewards: 11-month travel streak for free 12th trip
- [x] Beta Wanderer program with missions, leaderboard, and badges
- [x] Grievance management with admin mediation
- [x] Granular ACL (Access Control List) for feature permissions
- [x] AI-powered destination recommendations (widget + chat)
- [x] Role-based notifications (traveler/host/admin specific)
- [x] Mobile sticky bottom nav
- [x] Dark/light theme with system preference detection
- [x] Multi-currency support (INR, USD, EUR, GBP)
- [x] Video review recording with camera integration
- [x] Trip hosting and listing management
- [x] Real-time data from Lovable Cloud (bookings, invoices, streaks, trips, grievances)

**🔄 In Progress**:
- [ ] Real-time chat via WebSockets
- [ ] File storage for host images/videos
- [ ] Email notifications for booking updates
- [ ] Payment gateway integration (Razorpay/Stripe)

**📋 Planned**:
- [ ] Push notifications
- [ ] Mobile app (React Native)
- [ ] Multi-language support
- [ ] Advanced analytics dashboard
- [ ] Host subscription tiers`
  },
  {
    id: "setup", icon: Terminal, title: "Setup Guide",
    content: `**Prerequisites**: Node.js 18+, npm/bun

**Development**:
\`\`\`bash
# Clone and install
git clone <repo-url>
cd travelista
npm install

# Start dev server
npm run dev
\`\`\`

**Environment Variables** (auto-configured):
| Variable | Description |
|----------|-------------|
| \`VITE_SUPABASE_URL\` | Lovable Cloud API URL |
| \`VITE_SUPABASE_PUBLISHABLE_KEY\` | Public API key |
| \`VITE_SUPABASE_PROJECT_ID\` | Project identifier |

**Demo Account Setup**:
Call the \`create-demo-accounts\` edge function to seed test users with traveler, host, and admin roles.

**Key Technologies**:
| Package | Version | Purpose |
|---------|---------|---------|
| React | 18.x | UI framework |
| TypeScript | 5.x | Type safety |
| Vite | 5.x | Build tool |
| Tailwind CSS | 3.x | Styling |
| Framer Motion | latest | Animations |
| TanStack Query | latest | Data fetching |
| react-markdown | latest | Markdown rendering |
| Supabase JS | latest | Backend client |`
  },
  {
    id: "contributing", icon: GitBranch, title: "Contributing",
    content: `**Code Standards**:
- TypeScript strict mode
- Functional components with hooks
- shadcn/ui for all UI primitives
- Tailwind semantic tokens (never hardcode colors)
- Small, focused components (<200 lines)

**File Naming**:
- Components: PascalCase (\`HostCard.tsx\`)
- Pages: PascalCase (\`Explore.tsx\`)
- Hooks: camelCase with \`use-\` prefix (\`use-mobile.tsx\`)
- Utils: camelCase (\`utils.ts\`)

**Design Tokens**:
All colors use HSL via CSS variables defined in \`index.css\`:
- \`--background\`, \`--foreground\` — Base colors
- \`--primary\`, \`--primary-foreground\` — Brand colors
- \`--accent\`, \`--accent-foreground\` — Accent colors
- \`--muted\`, \`--muted-foreground\` — Subdued text
- \`--destructive\` — Error/danger states
- \`--card\`, \`--card-foreground\` — Card surfaces

**Database Changes**:
- Always use migration tool for schema changes
- Always include RLS policies for new tables
- Use \`has_role()\` for admin-level access checks
- Never reference \`auth.users\` directly — use \`profiles\` table

**Edge Functions**:
- Include CORS headers in all responses
- Validate input with Zod where possible
- Handle 429/402 rate limit errors gracefully
- Deploy after every change`
  },
  {
    id: "changelog", icon: Clock, title: "Changelog",
    content: `**v0.9 — April 2026** (Current)
- [x] AI-powered destination recommendations (Lovable AI Gateway)
- [x] Chat-based AI travel assistant with streaming
- [x] Full developer documentation portal
- [x] Production-ready backend wiring

**v0.8 — April 2026**
- [x] Invoice system (host generates, traveler views)
- [x] Role-based notification streams
- [x] Gamified rewards integrated into traveler dashboard
- [x] Travel streak persistence in database

**v0.7 — April 2026**
- [x] Beta Wanderer missions + leaderboard
- [x] Granular ACL with admin permission management
- [x] Blog detail pages
- [x] Mobile bottom navigation

**v0.6 — April 2026**
- [x] Notification dropdown with role-specific content
- [x] Travel streak challenge (11+1 free)
- [x] Dark mode toggle with theme persistence

**v0.5 — April 2026**
- [x] Multi-dashboard system (Traveler, Host, Admin)
- [x] Booking flow with service selection
- [x] Community hub with reels, stories, blog
- [x] Experience marketplace with categories

**v0.4 — March 2026**
- [x] Host profiles with stay, transport, food modules
- [x] Destination guides with site explorer
- [x] Video review recording
- [x] Multi-currency support`
  },
];

const Docs = () => {
  const [activeSection, setActiveSection] = useState("overview");
  const current = sections.find(s => s.id === activeSection) || sections[0];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 mx-auto max-w-7xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-foreground">Developer Portal</h1>
              <p className="text-muted-foreground text-sm">Travelista — Complete technical reference</p>
            </div>
          </div>
        </motion.div>

        {/* Quick stats */}
        <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Tables", value: "13", icon: Database },
            { label: "Routes", value: "30+", icon: Globe },
            { label: "Edge Functions", value: "2", icon: Server },
            { label: "Features", value: "19+", icon: Zap },
          ].map(s => (
            <div key={s.label} className="rounded-lg bg-card p-3 shadow-card flex items-center gap-3">
              <s.icon className="w-5 h-5 text-primary" />
              <div>
                <p className="text-lg font-bold text-foreground">{s.value}</p>
                <p className="text-[10px] text-muted-foreground">{s.label}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <nav className="space-y-1 sticky top-24">
              {sections.map(s => (
                <button key={s.id} onClick={() => setActiveSection(s.id)}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${activeSection === s.id ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground hover:bg-secondary"}`}>
                  <s.icon className="w-4 h-4 shrink-0" />
                  {s.title}
                  <ChevronRight className={`w-3 h-3 ml-auto transition-transform ${activeSection === s.id ? "rotate-90" : ""}`} />
                </button>
              ))}
            </nav>
          </div>

          {/* Content */}
          <div className="lg:col-span-3">
            <motion.div key={activeSection} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }}
              className="rounded-2xl bg-card shadow-card p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <current.icon className="w-5 h-5 text-primary" />
                </div>
                <h2 className="text-2xl font-bold text-foreground">{current.title}</h2>
              </div>
              <div className="prose prose-sm max-w-none text-foreground/80">
                {current.content.split('\n').map((line, i) => {
                  if (line.startsWith('**') && line.endsWith('**')) {
                    return <h3 key={i} className="text-lg font-bold text-foreground mt-6 mb-2">{line.replace(/\*\*/g, '')}</h3>;
                  }
                  if (line.startsWith('- [x]')) {
                    return <p key={i} className="text-sm flex items-center gap-2 text-accent ml-4"><span>✅</span> {line.replace('- [x] ', '')}</p>;
                  }
                  if (line.startsWith('- [ ]')) {
                    return <p key={i} className="text-sm flex items-center gap-2 text-muted-foreground ml-4"><span>⬜</span> {line.replace('- [ ] ', '')}</p>;
                  }
                  if (line.startsWith('- **')) {
                    const match = line.match(/- \*\*(.+?)\*\*\s*[—–-]\s*(.*)/);
                    if (match) return <p key={i} className="text-sm ml-4 mb-1"><strong className="text-foreground">{match[1]}</strong> — {match[2]}</p>;
                  }
                  if (line.startsWith('- ')) {
                    return <p key={i} className="text-sm ml-4 mb-1">• {line.replace('- ', '')}</p>;
                  }
                  if (line.startsWith('```')) return null;
                  if (line.startsWith('|')) {
                    const cells = line.split('|').filter(c => c.trim());
                    if (cells.every(c => c.trim().match(/^[-]+$/))) return null;
                    return (
                      <div key={i} className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs mb-1 ml-4">
                        {cells.map((c, j) => <span key={j} className={j === 0 ? "font-mono text-primary" : "text-muted-foreground"}>{c.trim()}</span>)}
                      </div>
                    );
                  }
                  if (line.trim() === '') return <div key={i} className="h-2" />;
                  const formatted = line
                    .replace(/`([^`]+)`/g, '<code class="bg-secondary text-primary px-1 py-0.5 rounded text-xs font-mono">$1</code>')
                    .replace(/\*\*(.+?)\*\*/g, '<strong class="text-foreground">$1</strong>');
                  return <p key={i} className="text-sm leading-relaxed mb-1" dangerouslySetInnerHTML={{ __html: formatted }} />;
                })}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Docs;
