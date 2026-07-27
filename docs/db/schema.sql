-- =====================================================================
-- Travelista — full database schema for an external Supabase project
-- Generated from the live Lovable Cloud database.
-- Run in the SQL editor of the target project (order matters).
-- =====================================================================

create extension if not exists "pgcrypto";

-- ---------- Enum types ----------
do $$ begin create type public.app_role as enum ('admin','host','traveler'); exception when duplicate_object then null; end $$;
do $$ begin create type public.subscription_tier as enum ('free','explorer','adventurer','nomad'); exception when duplicate_object then null; end $$;

-- ---------- Tables ----------
create table if not exists public."admin_audit_log" (
  "id" uuid default gen_random_uuid() not null,
  "admin_id" uuid not null,
  "entity_type" text not null,
  "entity_id" uuid not null,
  "action" text not null,
  "previous_status" text,
  "new_status" text,
  "notes" text,
  "metadata" jsonb default '{}'::jsonb,
  "created_at" timestamp with time zone default now() not null,
  primary key (id)
);

create table if not exists public."app_configuration" (
  "id" uuid default gen_random_uuid() not null,
  "key" text not null,
  "value" text,
  "category" text default 'general'::text not null,
  "description" text,
  "is_secret" boolean default false not null,
  "updated_by" uuid,
  "created_at" timestamp with time zone default now() not null,
  "updated_at" timestamp with time zone default now() not null,
  unique (key),
  primary key (id)
);

create table if not exists public."beta_waitlist" (
  "id" uuid default gen_random_uuid() not null,
  "email" text not null,
  "full_name" text,
  "city" text,
  "interest" text,
  "plan_interest" text,
  "referral_source" text,
  "status" text default 'pending'::text not null,
  "confirmation_token" uuid default gen_random_uuid() not null,
  "confirmed_at" timestamp with time zone,
  "created_at" timestamp with time zone default now() not null,
  unique (email),
  primary key (id)
);

create table if not exists public."beta_wanderers" (
  "id" uuid default gen_random_uuid() not null,
  "user_id" uuid not null,
  "full_name" text not null,
  "email" text not null,
  "phone" text,
  "city" text not null,
  "bio" text,
  "travel_styles" text[] default '{}'::text[],
  "preferred_destinations" text[] default '{}'::text[],
  "social_links" jsonb default '{}'::jsonb,
  "video_url" text,
  "status" text default 'pending'::text not null,
  "score" integer default 0,
  "missions_completed" integer default 0,
  "total_videos" integer default 0,
  "badge" text default 'explorer'::text,
  "admin_notes" text,
  "created_at" timestamp with time zone default now() not null,
  "updated_at" timestamp with time zone default now() not null,
  primary key (id)
);

create table if not exists public."bookings" (
  "id" uuid default gen_random_uuid() not null,
  "experience_id" uuid,
  "host_id" uuid,
  "traveler_id" uuid not null,
  "services" text[] default '{}'::text[],
  "start_date" date not null,
  "end_date" date not null,
  "guests" integer default 1,
  "total_price" numeric default 0 not null,
  "status" text default 'pending'::text,
  "message" text,
  "created_at" timestamp with time zone default now() not null,
  foreign key (experience_id) references experiences(id),
  foreign key (host_id) references auth.users(id),
  primary key (id),
  check ((status = any (array['pending'::text, 'confirmed'::text, 'completed'::text, 'cancelled'::text]))),
  foreign key (traveler_id) references auth.users(id)
);

create table if not exists public."email_notifications" (
  "id" uuid default gen_random_uuid() not null,
  "template_id" uuid,
  "template_name" text,
  "recipient_email" text not null,
  "recipient_user_id" uuid,
  "subject" text not null,
  "body_html" text,
  "payload" jsonb default '{}'::jsonb,
  "status" text default 'queued'::text not null,
  "trigger_event" text,
  "sent_by" uuid,
  "sent_at" timestamp with time zone,
  "error" text,
  "created_at" timestamp with time zone default now() not null,
  primary key (id),
  foreign key (template_id) references email_templates(id) on delete set null
);

create table if not exists public."email_templates" (
  "id" uuid default gen_random_uuid() not null,
  "name" text not null,
  "category" text default 'custom'::text not null,
  "subject" text not null,
  "body_html" text not null,
  "body_text" text,
  "variables" text[] default '{}'::text[],
  "is_active" boolean default true not null,
  "description" text,
  "created_by" uuid,
  "updated_by" uuid,
  "created_at" timestamp with time zone default now() not null,
  "updated_at" timestamp with time zone default now() not null,
  unique (name),
  primary key (id)
);

create table if not exists public."experience_requests" (
  "id" uuid default gen_random_uuid() not null,
  "host_id" uuid not null,
  "title" text not null,
  "description" text,
  "category" text not null,
  "sub_category" text,
  "location" text not null,
  "destination" text,
  "price" numeric default 0 not null,
  "duration" text,
  "difficulty" text,
  "max_guests" integer default 10,
  "includes" text[] default '{}'::text[],
  "highlights" text[] default '{}'::text[],
  "image_url" text,
  "is_year_round" boolean default false,
  "valid_from" date,
  "valid_to" date,
  "last_booking_date" date,
  "vehicle_type" text,
  "vehicle_details" jsonb,
  "status" text default 'pending'::text,
  "admin_notes" text,
  "reviewed_by" uuid,
  "created_at" timestamp with time zone default now() not null,
  "template_data" jsonb default '{}'::jsonb,
  foreign key (host_id) references auth.users(id),
  primary key (id),
  foreign key (reviewed_by) references auth.users(id),
  check ((status = any (array['pending'::text, 'approved'::text, 'rejected'::text])))
);

create table if not exists public."experiences" (
  "id" uuid default gen_random_uuid() not null,
  "title" text not null,
  "description" text,
  "category" text not null,
  "sub_category" text,
  "location" text not null,
  "destination" text,
  "price" numeric default 0 not null,
  "duration" text,
  "difficulty" text,
  "max_guests" integer default 10,
  "group_size" text,
  "includes" text[] default '{}'::text[],
  "highlights" text[] default '{}'::text[],
  "image_url" text,
  "host_id" uuid,
  "host_name" text,
  "host_city" text,
  "rating" numeric default 0,
  "review_count" integer default 0,
  "is_year_round" boolean default false,
  "valid_from" date,
  "valid_to" date,
  "last_booking_date" date,
  "status" text default 'pending'::text,
  "approved_by" uuid,
  "vehicle_type" text,
  "vehicle_details" jsonb,
  "created_at" timestamp with time zone default now() not null,
  "updated_at" timestamp with time zone default now() not null,
  "template_data" jsonb default '{}'::jsonb,
  foreign key (approved_by) references auth.users(id),
  check ((difficulty = any (array['easy'::text, 'moderate'::text, 'hard'::text, 'extreme'::text]))),
  foreign key (host_id) references auth.users(id),
  primary key (id),
  check ((status = any (array['pending'::text, 'approved'::text, 'rejected'::text, 'suspended'::text])))
);

