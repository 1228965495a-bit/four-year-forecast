import { useEffect, useMemo, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { PhoneFrame } from "@/components/game/PhoneFrame";
import { gameStore, useGameState } from "@/lib/gameStore";
import { pickEnding } from "@/lib/scriptEngine";
import { STAT_META, HUD_STATS } from "@/lib/statsMeta";
import { majorById, achievementsByMajorId } from "@/data/script/gameData";
import { PixelButton } from "@/components/ui/PixelButton";
import {
  PixelHeader,
  PixelDebuffBadge,
  PixelAchievementBadge,
  PixelStatBar,
  PixelBgPanel,
  PixelImgButton,
} from "@/components/pixel/PixelSkin";

export const Route = createFileRoute("/result")({ component: ResultPage });

function ResultPage() {
  const game = useGameState();
  const navigate = useNavigate();
  const major = game.majorId ? majorById[game.majorId] : null;
  const [detailOpen, setDetailOpen] = useState(false);

  useEffect(() => {
    if (!major) navigate({ to: "/major" });
  }, [major, navigate]);

  const ending = useMemo(() => {
    if (!major) return null;
    if (game.endingId) {
      const pool = major.endings ?? [];
      const byId = (id: string) => {
        // endingsByMajorId source is loose; find via engine helper
        // small inline search:
        return (pool as string[]).includes?.(id) ? null : null;
      };
      byId; // placeholder
    }
    return pickEnding(game);
  }, [game, major]);

  if (!major) return null;

  const achMap = useMemo(() => {
    const map: Record<string, any> = {};
    for (const a of achievementsByMajorId[major.id] ?? []) map[a.id] = a;
    return map;
  }, [major]);

  const share = () => {
    const text = `《这专业我先替你读了四年》\n专业：${major.name}\n结局：${ending?.title ?? "毕业"}\n${ending?.shareText ?? ""}`;
    if (navigator.share) navigator.share({ title: "本科幸存报告", text }).catch(() => {});
    else {
      navigator.clipboard?.writeText(text);
      alert("已复制分享文案，去截图发给想报的人吧。");
    }
  };

  const title = ending?.title ?? `${major.name}·顺利毕业`;
  const summary = ending?.summary ?? "你把本科四年跑完了，说不上惊艳，也没有翻车。";
  const advice = ending?.advice ?? "别把学历当护身符，接下来才是正片。";
  const afterEffects: string[] = ending?.afterEffects ?? major.painPoints?.slice(0, 3) ?? [];
  const shareText = ending?.shareText ?? major.shareTexts?.[0] ?? summary;
  const resultTags: string[] = ending?.resultTags ?? [];
  const achievementsToShow = game.achievements.slice(0, 4);

  return (
    <PhoneFrame>
      <div className="p-3 pb-6 space-y-3 flex-1 min-h-0 overflow-y-auto">
        <article
          className="border-[3px] border-ink shadow-[5px_5px_0_0_var(--ink)] overflow-hidden"
          style={{ background: "var(--cream)" }}
        >
          <div className="relative bg-ink text-cream px-3 py-1.5 flex items-center justify-between">
            <div className="absolute inset-0 pixel-scanlines opacity-25" />
            <div className="relative text-[10px] font-display tracking-[0.2em]">▌ FINAL · REPORT</div>
            <div className="relative text-[10px] font-display tracking-widest opacity-80">
              FILE：{String(major.id).slice(0, 6).toUpperCase()}
            </div>
          </div>

          <header
            className="px-4 pt-5 pb-5 text-center relative border-b-[3px] border-dashed border-ink/50"
            style={{ background: "var(--parchment)" }}
          >
            <div className="text-[10px] font-display tracking-[0.3em] text-ink/60">
              你的本科人生结局
            </div>
            <h1 className="pixel-logo mt-3 leading-[1.1]" style={{ fontSize: 26 }}>
              {title}
            </h1>

            {resultTags.length > 0 && (
              <div className="mt-3 flex justify-center flex-wrap gap-1.5">
                {resultTags.map((t) => (
                  <span key={t} className="text-[10px] font-display px-1.5 py-0.5 border-2 border-cherry text-cherry bg-cream">
                    {t}
                  </span>
                ))}
              </div>
            )}

            <blockquote className="mt-4 mx-auto max-w-[92%] text-left relative px-3 py-2 border-l-[4px] border-cherry bg-cream/80">
              <div className="absolute -top-2 -left-1 font-display text-cherry text-[20px] leading-none">“</div>
              <p className="font-display text-[13.5px] leading-[1.55] text-ink pl-1">{summary}</p>
            </blockquote>
          </header>

          <section className="px-3 pt-3 pb-2">
            <SectionLabel accent="cherry">专业后遗症 · 永久 DEBUFF</SectionLabel>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {afterEffects.map((a) => (
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

          <section className="px-3 pt-2 pb-2">
            <SectionLabel>系统诊断 · DIAGNOSIS</SectionLabel>
            <div
              className="relative mt-1.5 border-2 border-dashed border-ink/60 p-2.5"
              style={{ background: "var(--parchment)" }}
            >
              <p className="text-[12.5px] leading-[1.55] text-ink">{advice}</p>
            </div>
          </section>

          <section className="px-3 pt-2 pb-2">
            <SectionLabel>最终属性面板 · STATS</SectionLabel>
            <div className="mt-1.5 grid grid-cols-2 gap-x-3 gap-y-1.5">
              {HUD_STATS.map((s) => {
                const v = Math.max(0, Math.min(100, Math.round(game.stats[s.key] ?? 0)));
                return (
                  <div key={s.key} className="min-w-0">
                    <div className="flex items-baseline justify-between gap-1">
                      <span className="text-[11px] text-ink/80 whitespace-nowrap">{s.label}</span>
                      <span className="font-display text-[11px] tabular-nums">{v}</span>
                    </div>
                    <div className="bar-track !h-1.5 mt-0.5">
                      <div className="bar-fill" style={{ width: `${v}%`, background: s.color }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {achievementsToShow.length > 0 && (
            <section className="px-3 pt-2 pb-3">
              <SectionLabel accent="sunny">代表成就 · ACHIEVEMENTS</SectionLabel>
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                {achievementsToShow.map((id) => {
                  const a = achMap[id];
                  return (
                    <span
                      key={id}
                      className="inline-flex items-center gap-1 border-2 border-ink bg-sunny text-ink font-display text-[12px] px-2 py-0.5 shadow-[2px_2px_0_0_var(--ink)]"
                    >
                      ★ {a?.name ?? id}
                    </span>
                  );
                })}
              </div>
            </section>
          )}


          <footer className="bg-ink text-cream text-center px-3 py-2.5">
            <div className="text-[10px] font-display tracking-[0.25em] opacity-70">这段分享自</div>
            <div className="font-display text-[13px] tracking-wider mt-0.5">
              这专业我先替你读了四年
            </div>
            <div className="text-[10px] opacity-60 mt-0.5">
              {major.name} · {game.characterName}
            </div>
          </footer>
        </article>

        <div className="space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <PixelButton
              variant="primary" size="block"
              onClick={() => { gameStore.reset(); navigate({ to: "/" }); }}
            >
              回到首页
            </PixelButton>
            <PixelButton
              variant="primary" size="block"
              onClick={() => { gameStore.reset(); navigate({ to: "/major" }); }}
            >
              挑战其他专业
            </PixelButton>
          </div>
          <PixelButton variant="accent" size="block" onClick={share}>
            截图发给想报的人
          </PixelButton>
          <button
            onClick={() => setDetailOpen(true)}
            className="w-full text-center text-[11px] font-display tracking-wider text-ink/70 underline underline-offset-4 decoration-dashed py-1"
          >
            查看详细报告 →
          </button>
        </div>
      </div>

      {detailOpen && <DetailSheet onClose={() => setDetailOpen(false)} achMap={achMap} />}
    </PhoneFrame>
  );
}

function SectionLabel({
  children, accent,
}: { children: React.ReactNode; accent?: "cherry" | "sunny" }) {
  const barColor =
    accent === "cherry" ? "var(--cherry)" : accent === "sunny" ? "var(--sunny)" : "var(--ink)";
  return (
    <div className="flex items-center gap-1.5">
      <span className="inline-block h-2.5 w-2.5" style={{ background: barColor, boxShadow: "1px 1px 0 0 var(--ink)" }} />
      <span className="text-[10.5px] font-display tracking-[0.2em] text-ink/70">{children}</span>
      <span className="flex-1 h-px bg-ink/20" />
    </div>
  );
}

function DetailSheet({ onClose, achMap }: { onClose: () => void; achMap: Record<string, any> }) {
  const game = useGameState();
  const major = game.majorId ? majorById[game.majorId] : null;
  if (!major) return null;

  return (
    <>
      <button aria-label="关闭" onClick={onClose} className="absolute inset-0 z-40 bg-ink/50" />
      <div className="absolute inset-x-0 bottom-0 z-50 sheet-panel p-3 pb-5 animate-pop-in max-h-[85%] overflow-y-auto">
        <div className="mx-auto mb-2 h-1 w-10 rounded-full bg-ink/40" />
        <div className="font-display text-[16px] mb-2">详细报告</div>

        <Section title="本科路径 · 事件回放">
          {game.history.length === 0 && <div className="text-[11px] text-ink/60">还没有记录。</div>}
          <ul className="space-y-1">
            {game.history.slice().reverse().map((h, i) => (
              <li key={i} className="text-[11px] flex gap-2">
                <span className="text-ink/60 shrink-0 w-16">{h.semester}</span>
                <span className="truncate">{h.title} → {h.choice}</span>
              </li>
            ))}
          </ul>
        </Section>

        <Section title="全部属性（含隐藏 + 专业专属）">
          <div className="grid grid-cols-2 gap-x-3 gap-y-1.5">
            {STAT_META.map((s) => {
              const v = Math.max(0, Math.min(100, Math.round(game.stats[s.key] ?? 0)));
              return (
                <div key={s.key} className="min-w-0">
                  <div className="flex items-baseline justify-between gap-1">
                    <span className="text-[11px] text-ink/80 whitespace-nowrap">
                      {s.label}{s.hidden ? "·隐" : ""}
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
          {major.majorStats?.length > 0 && (
            <div className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1.5">
              {major.majorStats.map((s: any) => {
                const v = Math.round(game.majorStats[s.key] ?? s.initialValue ?? 0);
                return (
                  <div key={s.key} className="min-w-0">
                    <div className="flex items-baseline justify-between gap-1">
                      <span className="text-[11px] text-ink/80 whitespace-nowrap">{s.name}</span>
                      <span className="font-display text-[11px] tabular-nums">{v}</span>
                    </div>
                    <div className="bar-track !h-1.5 mt-0.5">
                      <div className="bar-fill" style={{ width: `${Math.min(100, v)}%`, background: "var(--tan)" }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Section>

        <Section title="所有成就">
          <div className="flex flex-wrap gap-1.5">
            {game.achievements.length === 0 && (
              <span className="text-[11px] text-ink/60">尚未解锁。</span>
            )}
            {game.achievements.map((id) => (
              <span key={id} className="achievement-medal">★ {achMap[id]?.name ?? id}</span>
            ))}
          </div>
        </Section>

        <Section title="解锁的路线">
          <div className="flex flex-wrap gap-1">
            {game.routes.length === 0
              ? <span className="text-[11px] text-ink/60">无</span>
              : game.routes.map((r) => (
                <span key={r} className="pixel-chip !text-[11px] bg-cream">{r}</span>
              ))
            }
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
