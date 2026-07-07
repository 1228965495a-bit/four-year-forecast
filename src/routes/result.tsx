import { useEffect, useMemo, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { PhoneFrame } from "@/components/game/PhoneFrame";
import { PixelAvatar } from "@/components/game/PixelIcon";
import { getMajorById } from "@/data/majors";
import { matchResult, survivalRating } from "@/data/results";
import { gameStore, useGameState, VISIBLE_STATS, STAT_META } from "@/lib/gameStore";

export const Route = createFileRoute("/result")({ component: ResultPage });

function ResultPage() {
  const game = useGameState();
  const navigate = useNavigate();
  const major = game.majorId ? getMajorById(game.majorId) : null;
  const [detailOpen, setDetailOpen] = useState(false);

  useEffect(() => {
    if (!major) navigate({ to: "/major" });
  }, [major, navigate]);

  const result = useMemo(
    () => (major ? matchResult(game.stats, major) : null),
    [game.stats, major]
  );
  const rating = useMemo(() => survivalRating(game.stats), [game.stats]);

  if (!major || !result) return null;

  const share = () => {
    const text = `《这专业我先替你读了四年》\n专业：${major.name}\n人格：${result.title}\n评级：${rating}\n${result.shareText}`;
    if (navigator.share) navigator.share({ title: "本科幸存报告", text }).catch(() => {});
    else { navigator.clipboard?.writeText(text); alert("已复制分享文案，去截图发给想报的人吧。"); }
  };

  const bottomBar = (
    <div className="border-t-[3px] border-ink bg-cream px-3 py-2 space-y-1.5">
      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={() => { gameStore.reset(); navigate({ to: "/major" }); }}
          className="pixel-btn py-2.5 text-[12px]"
          style={{ background: "var(--sage)" }}
        >
          换个专业继续受苦
        </button>
        <button
          onClick={share}
          className="pixel-btn py-2.5 text-[12px]"
          style={{ background: "var(--cherry)", color: "var(--cream)" }}
        >
          截图发给想报的人
        </button>
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
      {/* 结果卡：优化为可截图海报 */}
      <div className="p-3 pb-4">
        <div className="pixel-panel !p-0 overflow-hidden">
          {/* 顶部条 */}
          <div className="relative bg-ink text-cream px-3 py-2 border-b-[3px] border-ink">
            <div className="absolute inset-0 pixel-scanlines opacity-30" />
            <div className="relative flex items-center justify-between">
              <div className="text-[10px] tracking-widest font-display opacity-90">
                CAMPUS · SIM · ENDING
              </div>
              <div className="text-[10px] opacity-80">v0.3</div>
            </div>
          </div>

          {/* 主视觉：专业人格标题 */}
          <div className="bg-sunny/60 border-b-[3px] border-ink px-3 pt-3 pb-3.5 text-center relative">
            <div className="text-[11px] font-display tracking-widest text-ink/70">
              你的本科人生结局
            </div>
            <h1
              className="pixel-logo mt-1.5 leading-[1.05]"
              style={{ fontSize: 26 }}
            >
              {result.title}
            </h1>
            <div className="mt-2 inline-flex items-center gap-1 pixel-border-sm !shadow-none bg-cream px-2 py-0.5 text-[11px]">
              <span className="h-1.5 w-1.5 bg-cherry" />
              评级：{rating}
            </div>
          </div>

          {/* 一句话总结（核心传播位） */}
          <div className="p-3 border-b-[3px] border-ink bg-cream">
            <div className="text-[10px] font-display tracking-widest text-ink/60 mb-1">
              一句话本科总结
            </div>
            <div className="font-display text-[15px] leading-[1.45] text-ink">
              「{result.summary}」
            </div>
          </div>

          {/* 6 项明面数值 */}
          <div className="p-3 border-b-[3px] border-ink">
            <div className="text-[10px] font-display tracking-widest text-ink/60 mb-1.5">
              六项明面数值
            </div>
            <div className="grid grid-cols-2 gap-x-3 gap-y-1.5">
              {VISIBLE_STATS.map((s) => (
                <div key={s.key}>
                  <div className="flex justify-between text-[11px]">
                    <span className="text-ink/80">{s.label}</span>
                    <span className="font-display tabular-nums">{Math.round(game.stats[s.key])}</span>
                  </div>
                  <div className="bar-track !h-2 mt-0.5">
                    <div className="bar-fill" style={{ width: `${game.stats[s.key]}%`, background: s.color }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 专业后遗症 + 系统吐槽 */}
          <div className="p-3 border-b-[3px] border-ink space-y-2">
            <div>
              <div className="text-[10px] font-display tracking-widest text-ink/60 mb-1">
                专业后遗症
              </div>
              <div className="flex flex-wrap gap-1">
                {major.aftereffects.slice(0, 3).map((a) => (
                  <span
                    key={a}
                    className="text-[11px] px-1.5 py-0.5 border-2 border-ink bg-cherry/25 leading-none"
                    style={{ boxShadow: "1px 1px 0 0 var(--ink)" }}
                  >
                    {a}
                  </span>
                ))}
              </div>
            </div>
            <div className="pixel-border-sm !shadow-none bg-sky/30 p-2">
              <div className="text-[10px] font-display tracking-widest text-ink/60 mb-0.5">
                系统建议
              </div>
              <div className="text-[12px] leading-snug">{result.advice}</div>
            </div>
          </div>

          {/* 代表成就 */}
          <div className="p-3 border-b-[3px] border-ink">
            <div className="text-[10px] font-display tracking-widest text-ink/60 mb-1">
              代表成就
            </div>
            <div className="flex flex-wrap gap-1.5">
              {result.achievements.slice(0, 3).map((a) => (
                <span key={a} className="pixel-chip bg-sunny/60 !text-[11px]">★ {a}</span>
              ))}
            </div>
          </div>

          {/* 底部品牌位（截图会带上） */}
          <div className="p-3 bg-ink text-cream text-center">
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

      {detailOpen && (
        <DetailSheet onClose={() => setDetailOpen(false)} />
      )}
    </PhoneFrame>
  );
}

function DetailSheet({ onClose }: { onClose: () => void }) {
  const game = useGameState();
  const major = game.majorId ? getMajorById(game.majorId) : null;
  if (!major) return null;

  return (
    <>
      <button
        aria-label="关闭"
        onClick={onClose}
        className="absolute inset-0 z-40 bg-ink/50"
      />
      <div className="absolute inset-x-0 bottom-0 z-50 sheet-panel p-3 pb-5 animate-pop-in max-h-[85%] overflow-y-auto">
        <div className="mx-auto mb-2 h-1 w-10 rounded-full bg-ink/40" />
        <div className="font-display text-[16px] mb-2">详细报告</div>

        <Section title="本科路径 · 事件回放">
          {game.history.length === 0 && <div className="text-[11px] text-ink/60">还没有记录。</div>}
          <ul className="space-y-1">
            {game.history.slice().reverse().map((h, i) => (
              <li key={i} className="text-[11px] flex gap-2">
                <span className="text-ink/60 shrink-0 w-16">{h.phase.split(" · ")[0]}</span>
                <span className="truncate">{h.title} → {h.choice}</span>
              </li>
            ))}
          </ul>
        </Section>

        <Section title="全部属性（含隐藏）">
          <div className="grid grid-cols-2 gap-2">
            {STAT_META.map((s) => (
              <div key={s.key} className="pixel-border-sm !shadow-none bg-cream p-1.5">
                <div className="flex justify-between text-[11px]">
                  <span>{s.label}{s.hidden ? " ·隐藏" : ""}</span>
                  <span className="font-display tabular-nums">{Math.round(game.stats[s.key])}</span>
                </div>
                <div className="bar-track !h-2 mt-1">
                  <div className="bar-fill" style={{ width: `${game.stats[s.key]}%`, background: s.color }} />
                </div>
              </div>
            ))}
          </div>
        </Section>

        <Section title="专业诊断">
          <div className="text-[12px] leading-snug">{major.diagnosis}</div>
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
              <span key={a} className="text-[11px] px-1.5 py-0.5 border-2 border-ink bg-cherry/20 leading-none">
                {a}
              </span>
            ))}
          </div>
        </Section>

        <Section title="所有成就">
          <div className="flex flex-wrap gap-1.5">
            {game.achievements.length === 0 && <span className="text-[11px] text-ink/60">尚未解锁。</span>}
            {game.achievements.map((a) => (
              <span key={a.id} className="pixel-chip bg-sunny/60 !text-[11px]">★ {a.label}</span>
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
