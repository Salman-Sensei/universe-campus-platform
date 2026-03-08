import { AppLayout } from "@/components/AppLayout";
import { PostCard } from "@/components/PostCard";
import { TrendingPosts } from "@/components/TrendingPosts";
import { PopularUsers } from "@/components/PopularUsers";
import { usePosts } from "@/hooks/usePosts";
import { Loader2, PenSquare, Sparkles } from "lucide-react";
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
            className="glass rounded-2xl p-4 flex items-center gap-3"
          >
            <div className="flex-1">
              <Link to="/create">
                <div className="bg-surface/60 rounded-xl px-4 py-2.5 text-sm text-muted-foreground hover:bg-surface-hover transition-colors cursor-pointer">
                  Share an update with your community...
                </div>
              </Link>
            </div>
            <Link to="/create">
              <Button size="sm" className="gradient-primary text-primary-foreground font-semibold rounded-xl">
                <PenSquare className="h-4 w-4 mr-1.5" /> Post
              </Button>
            </Link>
          </motion.div>

          <div className="flex items-center justify-between">
            <h2 className="text-xl font-display font-bold text-foreground">Feed</h2>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              <span>Latest posts</span>
            </div>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-24 gap-3">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">Loading feed...</p>
            </div>
          ) : posts.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-24 glass rounded-2xl"
            >
              <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center mx-auto mb-4">
                <PenSquare className="h-7 w-7 text-primary-foreground" />
              </div>
              <h3 className="font-display font-semibold text-foreground mb-2">No posts yet</h3>
              <p className="text-muted-foreground text-sm mb-5">Be the first to share something with the community!</p>
              <Link to="/create">
                <Button className="gradient-primary text-primary-foreground font-semibold rounded-xl">Create First Post</Button>
              </Link>
            </motion.div>
          ) : (
            <div className="space-y-4">
              {posts.map((post) => (
                <PostCard key={post.id} {...post} onRefresh={refresh} />
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