import type { MajorConfig } from "@/data/majors";
import { PixelCard } from "./PixelCard";
import { StatBar } from "./StatBar";
import { cn } from "@/lib/utils";

const TAG_TONE: Record<string, string> = {
  热门: "bg-cherry/70",
  卷度高: "bg-destructive/50 text-destructive-foreground",
  就业向: "bg-sage/70",
  烧脑: "bg-sky/70",
  兴趣向: "bg-sunny/70",
  稳定: "bg-tan/70",
  慎选: "bg-destructive/40",
  冷门: "bg-muted",
  情怀: "bg-cherry/50",
};

export interface MajorCardProps {
  major: MajorConfig;
  selected?: boolean;
  compact?: boolean;
  onClick?: () => void;
}

export function MajorCard({ major, selected, compact, onClick }: MajorCardProps) {
  return (
    <PixelCard
      tone="cream"
      selected={selected}
      onClick={onClick}
      className={cn("cursor-pointer select-none hover:-translate-y-[2px]", compact && "p-3")}
    >
      <div className="flex items-start gap-3">
        {/* icon 占位；后续替换 iconPath 为 <img src={major.iconPath} /> */}
        <div className="pixel-border-sm bg-sky/60 flex h-12 w-12 items-center justify-center text-2xl">
          {major.emoji}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <h3 className="font-display text-base leading-none truncate">{major.name}</h3>
            <span className="pixel-chip bg-sunny/70 shrink-0">适配 {major.fit}%</span>
          </div>
          <div className="mt-1.5 flex flex-wrap gap-1">
            {major.tags.map((t) => (
              <span
                key={t}
                className={cn("pixel-chip !py-[1px] !px-1.5 !text-[10px]", TAG_TONE[t] || "bg-muted")}
              >
                {t}
              </span>
            ))}
          </div>
        </div>
      </div>

      {!compact && (
        <div className="mt-3 grid grid-cols-2 gap-x-3 gap-y-1.5">
          <StatBar label="兴趣" value={major.stats.interest} tone="cherry" size="sm" showValue={false} />
          <StatBar label="压力" value={major.stats.pressure} tone="cherry" size="sm" showValue={false} />
          <StatBar label="就业" value={major.stats.employment} tone="sage" size="sm" showValue={false} />
          <StatBar label="薪资" value={major.stats.salary} tone="sunny" size="sm" showValue={false} />
          <StatBar label="成长" value={major.stats.growth} tone="sky" size="sm" showValue={false} />
          <StatBar label="稳定" value={major.stats.stability} tone="tan" size="sm" showValue={false} />
        </div>
      )}
    </PixelCard>
  );
}
