import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AppLayout } from "@/components/AppLayout";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UserPlus, Search, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import type { Tables } from "@/integrations/supabase/types";

export default function Discover() {
  const { user } = useAuth();
  const [profiles, setProfiles] = useState<Tables<"profiles">[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [followingSet, setFollowingSet] = useState<Set<string>>(new Set());

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const { data } = await supabase.from("profiles").select("*").order("created_at", { ascending: false });
      if (data) setProfiles(data.filter((p) => p.user_id !== user?.id));

      if (user) {
        const { data: follows } = await supabase.from("follows").select("following_id").eq("follower_id", user.id);
        if (follows) setFollowingSet(new Set(follows.map((f) => f.following_id)));
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

  const filtered = profiles.filter((p) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      p.username?.toLowerCase().includes(q) ||
      p.display_name?.toLowerCase().includes(q) ||
      p.interests?.some((i) => i.toLowerCase().includes(q))
    );
  });

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto p-4 md:p-6 space-y-6">
        <h2 className="text-2xl font-display font-bold text-foreground">Discover People</h2>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or interest..."
            className="pl-10 bg-surface border-border/50"
          />
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
        ) : filtered.length === 0 ? (
          <p className="text-center py-20 text-muted-foreground">No users found</p>
        ) : (
          <div className="grid gap-3">
            {filtered.map((p, i) => {
              const name = p.display_name || p.username || "Anonymous";
              const isFollowing = followingSet.has(p.user_id);
              return (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="glass rounded-lg p-4 flex items-center justify-between"
                >
                  <Link to={`/user/${p.username || p.user_id}`} className="flex items-center gap-3 flex-1 min-w-0 group">
                    <Avatar className="h-12 w-12 ring-2 ring-primary/20">
                      <AvatarImage src={p.avatar_url || undefined} />
                      <AvatarFallback className="bg-primary/10 text-primary">{name.slice(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="font-medium text-foreground group-hover:text-primary transition-colors truncate">{name}</p>
                      {p.bio && <p className="text-sm text-muted-foreground truncate">{p.bio}</p>}
                      {p.interests && p.interests.length > 0 && (
                        <div className="flex gap-1 mt-1 flex-wrap">
                          {p.interests.slice(0, 3).map((tag) => (
                            <span key={tag} className="text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded-full">{tag}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  </Link>
                  {user && (
                    <Button
                      onClick={() => toggleFollow(p.user_id)}
                      variant={isFollowing ? "secondary" : "default"}
                      size="sm"
                      className={isFollowing ? "" : "gradient-primary text-primary-foreground"}
                    >
                      <UserPlus className="h-4 w-4" />
                    </Button>
                  )}
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
