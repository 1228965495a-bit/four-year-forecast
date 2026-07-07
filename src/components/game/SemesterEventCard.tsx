import type { GameEvent } from "@/data/events";
import { PixelCard } from "./PixelCard";
import { PixelButton } from "./PixelButton";

export interface SemesterEventCardProps {
  event: GameEvent;
  disabled?: boolean;
  onPick: (event: GameEvent) => void;
}

const CATEGORY_TONE = {
  学业: "sky",
  社交: "cherry",
  休闲: "sunny",
  实习: "sage",
  健康: "tan",
  特殊: "cherry",
} as const;

export function SemesterEventCard({ event, disabled, onPick }: SemesterEventCardProps) {
  return (
    <PixelCard tone={CATEGORY_TONE[event.category]} className="flex h-full flex-col">
      <div className="flex items-start gap-3">
        <div className="pixel-border-sm bg-cream flex h-11 w-11 items-center justify-center text-2xl">
          {event.emoji}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <h4 className="font-display text-base leading-none">{event.title}</h4>
            <span className="pixel-chip !text-[10px]">{event.category}</span>
          </div>
          <p className="mt-1.5 text-xs text-ink/80">{event.description}</p>
        </div>
      </div>
      <div className="mt-3 flex-1 rounded border-2 border-dashed border-ink/40 bg-cream/70 p-2 text-[11px]">
        {event.gainLabel}
      </div>
      <div className="mt-3 flex items-center justify-between gap-2">
        <span className="text-[11px] text-ink/70">{event.costLabel ?? "消耗 4 周"}</span>
        <PixelButton size="sm" variant="primary" disabled={disabled} onClick={() => onPick(event)}>
          去做 →
        </PixelButton>
      </div>
    </PixelCard>
  );
}
