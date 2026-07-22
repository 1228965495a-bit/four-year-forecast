import { LAW_ROGUELITE_EVENTS } from "@/data/script/byMajor/law.roguelite.events";

export type LawRouteKey = "academic" | "firm" | "civil" | "advocacy" | "transfer" | "survival" | "detour";

export type LawArchive = {
  runs: number;
  routes: string[];
  personas: string[];
  experiences: string[];
};

type MutableLawState = {
  stats: Record<string, number>;
  majorStats: Record<string, number>;
  hiddenStats: Record<string, number>;
  flags: string[];
  routes: string[];
  seenEvents: string[];
  initialTrait?: string | null;
  routeScores?: Record<string, number>;
  specialExperiences?: string[];
  pendingTrend?: string | null;
};

type LawGameLike = MutableLawState & {
  history: Array<{ semester: string; title: string; choice: string; feedback: string }>;
  achievements: string[];
  semesterIdx: number;
};

export const EMPTY_LAW_ARCHIVE: LawArchive = { runs: 0, routes: [], personas: [], experiences: [] };

export const LAW_MEMORIES = [
  { id: "exam_notice", title: "提前知道考核方式", description: "开局获得 6 点专业积累。" },
  { id: "saved_chance", title: "保留一次关键机会", description: "开局获得 8 点机会。" },
  { id: "route_hint", title: "更早看见路线提示", description: "现实规划倾向小幅提高。" },
] as const;

export const LAW_TRAITS = [
  { id: "family_lawyer", title: "家里已经开始叫你大律师", description: "专业滤镜更厚，但免费咨询也来得更早。", stats: { filter: 7, opportunity: 4 }, hidden: { idealDrive: 6, responsibility: 4 } },
  { id: "adjusted", title: "你是被调剂进来的", description: "对法学没有执念，倒是很早就会留意出口。", stats: { filter: -10, opportunity: 2 }, hidden: { realityPlanning: 6, escapeAwareness: 1 } },
  { id: "argue", title: "你从小就喜欢和人讲道理", description: "表达欲先到教室，规则敏感度随后入场。", stats: { professionalAccumulation: 4 }, hidden: { expression: 8, ruleSensitivity: 5 } },
  { id: "prestige", title: "你只是觉得法学听起来体面", description: "开局滤镜拉满，现实会负责后续更新。", stats: { filter: 10, opportunity: -2 }, hidden: { idealDrive: 4, realityPlanning: -3 } },
  { id: "warning_posts", title: "你提前看过专业避雷帖", description: "幻想值不高，但知道什么时候该保存体力。", stats: { filter: -6, energy: 6 }, hidden: { ambiguityTolerance: 5, realityPlanning: 5 } },
  { id: "firm_relative", title: "你有一个正在律所工作的亲戚", description: "比别人早拿到入口，也比别人更早听说加班。", stats: { opportunity: 10, filter: -4 }, hidden: { realityPlanning: 6, stressTolerance: 3 } },
] as const;

export const LAW_ROUTE_DEFINITIONS = [
  { id: "academic", title: "保研学术线", ending: "把脚注写成上岸路线", summary: "你把课程、论文和老师推荐串成了一条学术路径。别人追热点，你在追注释来源。" },
  { id: "firm", title: "律所实习就业线", ending: "从复印机管辖权开始执业", summary: "你见过律政剧删掉的检索、改稿和凌晨消息，仍决定先从真实法律工作里站稳。" },
  { id: "civil", title: "考公考编线", ending: "在职位表里实现稳定预期", summary: "你把专业积累换成岗位选择，把路线焦虑整理成报名条件，最终押注一条稳定路径。" },
  { id: "advocacy", title: "模拟法庭表达线", ending: "把被点名练成了发言席", summary: "你从课堂被告席一路走到模拟法庭，逐渐发现自己不只会找漏洞，也敢把论证说出口。" },
  { id: "transfer", title: "转专业隐藏线", ending: "依法解除专业关系", summary: "你不是在情绪最差时逃跑，而是查规则、攒筹码、等窗口，真正替自己推开了一扇门。" },
  { id: "survival", title: "混合生存线", ending: "在绩点和睡眠之间庭外和解", summary: "你没有包揽所有成果，但保住了毕业证、电量和继续生活的能力。" },
  { id: "detour", title: "非典型偏航线", ending: "把法学装成跨行业被动技能", summary: "你没有沿标准法律职业前进，却把证据、规则和表达带进了另一条路。" },
] as const;

