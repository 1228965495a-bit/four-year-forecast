import { useEffect, useMemo, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { PhoneFrame } from "@/components/game/PhoneFrame";
import { getMajorById } from "@/data/majors";
import { matchResult, survivalRating } from "@/data/results";
import { gameStore, useGameState, VISIBLE_STATS, STAT_META } from "@/lib/gameStore";
import { PixelButton } from "@/components/ui/PixelButton";
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

  return (
    <PhoneFrame>
      <div className="p-3 pb-4 space-y-3">
        {/* ========== 主报告卡：一整张，无内部粗边框 ========== */}
        <article
          className="border-[3px] border-ink shadow-[5px_5px_0_0_var(--ink)] overflow-hidden"
          style={{ background: "var(--cream)" }}
        >
          {/* 顶部盖章条 */}
          <div className="relative bg-ink text-cream px-3 py-1.5 flex items-center justify-between">
            <div className="absolute inset-0 pixel-scanlines opacity-25" />
            <div className="relative text-[10px] font-display tracking-[0.2em]">
              ▌ FINAL · REPORT
            </div>
            <div className="relative text-[10px] font-display tracking-widest opacity-80">
              REPORT ID：{String(major.id).slice(0, 6).toUpperCase()}-001
            </div>
          </div>

          {/* 主视觉：结局身份 */}
          <header
            className="px-4 pt-5 pb-5 text-center relative border-b-[3px] border-dashed border-ink/50"
            style={{ background: "var(--parchment)" }}
          >
            <div className="text-[10px] font-display tracking-[0.3em] text-ink/60">
              你的本科人生结局
            </div>
            <div className="mt-1.5 inline-flex items-center gap-1 px-2.5 py-0.5 border-2 border-ink bg-cream font-display text-[11px]">
              <span className="text-ink/50">MAJOR</span>
              <span>{major.name}</span>
            </div>
            <h1
              className="pixel-logo mt-3 leading-[1.1]"
              style={{ fontSize: 28 }}
            >
              {result.title}
            </h1>

            {/* 评级 stamp */}
            <div className="mt-3.5 flex justify-center">
              <div className="relative -rotate-3 flex flex-col items-center gap-0.5 px-2.5 py-1.5 border-[2.5px] border-cherry bg-cream shadow-[2px_2px_0_0_var(--ink)]">
                <span className="text-cherry font-display text-[9px] tracking-[0.2em]">
                  ★ 评级
                </span>
                <span className="font-display text-[11px] text-ink leading-tight">
                  {rating}
                </span>
                <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ background: "radial-gradient(circle at 30% 30%, var(--cherry), transparent 70%)" }} />
              </div>
            </div>

            {/* 一句话总结 — pull quote */}
            <blockquote
              className="mt-4 mx-auto max-w-[92%] text-left relative px-3 py-2 border-l-[4px] border-cherry bg-cream/80"
            >
              <div className="absolute -top-2 -left-1 font-display text-cherry text-[20px] leading-none">
                “
              </div>
              <p className="font-display text-[13.5px] leading-[1.55] text-ink pl-1">
                {result.summary}
              </p>
            </blockquote>
          </header>

          {/* ===== 高亮：专业后遗症 / 永久 Debuff ===== */}
          <section className="px-3 pt-3 pb-2">
            <SectionLabel accent="cherry">专业后遗症 · 永久 DEBUFF</SectionLabel>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {major.aftereffects.map((a) => (
                <span
                  key={a}
                  className="inline-flex items-center gap-1 border-2 border-ink bg-cherry/90 text-cream font-display text-[12px] px-2 py-0.5 shadow-[2px_2px_0_0_var(--ink)]"
                >
                  <span className="opacity-80">×</span>
                  {a}
                </span>
              ))}
            </div>
          </section>

          {/* ===== 系统诊断 ===== */}
          <section className="px-3 pt-2 pb-2">
            <SectionLabel>系统诊断 · DIAGNOSIS</SectionLabel>
            <div
              className="relative mt-1.5 border-2 border-dashed border-ink/60 p-2.5"
              style={{ background: "var(--parchment)" }}
            >
              <p className="text-[12.5px] leading-[1.55] text-ink">
                {result.advice}
              </p>
            </div>
          </section>

          {/* ===== 最终属性面板 ===== */}
          <section className="px-3 pt-2 pb-2">
            <SectionLabel>最终属性面板 · STATS</SectionLabel>
            <div className="mt-1.5 grid grid-cols-2 gap-x-3 gap-y-1.5">
              {VISIBLE_STATS.map((s) => {
                const v = Math.max(0, Math.min(100, Math.round(game.stats[s.key])));
                return (
                  <div key={s.key} className="min-w-0">
                    <div className="flex items-baseline justify-between gap-1">
                      <span className="text-[11px] text-ink/80 whitespace-nowrap">
                        {s.label}
                      </span>
                      <span className="font-display text-[11px] tabular-nums">
                        {v}
                      </span>
                    </div>
                    <div className="bar-track !h-1.5 mt-0.5">
                      <div
                        className="bar-fill"
                        style={{ width: `${v}%`, background: s.color }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* ===== 高亮：代表成就 ===== */}
          <section className="px-3 pt-2 pb-3">
            <SectionLabel accent="sunny">代表成就 · ACHIEVEMENTS</SectionLabel>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {result.achievements.slice(0, 3).map((a) => (
                <span
                  key={a}
                  className="inline-flex items-center gap-1 border-2 border-ink bg-sunny text-ink font-display text-[12px] px-2 py-0.5 shadow-[2px_2px_0_0_var(--ink)]"
                >
                  ★ {a}
                </span>
              ))}
            </div>
          </section>



          {/* ===== 分享文案 stamp ===== */}
          <section className="px-3 pb-3">
            <div
              className="relative border-[3px] border-ink p-2.5 pt-3"
              style={{ background: "var(--sunny)" }}
            >
              <div className="absolute -top-2.5 left-2.5 pixel-chip !bg-ink !text-cream !text-[10px]">
                📣 一句话安利/劝退
              </div>
              <p className="font-display text-[13.5px] leading-[1.5] text-ink">
                「{result.shareText}」
              </p>
            </div>
          </section>

          {/* 落款 */}
          <footer className="bg-ink text-cream text-center px-3 py-2.5">
            <div className="text-[10px] font-display tracking-[0.25em] opacity-70">
              这段分享自
            </div>
            <div className="font-display text-[13px] tracking-wider mt-0.5">
              这专业我先替你读了四年
            </div>
            <div className="text-[10px] opacity-60 mt-0.5">
              {major.name} · {game.characterName}
            </div>
          </footer>
        </article>

        {/* ========== 操作区：贴合报告卡外，纸质小按钮 ========== */}
        <div className="space-y-2">
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
            className="w-full text-center text-[11px] font-display tracking-wider text-ink/70 underline underline-offset-4 decoration-dashed py-1"
          >
            查看详细报告 →
          </button>
        </div>
      </div>

      {detailOpen && <DetailSheet onClose={() => setDetailOpen(false)} />}
    </PhoneFrame>
  );
}

function SectionLabel({
  children,
  accent,
}: {
  children: React.ReactNode;
  accent?: "cherry" | "sunny";
}) {
  const barColor =
    accent === "cherry" ? "var(--cherry)" : accent === "sunny" ? "var(--sunny)" : "var(--ink)";
  return (
    <div className="flex items-center gap-1.5">
      <span
        className="inline-block h-2.5 w-2.5"
        style={{ background: barColor, boxShadow: "1px 1px 0 0 var(--ink)" }}
      />
      <span className="text-[10.5px] font-display tracking-[0.2em] text-ink/70">
        {children}
      </span>
      <span className="flex-1 h-px bg-ink/20" />
    </div>
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
          <div className="grid grid-cols-2 gap-x-3 gap-y-1.5">
            {STAT_META.map((s) => {
              const v = Math.max(0, Math.min(100, Math.round(game.stats[s.key])));
              return (
                <div key={s.key} className="min-w-0">
                  <div className="flex items-baseline justify-between gap-1">
                    <span className="text-[11px] text-ink/80 whitespace-nowrap">
                      {s.label}
                      {s.hidden ? "·隐" : ""}
                    </span>
                    <span className="font-display text-[11px] tabular-nums">{v}</span>
                  </div>
                  <div className="bar-track !h-1.5 mt-0.5">
                    <div className="bar-fill" style={{ width: `${v}%`, background: s.color }} />
                  </div>
                </div>
              );
            })}
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
