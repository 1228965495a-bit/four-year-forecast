// 根据当前 GameState 生成 6 张学籍鉴定标签
import type { GameState } from "./gameStore";

export interface ResultTag {
  id: string;
  label: string;
  icon: string;           // emoji 兜底
  tone: "cherry" | "sage" | "sky" | "sunny" | "grape" | "tan";
}

const TONE_CYCLE: ResultTag["tone"][] = ["cherry", "sage", "sunny", "grape", "sky", "tan"];

type Rule = {
  id: string;
  label: string;
  icon: string;
  test: (g: GameState) => boolean;
  scope: "midway" | "final" | "both";
};

// 阈值池：命中即候选，最终按顺序取前 6
const RULES: Rule[] = [
  { id: "tough",     label: "嘴硬型选手",  icon: "📣", scope: "both",   test: (g) => (g.hiddenStats?.stubbornness ?? 0) >= 55 || (g.stats?.obsession ?? 0) >= 60 },
  { id: "filter",    label: "摸鱼先行者",  icon: "🐟", scope: "both",   test: (g) => (g.stats?.filter ?? 0) >= 55 },
  { id: "escape",    label: "逃跑冲动 MAX", icon: "🏃", scope: "both",   test: (g) => (g.stats?.escapeImpulse ?? 0) >= 60 },
  { id: "battery",   label: "电量尚可",    icon: "🔋", scope: "both",   test: (g) => (g.stats?.energy ?? 0) >= 65 },
  { id: "hallu",     label: "高薪幻觉中",  icon: "💰", scope: "both",   test: (g) => (g.stats?.careerFantasy ?? 0) >= 55 },
  { id: "gpa",       label: "绩点求生者",  icon: "📚", scope: "both",   test: (g) => (g.stats?.gpaWill ?? 0) >= 65 },
  { id: "ddl",       label: "DDL 幸存者",  icon: "⏰", scope: "final",  test: (g) => (g.stats?.gpaWill ?? 0) >= 55 && (g.stats?.energy ?? 0) < 60 },
  { id: "nightowl",  label: "熬夜战神",    icon: "🌙", scope: "final",  test: (g) => (g.stats?.energy ?? 0) < 55 },
  { id: "debug",     label: "debug 人",   icon: "🐞", scope: "final",  test: (g) => g.majorId === "computer_science" || g.majorId === "artificial_intelligence" },
  { id: "juan",      label: "还能再卷一下", icon: "💪", scope: "final",  test: (g) => (g.stats?.obsession ?? 0) >= 70 },
  { id: "law_lat",   label: "法考再说",    icon: "⚖️", scope: "midway", test: (g) => g.majorId === "law" },
  { id: "safety",    label: "保命第一",    icon: "🛡️", scope: "midway", test: (g) => (g.ggRisk ?? 0) >= 40 },
];

const FALLBACK: Omit<ResultTag, "tone">[] = [
  { id: "fb1", label: "普通大学生",   icon: "🎓" },
  { id: "fb2", label: "选择困难症",   icon: "❓" },
  { id: "fb3", label: "路人甲",       icon: "🚶" },
];

export function deriveResultTags(game: GameState, scope: "midway" | "final"): ResultTag[] {
  const picked: Omit<ResultTag, "tone">[] = [];
  const seen = new Set<string>();
  for (const r of RULES) {
    if (r.scope !== "both" && r.scope !== scope) continue;
    if (r.test(game)) {
      picked.push({ id: r.id, label: r.label, icon: r.icon });
      seen.add(r.id);
    }
    if (picked.length >= 6) break;
  }
  for (const fb of FALLBACK) {
    if (picked.length >= 6) break;
    if (seen.has(fb.id)) continue;
    picked.push(fb);
  }
  return picked.slice(0, 6).map((t, i) => ({ ...t, tone: TONE_CYCLE[i % TONE_CYCLE.length] }));
}
