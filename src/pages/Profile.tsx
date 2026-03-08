import { useEffect, useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { PostCard } from "@/components/PostCard";
import { usePosts } from "@/hooks/usePosts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Pencil, Save, Loader2, Music, Quote, Tag, Camera } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import type { Tables } from "@/integrations/supabase/types";

export default function Profile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Tables<"profiles"> | null>(null);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    display_name: "",
    bio: "",
    favorite_music: "",
    quote: "",
    interests: "",
  });

  const { posts, loading: postsLoading, refresh } = usePosts(user?.id);

  useEffect(() => {
    if (!user) return;
    supabase.from("profiles").select("*").eq("user_id", user.id).single().then(({ data }) => {
      if (data) {
        setProfile(data);
        setForm({
          display_name: data.display_name || "",
          bio: data.bio || "",
          favorite_music: data.favorite_music || "",
          quote: data.quote || "",
          interests: data.interests?.join(", ") || "",
        });
      }
      setLoading(false);
    });
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    const { error } = await supabase.from("profiles").update({
      display_name: form.display_name || null,
      bio: form.bio || null,
      favorite_music: form.favorite_music || null,
      quote: form.quote || null,
      interests: form.interests ? form.interests.split(",").map((s) => s.trim()).filter(Boolean) : null,
    }).eq("user_id", user.id);

    if (error) toast.error("Failed to update profile");
    else {
      toast.success("Profile updated!");
      setEditing(false);
      const { data } = await supabase.from("profiles").select("*").eq("user_id", user.id).single();
      if (data) setProfile(data);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!user || !e.target.files?.[0]) return;
    const file = e.target.files[0];
    const path = `${user.id}/avatar.${file.name.split(".").pop()}`;
    await supabase.storage.from("avatars").upload(path, file, { upsert: true });
    const { data } = supabase.storage.from("avatars").getPublicUrl(path);
    await supabase.from("profiles").update({ avatar_url: data.publicUrl }).eq("user_id", user.id);
    const { data: updated } = await supabase.from("profiles").select("*").eq("user_id", user.id).single();
    if (updated) setProfile(updated);
    toast.success("Avatar updated!");
  };

  if (loading) return (
    <AppLayout>
      <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
    </AppLayout>
  );

  const displayName = profile?.display_name || profile?.username || "Anonymous";

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto p-4 md:p-6 space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-2xl overflow-hidden noise"
        >
          {/* Banner area */}
          <div className="h-32 bg-gradient-to-br from-primary/20 via-accent/10 to-transparent relative">
            <div className="absolute inset-0 shimmer" />
          </div>

          <div className="px-6 pb-6 -mt-12">
            <div className="flex items-end justify-between mb-4">
              <label className="cursor-pointer group relative">
                <Avatar className="h-24 w-24 ring-4 ring-card">
                  <AvatarImage src={profile?.avatar_url || undefined} />
                  <AvatarFallback className="bg-surface text-primary text-2xl font-bold">{displayName.slice(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="absolute inset-0 bg-background/60 rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all duration-200 backdrop-blur-sm">
                  <Camera className="h-5 w-5 text-foreground" />
                </div>
                <input type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
              </label>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => editing ? handleSave() : setEditing(true)}
                className="text-primary hover:bg-primary/10 rounded-xl font-semibold"
              >
                {editing ? <><Save className="mr-1.5 h-4 w-4" /> Save</> : <><Pencil className="mr-1.5 h-4 w-4" /> Edit Profile</>}
              </Button>
            </div>

            <div className="mb-4">
              <h2 className="text-2xl font-display font-bold text-foreground">{displayName}</h2>
              <p className="text-sm text-muted-foreground">@{profile?.username || "user"}</p>
            </div>

            <AnimatePresence mode="wait">
              {editing ? (
                <motion.div
                  key="edit"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-3 overflow-hidden"
                >
                  {[
                    { key: "display_name", label: "Display Name", placeholder: "Your display name" },
                    { key: "favorite_music", label: "Favorite Music", placeholder: "e.g. Lo-fi, Indie Rock" },
                    { key: "quote", label: "Favorite Quote", placeholder: "Your favorite quote" },
                    { key: "interests", label: "Interests (comma separated)", placeholder: "coding, music, space" },
                  ].map((field) => (
                    <div key={field.key} className="space-y-1">
                      <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{field.label}</Label>
                      <Input
                        value={form[field.key as keyof typeof form]}
                        onChange={(e) => setForm({ ...form, [field.key]: e.target.value })}
                        className="bg-surface/40 border-border/30 rounded-xl h-10 focus:ring-1 focus:ring-primary/30"
                        placeholder={field.placeholder}
                      />
                    </div>
                  ))}
                  <div className="space-y-1">
                    <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Bio</Label>
                    <Textarea
                      value={form.bio}
                      onChange={(e) => setForm({ ...form, bio: e.target.value })}
                      className="bg-surface/40 border-border/30 resize-none rounded-xl focus:ring-1 focus:ring-primary/30"
                      rows={3}
                      placeholder="Tell us about yourself..."
                    />
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="view"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-3"
                >
                  {profile?.bio && <p className="text-foreground/80 leading-relaxed">{profile.bio}</p>}
                  <div className="flex flex-wrap gap-3">
                    {profile?.favorite_music && (
                      <div className="flex items-center gap-1.5 text-sm text-muted-foreground bg-surface/60 rounded-full px-3 py-1">
                        <Music className="h-3.5 w-3.5 text-primary" /> {profile.favorite_music}
                      </div>
                    )}
                    {profile?.quote && (
                      <div className="flex items-center gap-1.5 text-sm text-muted-foreground bg-surface/60 rounded-full px-3 py-1 italic">
                        <Quote className="h-3.5 w-3.5 text-primary" /> "{profile.quote}"
                      </div>
                    )}
                  </div>
                  {profile?.interests && profile.interests.length > 0 && (
                    <div className="flex items-center gap-2 flex-wrap">
                      <Tag className="h-3.5 w-3.5 text-primary" />
                      {profile.interests.map((i) => (
                        <span key={i} className="text-xs bg-primary/10 text-primary px-2.5 py-1 rounded-full font-medium">{i}</span>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        <div className="flex items-center justify-between">
          <h3 className="text-lg font-display font-semibold text-foreground">Your Posts</h3>
          <span className="text-xs text-muted-foreground">{posts.length} posts</span>
        </div>
        {postsLoading ? (
          <div className="flex justify-center py-10"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
        ) : posts.length === 0 ? (
          <div className="text-center py-16 glass rounded-2xl">
            <p className="text-muted-foreground text-sm">No posts yet. Share your first thought!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {posts.map((post) => <PostCard key={post.id} {...post} onRefresh={refresh} />)}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
