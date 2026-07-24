import { ArrowLeft, BookOpenCheck, Compass, History, RotateCcw, Route, Share2, Sparkles } from "lucide-react";
import { PhoneFrame } from "@/components/game/PhoneFrame";
import { MajorMark } from "@/components/game/CampusArt";
import type { GameState } from "@/lib/gameStore";
import { CS_PERSONAS, CS_ROUTE_DEFINITIONS, type CSArchive, type deriveCSResult } from "@/lib/computerScienceRoguelite";
import type { ReplayRecommendation } from "@/lib/replaySystem";
import { ReplayNextLives } from "./ReplayNextLives";

type CSResult = ReturnType<typeof deriveCSResult>;

export function ComputerScienceOutcomeView({
  game, result, archive, eventTotal, recommendations, onHome, onRetry, onReplay, onShare,
}: {
  game: GameState;
  result: CSResult;
  archive: CSArchive;
  eventTotal: number;
  recommendations: [ReplayRecommendation, ReplayRecommendation];
  onHome: () => void;
  onRetry: () => void;
  onReplay: (recommendation: ReplayRecommendation) => void;
  onShare: () => void;
}) {
  const hiddenSeen = game.seenEvents.filter((id) => id.includes("hidden")).length;
  return (
    <PhoneFrame
      topBar={<header className="v4-topbar">
        <button className="v4-icon-button" aria-label="返回首页" onClick={onHome}><ArrowLeft size={19} /></button>
        <div className="min-w-0 flex-1"><div className="v4-title text-[18px]">计算机本科档案</div><div className="mt-0.5 text-[11px] text-[var(--v4-muted)]">第 {archive.runs} 周目 · 已完成</div></div>
        <span className="v4-outcome-status is-final">已归档</span>
      </header>}
      bottomBar={<footer className="v4-outcome-actions">
        <button className="v4-secondary" onClick={onRetry}><RotateCcw size={17} />换一种构筑</button>
        <button className="v4-primary" onClick={onShare}><Share2 size={17} />发给项目队友</button>
      </footer>}
    >
      <div className="v4-scroll">
        <article className="v4-law-result">
          <section className="v4-law-poster">
            <div className="v4-outcome-poster-head">
              <div className="flex items-center gap-2"><MajorMark id="computer_science" size={42} /><div><div className="text-[10px] font-bold opacity-70">你的主路线结局</div><div className="text-[12px] font-bold">{result.route.title}</div></div></div>
              <Sparkles size={22} aria-hidden />
            </div>
            <div className="v4-law-route-ending"><Route size={14} /><span>{result.route.ending}</span></div>
            <div className="v4-outcome-eyebrow">你在计算机系活成了</div>
            <h1 className={result.persona.title.length > 11 ? "is-long" : ""}>{result.persona.title}</h1>
            <blockquote>“{result.persona.verdict}”</blockquote>
            <div className="v4-law-persona-tags">{result.persona.tags.map((tag) => <span key={tag}>{tag}</span>)}</div>
            <div className="v4-outcome-stamp">四年一局 · 技术构筑随机生成</div>
          </section>

          <button className="v4-primary v4-outcome-share" onClick={onShare}><Share2 size={18} />生成我的技术人格档案</button>
          <p className="v4-law-route-summary">{result.route.summary}</p>

          <section className="v4-outcome-section">
            <div className="v4-outcome-section-title"><span>本局有梗属性</span><small>由实际选择计算</small></div>
            <div className="v4-law-viral-stats">
              {result.viralStats.map((stat) => <div key={stat.label}><span>{stat.label}</span><strong>{stat.value}%</strong><i><b style={{ width: `${stat.value}%` }} /></i></div>)}
            </div>
          </section>

          <section className="v4-outcome-section">
            <div className="v4-outcome-section-title"><span>我的本科四年</span><small>不是随机拼接</small></div>
            <ol className="v4-law-story">{result.story.map((item) => <li key={item.year}><strong>{item.year}</strong><p>{item.text}</p></li>)}</ol>
          </section>

          <section className="v4-outcome-section">
            <div className="v4-outcome-section-title"><span>系统判断依据</span><small>至少三条真实证据</small></div>
            <ul className="v4-law-reasons">{result.reasons.map((reason) => <li key={reason}>{reason}</li>)}</ul>
          </section>

          {result.experiences.length > 0 && <section className="v4-outcome-section">
            <div className="v4-outcome-section-title"><span>本局特殊经历</span><small>{result.experiences.length} 枚</small></div>
            <div className="v4-outcome-achievements">{result.experiences.map((item) => <span key={item.id}>{item.title}</span>)}</div>
          </section>}

          <section className="v4-outcome-section">
            <div className="v4-outcome-section-title"><span>计算机图鉴进度</span><small>一局看不完</small></div>
            <div className="v4-law-progress-grid">
              <Progress label="路线结局" value={archive.routes.length} total={7} />
              <Progress label="人格称号" value={archive.personas.length} total={6} />
              <Progress label="特殊经历" value={archive.experiences.length} total={16} />
              <Progress label="隐藏事件" value={hiddenSeen} total={5} />
              <Progress label="事件图鉴" value={game.discoveries.computer_science?.length ?? game.seenEvents.length} total={eventTotal || 47} />
            </div>
            <div className="v4-law-codex-list">
              <UnlockRow label="已解锁路线" items={archive.routes.map((id) => CS_ROUTE_DEFINITIONS.find((route) => route.id === id)?.title).filter(Boolean) as string[]} />
              <UnlockRow label="已解锁人格" items={archive.personas.map((id) => CS_PERSONAS.find((persona) => persona.id === id)?.title).filter(Boolean) as string[]} />
              <UnlockRow label="特殊经历记录" items={[...new Set(archive.experiences)].slice(-6)} />
            </div>
          </section>

          <ReplayNextLives recommendations={recommendations} onReplay={onReplay} />

          <section className="v4-law-fit">
            <div className="v4-outcome-section-title"><span>严肃适配分析</span><small>不拿段子替代建议</small></div>
            <div><BookOpenCheck size={16} /><p>{result.fit.strengths.join(" ")}</p></div>
            <div><History size={16} /><p><strong>需要警惕：</strong>{result.fit.risks}</p></div>
            <div><Route size={16} /><p><strong>可能方向：</strong>{result.fit.direction}</p></div>
          </section>
        </article>
      </div>
    </PhoneFrame>
  );
}

function Progress({ label, value, total }: { label: string; value: number; total: number }) {
  return <div><span>{label}</span><strong>{Math.min(value, total)}/{total}</strong></div>;
}

function UnlockRow({ label, items }: { label: string; items: string[] }) {
  return <div><strong>{label}</strong><p>{items.length ? items.join(" · ") : "尚未解锁"}</p></div>;
}
