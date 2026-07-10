// 事件卡：接脚本引擎的新 event/choice 结构。
import { PixelPanel9 } from "@/components/pixel/PixelPanel9";
import { PixelButton3 } from "@/components/pixel/PixelSkin";

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
  description?: string;
  body?: string;
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
  const body = event.body ?? event.description ?? "";
  return (
    <PixelPanel9 variant="event" padding="px-3 pt-2 pb-2.5">
      <div className="grid grid-cols-[auto_minmax(0,1fr)] items-start gap-2 mb-1.5">
        <span className="rank-badge rank-B" aria-hidden>
          {badge.slice(0, 1) || "?"}
        </span>
        <span className="min-w-0 font-display text-[13px] leading-snug line-clamp-2 break-words">
          {event.title}
        </span>
      </div>
      <p className="event-dialog-text mb-2 text-[12px] leading-snug">{body}</p>
      <div className="event-options space-y-1.5">
        {opts.map((opt, i) => (
          <OptionRow key={opt.id ?? i} option={opt} onPick={onPick} index={i} />
        ))}
      </div>
    </PixelPanel9>
  );
}

function OptionRow({ option, onPick, index }: { option: Choice; onPick: (o: Choice) => void; index: number }) {
  const letter = String.fromCharCode(65 + index);
  return (
    <PixelButton3
      variant="option"
      full
      onClick={() => onPick(option)}
      style={{ minHeight: 38, padding: "6px 12px", fontSize: 12.5 }}
    >
      <span className="flex-1 min-w-0 flex items-center gap-2">
        <span className="font-display text-ink/70 text-[12px] shrink-0">{letter}.</span>
        <span className="flex-1 min-w-0 text-left leading-snug whitespace-normal">{option.text}</span>
        <span className="text-ink/60 shrink-0 text-[11px]">▶</span>
      </span>
    </PixelButton3>
  );
}
