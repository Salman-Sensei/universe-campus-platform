import { useEffect, useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { PostCard } from "@/components/PostCard";
import { usePosts } from "@/hooks/usePosts";
import { ProfileEditForm } from "@/components/profile/ProfileEditForm";
import { RoleBadge } from "@/components/RoleBadge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Loader2, Camera, ImagePlus, Pencil, Save, Music, Quote, Tag, GraduationCap, BookOpen, Users, UserCheck, MapPin } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import type { Tables } from "@/integrations/supabase/types";

export default function Profile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Tables<"profiles"> | null>(null);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [form, setForm] = useState({
    display_name: "",
    bio: "",
    favorite_music: "",
    quote: "",
    interests: "",
    semester: "",
    batch: "",
  });

  const { posts, loading: postsLoading, refresh } = usePosts(user?.id);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const { data } = await supabase.from("profiles").select("*").eq("user_id", user.id).single();
      if (data) {
        setProfile(data);
        setForm({
          display_name: data.display_name || "",
          bio: data.bio || "",
          favorite_music: data.favorite_music || "",
          quote: data.quote || "",
          interests: data.interests?.join(", ") || "",
          semester: data.semester || "",
          batch: data.batch || "",
        });
      }
      const [followers, following] = await Promise.all([
        supabase.from("follows").select("id", { count: "exact" }).eq("following_id", user.id),
        supabase.from("follows").select("id", { count: "exact" }).eq("follower_id", user.id),
      ]);
      setFollowersCount(followers.count || 0);
      setFollowingCount(following.count || 0);
      setLoading(false);
    };
    load();
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
        semester: data.semester || "",
        batch: data.batch || "",
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
          className="rounded-2xl overflow-hidden border border-border/40 bg-card"
        >
          {/* Cover Banner */}
          <label className="cursor-pointer group block relative h-[200px] md:h-[260px] overflow-hidden">
            {profile?.banner_url ? (
              <img src={profile.banner_url} alt="Profile banner" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
            ) : (
              <div className="w-full h-full relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/30 via-accent/20 to-primary/10" />
                <div className="absolute inset-0 opacity-40" style={{ backgroundImage: 'radial-gradient(circle at 30% 40%, hsl(var(--primary) / 0.4) 0%, transparent 50%), radial-gradient(circle at 70% 60%, hsl(var(--glow-secondary) / 0.3) 0%, transparent 50%)' }} />
              </div>
            )}
            <div className="absolute inset-0 bg-background/0 group-hover:bg-background/40 transition-all duration-300 flex items-center justify-center">
              <div className="opacity-0 group-hover:opacity-100 transition-all duration-300 scale-90 group-hover:scale-100 flex items-center gap-2 bg-background/80 backdrop-blur-md text-foreground text-sm font-medium px-5 py-2.5 rounded-full shadow-lg">
                <ImagePlus className="h-4 w-4" />
                Change Banner
              </div>
            </div>
            <input type="file" accept="image/*" onChange={handleBannerUpload} className="hidden" />
          </label>

          {/* Profile Info */}
          <div className="px-5 md:px-8 pb-6 relative">
            <div className="flex items-end justify-between -mt-16 relative z-10 mb-5">
              <label className="cursor-pointer group relative">
                <Avatar className="h-32 w-32 ring-4 ring-card shadow-xl">
                  <AvatarImage src={profile?.avatar_url || undefined} className="object-cover" />
                  <AvatarFallback className="bg-muted text-primary text-3xl font-bold">
                    {displayName.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute inset-0 bg-background/60 rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all duration-200 backdrop-blur-sm">
                  <Camera className="h-6 w-6 text-foreground" />
                </div>
                <input type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
              </label>

              <Button
                variant={editing ? "default" : "outline"}
                size="sm"
                onClick={() => editing ? handleSave() : setEditing(true)}
                className="rounded-full font-semibold px-5 mt-16"
              >
                {editing ? <><Save className="mr-1.5 h-4 w-4" /> Save</> : <><Pencil className="mr-1.5 h-4 w-4" /> Edit Profile</>}
              </Button>
            </div>

            {/* Name + Role */}
            <div className="mb-4">
              <div className="flex items-center gap-2.5 mb-1">
                <h1 className="text-2xl md:text-3xl font-display font-bold text-foreground">{displayName}</h1>
                <RoleBadge role={profile?.role} size="md" />
              </div>
              <p className="text-sm text-muted-foreground">@{profile?.username || "user"}</p>
            </div>

            {/* Stats row */}
            <div className="flex gap-6 mb-5">
              <div className="text-center">
                <p className="text-xl font-display font-bold text-foreground">{followersCount}</p>
                <p className="text-xs text-muted-foreground">Followers</p>
              </div>
              <div className="text-center">
                <p className="text-xl font-display font-bold text-foreground">{followingCount}</p>
                <p className="text-xs text-muted-foreground">Following</p>
              </div>
              <div className="text-center">
                <p className="text-xl font-display font-bold text-foreground">{posts.length}</p>
                <p className="text-xs text-muted-foreground">Posts</p>
              </div>
            </div>

            {/* Academic Info Card */}
            {profile?.role && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="rounded-xl border border-border/40 bg-surface/30 p-4 mb-5"
              >
                <div className="flex items-center gap-2 mb-3">
                  {profile.role === "student" ? (
                    <GraduationCap className="h-4 w-4 text-primary" />
                  ) : (
                    <BookOpen className="h-4 w-4 text-primary" />
                  )}
                  <h3 className="text-sm font-semibold text-foreground">
                    {profile.role === "student" ? "Academic Info" : "Faculty Info"}
                  </h3>
                </div>
                {profile.role === "student" && (profile.semester || profile.batch) && (
                  <div className="flex flex-wrap gap-2">
                    {profile.semester && (
                      <span className="text-xs bg-primary/10 text-primary px-3 py-1.5 rounded-full font-medium">{profile.semester}</span>
                    )}
                    {profile.batch && (
                      <span className="text-xs bg-accent/10 text-accent px-3 py-1.5 rounded-full font-medium">Batch {profile.batch}</span>
                    )}
                  </div>
                )}
                {profile.role === "faculty" && profile.subjects && profile.subjects.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {profile.subjects.map((s) => (
                      <span key={s} className="text-xs bg-accent/10 text-accent px-3 py-1.5 rounded-full font-medium">{s}</span>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {/* Bio & Details */}
            <AnimatePresence mode="wait">
              {editing ? (
                <ProfileEditForm key="edit" form={form} setForm={setForm} />
              ) : (
                <motion.div key="view" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                  {profile?.bio && <p className="text-foreground/80 leading-relaxed text-[15px]">{profile.bio}</p>}
                  <div className="flex flex-wrap gap-2">
                    {profile?.favorite_music && (
                      <span className="flex items-center gap-1.5 text-sm text-muted-foreground bg-surface/50 rounded-full px-3.5 py-1.5 border border-border/30">
                        <Music className="h-3.5 w-3.5 text-primary" /> {profile.favorite_music}
                      </span>
                    )}
                    {profile?.quote && (
                      <span className="flex items-center gap-1.5 text-sm text-muted-foreground bg-surface/50 rounded-full px-3.5 py-1.5 italic border border-border/30">
                        <Quote className="h-3.5 w-3.5 text-primary" /> "{profile.quote}"
                      </span>
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

        {/* Posts */}
        <div className="px-1 mt-6 space-y-4">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-lg font-display font-semibold text-foreground">Your Posts</h3>
            <span className="text-xs text-muted-foreground bg-surface/40 px-2.5 py-1 rounded-full">{posts.length} posts</span>
          </div>
          {postsLoading ? (
            <div className="flex justify-center py-10"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
          ) : posts.length === 0 ? (
            <div className="text-center py-16 glass-card rounded-2xl">
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
