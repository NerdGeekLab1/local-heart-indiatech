
CREATE TABLE public.beta_wanderers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  full_name text NOT NULL,
  email text NOT NULL,
  phone text,
  city text NOT NULL,
  bio text,
  travel_styles text[] DEFAULT '{}'::text[],
  preferred_destinations text[] DEFAULT '{}'::text[],
  social_links jsonb DEFAULT '{}'::jsonb,
  video_url text,
  status text NOT NULL DEFAULT 'pending',
  score integer DEFAULT 0,
  missions_completed integer DEFAULT 0,
  total_videos integer DEFAULT 0,
  badge text DEFAULT 'explorer',
  admin_notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.beta_wanderers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view approved wanderers" ON public.beta_wanderers
  FOR SELECT TO public
  USING (status = 'approved' OR (auth.uid() IS NOT NULL AND user_id = auth.uid()) OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can apply as wanderer" ON public.beta_wanderers
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own application" ON public.beta_wanderers
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete wanderers" ON public.beta_wanderers
  FOR DELETE TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));
