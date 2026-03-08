import { useEffect, useState, useRef } from "react";
import { AppLayout } from "@/components/AppLayout";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { PostCard } from "@/components/PostCard";
import { usePosts } from "@/hooks/usePosts";
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { ProfileEditForm } from "@/components/profile/ProfileEditForm";
import { ProfileDetails } from "@/components/profile/ProfileDetails";
import { Loader2 } from "lucide-react";
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

  const refreshProfile = async () => {
    if (!user) return;
    const { data } = await supabase.from("profiles").select("*").eq("user_id", user.id).single();
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
  };

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
      await refreshProfile();
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!user || !e.target.files?.[0]) return;
    const file = e.target.files[0];
    const path = `${user.id}/avatar.${file.name.split(".").pop()}`;
    await supabase.storage.from("avatars").upload(path, file, { upsert: true });
    const { data } = supabase.storage.from("avatars").getPublicUrl(path);
    await supabase.from("profiles").update({ avatar_url: data.publicUrl }).eq("user_id", user.id);
    await refreshProfile();
    toast.success("Avatar updated!");
  };

  const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!user || !e.target.files?.[0]) return;
    const file = e.target.files[0];
    const path = `${user.id}/banner.${file.name.split(".").pop()}`;
    await supabase.storage.from("avatars").upload(path, file, { upsert: true });
    const { data } = supabase.storage.from("avatars").getPublicUrl(path);
    await supabase.from("profiles").update({ banner_url: data.publicUrl }).eq("user_id", user.id);
    await refreshProfile();
    toast.success("Banner updated!");
  };

  if (loading) return (
    <AppLayout>
      <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
    </AppLayout>
  );

  const displayName = profile?.display_name || profile?.username || "Anonymous";

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto pb-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-b-2xl overflow-hidden noise"
        >
          <ProfileHeader
            profile={profile}
            displayName={displayName}
            editing={editing}
            onEditToggle={() => editing ? handleSave() : setEditing(true)}
            onAvatarUpload={handleAvatarUpload}
            onBannerUpload={handleBannerUpload}
          />

          <div className="px-6 pb-6">
            <AnimatePresence mode="wait">
              {editing ? (
                <ProfileEditForm key="edit" form={form} setForm={setForm} />
              ) : (
                <ProfileDetails key="view" profile={profile} />
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        <div className="px-4 md:px-6 mt-6 space-y-4">
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
      </div>
    </AppLayout>
  );
}
