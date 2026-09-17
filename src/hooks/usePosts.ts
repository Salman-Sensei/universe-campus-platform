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
    role: string | null;
    founder_badge: boolean | null;
  };
  likes_count: number;
  comments_count: number;
  is_liked: boolean;
}

interface RankContext {
  followedIds: Set<string>;
  interests: string[];
  ownId: string;
}

/**
 * Smart feed ranking: blends recency, engagement, and personal relevance.
 * - Recency decays over ~36 hours so fresh posts still surface.
 * - Engagement (likes/comments) pushes popular posts up.
 * - Posts from people you follow and posts matching your subjects/interests get a boost.
 */
function rankPosts(posts: PostWithMeta[], ctx: RankContext): PostWithMeta[] {
  const now = Date.now();
  const scored = posts.map((p) => {
    const ageHours = Math.max(0, (now - new Date(p.created_at).getTime()) / 36e5);
    const recency = 100 * Math.exp(-ageHours / 36);
    const engagement = Math.min(60, p.likes_count * 6 + p.comments_count * 4);
    const followBoost = ctx.followedIds.has(p.user_id) ? 25 : 0;
    const ownBoost = p.user_id === ctx.ownId ? 10 : 0;

    let relevance = 0;
    if (ctx.interests.length > 0) {
      const text = `${p.content} ${p.profiles.display_name ?? ""} ${p.profiles.username ?? ""}`.toLowerCase();
      for (const interest of ctx.interests) {
        const needle = interest.trim().toLowerCase();
        if (needle.length > 2 && text.includes(needle)) relevance += 8;
      }
      relevance = Math.min(relevance, 24);
    }

    return { post: p, score: recency + engagement + followBoost + ownBoost + relevance };
  });

  scored.sort((a, b) => b.score - a.score);
  return scored.map((s) => s.post);
}

export function usePosts(userId?: string) {
  const { user } = useAuth();
  const [posts, setPosts] = useState<PostWithMeta[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPosts = useCallback(async () => {
    setLoading(true);

    // If viewing a specific user's posts, fetch directly
    if (userId) {
      const query = supabase
        .from("posts")
        .select("*, profiles!posts_user_id_profiles_fkey(username, display_name, avatar_url, role, founder_badge)")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      const { data: postsData } = await query;
      if (!postsData) { setLoading(false); return; }
      await enrichAndSet(postsData);
      return;
    }

    // For feed: fetch posts from followed users + own posts, then rank them
    if (user) {
      const [{ data: follows }, { data: myProfile }] = await Promise.all([
        supabase.from("follows").select("following_id").eq("follower_id", user.id),
        supabase.from("profiles").select("interests, subjects").eq("user_id", user.id).maybeSingle(),
      ]);

      const followedIds = (follows || []).map((f) => f.following_id);
      // Include own posts + followed users' posts
      const allIds = [...new Set([user.id, ...followedIds])];

      const { data: postsData } = await supabase
        .from("posts")
        .select("*, profiles!posts_user_id_profiles_fkey(username, display_name, avatar_url, role, founder_badge)")
        .in("user_id", allIds)
        .order("created_at", { ascending: false });

      if (!postsData) { setLoading(false); return; }

      const interests = [
        ...((myProfile?.interests as string[] | null) ?? []),
        ...((myProfile?.subjects as string[] | null) ?? []),
      ];
      await enrichAndSet(postsData, {
        followedIds: new Set(followedIds),
        interests,
        ownId: user.id,
      });
    } else {
      // Not logged in: show all posts
      const { data: postsData } = await supabase
        .from("posts")
        .select("*, profiles!posts_user_id_profiles_fkey(username, display_name, avatar_url, role, founder_badge)")
        .order("created_at", { ascending: false });

      if (!postsData) { setLoading(false); return; }
      await enrichAndSet(postsData);
    }
  }, [user, userId]);

  const enrichAndSet = async (postsData: any[], rankCtx?: RankContext) => {
    if (postsData.length === 0) { setPosts([]); setLoading(false); return; }

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

    setPosts(rankCtx ? rankPosts(enriched, rankCtx) : enriched);
    setLoading(false);
  };

  useEffect(() => { fetchPosts(); }, [fetchPosts]);

  return { posts, loading, refresh: fetchPosts };
}
