import { cn } from "@/lib/utils";

export interface StatBarProps {
  label: string;
  value: number; // 0-100
  color?: string;
  showValue?: boolean;
  size?: "xs" | "sm" | "md";
  className?: string;
}

const heightMap = { xs: "!h-1.5", sm: "!h-2", md: "!h-2.5" } as const;

export function StatBar({
  label,
  value,
  color = "var(--sage)",
  showValue = true,
  size = "sm",
  className,
}: StatBarProps) {
  const v = Math.max(0, Math.min(100, Math.round(value)));
  return (
    <div className={cn("stat-row", className)}>
      <span className="text-ink/80 truncate">{label}</span>
      <div className={cn("bar-track", heightMap[size])}>
        <div className="bar-fill" style={{ width: `${v}%`, background: color }} />
      </div>
      {showValue ? (
        <span className="font-display tabular-nums text-right text-[11px]">{v}</span>
      ) : (
        <span />
      )}
    </div>
  );
}
