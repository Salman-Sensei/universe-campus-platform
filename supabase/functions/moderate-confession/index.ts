import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { content } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-lite",
        messages: [
          {
            role: "system",
            content: `You are a content moderator for a university social platform. Analyze the following confession post and determine if it should be allowed. 
Reject posts that contain: hate speech, bullying, threats, harassment, explicit sexual content, doxxing/sharing personal info, or discriminatory language.
Allow posts that are: venting about academics, sharing feelings anonymously, campus life observations, funny confessions, crush confessions (non-creepy).
Respond with ONLY a JSON object: {"allowed": true/false, "reason": "brief reason if rejected"}`
          },
          { role: "user", content }
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "moderation_result",
              description: "Return moderation decision",
              parameters: {
                type: "object",
                properties: {
                  allowed: { type: "boolean" },
                  reason: { type: "string" }
                },
                required: ["allowed", "reason"],
                additionalProperties: false
              }
            }
          }
        ],
        tool_choice: { type: "function", function: { name: "moderation_result" } }
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ allowed: true, reason: "Rate limited, allowing by default" }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      // On error, allow by default to not block users
      console.error("AI moderation error:", response.status);
      return new Response(JSON.stringify({ allowed: true, reason: "Moderation unavailable" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    
    if (toolCall) {
      const result = JSON.parse(toolCall.function.arguments);
      return new Response(JSON.stringify(result), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fallback: try to parse from content
    const content_resp = data.choices?.[0]?.message?.content || "";
    try {
      const parsed = JSON.parse(content_resp);
      return new Response(JSON.stringify(parsed), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    } catch {
      return new Response(JSON.stringify({ allowed: true, reason: "Could not parse moderation" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
  } catch (e) {
    console.error("Moderation error:", e);
    return new Response(JSON.stringify({ allowed: true, reason: "Error in moderation" }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