export const LAW_PERSONAS = [
  { id: "evidence", title: "证据链强迫症患者", verdict: "你已经很久没有单纯听一个故事了，你只会下意识问：原始聊天记录呢？", score: (s: MutableLawState) => dim(s, "evidence") * 10 + dim(s, "ruleSensitivity") * 0.6 + (100 - dim(s, "ambiguityTolerance")) * 0.25 + proof(s, "evidence") * 60 },
  { id: "advocate", title: "野生法庭辩手", verdict: "别人只是发表意见，你已经默默准备好了正方一辩、反方质询和总结陈词。", score: (s: MutableLawState) => dim(s, "expression") * 0.8 + dim(s, "stressTolerance") * 0.35 + routeScore(s, "advocacy") * 3 + proof(s, "advocate") * 60 },
  { id: "rule_keeper", title: "法条秩序维护者", verdict: "你不一定记得法条原文，但听见‘大家都这样’时，已经会本能地追问依据。", score: (s: MutableLawState) => dim(s, "ruleSensitivity") * 0.8 + dim(s, "idealDrive") * 0.35 + Number(s.majorStats.legalCloseness ?? 0) * 0.2 + proof(s, "rule_keeper") * 60 },
  { id: "planner", title: "考公路线规划大师", verdict: "别人焦虑时刷短视频，你焦虑时会打开岗位表，并给未来建立三个备选方案。", score: (s: MutableLawState) => dim(s, "realityPlanning") * 0.9 + routeScore(s, "civil") * 3 + Number(s.stats.opportunity ?? 0) * 0.1 + proof(s, "planner") * 60 },
  { id: "escape", title: "三次想转专业仍毕业型", verdict: "你把每一扇逃生门都查过一遍，最后是否离开不重要，重要的是门把手上全是你的指纹。", score: (s: MutableLawState) => dim(s, "escape") * 10 + dim(s, "realityPlanning") * 0.5 + Number(s.stats.escapeImpulse ?? 0) * 0.3 + proof(s, "escape") * 60 },
  { id: "mediator", title: "人间纠纷调解器", verdict: "入学时你想主持正义，毕业时你只想让所有小组成员按时交材料并停止互相拉黑。", score: (s: MutableLawState) => dim(s, "responsibility") * 0.8 + dim(s, "idealDrive") * 0.3 + dim(s, "expression") * 0.2 + proof(s, "mediator") * 60 },
] as const;