create table if not exists public."feature_flags" (
  "id" uuid default gen_random_uuid() not null,
  "flag_key" text not null,
  "label" text not null,
  "description" text,
  "enabled_globally" boolean default false not null,
  "created_at" timestamp with time zone default now() not null,
  "updated_at" timestamp with time zone default now() not null,
  unique (flag_key),
  primary key (id)
);

create table if not exists public."feed_bookmarks" (
  "id" uuid default gen_random_uuid() not null,
  "user_id" uuid not null,
  "post_id" uuid not null,
  "created_at" timestamp with time zone default now() not null,
  primary key (id),
  unique (user_id, post_id)
);

create table if not exists public."feed_likes" (
  "id" uuid default gen_random_uuid() not null,
  "post_id" uuid not null,
  "user_id" uuid not null,
  "created_at" timestamp with time zone default now() not null,
  primary key (id),
  foreign key (post_id) references feed_posts(id) on delete cascade,
  unique (post_id, user_id)
);

create table if not exists public."feed_posts" (
  "id" uuid default gen_random_uuid() not null,
  "user_id" uuid not null,
  "media_url" text not null,
  "media_type" text default 'image'::text not null,
  "caption" text,
  "tag_type" text,
  "tag_value" text,
  "location" text,
  "likes_count" integer default 0 not null,
  "created_at" timestamp with time zone default now() not null,
  "updated_at" timestamp with time zone default now() not null,
  "status" text default 'active'::text not null,
  "removed_reason" text,
  "removed_by" uuid,
  "removed_at" timestamp with time zone,
  primary key (id)
);

create table if not exists public."grievances" (
  "id" uuid default gen_random_uuid() not null,
  "booking_id" uuid,
  "filed_by" uuid not null,
  "against" uuid not null,
  "category" text default 'service'::text not null,
  "subject" text not null,
  "description" text not null,
  "status" text default 'open'::text not null,
  "priority" text default 'medium'::text,
  "admin_notes" text,
  "resolution" text,
  "resolved_by" uuid,
  "created_at" timestamp with time zone default now() not null,
  "updated_at" timestamp with time zone default now() not null,
  foreign key (booking_id) references bookings(id) on delete set null,
  primary key (id)
);

create table if not exists public."host_eligibility" (
  "id" uuid default gen_random_uuid() not null,
  "user_id" uuid not null,
  "full_name" text not null,
  "email" text not null,
  "phone" text,
  "city" text not null,
  "country_focus" text[] default '{}'::text[],
  "languages" text[] default '{}'::text[],
  "english_proficiency" text default 'basic'::text not null,
  "years_hosting" integer default 0 not null,
  "foreign_guests_hosted" integer default 0 not null,
  "has_passport" boolean default false not null,
  "has_kyc" boolean default false not null,
  "cultural_training" boolean default false not null,
  "emergency_contact" text,
  "references_count" integer default 0 not null,
  "hosting_specialties" text[] default '{}'::text[],
  "why_host" text,
  "eligibility_score" integer default 0 not null,
  "waitlist_position" integer,
  "status" text default 'pending'::text not null,
  "admin_notes" text,
  "reviewed_by" uuid,
  "reviewed_at" timestamp with time zone,
  "created_at" timestamp with time zone default now() not null,
  "updated_at" timestamp with time zone default now() not null,
  "social_links" jsonb default '{}'::jsonb not null,
  "social_score" integer default 0 not null,
  "questionnaire_score" integer default 0 not null,
  "questionnaire_answers" jsonb default '{}'::jsonb not null,
  "badge" text default 'newcomer'::text not null,
  primary key (id),
  unique (user_id)
);

create table if not exists public."invoices" (
  "id" uuid default gen_random_uuid() not null,
  "booking_id" uuid,
  "invoice_number" text not null,
  "traveler_id" uuid not null,
  "host_id" uuid,
  "amount" numeric default 0 not null,
  "tax_amount" numeric default 0 not null,
  "total_amount" numeric default 0 not null,
  "currency" text default 'INR'::text not null,
  "status" text default 'unpaid'::text not null,
  "issued_at" timestamp with time zone default now() not null,
  "paid_at" timestamp with time zone,
  "notes" text,
  "created_at" timestamp with time zone default now() not null,
  foreign key (booking_id) references bookings(id),
  unique (invoice_number),
  primary key (id)
);

create table if not exists public."messages" (
  "id" uuid default gen_random_uuid() not null,
  "sender_id" uuid not null,
  "receiver_id" uuid not null,
  "booking_id" uuid,
  "content" text not null,
  "read" boolean default false,
  "created_at" timestamp with time zone default now() not null,
  foreign key (booking_id) references bookings(id) on delete set null,
  primary key (id)
);

create table if not exists public."profiles" (
  "id" uuid not null,
  "first_name" text default ''::text not null,
  "last_name" text default ''::text,
  "email" text,
  "phone" text,
  "avatar_url" text,
  "nationality" text,
  "bio" text,
  "travel_styles" text[] default '{}'::text[],
  "interests" text[] default '{}'::text[],
  "created_at" timestamp with time zone default now() not null,
  "updated_at" timestamp with time zone default now() not null,
  "social_links" jsonb default '{}'::jsonb not null,
  foreign key (id) references auth.users(id) on delete cascade,
  primary key (id)
);

create table if not exists public."referrals" (
  "id" uuid default gen_random_uuid() not null,
  "referrer_id" uuid not null,
  "referred_id" uuid,
  "referral_code" text not null,
  "reward_points" integer default 0 not null,
  "status" text default 'pending'::text not null,
  "created_at" timestamp with time zone default now() not null,
  "redeemed_at" timestamp with time zone,
  primary key (id),
  unique (referral_code)
);

create table if not exists public."reviews" (
  "id" uuid default gen_random_uuid() not null,
  "experience_id" uuid,
  "host_id" uuid,
  "traveler_id" uuid not null,
  "rating" integer not null,
  "text" text,
  "video_url" text,
  "has_video" boolean default false,
  "created_at" timestamp with time zone default now() not null,
  foreign key (experience_id) references experiences(id),
  foreign key (host_id) references auth.users(id),
  primary key (id),
  check (((rating >= 1) and (rating <= 5))),
  foreign key (traveler_id) references auth.users(id)
);

