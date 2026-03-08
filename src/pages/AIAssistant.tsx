import { useState, useEffect } from "react";
import { AppLayout } from "@/components/AppLayout";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Sparkles, Send, Copy, Loader2, Lightbulb, Wand2 } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
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
      ? `You are a creative social media assistant. Based on the user's profile and interests, suggest 3 engaging post ideas. Keep them fun, authentic, and varied. Format with emojis and clear numbering. ${context}`
      : `You are a writing assistant. Help the user improve their social media post to be more engaging, clear, and impactful while keeping their voice. ${context}`;

    const userMessage = mode === "suggest" ? prompt || "Suggest some post ideas based on my interests" : prompt;

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
        body: JSON.stringify({ messages: [{ role: "system", content: systemPrompt }, { role: "user", content: userMessage }] }),
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
            if (content) { fullText += content; setResult(fullText); }
          } catch {}
        }
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to generate");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto p-4 md:p-6 space-y-6">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl gradient-accent flex items-center justify-center glow-accent">
              <Sparkles className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h2 className="text-xl font-display font-bold text-foreground">AI Assistant</h2>
              <p className="text-xs text-muted-foreground">Powered by AI to boost your content</p>
            </div>
          </div>

          {/* Mode tabs */}
          <div className="flex gap-2 p-1 bg-surface/60 rounded-xl w-fit mb-6">
            <button
              onClick={() => setMode("suggest")}
              className={`flex items-center gap-1.5 text-sm font-medium px-4 py-2 rounded-lg transition-all duration-200 ${
                mode === "suggest" ? "gradient-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Lightbulb className="h-4 w-4" /> Suggest Ideas
            </button>
            <button
              onClick={() => setMode("improve")}
              className={`flex items-center gap-1.5 text-sm font-medium px-4 py-2 rounded-lg transition-all duration-200 ${
                mode === "improve" ? "gradient-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Wand2 className="h-4 w-4" /> Improve Post
            </button>
          </div>

          <div className="glass rounded-2xl p-6 space-y-4 noise">
            <Textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder={mode === "suggest" ? "What topics interest you? Leave blank for auto-suggestions..." : "Paste your draft post here to improve..."}
              className="bg-surface/40 border-border/30 min-h-[120px] resize-none rounded-xl focus:ring-1 focus:ring-primary/30 text-[15px] leading-relaxed"
            />
            <Button
              onClick={handleGenerate}
              disabled={loading}
              className="gradient-primary text-primary-foreground font-bold rounded-xl px-6"
            >
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
              {loading ? "Thinking..." : "Generate"}
            </Button>
          </div>

          <AnimatePresence>
            {result && (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                className="glass rounded-2xl p-6 space-y-3 noise"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-accent" />
                    <h3 className="font-display font-semibold text-foreground text-sm">AI Result</h3>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => { navigator.clipboard.writeText(result); toast.success("Copied!"); }}
                    className="text-primary hover:bg-primary/10 rounded-lg"
                  >
                    <Copy className="mr-1.5 h-3.5 w-3.5" /> Copy
                  </Button>
                </div>
                <div className="text-foreground/90 whitespace-pre-wrap leading-relaxed text-[15px]">{result}</div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </AppLayout>
  );
}