const KEY_IMPACTS: Record<string, any> = {
  "law_y1s1_main_001:a": { opportunity: 2, persona: { idealDrive: 5, expression: 4, responsibility: 3 }, routes: { advocacy: 2 } },
  "law_y1s1_main_001:b": { professional: 4, persona: { evidence: 2, ruleSensitivity: 5, ambiguityTolerance: -5 }, experiences: ["家族纠纷第一次证据保全"] },
  "law_y1s1_main_001:c": { opportunity: -2, persona: { realityPlanning: 6, escape: 1 }, routes: { detour: 1 } },
  "law_y1s1_main_003:a": { professional: 5, persona: { expression: 6, idealDrive: 4, ruleSensitivity: 3 }, routes: { advocacy: 3 }, experiences: ["课堂被告席完成第一次答辩"] },
  "law_y1s2_main_004:a": { professional: 5, persona: { ruleSensitivity: 7, idealDrive: 5 }, routes: { academic: 2 } },
  "law_y1s2_main_004:b": { professional: 3, persona: { evidence: 1, responsibility: 3 }, routes: { academic: 1 } },
  "law_y1s2_main_004:c": { professional: -2, persona: { realityPlanning: 3, escape: 1 }, routes: { survival: 2 } },
  "law_y2s1_main_007:a": { professional: 7, persona: { ruleSensitivity: 8, ambiguityTolerance: -5 }, routes: { academic: 3 } },
  "law_y2s1_main_007:b": { professional: -3, persona: { stressTolerance: -5, ambiguityTolerance: 5 }, routes: { survival: 2 } },
  "law_y2s1_main_009:a": { professional: 5, persona: { realityPlanning: 6, stressTolerance: 3 }, routes: { academic: 3 } },
  "law_y2s1_main_009:b": { professional: -4, persona: { stressTolerance: 4 }, routes: { survival: 4 } },
  "law_y2s1_main_009:d": { opportunity: 3, persona: { realityPlanning: 6, escape: 1 }, routes: { detour: 4 } },
  "law_y2s2_transfer_011:a": { opportunity: -3, persona: { realityPlanning: 8, escape: 2 }, routes: { transfer: 5 }, experiences: ["找到教务系统隐藏逃生门"] },
  "law_y2s2_transfer_011:c": { opportunity: -4, persona: { realityPlanning: 9, escape: 2 }, routes: { transfer: 6 }, experiences: ["把目标专业做成对照表"] },
  "law_y3s1_main_014:a": { professional: 5, persona: { expression: 8, stressTolerance: 6 }, routes: { advocacy: 6 }, experiences: ["模拟法庭现场补完论证"] },
  "law_y3s1_main_014:c": { professional: 7, persona: { responsibility: 5, stressTolerance: 4 }, routes: { advocacy: 4, academic: 2 }, experiences: ["散庭后独自补齐全组材料"] },
  "law_y3s1_route_015:a": { opportunity: -3, professional: 4, persona: { realityPlanning: 6 }, routes: { firm: 6 } },
  "law_y3s1_route_015:d": { opportunity: 8, professional: 2, persona: { realityPlanning: 5 }, routes: { firm: 7 }, experiences: ["学长学姐递来第一份实习入口"] },
  "law_y3s2_route_016:a": { opportunity: -4, professional: 6, persona: { stressTolerance: 5, ruleSensitivity: 5 }, routes: { academic: 2 } },
  "law_y3s2_route_016:b": { opportunity: -3, professional: 5, persona: { realityPlanning: 7 }, routes: { academic: 8 } },
  "law_y3s2_route_016:c": { opportunity: -2, persona: { realityPlanning: 9 }, routes: { civil: 10 } },
  "law_y3s2_route_016:d": { opportunity: -5, professional: 6, persona: { realityPlanning: 6, stressTolerance: 4 }, routes: { firm: 10 } },
  "law_y3s2_main_018:b": { professional: -2, persona: { stressTolerance: 5 }, routes: { survival: 7 } },
  "law_y3s2_main_018:c": { opportunity: 2, persona: { realityPlanning: 8, escape: 1 }, routes: { detour: 10 } },
  "law_y3s2_main_018:d": { professional: -5, persona: { stressTolerance: 2 }, routes: { survival: 8 } },
};

export const LAW_CORE_POOLS: Record<number, string[]> = {
  0: ["law_y1s1_main_001", "law_y1s1_main_002", "law_y1s1_main_003"],
  1: ["law_y1s2_main_004", "law_y1s2_main_006"],
  2: ["law_y2s1_main_007", "law_y2s1_main_008", "law_y2s1_main_009"],
  3: ["law_y2s2_main_010", "law_y2s2_main_012"],
  4: ["law_y3s1_main_013", "law_y3s1_main_014", "law_y3s1_route_015"],
  5: ["law_y3s2_route_016", "law_y3s2_route_017", "law_y3s2_main_018"],
  6: ["law_y4s1_main_019", "law_y4s1_route_020"],
  7: ["law_y4s2_final_023"],
};

