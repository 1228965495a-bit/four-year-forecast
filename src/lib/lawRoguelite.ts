import { LAW_ROGUELITE_EVENTS } from "@/data/script/byMajor/law.roguelite.events";
import { decorateLawReplayEvent, pickLawReplayOpening, recordLawReplayChoice } from "./lawReplay";
import type { ReplayRunContext } from "./replaySystem";

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
  replayContext?: ReplayRunContext | null;
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
  { id: "academic", title: "学术牛马预服役线", ending: "名单没出，导师先把你当研究生用了", summary: "你从帮老师查两篇文献开始，查着查着有了选题，改着改着多出八个版本。别人暑假在旅游，你在夏令营海投；别人问你保没保上，你不敢说，只敢继续改摘要。等名单终于落地，你已经提前过了半年研究生生活。", shareText: "我的法学本科结局：保研名单还没出，老师已经按研究生标准用了我半年。录取通知来得很晚，“再改一版”来得一直很准时。" },
  { id: "firm", title: "律所实习就业线", ending: "律政剧没拍的活，你全干了", summary: "你见过律政剧删掉的检索、改稿、装订和凌晨消息，也学会在第七版文件名里保持职业微笑。滤镜掉了不少，但你确认自己愿意从真实业务里慢慢站稳。", shareText: "我在法学院走了律所就业线：没在法庭上拍桌子，先在第七版合同里找到了职业方向。" },
  { id: "civil", title: "考公考编线", ending: "焦虑一律转成岗位表", summary: "你没有让就业焦虑在脑内无限开庭，而是把它拆成岗位、条件、时间表和备选方案。别人还在问以后怎么办，你已经把应届身份规划到了小数点后两位。", shareText: "我的法学本科结局：把焦虑做成Excel，在职位表里为未来申请了一个可执行版本。" },
  { id: "advocacy", title: "全场默认你主辩线", ending: "表达能力上来了，麦也焊手上了", summary: "你从第一次被老师点名时脑子空白，练到能在三分钟内把队友那份逻辑稀碎的稿子救回来。代价是以后每逢汇报、答辩和模拟法庭，群里都会准时出现那句：“要不还是你讲吧。”", shareText: "我的法学本科结局：表达能力确实练出来了，代价是每次小组作业都有人默默把麦递给我。" },
  { id: "transfer", title: "法学院成功出逃线", ending: "逃生门不是贴图，真能推开", summary: "你把培养方案翻到包浆，绩点守到能用，连教务处几点开门都摸清了。名单公布那天，你终于确认法学院的逃生门不是游戏贴图。新专业照样有DDL，但至少这次是你自己点的确认键。", shareText: "我的法学本科结局：培养方案翻烂了，转专业名单上终于有我。逃生门不是贴图，真能开。" },
  { id: "survival", title: "法学院低空通关线", ending: "没拿满成就，人活到了片尾", summary: "你没拿国奖、没把每场比赛都打满，也没在期末周把自己卷成失踪人口。该交的交，该拒绝的拒绝，偶尔擦线飞过，最后把毕业证和还能用的精神状态一起带出了法学院。", shareText: "我的法学本科结局：没拿满成就，也没把自己搭进去。毕业证到手，人还能正常开机。" },
  { id: "detour", title: "非典型跨行线", ending: "法律没做主业，成了被动技能", summary: "你没有沿着法考、律所或体制内的标准航线前进，却把检索、规则、表达和风险意识装进了另一份职业。法学没有成为终点，但它已经悄悄接管了你的思考方式。", shareText: "我没有从事法律职业，但法学已经成了跨行业被动技能：听到结论先问依据，看到合同先找坑。" },
] as const;

