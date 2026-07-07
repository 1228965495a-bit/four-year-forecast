import { cn } from "@/lib/utils";

export interface AchievementBadgeProps {
  label: string;
  emoji: string;
  unlocked?: boolean;
  className?: string;
}

export function AchievementBadge({ label, emoji, unlocked = true, className }: AchievementBadgeProps) {
  return (
    <div
      className={cn(
        "pixel-border-sm flex items-center gap-2 px-2 py-1.5 transition-all",
        unlocked ? "bg-sunny/70" : "bg-muted opacity-60 grayscale",
        className,
      )}
      title={label}
    >
      <span className="text-lg leading-none">{emoji}</span>
      <span className="text-[11px] font-medium">{label}</span>
    </div>
  );
}
