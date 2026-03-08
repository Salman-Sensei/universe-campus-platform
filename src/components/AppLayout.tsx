import { ReactNode } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { ThemeSwitcher } from "@/components/ThemeSwitcher";
import { NotificationDropdown } from "@/components/NotificationDropdown";
import { motion } from "framer-motion";
import { GraduationCap } from "lucide-react";

export function AppLayout({ children }: { children: ReactNode }) {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full gradient-mesh">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-14 flex items-center justify-between border-b border-border/40 glass-strong sticky top-0 z-30 px-5">
            <div className="flex items-center gap-3">
              <SidebarTrigger className="text-muted-foreground hover:text-foreground transition-colors" />
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg gradient-primary flex items-center justify-center">
                  <GraduationCap className="h-3.5 w-3.5 text-primary-foreground" />
                </div>
                <span className="font-display font-bold text-foreground tracking-tight hidden sm:inline">UniVerse</span>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <NotificationDropdown />
              <ThemeSwitcher />
            </div>
          </header>
          <motion.main
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="flex-1 overflow-auto"
          >
            {children}
          </motion.main>
        </div>
      </div>
    </SidebarProvider>
  );
}
