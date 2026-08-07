import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

const PLANS = new Set(["explorer", "adventurer", "nomad"]);
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function asText(value: unknown, max = 500) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !serviceRoleKey) return json({ error: "Backend is not configured" }, 500);

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  try {
    const body = await req.json().catch(() => ({}));
    const action = asText(body.action, 40);

    if (action === "join") {
      const email = asText(body.email, 255).toLowerCase();
      const fullName = asText(body.full_name, 120) || null;
      const city = asText(body.city, 120) || null;
      const interest = asText(body.interest, 1000) || null;
      const referralSource = asText(body.referral_source, 160) || null;
      const origin = asText(body.origin, 300).replace(/\/$/, "");
      const requestedPlan = asText(body.plan_interest, 40).toLowerCase();
      const planInterest = PLANS.has(requestedPlan) ? requestedPlan : "explorer";

      if (!emailPattern.test(email)) return json({ error: "Enter a valid email address" }, 400);
      if (!origin.startsWith("http://") && !origin.startsWith("https://")) {
        return json({ error: "Invalid confirmation origin" }, 400);
      }

      const { data: existing, error: existingError } = await supabase
        .from("beta_waitlist")
        .select("id, confirmation_token, email, full_name, plan_interest")
        .eq("email", email)
        .maybeSingle();
      if (existingError) throw existingError;

      let waitlist = existing;
      if (waitlist) {
        const { data, error } = await supabase
          .from("beta_waitlist")
          .update({
            full_name: fullName ?? waitlist.full_name,
            city,
            interest,
            plan_interest: planInterest,
            referral_source: referralSource,
          })
          .eq("id", waitlist.id)
          .select("id, confirmation_token, email, full_name, plan_interest")
          .single();
        if (error) throw error;
        waitlist = data;
      } else {
        const { data, error } = await supabase
          .from("beta_waitlist")
          .insert({ email, full_name: fullName, city, interest, plan_interest: planInterest, referral_source: referralSource })
          .select("id, confirmation_token, email, full_name, plan_interest")
          .single();
        if (error) throw error;
        waitlist = data;
      }

      const confirmUrl = `${origin}/beta-waitlist/confirm?token=${waitlist.confirmation_token}`;
      await supabase.from("email_notifications").insert({
        recipient_email: waitlist.email,
        subject: "Confirm your Travelista beta spot",
        template_name: "beta_waitlist_confirm",
        trigger_event: "beta_waitlist_signup",
        body_html: `<p>Hi ${waitlist.full_name || "traveler"},</p><p>Thanks for joining the Travelista beta waitlist! Please confirm your email to lock in your <strong>${waitlist.plan_interest}</strong> tier spot:</p><p><a href="${confirmUrl}">Confirm my spot</a></p><p>— The Travelista Team</p>`,
        payload: { waitlist_id: waitlist.id, confirmation_token: waitlist.confirmation_token, plan: waitlist.plan_interest, confirmation_url: confirmUrl },
      });

      return json({ waitlist, confirmation_url: confirmUrl });
    }

    if (action === "confirm") {
      const token = asText(body.token, 80);
      if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(token)) {
        return json({ error: "Invalid confirmation link" }, 400);
      }

      const { data, error } = await supabase
        .from("beta_waitlist")
        .update({ status: "confirmed", confirmed_at: new Date().toISOString() })
        .eq("confirmation_token", token)
        .select("email, full_name, plan_interest, status, confirmed_at")
        .maybeSingle();
      if (error) throw error;
      if (!data) return json({ error: "Confirmation link not found" }, 404);
      return json({ waitlist: data });
    }

    return json({ error: "Unknown action" }, 400);
  } catch (error) {
    console.error("beta-waitlist error", error);
    return json({ error: error instanceof Error ? error.message : "Something went wrong" }, 500);
  }
});
