
-- 1. Tighten waitlist insert (no more `true`)
DROP POLICY IF EXISTS "Anyone can join waitlist" ON public.beta_waitlist;
CREATE POLICY "Anyone can join waitlist"
  ON public.beta_waitlist FOR INSERT
  TO anon, authenticated
  WITH CHECK (email IS NOT NULL AND length(email) > 3 AND email LIKE '%@%');

-- 2. Trigger function should not need SECURITY DEFINER
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- 3. Lock down handle_new_user (only auth trigger needs to call it)
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;

-- 4. Storage: remove broad listing policies on public buckets
DROP POLICY IF EXISTS "Avatar images are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Experience images are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Trip images are publicly accessible" ON storage.objects;

-- 5. Audit logging triggers ----------------------------------------------------
CREATE OR REPLACE FUNCTION public.log_feature_flag_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_admin uuid := auth.uid();
BEGIN
  IF v_admin IS NULL THEN RETURN COALESCE(NEW, OLD); END IF;
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.admin_audit_log(admin_id, entity_type, entity_id, action, new_status, metadata)
    VALUES (v_admin, 'feature_flag', NEW.id, 'create', CASE WHEN NEW.enabled_globally THEN 'enabled' ELSE 'disabled' END,
            jsonb_build_object('flag_key', NEW.flag_key, 'label', NEW.label));
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO public.admin_audit_log(admin_id, entity_type, entity_id, action, previous_status, new_status, metadata)
    VALUES (v_admin, 'feature_flag', NEW.id, 'update',
            CASE WHEN OLD.enabled_globally THEN 'enabled' ELSE 'disabled' END,
            CASE WHEN NEW.enabled_globally THEN 'enabled' ELSE 'disabled' END,
            jsonb_build_object('flag_key', NEW.flag_key));
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO public.admin_audit_log(admin_id, entity_type, entity_id, action, previous_status, metadata)
    VALUES (v_admin, 'feature_flag', OLD.id, 'delete',
            CASE WHEN OLD.enabled_globally THEN 'enabled' ELSE 'disabled' END,
            jsonb_build_object('flag_key', OLD.flag_key));
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$;

DROP TRIGGER IF EXISTS trg_feature_flags_audit ON public.feature_flags;
CREATE TRIGGER trg_feature_flags_audit
AFTER INSERT OR UPDATE OR DELETE ON public.feature_flags
FOR EACH ROW EXECUTE FUNCTION public.log_feature_flag_change();

CREATE OR REPLACE FUNCTION public.log_user_feature_flag_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_admin uuid := auth.uid();
BEGIN
  IF v_admin IS NULL THEN RETURN COALESCE(NEW, OLD); END IF;
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.admin_audit_log(admin_id, entity_type, entity_id, action, new_status, metadata)
    VALUES (v_admin, 'user_feature_flag', NEW.id, 'grant', 'granted',
            jsonb_build_object('flag_key', NEW.flag_key, 'user_id', NEW.user_id));
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO public.admin_audit_log(admin_id, entity_type, entity_id, action, previous_status, metadata)
    VALUES (v_admin, 'user_feature_flag', OLD.id, 'revoke', 'granted',
            jsonb_build_object('flag_key', OLD.flag_key, 'user_id', OLD.user_id));
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$;

DROP TRIGGER IF EXISTS trg_user_feature_flags_audit ON public.user_feature_flags;
CREATE TRIGGER trg_user_feature_flags_audit
AFTER INSERT OR DELETE ON public.user_feature_flags
FOR EACH ROW EXECUTE FUNCTION public.log_user_feature_flag_change();

CREATE OR REPLACE FUNCTION public.log_waitlist_confirmation()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status AND NEW.status = 'confirmed' THEN
    INSERT INTO public.admin_audit_log(admin_id, entity_type, entity_id, action, previous_status, new_status, metadata)
    VALUES (COALESCE(auth.uid(), NEW.id), 'beta_waitlist', NEW.id, 'confirm', OLD.status, NEW.status,
            jsonb_build_object('email', NEW.email, 'plan_interest', NEW.plan_interest, 'self_confirmed', auth.uid() IS NULL));
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_waitlist_confirm_audit ON public.beta_waitlist;
CREATE TRIGGER trg_waitlist_confirm_audit
AFTER UPDATE ON public.beta_waitlist
FOR EACH ROW EXECUTE FUNCTION public.log_waitlist_confirmation();

-- Allow audit-log INSERT for these triggers even when admin_id is set by trigger context
-- (admin policy already restricts SELECT/INSERT to admins; trigger uses SECURITY DEFINER so it bypasses RLS for its own insert)
