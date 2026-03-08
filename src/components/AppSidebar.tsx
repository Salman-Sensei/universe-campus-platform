import { Home, User, PlusSquare, Search, LogOut, Sparkles, Bell } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useNotificationsContext } from "@/contexts/NotificationsContext";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";

const navItems = [
  { title: "Feed", url: "/feed", icon: Home },
  { title: "Discover", url: "/discover", icon: Search },
  { title: "Create Post", url: "/create", icon: PlusSquare },
  { title: "Notifications", url: "/notifications", icon: Bell },
  { title: "AI Assistant", url: "/ai", icon: Sparkles },
  { title: "My Profile", url: "/profile", icon: User },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const { unreadCount } = useNotifications();

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <Sidebar collapsible="icon" className="border-r border-border/30">
      <SidebarContent className="pt-6 px-3">
        <div className="px-2 pb-6 mb-2 border-b border-border/30">
          {!collapsed ? (
            <h1 className="text-xl font-display font-bold gradient-text tracking-tight">SpaceHub</h1>
          ) : (
            <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
              <span className="text-primary-foreground font-display font-bold text-sm">S</span>
            </div>
          )}
        </div>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {navItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end
                      className="rounded-xl hover:bg-surface-hover transition-all duration-200 py-2.5"
                      activeClassName="bg-primary/10 text-primary font-semibold glow-border"
                    >
                      <div className="relative">
                        <item.icon className="mr-3 h-[18px] w-[18px]" />
                        {item.title === "Notifications" && unreadCount > 0 && (
                          <span className="absolute -top-1.5 -right-0.5 h-4 min-w-4 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center px-1">
                            {unreadCount > 9 ? "9+" : unreadCount}
                          </span>
                        )}
                      </div>
                      {!collapsed && <span className="text-sm">{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="p-3 border-t border-border/30">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={handleSignOut}
              className="rounded-xl hover:bg-destructive/10 hover:text-destructive transition-all duration-200 py-2.5"
            >
              <LogOut className="mr-3 h-[18px] w-[18px]" />
              {!collapsed && <span className="text-sm">Sign Out</span>}
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
