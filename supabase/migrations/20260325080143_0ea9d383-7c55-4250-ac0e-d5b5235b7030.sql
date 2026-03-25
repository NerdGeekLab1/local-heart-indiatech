
-- Roles enum
CREATE TYPE public.app_role AS ENUM ('admin', 'host', 'traveler');

-- Profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name TEXT NOT NULL DEFAULT '',
  last_name TEXT DEFAULT '',
  email TEXT,
  phone TEXT,
  avatar_url TEXT,
  nationality TEXT,
  bio TEXT,
  travel_styles TEXT[] DEFAULT '{}',
  interests TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all profiles" ON public.profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

-- User roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role
  )
$$;

CREATE POLICY "Users can view own roles" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage roles" ON public.user_roles FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Experiences table (extended with validity, capacity, pricing, bike tours)
CREATE TABLE public.experiences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  sub_category TEXT,
  location TEXT NOT NULL,
  destination TEXT,
  price NUMERIC NOT NULL DEFAULT 0,
  duration TEXT,
  difficulty TEXT CHECK (difficulty IN ('Easy', 'Moderate', 'Hard', 'Extreme')),
  max_guests INT DEFAULT 10,
  group_size TEXT,
  includes TEXT[] DEFAULT '{}',
  highlights TEXT[] DEFAULT '{}',
  image_url TEXT,
  host_id UUID REFERENCES auth.users(id),
  host_name TEXT,
  host_city TEXT,
  rating NUMERIC DEFAULT 0,
  review_count INT DEFAULT 0,
  is_year_round BOOLEAN DEFAULT false,
  valid_from DATE,
  valid_to DATE,
  last_booking_date DATE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'suspended')),
  approved_by UUID REFERENCES auth.users(id),
  vehicle_type TEXT,
  vehicle_details JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.experiences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view approved experiences" ON public.experiences FOR SELECT USING (status = 'approved' OR (auth.uid() IS NOT NULL AND host_id = auth.uid()) OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Hosts can insert experiences" ON public.experiences FOR INSERT TO authenticated WITH CHECK (auth.uid() = host_id);
CREATE POLICY "Hosts can update own experiences" ON public.experiences FOR UPDATE TO authenticated USING (auth.uid() = host_id OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete experiences" ON public.experiences FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Bookings table
CREATE TABLE public.bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  experience_id UUID REFERENCES public.experiences(id),
  host_id UUID REFERENCES auth.users(id),
  traveler_id UUID REFERENCES auth.users(id) NOT NULL,
  services TEXT[] DEFAULT '{}',
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  guests INT DEFAULT 1,
  total_price NUMERIC NOT NULL DEFAULT 0,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
  message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Travelers can view own bookings" ON public.bookings FOR SELECT TO authenticated USING (auth.uid() = traveler_id OR auth.uid() = host_id OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Travelers can create bookings" ON public.bookings FOR INSERT TO authenticated WITH CHECK (auth.uid() = traveler_id);
CREATE POLICY "Booking parties can update" ON public.bookings FOR UPDATE TO authenticated USING (auth.uid() = traveler_id OR auth.uid() = host_id OR public.has_role(auth.uid(), 'admin'));

-- Reviews table
CREATE TABLE public.reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  experience_id UUID REFERENCES public.experiences(id),
  host_id UUID REFERENCES auth.users(id),
  traveler_id UUID REFERENCES auth.users(id) NOT NULL,
  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  text TEXT,
  video_url TEXT,
  has_video BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view reviews" ON public.reviews FOR SELECT USING (true);
CREATE POLICY "Travelers can create reviews" ON public.reviews FOR INSERT TO authenticated WITH CHECK (auth.uid() = traveler_id);

-- Experience requests from hosts (for admin approval)
CREATE TABLE public.experience_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  host_id UUID REFERENCES auth.users(id) NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  sub_category TEXT,
  location TEXT NOT NULL,
  destination TEXT,
  price NUMERIC NOT NULL DEFAULT 0,
  duration TEXT,
  difficulty TEXT,
  max_guests INT DEFAULT 10,
  includes TEXT[] DEFAULT '{}',
  highlights TEXT[] DEFAULT '{}',
  image_url TEXT,
  is_year_round BOOLEAN DEFAULT false,
  valid_from DATE,
  valid_to DATE,
  last_booking_date DATE,
  vehicle_type TEXT,
  vehicle_details JSONB,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  admin_notes TEXT,
  reviewed_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.experience_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Hosts can view own requests" ON public.experience_requests FOR SELECT TO authenticated USING (auth.uid() = host_id OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Hosts can create requests" ON public.experience_requests FOR INSERT TO authenticated WITH CHECK (auth.uid() = host_id);
CREATE POLICY "Admins can update requests" ON public.experience_requests FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, first_name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'first_name', ''));
  
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'traveler');
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