create table if not exists public."subscription_plans" (
  "id" uuid default gen_random_uuid() not null,
  "slug" text not null,
  "name" text not null,
  "description" text,
  "price" numeric default 0 not null,
  "currency" text default 'INR'::text not null,
  "billing_cycle" text default 'monthly'::text not null,
  "badge" text,
  "features" text[] default '{}'::text[],
  "perks" jsonb default '{}'::jsonb,
  "is_active" boolean default true not null,
  "sort_order" integer default 0 not null,
  "created_at" timestamp with time zone default now() not null,
  "updated_at" timestamp with time zone default now() not null,
  primary key (id),
  unique (slug)
);

create table if not exists public."subscriptions" (
  "id" uuid default gen_random_uuid() not null,
  "user_id" uuid not null,
  "tier" subscription_tier default 'free'::subscription_tier not null,
  "starts_at" timestamp with time zone default now() not null,
  "expires_at" timestamp with time zone,
  "is_active" boolean default true not null,
  "auto_renew" boolean default false not null,
  "payment_method" text,
  "amount" numeric default 0 not null,
  "currency" text default 'INR'::text not null,
  "created_at" timestamp with time zone default now() not null,
  "updated_at" timestamp with time zone default now() not null,
  primary key (id),
  unique (user_id)
);

create table if not exists public."travel_streaks" (
  "id" uuid default gen_random_uuid() not null,
  "user_id" uuid not null,
  "month" date not null,
  "completed" boolean default false not null,
  "booking_id" uuid,
  "created_at" timestamp with time zone default now() not null,
  "updated_at" timestamp with time zone default now() not null,
  foreign key (booking_id) references bookings(id),
  primary key (id),
  unique (user_id, month)
);

create table if not exists public."traveler_stamps" (
  "id" uuid default gen_random_uuid() not null,
  "user_id" uuid not null,
  "stamp_key" text not null,
  "category" text not null,
  "tier" text default 'bronze'::text not null,
  "progress" integer default 0 not null,
  "metadata" jsonb default '{}'::jsonb not null,
  "earned_at" timestamp with time zone default now() not null,
  "created_at" timestamp with time zone default now() not null,
  "updated_at" timestamp with time zone default now() not null,
  primary key (id),
  unique (user_id, stamp_key)
);

create table if not exists public."trip_listings" (
  "id" uuid default gen_random_uuid() not null,
  "creator_id" uuid not null,
  "title" text not null,
  "description" text,
  "trip_type" text default 'road_trip'::text not null,
  "nature" text default 'adventure'::text not null,
  "route" text,
  "destination" text,
  "duration" text,
  "max_travelers" integer default 10,
  "price_model" text default 'fixed'::text not null,
  "total_price" numeric default 0 not null,
  "includes_food" boolean default false,
  "includes_stay" boolean default false,
  "includes_activities" boolean default false,
  "includes_transport" boolean default true,
  "trip_direction" text default 'round_trip'::text,
  "image_url" text,
  "highlights" text[] default '{}'::text[],
  "inclusions" text[] default '{}'::text[],
  "status" text default 'active'::text,
  "start_date" date,
  "end_date" date,
  "created_at" timestamp with time zone default now() not null,
  primary key (id)
);

create table if not exists public."trip_participants" (
  "id" uuid default gen_random_uuid() not null,
  "trip_id" uuid not null,
  "user_id" uuid not null,
  "status" text default 'interested'::text not null,
  "joined_at" timestamp with time zone default now() not null,
  primary key (id),
  foreign key (trip_id) references trip_listings(id) on delete cascade,
  unique (trip_id, user_id)
);

create table if not exists public."user_bookmarks" (
  "id" uuid default gen_random_uuid() not null,
  "user_id" uuid not null,
  "item_type" text not null,
  "item_id" uuid not null,
  "created_at" timestamp with time zone default now() not null,
  check ((item_type = any (array['post'::text, 'trip'::text, 'experience'::text]))),
  primary key (id),
  unique (user_id, item_type, item_id)
);

create table if not exists public."user_feature_flags" (
  "id" uuid default gen_random_uuid() not null,
  "user_id" uuid not null,
  "flag_key" text not null,
  "granted_by" uuid not null,
  "granted_at" timestamp with time zone default now() not null,
  primary key (id),
  unique (user_id, flag_key)
);

create table if not exists public."user_onboarding_progress" (
  "id" uuid default gen_random_uuid() not null,
  "user_id" uuid not null,
  "role" text default 'traveler'::text not null,
  "completed_steps" text[] default '{}'::text[] not null,
  "dismissed" boolean default false not null,
  "created_at" timestamp with time zone default now() not null,
  "updated_at" timestamp with time zone default now() not null,
  primary key (id),
  unique (user_id)
);

create table if not exists public."user_permissions" (
  "id" uuid default gen_random_uuid() not null,
  "user_id" uuid not null,
  "permission" text not null,
  "granted_by" uuid not null,
  "granted_at" timestamp with time zone default now() not null,
  "expires_at" timestamp with time zone,
  primary key (id),
  unique (user_id, permission)
);

create table if not exists public."user_roles" (
  "id" uuid default gen_random_uuid() not null,
  "user_id" uuid not null,
  "role" app_role not null,
  primary key (id),
  foreign key (user_id) references auth.users(id) on delete cascade,
  unique (user_id),
  unique (user_id, role)
);

create table if not exists public."wanderer_missions" (
  "id" uuid default gen_random_uuid() not null,
  "wanderer_id" uuid not null,
  "assigned_by" uuid not null,
  "title" text not null,
  "description" text,
  "destination" text not null,
  "status" text default 'assigned'::text not null,
  "deadline" date,
  "reward_points" integer default 0,
  "completed_at" timestamp with time zone,
  "created_at" timestamp with time zone default now() not null,
  "updated_at" timestamp with time zone default now() not null,
  primary key (id),
  foreign key (wanderer_id) references beta_wanderers(id) on delete cascade
);

create table if not exists public."wedding_events" (
  "id" uuid default gen_random_uuid() not null,
  "host_id" uuid not null,
  "couple_names" text not null,
  "wedding_date" date not null,
  "venue" text,
  "city" text not null,
  "description" text,
  "highlights" text[] default '{}'::text[],
  "cover_image_url" text,
  "cuisines" text[] default '{}'::text[],
  "guest_count" integer default 0,
  "contact_phone" text,
  "is_public" boolean default false not null,
  "status" text default 'upcoming'::text not null,
  "created_at" timestamp with time zone default now() not null,
  "updated_at" timestamp with time zone default now() not null,
  primary key (id)
);