export function createLawRunState(state: MutableLawState, archive: LawArchive) {
  const trait = LAW_TRAITS[Math.max(0, archive.runs - 1) % LAW_TRAITS.length];
  state.initialTrait = trait.id;
  state.routeScores = { academic: 0, firm: 0, civil: 0, advocacy: 0, transfer: 0, survival: 1, detour: 0 };
  state.specialExperiences = [];
  state.pendingTrend = null;
  state.stats.professionalAccumulation = 24;
  state.stats.opportunity = 18;
  for (const [key, value] of Object.entries(trait.stats)) state.stats[key] = clamp(Number(state.stats[key] ?? 0) + value);
  for (const [key, value] of Object.entries(trait.hidden)) state.hiddenStats[key] = Number(state.hiddenStats[key] ?? 50) + value;
  for (const key of ["idealDrive", "realityPlanning", "stressTolerance", "ambiguityTolerance", "responsibility", "expression", "ruleSensitivity"]) {
    state.hiddenStats[key] ??= 50;
  }
  state.hiddenStats.evidence ??= 0;
  state.hiddenStats.escape ??= 0;
  state.hiddenStats.lawRunSeed = archive.runs + 1;
  state.hiddenStats.lawChoiceCount = 0;
  state.hiddenStats.transferChance = 35;
}

export function applyLawChoiceLayer(state: MutableLawState, event: any, choice: any) {
  const effects = choice.effects ?? {};
  const key = `${event.id}:${choice.id ?? choice.choiceId}`;
  const impact = KEY_IMPACTS[key] ?? {};
  const legalDelta = Number(effects.majorStats?.legalCloseness ?? 0);
  const gpaDelta = Number(effects.stats?.gpaWill ?? 0);
  const obsessionDelta = Number(effects.stats?.obsession ?? 0);
  const careerDelta = Number(effects.stats?.careerFantasy ?? 0);
  const generatedProfessional = Math.round(legalDelta * 0.25 + Math.max(0, gpaDelta) * 0.1 + Math.max(0, obsessionDelta) * 0.05);
  const generatedOpportunity = Math.round(Math.max(0, careerDelta) * 0.25 + (effects.routeAdd?.length ?? 0) * 2);

  state.stats.professionalAccumulation = clamp(Number(state.stats.professionalAccumulation ?? 24) + generatedProfessional + Number(impact.professional ?? 0));
  state.stats.opportunity = clamp(Number(state.stats.opportunity ?? 18) + generatedOpportunity + Number(impact.opportunity ?? 0));
  state.routeScores ??= {};
  state.specialExperiences ??= [];
  for (const [route, value] of Object.entries(impact.routes ?? {})) add(state.routeScores, route, Number(value));
  for (const routeId of effects.routeAdd ?? []) addRouteFromLegacy(state.routeScores, routeId);
  for (const [dimension, value] of Object.entries(impact.persona ?? {})) add(state.hiddenStats, dimension, Number(value));
  for (const [resource, value] of Object.entries(effects.lawResources ?? {})) {
    const adjusted = resource === "professionalAccumulation" ? Math.round(Number(value) * 0.45) : Number(value);
    state.stats[resource] = clamp(Number(state.stats[resource] ?? 0) + adjusted);
  }
  for (const [dimension, value] of Object.entries(effects.lawPersona ?? {})) add(state.hiddenStats, dimension, Number(value));
  for (const [route, value] of Object.entries(effects.lawRoutes ?? {})) add(state.routeScores, route, Number(value));
  for (const personaId of effects.personaEvidence ?? []) add(state.hiddenStats, `personaEvidence_${personaId}`, 1);

  if (Number(effects.hiddenStats?.lawEvidence ?? 0) > 0) add(state.hiddenStats, "evidence", Number(effects.hiddenStats.lawEvidence));
  if (Number(effects.hiddenStats?.lawTheory ?? 0) > 0) add(state.hiddenStats, "ruleSensitivity", Number(effects.hiddenStats.lawTheory) * 3);
  if (Number(effects.hiddenStats?.lawEscape ?? 0) > 0) add(state.hiddenStats, "escape", Number(effects.hiddenStats.lawEscape));
  if (Number(effects.stats?.energy ?? 0) <= -8) add(state.hiddenStats, "stressTolerance", 2);
  if (Number(effects.stats?.energy ?? 0) >= 3) add(state.routeScores, "survival", 2);
  if (/学长|学姐|老师|推荐|实习/.test(choice.text ?? "")) state.stats.opportunity = clamp(state.stats.opportunity + 3);
  if (typeof effects.transfer?.successRateDelta === "number") add(state.hiddenStats, "transferChance", effects.transfer.successRateDelta);
  for (const experience of impact.experiences ?? []) pushUnique(state.specialExperiences, experience);

  state.hiddenStats.lawChoiceCount = Number(state.hiddenStats.lawChoiceCount ?? 0) + 1;
  state.pendingTrend = state.hiddenStats.lawChoiceCount % 3 === 0 ? deriveTrend(state) : null;
}

