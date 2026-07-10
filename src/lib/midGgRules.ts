// 中途 GG / 提前退场 判定规则。
// 使用引擎内部 stats key（obsession/energy/filter/gpaWill/careerFantasy/escapeImpulse）
// 对应设计文档里的 majorInterest/mentalEnergy/filterThickness/gpaDesire/jobIllusion/escapeImpulse。

import type { EngineState } from "./scriptEngine";
import { SEMESTER_KEYS } from "@/data/script/semesterMeta";

export type MidGgReason =
  | "manual_quit"
  | "energy_depleted"
  | "escape_overflow"
  | "interest_dead"
  | "multi_collapse"
  | "filter_broken_escape"
  | "risk_overflow"
  | "revive_failed";

export interface MidGgCheckResult {
  type: "revive_offer" | "mid_gg";
  reason: MidGgReason;
  title: string;
  subtitle: string;
  conclusion: string;
  tags: string[];
}

const SEMESTER_PRESSURE: Record<string, number> = {
  y1s1: 0.6, y1s2: 0.7,
  y2s1: 0.85, y2s2: 1.0,
  y3s1: 1.2, y3s2: 1.35,
  y4s1: 1.5, y4s2: 1.4,
};

function pick(state: EngineState) {
  const s = state.stats ?? {};
  return {
    majorInterest: s.obsession ?? 0,
    mentalEnergy: s.energy ?? 0,
    filterThickness: s.filter ?? 0,
    gpaDesire: s.gpaWill ?? 0,
    jobIllusion: s.careerFantasy ?? 0,
    escapeImpulse: s.escapeImpulse ?? 0,
  };
}

function riskScore(v: ReturnType<typeof pick>) {
  return (
    (100 - v.mentalEnergy) * 0.35 +
    v.escapeImpulse * 0.35 +
    (100 - v.majorInterest) * 0.2 +
    (100 - v.filterThickness) * 0.1
  );
}

function pickReason(state: EngineState, manual: boolean): MidGgReason | null {
  const v = pick(state);
  const semKey = SEMESTER_KEYS[state.semesterIdx];
  const pressure = SEMESTER_PRESSURE[semKey] ?? 1;
  const adjusted = riskScore(v) * pressure;

  if (manual) return "manual_quit";

  // 大一上：默认禁用普通中途 GG
  if (semKey === "y1s1") return null;
  // 大四下：优先走终局
  if (semKey === "y4s2") return null;

  if (v.mentalEnergy <= 0) return "energy_depleted";
  if (v.escapeImpulse >= 95) return "escape_overflow";
  if (v.majorInterest <= 5 && v.escapeImpulse >= 75) return "interest_dead";
  if (v.mentalEnergy <= 15 && v.escapeImpulse >= 80 && v.majorInterest <= 25) return "multi_collapse";
  if (v.filterThickness <= 10 && v.escapeImpulse >= 85 && v.mentalEnergy <= 30) return "filter_broken_escape";

  // 大一下更保守
  if (semKey === "y1s2" && adjusted < 120) return null;

  if (adjusted >= 105) return "risk_overflow";
  return null;
}

function titleFor(state: EngineState, reason: MidGgReason): string {
  const v = pick(state);
  if (reason === "manual_quit") {
    if (v.escapeImpulse >= 75) return "跑路预备役";
    if (v.mentalEnergy <= 25) return "电量告急幸存者";
    if (v.majorInterest <= 30) return "专业冷却者";
    return "战略暂停选手";
  }
  if (v.mentalEnergy <= 0) return "电量归零幸存者";
  if (v.escapeImpulse >= 95) return "战略撤离选手";
  if (v.mentalEnergy <= 15 && v.escapeImpulse >= 80 && v.majorInterest <= 25) return "本科副本崩盘者";
  if (v.filterThickness <= 10 && v.escapeImpulse >= 85) return "滤镜粉碎撤离者";
  if (v.gpaDesire >= 85 && v.mentalEnergy <= 20) return "卷到断电的人";
  if (v.majorInterest <= 20) return "专业冷却者";
  return "战略暂停选手";
}

