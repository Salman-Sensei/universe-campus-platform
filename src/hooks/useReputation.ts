import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface Reputation {
  points: number;
  badge: string | null;
  posts_count: number;
  likes_received: number;
  comments_count: number;
}

export function useReputation(userId?: string) {
  const [reputation, setReputation] = useState<Reputation | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) { setLoading(false); return; }

    const load = async () => {
      // Recalculate first
      await supabase.rpc("recalculate_reputation", { target_user_id: userId });

      const { data } = await supabase
        .from("user_reputation")
        .select("points, badge, posts_count, likes_received, comments_count")
        .eq("user_id", userId)
        .single();

      if (data) setReputation(data);
      setLoading(false);
    };

    load();
  }, [userId]);

  return { reputation, loading };
}