-- ---------- Grants (required for the Supabase Data API) ----------
grant select, insert, update, delete on public."admin_audit_log" to authenticated;
grant all on public."admin_audit_log" to service_role;
grant select, insert, update, delete on public."app_configuration" to authenticated;
grant all on public."app_configuration" to service_role;
grant select, insert, update, delete on public."beta_waitlist" to authenticated;
grant all on public."beta_waitlist" to service_role;
grant select, insert, update, delete on public."beta_wanderers" to authenticated;
grant all on public."beta_wanderers" to service_role;
grant select, insert, update, delete on public."bookings" to authenticated;
grant all on public."bookings" to service_role;
grant select, insert, update, delete on public."email_notifications" to authenticated;
grant all on public."email_notifications" to service_role;
grant select, insert, update, delete on public."email_templates" to authenticated;
grant all on public."email_templates" to service_role;
grant select, insert, update, delete on public."experience_requests" to authenticated;
grant all on public."experience_requests" to service_role;
grant select, insert, update, delete on public."experiences" to authenticated;
grant all on public."experiences" to service_role;
grant select, insert, update, delete on public."feature_flags" to authenticated;
grant all on public."feature_flags" to service_role;
grant select, insert, update, delete on public."feed_bookmarks" to authenticated;
grant all on public."feed_bookmarks" to service_role;
grant select, insert, update, delete on public."feed_likes" to authenticated;
grant all on public."feed_likes" to service_role;
grant select, insert, update, delete on public."feed_posts" to authenticated;
grant all on public."feed_posts" to service_role;
grant select, insert, update, delete on public."grievances" to authenticated;
grant all on public."grievances" to service_role;
grant select, insert, update, delete on public."host_eligibility" to authenticated;
grant all on public."host_eligibility" to service_role;
grant select, insert, update, delete on public."invoices" to authenticated;
grant all on public."invoices" to service_role;
grant select, insert, update, delete on public."messages" to authenticated;
grant all on public."messages" to service_role;
grant select, insert, update, delete on public."profiles" to authenticated;
grant all on public."profiles" to service_role;
grant select, insert, update, delete on public."referrals" to authenticated;
grant all on public."referrals" to service_role;
grant select, insert, update, delete on public."reviews" to authenticated;
grant all on public."reviews" to service_role;
grant select, insert, update, delete on public."subscription_plans" to authenticated;
grant all on public."subscription_plans" to service_role;
grant select, insert, update, delete on public."subscriptions" to authenticated;
grant all on public."subscriptions" to service_role;
grant select, insert, update, delete on public."travel_streaks" to authenticated;
grant all on public."travel_streaks" to service_role;
grant select, insert, update, delete on public."traveler_stamps" to authenticated;
grant all on public."traveler_stamps" to service_role;
grant select, insert, update, delete on public."trip_listings" to authenticated;
grant all on public."trip_listings" to service_role;
grant select, insert, update, delete on public."trip_participants" to authenticated;
grant all on public."trip_participants" to service_role;
grant select, insert, update, delete on public."user_bookmarks" to authenticated;
grant all on public."user_bookmarks" to service_role;
grant select, insert, update, delete on public."user_feature_flags" to authenticated;
grant all on public."user_feature_flags" to service_role;
grant select, insert, update, delete on public."user_onboarding_progress" to authenticated;
grant all on public."user_onboarding_progress" to service_role;
grant select, insert, update, delete on public."user_permissions" to authenticated;
grant all on public."user_permissions" to service_role;
grant select, insert, update, delete on public."user_roles" to authenticated;
grant all on public."user_roles" to service_role;
grant select, insert, update, delete on public."wanderer_missions" to authenticated;
grant all on public."wanderer_missions" to service_role;
grant select, insert, update, delete on public."wedding_events" to authenticated;
grant all on public."wedding_events" to service_role;

-- Public read tables (adjust to taste)
grant select on public."experiences" to anon;
grant select on public."trip_listings" to anon;
grant select on public."feed_posts" to anon;
grant select on public."subscription_plans" to anon;
grant select on public."feature_flags" to anon;
grant select on public."beta_wanderers" to anon;

-- ---------- Row Level Security ----------
alter table public."admin_audit_log" enable row level security;
alter table public."app_configuration" enable row level security;
alter table public."beta_waitlist" enable row level security;
alter table public."beta_wanderers" enable row level security;
alter table public."bookings" enable row level security;
alter table public."email_notifications" enable row level security;
alter table public."email_templates" enable row level security;
alter table public."experience_requests" enable row level security;
alter table public."experiences" enable row level security;
alter table public."feature_flags" enable row level security;
alter table public."feed_bookmarks" enable row level security;
alter table public."feed_likes" enable row level security;
alter table public."feed_posts" enable row level security;
alter table public."grievances" enable row level security;
alter table public."host_eligibility" enable row level security;
alter table public."invoices" enable row level security;
alter table public."messages" enable row level security;
alter table public."profiles" enable row level security;
alter table public."referrals" enable row level security;
alter table public."reviews" enable row level security;
alter table public."subscription_plans" enable row level security;
alter table public."subscriptions" enable row level security;
alter table public."travel_streaks" enable row level security;
alter table public."traveler_stamps" enable row level security;
alter table public."trip_listings" enable row level security;
alter table public."trip_participants" enable row level security;
alter table public."user_bookmarks" enable row level security;
alter table public."user_feature_flags" enable row level security;
alter table public."user_onboarding_progress" enable row level security;
alter table public."user_permissions" enable row level security;
alter table public."user_roles" enable row level security;
alter table public."wanderer_missions" enable row level security;
alter table public."wedding_events" enable row level security;

-- ---------- Policies ----------
create policy "Admins can view audit log" on public."admin_audit_log" for select to authenticated
  using (has_role(auth.uid(), 'admin'::app_role));
create policy "Admins can insert audit log" on public."admin_audit_log" for insert to authenticated
  with check ((has_role(auth.uid(), 'admin'::app_role) AND (admin_id = auth.uid())));
create policy "Admins manage configuration" on public."app_configuration" for all to authenticated
  using (has_role(auth.uid(), 'admin'::app_role))
  with check (has_role(auth.uid(), 'admin'::app_role));
create policy "Authenticated read non-secret configuration" on public."app_configuration" for select to authenticated
  using ((is_secret = false));
create policy "Admins delete waitlist" on public."beta_waitlist" for delete to authenticated
  using (has_role(auth.uid(), 'admin'::app_role));
create policy "Admins update waitlist" on public."beta_waitlist" for update to authenticated
  using (has_role(auth.uid(), 'admin'::app_role))
  with check (has_role(auth.uid(), 'admin'::app_role));
create policy "Anyone can join waitlist" on public."beta_waitlist" for insert to anon,authenticated
  with check (((email IS NOT NULL) AND (length(email) > 3) AND (email ~~ '%@%'::text)));
create policy "Admins view waitlist" on public."beta_waitlist" for select to authenticated
  using (has_role(auth.uid(), 'admin'::app_role));
