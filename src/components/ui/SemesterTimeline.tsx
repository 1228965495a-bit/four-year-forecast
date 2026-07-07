import { cn } from "@/lib/utils";

const YEARS = [1, 2, 3, 4] as const;
const SEMS = [1, 2] as const;

const LABELS = ["大一上", "大一下", "大二上", "大二下", "大三上", "大三下", "大四上", "大四下"];

export interface SemesterTimelineProps {
  year: 1 | 2 | 3 | 4;
  semester: 1 | 2;
  className?: string;
}

/** 横向 8 节点学期条：完成=sage / 当前=cherry / 未来=cream */
export function SemesterTimeline({ year, semester, className }: SemesterTimelineProps) {
  const currentIdx = (year - 1) * 2 + (semester - 1);
  return (
    <div className={cn("flex items-end gap-0.5 w-full", className)}>
      {YEARS.flatMap((y) =>
        SEMS.map((s, si) => {
          const idx = (y - 1) * 2 + (s - 1);
          const state = idx < currentIdx ? "done" : idx === currentIdx ? "active" : "future";
          const showSep = !(y === 4 && s === 2);
          return (
            <div key={idx} className="flex items-end flex-1 gap-0.5">
              <div className={cn("timeline-node flex-1", state === "active" && "timeline-active")}>
                <span
                  className={cn(
                    "timeline-dot",
                    state === "done" && "timeline-done-dot",
                    state === "active" && "timeline-active-dot",
                  )}
                />
                <span className="whitespace-nowrap">{LABELS[idx]}</span>
              </div>
              {showSep && si < 1 && <span className="timeline-line !min-w-[4px] mb-3.5" />}
              {showSep && si === 1 && (
                <span className="timeline-line !min-w-[8px] mb-3.5 opacity-60" />
              )}
            </div>
          );
        }),
      )}
    </div>
  );
}
