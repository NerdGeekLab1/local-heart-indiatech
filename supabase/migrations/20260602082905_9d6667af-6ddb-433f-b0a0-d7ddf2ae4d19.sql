CREATE TABLE public.user_bookmarks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  item_type text NOT NULL CHECK (item_type IN ('post','trip','experience')),
  item_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, item_type, item_id)
);

GRANT SELECT, INSERT, DELETE ON public.user_bookmarks TO authenticated;
GRANT ALL ON public.user_bookmarks TO service_role;

ALTER TABLE public.user_bookmarks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own bookmarks2" ON public.user_bookmarks FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users insert own bookmarks2" ON public.user_bookmarks FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users delete own bookmarks2" ON public.user_bookmarks FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE INDEX user_bookmarks_user_idx ON public.user_bookmarks(user_id, item_type);