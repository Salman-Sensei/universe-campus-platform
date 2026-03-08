import { useState, useRef, useEffect } from "react";
import { Bell, Heart, MessageCircle, UserPlus } from "lucide-react";
import { useNotificationsContext } from "@/contexts/NotificationsContext";
import { Link } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";

const typeConfig: Record<string, { icon: typeof Heart; color: string; bg: string; label: string }> = {
  like: { icon: Heart, label: "liked your post", color: "text-rose-400", bg: "bg-rose-400/10" },
  comment: { icon: MessageCircle, label: "commented on your post", color: "text-sky-400", bg: "bg-sky-400/10" },
  follow: { icon: UserPlus, label: "started following you", color: "text-primary", bg: "bg-primary/10" },
};

export function NotificationDropdown() {
  const { notifications, unreadCount, markAllRead } = useNotificationsContext();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const recent = notifications.slice(0, 6);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => { setOpen(!open); if (!open && unreadCount > 0) markAllRead(); }}
        className="relative flex items-center justify-center h-9 w-9 rounded-xl text-muted-foreground hover:text-foreground hover:bg-surface-hover transition-all duration-200"
      >
        <Bell className="h-[18px] w-[18px]" />
        {unreadCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-0.5 -right-0.5 h-4 min-w-4 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center px-1"
          >
            {unreadCount > 9 ? "9+" : unreadCount}
          </motion.span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -4 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -4 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 top-full mt-2 z-50 w-[340px] bg-card border border-border/60 rounded-2xl shadow-2xl overflow-hidden"
            >
              <div className="px-4 py-3 border-b border-border/30 flex items-center justify-between">
                <h3 className="font-display font-bold text-sm text-foreground">Notifications</h3>
                <Link
                  to="/notifications"
                  onClick={() => setOpen(false)}
                  className="text-[11px] text-primary hover:text-primary/80 font-medium"
                >
                  View all →
                </Link>
              </div>

              {recent.length === 0 ? (
                <div className="py-10 text-center">
                  <Bell className="h-6 w-6 text-muted-foreground mx-auto mb-2" />
                  <p className="text-xs text-muted-foreground">No notifications yet</p>
                </div>
              ) : (
                <div className="max-h-[320px] overflow-y-auto">
                  {recent.map((n, i) => {
                    const config = typeConfig[n.type] || typeConfig.like;
                    const Icon = config.icon;
                    const name = n.actor_profile?.display_name || n.actor_profile?.username || "Someone";
                    return (
                      <motion.div
                        key={n.id}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.03 }}
                        className={`flex items-center gap-3 px-4 py-3 hover:bg-surface-hover transition-colors ${!n.read ? "bg-primary/[0.03]" : ""}`}
                      >
                        <Avatar className="h-8 w-8 shrink-0">
                          <AvatarImage src={n.actor_profile?.avatar_url || undefined} />
                          <AvatarFallback className="bg-surface text-primary text-[10px] font-semibold">
                            {name.slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-foreground leading-snug">
                            <span className="font-semibold">{name}</span>{" "}
                            <span className="text-muted-foreground">{config.label}</span>
                          </p>
                          <p className="text-[10px] text-muted-foreground mt-0.5">
                            {formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}
                          </p>
                        </div>
                        <div className={`h-7 w-7 rounded-lg ${config.bg} flex items-center justify-center shrink-0`}>
                          <Icon className={`h-3 w-3 ${config.color}`} />
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
