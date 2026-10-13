import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

const PAGE_SIZE = 20;
const POST_SELECT =
  "*, profiles!posts_user_id_profiles_fkey(username, display_name, avatar_url, role, founder_badge)";

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
 * Applied per loaded page so already-shown posts never jump around.
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
      const text = `${p.content} ${p.profiles?.display_name ?? ""} ${p.profiles?.username ?? ""}`.toLowerCase();
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
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const pageRef = useRef(0);
  const ctxRef = useRef<{ authorIds: string[] | null; rank?: RankContext }>({ authorIds: null });

  const enrich = useCallback(async (postsData: any[]): Promise<PostWithMeta[]> => {
    if (postsData.length === 0) return [];
    const postIds = postsData.map((p) => p.id);

    const [countsRes, userLikesRes] = await Promise.all([
      supabase.rpc("get_post_counts", { p_post_ids: postIds }),
      user
        ? supabase.from("likes").select("post_id").eq("user_id", user.id).in("post_id", postIds)
        : Promise.resolve({ data: [] as { post_id: string }[] }),
    ]);

    const counts = new Map<string, { likes: number; comments: number }>();
    (countsRes.data ?? []).forEach((c: any) =>
      counts.set(c.post_id, { likes: Number(c.likes_count) || 0, comments: Number(c.comments_count) || 0 }),
    );
    const userLikes = new Set((userLikesRes.data ?? []).map((l: any) => l.post_id));

    return postsData.map((p) => ({
      ...p,
      profiles: p.profiles as PostWithMeta["profiles"],
      likes_count: counts.get(p.id)?.likes ?? 0,
      comments_count: counts.get(p.id)?.comments ?? 0,
      is_liked: userLikes.has(p.id),
    }));
  }, [user]);

  const fetchPage = useCallback(async (page: number) => {
    const from = page * PAGE_SIZE;
    let query = supabase
      .from("posts")
      .select(POST_SELECT)
      .order("created_at", { ascending: false })
      .range(from, from + PAGE_SIZE - 1);
    const ids = ctxRef.current.authorIds;
    if (ids) query = query.in("user_id", ids);

    const { data } = await query;
    const rows = data ?? [];
    const enriched = await enrich(rows);
    const rank = ctxRef.current.rank;
    return { items: rank ? rankPosts(enriched, rank) : enriched, more: rows.length === PAGE_SIZE };
  }, [enrich]);

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    pageRef.current = 0;

    if (userId) {
      ctxRef.current = { authorIds: [userId] };
    } else if (user) {
      const [{ data: follows }, { data: myProfile }] = await Promise.all([
        supabase.from("follows").select("following_id").eq("follower_id", user.id),
        supabase.from("profiles").select("interests, subjects").eq("user_id", user.id).maybeSingle(),
      ]);
      const followedIds = (follows || []).map((f) => f.following_id);
      ctxRef.current = {
        authorIds: [...new Set([user.id, ...followedIds])],
        rank: {
          followedIds: new Set(followedIds),
          interests: [
            ...((myProfile?.interests as string[] | null) ?? []),
            ...((myProfile?.subjects as string[] | null) ?? []),
          ],
          ownId: user.id,
        },
      };
    } else {
      ctxRef.current = { authorIds: null };
    }

    const { items, more } = await fetchPage(0);
    setPosts(items);
    setHasMore(more);
    setLoading(false);
  }, [user, userId, fetchPage]);

  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    const next = pageRef.current + 1;
    const { items, more } = await fetchPage(next);
    pageRef.current = next;
    setPosts((prev) => {
      const seen = new Set(prev.map((p) => p.id));
      return [...prev, ...items.filter((p) => !seen.has(p.id))];
    });
    setHasMore(more);
    setLoadingMore(false);
  }, [fetchPage, hasMore, loadingMore]);

  useEffect(() => { fetchPosts(); }, [fetchPosts]);

  return { posts, loading, loadingMore, hasMore, loadMore, refresh: fetchPosts };
}