const COPY: Record<MidGgReason, { subtitle: string; conclusion: string }> = {
  manual_quit: {
    subtitle: "你按下了结束键，提前结束本科副本。",
    conclusion: "跑路不是失败，是战略转移。",
  },
  energy_depleted: {
    subtitle: "系统检测到：你的精神电量已跌破安全线。",
    conclusion: "活着，比全勤更重要。",
  },
  escape_overflow: {
    subtitle: "跑路冲动爆表，副本自动进入撤离模式。",
    conclusion: "退出一次，不代表人生失败。",
  },
  interest_dead: {
    subtitle: "你对这个专业已经完全不上头了。",
    conclusion: "继续读下去不是热爱，是惯性。",
  },
  multi_collapse: {
    subtitle: "精神电量、专业兴趣和跑路冲动同时告急。",
    conclusion: "这不是想不开，是副本适配度报警。",
  },
  filter_broken_escape: {
    subtitle: "滤镜碎得很彻底，跑路冲动也很诚实。",
    conclusion: "报志愿前多问一句，比之后后悔便宜。",
  },
  risk_overflow: {
    subtitle: "综合风险突破警戒线，系统建议先撤。",
    conclusion: "等你想好了，再回来开新档。",
  },
  revive_failed: {
    subtitle: "嘴硬已经无法覆盖事实。",
    conclusion: "这次先歇一下，再开新号。",
  },
};

function tagsFor(state: EngineState, reason: MidGgReason): string[] {
  const v = pick(state);
  const tags = new Set<string>();
  if (v.escapeImpulse >= 90) ["跑路冲动 MAX", "战略撤离", "保命第一"].forEach((t) => tags.add(t));
  if (v.mentalEnergy <= 10) ["电量归零", "熬夜副作用", "保命第一"].forEach((t) => tags.add(t));
  if (v.filterThickness <= 15) ["专业祛魅", "滤镜碎一地", "梦醒时分"].forEach((t) => tags.add(t));
  if (v.majorInterest <= 20) ["上头值归零", "专业冷却", "强扭不甜"].forEach((t) => tags.add(t));
  if (v.gpaDesire >= 85 && v.mentalEnergy <= 20) ["绩点过载", "卷到断电"].forEach((t) => tags.add(t));
  if (v.jobIllusion <= 20 && v.filterThickness <= 30) ["就业祛魅", "现实入侵"].forEach((t) => tags.add(t));
  if (reason === "manual_quit") tags.add("嘴硬型选手");
  if (tags.size === 0) tags.add("战略暂停选手");
  return Array.from(tags).slice(0, 4);
}

/**
 * 中途 GG 判定入口。
 * @param manual 玩家点了顶部结束按钮
 * @param usedRevive 本局是否已经用过一次嘴硬续命
 */
export function checkMidGG(
  state: EngineState,
  opts: { manual?: boolean; usedRevive?: boolean } = {},
): MidGgCheckResult | null {
  const reason = pickReason(state, !!opts.manual);
  if (!reason) return null;

  const isManual = reason === "manual_quit";
  const title = titleFor(state, reason);
  const copy = COPY[reason];
  const tags = tagsFor(state, reason);

  // 主动结束或已经续过命，直接结算；否则先给一次续命机会
  if (!isManual && !opts.usedRevive) {
    return { type: "revive_offer", reason, title, tags, subtitle: copy.subtitle, conclusion: copy.conclusion };
  }
  return { type: "mid_gg", reason, title, tags, subtitle: copy.subtitle, conclusion: copy.conclusion };
}

/** 嘴硬续命的属性调整 —— 直接 mutate 传入的 stats/hiddenStats。 */
export function applyRevivePenalties(state: EngineState) {
  const s = state.stats;
  const h = state.hiddenStats;
  s.escapeImpulse = Math.max(0, Math.min(100, (s.escapeImpulse ?? 0) - 25));
  s.energy = Math.max(0, Math.min(100, (s.energy ?? 0) - 8));
  s.filter = Math.max(0, Math.min(100, (s.filter ?? 0) - 10));
  h.stubbornness = Math.max(0, Math.min(100, (h.stubbornness ?? 0) + 35));
}
