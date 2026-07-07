import { PixelAvatar } from "@/components/game/PixelIcon";
import { PixelPanel } from "./PixelPanel";
import { StatBar } from "./StatBar";
import { useGameState, VISIBLE_STATS } from "@/lib/gameStore";
import { getMajorById } from "@/data/majors";

/** 角色档案面板：头像 + 名称 + 专业 + 6 项明面属性 + 成就 */
export function CharacterPanel({ compact = false }: { compact?: boolean }) {
  const game = useGameState();
  const major = game.majorId ? getMajorById(game.majorId) : null;
  return (
    <PixelPanel title="角色档案" titleRight={<span className="text-[10px] opacity-70">LV.{game.year}</span>}>
      <div className="flex items-center gap-2.5">
        <div className="pixel-border-sm !shadow-none overflow-hidden shrink-0" style={{ width: 48, height: 48 }}>
          <PixelAvatar size={48} />
        </div>
        <div className="min-w-0">
          <div className="font-display text-[15px] leading-tight truncate">{game.characterName}</div>
          <div className="text-[11px] text-ink/70 truncate">
            {major ? `${major.name} · ${game.school}` : "未入学"}
          </div>
          <div className="mt-1 flex gap-1">
            <span className="tag-badge tag-stable">在读</span>
            {game.achievements.length > 0 && (
              <span className="tag-badge tag-fun">★ {game.achievements.length}</span>
            )}
          </div>
        </div>
      </div>

      {!compact && (
        <>
          <div className="mt-3 space-y-1">
            {VISIBLE_STATS.map((s) => (
              <StatBar key={s.key} label={s.short} value={game.stats[s.key]} color={s.color} size="sm" />
            ))}
          </div>

          {game.achievements.length > 0 && (
            <div className="mt-3">
              <div className="text-[10px] font-display tracking-widest text-ink/60 mb-1">已解锁成就</div>
              <div className="flex flex-wrap gap-1.5">
                {game.achievements.map((a) => (
                  <span key={a.id} className="achievement-medal">★ {a.label}</span>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </PixelPanel>
  );
}
