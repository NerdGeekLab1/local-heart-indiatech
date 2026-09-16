# Complete Wanderer, traveler alerts, and creator rewards

## What will change
- Restore mission history on each public Beta Wanderer profile, including status, dates, reward points, and evidence links where safe to show.
- Correct demo trip leaders so traveler-led trips use traveler identities rather than demo host profiles.
- Add a booking bell to the traveler dashboard for approved/rejected bookings and reward decisions, with unread state and direct links to the relevant view.
- Complete the creator journey so approved influencers can submit content, earn creator stamps and rewards, and see admin-approved payments credited to their account.
- Extend the creator admin view to review content rewards, award stamps, approve pending payments, and show a clear payment audit trail.

## Safety and privacy
- Notifications and creator account balances will be scoped to the signed-in user.
- Public Wanderer mission data will expose only approved, showcase-safe details; private admin notes and internal evidence remain protected.
- Creator earnings and payment details remain private to the creator and admins.

## Technical details
- Add narrowly scoped public mission-read data and creator reward/payment operations through database functions and row-level access rules.
- Reuse existing booking, reward ledger, traveler stamp catalogue, notification, and realtime patterns.
- Harden creator update permissions while changing the creator tables, and enable realtime delivery for the affected creator data.
- Update the public Wanderer profile, Trips demo data, traveler dashboard, creator dashboard, and creator admin controls.
- Verify database policies, build output, and signed-in desktop/mobile flows.
