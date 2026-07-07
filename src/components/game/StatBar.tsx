import { cn } from "@/lib/utils";

export interface StatBarProps {
  label: string;
  value: number; // 0-100
  max?: number;
  icon?: string;
  tone?: "sage" | "sky" | "cherry" | "sunny" | "tan";
  size?: "sm" | "md";
  showValue?: boolean;
  className?: string;
}

const toneBg = {
  sage: "bg-sage",
  sky: "bg-sky",
  cherry: "bg-cherry",
  sunny: "bg-sunny",
  tan: "bg-tan",
};

export function StatBar({
  label,
  value,
  max = 100,
  icon,
  tone = "sage",
  size = "md",
  showValue = true,
  className,
}: StatBarProps) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  // Pixel segmented bar
  const segments = 10;
  const filled = Math.round((pct / 100) * segments);

  return (
    <div className={cn("w-full", className)}>
      <div className={cn("flex items-center justify-between mb-1", size === "sm" ? "text-[11px]" : "text-xs")}>
        <span className="flex items-center gap-1 font-medium">
          {icon && <span>{icon}</span>}
          {label}
        </span>
        {showValue && <span className="tabular-nums text-muted-foreground">{Math.round(value)}</span>}
      </div>
      <div
        className={cn(
          "pixel-border-sm bg-cream flex gap-[2px] p-[2px]",
          size === "sm" ? "h-3" : "h-4",
        )}
      >
        {Array.from({ length: segments }).map((_, i) => (
          <div
            key={i}
            className={cn(
              "flex-1 transition-all",
              i < filled ? toneBg[tone] : "bg-muted",
            )}
          />
        ))}
      </div>
    </div>
  );
}