export function pickLawCoreEvent(state: MutableLawState & { semesterIdx: number }) {
  const pool = LAW_CORE_POOLS[state.semesterIdx] ?? [];
  const unseen = pool.filter((id) => !state.seenEvents.includes(id));
  if (!unseen.length) return null;
  const seed = Number(state.hiddenStats.lawRunSeed ?? 1) + state.semesterIdx * 7 + state.seenEvents.length;
  return unseen[seed % unseen.length];
}

export function pickLawResourceEvent(state: MutableLawState & { semesterIdx: number }) {
  const semester = ["y1s1", "y1s2", "y2s1", "y2s2", "y3s1", "y3s2", "y4s1"][state.semesterIdx];
  if (!semester) return null;
  const semesterResourceIds = LAW_ROGUELITE_EVENTS.filter((event) => event.semester === semester).map((event) => event.id);
  const shownCount = semesterResourceIds.filter((id) => state.seenEvents.includes(id)).length;
  const targetCount = 1 + ((Number(state.hiddenStats.lawRunSeed ?? 1) + state.semesterIdx) % 2);
  if (shownCount >= targetCount) return null;
  const pool = LAW_ROGUELITE_EVENTS.filter((event) => event.semester === semester && !state.seenEvents.includes(event.id));
  if (!pool.length) return null;
  const seed = Number(state.hiddenStats.lawRunSeed ?? 1) * 19 + state.semesterIdx * 13 + shownCount * 7;
  return pool[seed % pool.length].id;
}

export function shouldFollowLawEvent(state: MutableLawState & { semesterIdx: number; semesterEventCount?: number }, next: any) {
  if (!next) return false;
  if (next.type === "transfer" && next.id.startsWith("law_transfer_apply")) return true;
  if (next.id.startsWith("law_transfer_transition")) return true;
  if (next.id === "law_y2s2_main_012" && routeScore(state, "transfer") >= 5) return true;
  if ((state.semesterEventCount ?? 0) >= 2) return false;
  return next.type === "hidden" || next.type === "transfer";
}

export function shouldDrawLawOptional(state: MutableLawState & { semesterIdx: number; semesterEventCount?: number }) {
  return (state.semesterEventCount ?? 0) < 4 && state.semesterIdx >= 0 && state.semesterIdx <= 6;
}

export function deriveLawResult(game: LawGameLike) {
  const route = deriveRoute(game);
  const persona = [...LAW_PERSONAS].sort((a, b) => b.score(game) - a.score(game))[0];
  const experiences = deriveExperiences(game);
  const reasons = deriveReasons(game, route.id, persona.id);
  const viralStats = [
    { label: "对模糊答案的容忍度", value: clamp(dim(game, "ambiguityTolerance")) },
    { label: "小组作业接锅概率", value: clamp(dim(game, "responsibility")) },
    { label: "DDL 前临时开悟能力", value: clamp((100 - Number(game.stats.energy ?? 0)) * 0.45 + dim(game, "stressTolerance") * 0.55) },
  ];
  return {
    route,
    persona,
    experiences,
    reasons,
    viralStats,
    story: buildStory(game, route, persona),
    lockedHint: deriveLockedHint(game, route.id),
    replayChallenge: deriveReplayChallenge(game, route.id),
    fit: deriveFit(game, route.id),
  };
}

