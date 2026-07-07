import type { GameEvent, EventOption, EventEffect } from "@/data/events";
import { STAT_META } from "@/lib/gameStore";
import { cn } from "@/lib/utils";

/**
 * 任务/事件卡：像素风游戏任务卡片。
 * 标题条（羊皮纸）+ 描述 + 每个选项显示消耗/收益预览。
 */
export function EventCard({
  event,
  onPick,
}: {
  event: GameEvent;
  onPick: (opt: EventOption) => void;
}) {
  return (
    <div className="quest-card">
      <div className="panel-title-strip">
        <span className="rank-badge rank-B" aria-hidden>
          {event.category.slice(0, 1)}
        </span>
        <span className="flex-1 truncate">{event.title}</span>
        <span className="text-[10px] opacity-70">{event.category}</span>
      </div>
      <div className="p-3">
        <p className="text-[12.5px] leading-snug text-ink/85 mb-2.5">{event.description}</p>
        <div className="space-y-1.5">
          {event.options.map((opt, i) => (
            <OptionRow key={i} option={opt} onPick={onPick} />
          ))}
        </div>
      </div>
    </div>
  );
}

function OptionRow({ option, onPick }: { option: EventOption; onPick: (o: EventOption) => void }) {
  const { costs, gains } = splitEffects(option.effects);
  return (
    <button onClick={() => onPick(option)} className="option-btn group">
      <div className="flex-1 min-w-0">
        <div className="font-display text-[13px] leading-snug">{option.label}</div>
        <div className="mt-1 flex flex-wrap gap-1">
          {gains.map((e, i) => (
            <EffectChip key={`g${i}`} effect={e} kind="gain" />
          ))}
          {costs.map((e, i) => (
            <EffectChip key={`c${i}`} effect={e} kind="cost" />
          ))}
        </div>
      </div>
      <span className="option-arrow">▶</span>
    </button>
  );
}

function splitEffects(effects: EventEffect[]) {
  const costs: EventEffect[] = [];
  const gains: EventEffect[] = [];
  for (const e of effects) (e.delta >= 0 ? gains : costs).push(e);
  return { costs, gains };
}

export function EffectChip({
  effect,
  kind = "gain",
}: {
  effect: EventEffect;
  kind?: "gain" | "cost";
}) {
  const meta = STAT_META.find((m) => m.key === effect.key)!;
  const pos = effect.delta >= 0;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 border-2 border-ink px-1 py-[1px] text-[10px] leading-none bg-cream",
        kind === "cost" && "bg-[#FBD9CE]",
      )}
      style={{ boxShadow: "1px 1px 0 0 var(--ink)" }}
    >
      <span className="inline-block h-1.5 w-1.5" style={{ background: meta.color }} />
      <span>{meta.short}</span>
      <span
        className={cn("font-display tabular-nums", pos ? "text-[#2E7A3A]" : "text-[#C1443C]")}
      >
        {pos ? "+" : ""}
        {effect.delta}
      </span>
    </span>
  );
}
