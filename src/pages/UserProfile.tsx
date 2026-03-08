import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { AppLayout } from "@/components/AppLayout";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { PostCard } from "@/components/PostCard";
import { usePosts } from "@/hooks/usePosts";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { UserPlus, UserMinus, Music, Quote, Tag, Loader2 } from "lucide-react";
import { toast } from "sonner";
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
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("username", username)
        .single();

      if (data) {
        setProfile(data);

        const [followers, following] = await Promise.all([
          supabase.from("follows").select("id", { count: "exact" }).eq("following_id", data.user_id),
          supabase.from("follows").select("id", { count: "exact" }).eq("follower_id", data.user_id),
        ]);
        setFollowersCount(followers.count || 0);
        setFollowingCount(following.count || 0);

        if (user) {
          const { data: followData } = await supabase
            .from("follows")
            .select("id")
            .eq("follower_id", user.id)
            .eq("following_id", data.user_id)
            .maybeSingle();
          setIsFollowing(!!followData);
        }
      }
      setLoading(false);
    };
    load();
  }, [username, user]);

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
    }
    toast.success(isFollowing ? "Unfollowed" : "Following!");
  };

  if (loading) return (
    <AppLayout>
      <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
    </AppLayout>
  );

  if (!profile) return (
    <AppLayout>
      <div className="text-center py-20 text-muted-foreground">User not found</div>
    </AppLayout>
  );

  const displayName = profile.display_name || profile.username || "Anonymous";
  const isOwnProfile = user?.id === profile.user_id;

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto p-4 md:p-6 space-y-6">
        <div className="glass rounded-xl p-6 space-y-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <Avatar className="h-20 w-20 ring-2 ring-primary/30">
                <AvatarImage src={profile.avatar_url || undefined} />
                <AvatarFallback className="bg-primary/10 text-primary text-xl">{displayName.slice(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div>
                <h2 className="text-xl font-display font-bold text-foreground">{displayName}</h2>
                <p className="text-sm text-muted-foreground">@{profile.username || "user"}</p>
                <div className="flex gap-4 mt-1 text-sm text-muted-foreground">
                  <span><strong className="text-foreground">{followersCount}</strong> followers</span>
                  <span><strong className="text-foreground">{followingCount}</strong> following</span>
                </div>
              </div>
            </div>
            {!isOwnProfile && user && (
              <Button onClick={toggleFollow} variant={isFollowing ? "secondary" : "default"} size="sm" className={isFollowing ? "" : "gradient-primary text-primary-foreground"}>
                {isFollowing ? <><UserMinus className="mr-1 h-4 w-4" /> Unfollow</> : <><UserPlus className="mr-1 h-4 w-4" /> Follow</>}
              </Button>
            )}
          </div>

          <div className="space-y-2">
            {profile.bio && <p className="text-foreground/80">{profile.bio}</p>}
            {profile.favorite_music && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Music className="h-4 w-4 text-primary" /> {profile.favorite_music}
              </div>
            )}
            {profile.quote && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground italic">
                <Quote className="h-4 w-4 text-primary" /> "{profile.quote}"
              </div>
            )}
            {profile.interests && profile.interests.length > 0 && (
              <div className="flex items-center gap-2 flex-wrap">
                <Tag className="h-4 w-4 text-primary" />
                {profile.interests.map((i) => (
                  <span key={i} className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">{i}</span>
                ))}
              </div>
            )}
          </div>
        </div>

        <h3 className="text-lg font-display font-semibold text-foreground">Posts</h3>
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
