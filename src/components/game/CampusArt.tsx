import type { LucideIcon } from "lucide-react";
import {
  BookOpen, Brain, BriefcaseBusiness, Calculator, ChartNoAxesCombined,
  Code2, GraduationCap, Languages, Newspaper, RadioTower, Scale,
  SmilePlus, Stethoscope, Wrench, Zap,
} from "lucide-react";

const MAJOR_ICON: Record<string, LucideIcon> = {
  law: Scale,
  computer_science: Code2,
  artificial_intelligence: Brain,
  clinical_medicine: Stethoscope,
  finance: ChartNoAxesCombined,
  accounting: Calculator,
  journalism_communication: Newspaper,
  electrical_engineering: Zap,
  english: Languages,
  teacher_education: GraduationCap,
  chinese_language_literature: BookOpen,
  stomatology: SmilePlus,
  psychology: Brain,
  electronic_information: RadioTower,
  mechanical_engineering: Wrench,
  business_administration: BriefcaseBusiness,
};

const MAJOR_COLOR: Record<string, string> = {
  law: "var(--v4-coral)", computer_science: "var(--v4-blue)",
  artificial_intelligence: "var(--v4-violet)", clinical_medicine: "var(--v4-red)",
  finance: "var(--v4-yellow)", accounting: "var(--v4-mint)",
  journalism_communication: "var(--v4-orange)", electrical_engineering: "var(--v4-yellow)",
  english: "var(--v4-blue)", teacher_education: "var(--v4-mint)",
  chinese_language_literature: "var(--v4-coral)", stomatology: "var(--v4-blue)",
  psychology: "var(--v4-violet)", electronic_information: "var(--v4-mint)",
  mechanical_engineering: "var(--v4-orange)", business_administration: "var(--v4-yellow)",
};

export function MajorMark({ id, size = 44 }: { id: string; size?: number }) {
  const Icon = MAJOR_ICON[id] ?? BookOpen;
  return (
    <span className="v4-major-mark" style={{ width: size, height: size, background: MAJOR_COLOR[id] ?? "var(--v4-blue)" }} aria-hidden>
      <Icon size={Math.round(size * 0.48)} strokeWidth={2.2} />
    </span>
  );
}

export function HomeCampusArt() {
  return (
    <div className="v4-campus-art" aria-hidden>
      <div className="v4-sun" />
      <div className="v4-cloud v4-cloud-one" />
      <div className="v4-cloud v4-cloud-two" />
      <div className="v4-campus-building">
        <div className="v4-campus-clock">10:08</div>
        <div className="v4-campus-door" />
        <div className="v4-campus-windows" />
      </div>
      <div className="v4-tree v4-tree-left" />
      <div className="v4-tree v4-tree-right" />
      <StudentAvatar className="v4-home-student" />
      <div className="v4-paper-plane" />
    </div>
  );
}

export function EventCampusArt({ majorId, mood = "thinking" }: { majorId: string; mood?: string }) {
  return (
    <div className="v4-event-art" aria-hidden>
      <div className="v4-event-board">
        <MajorMark id={majorId} size={38} />
        <span>{mood === "crisis" ? "今天先别崩" : "本学期进行中"}</span>
      </div>
      <div className="v4-event-desk"><span className="v4-desk-book" /><span className="v4-desk-cup" /></div>
      <StudentAvatar className="v4-event-student" mood={mood} />
      <span className="v4-thought-dot v4-thought-one" />
      <span className="v4-thought-dot v4-thought-two" />
      <span className="v4-thought-bubble">?</span>
    </div>
  );
}

function StudentAvatar({ className = "", mood = "normal" }: { className?: string; mood?: string }) {
  return (
    <div className={`v4-student ${className}`}>
      <div className="v4-student-hair" />
      <div className="v4-student-head">
        <span className="v4-eye v4-eye-left" /><span className="v4-eye v4-eye-right" />
        <span className={`v4-mouth v4-mouth-${mood}`} />
      </div>
      <div className="v4-student-body"><span className="v4-backpack" /></div>
      <span className="v4-leg v4-leg-left" /><span className="v4-leg v4-leg-right" />
    </div>
  );
}
