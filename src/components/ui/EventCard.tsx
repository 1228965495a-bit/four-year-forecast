// 事件卡：接脚本引擎的新 event/choice 结构。
type Choice = {
  id?: string;
  text: string;
  feedback?: string;
  resultText?: string;
  effects?: any;
};

type EventLike = {
  id: string;
  title: string;
  description: string;
  type?: string;
  tags?: string[];
  options?: Choice[];
  choices?: Choice[];
};

const TYPE_LABEL: Record<string, string> = {
  main: "主线",
  major_random: "日常",
  hidden: "隐藏",
  route: "路线",
  transfer: "转专业",
  gg_check: "危机判定",
  settlement: "结算",
};

export function EventCard({
  event,
  onPick,
}: {
  event: EventLike;
  onPick: (opt: Choice) => void;
}) {
  const opts = event.options ?? event.choices ?? [];
  const badge = TYPE_LABEL[event.type ?? "main"] ?? event.type ?? "";
  return (
    <div className="quest-card event-dialog">
      <div className="panel-title-strip">
        <span className="rank-badge rank-B" aria-hidden>
          {badge.slice(0, 1) || "?"}
        </span>
        <span className="flex-1 truncate">{event.title}</span>
        <span className="text-[10px] opacity-70">{badge}</span>
      </div>
      <div className="event-dialog-body">
        <p className="event-dialog-text">{event.description}</p>
        <div className="event-options">
          {opts.map((opt, i) => (
            <OptionRow key={opt.id ?? i} option={opt} onPick={onPick} index={i} />
          ))}
        </div>
      </div>
    </div>
  );
}

function OptionRow({ option, onPick, index }: { option: Choice; onPick: (o: Choice) => void; index: number }) {
  const letter = String.fromCharCode(65 + index);
  return (
    <button onClick={() => onPick(option)} className="option-btn group">
      <span className="option-letter" aria-hidden>{letter}</span>
      <span className="flex-1 min-w-0 text-left font-display text-[14px] leading-snug">
        {option.text}
      </span>
      <span className="option-arrow">▶</span>
    </button>
  );
}