export function archiveLawResult(archive: LawArchive, result: ReturnType<typeof deriveLawResult>): LawArchive {
  return {
    runs: archive.runs,
    routes: unique([...archive.routes, result.route.id]),
    personas: unique([...archive.personas, result.persona.id]),
    experiences: unique([...archive.experiences, ...result.experiences.map((item) => item.title)]),
  };
}

export function getLawTrait(id: string | null | undefined) {
  return LAW_TRAITS.find((trait) => trait.id === id) ?? null;
}

export function resolveLawEvent(state: MutableLawState, event: any) {
  if (event?.id !== "law_transfer_apply_003") return event;
  const score = Number(state.hiddenStats.transferChance ?? 35)
    + Number(state.stats.professionalAccumulation ?? 0) * 0.22
    + Number(state.stats.opportunity ?? 0) * 0.12
    + Number(state.stats.gpaWill ?? 0) * 0.08;
  const source = (event.choices ?? event.options ?? []).find((choice: any) => choice.id === (score >= 62 ? "success" : "fail"));
  if (!source) return event;
  const resolved = {
    ...source,
    text: "打开转专业结果通知",
    feedback: score >= 62
      ? "页面上写着申请通过。你不是靠一时冲动逃走，而是用绩点、材料和两学期的准备换来第二条时间线。"
      : "页面上写着未通过。规则、名额和准备程度共同给出了结果，但你至少真正推过一次那扇门。",
  };
  return { ...event, options: [resolved], choices: [resolved] };
}

function deriveRoute(state: MutableLawState) {
  if (state.flags.includes("flag_transfer_success")) return LAW_ROUTE_DEFINITIONS.find((route) => route.id === "transfer")!;
  if (state.flags.includes("flag_transfer_failed")) {
    const transfer = LAW_ROUTE_DEFINITIONS.find((route) => route.id === "transfer")!;
    return {
      ...transfer,
      title: "转专业未遂线",
      ending: "申请驳回，法学继续履行",
      summary: "你认真查过规则、交过材料，也真的推过那扇门。门没有开，于是你带着一次失败申请回到法学院，把剩下的路重新走完。",
    };
  }
  const ranked = LAW_ROUTE_DEFINITIONS.map((route) => ({ route, score: routeScore(state, route.id) })).sort((a, b) => b.score - a.score);
  return ranked[0].score > 0 ? ranked[0].route : LAW_ROUTE_DEFINITIONS.find((route) => route.id === "survival")!;
}

function deriveExperiences(game: LawGameLike) {
  const items = [
    ...(game.specialExperiences ?? []).map((title) => ({ id: `special_${simpleHash(title)}`, title })),
  ];
  const candidates = [
    [game.seenEvents.includes("law_y3s1_main_014"), "mock_court", "模拟法庭前夜救场王"],
    [game.seenEvents.includes("law_hidden_004"), "intern_reply", "第一份实习申请真的有回复"],
    [game.flags.includes("flag_transfer_policy_seen"), "escape_window", "认真查过转专业窗口"],
    [game.routes.includes("route_law_exam"), "exam_box", "法考资料先本人入住宿舍"],
    [dim(game, "evidence") >= 2, "dorm_counsel", "宿舍常驻证据保全员"],
    [Number(game.stats.energy ?? 0) <= 35, "low_battery", "低电量完成本科强制执行"],
  ] as const;
  for (const [hit, id, title] of candidates) if (hit && !items.some((item) => item.id === id)) items.push({ id, title });
  return items.slice(0, 6);
}

