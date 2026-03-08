import { createContext, useContext, useEffect, useState, ReactNode } from "react";

export type ThemeName = "midnight" | "aurora" | "rose" | "emerald" | "sunset";

interface ThemeContextType {
  theme: ThemeName;
  setTheme: (theme: ThemeName) => void;
}

const ThemeContext = createContext<ThemeContextType>({ theme: "midnight", setTheme: () => {} });

export const THEMES: { name: ThemeName; label: string; preview: string[] }[] = [
  { name: "midnight", label: "Midnight", preview: ["#3b82f6", "#8b5cf6", "#0f1118"] },
  { name: "aurora", label: "Aurora", preview: ["#06b6d4", "#a78bfa", "#0c1222"] },
  { name: "rose", label: "Rosé", preview: ["#f43f5e", "#fb923c", "#110c14"] },
  { name: "emerald", label: "Emerald", preview: ["#10b981", "#34d399", "#0a1210"] },
  { name: "sunset", label: "Sunset", preview: ["#f59e0b", "#ef4444", "#14100a"] },
];

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemeName>(() => {
    return (localStorage.getItem("universe-theme") as ThemeName) || "midnight";
  });

  const setTheme = (t: ThemeName) => {
    setThemeState(t);
    localStorage.setItem("universe-theme", t);
  };

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
