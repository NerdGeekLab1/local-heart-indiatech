-- Email templates for host application lifecycle
INSERT INTO public.email_templates (name, category, subject, body_html, body_text, variables, is_active, description)
VALUES
 ('host_eligibility_received', 'host', 'We received your Travelista host application',
  '<p>Hi {{full_name}},</p><p>Thanks for applying to the <strong>Host Foreign Travelers</strong> program. Your eligibility score is <strong>{{score}}/100</strong> and your application status is <strong>{{status}}</strong>.</p><p>Our trust team reviews applications within 48 hours. You can boost your score any time by completing the credibility quiz.</p><p>— The Travelista Team</p>',
  'Thanks for applying to the Host Foreign Travelers program. Score: {{score}}/100. Status: {{status}}.',
  ARRAY['full_name','score','status'], true, 'Sent automatically when a foreign-traveler host application is submitted'),
 ('host_eligibility_approved', 'host', 'You are approved as a Travelista global host 🎉',
  '<p>Hi {{full_name}},</p><p>Congratulations — your <strong>Host Foreign Travelers</strong> application has been approved. Your host dashboard is now unlocked.</p><p>Sign in and complete your listings to start receiving international guests.</p><p>— The Travelista Team</p>',
  'Congratulations, your Host Foreign Travelers application has been approved.',
  ARRAY['full_name'], true, 'Sent automatically when an admin approves a foreign-traveler host application'),
 ('host_application_received', 'host', 'Your Travelista host profile is under review',
  '<p>Hi {{full_name}},</p><p>We received your host profile from {{city}}. Our team is verifying your homestay, transport and food details.</p><p>You will hear from us within 48 hours.</p><p>— The Travelista Team</p>',
  'We received your host profile from {{city}}. Verification takes up to 48 hours.',
  ARRAY['full_name','city'], true, 'Sent automatically when a Become a Host profile is submitted'),
 ('host_application_verified', 'host', 'Your Travelista host profile is verified ✅',
  '<p>Hi {{full_name}},</p><p>Your host profile has been verified and is now live on Travelista.</p><p>— The Travelista Team</p>',
  'Your host profile has been verified and is now live.',
  ARRAY['full_name'], true, 'Sent automatically when an admin verifies a host profile application')
ON CONFLICT DO NOTHING;

-- Queue emails for host_eligibility submissions and approvals
CREATE OR REPLACE FUNCTION public.notify_host_eligibility_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.email_notifications (template_name, recipient_email, recipient_user_id, subject, body_html, trigger_event, payload)
    VALUES ('host_eligibility_received', NEW.email, NEW.user_id,
      'We received your Travelista host application',
      '<p>Hi ' || COALESCE(NEW.full_name, 'there') || ',</p><p>Thanks for applying to the <strong>Host Foreign Travelers</strong> program. Your eligibility score is <strong>' || NEW.eligibility_score || '/100</strong> and your status is <strong>' || NEW.status || '</strong>.</p><p>Our trust team reviews applications within 48 hours.</p><p>— The Travelista Team</p>',
      'host_eligibility_submitted',
      jsonb_build_object('application_id', NEW.id, 'score', NEW.eligibility_score, 'status', NEW.status));
  ELSIF TG_OP = 'UPDATE' AND NEW.status = 'approved' AND OLD.status IS DISTINCT FROM 'approved' THEN
    INSERT INTO public.email_notifications (template_name, recipient_email, recipient_user_id, subject, body_html, trigger_event, payload)
    VALUES ('host_eligibility_approved', NEW.email, NEW.user_id,
      'You are approved as a Travelista global host',
      '<p>Hi ' || COALESCE(NEW.full_name, 'there') || ',</p><p>Congratulations — your <strong>Host Foreign Travelers</strong> application has been approved. Your host dashboard is now unlocked.</p><p>— The Travelista Team</p>',
      'host_eligibility_approved',
      jsonb_build_object('application_id', NEW.id));
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_host_eligibility_emails ON public.host_eligibility;
CREATE TRIGGER trg_host_eligibility_emails
AFTER INSERT OR UPDATE ON public.host_eligibility
FOR EACH ROW EXECUTE FUNCTION public.notify_host_eligibility_change();

-- Queue emails for become-a-host profile submissions and verification
CREATE OR REPLACE FUNCTION public.notify_host_application_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.email_notifications (template_name, recipient_email, recipient_user_id, subject, body_html, trigger_event, payload)
    VALUES ('host_application_received', NEW.email, NEW.user_id,
      'Your Travelista host profile is under review',
      '<p>Hi ' || COALESCE(NEW.full_name, 'there') || ',</p><p>We received your host profile from ' || COALESCE(NEW.city, 'India') || '. Our team is verifying your details and will get back within 48 hours.</p><p>— The Travelista Team</p>',
      'host_application_submitted',
      jsonb_build_object('application_id', NEW.id, 'city', NEW.city));
  ELSIF TG_OP = 'UPDATE' AND NEW.status IN ('verified', 'approved') AND OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO public.email_notifications (template_name, recipient_email, recipient_user_id, subject, body_html, trigger_event, payload)
    VALUES ('host_application_verified', NEW.email, NEW.user_id,
      'Your Travelista host profile is verified',
      '<p>Hi ' || COALESCE(NEW.full_name, 'there') || ',</p><p>Your host profile has been verified and is now live on Travelista.</p><p>— The Travelista Team</p>',
      'host_application_verified',
      jsonb_build_object('application_id', NEW.id, 'status', NEW.status));
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_host_application_emails ON public.host_applications;
CREATE TRIGGER trg_host_application_emails
AFTER INSERT OR UPDATE ON public.host_applications
FOR EACH ROW EXECUTE FUNCTION public.notify_host_application_change();