create policy "Users can apply as wanderer" on public."beta_wanderers" for insert to authenticated
  with check ((auth.uid() = user_id));
create policy "Admins can view all wanderers" on public."beta_wanderers" for select to authenticated
  using (has_role(auth.uid(), 'admin'::app_role));
create policy "Owners can view own wanderer application" on public."beta_wanderers" for select to authenticated
  using ((auth.uid() = user_id));
create policy "Admins can delete wanderers" on public."beta_wanderers" for delete to authenticated
  using (has_role(auth.uid(), 'admin'::app_role));
create policy "Users can update own application" on public."beta_wanderers" for update to authenticated
  using (((auth.uid() = user_id) OR has_role(auth.uid(), 'admin'::app_role)));
create policy "Booking parties can update" on public."bookings" for update to authenticated
  using (((auth.uid() = traveler_id) OR (auth.uid() = host_id) OR has_role(auth.uid(), 'admin'::app_role)));
create policy "Travelers can create bookings" on public."bookings" for insert to authenticated
  with check ((auth.uid() = traveler_id));
create policy "Travelers can view own bookings" on public."bookings" for select to authenticated
  using (((auth.uid() = traveler_id) OR (auth.uid() = host_id) OR has_role(auth.uid(), 'admin'::app_role)));
create policy "Users can view own notifications" on public."email_notifications" for select to authenticated
  using ((recipient_user_id = auth.uid()));
create policy "Admins manage email notifications" on public."email_notifications" for all to authenticated
  using (has_role(auth.uid(), 'admin'::app_role))
  with check (has_role(auth.uid(), 'admin'::app_role));
create policy "Admins manage email templates" on public."email_templates" for all to authenticated
  using (has_role(auth.uid(), 'admin'::app_role))
  with check (has_role(auth.uid(), 'admin'::app_role));
create policy "Admins can update requests" on public."experience_requests" for update to authenticated
  using (has_role(auth.uid(), 'admin'::app_role));
create policy "Hosts can view own requests" on public."experience_requests" for select to authenticated
  using (((auth.uid() = host_id) OR has_role(auth.uid(), 'admin'::app_role)));
create policy "Hosts can create requests" on public."experience_requests" for insert to authenticated
  with check ((auth.uid() = host_id));
create policy "Hosts can update own experiences" on public."experiences" for update to authenticated
  using (((auth.uid() = host_id) OR has_role(auth.uid(), 'admin'::app_role)));
create policy "Admins can delete experiences" on public."experiences" for delete to authenticated
  using (has_role(auth.uid(), 'admin'::app_role));
create policy "Hosts can insert experiences" on public."experiences" for insert to authenticated
  with check ((auth.uid() = host_id));
create policy "Anyone can view approved experiences" on public."experiences" for select to public
  using (((status = 'approved'::text) OR ((auth.uid() IS NOT NULL) AND (host_id = auth.uid())) OR has_role(auth.uid(), 'admin'::app_role)));
create policy "Anyone can read global flag status" on public."feature_flags" for select to anon,authenticated
  using (true);
create policy "Admins manage flags" on public."feature_flags" for all to authenticated
  using (has_role(auth.uid(), 'admin'::app_role))
  with check (has_role(auth.uid(), 'admin'::app_role));
create policy "Users unbookmark" on public."feed_bookmarks" for delete to authenticated
  using ((auth.uid() = user_id));
create policy "Users bookmark" on public."feed_bookmarks" for insert to authenticated
  with check ((auth.uid() = user_id));
create policy "Users view own bookmarks" on public."feed_bookmarks" for select to authenticated
  using ((auth.uid() = user_id));
create policy "Anyone view likes" on public."feed_likes" for select to public
  using (true);
create policy "Users like" on public."feed_likes" for insert to authenticated
  with check ((auth.uid() = user_id));
create policy "Users unlike" on public."feed_likes" for delete to authenticated
  using ((auth.uid() = user_id));
create policy "Users create own posts" on public."feed_posts" for insert to authenticated
  with check ((auth.uid() = user_id));
create policy "Anyone can view feed posts" on public."feed_posts" for select to public
  using (true);
create policy "Users update own posts" on public."feed_posts" for update to authenticated
  using (((auth.uid() = user_id) OR has_role(auth.uid(), 'admin'::app_role)));
create policy "Users delete own posts" on public."feed_posts" for delete to authenticated
  using (((auth.uid() = user_id) OR has_role(auth.uid(), 'admin'::app_role)));
create policy "Users can view own grievances" on public."grievances" for select to authenticated
  using (((auth.uid() = filed_by) OR (auth.uid() = against) OR has_role(auth.uid(), 'admin'::app_role)));
create policy "Admins can update grievances" on public."grievances" for update to authenticated
  using (has_role(auth.uid(), 'admin'::app_role));
create policy "Users can file grievances" on public."grievances" for insert to authenticated
  with check ((auth.uid() = filed_by));
create policy "Users submit own eligibility" on public."host_eligibility" for insert to authenticated
  with check ((auth.uid() = user_id));
create policy "Users view own eligibility" on public."host_eligibility" for select to authenticated
  using (((auth.uid() = user_id) OR has_role(auth.uid(), 'admin'::app_role)));
create policy "Users update own pending host application" on public."host_eligibility" for update to authenticated
  using (((auth.uid() = user_id) AND (status = ANY (ARRAY['pending'::text, 'under_review'::text, 'waitlisted'::text]))))
  with check (((auth.uid() = user_id) AND (status = ANY (ARRAY['pending'::text, 'under_review'::text, 'waitlisted'::text]))));
create policy "Admins can delete eligibility" on public."host_eligibility" for delete to authenticated
  using (has_role(auth.uid(), 'admin'::app_role));
create policy "Admins update host applications" on public."host_eligibility" for update to authenticated
  using (has_role(auth.uid(), 'admin'::app_role))
  with check (has_role(auth.uid(), 'admin'::app_role));
create policy "Admin can update invoices" on public."invoices" for update to authenticated
  using (has_role(auth.uid(), 'admin'::app_role));
create policy "Hosts and travelers can create invoices" on public."invoices" for insert to authenticated
  with check (((traveler_id = auth.uid()) OR (host_id = auth.uid()) OR has_role(auth.uid(), 'admin'::app_role)));
create policy "Users can view own invoices" on public."invoices" for select to authenticated
  using (((traveler_id = auth.uid()) OR (host_id = auth.uid()) OR has_role(auth.uid(), 'admin'::app_role)));
create policy "Users can send messages" on public."messages" for insert to authenticated
  with check ((auth.uid() = sender_id));
create policy "Users can view own messages" on public."messages" for select to authenticated
  using (((auth.uid() = sender_id) OR (auth.uid() = receiver_id)));
