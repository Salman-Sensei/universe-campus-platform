import { useState, useEffect, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export function useConversations() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: conversations = [], isLoading } = useQuery({
    queryKey: ["conversations", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("conversations")
        .select("*")
        .or(`participant_1.eq.${user!.id},participant_2.eq.${user!.id}`)
        .order("last_message_at", { ascending: false });
      if (error) throw error;

      // Get other participant profiles
      const otherIds = (data || []).map((c: any) =>
        c.participant_1 === user!.id ? c.participant_2 : c.participant_1
      );
      if (otherIds.length === 0) return [];

      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, username, display_name, avatar_url")
        .in("user_id", otherIds);

      const profileMap = Object.fromEntries(
        (profiles || []).map((p: any) => [p.user_id, p])
      );

      // Get last message for each conversation
      const convIds = (data || []).map((c: any) => c.id);
      const lastMessages: Record<string, any> = {};
      for (const convId of convIds) {
        const { data: msgs } = await supabase
          .from("messages")
          .select("content, created_at, sender_id")
          .eq("conversation_id", convId)
          .order("created_at", { ascending: false })
          .limit(1);
        if (msgs && msgs.length > 0) lastMessages[convId] = msgs[0];
      }

      // Get unread counts
      const unreadCounts: Record<string, number> = {};
      for (const convId of convIds) {
        const { count } = await supabase
          .from("messages")
          .select("*", { count: "exact", head: true })
          .eq("conversation_id", convId)
          .eq("read", false)
          .neq("sender_id", user!.id);
        unreadCounts[convId] = count || 0;
      }

      return (data || []).map((c: any) => {
        const otherId = c.participant_1 === user!.id ? c.participant_2 : c.participant_1;
        return {
          ...c,
          otherUser: profileMap[otherId] || null,
          lastMessage: lastMessages[c.id] || null,
          unreadCount: unreadCounts[c.id] || 0,
        };
      });
    },
  });

  return { conversations, isLoading };
}

export function useMessages(conversationId: string | null) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: messages = [], isLoading } = useQuery({
    queryKey: ["messages", conversationId],
    enabled: !!conversationId && !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .eq("conversation_id", conversationId!)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data || [];
    },
  });

  // Realtime subscription
  useEffect(() => {
    if (!conversationId) return;
    const channel = supabase
      .channel(`messages-${conversationId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ["messages", conversationId] });
          queryClient.invalidateQueries({ queryKey: ["conversations"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId, queryClient]);

  // Mark messages as read
  useEffect(() => {
    if (!conversationId || !user) return;
    supabase
      .from("messages")
      .update({ read: true })
      .eq("conversation_id", conversationId)
      .neq("sender_id", user.id)
      .eq("read", false)
      .then(() => {
        queryClient.invalidateQueries({ queryKey: ["conversations"] });
      });
  }, [conversationId, user, messages.length, queryClient]);

  const sendMessage = useMutation({
    mutationFn: async (content: string) => {
      if (!user || !conversationId) throw new Error("Missing data");
      const { error } = await supabase.from("messages").insert({
        conversation_id: conversationId,
        sender_id: user.id,
        content,
      });
      if (error) throw error;
      // Update last_message_at
      await supabase
        .from("conversations")
        .update({ last_message_at: new Date().toISOString() })
        .eq("id", conversationId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["messages", conversationId] });
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
  });

  return { messages, isLoading, sendMessage };
}

export function useStartConversation() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (otherUserId: string) => {
      if (!user) throw new Error("Not authenticated");
      if (otherUserId === user.id) throw new Error("Cannot chat with yourself");

      // Check if conversation already exists (in either order)
      const { data: existing } = await supabase
        .from("conversations")
        .select("id")
        .or(
          `and(participant_1.eq.${user.id},participant_2.eq.${otherUserId}),and(participant_1.eq.${otherUserId},participant_2.eq.${user.id})`
        )
        .limit(1);

      if (existing && existing.length > 0) {
        return existing[0].id;
      }

      // Create new conversation
      const { data, error } = await supabase
        .from("conversations")
        .insert({
          participant_1: user.id,
          participant_2: otherUserId,
        })
        .select("id")
        .single();
      if (error) throw error;
      return data.id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
  });
}
