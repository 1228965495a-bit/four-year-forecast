import { useEffect, useMemo, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { PhoneFrame } from "@/components/game/PhoneFrame";
import { getMajorById } from "@/data/majors";
import { matchResult, survivalRating } from "@/data/results";
import { gameStore, useGameState, VISIBLE_STATS, STAT_META } from "@/lib/gameStore";
import { PixelButton } from "@/components/ui/PixelButton";
import { PixelPanel } from "@/components/ui/PixelPanel";
import { StatBar } from "@/components/ui/StatBar";
import { TagBadge } from "@/components/ui/TagBadge";

export const Route = createFileRoute("/result")({ component: ResultPage });

function ResultPage() {
  const game = useGameState();
  const navigate = useNavigate();
  const major = game.majorId ? getMajorById(game.majorId) : null;
  const [detailOpen, setDetailOpen] = useState(false);

  useEffect(() => {
    if (!major) navigate({ to: "/major" });
  }, [major, navigate]);

  const result = useMemo(() => (major ? matchResult(game.stats, major) : null), [game.stats, major]);
  const rating = useMemo(() => survivalRating(game.stats), [game.stats]);

  if (!major || !result) return null;

  const share = () => {
    const text = `《这专业我先替你读了四年》\n专业：${major.name}\n人格：${result.title}\n评级：${rating}\n${result.shareText}`;
    if (navigator.share) navigator.share({ title: "本科幸存报告", text }).catch(() => {});
    else {
      navigator.clipboard?.writeText(text);
      alert("已复制分享文案，去截图发给想报的人吧。");
    }
  };

  const bottomBar = (
    <div className="border-t-[3px] border-ink bg-cream px-3 py-2 space-y-1.5">
      <div className="grid grid-cols-2 gap-2">
        <PixelButton
          variant="primary"
          size="block"
          onClick={() => {
            gameStore.reset();
            navigate({ to: "/major" });
          }}
        >
          换个专业继续受苦
        </PixelButton>
        <PixelButton variant="accent" size="block" onClick={share}>
          截图发给想报的人
        </PixelButton>
      </div>
      <button
        onClick={() => setDetailOpen(true)}
        className="w-full pixel-tab !justify-center py-1"
      >
        查看详细报告 →
      </button>
    </div>
  );

  return (
    <PhoneFrame bottomBar={bottomBar}>
      <div className="p-3 pb-4">
        {/* 结局海报卡 */}
        <div className="pixel-panel !p-0 overflow-hidden">
          {/* 顶部条 */}
          <div className="relative bg-ink text-cream px-3 py-2 border-b-[3px] border-ink">
            <div className="absolute inset-0 pixel-scanlines opacity-30" />
            <div className="relative flex items-center justify-between">
              <div className="text-[10px] tracking-widest font-display opacity-90">
                CAMPUS · SIM · ENDING
              </div>
              <div className="text-[10px] opacity-80">FINAL REPORT</div>
            </div>
          </div>

          {/* 主视觉：专业人格标题 */}
          <div
            className="border-b-[3px] border-ink px-3 pt-3 pb-4 text-center relative"
            style={{ background: "var(--parchment)" }}
          >
            <div className="text-[11px] font-display tracking-widest text-ink/70">
              你的本科人生结局
            </div>
            <h1 className="pixel-logo mt-1.5 leading-[1.05]" style={{ fontSize: 26 }}>
              {result.title}
            </h1>
            <div className="mt-3 flex justify-center gap-1.5 flex-wrap">
              <span className="achievement-medal">★ 评级</span>
              <span className="pixel-chip bg-cream !text-[11px]">{rating}</span>
            </div>
          </div>

          {/* 一句话总结 */}
          <PixelPanel title="一句话本科总结" size="sm" tone="cream" bodyClassName="p-3">
            <div className="font-display text-[15px] leading-[1.45] text-ink">
              「{result.summary}」
            </div>
          </PixelPanel>

          {/* 6 项明面数值 */}
          <PixelPanel title="六项明面数值" size="sm" bodyClassName="p-3">
            <div className="grid grid-cols-2 gap-x-3 gap-y-1">
              {VISIBLE_STATS.map((s) => (
                <StatBar
                  key={s.key}
                  label={s.label}
                  value={game.stats[s.key]}
                  color={s.color}
                  size="sm"
                />
              ))}
            </div>
          </PixelPanel>

          {/* 专业后遗症 */}
          <PixelPanel title="专业后遗症" size="sm" tone="cherry" bodyClassName="p-3">
            <div className="flex flex-wrap gap-1">
              {major.aftereffects.slice(0, 4).map((a) => (
                <TagBadge key={a} tone="hard">{a}</TagBadge>
              ))}
            </div>
          </PixelPanel>

          {/* 系统建议 */}
          <div className="px-3 pt-1 pb-3">
            <div className="diag-note">
              <div className="text-[10px] font-display tracking-widest text-ink/60 mb-0.5">
                系统建议
              </div>
              <div className="text-[12.5px]">{result.advice}</div>
            </div>
          </div>

          {/* 代表成就 */}
          <PixelPanel title="代表成就" size="sm" tone="sunny" bodyClassName="p-3">
            <div className="flex flex-wrap gap-1.5">
              {result.achievements.slice(0, 3).map((a) => (
                <span key={a} className="achievement-medal">★ {a}</span>
              ))}
            </div>
          </PixelPanel>

          {/* 分享文案 */}
          <div className="px-3 pt-1 pb-3">
            <div
              className="border-[3px] border-ink shadow-[3px_3px_0_0_var(--ink)] p-2.5 relative"
              style={{ background: "var(--parchment)" }}
            >
              <div className="absolute -top-2 left-3 pixel-chip bg-cherry !text-cream !text-[10px]">
                分享文案
              </div>
              <div className="font-display text-[13px] leading-snug pt-1">
                「{result.shareText}」
              </div>
            </div>
          </div>

          {/* 品牌落款 */}
          <div className="bg-ink text-cream text-center py-3">
            <div className="text-[10px] font-display tracking-widest opacity-70 mb-0.5">
              这段分享自
            </div>
            <div className="font-display text-[15px] tracking-wider">
              这专业我先替你读了四年
            </div>
            <div className="text-[10px] opacity-60 mt-0.5">
              {major.name} · {game.characterName}
            </div>
          </div>
        </div>
      </div>

      {detailOpen && <DetailSheet onClose={() => setDetailOpen(false)} />}
    </PhoneFrame>
  );
}

function DetailSheet({ onClose }: { onClose: () => void }) {
  const game = useGameState();
  const major = game.majorId ? getMajorById(game.majorId) : null;
  if (!major) return null;

  return (
    <>
      <button aria-label="关闭" onClick={onClose} className="absolute inset-0 z-40 bg-ink/50" />
      <div className="absolute inset-x-0 bottom-0 z-50 sheet-panel p-3 pb-5 animate-pop-in max-h-[85%] overflow-y-auto">
        <div className="mx-auto mb-2 h-1 w-10 rounded-full bg-ink/40" />
        <div className="font-display text-[16px] mb-2">详细报告</div>

        <Section title="本科路径 · 事件回放">
          {game.history.length === 0 && (
            <div className="text-[11px] text-ink/60">还没有记录。</div>
          )}
          <ul className="space-y-1">
            {game.history.slice().reverse().map((h, i) => (
              <li key={i} className="text-[11px] flex gap-2">
                <span className="text-ink/60 shrink-0 w-16">{h.phase.split(" · ")[0]}</span>
                <span className="truncate">
                  {h.title} → {h.choice}
                </span>
              </li>
            ))}
          </ul>
        </Section>

        <Section title="全部属性（含隐藏）">
          <div className="grid grid-cols-2 gap-x-3 gap-y-1">
            {STAT_META.map((s) => (
              <StatBar
                key={s.key}
                label={s.label + (s.hidden ? " ·隐藏" : "")}
                value={game.stats[s.key]}
                color={s.color}
                size="sm"
              />
            ))}
          </div>
        </Section>

        <Section title="专业诊断">
          <div className="diag-note">{major.diagnosis}</div>
        </Section>

        <Section title="就业方向">
          <div className="flex flex-wrap gap-1">
            {major.employmentDirection.map((d) => (
              <span key={d} className="pixel-chip !text-[11px] bg-cream">{d}</span>
            ))}
          </div>
        </Section>

        <Section title="所有专业后遗症">
          <div className="flex flex-wrap gap-1">
            {major.aftereffects.map((a) => (
              <TagBadge key={a} tone="hard">{a}</TagBadge>
            ))}
          </div>
        </Section>

        <Section title="所有成就">
          <div className="flex flex-wrap gap-1.5">
            {game.achievements.length === 0 && (
              <span className="text-[11px] text-ink/60">尚未解锁。</span>
            )}
            {game.achievements.map((a) => (
              <span key={a.id} className="achievement-medal">★ {a.label}</span>
            ))}
          </div>
        </Section>
      </div>
    </>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-3">
      <div className="text-[10px] font-display tracking-widest text-ink/60 mb-1">{title}</div>
      {children}
    </div>
  );
}
