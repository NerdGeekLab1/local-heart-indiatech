ALTER TABLE public.destination_sites ADD COLUMN IF NOT EXISTS is_published boolean NOT NULL DEFAULT true;

CREATE TABLE public.destination_drafts (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  destination_id uuid NOT NULL REFERENCES public.destinations(id) ON DELETE CASCADE,
  site_id uuid REFERENCES public.destination_sites(id) ON DELETE CASCADE,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  note text,
  updated_by uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX destination_drafts_unique_target
  ON public.destination_drafts (destination_id, site_id) NULLS NOT DISTINCT;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.destination_drafts TO authenticated;
GRANT ALL ON public.destination_drafts TO service_role;

ALTER TABLE public.destination_drafts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage destination drafts"
ON public.destination_drafts FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_destination_drafts_updated_at
BEFORE UPDATE ON public.destination_drafts
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP POLICY IF EXISTS "Destination sites are viewable by everyone" ON public.destination_sites;
CREATE POLICY "Destination sites are viewable by everyone"
ON public.destination_sites FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.destinations d
  WHERE d.id = destination_sites.destination_id
    AND ((d.is_published AND destination_sites.is_published) OR public.has_role(auth.uid(), 'admin'))
));