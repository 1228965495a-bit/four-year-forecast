import type { MajorConfig } from "@/data/majors";
import type { CharStats } from "@/lib/gameStore";
import type { ResultTemplate } from "@/data/results";
import { PixelCard } from "./PixelCard";
import { StatBar } from "./StatBar";
import { AchievementBadge } from "./AchievementBadge";

export interface ResultCardProps {
  result: ResultTemplate;
  major: MajorConfig;
  stats: CharStats;
  fitScore: number;
}

export function ResultCard({ result, major, stats, fitScore }: ResultCardProps) {
  return (
    <PixelCard tone="cream" className="mx-auto max-w-3xl">
      <div className="flex flex-col items-center gap-2 text-center">
        <div className="pixel-border-sm bg-sunny/70 flex h-20 w-20 items-center justify-center text-5xl animate-pixel-float">
          {result.emoji}
        </div>
        <div className="text-xs uppercase tracking-widest text-ink/60">四年模拟结果</div>
        <h1 className="font-display text-3xl">你成为了「{result.title}」</h1>
        <p className="text-sm text-ink/80">专业：{major.name}</p>
        <div className="pixel-chip bg-cherry/70 !text-sm">适配指数 {fitScore}%</div>
      </div>

      <div className="mt-6 rounded border-2 border-dashed border-ink/40 bg-cream/70 p-3 text-sm">
        <div className="mb-1 text-xs font-semibold">📖 本科路径总结</div>
        {result.summary}
      </div>

      <div className="mt-4">
        <div className="mb-2 text-xs font-semibold">📊 六项数值</div>
        <div className="grid grid-cols-2 gap-x-4 gap-y-2 md:grid-cols-3">
          <StatBar label="兴趣" value={stats.study} tone="cherry" />
          <StatBar label="压力" value={100 - stats.mental} tone="cherry" />
          <StatBar label="就业" value={stats.internship} tone="sage" />
          <StatBar label="薪资" value={stats.money} tone="sunny" />
          <StatBar label="成长" value={(stats.study + stats.internship) / 2} tone="sky" />
          <StatBar label="稳定" value={(stats.mental + stats.energy) / 2} tone="tan" />
        </div>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <div>
          <div className="mb-1 text-xs font-semibold">🩹 专业后遗症</div>
          <div className="flex flex-wrap gap-1">
            {major.aftereffects.map((a) => (
              <span key={a} className="pixel-chip bg-cherry/60 !text-[11px]">{a}</span>
            ))}
          </div>
        </div>
        <div>
          <div className="mb-1 text-xs font-semibold">🎖️ 代表成就</div>
          <div className="flex flex-wrap gap-1.5">
            {result.achievements.map((a) => (
              <AchievementBadge key={a} label={a} emoji="🏅" />
            ))}
          </div>
        </div>
      </div>

      <div className="mt-4 rounded border-2 border-dashed border-ink/40 bg-sky/40 p-3 text-sm">
        <div className="mb-1 text-xs font-semibold">🔍 系统诊断</div>
        {major.diagnosis}
      </div>

      <div className="mt-3 rounded border-2 border-dashed border-ink/40 bg-sage/40 p-3 text-sm">
        <div className="mb-1 text-xs font-semibold">📌 报考建议</div>
        {result.advice}
      </div>

      <div className="mt-3 rounded border-2 border-dashed border-ink/40 bg-sunny/50 p-3 text-sm italic">
        “{result.shareText}”
      </div>
    </PixelCard>
  );
}
