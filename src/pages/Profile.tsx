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
import { Pencil, Save, Loader2, Music, Quote, Tag } from "lucide-react";
import { toast } from "sonner";
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
    supabase
      .from("profiles")
      .select("*")
      .eq("user_id", user.id)
      .single()
      .then(({ data }) => {
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
    const { error } = await supabase
      .from("profiles")
      .update({
        display_name: form.display_name || null,
        bio: form.bio || null,
        favorite_music: form.favorite_music || null,
        quote: form.quote || null,
        interests: form.interests ? form.interests.split(",").map((s) => s.trim()).filter(Boolean) : null,
      })
      .eq("user_id", user.id);

    if (error) toast.error("Failed to update profile");
    else {
      toast.success("Profile updated!");
      setEditing(false);
      // Refresh profile
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
        {/* Profile Header */}
        <div className="glass rounded-xl p-6 space-y-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <label className="cursor-pointer group relative">
                <Avatar className="h-20 w-20 ring-2 ring-primary/30">
                  <AvatarImage src={profile?.avatar_url || undefined} />
                  <AvatarFallback className="bg-primary/10 text-primary text-xl">{displayName.slice(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="absolute inset-0 bg-background/50 rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                  <Pencil className="h-5 w-5 text-foreground" />
                </div>
                <input type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
              </label>
              <div>
                <h2 className="text-xl font-display font-bold text-foreground">{displayName}</h2>
                <p className="text-sm text-muted-foreground">@{profile?.username || "user"}</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => editing ? handleSave() : setEditing(true)}
              className="text-primary"
            >
              {editing ? <><Save className="mr-1 h-4 w-4" /> Save</> : <><Pencil className="mr-1 h-4 w-4" /> Edit</>}
            </Button>
          </div>

          {editing ? (
            <div className="space-y-3">
              <div className="space-y-1">
                <Label>Display Name</Label>
                <Input value={form.display_name} onChange={(e) => setForm({ ...form, display_name: e.target.value })} className="bg-surface border-border/50" />
              </div>
              <div className="space-y-1">
                <Label>Bio</Label>
                <Textarea value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} className="bg-surface border-border/50 resize-none" rows={3} />
              </div>
              <div className="space-y-1">
                <Label>Favorite Music</Label>
                <Input value={form.favorite_music} onChange={(e) => setForm({ ...form, favorite_music: e.target.value })} className="bg-surface border-border/50" placeholder="e.g. Lo-fi, Indie Rock" />
              </div>
              <div className="space-y-1">
                <Label>Quote</Label>
                <Input value={form.quote} onChange={(e) => setForm({ ...form, quote: e.target.value })} className="bg-surface border-border/50" placeholder="Your favorite quote" />
              </div>
              <div className="space-y-1">
                <Label>Interests (comma separated)</Label>
                <Input value={form.interests} onChange={(e) => setForm({ ...form, interests: e.target.value })} className="bg-surface border-border/50" placeholder="coding, music, space" />
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              {profile?.bio && <p className="text-foreground/80">{profile.bio}</p>}
              {profile?.favorite_music && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Music className="h-4 w-4 text-primary" /> {profile.favorite_music}
                </div>
              )}
              {profile?.quote && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground italic">
                  <Quote className="h-4 w-4 text-primary" /> "{profile.quote}"
                </div>
              )}
              {profile?.interests && profile.interests.length > 0 && (
                <div className="flex items-center gap-2 flex-wrap">
                  <Tag className="h-4 w-4 text-primary" />
                  {profile.interests.map((i) => (
                    <span key={i} className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">{i}</span>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Posts */}
        <h3 className="text-lg font-display font-semibold text-foreground">Your Posts</h3>
        {postsLoading ? (
          <div className="flex justify-center py-10"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
        ) : posts.length === 0 ? (
          <p className="text-muted-foreground text-center py-10">No posts yet.</p>
        ) : (
          posts.map((post) => <PostCard key={post.id} {...post} onRefresh={refresh} />)
        )}
      </div>
    </AppLayout>
  );
}
