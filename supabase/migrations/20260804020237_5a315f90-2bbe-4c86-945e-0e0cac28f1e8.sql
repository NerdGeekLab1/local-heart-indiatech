CREATE TABLE public.feed_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL REFERENCES public.feed_posts(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content text NOT NULL CHECK (char_length(content) BETWEEN 1 AND 1000),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_feed_comments_post ON public.feed_comments(post_id, created_at DESC);

GRANT SELECT ON public.feed_comments TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.feed_comments TO authenticated;
GRANT ALL ON public.feed_comments TO service_role;

ALTER TABLE public.feed_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Comments on active posts are viewable"
  ON public.feed_comments FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.feed_posts p WHERE p.id = post_id AND p.status = 'active'));

CREATE POLICY "Users can add their own comments"
  ON public.feed_comments FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can edit their own comments"
  ON public.feed_comments FOR UPDATE TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comments"
  ON public.feed_comments FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can delete any comment"
  ON public.feed_comments FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_feed_comments_updated_at
  BEFORE UPDATE ON public.feed_comments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.host_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  full_name text NOT NULL,
  email text NOT NULL,
  phone text NOT NULL,
  city text NOT NULL,
  state text NOT NULL,
  services text[] NOT NULL DEFAULT '{}',
  languages text[] NOT NULL DEFAULT '{}',
  specialties text[] NOT NULL DEFAULT '{}',
  tagline text,
  bio text,
  price_per_day numeric,
  homestay_details jsonb NOT NULL DEFAULT '{}'::jsonb,
  transport_details jsonb NOT NULL DEFAULT '{}'::jsonb,
  food_details jsonb NOT NULL DEFAULT '{}'::jsonb,
  photos text[] NOT NULL DEFAULT '{}',
  status text NOT NULL DEFAULT 'pending',
  admin_notes text,
  reviewed_by uuid,
  reviewed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT INSERT ON public.host_applications TO anon;
GRANT SELECT, INSERT ON public.host_applications TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.host_applications TO authenticated;
GRANT ALL ON public.host_applications TO service_role;

ALTER TABLE public.host_applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit a host application"
  ON public.host_applications FOR INSERT TO anon, authenticated
  WITH CHECK (user_id IS NULL OR auth.uid() = user_id);

CREATE POLICY "Applicants can view their own application"
  ON public.host_applications FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all host applications"
  ON public.host_applications FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update host applications"
  ON public.host_applications FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete host applications"
  ON public.host_applications FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_host_applications_updated_at
  BEFORE UPDATE ON public.host_applications
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();