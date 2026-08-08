CREATE OR REPLACE FUNCTION public.approve_host_application(_application_id uuid)
RETURNS public.host_eligibility
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_application public.host_eligibility%ROWTYPE;
  v_previous_status text;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin'::public.app_role) THEN
    RAISE EXCEPTION 'Only admins can approve host applications';
  END IF;

  SELECT * INTO v_application
  FROM public.host_eligibility
  WHERE id = _application_id
  FOR UPDATE;

  IF v_application.id IS NULL THEN
    RAISE EXCEPTION 'Host application not found';
  END IF;

  v_previous_status := v_application.status;

  UPDATE public.host_eligibility
  SET status = 'approved',
      reviewed_by = auth.uid(),
      reviewed_at = now(),
      updated_at = now()
  WHERE id = _application_id
  RETURNING * INTO v_application;

  INSERT INTO public.user_roles (user_id, role)
  VALUES (v_application.user_id, 'host'::public.app_role)
  ON CONFLICT (user_id) DO UPDATE SET role = EXCLUDED.role;

  INSERT INTO public.admin_audit_log
    (admin_id, entity_type, entity_id, action, previous_status, new_status, metadata)
  VALUES
    (auth.uid(), 'host_eligibility', v_application.id, 'approve',
     v_previous_status, 'approved',
     jsonb_build_object('user_id', v_application.user_id, 'email', v_application.email));

  RETURN v_application;
END;
$$;

REVOKE ALL ON FUNCTION public.approve_host_application(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.approve_host_application(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.approve_host_application(uuid) TO service_role;