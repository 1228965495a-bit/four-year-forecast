import { useState } from "react";
import {
  ArrowLeft,
  BatteryMedium,
  ChevronDown,
  ChevronUp,
  Compass,
  GraduationCap,
  History,
  RotateCcw,
  Share2,
  Sparkles,
} from "lucide-react";
import { PhoneFrame } from "@/components/game/PhoneFrame";
import { MajorMark } from "@/components/game/CampusArt";
import type { GameState } from "@/lib/gameStore";
import type { ResultTag } from "@/lib/resultTags";
import { STAT_META } from "@/lib/statsMeta";

type OutcomeViewProps = {
  mode: "final" | "midway";
  game: GameState;
  major: any;
  semesterLabel: string;
  title: string;
  hook: string;
  summary: string;
  advice: string;
  tags: ResultTag[];
  achievements?: string[];
  progress: string;
  onHome: () => void;
  onRetry: () => void;
  onShare: () => void;
};

export function OutcomeView(props: OutcomeViewProps) {
  const {
    mode,
    game,
    major,
    semesterLabel,
    title,
    hook,
    summary,
    advice,
    tags,
    achievements = [],
    progress,
    onHome,
    onRetry,
    onShare,
  } = props;
  const [detailsOpen, setDetailsOpen] = useState(false);
  const isFinal = mode === "final";
  const isLawVerdict = isFinal && major.id === "law";

  const topBar = (
    <header className="v4-topbar">
      <button className="v4-icon-button" aria-label="返回首页" onClick={onHome}>
        <ArrowLeft size={19} />
      </button>
      <div className="min-w-0 flex-1">
        <div className="v4-title text-[18px]">{isFinal ? "本科结局" : "中途结算"}</div>
        <div className="mt-0.5 truncate text-[11px] text-[var(--v4-muted)]">
          {major.name} · {semesterLabel}
        </div>
      </div>
      <span className={`v4-outcome-status ${isFinal ? "is-final" : "is-midway"}`}>
        {isFinal ? "已通关" : "已离场"}
      </span>
    </header>
  );

  const bottomBar = (
    <footer className="v4-outcome-actions">
      <button className="v4-secondary" onClick={onRetry}>
        <RotateCcw size={17} />
        重开副本
      </button>
      <button className="v4-primary" onClick={onShare}>
        <Share2 size={17} />
        {isLawVerdict ? "晒出我的判决书" : "分享这个结局"}
      </button>
    </footer>
  );

  return (
    <PhoneFrame topBar={topBar} bottomBar={bottomBar}>
      <div className="v4-scroll">
        <article className="v4-outcome">
          <section className={`v4-outcome-poster ${isFinal ? "is-final" : "is-midway"}`}>
            <div className="v4-outcome-poster-head">
              <div className="flex items-center gap-2">
                <MajorMark id={major.id} size={42} />
                <div>
                  <div className="text-[10px] font-bold opacity-70">我的{major.name}副本</div>
                  <div className="text-[12px] font-bold">{progress}</div>
                </div>
              </div>
              <Sparkles size={22} aria-hidden />
            </div>
            <div className="v4-outcome-eyebrow">
              {isLawVerdict
                ? "经四年审理，判决你的法学人格为"
                : isFinal
                  ? "四年后，系统给我的称号是"
                  : "系统判定，我属于"}
            </div>
            <h1 className={title.length > 12 ? "is-long" : ""}>{title}</h1>
            <blockquote className={hook.length > 52 ? "is-long" : ""}>“{hook}”</blockquote>
            <div className="v4-outcome-stamp">
              {isLawVerdict ? "判决已生效 · 暂不支持上诉" : "这专业我先替你读了四年"}
            </div>
          </section>

          <button className="v4-primary v4-outcome-share" onClick={onShare}>
            <Share2 size={18} />
            {isLawVerdict ? "分享这份法学人格判决书" : "这句值得发出去"}
          </button>

          <p className="v4-outcome-summary">{summary}</p>

          <section className="v4-outcome-section">
            <div className="v4-outcome-section-title">
              <span>{isLawVerdict ? "四年罪证" : "你的副本关键词"}</span>
              <small>{isLawVerdict ? "均已成为呈堂证供" : "不是测评，是案底"}</small>
            </div>
            <div className="v4-outcome-tags">
              {tags.map((tag) => (
                <span key={tag.id}>{tag.label}</span>
              ))}
            </div>
          </section>

          <section className="v4-outcome-section">
            <div className="v4-outcome-section-title">
              <span>离场时的三项状态</span>
              <small>{semesterLabel}</small>
            </div>
            <div className="v4-outcome-core-stats">
              {coreStats(game).map(({ label, value, color, Icon }) => (
                <div className="v4-outcome-stat" key={label}>
                  <div>
                    <Icon size={14} />
                    <span>{label}</span>
                  </div>
                  <strong>{value}</strong>
                  <i>
                    <b style={{ width: `${value}%`, background: color }} />
                  </i>
                </div>
              ))}
            </div>
          </section>

          {achievements.length > 0 && (
            <section className="v4-outcome-section">
              <div className="v4-outcome-section-title">
                <span>顺手带走的称号</span>
                <small>{achievements.length} 枚</small>
              </div>
              <div className="v4-outcome-achievements">
                {achievements.slice(0, 6).map((name) => (
                  <span key={name}>{name}</span>
                ))}
              </div>
            </section>
          )}

          <section className="v4-outcome-afterword">
            <div className="v4-outcome-section-title">
              <span>
                {isLawVerdict ? "判决附带意见" : isFinal ? "毕业后系统弹窗" : "退场后系统弹窗"}
              </span>
            </div>
            <p>{advice}</p>
          </section>

          <button
            className="v4-outcome-details-toggle"
            aria-expanded={detailsOpen}
            onClick={() => setDetailsOpen((open) => !open)}
          >
            <span>
              <History size={16} />
              查看完整副本记录
            </span>
            {detailsOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>

          {detailsOpen && <OutcomeDetails game={game} />}
        </article>
      </div>
    </PhoneFrame>
  );
}

function coreStats(game: GameState) {
  const clamp = (value: number) => Math.max(0, Math.min(100, Math.round(value)));
  return [
    {
      label: "精力",
      value: clamp(game.stats.energy ?? 0),
      color: "var(--v4-blue)",
      Icon: BatteryMedium,
    },
    {
      label: "专业认同",
      value: clamp(((game.stats.obsession ?? 0) + (100 - (game.stats.escapeImpulse ?? 0))) / 2),
      color: "var(--v4-coral)",
      Icon: Compass,
    },
    {
      label: "未来筹码",
      value: clamp(((game.stats.gpaWill ?? 0) + (game.stats.careerFantasy ?? 0)) / 2),
      color: "var(--v4-mint)",
      Icon: GraduationCap,
    },
  ];
}

function OutcomeDetails({ game }: { game: GameState }) {
  return (
    <div className="v4-outcome-details">
      <section>
        <h3>走过的路</h3>
        {game.history.length === 0 ? (
          <p>这份档案还没有事件记录。</p>
        ) : (
          <ol>
            {game.history
              .slice()
              .reverse()
              .map((item, index) => (
                <li key={`${item.semester}-${item.title}-${index}`}>
                  <small>{item.semester}</small>
                  <strong>{item.title}</strong>
                  <span>{item.choice}</span>
                </li>
              ))}
          </ol>
        )}
      </section>
      <section>
        <h3>全部数值</h3>
        <div className="v4-outcome-all-stats">
          {STAT_META.map((stat) => {
            const value = Math.max(
              0,
              Math.min(100, Math.round(game.stats[stat.key] ?? game.hiddenStats?.[stat.key] ?? 0)),
            );
            return (
              <div key={stat.key}>
                <span>{stat.label}</span>
                <strong>{value}</strong>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
