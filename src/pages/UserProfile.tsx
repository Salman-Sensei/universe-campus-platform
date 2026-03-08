import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { AppLayout } from "@/components/AppLayout";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { PostCard } from "@/components/PostCard";
import { usePosts } from "@/hooks/usePosts";
import { RoleBadge } from "@/components/RoleBadge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { UserPlus, UserMinus, Music, Quote, Tag, Loader2 } from "lucide-react";
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
  const profileAny = profile as any;

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto pb-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-b-2xl overflow-hidden noise"
        >
          {/* Cover Banner */}
          <div className="relative h-[250px] overflow-hidden">
            {profile.banner_url ? (
              <img src={profile.banner_url} alt="Profile banner" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-primary/30 via-accent/20 to-primary/10" />
            )}
          </div>

          <div className="px-6 pb-6 -mt-16 relative z-10">
            <div className="flex items-end justify-between mb-3">
              <Avatar className="h-28 w-28 ring-4 ring-card shadow-lg">
                <AvatarImage src={profile.avatar_url || undefined} />
                <AvatarFallback className="bg-surface text-primary text-3xl font-bold">{displayName.slice(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
              {!isOwnProfile && user && (
                <Button
                  onClick={toggleFollow}
                  variant={isFollowing ? "secondary" : "default"}
                  size="sm"
                  className={`rounded-xl font-semibold mb-1 ${isFollowing ? "bg-surface-hover" : "gradient-primary text-primary-foreground"}`}
                >
                  {isFollowing ? <><UserMinus className="mr-1.5 h-4 w-4" /> Unfollow</> : <><UserPlus className="mr-1.5 h-4 w-4" /> Follow</>}
                </Button>
              )}
            </div>

            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-2xl font-display font-bold text-foreground">{displayName}</h2>
              <RoleBadge role={profileAny.role} size="md" />
            </div>
            <p className="text-sm text-muted-foreground mb-1">@{profile.username || "user"}</p>

            {profileAny.role === "student" && (profileAny.semester || profileAny.batch) && (
              <p className="text-xs text-muted-foreground mb-2">
                {profileAny.semester && <span>{profileAny.semester}</span>}
                {profileAny.semester && profileAny.batch && <span> · </span>}
                {profileAny.batch && <span>Batch {profileAny.batch}</span>}
              </p>
            )}
            {profileAny.role === "faculty" && profileAny.subjects?.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-2">
                {(profileAny.subjects as string[]).map((s: string) => (
                  <span key={s} className="text-[10px] bg-accent/15 text-accent px-2 py-0.5 rounded-full font-medium">{s}</span>
                ))}
              </div>
            )}

            <div className="flex gap-5 text-sm text-muted-foreground mb-4">
              <span><strong className="text-foreground font-semibold">{followersCount}</strong> followers</span>
              <span><strong className="text-foreground font-semibold">{followingCount}</strong> following</span>
            </div>

            <div className="space-y-3">
              {profile.bio && <p className="text-foreground/80 leading-relaxed">{profile.bio}</p>}
              <div className="flex flex-wrap gap-2">
                {profile.favorite_music && (
                  <span className="flex items-center gap-1.5 text-sm text-muted-foreground bg-surface/60 rounded-full px-3 py-1">
                    <Music className="h-3.5 w-3.5 text-primary" /> {profile.favorite_music}
                  </span>
                )}
                {profile.quote && (
                  <span className="flex items-center gap-1.5 text-sm text-muted-foreground bg-surface/60 rounded-full px-3 py-1 italic">
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

        <div className="px-4 md:px-6 mt-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-display font-semibold text-foreground">Posts</h3>
            <span className="text-xs text-muted-foreground">{posts.length} posts</span>
          </div>
          {postsLoading ? (
            <div className="flex justify-center py-10"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
          ) : posts.length === 0 ? (
            <div className="text-center py-16 glass rounded-2xl">
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