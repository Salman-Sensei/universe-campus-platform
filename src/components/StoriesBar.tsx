import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Plus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { StoryViewer } from "./StoryViewer";
import { CreateStoryDialog } from "./CreateStoryDialog";

interface StoryGroup {
  user_id: string;
  username: string | null;
  display_name: string | null;
  avatar_url: string | null;
  stories: { id: string; content: string | null; image_url: string | null; created_at: string }[];
}

export function StoriesBar() {
  const { user } = useAuth();
  const [storyGroups, setStoryGroups] = useState<StoryGroup[]>([]);
  const [viewingIndex, setViewingIndex] = useState<number | null>(null);
  const [showCreate, setShowCreate] = useState(false);

  const fetchStories = async () => {
    const { data } = await supabase
      .from("stories")
      .select("id, user_id, content, image_url, created_at")
      .order("created_at", { ascending: false });

    if (!data || data.length === 0) { setStoryGroups([]); return; }

    const userIds = [...new Set(data.map(s => s.user_id))];
    const { data: profiles } = await supabase
      .from("profiles")
      .select("user_id, username, display_name, avatar_url")
      .in("user_id", userIds);

    const profileMap: Record<string, any> = {};
    profiles?.forEach(p => { profileMap[p.user_id] = p; });

    const groups: Record<string, StoryGroup> = {};
    data.forEach(s => {
      if (!groups[s.user_id]) {
        const p = profileMap[s.user_id] || {};
        groups[s.user_id] = {
          user_id: s.user_id,
          username: p.username,
          display_name: p.display_name,
          avatar_url: p.avatar_url,
          stories: [],
        };
      }
      groups[s.user_id].stories.push(s);
    });

    // Put current user first
    const sorted = Object.values(groups).sort((a, b) => {
      if (a.user_id === user?.id) return -1;
      if (b.user_id === user?.id) return 1;
      return 0;
    });

    setStoryGroups(sorted);
  };

  useEffect(() => { fetchStories(); }, [user]);

  if (storyGroups.length === 0 && !user) return null;

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card rounded-2xl p-4 hover:translate-y-0"
      >
        <div className="flex gap-4 overflow-x-auto pb-1 scrollbar-hide">
          {/* Add story button */}
          <button
            onClick={() => setShowCreate(true)}
            className="flex flex-col items-center gap-1.5 shrink-0 group"
          >
            <div className="relative">
              <div className="w-14 h-14 rounded-full bg-surface border-2 border-dashed border-primary/40 flex items-center justify-center group-hover:border-primary transition-colors">
                <Plus className="h-5 w-5 text-primary" />
              </div>
            </div>
            <span className="text-[10px] text-muted-foreground font-medium">Your story</span>
          </button>

          {/* Story avatars */}
          {storyGroups.map((group, i) => (
            <button
              key={group.user_id}
              onClick={() => setViewingIndex(i)}
              className="flex flex-col items-center gap-1.5 shrink-0 group"
            >
              <div className="relative">
                <div className="w-14 h-14 rounded-full p-[2.5px] story-ring">
                  <Avatar className="w-full h-full border-2 border-background">
                    <AvatarImage src={group.avatar_url || ""} />
                    <AvatarFallback className="bg-surface text-xs">
                      {(group.display_name || group.username || "?")[0]}
                    </AvatarFallback>
                  </Avatar>
                </div>
              </div>
              <span className="text-[10px] text-muted-foreground font-medium truncate max-w-[60px]">
                {group.user_id === user?.id ? "You" : (group.display_name?.split(" ")[0] || group.username || "User")}
              </span>
            </button>
          ))}
        </div>
      </motion.div>

      {/* Story viewer modal */}
      <AnimatePresence>
        {viewingIndex !== null && (
          <StoryViewer
            groups={storyGroups}
            initialIndex={viewingIndex}
            onClose={() => setViewingIndex(null)}
          />
        )}
      </AnimatePresence>

      <CreateStoryDialog open={showCreate} onOpenChange={setShowCreate} onCreated={fetchStories} />
    </>
  );
}