create policy "Users can mark messages read" on public."messages" for update to authenticated
  using ((auth.uid() = receiver_id));
create policy "Users can insert own profile" on public."profiles" for insert to authenticated
  with check ((auth.uid() = id));
create policy "Users can view own profile" on public."profiles" for select to authenticated
  using ((auth.uid() = id));
create policy "Admins can view all profiles" on public."profiles" for select to authenticated
  using (has_role(auth.uid(), 'admin'::app_role));
create policy "Users can update own profile" on public."profiles" for update to authenticated
  using ((auth.uid() = id))
  with check ((auth.uid() = id));
create policy "Admins can update referrals" on public."referrals" for update to public
  using ((has_role(auth.uid(), 'admin'::app_role) OR (referrer_id = auth.uid())));
create policy "Users can view own referrals" on public."referrals" for select to public
  using (((referrer_id = auth.uid()) OR (referred_id = auth.uid()) OR has_role(auth.uid(), 'admin'::app_role)));
create policy "Admins can delete referrals" on public."referrals" for delete to public
  using (has_role(auth.uid(), 'admin'::app_role));
create policy "Users can create referrals" on public."referrals" for insert to public
  with check ((referrer_id = auth.uid()));
create policy "Anyone can view reviews" on public."reviews" for select to public
  using (true);
create policy "Travelers can create reviews" on public."reviews" for insert to authenticated
  with check ((auth.uid() = traveler_id));
create policy "Admins manage plans" on public."subscription_plans" for all to authenticated
  using (has_role(auth.uid(), 'admin'::app_role))
  with check (has_role(auth.uid(), 'admin'::app_role));
create policy "Anyone can view active plans" on public."subscription_plans" for select to public
  using (((is_active = true) OR has_role(auth.uid(), 'admin'::app_role)));
create policy "Users can create own subscription" on public."subscriptions" for insert to authenticated
  with check ((user_id = auth.uid()));
create policy "Users can view own subscription" on public."subscriptions" for select to authenticated
  using (((user_id = auth.uid()) OR has_role(auth.uid(), 'admin'::app_role)));
create policy "Admins can delete subscriptions" on public."subscriptions" for delete to authenticated
  using (has_role(auth.uid(), 'admin'::app_role));
create policy "Users can update own subscription" on public."subscriptions" for update to authenticated
  using (((user_id = auth.uid()) OR has_role(auth.uid(), 'admin'::app_role)));
create policy "Users can view own streaks" on public."travel_streaks" for select to authenticated
  using ((user_id = auth.uid()));
create policy "Admins can manage all streaks" on public."travel_streaks" for all to authenticated
  using (has_role(auth.uid(), 'admin'::app_role));
create policy "Users can update own streaks" on public."travel_streaks" for update to authenticated
  using ((user_id = auth.uid()));
create policy "Users can insert own streaks" on public."travel_streaks" for insert to authenticated
  with check ((user_id = auth.uid()));
create policy "Users update own stamps" on public."traveler_stamps" for update to authenticated
  using (((user_id = auth.uid()) OR has_role(auth.uid(), 'admin'::app_role)));
create policy "Users insert own stamps" on public."traveler_stamps" for insert to authenticated
  with check (((user_id = auth.uid()) OR has_role(auth.uid(), 'admin'::app_role)));
create policy "Users view own stamps" on public."traveler_stamps" for select to authenticated
  using (((user_id = auth.uid()) OR has_role(auth.uid(), 'admin'::app_role)));
create policy "Admins delete stamps" on public."traveler_stamps" for delete to authenticated
  using (has_role(auth.uid(), 'admin'::app_role));
create policy "Anyone can view active trips" on public."trip_listings" for select to public
  using (((status = 'active'::text) OR ((auth.uid() IS NOT NULL) AND (creator_id = auth.uid())) OR has_role(auth.uid(), 'admin'::app_role)));
create policy "Auth users can create trips" on public."trip_listings" for insert to authenticated
  with check ((auth.uid() = creator_id));
create policy "Creators can update own trips" on public."trip_listings" for update to authenticated
  using (((auth.uid() = creator_id) OR has_role(auth.uid(), 'admin'::app_role)));
create policy "Creators can delete own trips" on public."trip_listings" for delete to authenticated
  using (((auth.uid() = creator_id) OR has_role(auth.uid(), 'admin'::app_role)));
create policy "Users can leave trips" on public."trip_participants" for delete to authenticated
  using (((user_id = auth.uid()) OR has_role(auth.uid(), 'admin'::app_role)));
create policy "Users can update own participation" on public."trip_participants" for update to authenticated
  using (((user_id = auth.uid()) OR has_role(auth.uid(), 'admin'::app_role)));
create policy "Users can join trips" on public."trip_participants" for insert to authenticated
  with check ((user_id = auth.uid()));
create policy "Participants can view own participation" on public."trip_participants" for select to authenticated
  using ((user_id = auth.uid()));
create policy "Admins can view all trip participants" on public."trip_participants" for select to authenticated
  using (has_role(auth.uid(), 'admin'::app_role));
create policy "Users insert own bookmarks2" on public."user_bookmarks" for insert to authenticated
  with check ((auth.uid() = user_id));
create policy "Users delete own bookmarks2" on public."user_bookmarks" for delete to authenticated
  using ((auth.uid() = user_id));
create policy "Users view own bookmarks2" on public."user_bookmarks" for select to authenticated
  using ((auth.uid() = user_id));
create policy "Admins manage user flags" on public."user_feature_flags" for all to authenticated
  using (has_role(auth.uid(), 'admin'::app_role))
  with check (has_role(auth.uid(), 'admin'::app_role));
create policy "Users view own flags" on public."user_feature_flags" for select to authenticated
  using (((user_id = auth.uid()) OR has_role(auth.uid(), 'admin'::app_role)));
create policy "Users insert own onboarding" on public."user_onboarding_progress" for insert to authenticated
  with check ((user_id = auth.uid()));
create policy "Users view own onboarding" on public."user_onboarding_progress" for select to authenticated
  using (((user_id = auth.uid()) OR has_role(auth.uid(), 'admin'::app_role)));
create policy "Users update own onboarding" on public."user_onboarding_progress" for update to authenticated
  using ((user_id = auth.uid()));
create policy "Users can view own permissions" on public."user_permissions" for select to authenticated
  using ((user_id = auth.uid()));
create policy "Admins can manage permissions" on public."user_permissions" for all to authenticated
  using (has_role(auth.uid(), 'admin'::app_role))
  with check (has_role(auth.uid(), 'admin'::app_role));
create policy "Only admins can insert roles" on public."user_roles" for insert to authenticated
  with check (has_role(auth.uid(), 'admin'::app_role));
