# Three traveler dashboard styles

## What will change
- Add a **Dashboard appearance** section under Traveler Settings with three visual preview choices:
  - **Journey** — balanced cards and familiar horizontal navigation.
  - **Compact** — denser information with a desktop side rail and reduced spacing.
  - **Playful** — bolder welcome area, colorful accents, and more expressive navigation.
- Save the selected style on the device and apply it immediately across every traveler dashboard tab.
- Keep the existing Dashboard/Feed default-view preference, but move its control into the same Settings section so both startup and appearance choices are easy to understand.
- Preserve mobile usability: compact mode falls back to a scrollable top navigation, and all three styles retain the mobile bottom navigation.

## Technical details
- Define a typed traveler dashboard style preference using the existing local-storage hook.
- Apply style-specific layout, spacing, header, navigation, and content-container classes in `TravelerDashboard.tsx` without changing booking, rewards, messaging, or profile behavior.
- Use the existing semantic color tokens and Button controls; no new backend data is required.
- Verify all three selections persist after reload and that Settings, Feed, and Overview render correctly at desktop and mobile widths.
