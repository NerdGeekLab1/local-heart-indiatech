
-- Feed posts
CREATE TABLE public.feed_posts (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  media_url text NOT NULL,
  media_type text NOT NULL DEFAULT 'image',
  caption text,
  tag_type text,
  tag_value text,
  location text,
  likes_count integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.feed_posts TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.feed_posts TO authenticated;
GRANT ALL ON public.feed_posts TO service_role;

ALTER TABLE public.feed_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view feed posts" ON public.feed_posts FOR SELECT USING (true);
CREATE POLICY "Users create own posts" ON public.feed_posts FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own posts" ON public.feed_posts FOR UPDATE TO authenticated USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Users delete own posts" ON public.feed_posts FOR DELETE TO authenticated USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER trg_feed_posts_updated BEFORE UPDATE ON public.feed_posts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Feed likes
CREATE TABLE public.feed_likes (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id uuid NOT NULL REFERENCES public.feed_posts(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (post_id, user_id)
);

GRANT SELECT ON public.feed_likes TO anon;
GRANT SELECT, INSERT, DELETE ON public.feed_likes TO authenticated;
GRANT ALL ON public.feed_likes TO service_role;

ALTER TABLE public.feed_likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone view likes" ON public.feed_likes FOR SELECT USING (true);
CREATE POLICY "Users like" ON public.feed_likes FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users unlike" ON public.feed_likes FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Sync likes_count
CREATE OR REPLACE FUNCTION public.sync_feed_likes_count()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.feed_posts SET likes_count = likes_count + 1 WHERE id = NEW.post_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.feed_posts SET likes_count = GREATEST(likes_count - 1, 0) WHERE id = OLD.post_id;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$;

CREATE TRIGGER trg_feed_likes_count AFTER INSERT OR DELETE ON public.feed_likes FOR EACH ROW EXECUTE FUNCTION public.sync_feed_likes_count();

-- Storage bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('feed-media', 'feed-media', true) ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Feed media public read" ON storage.objects FOR SELECT USING (bucket_id = 'feed-media');
CREATE POLICY "Feed media auth upload" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'feed-media' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Feed media own delete" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'feed-media' AND auth.uid()::text = (storage.foldername(name))[1]);
