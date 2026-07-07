import type { MajorConfig } from "@/data/majors";
import type { GameState } from "@/lib/gameStore";
import { PixelCard } from "./PixelCard";

export interface CharacterStatusPanelProps {
  game: GameState;
  major: MajorConfig | null;
  diagnosis: string;
}

export function CharacterStatusPanel({ game, major, diagnosis }: CharacterStatusPanelProps) {
  const yearMap = ["大一", "大二", "大三", "大四"] as const;
  return (
    <PixelCard tone="cream" className="space-y-3">
      <div className="flex items-center gap-3">
        {/* 头像占位；后续替换：<img src="/assets/characters/xxx.png" /> */}
        <div className="pixel-border-sm bg-sky/60 flex h-16 w-16 items-center justify-center text-4xl">
          🧑‍🎓
        </div>
        <div>
          <div className="font-display text-lg leading-none">{game.characterName}</div>
          <div className="mt-1 text-xs text-muted-foreground">
            {game.school} · {yearMap[game.year - 1]}
          </div>
          <div className="mt-1 text-xs">
            专业：<span className="font-semibold">{major?.name ?? "未选择"}</span>
          </div>
        </div>
      </div>

      {major && (
        <div>
          <div className="mb-1 text-xs font-semibold">🩹 专业后遗症</div>
          <div className="flex flex-wrap gap-1">
            {major.aftereffects.map((a) => (
              <span key={a} className="pixel-chip bg-cherry/60 !text-[10px]">{a}</span>
            ))}
          </div>
        </div>
      )}

      <div>
        <div className="mb-1 text-xs font-semibold">🔍 系统诊断</div>
        <div className="rounded border-2 border-dashed border-ink/40 bg-cream/70 p-2 text-xs italic">
          {diagnosis}
        </div>
      </div>

      <div>
        <div className="mb-1 text-xs font-semibold">📜 近期事件</div>
        {game.history.length === 0 ? (
          <div className="text-xs text-muted-foreground">还没有事件记录。</div>
        ) : (
          <ul className="max-h-40 space-y-1 overflow-auto pr-1 text-xs">
            {game.history.slice(0, 6).map((h, i) => (
              <li key={i} className="flex items-center gap-2">
                <span>{h.emoji}</span>
                <span className="text-ink/60">[{h.phase}]</span>
                <span className="truncate">{h.title}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div>
        <div className="mb-1 text-xs font-semibold">✅ 待办清单</div>
        <ul className="space-y-1 text-xs">
          <li>· 别挂科</li>
          <li>· 每周至少一次好好睡觉</li>
          <li>· 存一点简历素材</li>
        </ul>
      </div>
    </PixelCard>
  );
}
