import { useState, useEffect } from "react";
import { AppLayout } from "@/components/AppLayout";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Sparkles, Send, Copy, Loader2 } from "lucide-react";
import { toast } from "sonner";
import type { Tables } from "@/integrations/supabase/types";

export default function AIAssistant() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Tables<"profiles"> | null>(null);
  const [prompt, setPrompt] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<"suggest" | "improve">("suggest");

  useEffect(() => {
    if (!user) return;
    supabase.from("profiles").select("*").eq("user_id", user.id).single().then(({ data }) => {
      if (data) setProfile(data);
    });
  }, [user]);

  const handleGenerate = async () => {
    setLoading(true);
    setResult("");

    const context = profile
      ? `User interests: ${profile.interests?.join(", ") || "none"}. Bio: ${profile.bio || "none"}. Favorite music: ${profile.favorite_music || "none"}.`
      : "";

    const systemPrompt = mode === "suggest"
      ? `You are a creative social media assistant. Based on the user's profile and interests, suggest 3 engaging post ideas. Keep them fun, authentic, and varied. ${context}`
      : `You are a writing assistant. Help the user improve their social media post to be more engaging, clear, and impactful while keeping their voice. ${context}`;

    const userMessage = mode === "suggest"
      ? prompt || "Suggest some post ideas based on my interests"
      : prompt;

    if (mode === "improve" && !prompt.trim()) {
      toast.error("Paste your draft post to improve it");
      setLoading(false);
      return;
    }

    try {
      const resp = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-assistant`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userMessage },
          ],
        }),
      });

      if (!resp.ok) {
        const errData = await resp.json().catch(() => ({}));
        throw new Error(errData.error || "AI request failed");
      }

      if (!resp.body) throw new Error("No response body");

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let fullText = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = buffer.indexOf("\n")) !== -1) {
          let line = buffer.slice(0, newlineIndex);
          buffer = buffer.slice(newlineIndex + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (!line.startsWith("data: ")) continue;
          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") break;
          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              fullText += content;
              setResult(fullText);
            }
          } catch {}
        }
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to generate");
    } finally {
      setLoading(false);
    }
  };

  const copyResult = () => {
    navigator.clipboard.writeText(result);
    toast.success("Copied to clipboard!");
  };

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto p-4 md:p-6 space-y-6">
        <div className="flex items-center gap-3">
          <Sparkles className="h-6 w-6 text-primary animate-pulse-glow" />
          <h2 className="text-2xl font-display font-bold text-foreground">AI Assistant</h2>
        </div>

        <div className="flex gap-2">
          <Button
            variant={mode === "suggest" ? "default" : "secondary"}
            onClick={() => setMode("suggest")}
            className={mode === "suggest" ? "gradient-primary text-primary-foreground" : ""}
          >
            Suggest Ideas
          </Button>
          <Button
            variant={mode === "improve" ? "default" : "secondary"}
            onClick={() => setMode("improve")}
            className={mode === "improve" ? "gradient-primary text-primary-foreground" : ""}
          >
            Improve Post
          </Button>
        </div>

        <div className="glass rounded-xl p-6 space-y-4">
          <Textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder={mode === "suggest" ? "What topics interest you? (optional)" : "Paste your draft post here..."}
            className="bg-surface border-border/50 min-h-[100px] resize-none"
          />
          <Button
            onClick={handleGenerate}
            disabled={loading}
            className="gradient-primary text-primary-foreground font-semibold"
          >
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
            {loading ? "Generating..." : "Generate"}
          </Button>
        </div>

        {result && (
          <div className="glass rounded-xl p-6 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-display font-semibold text-foreground">Result</h3>
              <Button variant="ghost" size="sm" onClick={copyResult} className="text-primary">
                <Copy className="mr-1 h-4 w-4" /> Copy
              </Button>
            </div>
            <div className="text-foreground/90 whitespace-pre-wrap">{result}</div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
