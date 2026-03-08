import { createContext, useContext, ReactNode } from "react";
import { useNotifications } from "@/hooks/useNotifications";

type NotificationsContextType = ReturnType<typeof useNotifications>;

const NotificationsContext = createContext<NotificationsContextType | undefined>(undefined);

export function NotificationsProvider({ children }: { children: ReactNode }) {
  const notifications = useNotifications();
  return (
    <NotificationsContext.Provider value={notifications}>
      {children}
    </NotificationsContext.Provider>
  );
}

export function useNotificationsContext() {
  const context = useContext(NotificationsContext);
  if (!context) throw new Error("useNotificationsContext must be used within NotificationsProvider");
  return context;
}
