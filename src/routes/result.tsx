import { useEffect, useMemo, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { PhoneFrame } from "@/components/game/PhoneFrame";
import { gameStore, useGameState, currentSemesterLabel } from "@/lib/gameStore";
import { totalSemesters } from "@/data/script/semesterMeta";
import { STAT_META, HUD_STATS } from "@/lib/statsMeta";
import { majorById } from "@/data/script/majorCatalog";
import { PixelPanel9 } from "@/components/pixel/PixelPanel9";
import { deriveResultTags } from "@/lib/resultTags";
import {
  ResultCard,
  ResultBanner,
  ResultRibbon,
  TagBadgeGrid,
  StatBarList,
  FuturePinnedNote,
  ResultActionRow,
  SectionLabel,
} from "@/components/result/ResultShell";

export const Route = createFileRoute("/result")({
  head: () => ({
    meta: [
      { title: "本科幸存报告 · 结局达成" },
      { name: "description", content: "看看你四年本科副本走出了什么结局。" },
    ],
  }),
  component: ResultPage,
});

function ResultPage() {
  const game = useGameState();
  const navigate = useNavigate();
  const major = game.majorId ? majorById[game.majorId] : null;
  const [detailOpen, setDetailOpen] = useState(false);
  const [ending, setEnding] = useState<any | null>(null);
  const [achMap, setAchMap] = useState<Record<string, any>>({});

  useEffect(() => {
    if (!major) navigate({ to: "/major" });
  }, [major, navigate]);

  useEffect(() => {
    if (!major) return;
    let alive = true;
    (async () => {
      const [{ pickEnding }, { achievementsByMajorId }] = await Promise.all([
        import("@/lib/scriptEngine"),
        import("@/data/script/gameData"),
      ]);
      if (!alive) return;
      setEnding(pickEnding(game));
      const map: Record<string, any> = {};
      for (const a of achievementsByMajorId[major.id] ?? []) map[a.id] = a;
      setAchMap(map);
    })();
    return () => { alive = false; };
  }, [game, major]);

  const tags   = useMemo(() => deriveResultTags(game, "final"), [game]);

  if (!major) return null;

  const title    = ending?.title ?? `${major.name}·顺利毕业`;
  const summary  = ending?.summary ?? "你把本科四年跑完了，说不上惊艳，也没有翻车。";
  const advice   = ending?.advice ?? "别把学历当护身符，接下来才是正片。";
  const shareText = ending?.shareText ?? major.shareTexts?.[0] ?? summary;
  const total = totalSemesters();

  const backHome = () => { gameStore.reset(); navigate({ to: "/" }); };
  const retry    = () => { gameStore.reset(); navigate({ to: "/major" }); };
  const share    = () => {
    const text = `《这专业我先替你读了四年》\n专业：${major.name}\n结局：${title}\n${shareText}`;
    if (navigator.share) navigator.share({ title: "本科幸存报告", text }).catch(() => {});
    else { navigator.clipboard?.writeText(text); alert("已复制分享文案。"); }
  };

  // 关键选择时间线：取 history 的每学年第一条（不足则回退用序号）
  const timeline = useMemo(() => buildTimeline(game.history), [game.history]);
  const achToShow = game.achievements.slice(0, 3);

  const topBar = (
    <div className="border-b-[3px] border-ink bg-ink text-cream px-3 py-3 min-h-[58px] flex items-center gap-2">
      <button
        onClick={() => navigate({ to: "/" })}
        className="text-[12px] px-2 py-1 border-2 border-cream leading-none"
      >⌂</button>
      <div className="min-w-0 flex-1">
        <div className="font-display text-[14px] leading-none truncate">{currentSemesterLabel(game)}</div>
        <div className="text-[11px] text-cream/70 leading-none mt-1 truncate">
          {major.name} · {game.school}
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0 text-right">
        <div className="leading-tight">
          <div className="font-display text-[11px] text-cream/70">结局达成</div>
          <div className="font-display text-[12px] tabular-nums">{total}/{total}</div>
        </div>
        <span className="text-[11px] px-2.5 py-1 border-2 border-cream bg-cherry text-cream leading-none">活</span>
      </div>
    </div>
  );

  return (
    <PhoneFrame topBar={topBar}>
      <div className="flex-1 min-h-0 overflow-y-auto">
        <div className="p-3 pb-6 space-y-3">
          <ResultCard>
            <ResultBanner tag="结局达成!" title={title} tier="S" emoji="🎓" />

            <ResultRibbon>{summary}</ResultRibbon>

            <TagBadgeGrid tags={tags} title="你的本科学籍鉴定" />

            <section className="px-3 pt-3 grid grid-cols-1 gap-3">
              {/* 综合评价 */}
              <div>
                <SectionLabel accent="sunny">🌱 综合评价</SectionLabel>
                <div className="mt-2 flex items-start gap-2">
                  <div className="shrink-0 border-[3px] border-ink w-14 h-14 flex items-center justify-center text-[28px]"
                       style={{ background: "var(--cream)", boxShadow: "2px 2px 0 0 var(--ink)" }}>
                    🧑‍🎓
                  </div>
                  <p className="text-[12px] leading-[1.55] text-ink flex-1 min-w-0">
                    {advice}
                  </p>
                </div>
                <div className="mt-2.5">
                  <StatBarList stats={HUD_STATS} values={game.stats} columns={2} />
                </div>
              </div>

              {/* 关键选择 & 成就 */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <SectionLabel>🪧 关键选择</SectionLabel>
                  <ul className="mt-2 space-y-1.5">
                    {timeline.map((t, i) => (
                      <li key={i} className="flex items-start gap-1.5 text-[11px] leading-snug">
                        <span
                          className="shrink-0 inline-flex items-center justify-center w-5 h-5 border-2 border-ink font-display text-[11px] text-ink"
                          style={{ background: t.pick === "A" ? "var(--cherry)" : "var(--sky)", boxShadow: "1px 1px 0 0 var(--ink)" }}
                        >{t.pick}</span>
                        <div className="min-w-0">
                          <div className="font-display text-[10.5px] text-ink/70">{t.year}</div>
                          <div className="truncate">{t.text}</div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <SectionLabel accent="sunny">🏆 获得成就</SectionLabel>
                  <ul className="mt-2 space-y-1.5">
                    {achToShow.length === 0 && (
                      <li className="text-[11px] text-ink/60">暂无解锁</li>
                    )}
                    {achToShow.map((id) => {
                      const a = achMap[id];
                      return (
                        <li key={id} className="flex items-start gap-1.5 text-[11px] leading-snug">
                          <span className="shrink-0 text-[14px] leading-none">🏅</span>
                          <div className="min-w-0">
                            <div className="font-display text-[11.5px]">{a?.name ?? id}</div>
                            {a?.description && (
                              <div className="text-ink/60 text-[10.5px] truncate">{a.description}</div>
                            )}
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </div>
            </section>

            <FuturePinnedNote>
              {advice}
              {"\n"}
              {shareText}
            </FuturePinnedNote>

            <div className="px-3 py-2 flex items-center justify-center">
              <PixelPanel9 variant="diagnosis" padding="px-3 py-1.5" className="inline-block">
                <button
                  onClick={() => setDetailOpen(true)}
                  className="text-[11px] font-display tracking-wider text-ink/80"
                >
                  查看详细报告 →
                </button>
              </PixelPanel9>
            </div>
          </ResultCard>

          <ResultActionRow
            onHome={backHome}
            onRetry={retry}
            onShare={share}
            shareLabel="分享结局"
          />
        </div>
      </div>

      {detailOpen && <DetailSheet onClose={() => setDetailOpen(false)} achMap={achMap} />}
    </PhoneFrame>
  );
}

/* ---------------- helpers ---------------- */

function buildTimeline(history: { semester: string; title: string; choice: string }[]) {
  const YEARS = ["大一", "大二", "大三", "大四"] as const;
  const out: { year: string; pick: "A" | "B"; text: string }[] = [];
  for (const y of YEARS) {
    // history 是新在前，找该学年的第一条（也就是原顺序里最早的）——取最后出现
    const hit = [...history].reverse().find((h) => h.semester?.startsWith(y));
    if (hit) {
      out.push({
        year: y,
        pick: (hit.choice?.match(/^[AaBb]/)?.[0].toUpperCase() as "A" | "B") ?? (out.length % 2 === 0 ? "A" : "B"),
        text: hit.choice.replace(/^[AaBb][.、]?\s*/, "").slice(0, 14) || hit.title.slice(0, 14),
      });
    } else {
      out.push({ year: y, pick: "A", text: "—" });
    }
  }
  return out;
}

/* ---------------- 详细报告抽屉（保留旧内容） ---------------- */

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
