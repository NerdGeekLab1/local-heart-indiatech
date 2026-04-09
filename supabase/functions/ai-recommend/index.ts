import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const { messages, mode, preferences } = await req.json();

    // Build system prompt based on mode
    let systemPrompt = "";
    if (mode === "suggest") {
      systemPrompt = `You are Travelista AI, a travel recommendation assistant for travelers visiting India. 
Based on the user's preferences and travel history, suggest personalized destinations and experiences.
Always respond with a JSON object containing:
{
  "recommendations": [
    {
      "destination": "City name",
      "reason": "Why this is perfect for them",
      "experiences": ["Experience 1", "Experience 2"],
      "bestSeason": "Oct-Mar",
      "estimatedBudget": "₹15,000-25,000",
      "vibe": "Cultural/Adventure/Spiritual/etc"
    }
  ],
  "tip": "A personalized travel tip"
}
Provide 3-5 recommendations. Consider user interests: ${JSON.stringify(preferences || {})}.
Focus on authentic Indian experiences - homestays, local cuisine, heritage, adventure sports, spiritual journeys.`;
    } else {
      systemPrompt = `You are Travelista AI, a friendly and knowledgeable travel assistant specializing in Indian destinations and experiences.
Help travelers discover amazing places in India. Be enthusiastic, culturally sensitive, and practical.
Suggest specific destinations, experiences, local food, and hidden gems.
Keep responses concise but vivid. Use emojis sparingly for warmth.
If asked about preferences, help narrow down based on: budget, travel style, duration, interests, season.`;
    }

    const aiMessages = [
      { role: "system", content: systemPrompt },
      ...(messages || [{ role: "user", content: "Suggest destinations based on my preferences" }]),
    ];

    if (mode === "suggest") {
      // Non-streaming for structured suggestions
      const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: aiMessages,
          response_format: { type: "json_object" },
        }),
      });

      if (!response.ok) {
        const status = response.status;
        if (status === 429) return new Response(JSON.stringify({ error: "Rate limited. Please try again shortly." }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
        if (status === 402) return new Response(JSON.stringify({ error: "AI credits exhausted. Please add funds." }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
        throw new Error(`AI gateway error: ${status}`);
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content || "{}";
      return new Response(JSON.stringify({ result: JSON.parse(content) }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    } else {
      // Streaming for chat
      const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: aiMessages,
          stream: true,
        }),
      });

      if (!response.ok) {
        const status = response.status;
        if (status === 429) return new Response(JSON.stringify({ error: "Rate limited." }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
        if (status === 402) return new Response(JSON.stringify({ error: "AI credits exhausted." }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
        throw new Error(`AI gateway error: ${status}`);
      }

      return new Response(response.body, {
        headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
      });
    }
  } catch (e) {
    console.error("ai-recommend error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
