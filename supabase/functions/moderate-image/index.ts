import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const BodySchema = z.object({
  image: z.string().startsWith("data:image/", "image must be a base64 data URL").max(15_000_000),
});

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

async function callGateway(apiKey: string, image: string) {
  const res = await fetch("https://ai.gateway.lovable.dev/v1/responses", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Lovable-API-Key": apiKey,
      "X-Lovable-AIG-SDK": "fetch",
    },
    body: JSON.stringify({
      model: "openai/gpt-6-astra",
      stream: true,
      reasoning: { effort: "low" },
      input: [
        {
          role: "user",
          content: [
            {
              type: "input_text",
              text: `You are an image safety moderator for a university social platform. Look at this image and decide if it is safe to post.
Block images containing: nudity, explicit sexual content, graphic violence/gore, or illegal content.
Allow normal photos: people, selfies, campus life, objects, study material, memes, screenshots, pets, food.
Respond with ONLY a JSON object: {"allowed": true/false, "reason": "brief reason if blocked"}`,
            },
            { type: "input_image", image_url: image },
          ],
        },
      ],
    }),
  });
  return res;
}

async function readVerdict(res: Response): Promise<{ allowed: boolean; reason: string | null } | null> {
  if (!res.body) return null;
  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let text = "";
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";
    for (const line of lines) {
      if (!line.startsWith("data:")) continue;
      const payload = line.slice(5).trim();
      if (!payload || payload === "[DONE]") continue;
      try {
        const evt = JSON.parse(payload);
        if (evt.type === "response.output_text.delta" && typeof evt.delta === "string") text += evt.delta;
        else if (evt.type === "response.completed" && !text) {
          const out = evt.response?.output ?? [];
          for (const item of out) {
            for (const part of item?.content ?? []) {
              if (part?.type === "output_text" && typeof part.text === "string") text += part.text;
            }
          }
        }
      } catch { /* skip malformed SSE lines */ }
    }
  }
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) return null;
  try {
    const parsed = JSON.parse(match[0]);
    if (typeof parsed.allowed !== "boolean") return null;
    return { allowed: parsed.allowed, reason: typeof parsed.reason === "string" ? parsed.reason : null };
  } catch {
    return null;
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!apiKey) return json({ error: "AI is not configured" }, 500);

    const parsed = BodySchema.safeParse(await req.json());
    if (!parsed.success) return json({ error: "Invalid request", details: parsed.error.flatten().fieldErrors }, 400);

    let res = await callGateway(apiKey, parsed.data.image);
    if (res.status === 429 || res.status >= 500) {
      // One bounded retry for transient failures
      const retryAfter = Number(res.headers.get("Retry-After")) || 2;
      await new Promise((r) => setTimeout(r, Math.min(retryAfter, 10) * 1000));
      res = await callGateway(apiKey, parsed.data.image);
    }
    if (!res.ok) {
      const msg = await res.text().catch(() => "");
      if (res.status === 402 || res.status === 403) return json({ error: "Image moderation is temporarily unavailable. Please contact the admin." }, 503);
      return json({ error: `Moderation check failed (${res.status})`, detail: msg.slice(0, 300) }, 502);
    }

    const verdict = await readVerdict(res);
    if (!verdict) return json({ error: "Moderation check failed. Please try again." }, 502);

    return json(verdict);
  } catch (err) {
    return json({ error: err instanceof Error ? err.message : "Unknown error" }, 500);
  }
});
