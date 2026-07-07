import type { GameEvent, EventOption } from "@/data/events";

/**
 * 任务/事件卡：像素风游戏对话框。
 * 只展示剧情与选项，不在选择前剧透属性变化。
 */
export function EventCard({
  event,
  onPick,
}: {
  event: GameEvent;
  onPick: (opt: EventOption) => void;
}) {
  return (
    <div className="quest-card event-dialog">
      <div className="panel-title-strip">
        <span className="rank-badge rank-B" aria-hidden>
          {event.category.slice(0, 1)}
        </span>
        <span className="flex-1 truncate">{event.title}</span>
        <span className="text-[10px] opacity-70">{event.category}</span>
      </div>
      <div className="event-dialog-body">
        <p className="event-dialog-text">{event.description}</p>
        <div className="event-options">
          {event.options.map((opt, i) => (
            <OptionRow key={i} option={opt} onPick={onPick} index={i} />
          ))}
        </div>
      </div>
    </div>
  );
}

function OptionRow({ option, onPick, index }: { option: EventOption; onPick: (o: EventOption) => void; index: number }) {
  const letter = String.fromCharCode(65 + index); // A, B, C, D
  return (
    <button onClick={() => onPick(option)} className="option-btn group">
      <span className="option-letter" aria-hidden>{letter}</span>
      <span className="flex-1 min-w-0 text-left font-display text-[13px] leading-snug">
        {option.label}
      </span>
      <span className="option-arrow">▶</span>
    </button>
  );
}
