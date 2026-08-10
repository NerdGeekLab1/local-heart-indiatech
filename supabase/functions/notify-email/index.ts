// Resolves a recipient's email address from their user id using the service role,
// then hands the message off to send-transactional-email. Keeps user emails out of
// the client while still allowing hosts/admins to trigger app emails.
import { createClient } from 'npm:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders })

  const url = Deno.env.get('SUPABASE_URL')!
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  const admin = createClient(url, serviceKey)

  try {
    const { templateName, userId, recipientEmail, templateData, idempotencyKey } = await req.json()

    if (!templateName) {
      return new Response(JSON.stringify({ error: 'templateName is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    let email: string | null = recipientEmail ?? null
    if (!email && userId) {
      const { data, error } = await admin.auth.admin.getUserById(userId)
      if (error) throw error
      email = data.user?.email ?? null
    }

    if (!email) {
      return new Response(JSON.stringify({ error: 'Could not resolve a recipient email' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const res = await fetch(`${url}/functions/v1/send-transactional-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${serviceKey}`,
      },
      body: JSON.stringify({
        templateName,
        recipientEmail: email,
        idempotencyKey,
        templateData: templateData ?? {},
      }),
    })
    const body = await res.text()
    return new Response(body, {
      status: res.status,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (e) {
    console.error('notify-email failed', e)
    return new Response(JSON.stringify({ error: String((e as Error).message ?? e) }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
