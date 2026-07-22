import { ChevronRight } from "lucide-react";

type Choice = {
  id?: string;
  text: string;
  feedback?: string;
  resultText?: string;
  effects?: any;
  statChanges?: Record<string, number>;
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
  main: "主线事件", major_random: "校园日常", hidden: "隐藏事件",
  route: "方向选择", resource: "本周取舍", roguelite_random: "随机插曲", transfer: "转专业机会", gg_check: "状态预警", settlement: "学期结算",
};

export function EventCard({ event, onPick }: { event: EventLike; onPick: (opt: Choice) => void }) {
  const options = event.options ?? event.choices ?? [];
  const body = event.body ?? event.description ?? "";
  const keepsConsequencesHidden = event.id.startsWith("law_");

  return (
    <article className="v4-event-card">
      <div className="v4-event-eyebrow">{TYPE_LABEL[event.type ?? "main"] ?? "本科日常"}</div>
      <h2 className="v4-title">{event.title}</h2>
      <p className="v4-event-body">{body}</p>
      <div className="v4-options">
        {options.map((option, index) => (
          <button className="v4-choice" key={option.id ?? index} onClick={() => onPick(option)}>
            <span className="v4-choice-index">{String.fromCharCode(65 + index)}</span>
            <span className="v4-choice-text">{option.text}</span>
            <span className="flex items-center gap-2">
              {!keepsConsequencesHidden && <ImpactHints option={option} />}
              <ChevronRight size={17} color="var(--v4-muted)" />
            </span>
          </button>
        ))}
      </div>
    </article>
  );
}

function ImpactHints({ option }: { option: Choice }) {
  const changes = option.effects?.stats ?? option.statChanges ?? {};
  const hints: string[] = [];
  if (changes.energy) hints.push("var(--v4-blue)");
  if (changes.obsession || changes.filter || changes.escapeImpulse) hints.push("var(--v4-coral)");
  if (changes.gpaWill || changes.careerFantasy) hints.push("var(--v4-mint)");
  return <span className="v4-choice-hints" aria-hidden>{hints.slice(0, 3).map((color, i) => <span className="v4-impact" style={{ background: color }} key={`${color}-${i}`} />)}</span>;
}
