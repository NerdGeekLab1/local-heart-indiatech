import { supabase } from "@/integrations/supabase/client";

type AppEmailTemplate =
  | "booking-confirmation"
  | "host-acceptance"
  | "itinerary-update"
  | "welcome";

/**
 * Fire-and-forget app email. Recipient can be given as a user id (resolved
 * server-side) or a plain email address. Failures never block the UI action.
 */
export async function sendAppEmail(opts: {
  template: AppEmailTemplate;
  userId?: string | null;
  recipientEmail?: string | null;
  idempotencyKey: string;
  data?: Record<string, unknown>;
}) {
  try {
    const { error } = await supabase.functions.invoke("notify-email", {
      body: {
        templateName: opts.template,
        userId: opts.userId ?? undefined,
        recipientEmail: opts.recipientEmail ?? undefined,
        idempotencyKey: opts.idempotencyKey,
        templateData: opts.data ?? {},
      },
    });
    if (error) console.warn(`[appEmails] ${opts.template} failed:`, error.message);
  } catch (e) {
    console.warn(`[appEmails] ${opts.template} threw:`, e);
  }
}
