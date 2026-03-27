
-- Messages table for real-time chat
CREATE TABLE public.messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_id UUID NOT NULL,
  receiver_id UUID NOT NULL,
  booking_id UUID REFERENCES public.bookings(id) ON DELETE SET NULL,
  content TEXT NOT NULL,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own messages" ON public.messages
  FOR SELECT TO authenticated
  USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

CREATE POLICY "Users can send messages" ON public.messages
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Users can mark messages read" ON public.messages
  FOR UPDATE TO authenticated
  USING (auth.uid() = receiver_id);

-- Enable realtime for messages
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;

-- Grievances / Dispute Resolution
CREATE TABLE public.grievances (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  booking_id UUID REFERENCES public.bookings(id) ON DELETE SET NULL,
  filed_by UUID NOT NULL,
  against UUID NOT NULL,
  category TEXT NOT NULL DEFAULT 'service',
  subject TEXT NOT NULL,
  description TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open',
  priority TEXT DEFAULT 'medium',
  admin_notes TEXT,
  resolution TEXT,
  resolved_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.grievances ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own grievances" ON public.grievances
  FOR SELECT TO authenticated
  USING (auth.uid() = filed_by OR auth.uid() = against OR has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can file grievances" ON public.grievances
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = filed_by);

CREATE POLICY "Admins can update grievances" ON public.grievances
  FOR UPDATE TO authenticated
  USING (has_role(auth.uid(), 'admin'));

-- Trip Listings (traveler-hosted trips)
CREATE TABLE public.trip_listings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  creator_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  trip_type TEXT NOT NULL DEFAULT 'road_trip',
  nature TEXT NOT NULL DEFAULT 'adventure',
  route TEXT,
  destination TEXT,
  duration TEXT,
  max_travelers INTEGER DEFAULT 10,
  price_model TEXT NOT NULL DEFAULT 'fixed',
  total_price NUMERIC NOT NULL DEFAULT 0,
  includes_food BOOLEAN DEFAULT false,
  includes_stay BOOLEAN DEFAULT false,
  includes_activities BOOLEAN DEFAULT false,
  includes_transport BOOLEAN DEFAULT true,
  trip_direction TEXT DEFAULT 'round_trip',
  image_url TEXT,
  highlights TEXT[] DEFAULT '{}',
  inclusions TEXT[] DEFAULT '{}',
  status TEXT DEFAULT 'active',
  start_date DATE,
  end_date DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.trip_listings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active trips" ON public.trip_listings
  FOR SELECT USING (status = 'active' OR (auth.uid() IS NOT NULL AND creator_id = auth.uid()) OR has_role(auth.uid(), 'admin'));

CREATE POLICY "Auth users can create trips" ON public.trip_listings
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "Creators can update own trips" ON public.trip_listings
  FOR UPDATE TO authenticated
  USING (auth.uid() = creator_id OR has_role(auth.uid(), 'admin'));

CREATE POLICY "Creators can delete own trips" ON public.trip_listings
  FOR DELETE TO authenticated
  USING (auth.uid() = creator_id OR has_role(auth.uid(), 'admin'));
