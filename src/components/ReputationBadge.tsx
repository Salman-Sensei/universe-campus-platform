import { Award, Star, Zap, Trophy } from "lucide-react";
import { motion } from "framer-motion";

interface ReputationBadgeProps {
  badge: string | null | undefined;
  points?: number;
  showPoints?: boolean;
  size?: "sm" | "md";
}

const badgeConfig: Record<string, { icon: typeof Award; gradient: string; glow: string }> = {
  "Top Contributor": {
    icon: Trophy,
    gradient: "from-warning to-accent",
    glow: "shadow-[0_0_12px_hsl(var(--warning)/0.4)]",
  },
  "Helpful Student": {
    icon: Star,
    gradient: "from-primary to-glow-secondary",
    glow: "shadow-[0_0_12px_hsl(var(--primary)/0.3)]",
  },
  "Active Member": {
    icon: Zap,
    gradient: "from-success to-primary",
    glow: "shadow-[0_0_12px_hsl(var(--success)/0.3)]",
  },
};

export function ReputationBadge({ badge, points, showPoints = false, size = "sm" }: ReputationBadgeProps) {
  if (!badge) return null;

  const config = badgeConfig[badge] || badgeConfig["Active Member"];
  const Icon = config.icon;
  const isSmall = size === "sm";

  return (
    <motion.span
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className={`inline-flex items-center gap-1 font-semibold rounded-full bg-gradient-to-r ${config.gradient} text-primary-foreground ${config.glow} ${
        isSmall ? "text-[9px] px-2 py-0.5" : "text-[11px] px-2.5 py-1"
      }`}
    >
      <Icon className={isSmall ? "h-2.5 w-2.5" : "h-3 w-3"} />
      {badge}
      {showPoints && points != null && (
        <span className="opacity-80 ml-0.5">· {points}pt</span>
      )}
    </motion.span>
  );
}
