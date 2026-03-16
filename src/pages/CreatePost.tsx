import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/AppLayout";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ImagePlus, Send, X, Sparkles, PenLine } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

export default function CreatePost() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [content, setContent] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !content.trim()) return;
    setLoading(true);

    let image_url: string | null = null;
    if (imageFile) {
      const ext = imageFile.name.split(".").pop();
      const path = `${user.id}/${Date.now()}.${ext}`;
      const { error: uploadError } = await supabase.storage.from("posts").upload(path, imageFile);
      if (uploadError) { toast.error("Failed to upload image"); setLoading(false); return; }
      const { data: urlData } = supabase.storage.from("posts").getPublicUrl(path);
      image_url = urlData.publicUrl;
    }

    const { error } = await supabase.from("posts").insert({ user_id: user.id, content: content.trim(), image_url });
    if (error) toast.error("Failed to create post");
    else { toast.success("Post created!"); navigate("/feed"); }
    setLoading(false);
  };

  const charCount = content.length;
  const charPercent = Math.min((charCount / 500) * 100, 100);

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto p-4 md:p-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl gradient-primary flex items-center justify-center">
                <PenLine className="h-5 w-5 text-primary-foreground" />
              </div>
              <h2 className="text-xl font-display font-bold text-foreground">Create Post</h2>
            </div>
            <Link to="/ai-assistant">
              <Button variant="ghost" size="sm" className="text-accent hover:text-accent gap-1.5 rounded-xl">
                <Sparkles className="h-4 w-4" /> AI Help
              </Button>
            </Link>
          </div>

          <form onSubmit={handleSubmit} className="glass-card rounded-2xl p-6 space-y-5">
            <div className="relative">
              <Textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Share an academic update, idea, or question..."
                className="bg-surface/30 border-border/30 min-h-[160px] text-foreground resize-none rounded-xl text-[15px] leading-relaxed focus:ring-1 focus:ring-primary/30"
                required
              />
              {/* Character counter with progress ring */}
              <div className="absolute bottom-3 right-3 flex items-center gap-2">
                <svg className="h-6 w-6 -rotate-90" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" fill="none" stroke="hsl(var(--border))" strokeWidth="2" />
                  <circle
                    cx="12" cy="12" r="10" fill="none"
                    stroke={charCount > 500 ? "hsl(var(--destructive))" : "hsl(var(--primary))"}
                    strokeWidth="2"
                    strokeDasharray={`${charPercent * 0.628} 62.8`}
                    className="transition-all duration-300"
                  />
                </svg>
                <span className={`text-xs ${charCount > 500 ? 'text-destructive' : 'text-muted-foreground'}`}>
                  {500 - charCount}
                </span>
              </div>
            </div>

            {preview && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative rounded-xl overflow-hidden"
              >
                <img src={preview} alt="Preview" className="rounded-xl max-h-64 w-full object-cover" />
                <button
                  type="button"
                  onClick={() => { setImageFile(null); setPreview(null); }}
                  className="absolute top-3 right-3 h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center text-foreground hover:bg-background transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </motion.div>
            )}

            <div className="flex items-center justify-between pt-2 border-t border-border/30">
              <div>
                <Label htmlFor="image" className="cursor-pointer flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors rounded-xl px-3 py-2 hover:bg-surface/60">
                  <ImagePlus className="h-5 w-5" />
                  <span className="text-sm font-medium">Add Image</span>
                </Label>
                <Input id="image" type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
              </div>
              <Button
                type="submit"
                disabled={loading || !content.trim() || charCount > 500}
                className="gradient-primary text-primary-foreground font-bold rounded-xl px-6"
              >
                <Send className="mr-2 h-4 w-4" />
                {loading ? "Posting..." : "Publish"}
              </Button>
            </div>
          </form>
        </motion.div>
      </div>
    </AppLayout>
  );
}
