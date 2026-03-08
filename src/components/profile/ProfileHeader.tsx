import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { RoleBadge } from "@/components/RoleBadge";
import { FounderBadge } from "@/components/FounderBadge";
import { Camera, ImagePlus, Pencil, Save } from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";

interface ProfileHeaderProps {
  profile: Tables<"profiles"> | null;
  displayName: string;
  editing: boolean;
  onEditToggle: () => void;
  onAvatarUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBannerUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function ProfileHeader({
  profile,
  displayName,
  editing,
  onEditToggle,
  onAvatarUpload,
  onBannerUpload,
}: ProfileHeaderProps) {
  return (
    <div className="relative">
      {/* Cover Banner */}
      <label className="cursor-pointer group block relative h-[250px] overflow-hidden">
        {profile?.banner_url ? (
          <img src={profile.banner_url} alt="Profile banner" className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary/30 via-accent/20 to-primary/10" />
        )}
        <div className="absolute inset-0 bg-background/0 group-hover:bg-background/40 transition-colors duration-200 flex items-center justify-center">
          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center gap-2 bg-background/80 backdrop-blur-sm text-foreground text-sm font-medium px-4 py-2 rounded-full">
            <ImagePlus className="h-4 w-4" />
            Change Banner
          </div>
        </div>
        <input type="file" accept="image/*" onChange={onBannerUpload} className="hidden" />
      </label>

      {/* Avatar + Name overlay area */}
      <div className="px-6 -mt-16 relative z-10">
        <div className="flex items-end justify-between">
          <label className="cursor-pointer group relative">
            <Avatar className="h-28 w-28 ring-4 ring-card shadow-lg">
              <AvatarImage src={profile?.avatar_url || undefined} />
              <AvatarFallback className="bg-surface text-primary text-3xl font-bold">
                {displayName.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="absolute inset-0 bg-background/60 rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all duration-200 backdrop-blur-sm">
              <Camera className="h-5 w-5 text-foreground" />
            </div>
            <input type="file" accept="image/*" onChange={onAvatarUpload} className="hidden" />
          </label>

          <Button
            variant="ghost"
            size="sm"
            onClick={onEditToggle}
            className="text-primary hover:bg-primary/10 rounded-xl font-semibold mb-1"
          >
            {editing ? (
              <><Save className="mr-1.5 h-4 w-4" /> Save</>
            ) : (
              <><Pencil className="mr-1.5 h-4 w-4" /> Edit Profile</>
            )}
          </Button>
        </div>

        <div className="mt-3 mb-4">
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-2xl font-display font-bold text-foreground">{displayName}</h2>
            <RoleBadge role={(profile as any)?.role} size="md" />
          </div>
          <p className="text-sm text-muted-foreground">@{profile?.username || "user"}</p>
          {(profile as any)?.role === "student" && ((profile as any)?.semester || (profile as any)?.batch) && (
            <p className="text-xs text-muted-foreground mt-1">
              {(profile as any)?.semester && <span>{(profile as any).semester}</span>}
              {(profile as any)?.semester && (profile as any)?.batch && <span> · </span>}
              {(profile as any)?.batch && <span>Batch {(profile as any).batch}</span>}
            </p>
          )}
          {(profile as any)?.role === "faculty" && (profile as any)?.subjects?.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {((profile as any).subjects as string[]).map((s) => (
                <span key={s} className="text-[10px] bg-accent/15 text-accent px-2 py-0.5 rounded-full font-medium">{s}</span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}