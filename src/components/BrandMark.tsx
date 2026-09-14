import { GraduationCap } from "lucide-react";
import { cn } from "@/lib/utils";

interface BrandMarkProps {
  compact?: boolean;
  className?: string;
}

export function BrandMark({ compact = false, className }: BrandMarkProps) {
  return (
    <div className={cn("inline-flex items-center gap-2.5", className)} aria-label="UniVerse">
      <span className="relative grid h-8 w-8 place-items-center rounded-lg border border-primary/40 bg-primary/10">
        <GraduationCap className="h-4 w-4 text-primary" />
        <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full border-2 border-background bg-primary" />
      </span>
      {!compact && (
        <span className="font-display text-lg font-bold text-foreground">
          Uni<span className="text-primary">Verse</span>
        </span>
      )}
    </div>
  );
}