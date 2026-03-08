import { useState } from "react";
import { Heart, MessageCircle, Trash2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

interface PostProfile {
  username: string | null;
  display_name: string | null;
  avatar_url: string | null;
}

interface Comment {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  profiles: PostProfile;
}

interface PostCardProps {
  id: string;
  content: string;
  image_url: string | null;
  created_at: string;
  user_id: string;
  profiles: PostProfile;
  likes_count: number;
  comments_count: number;
  is_liked: boolean;
  onRefresh: () => void;
}

export function PostCard({
  id, content, image_url, created_at, user_id, profiles,
  likes_count, comments_count, is_liked, onRefresh,
}: PostCardProps) {
  const { user } = useAuth();
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const displayName = profiles?.display_name || profiles?.username || "Anonymous";
  const initials = displayName.slice(0, 2).toUpperCase();

  const handleLike = async () => {
    if (!user) return toast.error("Sign in to like posts");
    if (is_liked) {
      await supabase.from("likes").delete().eq("post_id", id).eq("user_id", user.id);
    } else {
      await supabase.from("likes").insert({ post_id: id, user_id: user.id });
    }
    onRefresh();
  };

  const loadComments = async () => {
    const { data } = await supabase
      .from("comments")
      .select("*, profiles:user_id(username, display_name, avatar_url)")
      .eq("post_id", id)
      .order("created_at", { ascending: true });
    if (data) setComments(data as unknown as Comment[]);
  };

  const toggleComments = async () => {
    if (!showComments) await loadComments();
    setShowComments(!showComments);
  };

  const handleComment = async () => {
    if (!user) return toast.error("Sign in to comment");
    if (!newComment.trim()) return;
    setSubmitting(true);
    await supabase.from("comments").insert({
      post_id: id,
      user_id: user.id,
      content: newComment.trim(),
    });
    setNewComment("");
    setSubmitting(false);
    await loadComments();
    onRefresh();
  };

  const handleDelete = async () => {
    if (!user || user.id !== user_id) return;
    await supabase.from("posts").delete().eq("id", id);
    toast.success("Post deleted");
    onRefresh();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass rounded-lg p-5 space-y-3"
    >
      <div className="flex items-center justify-between">
        <Link to={`/user/${profiles?.username || user_id}`} className="flex items-center gap-3 group">
          <Avatar className="h-10 w-10 ring-2 ring-primary/20">
            <AvatarImage src={profiles?.avatar_url || undefined} />
            <AvatarFallback className="bg-primary/10 text-primary text-sm">{initials}</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium text-foreground group-hover:text-primary transition-colors">{displayName}</p>
            <p className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(created_at), { addSuffix: true })}
            </p>
          </div>
        </Link>
        {user?.id === user_id && (
          <Button variant="ghost" size="icon" onClick={handleDelete} className="text-muted-foreground hover:text-destructive">
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </div>

      <p className="text-foreground/90 whitespace-pre-wrap">{content}</p>

      {image_url && (
        <img src={image_url} alt="Post" className="rounded-md w-full max-h-96 object-cover" />
      )}

      <div className="flex items-center gap-4 pt-2">
        <button
          onClick={handleLike}
          className={`flex items-center gap-1.5 text-sm transition-colors ${
            is_liked ? "text-primary" : "text-muted-foreground hover:text-primary"
          }`}
        >
          <Heart className={`h-4 w-4 ${is_liked ? "fill-current" : ""}`} />
          {likes_count}
        </button>
        <button
          onClick={toggleComments}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors"
        >
          <MessageCircle className="h-4 w-4" />
          {comments_count}
        </button>
      </div>

      <AnimatePresence>
        {showComments && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="space-y-3 pt-3 border-t border-border/50 overflow-hidden"
          >
            {comments.map((c) => (
              <div key={c.id} className="flex gap-2">
                <Avatar className="h-7 w-7">
                  <AvatarImage src={c.profiles?.avatar_url || undefined} />
                  <AvatarFallback className="bg-surface text-xs">
                    {(c.profiles?.display_name || "A").slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 bg-surface rounded-md p-2">
                  <p className="text-xs font-medium text-foreground">{c.profiles?.display_name || c.profiles?.username}</p>
                  <p className="text-sm text-foreground/80">{c.content}</p>
                </div>
              </div>
            ))}
            {user && (
              <div className="flex gap-2">
                <Textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Write a comment..."
                  className="min-h-[40px] bg-surface border-border/50 text-sm resize-none"
                  rows={1}
                />
                <Button
                  onClick={handleComment}
                  disabled={submitting || !newComment.trim()}
                  size="sm"
                  className="self-end"
                >
                  Post
                </Button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
