import { ArrowLeft, BookOpenCheck, Compass, History, RotateCcw, Route, Share2, Sparkles } from "lucide-react";
import { PhoneFrame } from "@/components/game/PhoneFrame";
import { MajorMark } from "@/components/game/CampusArt";
import type { GameState } from "@/lib/gameStore";
import { LAW_PERSONAS, LAW_ROUTE_DEFINITIONS, type LawArchive, type deriveLawResult } from "@/lib/lawRoguelite";

type LawResult = ReturnType<typeof deriveLawResult>;

export function LawOutcomeView({
  game, result, archive, eventTotal, onHome, onRetry, onShare,
}: {
  game: GameState;
  result: LawResult;
  archive: LawArchive;
  eventTotal: number;
  onHome: () => void;
  onRetry: () => void;
  onShare: () => void;
}) {
  const hiddenSeen = game.seenEvents.filter((id) => id.includes("hidden") || id.includes("branch")).length;
  const topBar = (
    <header className="v4-topbar">
      <button className="v4-icon-button" aria-label="返回首页" onClick={onHome}><ArrowLeft size={19} /></button>
      <div className="min-w-0 flex-1"><div className="v4-title text-[18px]">法学本科档案</div><div className="mt-0.5 text-[11px] text-[var(--v4-muted)]">第 {archive.runs} 周目 · 已完成</div></div>
      <span className="v4-outcome-status is-final">已归档</span>
    </header>
  );
  const bottomBar = (
    <footer className="v4-outcome-actions">
      <button className="v4-secondary" onClick={onRetry}><RotateCcw size={17} />换一种活法</button>
      <button className="v4-primary" onClick={onShare}><Share2 size={17} />拉朋友入学</button>
    </footer>
  );

  return (
    <PhoneFrame topBar={topBar} bottomBar={bottomBar}>
      <div className="v4-scroll">
        <article className="v4-law-result">
          <section className="v4-law-poster">
            <div className="v4-outcome-poster-head">
              <div className="flex items-center gap-2"><MajorMark id="law" size={42} /><div><div className="text-[10px] font-bold opacity-70">你的主路线结局</div><div className="text-[12px] font-bold">{result.route.title}</div></div></div>
              <Sparkles size={22} aria-hidden />
            </div>
            <div className="v4-law-route-ending"><Route size={14} /><span>{result.route.ending}</span></div>
            <div className="v4-outcome-eyebrow">你在法学院活成了</div>
            <h1 className={result.persona.title.length > 11 ? "is-long" : ""}>{result.persona.title}</h1>
            <blockquote>“{result.persona.verdict}”</blockquote>
            <div className="v4-outcome-stamp">四年一局 · 本科人生随机生成</div>
          </section>

          <button className="v4-primary v4-outcome-share" onClick={onShare}><Share2 size={18} />生成我的本科档案</button>
          <p className="v4-law-route-summary">{result.route.summary}</p>

          <section className="v4-outcome-section">
            <div className="v4-outcome-section-title"><span>本局专业人格属性</span><small>由真实选择计算</small></div>
            <div className="v4-law-viral-stats">
              {result.viralStats.map((stat) => <div key={stat.label}><span>{stat.label}</span><strong>{stat.value}%</strong><i><b style={{ width: `${stat.value}%` }} /></i></div>)}
            </div>
          </section>

          <section className="v4-outcome-section">
            <div className="v4-outcome-section-title"><span>我的本科四年</span><small>这条路由你亲手走出</small></div>
            <ol className="v4-law-story">
              {result.story.map((item) => <li key={item.year}><strong>{item.year}</strong><p>{item.text}</p></li>)}
            </ol>
          </section>

          <section className="v4-outcome-section">
            <div className="v4-outcome-section-title"><span>系统判断依据</span><small>不是随机判词</small></div>
            <ul className="v4-law-reasons">{result.reasons.map((reason) => <li key={reason}>{reason}</li>)}</ul>
          </section>

          {result.experiences.length > 0 && <section className="v4-outcome-section">
            <div className="v4-outcome-section-title"><span>本局特殊经历</span><small>{result.experiences.length} 枚</small></div>
            <div className="v4-outcome-achievements">{result.experiences.map((item) => <span key={item.id}>{item.title}</span>)}</div>
          </section>}

          <section className="v4-outcome-section">
            <div className="v4-outcome-section-title"><span>法学图鉴进度</span><small>同一局看不完</small></div>
            <div className="v4-law-progress-grid">
              <Progress label="路线结局" value={archive.routes.length} total={7} />
              <Progress label="人格称号" value={archive.personas.length} total={6} />
              <Progress label="特殊经历" value={archive.experiences.length} total={18} />
              <Progress label="隐藏事件" value={hiddenSeen} total={8} />
              <Progress label="事件图鉴" value={game.discoveries.law?.length ?? game.seenEvents.length} total={eventTotal || 56} />
            </div>
            <div className="v4-law-codex-list">
              <UnlockRow label="已解锁路线" items={archive.routes.map((id) => LAW_ROUTE_DEFINITIONS.find((route) => route.id === id)?.title).filter(Boolean) as string[]} />
              <UnlockRow label="已解锁人格" items={archive.personas.map((id) => LAW_PERSONAS.find((persona) => persona.id === id)?.title).filter(Boolean) as string[]} />
              <UnlockRow label="特殊经历卷宗" items={[...new Set(archive.experiences.map(readableExperience))].slice(-6)} />
            </div>
          </section>

          <section className="v4-law-locked"><div><Compass size={17} /><strong>你曾接近另一条人生</strong></div><p>{result.lockedHint}</p></section>
          <section className="v4-law-challenge"><div className="v4-outcome-section-title"><span>下一周目挑战</span></div><p>{result.replayChallenge}</p><button className="v4-secondary w-full" onClick={onRetry}><RotateCcw size={16} />带着过来人记忆重新入学</button></section>

          <section className="v4-law-fit">
            <div className="v4-outcome-section-title"><span>严肃适配分析</span><small>放在梗后面，但不是废话</small></div>
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

function readableExperience(item: string) {
  const legacyLabels: Record<string, string> = {
    dorm_counsel: "宿舍常驻证据保全员",
    mock_court: "模拟法庭前夜救场王",
    intern_reply: "第一份实习申请真的有回复",
    escape_window: "认真查过转专业窗口",
    exam_box: "法考资料先本人入住宿舍",
    low_battery: "低电量完成本科强制执行",
  };
  if (legacyLabels[item]) return legacyLabels[item];
  if (item.startsWith("special_")) return "一项早期归档经历";
  return item;
}
