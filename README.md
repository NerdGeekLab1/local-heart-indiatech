# Travelista — India's Social Travel Marketplace

> A social-media-meets-marketplace platform for India-focused travel:
> travelers discover destinations, book vetted local hosts, join group
> trips, host weddings and cultural events, while admins moderate the
> entire ecosystem from a single console.

---

## Table of contents

1. [Overview](#overview)
2. [Tech stack](#tech-stack)
3. [Feature catalog](#feature-catalog)
4. [Data model](#data-model)
5. [Authentication](#authentication)
6. [File storage](#file-storage)
7. [Edge functions](#edge-functions)
8. [Project layout](#project-layout)
9. [Local development](#local-development)
10. [Roadmap](#roadmap)

---

## Overview

Travelista is a unified app where:

- **Travelers** browse destinations across India, book curated experiences,
  join traveler-led group trips, earn travel-streak rewards, and connect
  with the community.
- **Hosts** publish experiences, transport options, food menus, stays,
  and **wedding events**, manage bookings, generate invoices, and chat
  with travelers in real time.
- **Trip Leaders** organise group itineraries with split or fixed pricing
  and live participant tracking.
- **Beta Wanderers** are creator-tier members assigned admin missions for
  content, reviews, and badges.
- **Admins** run a unified console with analytics (Recharts), KYC and
  trust controls, role/ACL management, configurable subscriptions,
  email templates, grievance mediation, and global content moderation.

Design language: *Golden Hour* theme, Marigold Saffron accents, semantic
HSL tokens with full light/dark support.

---

## Tech stack

| Layer        | Choice                                                 |
| ------------ | ------------------------------------------------------ |
| Framework    | React 18 + Vite 5 + TypeScript 5                       |
| Styling      | Tailwind CSS v3, semantic tokens in `src/index.css`    |
| UI kit       | shadcn/ui (Radix primitives), framer-motion, Recharts  |
| State / data | React Query, React Context, custom hooks               |
| Backend      | **Lovable Cloud** (managed Supabase: Postgres + Auth + Storage + Realtime + Edge Functions) |
| AI           | **Lovable AI Gateway** — Gemini 2.5 Flash, GPT-5 family |
| Carousels    | embla-carousel-react + autoplay                        |
| Forms        | react-hook-form + zod                                  |
| Tests        | Vitest + Playwright                                    |

All API keys for AI and managed Google OAuth are provisioned by Lovable
Cloud — no manual `.env` setup is required.

---

## Feature catalog

### Discovery

- **Destinations** — 70+ curated Indian cities with sites, monuments,
  itineraries, OpenStreetMap embeds, seasonal data.
  Quick-jump auto-scrolling carousel for fast navigation.
- **Experiences** — categorised (Cultural, Food, Spiritual, Wellness,
  Adventure, Wedding, Village, Festival, Medical, Bike Tour) with
  variable pricing, add-ons, year-round or window-based availability.
- **Traveler-led trips** — group trips with fixed or split pricing,
  inclusion toggles (transport, stay, food, activities), real-time
  participant tracking.
- **AI Recommendations** — streaming chat-based itinerary advisor
  powered by Gemini Flash via the AI Gateway.
- **Specialized vehicles** — per-day or per-km pricing for bikes,
  SUVs, tempo travellers, etc.

### Bookings & payments

- Pending → Confirmed → Rejected status flow.
- Variable pricing with add-ons.
- Invoices auto-calculate **18% GST**, tracked for GMV reporting.
- Subscription tiers (admin-managed): Free, Explorer ₹499, Adventurer
  ₹999, Nomad ₹1999. Plans are stored in `subscription_plans` and fully
  CRUD-able from the admin console.

### Trust & safety

- KYC for hosts.
- Mandatory video reviews to combat fake ratings.
- Ticket-based grievance mediation between traveler, host and admin.
- Role-based access via `user_roles` + `has_role()` security definer.

### Gamification

- **Travel streaks** — book 11 months in a row, the 12th trip is free.
- **Beta Wanderer Program** — creator missions, leaderboards, badges
  (Explorer → Nomad).
- **Trip Leader scores** — distinct profile with leader history.

### Communication

- Real-time messaging via Supabase Realtime on the `messages` table.
- Notification triggers for travelers, hosts and admins.
- Email engine with admin-managed templates, variable interpolation
  (`{{first_name}}`, `{{booking_url}}`, …) and a queued `email_notifications`
  table.

### Hosting

- Manage properties, rooms, vehicles, dishes (food menu), experiences.
- **Upcoming Weddings** — host wedding events with couple names,
  date, venue, highlights, cuisines, guest count, cover image and
  public/private visibility.
- Edit live experiences directly from the dashboard.
- "Request New Experience" submissions appear in the admin console for
  approval.

### Admin console

- Left sidebar navigation grouped by Insights, People, Catalog,
  Operations, Settings.
- Subscription Plans CRUD, Email Templates with variable reference,
  Configuration (Google OAuth overrides), Grievances queue, Wanderer
  missions, Wedding moderation, ACL with custom permissions.

---

## Data model

Key tables (all RLS-protected):

| Table                  | Purpose                                          |
| ---------------------- | ------------------------------------------------ |
| `profiles`             | Display info per `auth.users.id`                 |
| `user_roles`           | `traveler` / `host` / `admin` enum roles         |
| `user_permissions`     | Fine-grained ACL grants                          |
| `experiences`          | Approved live experiences                        |
| `experience_requests`  | Host submissions awaiting admin approval         |
| `trip_listings`        | Traveler-led group trips                         |
| `trip_participants`    | Join state per trip                              |
| `bookings`             | Pending / Confirmed / Rejected flow              |
| `invoices`             | 18% tax, status, paid_at                         |
| `reviews`              | Star + optional video                            |
| `messages`             | Realtime chat                                    |
| `grievances`           | Ticket mediation                                 |
| `beta_wanderers`       | Creator program members                          |
| `wanderer_missions`    | Admin-assigned tasks                             |
| `travel_streaks`       | Monthly streak tracking                          |
| `subscriptions`        | Per-user subscription state                      |
| `subscription_plans`   | Admin-managed tier catalog                       |
| `wedding_events`       | Host wedding listings                            |
| `email_templates`      | HTML/text templates with variables               |
| `email_notifications`  | Queued / sent log                                |
| `app_configuration`    | Key/value runtime config                         |
| `referrals`            | Referral codes & rewards                         |
| `host_eligibility`     | KYC + credibility quiz state                     |

Roles are stored in a separate table to avoid privilege-escalation; the
`has_role(uuid, app_role)` SECURITY DEFINER function is used by all RLS
policies.

---

## Authentication

- Email + password (verification required, no auto-confirm).
- **Google OAuth** via Lovable Cloud's managed credentials. Custom
  client ID / secret can be supplied via Cloud Authentication Settings.
- Profile auto-created on signup via the `handle_new_user` trigger.

---

## File storage

| Bucket              | Public | Use                           |
| ------------------- | ------ | ----------------------------- |
| `avatars`           | Yes    | Profile pictures              |
| `experience-images` | Yes    | Experience covers             |
| `trip-images`       | Yes    | Trip cover images             |

---

## Edge functions

- `ai-recommend` — streaming AI chat for trip recommendations
  (Gemini Flash via Lovable AI Gateway).
- `create-demo-accounts` — seeds traveler / host / admin demo accounts.

---

## Project layout

```
src/
  components/
    admin/           ConfigurationTab, EmailTemplatesTab,
                     SubscriptionPlansTab, WeddingsTab
    ui/              shadcn primitives
    Footer.tsx, Navbar.tsx, MobileBottomNav.tsx, ...
  contexts/          AuthContext, CurrencyContext
  hooks/             use-db-hosts, use-local-storage, use-toast, ...
  integrations/
    supabase/        client, types (auto-generated)
  lib/               data.ts, utils.ts
  pages/
    dashboard/       AdminDashboard, HostDashboard, TravelerDashboard
    Destinations.tsx, DestinationDetail.tsx, Experiences.tsx, ...
supabase/
  config.toml
  functions/
    ai-recommend/, create-demo-accounts/
  migrations/        Timestamped SQL migrations
```

---

## Local development

```bash
bun install
bun run dev
```

The app runs against the connected Lovable Cloud project automatically;
`.env` and `src/integrations/supabase/client.ts` are auto-generated and
should not be edited by hand.

Common scripts:

```bash
bun run dev          # Vite dev server
bun run build        # Production build
bunx vitest run      # Unit tests
```

---

## Roadmap

See **`Travelista_Roadmap.md`** for the full phased plan and
**`PROJECT_DOCUMENTATION.md`** for the complete URL / feature reference.
The in-app developer portal lives at `/docs`.

Highlights of what's next:

- **Luggage Companion programme** — every trip host can offer one
  complementary "Luggage" seat to a vetted free traveler-mate.
  Eligibility via the Luggage Quest (KYC, bookings, stamps, video
  review, etiquette quiz, intro chat). Nomad subscribers get one
  **guaranteed Luggage trip per month**; Adventurer gets priority
  queue; hosts earn a **Luggage Patron** badge.
- Payment gateway integration (Razorpay / Stripe).
- Wedding RSVP and ticketed guest list.
- Push notifications + React Native mobile app.
- More AI-driven personalisation (host matching, dynamic pricing).
- Multi-language support (Hindi, Tamil, Bengali, Marathi).

