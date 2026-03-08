import { AppLayout } from "@/components/AppLayout";
import { PostCard } from "@/components/PostCard";
import { TrendingPosts } from "@/components/TrendingPosts";
import { PopularUsers } from "@/components/PopularUsers";
import { usePosts } from "@/hooks/usePosts";
import { Loader2, PenSquare, Sparkles, Flame } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

export default function Feed() {
  const { posts, loading, refresh } = usePosts();

  return (
    <AppLayout>
      <div className="max-w-[1100px] mx-auto p-4 md:p-6 flex gap-6">
        {/* Main feed column */}
        <div className="flex-1 min-w-0 space-y-5">
          {/* Quick compose bar */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card rounded-2xl p-4 flex items-center gap-3"
          >
            <div className="flex-1">
              <Link to="/create">
                <div className="bg-surface/50 rounded-xl px-4 py-3 text-sm text-muted-foreground hover:bg-surface-hover hover:text-foreground transition-all duration-200 cursor-pointer border border-border/20">
                  ✨ Share an update with your community...
                </div>
              </Link>
            </div>
            <Link to="/create">
              <Button size="sm" className="gradient-primary text-primary-foreground font-semibold rounded-xl h-10 px-5">
                <PenSquare className="h-4 w-4 mr-1.5" /> Post
              </Button>
            </Link>
          </motion.div>

          {/* Feed header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Flame className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-display font-bold text-foreground">Feed</h2>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-surface/40 px-3 py-1.5 rounded-full">
              <Sparkles className="h-3 w-3 text-primary" />
              <span>Latest posts</span>
            </div>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-24 gap-4">
              <div className="relative">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
                <div className="absolute inset-0 animate-ping opacity-20">
                  <Loader2 className="h-10 w-10 text-primary" />
                </div>
              </div>
              <p className="text-sm text-muted-foreground">Loading your feed...</p>
            </div>
          ) : posts.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-24 glass-card rounded-2xl"
            >
              <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center mx-auto mb-4 shadow-lg">
                <PenSquare className="h-7 w-7 text-primary-foreground" />
              </div>
              <h3 className="font-display font-semibold text-foreground mb-2 text-lg">No posts yet</h3>
              <p className="text-muted-foreground text-sm mb-6 max-w-xs mx-auto">Be the first to share something with the community!</p>
              <Link to="/create">
                <Button className="gradient-primary text-primary-foreground font-semibold rounded-xl px-6">Create First Post</Button>
              </Link>
            </motion.div>
          ) : (
            <div className="space-y-4">
              {posts.map((post, i) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                >
                  <PostCard {...post} onRefresh={refresh} />
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Right sidebar */}
        <aside className="hidden lg:flex flex-col gap-5 w-[300px] shrink-0 sticky top-20 self-start">
          <TrendingPosts />
          <PopularUsers />
        </aside>
      </div>
    </AppLayout>
  );
}