create policy "Admins can manage roles" on public."user_roles" for all to authenticated
  using (has_role(auth.uid(), 'admin'::app_role))
  with check (has_role(auth.uid(), 'admin'::app_role));
create policy "Users can view own roles" on public."user_roles" for select to authenticated
  using ((auth.uid() = user_id));
create policy "Admins can manage missions" on public."wanderer_missions" for all to authenticated
  using (has_role(auth.uid(), 'admin'::app_role));
create policy "Hosts delete own weddings" on public."wedding_events" for delete to authenticated
  using (((host_id = auth.uid()) OR has_role(auth.uid(), 'admin'::app_role)));
create policy "Hosts insert own weddings" on public."wedding_events" for insert to authenticated
  with check ((host_id = auth.uid()));
create policy "Hosts update own weddings" on public."wedding_events" for update to authenticated
  using (((host_id = auth.uid()) OR has_role(auth.uid(), 'admin'::app_role)));
create policy "Public can view public weddings" on public."wedding_events" for select to public
  using (((is_public = true) OR (host_id = auth.uid()) OR has_role(auth.uid(), 'admin'::app_role)));

-- ---------- Functions ----------
CREATE OR REPLACE FUNCTION public.approve_host_application(_application_id uuid)
 RETURNS host_eligibility
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
DECLARE
  v_application public.host_eligibility%ROWTYPE;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin'::app_role) THEN
    RAISE EXCEPTION 'Only admins can approve host applications';
  END IF;

  UPDATE public.host_eligibility
  SET status = 'approved', reviewed_by = auth.uid(), reviewed_at = now(), updated_at = now()
  WHERE id = _application_id
  RETURNING * INTO v_application;

  IF v_application.id IS NULL THEN
    RAISE EXCEPTION 'Host application not found';
  END IF;

  INSERT INTO public.user_roles (user_id, role)
  VALUES (v_application.user_id, 'host'::app_role)
  ON CONFLICT (user_id, role) DO NOTHING;

  INSERT INTO public.admin_audit_log(admin_id, entity_type, entity_id, action, new_status, metadata)
  VALUES (auth.uid(), 'host_eligibility', v_application.id, 'approve', 'approved', jsonb_build_object('user_id', v_application.user_id, 'email', v_application.email));

  RETURN v_application;
END;
$function$
;
CREATE OR REPLACE FUNCTION public.confirm_beta_waitlist(_token uuid)
 RETURNS TABLE(email text, full_name text, plan_interest text, status text, confirmed_at timestamp with time zone)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  UPDATE public.beta_waitlist
    SET status = 'confirmed', confirmed_at = COALESCE(confirmed_at, now())
    WHERE confirmation_token = _token;
  RETURN QUERY
    SELECT bw.email, bw.full_name, bw.plan_interest, bw.status, bw.confirmed_at
    FROM public.beta_waitlist bw
    WHERE bw.confirmation_token = _token
    LIMIT 1;
END;
$function$
;
CREATE OR REPLACE FUNCTION public.get_public_profile(_id uuid)
 RETURNS TABLE(id uuid, first_name text, last_name text, avatar_url text, bio text, nationality text, travel_styles text[], interests text[], social_links jsonb)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT id, first_name, last_name, avatar_url, bio, nationality, travel_styles, interests, social_links
  FROM public.profiles WHERE id = _id;
$function$
;
CREATE OR REPLACE FUNCTION public.get_public_profiles(_ids uuid[])
 RETURNS TABLE(id uuid, first_name text, last_name text, avatar_url text, bio text, nationality text, travel_styles text[], interests text[], social_links jsonb)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT id, first_name, last_name, avatar_url, bio, nationality, travel_styles, interests, social_links
  FROM public.profiles WHERE id = ANY(_ids);
$function$
;
CREATE OR REPLACE FUNCTION public.get_public_wanderer(_id uuid)
 RETURNS TABLE(id uuid, user_id uuid, full_name text, city text, bio text, travel_styles text[], preferred_destinations text[], social_links jsonb, video_url text, score integer, missions_completed integer, total_videos integer, badge text, status text, created_at timestamp with time zone)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT id, user_id, full_name, city, bio, travel_styles, preferred_destinations, social_links, video_url, score, missions_completed, total_videos, badge, status, created_at
  FROM public.beta_wanderers WHERE id = _id AND status = 'approved';
$function$
;
CREATE OR REPLACE FUNCTION public.get_public_wanderers()
 RETURNS TABLE(id uuid, user_id uuid, full_name text, city text, bio text, travel_styles text[], preferred_destinations text[], social_links jsonb, video_url text, score integer, missions_completed integer, total_videos integer, badge text, status text, created_at timestamp with time zone)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT id, user_id, full_name, city, bio, travel_styles, preferred_destinations, social_links, video_url, score, missions_completed, total_videos, badge, status, created_at
  FROM public.beta_wanderers WHERE status = 'approved' ORDER BY score DESC;
$function$
;
CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.profiles (id, email, first_name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'first_name', ''))
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, COALESCE((NEW.raw_user_meta_data->>'role')::app_role, 'traveler'::app_role))
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
END;
$function$
;
CREATE OR REPLACE FUNCTION private.has_role(_user_id uuid, _role app_role)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$function$
;
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
 RETURNS boolean
 LANGUAGE sql
 STABLE
 SET search_path TO 'public', 'private'
AS $function$
  SELECT COALESCE(auth.uid() = _user_id, false) AND private.has_role(_user_id, _role)
$function$
;
CREATE OR REPLACE FUNCTION public.join_beta_waitlist(_email text, _full_name text DEFAULT NULL::text, _city text DEFAULT NULL::text, _interest text DEFAULT NULL::text, _plan_interest text DEFAULT 'explorer'::text, _referral_source text DEFAULT NULL::text, _origin text DEFAULT NULL::text)
 RETURNS TABLE(id uuid, confirmation_token uuid, email text, full_name text, plan_interest text)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_waitlist public.beta_waitlist%ROWTYPE;
  v_origin text := COALESCE(NULLIF(_origin, ''), '');
  v_plan text := COALESCE(NULLIF(lower(trim(_plan_interest)), ''), 'explorer');
