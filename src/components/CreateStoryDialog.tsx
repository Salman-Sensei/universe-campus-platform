import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Loader2, Type, ImageIcon } from "lucide-react";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: () => void;
}

export function CreateStoryDialog({ open, onOpenChange, onCreated }: Props) {
  const { user } = useAuth();
  const [mode, setMode] = useState<"text" | "image">("text");
  const [content, setContent] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [posting, setPosting] = useState(false);

  const handlePost = async () => {
    if (!user) return;
    setPosting(true);

    try {
      let imageUrl: string | null = null;

      if (mode === "image" && file) {
        const ext = file.name.split(".").pop();
        const path = `stories/${user.id}/${Date.now()}.${ext}`;
        const { error: uploadError } = await supabase.storage.from("posts").upload(path, file);
        if (uploadError) throw uploadError;
        const { data: urlData } = supabase.storage.from("posts").getPublicUrl(path);
        imageUrl = urlData.publicUrl;
      }

      if (mode === "text" && !content.trim()) {
        toast.error("Please enter some text");
        setPosting(false);
        return;
      }

      const { error } = await supabase.from("stories").insert({
        user_id: user.id,
        content: mode === "text" ? content.trim() : null,
        image_url: imageUrl,
      });

      if (error) throw error;
      toast.success("Story posted! It will disappear after 24 hours.");
      setContent("");
      setFile(null);
      onOpenChange(false);
      onCreated();
    } catch (e: any) {
      toast.error(e.message || "Failed to create story");
    }
    setPosting(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass-card border-border/30 rounded-2xl max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display">Create Story</DialogTitle>
        </DialogHeader>

        {/* Mode toggle */}
        <div className="flex gap-2 mb-4">
          <Button
            variant={mode === "text" ? "default" : "outline"}
            size="sm"
            onClick={() => setMode("text")}
            className="rounded-xl"
          >
            <Type className="h-4 w-4 mr-1" /> Text
          </Button>
          <Button
            variant={mode === "image" ? "default" : "outline"}
            size="sm"
            onClick={() => setMode("image")}
            className="rounded-xl"
          >
            <ImageIcon className="h-4 w-4 mr-1" /> Image
          </Button>
        </div>

        {mode === "text" ? (
          <Textarea
            placeholder="What's on your mind? ✨"
            value={content}
            onChange={e => setContent(e.target.value)}
            className="bg-surface/50 border-border/20 rounded-xl min-h-[120px]"
            maxLength={280}
          />
        ) : (
          <div>
            <input
              type="file"
              accept="image/*"
              onChange={e => setFile(e.target.files?.[0] || null)}
              className="text-sm text-muted-foreground file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-primary/10 file:text-primary file:font-medium file:text-sm"
            />
            {file && (
              <p className="text-xs text-muted-foreground mt-2">Selected: {file.name}</p>
            )}
          </div>
        )}

        <Button
          onClick={handlePost}
          disabled={posting || (mode === "text" && !content.trim()) || (mode === "image" && !file)}
          className="gradient-primary text-primary-foreground rounded-xl font-semibold w-full mt-2"
        >
          {posting ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
          Share Story
        </Button>
      </DialogContent>
    </Dialog>
  );
}
