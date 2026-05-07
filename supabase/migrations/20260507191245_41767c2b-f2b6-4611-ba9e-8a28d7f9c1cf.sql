-- subscription_plans
CREATE TABLE public.subscription_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'INR',
  billing_cycle TEXT NOT NULL DEFAULT 'monthly',
  badge TEXT,
  features TEXT[] DEFAULT '{}',
  perks JSONB DEFAULT '{}'::jsonb,
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active plans" ON public.subscription_plans
  FOR SELECT USING (is_active = true OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins manage plans" ON public.subscription_plans
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER update_subscription_plans_updated_at
  BEFORE UPDATE ON public.subscription_plans
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.subscription_plans (slug, name, description, price, badge, features, sort_order, perks) VALUES
  ('free', 'Free', 'Get started with basic travel features', 0, NULL,
   ARRAY['Browse all experiences','Book trips with hosts','Community access','Basic travel streaks','Standard support'],
   1, '{"discount_percent":0,"free_cancellations":0}'::jsonb),
  ('explorer', 'Explorer', 'Unlock deals and priority booking', 499, 'Popular',
   ARRAY['Everything in Free','5% discount on all bookings','Priority booking access','Exclusive travel deals','AI trip recommendations','Beta Wanderer eligibility','Priority support'],
   2, '{"discount_percent":5,"free_cancellations":0}'::jsonb),
  ('adventurer', 'Adventurer', 'Premium perks for serious travelers', 999, 'Best Value',
   ARRAY['Everything in Explorer','10% discount on all bookings','Early access to new experiences','Free trip cancellation (1/month)','Exclusive host meetups','Wanderer mission priority','Dedicated travel concierge'],
   3, '{"discount_percent":10,"free_cancellations":1}'::jsonb),
  ('nomad', 'Nomad', 'The ultimate membership for digital nomads', 1999, 'Elite',
   ARRAY['Everything in Adventurer','15% discount on all bookings','Unlimited free cancellations','VIP host experiences','Co-working space partners','Annual travel retreat invite','Personal travel planner','Airport lounge access (select cities)'],
   4, '{"discount_percent":15,"free_cancellations":-1}'::jsonb);

-- wedding_events
CREATE TABLE public.wedding_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  host_id UUID NOT NULL,
  couple_names TEXT NOT NULL,
  wedding_date DATE NOT NULL,
  venue TEXT,
  city TEXT NOT NULL,
  description TEXT,
  highlights TEXT[] DEFAULT '{}',
  cover_image_url TEXT,
  cuisines TEXT[] DEFAULT '{}',
  guest_count INTEGER DEFAULT 0,
  contact_phone TEXT,
  is_public BOOLEAN NOT NULL DEFAULT false,
  status TEXT NOT NULL DEFAULT 'upcoming',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.wedding_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view public weddings" ON public.wedding_events
  FOR SELECT USING (is_public = true OR host_id = auth.uid() OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Hosts insert own weddings" ON public.wedding_events
  FOR INSERT TO authenticated
  WITH CHECK (host_id = auth.uid());

CREATE POLICY "Hosts update own weddings" ON public.wedding_events
  FOR UPDATE TO authenticated
  USING (host_id = auth.uid() OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Hosts delete own weddings" ON public.wedding_events
  FOR DELETE TO authenticated
  USING (host_id = auth.uid() OR has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER update_wedding_events_updated_at
  BEFORE UPDATE ON public.wedding_events
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_wedding_events_host ON public.wedding_events(host_id);
CREATE INDEX idx_wedding_events_date ON public.wedding_events(wedding_date);