export const LAW_PERSONAS = [
  { id: "evidence", title: "全网聊天记录质证员", verdict: "你可以接受别人情绪失控，但不能接受时间线对不上。朋友刚说“事情是这样的”，你已经在等原始聊天记录和完整上下文。", shareText: "我的法学人格是全网聊天记录质证员：瓜可以晚吃，证据链不能断。", tags: ["原始记录派", "时间线考古学家", "完整上下文爱好者"], score: (s: MutableLawState) => dim(s, "evidence") * 10 + dim(s, "ruleSensitivity") * 0.6 + (100 - dim(s, "ambiguityTolerance")) * 0.25 + proof(s, "evidence") * 60 },
  { id: "advocate", title: "随地开庭型法学生", verdict: "你没有打算逢人就杠，可任何观点到了你这里都会自动经历立论、质询和总结陈词。普通聊天十分钟，旁听席已经坐满。", shareText: "我的法学人格是随地开庭型法学生：朋友只是发表意见，我已经进入交叉质询。", tags: ["观点必须说完整", "反方雷达常开", "发言席常驻"], score: (s: MutableLawState) => dim(s, "expression") * 0.8 + dim(s, "stressTolerance") * 0.35 + routeScore(s, "advocacy") * 3 + proof(s, "advocate") * 60 },
  { id: "rule_keeper", title: "“依据呢”型法学生", verdict: "你对“大家都这样”具有天然抗性。规则可以讨论，结论可以改变，但谁想靠一句“一直如此”糊弄过去，先把依据交上来。", shareText: "我的法学人格是“依据呢”型法学生：不一定背得出原文，但一定会追问你凭什么。", tags: ["规则敏感体质", "口头禅：依据呢", "惯例默认待核"], score: (s: MutableLawState) => dim(s, "ruleSensitivity") * 0.8 + dim(s, "idealDrive") * 0.35 + Number(s.majorStats.legalCloseness ?? 0) * 0.2 + proof(s, "rule_keeper") * 60 },
  { id: "planner", title: "焦虑表格化选手", verdict: "别人焦虑时刷短视频，你会打开岗位表，把报名条件、时间节点和Plan B排整齐。情绪还没解决，单元格先全部对齐。", shareText: "我的法学人格是焦虑表格化选手：未来还没定，备选方案已经编号到C。", tags: ["岗位表收藏家", "Plan B常驻", "情绪转Excel"], score: (s: MutableLawState) => dim(s, "realityPlanning") * 0.9 + routeScore(s, "civil") * 3 + Number(s.stats.opportunity ?? 0) * 0.1 + proof(s, "planner") * 60 },
  { id: "escape", title: "法学院逃生门测绘师", verdict: "你查过转专业、辅修、跨考和跨行的每个出口。最后走不走另说，法学院哪扇门能推、几点开放，你比教务处更清楚。", shareText: "我的法学人格是法学院逃生门测绘师：人可以暂时不跑，路线必须提前查好。", tags: ["退出机制研究员", "跨行雷达", "随身携带Plan B"], score: (s: MutableLawState) => dim(s, "escape") * 10 + dim(s, "realityPlanning") * 0.5 + Number(s.stats.escapeImpulse ?? 0) * 0.3 + proof(s, "escape") * 60 },
  { id: "mediator", title: "小组作业善后专员", verdict: "你入学时想解决社会纠纷，毕业前先解决队友失联、任务撞车和群聊冷战。每次冲突都有人获得成长，通常你只得到收尾工作。", shareText: "我的法学人格是小组作业善后专员：别人负责表达立场，我负责让文件按时交上去。", tags: ["团队补位体质", "失联队友召回术", "冲突收尾人"], score: (s: MutableLawState) => dim(s, "responsibility") * 0.8 + dim(s, "idealDrive") * 0.3 + dim(s, "expression") * 0.2 + proof(s, "mediator") * 60 },
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
  0: ["law_y1s1_main_001"],
  1: ["law_y1s2_main_004"],
  2: ["law_y2s1_main_007"],
  3: ["law_y2s2_main_010"],
  4: ["law_y3s1_main_013"],
  5: ["law_y3s2_route_016"],
  6: ["law_y4s1_main_019"],
  7: ["law_y4s2_main_022"],
};

const LAW_DEFAULT_NEXT: Record<string, string> = {
  law_y2s1_main_007: "law_y2s1_main_008",
  law_y2s2_main_010: "law_y2s2_main_012",
  law_y3s2_route_017: "law_y3s2_main_018",
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
  recordLawReplayChoice(state.replayContext, choice);
  state.pendingTrend = state.hiddenStats.lawChoiceCount % 3 === 0 ? deriveTrend(state) : null;
}