function deriveReasons(game: LawGameLike, routeId: string, personaId: string) {
  const reasons: string[] = [];
  const decisionTitles = new Set(LAW_ROGUELITE_EVENTS.map((event) => event.title));
  const tradeoffs = [...game.history].reverse().filter((item) => decisionTitles.has(item.title));
  const evidenceChoices = tradeoffs.length > 1 ? [tradeoffs[0], tradeoffs[tradeoffs.length - 1]] : tradeoffs;
  for (const item of evidenceChoices) reasons.push(`在“${item.title}”里，你选择了“${item.choice}”。系统把你保住和放弃的东西同时计入了人格结算。`);
  if (personaId === "evidence") reasons.push("面对争议时，你多次优先核对事实、时间线和原始材料。比如大一那次家庭咨询，你没有直接下结论。");
  if (personaId === "advocate") reasons.push("课堂点名和模拟法庭出现时，你选择把观点说完整，而不是让沉默替你答辩。");
  if (personaId === "rule_keeper") reasons.push("你的规则敏感度持续上升，遇到‘大家都这样’时仍会追问依据。");
  if (personaId === "planner") reasons.push("你把焦虑转成了路线表、报名条件和备选方案，现实规划值长期领先。");
  if (personaId === "escape") reasons.push("你不止一次留意转专业与跨行入口，并认真计算过离开的成本。");
  if (personaId === "mediator") reasons.push("面对团队任务和他人求助时，你多次选择承担、补位或把冲突重新组织起来。");
  const routeName = LAW_ROUTE_DEFINITIONS.find((route) => route.id === routeId)?.title;
  reasons.push(`大三之后，你对“${routeName}”投入的专业积累和机会最多，它成为本局主路线。`);
  reasons.push(`本局结束时，你保有 ${Math.round(game.stats.energy ?? 0)} 点精力、${Math.round(game.stats.professionalAccumulation ?? 0)} 点专业积累和 ${Math.round(game.stats.opportunity ?? 0)} 点机会。`);
  return reasons.slice(0, 4);
}

function buildStory(game: LawGameLike, route: { id: LawRouteKey; title: string; ending: string; summary: string }, persona: (typeof LAW_PERSONAS)[number]) {
  const trait = getLawTrait(game.initialTrait);
  const firstChoice = [...game.history].reverse()[0]?.choice ?? "先按自己的直觉走进法学院";
  const finalChapter = game.flags.includes("flag_transfer_failed")
    ? `转专业申请没有通过，你带着“${persona.title}”这套新习惯回到法学院。后半程不再是默认留下，而是你重新作出的选择。`
    : route.id === "transfer"
    ? `转专业结果把本科生活切成了两段。法学院留下的不是一张失败证明，而是“${persona.title}”这套会继续跟着你的思考方式。`
    : `你没有变成入学时想象的标准法律人，却带着“${persona.title}”这套生存方式离开法学院。`;
  return [
    { year: "大一", text: `${trait ? trait.title : "你带着一点法学滤镜入学"}。第一次真正做决定时，你选择了“${firstChoice}”。` },
    { year: "大二", text: `核心课开始收走滤镜，你的专业积累来到 ${Math.round(game.stats.professionalAccumulation ?? 0)}。一些早期选择开始回来找你。` },
    { year: "大三", text: `路线逐渐收窄，你把有限的机会主要押在“${route.title}”，也因此错过了另外几条人生。` },
    { year: "大四", text: finalChapter },
  ];
}

function deriveLockedHint(game: LawGameLike, routeId: string) {
  if (routeId !== "academic" && Number(game.stats.opportunity ?? 0) < 45) return "某位老师曾注意过你的课堂表现，但你没有继续联系。下一局可以更早保留一次老师推荐。";
  if (routeId !== "transfer" && dim(game, "escape") < 2) return "有些人直到大二下学期，才会认真推开转专业窗口。你这局离那扇门还差两次主动调查。";
  if (routeId !== "advocacy" && dim(game, "expression") < 65) return "模拟法庭还有一张空着的发言席。下一次，也许别把观点留在草稿里。";
  if (!game.seenEvents.includes("law_hidden_004")) return "一份实习回复曾经与你擦肩而过。它需要更高的专业积累，以及至少一次来自学长学姐的入口。";
  return "法学院里还有一条荒诞偏航线没有出现：有时，一次失败会带来比成功更奇怪的机会。";
}