BEGIN
  IF _email IS NULL OR length(trim(_email)) < 5 OR position('@' in _email) = 0 THEN
    RAISE EXCEPTION 'A valid email address is required';
  END IF;

  IF v_plan NOT IN ('explorer', 'adventurer', 'nomad') THEN
    v_plan := 'explorer';
  END IF;

  INSERT INTO public.beta_waitlist (email, full_name, city, interest, plan_interest, referral_source)
  VALUES (lower(trim(_email)), NULLIF(trim(_full_name), ''), NULLIF(trim(_city), ''), NULLIF(trim(_interest), ''), v_plan, NULLIF(trim(_referral_source), ''))
  ON CONFLICT (email) DO UPDATE
  SET full_name = COALESCE(EXCLUDED.full_name, public.beta_waitlist.full_name),
      city = COALESCE(EXCLUDED.city, public.beta_waitlist.city),
      interest = COALESCE(EXCLUDED.interest, public.beta_waitlist.interest),
      plan_interest = EXCLUDED.plan_interest,
      referral_source = COALESCE(EXCLUDED.referral_source, public.beta_waitlist.referral_source)
  RETURNING * INTO v_waitlist;

  INSERT INTO public.email_notifications (
    recipient_email,
    subject,
    template_name,
    trigger_event,
    body_html,
    payload
  ) VALUES (
    v_waitlist.email,
    'Confirm your Travelista beta spot',
    'beta_waitlist_confirm',
    'beta_waitlist_signup',
    '<p>Hi ' || COALESCE(v_waitlist.full_name, 'traveler') || ',</p>' ||
    '<p>Thanks for joining the Travelista beta waitlist! Please confirm your email to lock in your <strong>' || v_waitlist.plan_interest || '</strong> tier spot:</p>' ||
    '<p><a href="' || v_origin || '/beta-waitlist/confirm?token=' || v_waitlist.confirmation_token::text || '">Confirm my spot</a></p>' ||
    '<p>— The Travelista Team</p>',
    jsonb_build_object('waitlist_id', v_waitlist.id, 'confirmation_token', v_waitlist.confirmation_token, 'plan', v_waitlist.plan_interest)
  );

  RETURN QUERY SELECT v_waitlist.id, v_waitlist.confirmation_token, v_waitlist.email, v_waitlist.full_name, v_waitlist.plan_interest;
END;
$function$
;
CREATE OR REPLACE FUNCTION public.log_feature_flag_change()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_admin uuid := auth.uid();
BEGIN
  IF v_admin IS NULL THEN RETURN COALESCE(NEW, OLD); END IF;
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.admin_audit_log(admin_id, entity_type, entity_id, action, new_status, metadata)
    VALUES (v_admin, 'feature_flag', NEW.id, 'create', CASE WHEN NEW.enabled_globally THEN 'enabled' ELSE 'disabled' END,
            jsonb_build_object('flag_key', NEW.flag_key, 'label', NEW.label));
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO public.admin_audit_log(admin_id, entity_type, entity_id, action, previous_status, new_status, metadata)
    VALUES (v_admin, 'feature_flag', NEW.id, 'update',
            CASE WHEN OLD.enabled_globally THEN 'enabled' ELSE 'disabled' END,
            CASE WHEN NEW.enabled_globally THEN 'enabled' ELSE 'disabled' END,
            jsonb_build_object('flag_key', NEW.flag_key));
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO public.admin_audit_log(admin_id, entity_type, entity_id, action, previous_status, metadata)
    VALUES (v_admin, 'feature_flag', OLD.id, 'delete',
            CASE WHEN OLD.enabled_globally THEN 'enabled' ELSE 'disabled' END,
            jsonb_build_object('flag_key', OLD.flag_key));
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$function$
;
CREATE OR REPLACE FUNCTION public.log_user_feature_flag_change()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_admin uuid := auth.uid();
BEGIN
  IF v_admin IS NULL THEN RETURN COALESCE(NEW, OLD); END IF;
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.admin_audit_log(admin_id, entity_type, entity_id, action, new_status, metadata)
    VALUES (v_admin, 'user_feature_flag', NEW.id, 'grant', 'granted',
            jsonb_build_object('flag_key', NEW.flag_key, 'user_id', NEW.user_id));
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO public.admin_audit_log(admin_id, entity_type, entity_id, action, previous_status, metadata)
    VALUES (v_admin, 'user_feature_flag', OLD.id, 'revoke', 'granted',
            jsonb_build_object('flag_key', OLD.flag_key, 'user_id', OLD.user_id));
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$function$
;
CREATE OR REPLACE FUNCTION public.log_waitlist_confirmation()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status AND NEW.status = 'confirmed' THEN
    INSERT INTO public.admin_audit_log(admin_id, entity_type, entity_id, action, previous_status, new_status, metadata)
    VALUES (COALESCE(auth.uid(), NEW.id), 'beta_waitlist', NEW.id, 'confirm', OLD.status, NEW.status,
            jsonb_build_object('email', NEW.email, 'plan_interest', NEW.plan_interest, 'self_confirmed', auth.uid() IS NULL));
  END IF;
  RETURN NEW;
END;
$function$
;
CREATE OR REPLACE FUNCTION public.sync_feed_likes_count()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.feed_posts SET likes_count = likes_count + 1 WHERE id = NEW.post_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.feed_posts SET likes_count = GREATEST(likes_count - 1, 0) WHERE id = OLD.post_id;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$function$
;
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$
;

-- ---------- Triggers ----------
CREATE TRIGGER update_app_configuration_updated_at BEFORE UPDATE ON public.app_configuration FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_host_eligibility_updated_at BEFORE UPDATE ON public.host_eligibility FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_email_templates_updated_at BEFORE UPDATE ON public.email_templates FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_subscription_plans_updated_at BEFORE UPDATE ON public.subscription_plans FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_wedding_events_updated_at BEFORE UPDATE ON public.wedding_events FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_feature_flags_updated BEFORE UPDATE ON public.feature_flags FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER set_onboarding_updated_at BEFORE UPDATE ON public.user_onboarding_progress FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_feature_flags_audit AFTER INSERT OR DELETE OR UPDATE ON public.feature_flags FOR EACH ROW EXECUTE FUNCTION log_feature_flag_change();
CREATE TRIGGER trg_user_feature_flags_audit AFTER INSERT OR DELETE ON public.user_feature_flags FOR EACH ROW EXECUTE FUNCTION log_user_feature_flag_change();
CREATE TRIGGER trg_waitlist_confirm_audit AFTER UPDATE ON public.beta_waitlist FOR EACH ROW EXECUTE FUNCTION log_waitlist_confirmation();
CREATE TRIGGER trg_traveler_stamps_updated_at BEFORE UPDATE ON public.traveler_stamps FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_feed_posts_updated BEFORE UPDATE ON public.feed_posts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_feed_likes_count AFTER INSERT OR DELETE ON public.feed_likes FOR EACH ROW EXECUTE FUNCTION sync_feed_likes_count();

-- ---------- Storage buckets ----------
insert into storage.buckets (id,name,public) values ('avatars','avatars',true),('experience-images','experience-images',true),('trip-images','trip-images',true),('feed-media','feed-media',true) on conflict (id) do nothing;

-- ---------- Auth trigger (run last) ----------
create schema if not exists private;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