export function pickLawCoreEvent(state: MutableLawState & { semesterIdx: number }) {
  if (state.semesterIdx === 0 && (state.replayContext?.completedEventCount ?? 0) === 0) {
    const replayOpening = pickLawReplayOpening(state.replayContext);
    if (replayOpening) return replayOpening;
  }
  const pool = LAW_CORE_POOLS[state.semesterIdx] ?? [];
  const unseen = pool.filter((id) => !state.seenEvents.includes(id));
  if (!unseen.length) return null;
  const seed = Number(state.hiddenStats.lawRunSeed ?? 1) + state.semesterIdx * 7 + state.seenEvents.length;
  return unseen[seed % unseen.length];
}

export function defaultLawNextEvent(eventId: string) {
  return LAW_DEFAULT_NEXT[eventId] ?? null;
}

export function pickLawCallbackEvent(state: MutableLawState & { semesterIdx: number }) {
  if (state.semesterIdx !== 2) return null;
  const candidates: string[] = [];
  if (Number(state.hiddenStats.lawEvidence ?? 0) >= 1) candidates.push("law_y2s1_branch_evidence_001");
  if (Number(state.hiddenStats.lawEscape ?? 0) >= 1) candidates.push("law_y2s1_branch_escape_001");
  const unseen = candidates.filter((id) => !state.seenEvents.includes(id));
  if (!unseen.length) return null;
  const seed = Number(state.hiddenStats.lawRunSeed ?? 1) + state.seenEvents.length;
  return unseen[seed % unseen.length];
}

export function pickLawResourceEvent(state: MutableLawState & { semesterIdx: number }) {
  const semester = ["y1s1", "y1s2", "y2s1", "y2s2", "y3s1", "y3s2", "y4s1"][state.semesterIdx];
  if (!semester) return null;
  const semesterResourceIds = LAW_ROGUELITE_EVENTS.filter((event) => event.semester === semester).map((event) => event.id);
  const shownCount = semesterResourceIds.filter((id) => state.seenEvents.includes(id)).length;
  const targetCount = 1 + ((Number(state.hiddenStats.lawRunSeed ?? 1) + state.semesterIdx) % 2);
  if (shownCount >= targetCount) return null;
  const basePool = LAW_ROGUELITE_EVENTS.filter((event) => event.semester === semester && !state.seenEvents.includes(event.id));
  const previousSeen = new Set(state.replayContext?.previousRun.seenEventIds ?? []);
  const freshPool = (state.replayContext?.completedEventCount ?? 99) < 3
    ? basePool.filter((event) => !previousSeen.has(event.id))
    : [];
  const pool = freshPool.length ? freshPool : basePool;
  if (!pool.length) return null;
  const seed = Number(state.hiddenStats.lawRunSeed ?? 1) * 19 + state.semesterIdx * 13 + shownCount * 7;
  return pool[seed % pool.length].id;
}

export function shouldFollowLawEvent(state: MutableLawState & { semesterIdx: number; semesterEventCount?: number }, next: any) {
  if (!next) return false;
  if (next.type === "transfer" && next.id.startsWith("law_transfer_apply")) return true;
  if (next.id.startsWith("law_transfer_transition")) return true;
  if (next.id === "law_y2s2_main_012" && routeScore(state, "transfer") >= 5) return true;
  if ((state.semesterEventCount ?? 0) >= 3) return false;
  return ["main", "route", "hidden", "transfer", "gg_check", "settlement"].includes(next.type);
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
  if (event?.id !== "law_transfer_apply_003") return decorateLawReplayEvent(state as any, event);
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
  return decorateLawReplayEvent(state as any, { ...event, options: [resolved], choices: [resolved] });
}

function deriveRoute(state: MutableLawState) {
  if (state.flags.includes("flag_transfer_success")) return LAW_ROUTE_DEFINITIONS.find((route) => route.id === "transfer")!;
  if (state.flags.includes("flag_transfer_failed")) {
    const transfer = LAW_ROUTE_DEFINITIONS.find((route) => route.id === "transfer")!;
    return {
      ...transfer,
      title: "转专业未遂线",
      ending: "门推了，名额没推开",
      summary: "你认真查规则、交材料，也真的试过离开。结果名单没有你的名字，课表却准时续上。你带着一次未遂记录回到法学院，从此对教务系统角落的小字拥有异常敏锐的嗅觉。",
      shareText: "我的转专业申请理由充分、材料齐全、名额不足。门没开，但我已经知道它在哪里了。",
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
