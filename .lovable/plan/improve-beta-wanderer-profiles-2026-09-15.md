# Improve Beta Wanderer profiles

## What will change
- Refresh the public Wanderer directory for faster scanning, clearer hierarchy, and better mobile layout.
- Show each Wanderer's display picture, with a polished initials fallback when no picture is available.
- Add visible achievement badges and a compact stamp-collection summary to directory cards.
- Upgrade the public profile with a stronger identity header, badge showcase, earned stamp gallery, and collection progress.
- Keep private reward details protected while exposing only safe public profile and achievement information.

## Technical details
- Extend the existing public Wanderer read functions to return the linked profile picture and safe stamp summaries.
- Update the directory and profile views to consume those fields, including demo fallbacks.
- Reuse the existing stamp catalogue, badge styling, and semantic theme tokens.
- Verify database access rules, compilation, and both desktop and mobile layouts.
