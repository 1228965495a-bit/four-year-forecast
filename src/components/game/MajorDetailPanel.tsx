import type { MajorConfig } from "@/data/majors";
import { PixelCard } from "./PixelCard";
import { StatBar } from "./StatBar";
import { PixelButton } from "./PixelButton";

export interface MajorDetailPanelProps {
  major: MajorConfig | null;
  onConfirm?: () => void;
}

export function MajorDetailPanel({ major, onConfirm }: MajorDetailPanelProps) {
  if (!major) {
    return (
      <PixelCard tone="cream" className="h-full">
        <div className="flex h-full min-h-[300px] flex-col items-center justify-center text-center text-muted-foreground">
          <div className="text-5xl mb-2 animate-pixel-float">🎒</div>
          <p className="text-sm">从左边挑一个专业看看吧</p>
          <p className="mt-1 text-[11px]">选错了可以重开，人生不能</p>
        </div>
      </PixelCard>
    );
  }

  return (
    <PixelCard tone="cream" className="h-full">
      <div className="flex items-center gap-3">
        <div className="pixel-border-sm bg-sky/60 flex h-14 w-14 items-center justify-center text-3xl">
          {major.emoji}
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="font-display text-xl leading-none">{major.name}</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            {major.category} · 压力等级 {major.pressureLevel}
          </p>
        </div>
        <div className="pixel-chip bg-sunny/80 !text-sm">适配 {major.fit}%</div>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-x-3 gap-y-2">
        <StatBar label="兴趣" value={major.stats.interest} tone="cherry" size="sm" />
        <StatBar label="压力" value={major.stats.pressure} tone="cherry" size="sm" />
        <StatBar label="就业" value={major.stats.employment} tone="sage" size="sm" />
        <StatBar label="薪资" value={major.stats.salary} tone="sunny" size="sm" />
        <StatBar label="成长" value={major.stats.growth} tone="sky" size="sm" />
        <StatBar label="稳定" value={major.stats.stability} tone="tan" size="sm" />
      </div>

      <Section title="🌟 推荐理由">
        <ul className="space-y-1 text-sm">
          {major.reasons.map((r) => <li key={r}>· {r}</li>)}
        </ul>
      </Section>

      <Section title="⚠️ 慎入人群">
        <ul className="space-y-1 text-sm">
          {major.warnings.map((r) => <li key={r}>· {r}</li>)}
        </ul>
      </Section>

      <Section title="🎯 可能的结局方向">
        <div className="flex flex-wrap gap-1.5">
          {major.endings.map((e) => (
            <span key={e} className="pixel-chip bg-sage/70">{e}</span>
          ))}
        </div>
      </Section>

      <Section title="🩹 专业后遗症">
        <div className="flex flex-wrap gap-1.5">
          {major.aftereffects.map((e) => (
            <span key={e} className="pixel-chip bg-cherry/60">{e}</span>
          ))}
        </div>
      </Section>

      <div className="mt-4 rounded border-2 border-dashed border-ink/40 bg-cream/60 p-2 text-xs italic">
        系统诊断：{major.diagnosis}
      </div>

      {onConfirm && (
        <div className="mt-4 flex justify-end">
          <PixelButton variant="accent" size="lg" onClick={onConfirm}>
            确认选择 →
          </PixelButton>
        </div>
      )}
    </PixelCard>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mt-4">
      <div className="mb-1.5 text-xs font-semibold tracking-wide text-ink/80">{title}</div>
      {children}
    </div>
  );
}
