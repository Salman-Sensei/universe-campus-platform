import { useTheme, THEMES } from "@/contexts/ThemeContext";
import { Palette } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors rounded-xl px-3 py-2 hover:bg-surface-hover"
      >
        <Palette className="h-4 w-4" />
      </button>
      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: -8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: -8 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 top-full mt-2 z-50 bg-card border border-border/60 rounded-2xl p-3 shadow-2xl min-w-[200px]"
            >
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-2 mb-2">Theme</p>
              <div className="space-y-1">
                {THEMES.map((t) => (
                  <button
                    key={t.name}
                    onClick={() => { setTheme(t.name); setOpen(false); }}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 text-left ${
                      theme === t.name ? "bg-primary/10 text-primary" : "text-foreground hover:bg-surface-hover"
                    }`}
                  >
                    <div className="flex -space-x-1">
                      {t.preview.map((c, i) => (
                        <div
                          key={i}
                          className="h-4 w-4 rounded-full border-2 border-card"
                          style={{ backgroundColor: c }}
                        />
                      ))}
                    </div>
                    <span className="text-sm font-medium">{t.label}</span>
                    {theme === t.name && (
                      <motion.div
                        layoutId="theme-check"
                        className="ml-auto h-2 w-2 rounded-full bg-primary"
                      />
                    )}
                  </button>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