function deriveReplayChallenge(game: LawGameLike, routeId: string) {
  if (dim(game, "responsibility") >= 68) return "上一局你太习惯替别人接锅。这次挑战一次都不主动补位。";
  if (routeId === "firm") return "上一局走了实习就业线。这次试试在大二前攒够一次老师推荐。";
  if (routeId === "academic") return "上一局靠高专业积累毕业。这次挑战低积累生存，看看会偏航到哪里。";
  if (routeId === "transfer" && game.flags.includes("flag_transfer_failed")) return "上一局认真申请过转专业，但筹码还差一点。这次更早保住专业积累和机会，再推一次那扇门。";
  if (routeId === "transfer") return "上一局成功推开了转专业窗口。这次留在法学院，看看同一套判断力会把你送到哪条路。";
  if (dim(game, "escape") < 2) return "上一局没有触发转专业窗口。这次主动调查两次专业出口。";
  return "使用与你上一局完全相反的选择，再读一次法学。";
}

function deriveFit(game: LawGameLike, routeId: string) {
  const strengths = [
    dim(game, "ruleSensitivity") >= 60 ? "你会主动寻找规则、依据和事实结构。" : "你对具体场景比抽象规则更敏感。",
    dim(game, "ambiguityTolerance") >= 55 ? "你能忍受法学里大量没有唯一答案的问题。" : "长期面对开放答案可能持续消耗你。",
  ];
  return {
    strengths,
    risks: Number(game.stats.energy ?? 0) < 40 ? "你容易用持续透支换结果，法律职业的长战线会放大这一点。" : "你目前能在投入和恢复之间维持节奏，但高压路线仍需要主动设边界。",
    direction: routeId === "academic" ? "研究、考研与需要长文本论证的方向" : routeId === "firm" ? "律所、法务与需要检索交付的方向" : routeId === "civil" ? "公共部门、考公考编与规则执行方向" : routeId === "advocacy" ? "诉讼、谈判与公开表达方向" : "可迁移法律能力较强的跨行业方向",
  };
}

function deriveTrend(state: MutableLawState) {
  const trends = [
    { value: dim(state, "responsibility"), text: "你似乎越来越习惯替小组收拾残局。" },
    { value: dim(state, "ruleSensitivity"), text: "一个危险的趋势正在形成：你开始享受挑别人论证漏洞。" },
    { value: dim(state, "evidence") * 12, text: "你正在逐渐失去对残缺证据和模糊叙述的耐心。" },
    { value: dim(state, "realityPlanning"), text: "系统观察：焦虑出现时，你越来越习惯先查规则和入口。" },
    { value: routeScore(state, "survival") * 8, text: "你的专业滤镜碎了，但人暂时还没走。" },
  ];
  return trends.sort((a, b) => b.value - a.value)[0].text;
}

function addRouteFromLegacy(scores: Record<string, number>, route: string) {
  const map: Record<string, LawRouteKey> = {
    route_postgrad: "academic", route_law_exam: "academic", route_job: "firm", route_civil_service: "civil",
    route_transfer_application: "transfer", route_layflat: "survival", route_cross: "detour", route_law_core: "advocacy",
  };
  if (map[route]) add(scores, map[route], 5);
}

function dim(state: MutableLawState, key: string) { return Number(state.hiddenStats[key] ?? 50); }
function routeScore(state: MutableLawState, key: string) { return Number(state.routeScores?.[key] ?? 0); }
function proof(state: MutableLawState, personaId: string) { return Number(state.hiddenStats[`personaEvidence_${personaId}`] ?? 0); }
function add(bag: Record<string, number>, key: string, value: number) { bag[key] = Number(bag[key] ?? 0) + value; }
function pushUnique(list: string[], item: string) { if (!list.includes(item)) list.push(item); }
function unique<T>(items: T[]) { return [...new Set(items)]; }
function clamp(value: number) { return Math.max(0, Math.min(100, Math.round(value))); }
function simpleHash(value: string) { let h = 0; for (const char of value) h = (h * 31 + char.charCodeAt(0)) >>> 0; return h.toString(36); }
