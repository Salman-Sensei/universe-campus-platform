import { AppLayout } from "@/components/AppLayout";
import { useNotificationsContext } from "@/contexts/NotificationsContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Bell, Heart, MessageCircle, UserPlus, CheckCheck, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { motion } from "framer-motion";

const typeConfig = {
  like: { icon: Heart, label: "liked your post", color: "text-pink-400", bg: "bg-pink-400/10" },
  comment: { icon: MessageCircle, label: "commented on your post", color: "text-sky-400", bg: "bg-sky-400/10" },
  follow: { icon: UserPlus, label: "started following you", color: "text-primary", bg: "bg-primary/10" },
};

export default function Notifications() {
  const { notifications, loading, markAllRead, unreadCount } = useNotifications();

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto p-4 md:p-6 space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Bell className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-display font-bold text-foreground">Notifications</h2>
            {unreadCount > 0 && (
              <span className="text-xs font-semibold bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                {unreadCount} new
              </span>
            )}
          </div>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" onClick={markAllRead} className="text-xs text-muted-foreground hover:text-primary rounded-xl">
              <CheckCheck className="h-3.5 w-3.5 mr-1.5" /> Mark all read
            </Button>
          )}
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Loading notifications...</p>
          </div>
        ) : notifications.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-24 glass rounded-2xl"
          >
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Bell className="h-7 w-7 text-primary" />
            </div>
            <h3 className="font-display font-semibold text-foreground mb-2">No notifications yet</h3>
            <p className="text-muted-foreground text-sm">When someone interacts with your content, you'll see it here.</p>
          </motion.div>
        ) : (
          <div className="space-y-2">
            {notifications.map((n, i) => {
              const config = typeConfig[n.type];
              const Icon = config.icon;
              const actorName = n.actor_profile?.display_name || n.actor_profile?.username || "Someone";
              const initials = actorName.slice(0, 2).toUpperCase();

              return (
                <motion.div
                  key={n.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className={`glass rounded-2xl p-4 flex items-center gap-3 transition-all duration-200 hover:border-border ${
                    !n.read ? "border-l-2 border-l-primary" : ""
                  }`}
                >
                  <Link to={`/user/${n.actor_profile?.username || n.actor_id}`} className="shrink-0">
                    <Avatar className="h-10 w-10 ring-2 ring-border/40">
                      <AvatarImage src={n.actor_profile?.avatar_url || undefined} />
                      <AvatarFallback className="bg-surface text-primary font-semibold text-xs">{initials}</AvatarFallback>
                    </Avatar>
                  </Link>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground">
                      <Link to={`/user/${n.actor_profile?.username || n.actor_id}`} className="font-semibold hover:text-primary transition-colors">
                        {actorName}
                      </Link>{" "}
                      <span className="text-muted-foreground">{config.label}</span>
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}
                    </p>
                  </div>
                  <div className={`h-8 w-8 rounded-full ${config.bg} flex items-center justify-center shrink-0`}>
                    <Icon className={`h-4 w-4 ${config.color}`} />
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
