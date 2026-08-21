# Stabilize Host Dashboard and Complete Booking Tools

## Goal
Stop the Host Dashboard refresh loop, make failure recovery testable, preserve rich special requests, provide useful host-profile loading states, and finish invoices, profile saving, and verification eligibility.

## Implementation

### 1. Host Dashboard loading and recovery
- Separate initial loading from background refresh so cached data renders immediately without a full-page loading state.
- Keep a stable per-host cache and update only the changed dataset after realtime events instead of deleting the entire cache.
- Move retry/circuit-breaker state outside the effect lifecycle so retries stop after three failures and do not restart from rerenders or subscription events.
- Make **Try again** explicitly reset the breaker and run one controlled refresh without rebuilding unrelated subscriptions.
- Add an E2E test that intercepts dashboard data requests, verifies retries stop, confirms the “Couldn’t load” banner, then restores responses and verifies **Try again** recovers.

### 2. Rich, persistent special requests
- Expand offered add-ons to show icon/emoji, name, visible description, and price; retain the icon-mapped custom request type selector and detailed preview.
- Persist the booking draft per traveler and host across refresh, including step, services, dates, guests, message, selected add-ons, and custom requests.
- Include the selected request names/details in the booking payload and show their descriptions and prices in the final confirmation and success summary.
- Clear the saved draft only after a successful booking submission.

### 3. Public Host Profile states
- Replace the minimal loader with a skeleton matching the cover, identity area, service tiles, tabs, content grid, and sidebar.
- Give Overview, Quick Info, Reels, Stay, Transport, Food, Experiences, and Reviews consistent intentional empty states.
- Keep profile editing and saving in Host Dashboard Settings; the public profile remains read-only.

### 4. Host invoices
- Add an expandable invoice detail dialog with invoice number, dates, traveler/host context, booking dates, itemized booked services and special requests, subtotal, 18% tax, and total.
- Open the generated invoice immediately and allow existing invoices to be reopened.
- Add a print/PDF action using a print-optimized invoice layout so the browser can save a faithful PDF without introducing a large PDF dependency.
- Prevent duplicate invoice generation for the same booking.

### 5. Profile save and host verification
- Make the Host Dashboard Settings save action permanently visible and provide clear saving/saved/error feedback.
- Replace unconditional verification presentation with database-backed verification status.
- Add a verification application state and enable **Apply for verification** only when the host is approved, profile is at least 80% complete, has at least one approved listing, at least three completed bookings, and an average rating of at least 4.5 when reviews exist.
- Show progress for each milestone, submitted/reviewed state, and earned verification highlights on the Host Dashboard; only verified hosts receive the public badge.
- Add secure backend policies/functions for host submission and admin review, with grants and role checks.

## Validation
- Run focused component/unit tests for request persistence and invoice calculations.
- Run the new circuit-breaker E2E test plus existing host profile/booking tests.
- Verify the Host Dashboard no longer oscillates between loading states, profile settings save, invoice detail prints correctly, and public badges reflect live verification status.

## Technical details
- Continue using semantic design tokens and existing UI components.
- Store booking drafts locally only as non-authoritative form progress; final bookings remain backend records.
- Use a dedicated verification table rather than putting roles or mutable trust state in client storage.
- Database migration will include explicit grants, RLS, host-owned submission policies, admin review policies, and public status exposure only through the existing public-host function.
