import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/AppLayout";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ImagePlus, Send } from "lucide-react";
import { toast } from "sonner";

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
      if (uploadError) {
        toast.error("Failed to upload image");
        setLoading(false);
        return;
      }
      const { data: urlData } = supabase.storage.from("posts").getPublicUrl(path);
      image_url = urlData.publicUrl;
    }

    const { error } = await supabase.from("posts").insert({
      user_id: user.id,
      content: content.trim(),
      image_url,
    });

    if (error) {
      toast.error("Failed to create post");
    } else {
      toast.success("Post created!");
      navigate("/feed");
    }
    setLoading(false);
  };

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto p-4 md:p-6">
        <h2 className="text-2xl font-display font-bold text-foreground mb-6">Create Post</h2>
        <form onSubmit={handleSubmit} className="glass rounded-xl p-6 space-y-4">
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="What's on your mind?"
            className="bg-surface border-border/50 min-h-[120px] text-foreground resize-none"
            required
          />

          {preview && (
            <div className="relative">
              <img src={preview} alt="Preview" className="rounded-md max-h-64 object-cover" />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => { setImageFile(null); setPreview(null); }}
                className="absolute top-2 right-2 bg-background/80 text-foreground"
              >
                Remove
              </Button>
            </div>
          )}

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="image" className="cursor-pointer flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
                <ImagePlus className="h-5 w-5" />
                <span className="text-sm">Add Image</span>
              </Label>
              <Input id="image" type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
            </div>
            <Button type="submit" disabled={loading || !content.trim()} className="gradient-primary text-primary-foreground font-semibold">
              <Send className="mr-2 h-4 w-4" />
              {loading ? "Posting..." : "Post"}
            </Button>
          </div>
        </form>
      </div>
    </AppLayout>
  );
}
