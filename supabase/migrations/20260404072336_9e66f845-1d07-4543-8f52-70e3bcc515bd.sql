
-- Wanderer missions table
CREATE TABLE public.wanderer_missions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  wanderer_id uuid NOT NULL REFERENCES public.beta_wanderers(id) ON DELETE CASCADE,
  assigned_by uuid NOT NULL,
  title text NOT NULL,
  description text,
  destination text NOT NULL,
  status text NOT NULL DEFAULT 'assigned',
  deadline date,
  reward_points integer DEFAULT 0,
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.wanderer_missions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage missions" ON public.wanderer_missions FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Wanderers can view own missions" ON public.wanderer_missions FOR SELECT TO authenticated
  USING (wanderer_id IN (SELECT id FROM public.beta_wanderers WHERE user_id = auth.uid()));

CREATE POLICY "Wanderers can update own missions" ON public.wanderer_missions FOR UPDATE TO authenticated
  USING (wanderer_id IN (SELECT id FROM public.beta_wanderers WHERE user_id = auth.uid()));

-- Invoices table
CREATE TABLE public.invoices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id uuid REFERENCES public.bookings(id),
  invoice_number text NOT NULL UNIQUE,
  traveler_id uuid NOT NULL,
  host_id uuid,
  amount numeric NOT NULL DEFAULT 0,
  tax_amount numeric NOT NULL DEFAULT 0,
  total_amount numeric NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'INR',
  status text NOT NULL DEFAULT 'unpaid',
  issued_at timestamptz NOT NULL DEFAULT now(),
  paid_at timestamptz,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own invoices" ON public.invoices FOR SELECT TO authenticated
  USING (traveler_id = auth.uid() OR host_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "System can create invoices" ON public.invoices FOR INSERT TO authenticated
  WITH CHECK (traveler_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admin can update invoices" ON public.invoices FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- User permissions/ACL table
CREATE TABLE public.user_permissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  permission text NOT NULL,
  granted_by uuid NOT NULL,
  granted_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz,
  UNIQUE(user_id, permission)
);

ALTER TABLE public.user_permissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage permissions" ON public.user_permissions FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can view own permissions" ON public.user_permissions FOR SELECT TO authenticated
  USING (user_id = auth.uid());
