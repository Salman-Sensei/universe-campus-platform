import { Music, Quote, Tag } from "lucide-react";
import { motion } from "framer-motion";
import type { Tables } from "@/integrations/supabase/types";

interface ProfileDetailsProps {
  profile: Tables<"profiles"> | null;
}

export function ProfileDetails({ profile }: ProfileDetailsProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-3"
    >
      {profile?.bio && <p className="text-foreground/80 leading-relaxed">{profile.bio}</p>}
      <div className="flex flex-wrap gap-3">
        {profile?.favorite_music && (
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground bg-surface/60 rounded-full px-3 py-1">
            <Music className="h-3.5 w-3.5 text-primary" /> {profile.favorite_music}
          </div>
        )}
        {profile?.quote && (
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground bg-surface/60 rounded-full px-3 py-1 italic">
            <Quote className="h-3.5 w-3.5 text-primary" /> "{profile.quote}"
          </div>
        )}
      </div>
      {profile?.interests && profile.interests.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          <Tag className="h-3.5 w-3.5 text-primary" />
          {profile.interests.map((i) => (
            <span key={i} className="text-xs bg-primary/10 text-primary px-2.5 py-1 rounded-full font-medium">{i}</span>
          ))}
        </div>
      )}
    </motion.div>
  );
}