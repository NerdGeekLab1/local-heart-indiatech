
CREATE TABLE public.email_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  category TEXT NOT NULL DEFAULT 'custom',
  subject TEXT NOT NULL,
  body_html TEXT NOT NULL,
  body_text TEXT,
  variables TEXT[] DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT true,
  description TEXT,
  created_by UUID,
  updated_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.email_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage email templates" ON public.email_templates
FOR ALL TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER update_email_templates_updated_at
BEFORE UPDATE ON public.email_templates
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.email_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID REFERENCES public.email_templates(id) ON DELETE SET NULL,
  template_name TEXT,
  recipient_email TEXT NOT NULL,
  recipient_user_id UUID,
  subject TEXT NOT NULL,
  body_html TEXT,
  payload JSONB DEFAULT '{}'::jsonb,
  status TEXT NOT NULL DEFAULT 'queued',
  trigger_event TEXT,
  sent_by UUID,
  sent_at TIMESTAMPTZ,
  error TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.email_notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage email notifications" ON public.email_notifications
FOR ALL TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can view own notifications" ON public.email_notifications
FOR SELECT TO authenticated
USING (recipient_user_id = auth.uid());

INSERT INTO public.email_templates (name, category, subject, body_html, body_text, variables, description) VALUES
('Welcome Email', 'welcome', 'Welcome to Travelista, {{first_name}}! 🇮🇳',
 '<h1>Namaste {{first_name}}!</h1><p>Welcome to Travelista — discover authentic India through local hosts.</p><p><a href="{{dashboard_url}}">Open your dashboard</a></p>',
 'Namaste {{first_name}}! Welcome to Travelista. Open your dashboard: {{dashboard_url}}',
 ARRAY['first_name','dashboard_url'], 'Sent right after signup'),
('Verify Email', 'verify_email', 'Verify your Travelista email',
 '<h1>Hi {{first_name}},</h1><p>Please confirm your email by clicking the link below:</p><p><a href="{{verification_url}}">Verify Email</a></p>',
 'Verify your email: {{verification_url}}',
 ARRAY['first_name','verification_url'], 'Email verification link'),
('Booking Confirmed', 'booking_confirmed', 'Your trip is confirmed! ✈️ {{destination}}',
 '<h1>Booking Confirmed</h1><p>Hi {{first_name}}, your booking with <b>{{host_name}}</b> in {{destination}} is confirmed for {{start_date}} – {{end_date}}.</p><p>Total: ₹{{total_price}}</p>',
 'Booking confirmed with {{host_name}} in {{destination}} on {{start_date}}.',
 ARRAY['first_name','host_name','destination','start_date','end_date','total_price'], 'When a booking is confirmed by host'),
('Booking Pending', 'booking_pending', 'We received your booking request',
 '<h1>Request Received</h1><p>Hi {{first_name}}, your booking request for {{destination}} is pending host approval. We will notify you within 24 hours.</p>',
 'Booking request received for {{destination}}.',
 ARRAY['first_name','destination'], 'Booking request acknowledgement'),
('Invoice Issued', 'invoice', 'Invoice {{invoice_number}} from Travelista',
 '<h1>Invoice {{invoice_number}}</h1><p>Amount: ₹{{amount}}<br/>Tax (18%): ₹{{tax_amount}}<br/>Total: <b>₹{{total_amount}}</b></p><p><a href="{{invoice_url}}">View invoice</a></p>',
 'Invoice {{invoice_number}}: Total ₹{{total_amount}}',
 ARRAY['invoice_number','amount','tax_amount','total_amount','invoice_url'], 'Invoice generation'),
('Password Reset', 'password_reset', 'Reset your Travelista password',
 '<h1>Reset Password</h1><p>Click below to reset your password. This link expires in 1 hour.</p><p><a href="{{reset_url}}">Reset Password</a></p>',
 'Reset link: {{reset_url}}',
 ARRAY['reset_url'], 'Password reset request'),
('Trip Reminder', 'trip_reminder', 'Your trip to {{destination}} starts in 3 days! 🎒',
 '<h1>Get Ready, {{first_name}}!</h1><p>Your trip to {{destination}} with {{host_name}} starts on {{start_date}}.</p>',
 'Trip to {{destination}} starts {{start_date}}.',
 ARRAY['first_name','destination','host_name','start_date'], 'Pre-trip reminder'),
('Review Request', 'review_request', 'How was your trip with {{host_name}}?',
 '<h1>Share your story</h1><p>Hi {{first_name}}, how was your time in {{destination}}? Leave a video review and earn rewards.</p><p><a href="{{review_url}}">Write Review</a></p>',
 'Review your trip: {{review_url}}',
 ARRAY['first_name','host_name','destination','review_url'], 'Post-trip review request'),
('Host Approved', 'host_approved', 'You are now a verified Travelista host! 🎉',
 '<h1>Congratulations {{first_name}}!</h1><p>Your host application has been approved. Start welcoming travelers today.</p>',
 'You are now a verified host.',
 ARRAY['first_name'], 'Sent when host is approved'),
('Subscription Activated', 'subscription', '{{tier}} membership activated 🌟',
 '<h1>Welcome to {{tier}}</h1><p>Hi {{first_name}}, your {{tier}} subscription is now active. Enjoy your perks.</p>',
 '{{tier}} active.',
 ARRAY['first_name','tier'], 'Subscription tier upgrade');
