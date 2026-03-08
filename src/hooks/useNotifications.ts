import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface Notification {
  id: string;
  user_id: string;
  actor_id: string;
  type: "like" | "comment" | "follow";
  post_id: string | null;
  read: boolean;
  created_at: string;
  actor_profile: {
    username: string | null;
    display_name: string | null;
    avatar_url: string | null;
  };
}

export function useNotifications() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = useCallback(async () => {
    if (!user) return;
    setLoading(true);

    const { data } = await supabase
      .from("notifications")
      .select("*, actor_profile:actor_id(username, display_name, avatar_url)")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(50);

    if (data) {
      const mapped = data.map((n) => ({
        ...n,
        type: n.type as "like" | "comment" | "follow",
        actor_profile: n.actor_profile as unknown as Notification["actor_profile"],
      }));
      setNotifications(mapped);
      setUnreadCount(mapped.filter((n) => !n.read).length);
    }
    setLoading(false);
  }, [user]);

  const markAllRead = useCallback(async () => {
    if (!user) return;
    await supabase
      .from("notifications")
      .update({ read: true })
      .eq("user_id", user.id)
      .eq("read", false);
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
  }, [user]);

  const createNotification = useCallback(
    async (targetUserId: string, type: "like" | "comment" | "follow", postId?: string) => {
      if (!user || targetUserId === user.id) return;
      await supabase.from("notifications").insert({
        user_id: targetUserId,
        actor_id: user.id,
        type,
        post_id: postId || null,
      });
    },
    [user]
  );

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Realtime subscription
  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel("notifications-realtime")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "notifications", filter: `user_id=eq.${user.id}` },
        () => { fetchNotifications(); }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user, fetchNotifications]);

  return { notifications, unreadCount, loading, markAllRead, createNotification, refresh: fetchNotifications };
}
