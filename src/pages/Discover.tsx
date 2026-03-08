import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AppLayout } from "@/components/AppLayout";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useNotificationsContext } from "@/contexts/NotificationsContext";
import { RoleBadge } from "@/components/RoleBadge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UserPlus, UserCheck, Search, Loader2, Users, Compass } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import type { Tables } from "@/integrations/supabase/types";

export default function Discover() {
  const { user } = useAuth();
  const { createNotification } = useNotificationsContext();
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
      createNotification(targetId, "follow");
    }
  };

  const filtered = profiles.filter((p) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return p.username?.toLowerCase().includes(q) || p.display_name?.toLowerCase().includes(q) || p.interests?.some((i) => i.toLowerCase().includes(q));
  });

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto p-4 md:p-6 space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3"
        >
          <div className="h-10 w-10 rounded-xl gradient-primary flex items-center justify-center">
            <Compass className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h2 className="text-xl font-display font-bold text-foreground">Discover People</h2>
            <p className="text-xs text-muted-foreground">Find and connect with your peers</p>
          </div>
        </motion.div>

        {/* Search */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="relative"
        >
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, interest, or role..."
            className="pl-11 bg-surface/40 border-border/30 rounded-xl h-12 focus:ring-1 focus:ring-primary/30 text-[15px]"
          />
        </motion.div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <div className="relative">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
            </div>
            <p className="text-sm text-muted-foreground">Finding people...</p>
          </div>
        ) : filtered.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-24 glass-card rounded-2xl">
            <Users className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">No users found</p>
          </motion.div>
        ) : (
          <div className="grid gap-3">
            {filtered.map((p, i) => {
              const name = p.display_name || p.username || "Anonymous";
              const isFollowing = followingSet.has(p.user_id);
              return (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04, duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                  className="glass-card rounded-2xl p-4 flex items-center justify-between group"
                >
                  <Link to={`/user/${p.username || p.user_id}`} className="flex items-center gap-3 flex-1 min-w-0">
                    <Avatar className="h-12 w-12 ring-2 ring-border/30 group-hover:ring-primary/30 transition-all duration-300">
                      <AvatarImage src={p.avatar_url || undefined} />
                      <AvatarFallback className="bg-surface text-primary font-semibold">{name.slice(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-foreground group-hover:text-primary transition-colors text-sm truncate">{name}</p>
                        <RoleBadge role={p.role} />
                      </div>
                      {p.bio && <p className="text-xs text-muted-foreground truncate mt-0.5">{p.bio}</p>}
                      {p.role === "student" && p.semester && (
                        <p className="text-[10px] text-muted-foreground mt-0.5">{p.semester}{p.batch ? ` · Batch ${p.batch}` : ""}</p>
                      )}
                    </div>
                  </Link>
                  {user && (
                    <Button
                      onClick={() => toggleFollow(p.user_id)}
                      variant={isFollowing ? "secondary" : "default"}
                      size="sm"
                      className={`rounded-xl shrink-0 ${isFollowing ? "bg-surface-hover text-foreground" : "gradient-primary text-primary-foreground font-semibold"}`}
                    >
                      {isFollowing ? <><UserCheck className="h-4 w-4 mr-1" /> Following</> : <><UserPlus className="h-4 w-4 mr-1" /> Follow</>}
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
