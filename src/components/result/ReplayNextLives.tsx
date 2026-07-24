import { useState } from "react";
import { Route, Sparkles, X } from "lucide-react";
import type { ReplayRecommendation } from "@/lib/replaySystem";

export function ReplayNextLives({
  recommendations,
  onReplay,
}: {
  recommendations: [ReplayRecommendation, ReplayRecommendation];
  onReplay: (recommendation: ReplayRecommendation) => void;
}) {
  const [selected, setSelected] = useState<ReplayRecommendation | null>(null);
  return (
    <>
      <section className="v4-next-lives">
        <div className="v4-outcome-section-title"><span>下一次，你想怎么活？</span><small>选一个实验方向，不预约结局</small></div>
        <div className="mt-3 grid gap-3">
          {recommendations.map((recommendation) => (
            <button className={`v4-next-life-card is-${recommendation.targetType}`} key={`${recommendation.targetType}-${recommendation.routeId}`} onClick={() => setSelected(recommendation)}>
              <small>{recommendation.heading}</small>
              <strong>{recommendation.routeTitle}</strong>
              <p>{recommendation.explanation}</p>
              <span>{recommendation.actionLabel}<Route size={15} /></span>
            </button>
          ))}
        </div>
      </section>
      {selected && (
        <div className="v4-overlay !items-center">
          <div className="v4-modal v4-legacy-modal">
            <button className="v4-modal-close" aria-label="关闭" onClick={() => setSelected(null)}><X size={18} /></button>
            <div className="flex items-center gap-2 text-[11px] font-bold text-[var(--v4-coral)]"><Sparkles size={15} />带一条过来人经验</div>
            <h2>{selected.legacyExperience.title}</h2>
            <p>{selected.legacyExperience.description}</p>
            <div className="v4-legacy-target"><small>这一世想试试</small><strong>{selected.routeTitle}</strong></div>
            <button className="v4-primary w-full" onClick={() => onReplay(selected)}>{selected.actionLabel}<Route size={16} /></button>
            <small className="v4-legacy-note">只保留认知，不继承数值。你仍然可能把这一局活歪。</small>
          </div>
        </div>
      )}
    </>
  );
}
