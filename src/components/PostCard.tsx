import { useState } from "react";
import { Heart, MessageCircle, Trash2, Share2 } from "lucide-react";
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
  const [liked, setLiked] = useState(is_liked);
  const [likesNum, setLikesNum] = useState(likes_count);

  const displayName = profiles?.display_name || profiles?.username || "Anonymous";
  const initials = displayName.slice(0, 2).toUpperCase();

  const handleLike = async () => {
    if (!user) return toast.error("Sign in to like posts");
    // Optimistic update
    setLiked(!liked);
    setLikesNum(liked ? likesNum - 1 : likesNum + 1);
    if (liked) {
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
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="glass rounded-2xl overflow-hidden group hover:border-border transition-all duration-300"
    >
      <div className="p-5 md:p-6 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Link to={`/user/${profiles?.username || user_id}`} className="flex items-center gap-3 group/link">
            <div className="relative">
              <Avatar className="h-11 w-11 ring-2 ring-border/50 group-hover/link:ring-primary/40 transition-all duration-300">
                <AvatarImage src={profiles?.avatar_url || undefined} />
                <AvatarFallback className="bg-surface text-primary font-semibold text-sm">{initials}</AvatarFallback>
              </Avatar>
              <div className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full bg-primary/80 border-2 border-card" />
            </div>
            <div>
              <p className="font-semibold text-foreground group-hover/link:text-primary transition-colors text-sm">{displayName}</p>
              <p className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(created_at), { addSuffix: true })}
              </p>
            </div>
          </Link>
          {user?.id === user_id && (
            <Button variant="ghost" size="icon" onClick={handleDelete} className="text-muted-foreground hover:text-destructive h-8 w-8 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Content */}
        <p className="text-foreground/90 whitespace-pre-wrap leading-relaxed text-[15px]">{content}</p>

        {/* Image */}
        {image_url && (
          <div className="relative -mx-5 md:-mx-6 overflow-hidden">
            <img
              src={image_url}
              alt="Post"
              className="w-full max-h-[28rem] object-cover transition-transform duration-500 group-hover:scale-[1.01]"
            />
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-1 pt-1">
          <button
            onClick={handleLike}
            className={`flex items-center gap-1.5 text-sm rounded-full px-3 py-1.5 transition-all duration-200 ${
              liked
                ? "text-primary bg-primary/10"
                : "text-muted-foreground hover:text-primary hover:bg-primary/5"
            }`}
          >
            <motion.div
              animate={liked ? { scale: [1, 1.3, 1] } : {}}
              transition={{ duration: 0.3 }}
            >
              <Heart className={`h-4 w-4 ${liked ? "fill-current" : ""}`} />
            </motion.div>
            <span className="font-medium">{likesNum}</span>
          </button>
          <button
            onClick={toggleComments}
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary hover:bg-primary/5 rounded-full px-3 py-1.5 transition-all duration-200"
          >
            <MessageCircle className="h-4 w-4" />
            <span className="font-medium">{comments_count}</span>
          </button>
          <button
            onClick={() => { navigator.clipboard.writeText(window.location.origin + `/post/${id}`); toast.success("Link copied!"); }}
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary hover:bg-primary/5 rounded-full px-3 py-1.5 transition-all duration-200 ml-auto"
          >
            <Share2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Comments */}
      <AnimatePresence>
        {showComments && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="border-t border-border/40 overflow-hidden"
          >
            <div className="p-5 md:p-6 space-y-3">
              {comments.map((c, i) => (
                <motion.div
                  key={c.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex gap-2.5"
                >
                  <Avatar className="h-7 w-7 mt-0.5">
                    <AvatarImage src={c.profiles?.avatar_url || undefined} />
                    <AvatarFallback className="bg-surface text-xs font-medium">
                      {(c.profiles?.display_name || "A").slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 bg-surface/80 rounded-xl px-3 py-2">
                    <p className="text-xs font-semibold text-foreground">{c.profiles?.display_name || c.profiles?.username}</p>
                    <p className="text-sm text-foreground/80 leading-relaxed">{c.content}</p>
                  </div>
                </motion.div>
              ))}
              {user && (
                <div className="flex gap-2 pt-1">
                  <Textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Write a comment..."
                    className="min-h-[38px] bg-surface/60 border-border/30 text-sm resize-none rounded-xl focus:ring-1 focus:ring-primary/30"
                    rows={1}
                  />
                  <Button
                    onClick={handleComment}
                    disabled={submitting || !newComment.trim()}
                    size="sm"
                    className="self-end gradient-primary text-primary-foreground rounded-xl font-semibold"
                  >
                    Post
                  </Button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.article>
  );
}
