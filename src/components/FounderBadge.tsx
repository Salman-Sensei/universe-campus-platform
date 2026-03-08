import React from "react";
import { motion } from "framer-motion";
import { Crown, CheckCircle2 } from "lucide-react";

interface FounderBadgeProps {
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
}

export const FounderBadge = React.forwardRef<HTMLSpanElement, FounderBadgeProps>(
  ({ size = "sm", showLabel = true }, ref) => {
    const sizeClasses = {
      sm: "text-[9px] px-2 py-0.5",
      md: "text-[11px] px-2.5 py-1",
      lg: "text-xs px-3 py-1.5",
    };

    return (
      <motion.span
        ref={ref}
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className={`inline-flex items-center gap-1 font-bold rounded-full bg-gradient-to-r from-warning via-accent to-primary text-primary-foreground shadow-[0_0_16px_hsl(var(--warning)/0.4)] ${sizeClasses[size]}`}
      >
        <Crown className={size === "sm" ? "h-2.5 w-2.5" : size === "md" ? "h-3 w-3" : "h-3.5 w-3.5"} />
        {showLabel && "Founder"}
        <CheckCircle2 className={size === "sm" ? "h-2.5 w-2.5" : size === "md" ? "h-3 w-3" : "h-3.5 w-3.5"} />
      </motion.span>
    );
  }
);
FounderBadge.displayName = "FounderBadge";
