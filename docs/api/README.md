# Travelista API Package

Everything a mobile client (React Native / Flutter / Swift / Kotlin) needs to talk to the
Travelista backend. The backend is Supabase, so the API surface is:

| Surface | Base path | Auth |
| --- | --- | --- |
| Auth | `/auth/v1/*` | `apikey` header |
| Data (PostgREST) | `/rest/v1/<table>` | `apikey` + `Authorization: Bearer <access_token>` |
| RPC | `/rest/v1/rpc/<function>` | same as data |
| Storage | `/storage/v1/object/...` | same as data |
| Edge Functions | `/functions/v1/<name>` | same as data |

## Files

- `travelista.postman_collection.json` — importable Postman collection covering Auth,
  all 33 tables (list / get / create / update / delete), every RPC, storage and edge functions.
- `../db/schema.sql` — complete schema (types, tables, grants, RLS policies, functions,
  triggers, storage buckets, auth trigger) for standing up a **new external Supabase project**.

## Import into Postman

1. Postman → Import → `travelista.postman_collection.json`
2. Set collection variables:
   - `base_url` → `https://<project-ref>.supabase.co`
   - `anon_key` → your project's publishable/anon key
   - `access_token` → paste from the "Sign in (password)" response
3. Run **Auth → Sign in (password)** first; every other request uses the bearer token.

## Auth quick reference

```http
POST {{base_url}}/auth/v1/token?grant_type=password
apikey: {{anon_key}}
Content-Type: application/json

{ "email": "user@example.com", "password": "••••••••" }
```

Response contains `access_token`, `refresh_token`, `expires_in`, `user`.
Refresh with `grant_type=refresh_token`.

## Data access rules (important for mobile)

Row Level Security is enforced server-side, so the client can only ever read/write what the
signed-in user is allowed to:

- `profiles` — a user reads/updates only their own row. Public data must go through
  `rpc/get_public_profile(_id)` or `rpc/get_public_profiles(_ids)`.
- `beta_wanderers` — public listing only via `rpc/get_public_wanderers()`.
- `feed_posts` / `feed_likes` / `feed_bookmarks` — owner writes, public reads for `status='active'`.
- `bookings`, `invoices`, `messages`, `grievances` — visible to the two parties involved (+admin).
- `user_roles` — read-only for the owner; role changes are admin/RPC only.
- Everything admin-facing is gated by `has_role(auth.uid(), 'admin')`.

## Filtering syntax (PostgREST)

```
GET /rest/v1/experiences?select=*&status=eq.approved&destination=eq.Jaipur&order=created_at.desc&limit=20&offset=20
```

Operators: `eq, neq, gt, gte, lt, lte, like, ilike, in, is, cs (contains), ov (overlap)`.

## Storage upload (mobile)

```http
POST {{base_url}}/storage/v1/object/avatars/{{user_id}}/avatar.webp
Authorization: Bearer {{access_token}}
Content-Type: image/webp
x-upsert: true
```

The first path segment **must** be the user's id — storage RLS depends on it.
Public URL: `{{base_url}}/storage/v1/object/public/avatars/<user_id>/avatar.webp`.

## Edge functions

| Function | Purpose | Body |
| --- | --- | --- |
| `ai-recommend` | Streaming AI itinerary/concierge | `{ "messages": [{ "role": "user", "content": "…" }] }` |
| `beta-waitlist` | Waitlist signup + confirmation mail | `{ "email", "full_name", "plan_interest" }` |
| `create-demo-accounts` | Seeds demo traveler/host/admin | `{}` |

## Standing up an external Supabase project

```bash
psql "$NEW_PROJECT_DB_URL" -f docs/db/schema.sql
```

Then in the new project: create the four storage buckets (the script inserts them), enable
Email + Google auth providers, and set the app env vars `VITE_SUPABASE_URL` /
`VITE_SUPABASE_PUBLISHABLE_KEY`.
