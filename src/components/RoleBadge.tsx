import { GraduationCap, BookOpen } from "lucide-react";

interface RoleBadgeProps {
  role: string | null | undefined;
  size?: "sm" | "md";
}

export function RoleBadge({ role, size = "sm" }: RoleBadgeProps) {
  if (!role) return null;

  const isStudent = role === "student";
  const Icon = isStudent ? GraduationCap : BookOpen;
  const label = isStudent ? "Student" : "Faculty";

  return (
    <span className={`inline-flex items-center gap-1 font-medium rounded-full ${
      isStudent ? "role-badge-student" : "role-badge-faculty"
    } ${size === "sm" ? "text-[10px] px-2 py-0.5" : "text-xs px-2.5 py-1"}`}>
      <Icon className={size === "sm" ? "h-2.5 w-2.5" : "h-3 w-3"} />
      {label}
    </span>
  );
}