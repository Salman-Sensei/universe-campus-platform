import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface PostWithMeta {
  id: string;
  content: string;
  image_url: string | null;
  created_at: string;
  user_id: string;
  profiles: {
    username: string | null;
    display_name: string | null;
    avatar_url: string | null;
  };
  likes_count: number;
  comments_count: number;
  is_liked: boolean;
}

export function usePosts(userId?: string) {
  const { user } = useAuth();
  const [posts, setPosts] = useState<PostWithMeta[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    let query = supabase
      .from("posts")
      .select("*, profiles:user_id(username, display_name, avatar_url)")
      .order("created_at", { ascending: false });

    if (userId) {
      query = query.eq("user_id", userId);
    }

    const { data: postsData } = await query;
    if (!postsData) { setLoading(false); return; }

    const postIds = postsData.map((p) => p.id);

    const [likesRes, commentsRes, userLikesRes] = await Promise.all([
      supabase.from("likes").select("post_id").in("post_id", postIds),
      supabase.from("comments").select("post_id").in("post_id", postIds),
      user
        ? supabase.from("likes").select("post_id").eq("user_id", user.id).in("post_id", postIds)
        : Promise.resolve({ data: [] }),
    ]);

    const likesMap: Record<string, number> = {};
    const commentsMap: Record<string, number> = {};
    const userLikesSet = new Set<string>();

    likesRes.data?.forEach((l) => { likesMap[l.post_id] = (likesMap[l.post_id] || 0) + 1; });
    commentsRes.data?.forEach((c) => { commentsMap[c.post_id] = (commentsMap[c.post_id] || 0) + 1; });
    userLikesRes.data?.forEach((l) => userLikesSet.add(l.post_id));

    const enriched: PostWithMeta[] = postsData.map((p) => ({
      ...p,
      profiles: p.profiles as unknown as PostWithMeta["profiles"],
      likes_count: likesMap[p.id] || 0,
      comments_count: commentsMap[p.id] || 0,
      is_liked: userLikesSet.has(p.id),
    }));

    setPosts(enriched);
    setLoading(false);
  }, [user, userId]);

  useEffect(() => { fetchPosts(); }, [fetchPosts]);

  return { posts, loading, refresh: fetchPosts };
}
