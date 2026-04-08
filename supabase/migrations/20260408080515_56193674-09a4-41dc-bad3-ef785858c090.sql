
CREATE TABLE public.travel_streaks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  month DATE NOT NULL,
  completed BOOLEAN NOT NULL DEFAULT false,
  booking_id UUID REFERENCES public.bookings(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, month)
);

ALTER TABLE public.travel_streaks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own streaks" ON public.travel_streaks
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own streaks" ON public.travel_streaks
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own streaks" ON public.travel_streaks
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Admins can manage all streaks" ON public.travel_streaks
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
