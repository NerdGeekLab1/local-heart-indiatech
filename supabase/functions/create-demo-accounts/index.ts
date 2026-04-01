import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

Deno.serve(async (req) => {
  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, serviceKey);

  const demos = [
    { email: "demo.traveler@travelista.app", password: "demo123456", role: "traveler", first_name: "Demo", last_name: "Traveler" },
    { email: "demo.host@travelista.app", password: "demo123456", role: "host", first_name: "Demo", last_name: "Host" },
    { email: "demo.admin@travelista.app", password: "demo123456", role: "admin", first_name: "Demo", last_name: "Admin" },
  ];

  const results = [];

  for (const demo of demos) {
    // Check if user exists
    const { data: existingUsers } = await supabase.auth.admin.listUsers();
    const existing = existingUsers?.users?.find(u => u.email === demo.email);
    
    let userId: string;
    
    if (existing) {
      userId = existing.id;
      // Update password
      await supabase.auth.admin.updateUserById(userId, { password: demo.password });
      results.push({ email: demo.email, status: "updated" });
    } else {
      const { data, error } = await supabase.auth.admin.createUser({
        email: demo.email,
        password: demo.password,
        email_confirm: true,
        user_metadata: { first_name: demo.first_name, last_name: demo.last_name },
      });
      if (error) {
        results.push({ email: demo.email, status: "error", error: error.message });
        continue;
      }
      userId = data.user.id;
      results.push({ email: demo.email, status: "created" });
    }

    // Ensure profile exists
    await supabase.from("profiles").upsert({
      id: userId,
      first_name: demo.first_name,
      last_name: demo.last_name,
      email: demo.email,
    }, { onConflict: "id" });

    // Ensure role exists
    await supabase.from("user_roles").upsert({
      user_id: userId,
      role: demo.role,
    }, { onConflict: "user_id,role" });
  }

  return new Response(JSON.stringify({ results }), {
    headers: { "Content-Type": "application/json" },
  });
});
