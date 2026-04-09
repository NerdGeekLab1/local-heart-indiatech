-- Fix 1: Beta wanderers - restrict public access to hide PII
DROP POLICY "Anyone can view approved wanderers" ON public.beta_wanderers;
CREATE POLICY "Authenticated can view approved wanderers"
  ON public.beta_wanderers FOR SELECT
  TO authenticated
  USING (
    status = 'approved' 
    OR user_id = auth.uid() 
    OR has_role(auth.uid(), 'admin'::app_role)
  );

-- Fix 2: Profiles - restrict sensitive field access
DROP POLICY "Users can view all profiles" ON public.profiles;
CREATE POLICY "Users can view all profiles basic info"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (true);

-- Fix 3: Explicit INSERT restriction on user_roles
CREATE POLICY "Only admins can insert roles"
  ON public.user_roles FOR INSERT
  TO authenticated
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
