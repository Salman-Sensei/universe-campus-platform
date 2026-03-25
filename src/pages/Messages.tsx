import { useState, useRef, useEffect } from "react";
import { AppLayout } from "@/components/AppLayout";
import { useConversations, useMessages, useStartConversation } from "@/hooks/useChat";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageCircle, Send, ArrowLeft, Search } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

export default function Messages() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeConversation, setActiveConversation] = useState<string | null>(null);
  const [messageInput, setMessageInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { conversations, isLoading: convsLoading } = useConversations();
  const { messages, isLoading: msgsLoading, sendMessage } = useMessages(activeConversation);
  const startConversation = useStartConversation();

  // Handle ?userId= param to auto-start conversation
  const targetUserId = searchParams.get("userId");
  useEffect(() => {
    if (!targetUserId || !user) return;
    startConversation.mutateAsync(targetUserId).then((convId) => {
      setActiveConversation(convId);
      setSearchParams({}, { replace: true });
    }).catch((e) => {
      if (e.message !== "Cannot chat with yourself") {
        toast.error("Failed to start conversation");
      }
    });
  }, [targetUserId, user]);

  // Search users to start new conversations
  const { data: searchResults = [] } = useQuery({
    queryKey: ["searchUsers", searchQuery],
    enabled: searchQuery.length >= 2,
    queryFn: async () => {
      const { data } = await supabase
        .from("profiles")
        .select("user_id, username, display_name, avatar_url")
        .neq("user_id", user!.id)
        .or(`username.ilike.%${searchQuery}%,display_name.ilike.%${searchQuery}%`)
        .limit(5);
      return data || [];
    },
  });

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (!messageInput.trim()) return;
    sendMessage.mutate(messageInput.trim());
    setMessageInput("");
  };

  const handleStartChat = async (userId: string) => {
    try {
      const convId = await startConversation.mutateAsync(userId);
      setActiveConversation(convId);
      setSearchQuery("");
    } catch {
      toast.error("Failed to start conversation");
    }
  };

  const activeConv = conversations.find((c: any) => c.id === activeConversation);

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto h-[calc(100vh-4rem)] flex border border-border/30 rounded-2xl overflow-hidden bg-background">
        {/* Sidebar - conversation list */}
        <div
          className={cn(
            "w-full md:w-80 md:min-w-[320px] border-r border-border/30 flex flex-col",
            activeConversation ? "hidden md:flex" : "flex"
          )}
        >
          <div className="p-4 border-b border-border/30">
            <h2 className="text-lg font-display font-bold text-foreground flex items-center gap-2">
              <MessageCircle className="h-5 w-5 text-primary" />
              Messages
            </h2>
            <div className="relative mt-3">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search users to chat..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 rounded-xl text-sm"
              />
            </div>
            {/* Search results dropdown */}
            {searchQuery.length >= 2 && searchResults.length > 0 && (
              <div className="mt-2 bg-card border border-border/40 rounded-xl overflow-hidden">
                {searchResults.map((u: any) => (
                  <button
                    key={u.user_id}
                    onClick={() => handleStartChat(u.user_id)}
                    className="w-full flex items-center gap-3 p-3 hover:bg-accent/50 transition-colors text-left"
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={u.avatar_url || undefined} />
                      <AvatarFallback className="text-xs bg-primary/10 text-primary font-bold">
                        {(u.display_name || "U").slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{u.display_name || u.username}</p>
                      <p className="text-xs text-muted-foreground">@{u.username}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          <ScrollArea className="flex-1">
            {convsLoading ? (
              <div className="p-4 space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-16 rounded-xl bg-muted/50 animate-pulse" />
                ))}
              </div>
            ) : conversations.length === 0 ? (
              <div className="p-8 text-center">
                <MessageCircle className="h-10 w-10 text-muted-foreground/30 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">No conversations yet</p>
                <p className="text-xs text-muted-foreground/70 mt-1">Search for a user above to start chatting</p>
              </div>
            ) : (
              <div className="p-2">
                {conversations.map((conv: any) => (
                  <button
                    key={conv.id}
                    onClick={() => setActiveConversation(conv.id)}
                    className={cn(
                      "w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-200 text-left",
                      activeConversation === conv.id
                        ? "bg-primary/10 text-primary"
                        : "hover:bg-accent/50"
                    )}
                  >
                    <div className="relative">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={conv.otherUser?.avatar_url || undefined} />
                        <AvatarFallback className="text-xs bg-primary/10 text-primary font-bold">
                          {(conv.otherUser?.display_name || "U").slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      {conv.unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 h-5 min-w-5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center px-1">
                          {conv.unreadCount > 9 ? "9+" : conv.unreadCount}
                        </span>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold truncate">
                          {conv.otherUser?.display_name || conv.otherUser?.username || "User"}
                        </p>
                        {conv.lastMessage && (
                          <span className="text-[10px] text-muted-foreground shrink-0">
                            {formatDistanceToNow(new Date(conv.lastMessage.created_at), { addSuffix: true })}
                          </span>
                        )}
                      </div>
                      {conv.lastMessage && (
                        <p className="text-xs text-muted-foreground truncate mt-0.5">
                          {conv.lastMessage.sender_id === user?.id ? "You: " : ""}
                          {conv.lastMessage.content}
                        </p>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>

        {/* Chat area */}
        <div
          className={cn(
            "flex-1 flex flex-col",
            !activeConversation ? "hidden md:flex" : "flex"
          )}
        >
          {activeConversation && activeConv ? (
            <>
              {/* Chat header */}
              <div className="p-4 border-b border-border/30 flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="icon"
                  className="md:hidden rounded-full"
                  onClick={() => setActiveConversation(null)}
                >
                  <ArrowLeft className="h-5 w-5" />
                </Button>
                <Avatar className="h-9 w-9">
                  <AvatarImage src={activeConv.otherUser?.avatar_url || undefined} />
                  <AvatarFallback className="text-xs bg-primary/10 text-primary font-bold">
                    {(activeConv.otherUser?.display_name || "U").slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    {activeConv.otherUser?.display_name || activeConv.otherUser?.username || "User"}
                  </p>
                  <p className="text-xs text-muted-foreground">@{activeConv.otherUser?.username}</p>
                </div>
              </div>

              {/* Messages */}
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-3">
                  {msgsLoading ? (
                    <div className="flex justify-center py-8">
                      <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full" />
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="text-center py-12">
                      <MessageCircle className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">No messages yet. Say hi! 👋</p>
                    </div>
                  ) : (
                    messages.map((msg: any) => {
                      const isMe = msg.sender_id === user?.id;
                      return (
                        <div
                          key={msg.id}
                          className={cn("flex", isMe ? "justify-end" : "justify-start")}
                        >
                          <div
                            className={cn(
                              "max-w-[75%] rounded-2xl px-4 py-2.5 text-sm",
                              isMe
                                ? "bg-primary text-primary-foreground rounded-br-md"
                                : "bg-muted text-foreground rounded-bl-md"
                            )}
                          >
                            <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                            <p
                              className={cn(
                                "text-[10px] mt-1",
                                isMe ? "text-primary-foreground/60" : "text-muted-foreground"
                              )}
                            >
                              {formatDistanceToNow(new Date(msg.created_at), { addSuffix: true })}
                            </p>
                          </div>
                        </div>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>

              {/* Input */}
              <div className="p-4 border-t border-border/30">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSend();
                  }}
                  className="flex gap-2"
                >
                  <Input
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    placeholder="Type a message..."
                    className="rounded-xl flex-1"
                    autoFocus
                  />
                  <Button
                    type="submit"
                    size="icon"
                    className="rounded-xl shrink-0"
                    disabled={!messageInput.trim() || sendMessage.isPending}
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <MessageCircle className="h-12 w-12 text-muted-foreground/20 mx-auto mb-3" />
                <p className="text-muted-foreground font-medium">Select a conversation</p>
                <p className="text-sm text-muted-foreground/70 mt-1">
                  Or search for a user to start chatting
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
