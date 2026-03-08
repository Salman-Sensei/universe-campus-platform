import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";

interface Story {
  id: string;
  content: string | null;
  image_url: string | null;
  created_at: string;
}

interface StoryGroup {
  user_id: string;
  username: string | null;
  display_name: string | null;
  avatar_url: string | null;
  stories: Story[];
}

interface StoryViewerProps {
  groups: StoryGroup[];
  initialIndex: number;
  onClose: () => void;
}

export function StoryViewer({ groups, initialIndex, onClose }: StoryViewerProps) {
  const [groupIdx, setGroupIdx] = useState(initialIndex);
  const [storyIdx, setStoryIdx] = useState(0);
  const [progress, setProgress] = useState(0);

  const group = groups[groupIdx];
  const story = group?.stories[storyIdx];

  const next = useCallback(() => {
    if (!group) return;
    if (storyIdx < group.stories.length - 1) {
      setStoryIdx(s => s + 1);
      setProgress(0);
    } else if (groupIdx < groups.length - 1) {
      setGroupIdx(g => g + 1);
      setStoryIdx(0);
      setProgress(0);
    } else {
      onClose();
    }
  }, [group, storyIdx, groupIdx, groups.length, onClose]);

  const prev = useCallback(() => {
    if (storyIdx > 0) {
      setStoryIdx(s => s - 1);
      setProgress(0);
    } else if (groupIdx > 0) {
      setGroupIdx(g => g - 1);
      setStoryIdx(0);
      setProgress(0);
    }
  }, [storyIdx, groupIdx]);

  // Auto-advance timer
  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(p => {
        if (p >= 100) { next(); return 0; }
        return p + 2;
      });
    }, 100);
    return () => clearInterval(interval);
  }, [next]);

  // Keyboard navigation
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") prev();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [next, prev, onClose]);

  if (!group || !story) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="relative w-full max-w-sm h-[80vh] max-h-[700px] rounded-3xl overflow-hidden bg-card"
        onClick={e => e.stopPropagation()}
      >
        {/* Progress bars */}
        <div className="absolute top-0 left-0 right-0 z-10 flex gap-1 p-3">
          {group.stories.map((_, i) => (
            <div key={i} className="flex-1 h-0.5 bg-foreground/20 rounded-full overflow-hidden">
              <div
                className="h-full bg-foreground/80 rounded-full transition-all duration-100"
                style={{
                  width: i < storyIdx ? "100%" : i === storyIdx ? `${progress}%` : "0%",
                }}
              />
            </div>
          ))}
        </div>

        {/* Header */}
        <div className="absolute top-6 left-0 right-0 z-10 flex items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <Avatar className="h-8 w-8 ring-2 ring-foreground/20">
              <AvatarImage src={group.avatar_url || ""} />
              <AvatarFallback className="bg-surface text-xs">
                {(group.display_name || "?")[0]}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-semibold text-foreground">{group.display_name || group.username}</p>
              <p className="text-[10px] text-muted-foreground">
                {formatDistanceToNow(new Date(story.created_at), { addSuffix: true })}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-foreground/70 hover:text-foreground">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Story content */}
        <div className="h-full flex items-center justify-center p-8">
          {story.image_url ? (
            <img src={story.image_url} alt="" className="max-w-full max-h-full object-contain rounded-xl" />
          ) : (
            <p className="text-xl font-display font-semibold text-foreground text-center leading-relaxed px-4">
              {story.content}
            </p>
          )}
        </div>

        {/* Navigation zones */}
        <button className="absolute left-0 top-16 bottom-0 w-1/3" onClick={prev} />
        <button className="absolute right-0 top-16 bottom-0 w-1/3" onClick={next} />

        {/* Nav arrows */}
        {groupIdx > 0 || storyIdx > 0 ? (
          <button onClick={prev} className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-foreground/10 flex items-center justify-center hover:bg-foreground/20">
            <ChevronLeft className="h-4 w-4 text-foreground" />
          </button>
        ) : null}
        {groupIdx < groups.length - 1 || storyIdx < group.stories.length - 1 ? (
          <button onClick={next} className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-foreground/10 flex items-center justify-center hover:bg-foreground/20">
            <ChevronRight className="h-4 w-4 text-foreground" />
          </button>
        ) : null}
      </motion.div>
    </motion.div>
  );
}
