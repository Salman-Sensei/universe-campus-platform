import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/AppLayout";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { PostCard } from "@/components/PostCard";
import { usePosts } from "@/hooks/usePosts";
import { RoleBadge } from "@/components/RoleBadge";
import { FounderBadge } from "@/components/FounderBadge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { UserPlus, UserMinus, Music, Quote, Tag, Loader2, GraduationCap, BookOpen, MessageCircle } from "lucide-react";

import { useNotificationsContext } from "@/contexts/NotificationsContext";
import { toast } from "sonner";
import { motion } from "framer-motion";
import type { Tables } from "@/integrations/supabase/types";

export default function UserProfile() {
  const { username } = useParams<{ username: string }>();
  const { user } = useAuth();
  const [profile, setProfile] = useState<Tables<"profiles"> | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const { posts, loading: postsLoading, refresh } = usePosts(profile?.user_id);

  useEffect(() => {
    if (!username) return;
    const load = async () => {
      setLoading(true);
      const { data } = await supabase.from("profiles").select("*").eq("username", username).single();
      if (data) {
        setProfile(data);
        const [followers, following] = await Promise.all([
          supabase.from("follows").select("id", { count: "exact" }).eq("following_id", data.user_id),
          supabase.from("follows").select("id", { count: "exact" }).eq("follower_id", data.user_id),
        ]);
        setFollowersCount(followers.count || 0);
        setFollowingCount(following.count || 0);
        if (user) {
          const { data: followData } = await supabase.from("follows").select("id").eq("follower_id", user.id).eq("following_id", data.user_id).maybeSingle();
          setIsFollowing(!!followData);
        }
      }
      setLoading(false);
    };
    load();
  }, [username, user]);

  const { createNotification } = useNotificationsContext();

  const toggleFollow = async () => {
    if (!user || !profile) return;
    if (isFollowing) {
      await supabase.from("follows").delete().eq("follower_id", user.id).eq("following_id", profile.user_id);
      setIsFollowing(false);
      setFollowersCount((c) => c - 1);
    } else {
      await supabase.from("follows").insert({ follower_id: user.id, following_id: profile.user_id });
      setIsFollowing(true);
      setFollowersCount((c) => c + 1);
      createNotification(profile.user_id, "follow");
    }
    toast.success(isFollowing ? "Unfollowed" : "Following!");
  };

  if (loading) return (
    <AppLayout><div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div></AppLayout>
  );
  if (!profile) return (
    <AppLayout><div className="text-center py-20 text-muted-foreground">User not found</div></AppLayout>
  );

  const displayName = profile.display_name || profile.username || "Anonymous";
  const isOwnProfile = user?.id === profile.user_id;

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto pb-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl overflow-hidden border border-border/40 bg-card"
        >
          {/* Cover Banner */}
          <div className="relative h-[200px] md:h-[260px] overflow-hidden">
            {profile.banner_url ? (
              <img src={profile.banner_url} alt="Profile banner" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full relative">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/30 via-accent/20 to-primary/10" />
                <div className="absolute inset-0 opacity-40" style={{ backgroundImage: 'radial-gradient(circle at 30% 40%, hsl(var(--primary) / 0.4) 0%, transparent 50%), radial-gradient(circle at 70% 60%, hsl(var(--glow-secondary) / 0.3) 0%, transparent 50%)' }} />
              </div>
            )}
          </div>

          <div className="px-5 md:px-8 pb-6 relative">
            <div className="flex items-end justify-between -mt-16 relative z-10 mb-5">
              <Avatar className="h-32 w-32 ring-4 ring-card shadow-xl">
                <AvatarImage src={profile.avatar_url || undefined} className="object-cover" />
                <AvatarFallback className="bg-muted text-primary text-3xl font-bold">{displayName.slice(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
              {!isOwnProfile && user && (
                <Button
                  onClick={toggleFollow}
                  variant={isFollowing ? "outline" : "default"}
                  size="sm"
                  className={`rounded-full font-semibold px-5 mt-16 ${!isFollowing ? "gradient-primary text-primary-foreground" : ""}`}
                >
                  {isFollowing ? <><UserMinus className="mr-1.5 h-4 w-4" /> Unfollow</> : <><UserPlus className="mr-1.5 h-4 w-4" /> Follow</>}
                </Button>
              )}
            </div>

            <div className="flex items-center gap-2.5 mb-1">
              <h1 className="text-2xl md:text-3xl font-display font-bold text-foreground">{displayName}</h1>
              <RoleBadge role={profile.role} size="md" />
              {(profile as any).founder_badge && <FounderBadge size="md" />}
            </div>
            <p className="text-sm text-muted-foreground mb-4">@{profile.username || "user"}</p>

            {/* Stats */}
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

            {/* Academic Info */}
            {profile.role && (
              <div className="rounded-xl border border-border/40 bg-surface/30 p-4 mb-5">
                <div className="flex items-center gap-2 mb-3">
                  {profile.role === "student" ? <GraduationCap className="h-4 w-4 text-primary" /> : <BookOpen className="h-4 w-4 text-primary" />}
                  <h3 className="text-sm font-semibold text-foreground">{profile.role === "student" ? "Academic Info" : "Faculty Info"}</h3>
                </div>
                {profile.role === "student" && (profile.semester || profile.batch) && (
                  <div className="flex flex-wrap gap-2">
                    {profile.semester && <span className="text-xs bg-primary/10 text-primary px-3 py-1.5 rounded-full font-medium">{profile.semester}</span>}
                    {profile.batch && <span className="text-xs bg-accent/10 text-accent px-3 py-1.5 rounded-full font-medium">Batch {profile.batch}</span>}
                  </div>
                )}
                {profile.role === "faculty" && profile.subjects && profile.subjects.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {profile.subjects.map((s) => (
                      <span key={s} className="text-xs bg-accent/10 text-accent px-3 py-1.5 rounded-full font-medium">{s}</span>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Bio & Details */}
            <div className="space-y-4">
              {profile.bio && <p className="text-foreground/80 leading-relaxed text-[15px]">{profile.bio}</p>}
              <div className="flex flex-wrap gap-2">
                {profile.favorite_music && (
                  <span className="flex items-center gap-1.5 text-sm text-muted-foreground bg-surface/50 rounded-full px-3.5 py-1.5 border border-border/30">
                    <Music className="h-3.5 w-3.5 text-primary" /> {profile.favorite_music}
                  </span>
                )}
                {profile.quote && (
                  <span className="flex items-center gap-1.5 text-sm text-muted-foreground bg-surface/50 rounded-full px-3.5 py-1.5 italic border border-border/30">
                    <Quote className="h-3.5 w-3.5 text-primary" /> "{profile.quote}"
                  </span>
                )}
              </div>
              {profile.interests && profile.interests.length > 0 && (
                <div className="flex items-center gap-2 flex-wrap">
                  <Tag className="h-3.5 w-3.5 text-primary" />
                  {profile.interests.map((i) => (
                    <span key={i} className="text-xs bg-primary/10 text-primary px-2.5 py-1 rounded-full font-medium">{i}</span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Posts */}
        <div className="px-1 mt-6 space-y-4">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-lg font-display font-semibold text-foreground">Posts</h3>
            <span className="text-xs text-muted-foreground bg-surface/40 px-2.5 py-1 rounded-full">{posts.length} posts</span>
          </div>
          {postsLoading ? (
            <div className="flex justify-center py-10"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
          ) : posts.length === 0 ? (
            <div className="text-center py-16 glass-card rounded-2xl">
              <p className="text-muted-foreground text-sm">No posts yet.</p>
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
