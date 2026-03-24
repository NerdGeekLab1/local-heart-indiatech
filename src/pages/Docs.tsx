import { useState } from "react";
import { motion } from "framer-motion";
import { BookOpen, Code, Database, Users, Shield, Globe, Zap, Layers, ChevronRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const sections = [
  {
    id: "overview", icon: Globe, title: "Project Overview",
    content: `**Travelista** is a social travel marketplace platform for international travelers visiting India. It combines social media storytelling with travel booking and a marketplace for local services.

**Vision**: Travelers book a person, not just a place. Hosts offer guided tours, homestays, transportation, food experiences, and cultural immersion.

**User Types**:
- **Traveler** — International users discovering and booking Indian experiences
- **Host** — Verified local companions in India offering services
- **Admin** — Platform management, moderation, and analytics

**Core Problem Solved**:
- Travelers lack authentic local experiences and face trust issues
- Local hosts lack a global platform to monetize their knowledge and hospitality`
  },
  {
    id: "architecture", icon: Layers, title: "Architecture & Tech Stack",
    content: `**Frontend**: React 18 + TypeScript + Vite + Tailwind CSS
**UI Components**: shadcn/ui (Radix primitives + Tailwind)
**Animations**: Framer Motion
**Routing**: React Router v6
**State**: React Query + localStorage (transitioning to Lovable Cloud)
**Backend**: Lovable Cloud (Supabase) — PostgreSQL, Auth, Storage, Edge Functions
**Icons**: Lucide React

**Project Structure**:
\`\`\`
src/
├── components/     # Reusable UI components
│   ├── ui/         # shadcn/ui primitives
│   ├── Navbar.tsx
│   ├── Footer.tsx
│   ├── HostCard.tsx
│   ├── ExperienceCard.tsx
│   ├── EditDialog.tsx
│   └── VideoRecorder.tsx
├── pages/          # Route pages
│   ├── Index.tsx           # Homepage
│   ├── Explore.tsx         # Host discovery
│   ├── Experiences.tsx     # Experience marketplace
│   ├── Destinations.tsx    # City guide
│   ├── Community.tsx       # Stories, reels, blog
│   ├── HostProfile.tsx     # Public host profile
│   ├── Booking.tsx         # Booking flow
│   ├── Signup.tsx          # Registration
│   └── dashboard/
│       ├── TravelerDashboard.tsx
│       ├── HostDashboard.tsx
│       └── AdminDashboard.tsx
├── lib/
│   ├── data.ts     # Mock data & interfaces
│   └── utils.ts    # Utility functions
├── hooks/          # Custom React hooks
└── assets/         # Images
\`\`\``
  },
  {
    id: "features", icon: Zap, title: "Features & Modules",
    content: `**1. Host Discovery & Profiles**
- Rich public profiles with bio, services, ratings, gallery
- Instagram-style video reels timeline
- Stay info with rooms, amenities, pricing
- Transport fleet with vehicle details
- Food menu with cuisine types and dishes
- Tabbed navigation (Overview, Stay, Transport, Food, Experiences, Reviews)

**2. Experience Marketplace**
- Categories: Cultural, Spiritual, Adventure, Adventure Sports, Wedding, Village, Food, Festival, Wellness, Medical Care
- Adventure Sports: Skydiving, Paragliding, River Rafting, Bungee Jumping, Scuba Diving, Desert Safari, Surfing
- Each experience: pricing, duration, difficulty level, group size, includes, highlights

**3. Destination Guides**
- Interactive destination cards with sites and monuments
- Individual detail pages with site explorer
- Experience tags connecting destinations to activities
- Video reviews from travelers
- Host cards for each city

**4. Community Hub**
- Instagram-style reels with captions, hashtags, likes
- Traveler stories with expandable full content
- Host spotlights
- Blog with articles, guides, and insights
- Travel tips organized by category

**5. Booking & Inquiry Flow**
- Service selection, date picking, guest count
- Price breakdown with platform fees
- Message to host
- Booking confirmation

**6. Dashboard Panels**
- **Traveler**: Trip history, saved hosts, profile settings, video reviews
- **Host**: Booking management, listings CRUD, vehicle fleet, food menu, pricing, social media, analytics
- **Admin**: User management, host approval/suspension, booking oversight, content moderation, analytics

**7. Trust & Safety**
- KYC-verified hosts with safety scores
- Mandatory video reviews for testimonials
- Secure escrow-based payments
- Rating and review system`
  },
  {
    id: "data-model", icon: Database, title: "Data Model",
    content: `**Core Interfaces**:

\`\`\`typescript
Host {
  id, name, city, tagline, bio, image,
  rating, reviewCount, services[], languages[],
  pricePerDay, verified, safetyScore, responseTime,
  specialties[], stayInfo?, transportInfo?, foodInfo?
}

Experience {
  id, title, description, image, price, duration,
  category, hostId, hostName, hostCity, rating,
  difficulty?, groupSize?, includes?, highlights[]
}

Destination {
  name, state, hostCount, tagline, description,
  highlights[], bestSeason?, avgTemp?,
  sites?: DestinationSite[], experienceTags?: string[]
}

StayInfo { propertyName, propertyType, rooms[], amenities[] }
TransportInfo { vehicles[], airports[], coverage[] }
FoodInfo { cuisines[], mealTypes[], dishes[] }

BlogPost { id, title, content, author, category, tags[] }
CommunityReel { id, caption, hashtags[], likes, comments }
\`\`\`

**Database Tables** (Lovable Cloud):
- \`profiles\` — User profiles linked to auth
- \`hosts\` — Host details and verification status
- \`experiences\` — Experience listings
- \`bookings\` — Booking records with status
- \`reviews\` — Ratings and video testimonials
- \`destinations\` — City/destination data
- \`vehicles\` — Host vehicle fleet
- \`food_menus\` — Host food offerings`
  },
  {
    id: "api", icon: Code, title: "API & Routes",
    content: `**Frontend Routes**:
| Route | Page |
|-------|------|
| \`/\` | Homepage |
| \`/explore\` | Host discovery |
| \`/experiences\` | Experience marketplace |
| \`/experience/:id\` | Experience detail |
| \`/host/:id\` | Host public profile |
| \`/book/:id\` | Booking flow |
| \`/destinations\` | Destination listing |
| \`/destination/:name\` | Destination detail |
| \`/community\` | Community hub (reels, stories, blog) |
| \`/signup\` | Registration |
| \`/become-host\` | Host onboarding |
| \`/dashboard/traveler\` | Traveler panel |
| \`/dashboard/host\` | Host panel |
| \`/dashboard/admin\` | Admin panel |
| \`/resources\` | Host resources |
| \`/help\` | Help center |
| \`/safety\` | Safety info |
| \`/terms\` | Terms & policies |
| \`/docs\` | Documentation |

**Planned Edge Functions**:
- \`/api/booking\` — Create/update bookings
- \`/api/review\` — Submit reviews with video
- \`/api/host-verify\` — KYC verification flow
- \`/api/payment\` — Stripe/Razorpay integration`
  },
  {
    id: "auth", icon: Users, title: "Authentication & Roles",
    content: `**Auth Provider**: Lovable Cloud (Supabase Auth)

**Supported Methods**:
- Email/password signup
- Google OAuth
- Phone OTP (planned)

**Role-Based Access**:
- Roles stored in separate \`user_roles\` table (not on profiles)
- Security definer functions prevent RLS recursion
- Three roles: \`admin\`, \`host\`, \`traveler\`

**Security**:
- JWT validation in edge functions
- RLS policies on all tables
- No client-side admin checks
- Escrow-based payment flow`
  },
  {
    id: "roadmap", icon: Shield, title: "MVP Roadmap",
    content: `**Phase 1 — Foundation** ✅
- [x] Homepage with hero, hosts, experiences, destinations
- [x] Host discovery and public profiles
- [x] Experience marketplace with categories
- [x] Destination guides with site explorer
- [x] Booking flow
- [x] Community hub with reels and stories

**Phase 2 — Backend Integration** 🔄
- [ ] Lovable Cloud database tables
- [ ] User authentication (signup/login)
- [ ] Profile CRUD with database persistence
- [ ] Booking system with real-time updates
- [ ] File storage for host images and videos

**Phase 3 — Monetization**
- [ ] Stripe/Razorpay payment integration
- [ ] Commission system per booking
- [ ] Featured listing promotions
- [ ] Host subscription tiers

**Phase 4 — Growth**
- [ ] Real-time chat (WebSockets)
- [ ] Push notifications
- [ ] Mobile app (React Native)
- [ ] Multi-language support
- [ ] AI-powered itinerary builder
- [ ] Advanced analytics dashboard`
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
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground">Documentation</h1>
          <p className="mt-2 text-muted-foreground">Complete project reference guide for Travelista</p>
        </motion.div>

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
                      <div key={i} className="grid grid-cols-2 gap-2 text-xs mb-1 ml-4">
                        {cells.map((c, j) => <span key={j} className={j === 0 ? "font-mono text-primary" : "text-muted-foreground"}>{c.trim()}</span>)}
                      </div>
                    );
                  }
                  if (line.trim() === '') return <div key={i} className="h-2" />;
                  // Handle inline code and bold
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
