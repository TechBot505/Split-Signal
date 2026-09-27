import { BookOpen, Wrench } from "lucide-react";
import { cn } from "@/lib/cn";

export type GameRole = "operator" | "advisor";

export interface RoleBadgeProps {
  role: GameRole;
  className?: string;
}

const CONFIG: Record<GameRole, { label: string; Icon: typeof Wrench; tone: string }> = {
  operator: { label: "OPERATOR", Icon: Wrench, tone: "bg-accent/12 text-accent border-accent/30" },
  advisor: { label: "ADVISOR", Icon: BookOpen, tone: "bg-warn/12 text-warn border-warn/30" },
};

/** Current-stage role chip: OPERATOR (acts) or ADVISOR (holds the manual). */
export function RoleBadge({ role, className }: RoleBadgeProps) {
  const { label, Icon, tone } = CONFIG[role];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1",
        tone,
        className
      )}
    >
      <Icon size={13} aria-hidden />
      <span className="label-mono !text-inherit">{label}</span>
    </span>
  );
}
