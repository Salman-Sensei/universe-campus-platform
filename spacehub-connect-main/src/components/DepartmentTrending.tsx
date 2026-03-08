import { Flame, TrendingUp, Users } from "lucide-react";
import { motion } from "framer-motion";

const DEPARTMENTS = [
  "Computer Science",
  "Software Engineering",
  "AI & Data Science",
  "Mathematics",
  "Business",
];

const TRENDING_TOPICS = [
  { dept: "Computer Science", topic: "React vs Vue debate", posts: 24 },
  { dept: "AI & Data Science", topic: "GPT-5 research papers", posts: 18 },
  { dept: "Software Engineering", topic: "Clean architecture patterns", posts: 15 },
  { dept: "Mathematics", topic: "Linear algebra study group", posts: 12 },
  { dept: "Business", topic: "Startup pitch competition", posts: 9 },
];

export function DepartmentTrending() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.15 }}
      className="glass-card rounded-2xl p-5 hover:translate-y-0"
    >
      <div className="flex items-center gap-2 mb-4">
        <div className="h-7 w-7 rounded-lg bg-warning/10 flex items-center justify-center">
          <Flame className="h-3.5 w-3.5 text-warning" />
        </div>
        <h3 className="font-display font-bold text-sm text-foreground">Trending Now</h3>
      </div>
      <div className="space-y-1">
        {TRENDING_TOPICS.map((item, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 + i * 0.05 }}
            className="group rounded-xl p-3 -mx-1 hover:bg-surface-hover transition-all duration-200 cursor-pointer"
          >
            <div className="flex items-center gap-1.5 mb-1">
              <span className="text-[10px] font-medium text-primary/70">
                🔥 Trending in {item.dept}
              </span>
            </div>
            <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
              {item.topic}
            </p>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              {item.posts} posts today
            </p>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
