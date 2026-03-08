import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { TrendingUp, Heart, MessageCircle } from "lucide-react";
import { motion } from "framer-motion";
import { formatDistanceToNow } from "date-fns";

interface TrendingPost {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  username: string | null;
  display_name: string | null;
  likes_count: number;
  comments_count: number;
}

export function TrendingPosts() {
  const [posts, setPosts] = useState<TrendingPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const { data: postsData } = await supabase
        .from("posts")
        .select("id, content, created_at, user_id, profiles!posts_user_id_profiles_fkey(username, display_name)")
        .order("created_at", { ascending: false })
        .limit(20);

      if (!postsData || postsData.length === 0) {
        setLoading(false);
        return;
      }

      const postIds = postsData.map((p) => p.id);

      const [likesRes, commentsRes] = await Promise.all([
        supabase.from("likes").select("post_id").in("post_id", postIds),
        supabase.from("comments").select("post_id").in("post_id", postIds),
      ]);

      const likesMap: Record<string, number> = {};
      const commentsMap: Record<string, number> = {};
      likesRes.data?.forEach((l) => { likesMap[l.post_id] = (likesMap[l.post_id] || 0) + 1; });
      commentsRes.data?.forEach((c) => { commentsMap[c.post_id] = (commentsMap[c.post_id] || 0) + 1; });

      const enriched: TrendingPost[] = postsData.map((p) => {
        const profile = p.profiles as unknown as { username: string | null; display_name: string | null };
        return {
          id: p.id,
          content: p.content,
          created_at: p.created_at,
          user_id: p.user_id,
          username: profile?.username,
          display_name: profile?.display_name,
          likes_count: likesMap[p.id] || 0,
          comments_count: commentsMap[p.id] || 0,
        };
      });

      // Sort by engagement (likes + comments)
      enriched.sort((a, b) => (b.likes_count + b.comments_count) - (a.likes_count + a.comments_count));

      setPosts(enriched.slice(0, 5));
      setLoading(false);
    };
    load();
  }, []);

  if (loading) {
    return (
      <div className="glass rounded-2xl p-5 space-y-3">
        <div className="flex items-center gap-2 mb-1">
          <TrendingUp className="h-4 w-4 text-primary" />
          <h3 className="font-display font-bold text-sm text-foreground">Trending</h3>
        </div>
        {[...Array(3)].map((_, i) => (
          <div key={i} className="animate-pulse space-y-2">
            <div className="h-3 bg-surface rounded-full w-3/4" />
            <div className="h-2 bg-surface rounded-full w-1/2" />
          </div>
        ))}
      </div>
    );
  }

  if (posts.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
      className="glass rounded-2xl p-5"
    >
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp className="h-4 w-4 text-primary" />
        <h3 className="font-display font-bold text-sm text-foreground">Trending Posts</h3>
      </div>
      <div className="space-y-3">
        {posts.map((post, i) => (
          <motion.div
            key={post.id}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.06 }}
          >
            <Link
              to={`/user/${post.username || post.user_id}`}
              className="block group rounded-xl p-3 -mx-1 hover:bg-surface-hover transition-all duration-200"
            >
              <p className="text-xs text-muted-foreground mb-1 group-hover:text-primary/70 transition-colors">
                {post.display_name || post.username || "Anonymous"} · {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
              </p>
              <p className="text-sm text-foreground/80 line-clamp-2 leading-relaxed">
                {post.content}
              </p>
              <div className="flex items-center gap-3 mt-2">
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Heart className="h-3 w-3" /> {post.likes_count}
                </span>
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <MessageCircle className="h-3 w-3" /> {post.comments_count}
                </span>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
