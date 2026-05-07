## Scope

Seven distinct changes spanning admin UX, subscription management, destinations UI, host workflows, a new wedding feature, and docs.

## 1. Admin dashboard — left sidebar navigation

- Refactor `src/pages/dashboard/AdminDashboard.tsx` from top tabs to a left vertical nav using shadcn `Sidebar` (collapsible, icon mini-state).
- Group nav items by section: Overview, Users & ACL, Experiences, Experience Requests, Trips, Bookings, Subscriptions, Emails, Destinations, Configuration, Grievances.
- Keep query-param routing (`?tab=`) intact so deep links still work.
- Add a header bar with `SidebarTrigger`, breadcrumb of current section, and theme/profile controls.

## 2. Subscription management — full CRUD

- Add a new `subscription_plans` table (separate from per-user `subscriptions`) so admins can create/edit/delete plan tiers without code changes.
  - Fields: name, slug, price, currency, billing_cycle, description, features[], badge, is_active, sort_order, perks_json (discount %, cancellations, etc.).
  - Seeded with current 4 tiers (Free, Explorer, Adventurer, Nomad).
- Admin sidebar gets a **Subscriptions** section with a `SubscriptionPlansTab`:
  - Table of plans + "New Plan" dialog using `EditDialog`.
  - Edit/delete actions, toggle active.
- `Membership.tsx` switches to load tiers from `subscription_plans` (fallback to existing constants if empty). Subscribe still writes to per-user `subscriptions` table.

## 3. Destinations page UI

- `src/pages/Destinations.tsx`: replace the dense "Quick Jump — 80 destinations" grid with a horizontally scrolling carousel (embla-based), auto-scrolling left-to-right with hover pause.
- Polish hero, filters, and card grid (better spacing, gradient overlays, skeleton states).

## 4. Host → Request New Experience visible in admin

- The flow already writes to `experience_requests`. Confirm host dashboard's "Request New Experience" submits there.
- Add an **Experience Requests** tab in admin sidebar (new component `ExperienceRequestsTab.tsx`) listing all rows with approve/reject actions; on approve, copy the row into `experiences` with `status='approved'`.

## 5. Host dashboard — edit existing experiences

- In `HostDashboard.tsx`, ensure each owned experience has an Edit button opening `EditDialog` to update title, price, description, image, etc. Persist via `experiences` update.

## 6. Wedding events — new "Upcoming Weddings" host module

- New `wedding_events` table:
  - host_id, couple_names, wedding_date, venue, city, description, highlights[], cover_image_url, cuisines[], guest_count, contact_phone, status, public visibility flag.
  - RLS: host CRUD on own; public read of `is_public=true`; admin all.
- Host dashboard gains an **Upcoming Weddings** tab to add/edit/delete wedding entries.
- Surface upcoming weddings in admin sidebar (read-only list) for moderation.

## 7. README.md

Replace the placeholder with full project documentation:
- Project overview, India-focused traveler/host marketplace + social features.
- Tech stack (React 18, Vite, Tailwind, shadcn, Supabase / Lovable Cloud, Lovable AI Gateway).
- Feature catalog (Beta Wanderer, Trip Leader, gamified rewards, AI recs, KYC, real-time chat, invoices/tax, subscriptions, weddings, etc.).
- Data model summary (key tables + roles).
- Environment, scripts, folder layout.
- Auth (email + Google OAuth), file storage buckets, edge functions.
- Roadmap section.

## Technical notes

- New migration creates `subscription_plans` and `wedding_events` with RLS and `update_updated_at_column` triggers; seeds default plans.
- Sidebar uses `collapsible="icon"` + persistent `SidebarTrigger` in admin header so it works on mobile too.
- Destinations carousel uses existing `embla-carousel-react` + `embla-carousel-autoplay` (add if missing) with `dragFree` and slow autoplay.
- All new UI strictly uses semantic tokens from `index.css` (no raw color classes).
- No changes to auth, RLS on existing tables, or pricing logic beyond making plans editable.

## Out of scope

- Payment gateway integration (admin-managed plans still use the existing manual subscribe flow).
- Wedding bookings/RSVP (this iteration only adds the host-managed listing).
