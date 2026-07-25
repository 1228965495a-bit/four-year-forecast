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
  decisionPrompt?: string;
  type?: string;
  tags?: string[];
  options?: Choice[];
  choices?: Choice[];
  legacyExperienceHint?: string | null;
};

const TYPE_LABEL: Record<string, string> = {
  main: "这学期发生的事",
  major_random: "突然发生",
  hidden: "以前的选择又回来了",
  route: "接下来往哪走",
  resource: "时间不够，只能选一边",
  roguelite_random: "突然发生",
  transfer: "转专业窗口",
  gg_check: "你快撑不住了",
  settlement: "学期结束",
};

export function EventCard({ event, onPick }: { event: EventLike; onPick: (opt: Choice) => void }) {
  const options = event.options ?? event.choices ?? [];
  const body = event.body ?? event.description ?? "";
  const decisionPrompt = event.decisionPrompt ?? getDecisionPrompt(event.type);
  const keepsConsequencesHidden = ["law_", "computer_science_", "clinical_"].some((prefix) => event.id.startsWith(prefix));

  return (
    <article className="v4-event-card">
      <div className="v4-event-eyebrow">{TYPE_LABEL[event.type ?? "main"] ?? "本科日常"}</div>
      <h2 className="v4-title">{event.title}</h2>
      <p className="v4-event-body">{body}</p>
      <div className="v4-decision-prompt">
        <strong>你现在要决定</strong>
        <span>{decisionPrompt}</span>
      </div>
      {event.legacyExperienceHint && (
        <div className="v4-legacy-hint">
          <strong>上一局留下的经验</strong>
          <span>{event.legacyExperienceHint}</span>
        </div>
      )}
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

function getDecisionPrompt(type?: string) {
  switch (type) {
    case "resource":
      return "时间不够，你优先保住哪一件事？";
    case "route":
      return "接下来，你准备把主要时间花在哪件事上？";
    case "transfer":
      return "你要申请转专业，还是继续留在现在的专业？";
    case "gg_check":
      return "你要继续硬撑，还是先停下来保住状态？";
    case "hidden":
      return "同样的情况又出现了，这次你准备怎么处理？";
    case "major_random":
    case "roguelite_random":
      return "事情已经发生，你准备怎么处理？";
    default:
      return "面对这件事，你准备怎么做？";
  }
}

function ImpactHints({ option }: { option: Choice }) {
  const changes = option.effects?.stats ?? option.statChanges ?? {};
  const hints: string[] = [];
  if (changes.energy) hints.push("var(--v4-blue)");
  if (changes.obsession || changes.filter || changes.escapeImpulse) hints.push("var(--v4-coral)");
  if (changes.gpaWill || changes.careerFantasy) hints.push("var(--v4-mint)");
  return <span className="v4-choice-hints" aria-hidden>{hints.slice(0, 3).map((color, i) => <span className="v4-impact" style={{ background: color }} key={`${color}-${i}`} />)}</span>;
}
