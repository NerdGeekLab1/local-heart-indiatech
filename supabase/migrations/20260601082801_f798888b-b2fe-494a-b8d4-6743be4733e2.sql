ALTER TABLE public.feed_posts
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'active',
  ADD COLUMN IF NOT EXISTS removed_reason text,
  ADD COLUMN IF NOT EXISTS removed_by uuid,
  ADD COLUMN IF NOT EXISTS removed_at timestamptz;

CREATE TABLE IF NOT EXISTS public.feed_bookmarks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  post_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, post_id)
);

GRANT SELECT, INSERT, DELETE ON public.feed_bookmarks TO authenticated;
GRANT ALL ON public.feed_bookmarks TO service_role;

ALTER TABLE public.feed_bookmarks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own bookmarks" ON public.feed_bookmarks
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users bookmark" ON public.feed_bookmarks
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users unbookmark" ON public.feed_bookmarks
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Admin policy to update feed posts is already covered via existing UPDATE policy (auth.uid()=user_id OR admin).
