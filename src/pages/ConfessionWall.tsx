import { useState, useEffect, useCallback } from "react";
import { AppLayout } from "@/components/AppLayout";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { Ghost, Send, Loader2, MessageCircle, ShieldCheck, Flame } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface Confession {
  id: string;
  content: string;
  created_at: string;
  reactions: Record<string, number>;
  user_reactions: string[];
  comments_count: number;
}

interface ConfessionComment {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  profiles?: { username: string | null; display_name: string | null; avatar_url: string | null };
}

const REACTIONS = ["❤️", "😂", "😮", "😢", "🔥"];

export default function ConfessionWall() {
  const { user } = useAuth();
  const [confessions, setConfessions] = useState<Confession[]>([]);
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState("");
  const [posting, setPosting] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [comments, setComments] = useState<Record<string, ConfessionComment[]>>({});
  const [commentText, setCommentText] = useState<Record<string, string>>({});

  const fetchConfessions = useCallback(async () => {
    const { data: confData } = await supabase
      .from("confessions")
      .select("id, content, created_at")
      .order("created_at", { ascending: false })
      .limit(50);

    if (!confData) { setLoading(false); return; }

    const ids = confData.map(c => c.id);

    const [reactionsRes, userReactionsRes, commentsCountRes] = await Promise.all([
      supabase.from("confession_reactions").select("confession_id, reaction").in("confession_id", ids),
      user
        ? supabase.from("confession_reactions").select("confession_id, reaction").eq("user_id", user.id).in("confession_id", ids)
        : Promise.resolve({ data: [] }),
      supabase.from("confession_comments").select("confession_id").in("confession_id", ids),
    ]);

    const reactionsMap: Record<string, Record<string, number>> = {};
    reactionsRes.data?.forEach(r => {
      if (!reactionsMap[r.confession_id]) reactionsMap[r.confession_id] = {};
      reactionsMap[r.confession_id][r.reaction] = (reactionsMap[r.confession_id][r.reaction] || 0) + 1;
    });

    const userReactionsMap: Record<string, string[]> = {};
    (userReactionsRes.data as any[])?.forEach(r => {
      if (!userReactionsMap[r.confession_id]) userReactionsMap[r.confession_id] = [];
      userReactionsMap[r.confession_id].push(r.reaction);
    });

    const commentsMap: Record<string, number> = {};
    commentsCountRes.data?.forEach(c => {
      commentsMap[c.confession_id] = (commentsMap[c.confession_id] || 0) + 1;
    });

    setConfessions(confData.map(c => ({
      ...c,
      reactions: reactionsMap[c.id] || {},
      user_reactions: userReactionsMap[c.id] || [],
      comments_count: commentsMap[c.id] || 0,
    })));
    setLoading(false);
  }, [user]);

  useEffect(() => { fetchConfessions(); }, [fetchConfessions]);

  const handlePost = async () => {
    if (!content.trim() || !user) return;
    setPosting(true);

    try {
      // AI moderation
      const { data: modResult, error: modError } = await supabase.functions.invoke("moderate-confession", {
        body: { content: content.trim() },
      });

      if (modError) {
        console.error("Moderation error:", modError);
      } else if (modResult && !modResult.allowed) {
        toast.error(`Post rejected: ${modResult.reason || "Content policy violation"}`);
        setPosting(false);
        return;
      }

      const { error } = await supabase.from("confessions").insert({
        user_id: user.id,
        content: content.trim(),
      });

      if (error) throw error;
      setContent("");
      toast.success("Confession posted anonymously!");
      fetchConfessions();
    } catch (e: any) {
      toast.error(e.message || "Failed to post");
    }
    setPosting(false);
  };

  const handleReact = async (confessionId: string, reaction: string) => {
    if (!user) return;
    const confession = confessions.find(c => c.id === confessionId);
    if (!confession) return;

    const hasReacted = confession.user_reactions.includes(reaction);

    if (hasReacted) {
      await supabase.from("confession_reactions")
        .delete()
        .eq("confession_id", confessionId)
        .eq("user_id", user.id)
        .eq("reaction", reaction);
    } else {
      await supabase.from("confession_reactions").insert({
        confession_id: confessionId,
        user_id: user.id,
        reaction,
      });
    }
    fetchConfessions();
  };

  const loadComments = async (confessionId: string) => {
    const { data } = await supabase
      .from("confession_comments")
      .select("id, content, created_at, user_id")
      .eq("confession_id", confessionId)
      .order("created_at", { ascending: true });

    if (!data) return;

    // Fetch profiles for commenters
    const userIds = [...new Set(data.map(c => c.user_id))];
    const { data: profiles } = await supabase
      .from("profiles")
      .select("user_id, username, display_name, avatar_url")
      .in("user_id", userIds);

    const profileMap: Record<string, any> = {};
    profiles?.forEach(p => { profileMap[p.user_id] = p; });

    setComments(prev => ({
      ...prev,
      [confessionId]: data.map(c => ({
        ...c,
        profiles: profileMap[c.user_id] || null,
      })),
    }));
  };

  const toggleComments = (id: string) => {
    if (expandedId === id) {
      setExpandedId(null);
    } else {
      setExpandedId(id);
      loadComments(id);
    }
  };

  const handleComment = async (confessionId: string) => {
    if (!user || !commentText[confessionId]?.trim()) return;
    await supabase.from("confession_comments").insert({
      confession_id: confessionId,
      user_id: user.id,
      content: commentText[confessionId].trim(),
    });
    setCommentText(prev => ({ ...prev, [confessionId]: "" }));
    loadComments(confessionId);
    fetchConfessions();
  };

  return (
    <AppLayout>
      <div className="max-w-[700px] mx-auto p-4 md:p-6 space-y-5">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-accent to-primary flex items-center justify-center shadow-lg">
            <Ghost className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-2xl font-display font-bold text-foreground">Confession Wall</h1>
            <p className="text-sm text-muted-foreground flex items-center gap-1">
              <ShieldCheck className="h-3 w-3" /> Your identity is completely hidden
            </p>
          </div>
        </motion.div>

        {/* Post form */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card rounded-2xl p-5 hover:translate-y-0"
        >
          <Textarea
            placeholder="Share your confession anonymously... 🤫"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="bg-surface/50 border-border/20 rounded-xl resize-none min-h-[100px] text-sm"
            maxLength={1000}
          />
          <div className="flex items-center justify-between mt-3">
            <span className="text-xs text-muted-foreground">{content.length}/1000</span>
            <Button
              onClick={handlePost}
              disabled={!content.trim() || posting}
              className="gradient-primary text-primary-foreground rounded-xl font-semibold"
              size="sm"
            >
              {posting ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Send className="h-4 w-4 mr-1" />}
              Post Anonymously
            </Button>
          </div>
        </motion.div>

        {/* Confessions list */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : confessions.length === 0 ? (
          <div className="text-center py-20 glass-card rounded-2xl hover:translate-y-0">
            <Ghost className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">No confessions yet. Be the first!</p>
          </div>
        ) : (
          <div className="space-y-4">
            <AnimatePresence>
              {confessions.map((c, i) => (
                <motion.div
                  key={c.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="glass-card rounded-2xl p-5 hover:translate-y-0"
                >
                  {/* Anonymous header */}
                  <div className="flex items-center gap-3 mb-3">
                    <Avatar className="h-9 w-9 ring-2 ring-accent/30">
                      <AvatarFallback className="bg-gradient-to-br from-accent/20 to-primary/20 text-accent text-sm">
                        <Ghost className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <span className="font-semibold text-sm text-foreground">Anonymous Student</span>
                      <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(c.created_at), { addSuffix: true })}
                      </p>
                    </div>
                  </div>

                  {/* Content */}
                  <p className="text-foreground text-sm leading-relaxed mb-4 whitespace-pre-wrap">{c.content}</p>

                  {/* Reactions */}
                  <div className="flex items-center gap-1.5 flex-wrap mb-2">
                    {REACTIONS.map(emoji => {
                      const count = c.reactions[emoji] || 0;
                      const active = c.user_reactions.includes(emoji);
                      return (
                        <motion.button
                          key={emoji}
                          whileTap={{ scale: 0.85 }}
                          onClick={() => handleReact(c.id, emoji)}
                          className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs transition-all ${
                            active
                              ? "bg-primary/15 text-primary border border-primary/30"
                              : "bg-surface/60 text-muted-foreground border border-border/20 hover:bg-surface-hover"
                          }`}
                        >
                          <span>{emoji}</span>
                          {count > 0 && <span className="font-medium">{count}</span>}
                        </motion.button>
                      );
                    })}
                    <button
                      onClick={() => toggleComments(c.id)}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs bg-surface/60 text-muted-foreground border border-border/20 hover:bg-surface-hover transition-all"
                    >
                      <MessageCircle className="h-3 w-3" />
                      {c.comments_count > 0 && <span className="font-medium">{c.comments_count}</span>}
                    </button>
                  </div>

                  {/* Comments section */}
                  <AnimatePresence>
                    {expandedId === c.id && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="border-t border-border/20 pt-3 mt-2 space-y-3">
                          {(comments[c.id] || []).map(comment => (
                            <div key={comment.id} className="flex gap-2">
                              <Avatar className="h-6 w-6">
                                <AvatarFallback className="bg-surface text-[10px]">
                                  {(comment.profiles?.display_name || "U")[0]}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1">
                                <span className="text-xs font-medium text-foreground">
                                  {comment.profiles?.display_name || comment.profiles?.username || "User"}
                                </span>
                                <p className="text-xs text-muted-foreground">{comment.content}</p>
                              </div>
                            </div>
                          ))}
                          <div className="flex gap-2">
                            <input
                              value={commentText[c.id] || ""}
                              onChange={e => setCommentText(prev => ({ ...prev, [c.id]: e.target.value }))}
                              placeholder="Add a comment..."
                              className="flex-1 bg-surface/50 rounded-lg px-3 py-1.5 text-xs border border-border/20 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/30"
                              onKeyDown={e => e.key === "Enter" && handleComment(c.id)}
                            />
                            <Button size="sm" variant="ghost" onClick={() => handleComment(c.id)} className="h-7 px-2">
                              <Send className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
