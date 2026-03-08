import { AppLayout } from "@/components/AppLayout";
import { PostCard } from "@/components/PostCard";
import { usePosts } from "@/hooks/usePosts";
import { Loader2 } from "lucide-react";

export default function Feed() {
  const { posts, loading, refresh } = usePosts();

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto p-4 md:p-6 space-y-4">
        <h2 className="text-2xl font-display font-bold text-foreground">Global Feed</h2>
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            <p>No posts yet. Be the first to share something!</p>
          </div>
        ) : (
          posts.map((post) => (
            <PostCard key={post.id} {...post} onRefresh={refresh} />
          ))
        )}
      </div>
    </AppLayout>
  );
}
