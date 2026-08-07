import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const MODEL = "google/gemini-2.5-flash";

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const { messages, mode, preferences } = await req.json();

    const chatSystem = `You are Travelista AI, a friendly travel companion for India. 
Curate authentic experiences — homestays, heritage, cuisine, adventure, spiritual journeys, hidden gems.
Use the conversation as context: follow up on prior questions, refine suggestions when the traveler narrows their preferences (budget, days, season, vibe), and ask one clarifying question only when essential.
Keep replies vivid but concise. Use light markdown (bold, bullets) and sparing emojis.`;

    const suggestSystem = `You are Travelista AI. Based on the traveler's stated preferences and conversation history, suggest 3-5 personalized Indian destinations.
Always call the return_recommendations tool with structured results. Consider these stored preferences: ${JSON.stringify(preferences || {})}.`;

    const aiMessages = [
      { role: "system", content: mode === "suggest" ? suggestSystem : chatSystem },
      ...(messages || []),
    ];

    if (mode === "suggest") {
      const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: MODEL,
          messages: aiMessages,
          tools: [{
            type: "function",
            function: {
              name: "return_recommendations",
              description: "Return personalized Indian travel destination recommendations.",
              parameters: {
                type: "object",
                properties: {
                  recommendations: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        destination: { type: "string" },
                        reason: { type: "string" },
                        experiences: { type: "array", items: { type: "string" } },
                        bestSeason: { type: "string" },
                        estimatedBudget: { type: "string" },
                        vibe: { type: "string", enum: ["Cultural", "Adventure", "Spiritual", "Food", "Wellness", "Nature"] },
                      },
                      required: ["destination", "reason", "experiences", "bestSeason", "estimatedBudget", "vibe"],
                      additionalProperties: false,
                    },
                  },
                  tip: { type: "string" },
                },
                required: ["recommendations", "tip"],
                additionalProperties: false,
              },
            },
          }],
          tool_choice: { type: "function", function: { name: "return_recommendations" } },
        }),
      });

      if (!response.ok) {
        const status = response.status;
        const text = await response.text().catch(() => "");
        console.error("AI gateway error (suggest):", status, text);
        if (status === 429) return new Response(JSON.stringify({ error: "Rate limited. Please try again shortly." }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
        if (status === 402) return new Response(JSON.stringify({ error: "AI credits exhausted. Please add credits in Settings → Workspace → Usage." }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
        return new Response(JSON.stringify({ error: `AI gateway error: ${status}` }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }

      const data = await response.json();
      const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
      const args = toolCall?.function?.arguments;
      const result = args ? JSON.parse(args) : { recommendations: [], tip: "" };
      return new Response(JSON.stringify({ result }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Streaming chat
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({ model: MODEL, messages: aiMessages, stream: true }),
    });

    if (!response.ok) {
      const status = response.status;
      const text = await response.text().catch(() => "");
      console.error("AI gateway error (chat):", status, text);
      if (status === 429) return new Response(JSON.stringify({ error: "Rate limited. Please try again shortly." }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      if (status === 402) return new Response(JSON.stringify({ error: "AI credits exhausted. Add credits in Settings → Workspace → Usage." }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      return new Response(JSON.stringify({ error: `AI gateway error: ${status}` }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    return new Response(response.body, { headers: { ...corsHeaders, "Content-Type": "text/event-stream" } });
  } catch (e) {
    console.error("ai-recommend error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
