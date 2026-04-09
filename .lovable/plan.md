## Phase 1: AI-Powered Destination Recommender
1. **Edge Function** — `ai-recommend` using Lovable AI (gemini-3-flash-preview) that takes user preferences/history and returns personalized destination suggestions
2. **Auto-suggest widget** on Traveler Dashboard — shows AI-curated destination cards based on profile interests & travel history
3. **Chat-based recommender** — conversational AI on `/explore` page where users describe what they want and get suggestions

## Phase 2: Full Developer Documentation Portal
4. **`/docs` page overhaul** — Complete developer portal with:
   - API endpoints reference (edge functions)
   - Database schema documentation (all tables with relationships)
   - System architecture overview
   - Setup guide & contribution guide
   - Feature list with status indicators
   - Changelog section

## Phase 3: Production-Ready Backend
5. **Wire all UI to real DB** — Audit every dashboard/page and replace mock data with live Supabase queries:
   - Traveler Dashboard: bookings, invoices, streaks, rewards all from DB
   - Host Dashboard: bookings, invoices, experience management from DB
   - Admin Dashboard: user management, approvals, grievances, analytics from DB
   - Notifications: real messages from `messages` table
6. **Invoice flow fix** — Test and fix the host→traveler invoice generation end-to-end
7. **Security scan** — Run linter + security scan to catch any RLS gaps
8. **Missing backend features** — Email notifications setup, proper error handling across all edge functions

## Phase 4: Testing & Verification
9. Test invoice flow with demo accounts
10. Verify profile dropdown navigation
11. End-to-end smoke test of all major flows
