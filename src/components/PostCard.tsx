import { useState } from "react";
import { Heart, MessageCircle, Trash2, Share2, Pencil, MoreHorizontal, Check, X } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useNotificationsContext } from "@/contexts/NotificationsContext";
import { RoleBadge } from "@/components/RoleBadge";
import { FounderBadge } from "@/components/FounderBadge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

interface PostProfile {
  username: string | null;
  display_name: string | null;
  avatar_url: string | null;
  role?: string | null;
  founder_badge?: boolean | null;
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
  const { createNotification } = useNotificationsContext();
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [liked, setLiked] = useState(is_liked);
  const [likesNum, setLikesNum] = useState(likes_count);
  const [likeAnimating, setLikeAnimating] = useState(false);
  const [editingPost, setEditingPost] = useState(false);
  const [editPostContent, setEditPostContent] = useState(content);
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editCommentContent, setEditCommentContent] = useState("");

  const displayName = profiles?.display_name || profiles?.username || "Anonymous";
  const initials = displayName.slice(0, 2).toUpperCase();

  const handleLike = async () => {
    if (!user) return toast.error("Sign in to like posts");
    const newLiked = !liked;
    setLiked(newLiked);
    setLikesNum(newLiked ? likesNum + 1 : likesNum - 1);
    if (newLiked) {
      setLikeAnimating(true);
      setTimeout(() => setLikeAnimating(false), 600);
    }
    if (!newLiked) {
      await supabase.from("likes").delete().eq("post_id", id).eq("user_id", user.id);
    } else {
      await supabase.from("likes").insert({ post_id: id, user_id: user.id });
      createNotification(user_id, "like", id);
    }
    onRefresh();
  };

  const loadComments = async () => {
    const { data } = await supabase
      .from("comments")
      .select("*, profiles!comments_user_id_profiles_fkey(username, display_name, avatar_url)")
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
    await supabase.from("comments").insert({ post_id: id, user_id: user.id, content: newComment.trim() });
    createNotification(user_id, "comment", id);
    setNewComment("");
    setSubmitting(false);
    await loadComments();
    onRefresh();
  };

  const handleDeletePost = async () => {
    if (!user || user.id !== user_id) return;
    await supabase.from("posts").delete().eq("id", id);
    toast.success("Post deleted");
    onRefresh();
  };

  const handleEditPost = async () => {
    if (!user || !editPostContent.trim()) return;
    await supabase.from("posts").update({ content: editPostContent.trim() }).eq("id", id);
    toast.success("Post updated");
    setEditingPost(false);
    onRefresh();
  };

  const handleDeleteComment = async (commentId: string) => {
    await supabase.from("comments").delete().eq("id", commentId);
    toast.success("Comment deleted");
    await loadComments();
    onRefresh();
  };

  const handleEditComment = async () => {
    if (!editingCommentId || !editCommentContent.trim()) return;
    await supabase.from("comments").update({ content: editCommentContent.trim() }).eq("id", editingCommentId);
    toast.success("Comment updated");
    setEditingCommentId(null);
    setEditCommentContent("");
    await loadComments();
  };

  const startEditComment = (comment: Comment) => {
    setEditingCommentId(comment.id);
    setEditCommentContent(comment.content);
  };

  return (
    <motion.article layout className="glass-card rounded-2xl overflow-hidden group">
      <div className="p-5 space-y-3">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Link to={`/user/${profiles?.username || user_id}`} className="flex items-center gap-3 group/link">
            <div className="relative">
              <Avatar className="h-11 w-11 ring-2 ring-border/30 group-hover/link:ring-primary/40 transition-all duration-300">
                <AvatarImage src={profiles?.avatar_url || undefined} />
                <AvatarFallback className="bg-surface text-primary font-semibold text-sm">{initials}</AvatarFallback>
              </Avatar>
              
            </div>
            <div>
              <div className="flex items-center gap-2">
                <p className="font-semibold text-foreground group-hover/link:text-primary transition-colors text-sm">{displayName}</p>
                <RoleBadge role={profiles?.role} />
                {profiles?.founder_badge && <FounderBadge />}
              </div>
              <p className="text-xs text-muted-foreground">
                @{profiles?.username || "user"} · {formatDistanceToNow(new Date(created_at), { addSuffix: true })}
              </p>
            </div>
          </Link>
          {user?.id === user_id && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="text-muted-foreground h-8 w-8 rounded-full opacity-0 group-hover:opacity-100 transition-all">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => { setEditingPost(true); setEditPostContent(content); }}>
                  <Pencil className="h-3.5 w-3.5 mr-2" /> Edit Post
                </DropdownMenuItem>
                <DropdownMenuItem className="text-destructive" onClick={handleDeletePost}>
                  <Trash2 className="h-3.5 w-3.5 mr-2" /> Delete Post
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        {/* Content or Edit mode */}
        <AnimatePresence mode="wait">
          {editingPost ? (
            <motion.div key="edit" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-2">
              <Textarea
                value={editPostContent}
                onChange={(e) => setEditPostContent(e.target.value)}
                className="bg-surface/40 border-border/30 rounded-xl text-sm resize-none focus:ring-1 focus:ring-primary/30"
                rows={3}
              />
              <div className="flex gap-2 justify-end">
                <Button size="sm" variant="ghost" onClick={() => setEditingPost(false)} className="rounded-lg">
                  <X className="h-3.5 w-3.5 mr-1" /> Cancel
                </Button>
                <Button size="sm" onClick={handleEditPost} className="rounded-lg gradient-primary text-primary-foreground">
                  <Check className="h-3.5 w-3.5 mr-1" /> Save
                </Button>
              </div>
            </motion.div>
          ) : (
            <motion.p key="view" className="text-foreground/90 whitespace-pre-wrap leading-relaxed text-[15px]">{content}</motion.p>
          )}
        </AnimatePresence>

        {/* Image */}
        {image_url && (
          <div className="relative -mx-5 overflow-hidden">
            <img src={image_url} alt="Post" className="w-full max-h-[28rem] object-cover transition-transform duration-700 group-hover:scale-[1.02]" />
            <div className="absolute inset-0 bg-gradient-to-t from-card/30 to-transparent pointer-events-none" />
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-1 pt-1.5">
          <button
            onClick={handleLike}
            className={`relative flex items-center gap-1.5 text-sm rounded-full px-3.5 py-2 transition-all duration-200 ${
              liked ? "text-rose-400 bg-rose-400/10 font-medium" : "text-muted-foreground hover:text-rose-400 hover:bg-rose-400/5"
            }`}
          >
            <motion.div
              animate={likeAnimating ? { scale: [1, 1.5, 0.9, 1.2, 1] } : {}}
              transition={{ duration: 0.5, ease: "easeOut" }}
            >
              <Heart className={`h-[18px] w-[18px] transition-all duration-200 ${liked ? "fill-current" : ""}`} />
            </motion.div>
            <AnimatePresence>
              {likeAnimating && (
                <>
                  {[...Array(6)].map((_, i) => (
                    <motion.div
                      key={i}
                      initial={{ scale: 0, x: 0, y: 0, opacity: 1 }}
                      animate={{
                        scale: [0, 1, 0],
                        x: Math.cos((i * 60 * Math.PI) / 180) * 20,
                        y: Math.sin((i * 60 * Math.PI) / 180) * 20,
                        opacity: [1, 1, 0],
                      }}
                      transition={{ duration: 0.5 }}
                      className="absolute h-1.5 w-1.5 rounded-full bg-rose-400"
                    />
                  ))}
                </>
              )}
            </AnimatePresence>
            <span>{likesNum}</span>
          </button>
          <button
            onClick={toggleComments}
            className={`flex items-center gap-1.5 text-sm rounded-full px-3.5 py-2 transition-all duration-200 ${
              showComments ? "text-primary bg-primary/10" : "text-muted-foreground hover:text-primary hover:bg-primary/5"
            }`}
          >
            <MessageCircle className="h-[18px] w-[18px]" />
            <span>{comments_count}</span>
          </button>
          <button
            onClick={() => { navigator.clipboard.writeText(window.location.origin + `/post/${id}`); toast.success("Link copied!"); }}
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary hover:bg-primary/5 rounded-full px-3.5 py-2 transition-all duration-200 ml-auto"
          >
            <Share2 className="h-[18px] w-[18px]" />
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
            className="border-t border-border/30 overflow-hidden"
          >
            <div className="p-5 space-y-3 bg-surface/20">
              {comments.map((c, i) => (
                <motion.div
                  key={c.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex gap-2.5 group/comment"
                >
                  <Avatar className="h-7 w-7 mt-0.5">
                    <AvatarImage src={c.profiles?.avatar_url || undefined} />
                    <AvatarFallback className="bg-surface text-xs font-medium">
                      {(c.profiles?.display_name || "A").slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    {editingCommentId === c.id ? (
                      <div className="space-y-2">
                        <Textarea
                          value={editCommentContent}
                          onChange={(e) => setEditCommentContent(e.target.value)}
                          className="bg-surface/60 border-border/30 rounded-xl text-sm resize-none min-h-[36px]"
                          rows={2}
                        />
                        <div className="flex gap-1.5">
                          <Button size="sm" variant="ghost" onClick={() => setEditingCommentId(null)} className="h-7 text-xs rounded-lg">Cancel</Button>
                          <Button size="sm" onClick={handleEditComment} className="h-7 text-xs rounded-lg gradient-primary text-primary-foreground">Save</Button>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-surface/60 rounded-xl px-3.5 py-2.5 relative">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-semibold text-foreground">{c.profiles?.display_name || c.profiles?.username}</p>
                          {user?.id === c.user_id && (
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <button className="opacity-0 group-hover/comment:opacity-100 transition-opacity text-muted-foreground hover:text-foreground p-0.5 rounded">
                                  <MoreHorizontal className="h-3.5 w-3.5" />
                                </button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="min-w-[120px]">
                                <DropdownMenuItem onClick={() => startEditComment(c)}>
                                  <Pencil className="h-3 w-3 mr-1.5" /> Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem className="text-destructive" onClick={() => handleDeleteComment(c.id)}>
                                  <Trash2 className="h-3 w-3 mr-1.5" /> Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          )}
                        </div>
                        <p className="text-sm text-foreground/80 leading-relaxed">{c.content}</p>
                        <p className="text-[10px] text-muted-foreground mt-1">{formatDistanceToNow(new Date(c.created_at), { addSuffix: true })}</p>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
              {user && (
                <div className="flex gap-2 pt-1">
                  <Textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Write a comment..."
                    className="min-h-[38px] bg-surface/40 border-border/30 text-sm resize-none rounded-xl focus:ring-1 focus:ring-primary/30"
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
