import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Link } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Crown, UserPlus, UserCheck } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

interface PopularUser {
  user_id: string;
  username: string | null;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  followers_count: number;
}

export function PopularUsers() {
  const { user } = useAuth();
  const [users, setUsers] = useState<PopularUser[]>([]);
  const [followingSet, setFollowingSet] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, username, display_name, avatar_url, bio")
        .order("created_at", { ascending: false });

      if (!profiles || profiles.length === 0) {
        setLoading(false);
        return;
      }

      const { data: follows } = await supabase.from("follows").select("following_id");

      const followersMap: Record<string, number> = {};
      follows?.forEach((f) => {
        followersMap[f.following_id] = (followersMap[f.following_id] || 0) + 1;
      });

      const enriched: PopularUser[] = profiles
        .filter((p) => p.user_id !== user?.id)
        .map((p) => ({
          ...p,
          followers_count: followersMap[p.user_id] || 0,
        }));

      enriched.sort((a, b) => b.followers_count - a.followers_count);

      setUsers(enriched.slice(0, 5));

      if (user) {
        const { data: myFollows } = await supabase
          .from("follows")
          .select("following_id")
          .eq("follower_id", user.id);
        if (myFollows) setFollowingSet(new Set(myFollows.map((f) => f.following_id)));
      }

      setLoading(false);
    };
    load();
  }, [user]);

  const toggleFollow = async (targetId: string) => {
    if (!user) return toast.error("Sign in to follow users");
    if (followingSet.has(targetId)) {
      await supabase.from("follows").delete().eq("follower_id", user.id).eq("following_id", targetId);
      setFollowingSet((prev) => { const s = new Set(prev); s.delete(targetId); return s; });
    } else {
      await supabase.from("follows").insert({ follower_id: user.id, following_id: targetId });
      setFollowingSet((prev) => new Set(prev).add(targetId));
    }
  };

  if (loading) {
    return (
      <div className="glass rounded-2xl p-5 space-y-3">
        <div className="flex items-center gap-2 mb-1">
          <Crown className="h-4 w-4 text-accent" />
          <h3 className="font-display font-bold text-sm text-foreground">Popular</h3>
        </div>
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex items-center gap-3 animate-pulse">
            <div className="h-9 w-9 rounded-full bg-surface" />
            <div className="flex-1 space-y-1.5">
              <div className="h-3 bg-surface rounded-full w-2/3" />
              <div className="h-2 bg-surface rounded-full w-1/3" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (users.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
      className="glass rounded-2xl p-5"
    >
      <div className="flex items-center gap-2 mb-4">
        <Crown className="h-4 w-4 text-accent" />
        <h3 className="font-display font-bold text-sm text-foreground">Popular Users</h3>
      </div>
      <div className="space-y-3">
        {users.map((u, i) => {
          const name = u.display_name || u.username || "Anonymous";
          const isFollowing = followingSet.has(u.user_id);
          return (
            <motion.div
              key={u.user_id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.06 }}
              className="flex items-center gap-3 group"
            >
              <Link to={`/user/${u.username || u.user_id}`} className="flex items-center gap-3 flex-1 min-w-0">
                <Avatar className="h-9 w-9 ring-2 ring-border/40 group-hover:ring-primary/30 transition-all">
                  <AvatarImage src={u.avatar_url || undefined} />
                  <AvatarFallback className="bg-surface text-primary font-semibold text-xs">
                    {name.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors truncate">
                    {name}
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    {u.followers_count} follower{u.followers_count !== 1 ? "s" : ""}
                  </p>
                </div>
              </Link>
              {user && (
                <Button
                  onClick={() => toggleFollow(u.user_id)}
                  variant="ghost"
                  size="icon"
                  className={`h-8 w-8 rounded-full shrink-0 ${
                    isFollowing
                      ? "text-primary bg-primary/10"
                      : "text-muted-foreground hover:text-primary hover:bg-primary/10"
                  }`}
                >
                  {isFollowing ? <UserCheck className="h-3.5 w-3.5" /> : <UserPlus className="h-3.5 w-3.5" />}
                </Button>
              )}
            </motion.div>
          );
        })}
      </div>
      <Link
        to="/discover"
        className="block text-center text-xs text-primary hover:text-primary/80 font-medium mt-4 pt-3 border-t border-border/30 transition-colors"
      >
        See all →
      </Link>
    </motion.div>
  );
}
