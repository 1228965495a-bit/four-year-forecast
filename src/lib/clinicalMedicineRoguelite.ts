import type { ClinicalRouteKey } from "@/data/script/byMajor/clinicalMedicine.events";
import { humorTypeRepeatPenalty } from "./eventCopyQuality";

type MutableClinicalState = {
  stats: Record<string, number>;
  majorStats: Record<string, number>;
  hiddenStats: Record<string, number>;
  flags: string[];
  routes: string[];
  seenEvents: string[];
  routeScores?: Record<string, number>;
  specialExperiences?: string[];
  pendingTrend?: string | null;
  initialTrait?: string | null;
};

type ClinicalGameLike = MutableClinicalState & {
  history: Array<{ semester: string; title: string; choice: string; feedback: string }>;
  semesterIdx: number;
};

export const CLINICAL_MEMORIES = [
  { id: "clinical_exam_framework", title: "带走一份基础课复习框架", description: "开局获得 6 点医学积累。" },
  { id: "clinical_skill_slot", title: "保留一次技能中心练习名额", description: "开局获得 8 点临床机会。" },
  { id: "clinical_route_note", title: "提前问过培养路线的代价", description: "现实规划倾向小幅提高。" },
] as const;

export const CLINICAL_START_TRAITS = [
  { id: "senior_notes", title: "学姐把祖传资料包传给了你", description: "文件名很乱，重点很真。你提前得到一套复习框架，也提前看见医学生的资料焦虑。" },
  { id: "skill_slot", title: "你抢到了技能中心早鸟名额", description: "动作不会因此自动熟练，但第一次练习不必等到所有人围观时才发生。" },
  { id: "family_filter", title: "全家已经开始叫你未来名医", description: "期待先到账，能力还在加载。白大褂滤镜更厚，退出成本也更像真的。" },
  { id: "no_filter", title: "你入学时就没带职业滤镜", description: "你不预设自己必须热血，只想看看长学制、责任和真实工作是否适合自己。" },
] as const;

export function getClinicalStartTrait(id?: string | null) {
  return CLINICAL_START_TRAITS.find((trait) => trait.id === id) ?? null;
}

export const CLINICAL_ROUTE_DEFINITIONS = [
  { id: "diagnosis", title: "诊断推理线", ending: "病历时间线终于不再互相打架", summary: "你习惯先核对事实、时间和证据，再给出判断。你没有在本科阶段假装能独立诊疗，但已经知道临床推理最怕的不是答得慢，而是把猜测说成确定。", shareText: "我的临床本科路线：先核对时间线，再让病名进场。猜对不算本事，知道哪里不能猜才算。" },
  { id: "surgery", title: "操作实践线", ending: "敢上手之前，先学会什么时候别硬上", summary: "你一次次回到技能中心，把失败动作拆开重练，也学会在不熟时明确求助。操作感不是热血镜头，而是准备、反馈和边界共同换来的可靠。", shareText: "我的临床本科路线：动作可以重练，患者安全不能拿来练胆量。" },
  { id: "research", title: "科研积累线", ending: "数据返工了，研究习惯留下了", summary: "你经历过口径不一、结果不漂亮和项目名比贡献大的诱惑。最后能写进材料的，不只是项目标题，还有你真正核对过、解释过和拒绝糊弄的部分。", shareText: "我的临床本科路线：没有一作从天而降，只有数据口径凌晨返工。" },
  { id: "planning", title: "升学规划线", ending: "计划改到第十二版，主线还活着", summary: "实习、课程和倒计时不断切碎日历，你学会给计划留缓冲，也学会放弃不可能同时完成的目标。你不是完全按表生活，只是没再让一次偏离摧毁整条路线。", shareText: "我的临床本科路线：考研计划改到第十二版，至少这次没把自己也删掉。" },
  { id: "humanities", title: "医学人文线", ending: "会解释，也会把责任交回团队", summary: "你听得见患者和家属话里的担心，也知道共情不是无限接单。你在信息、情绪和专业边界之间做翻译，但不再把自己默认成全组永久缓冲垫。", shareText: "我的临床本科路线：能听懂情绪，也终于学会不把所有情绪都背回宿舍。" },
  { id: "detour", title: "医学转向隐藏线", ending: "白大褂没穿到底，医学训练没有白读", summary: "你保留医学带来的检索、风险和沟通习惯，转向临床之外的入口。这不是被副本淘汰，而是在看过真实培养路径后，做了一次有证据的路线调整。", shareText: "我的临床隐藏路线：离开临床不是逃跑，是把五年训练带去另一个需要它的地方。" },
  { id: "survival", title: "低耗可靠生存线", ending: "没有包揽全场，但从来没有失联", summary: "你拒绝过项目、放弃过高光，也一直把基础任务交付清楚。不是满成就截图，却是在长线培养里最难伪装的一种可靠。", shareText: "我的临床本科路线：没把每个机会都接住，但每个答应过的事都有回音。" },
] as const;

export const CLINICAL_PERSONAS = [
  {
    id: "timeline_detective", title: "病历时间线侦探",
    verdict: "别人先猜病名，你先问症状到底从哪天开始。病历里两个日期一打架，你的注意力会比老师先到现场。",
    tags: ["时间线核对", "证据先行", "拒绝脑补"],
    shareText: "我的医学生人格：病历时间线侦探。病名可以晚一点，前后矛盾必须先到案。",
    score: (s: MutableClinicalState) => personaScore(s, "timelineSense", "clinicalCaution", "timeline"),
  },
  {
    id: "rounds_predictor", title: "查房前夜预判师",
    verdict: "你会在查房前把老师可能追问的方向排成一棵树。树未必全中，但至少被点名时脑内不会只剩一片白。",
    tags: ["追问预判", "框架救场", "提前准备"],
    shareText: "我的医学生人格：查房前夜预判师。老师还没开口，我已经在脑内被追问了三轮。",
    score: (s: MutableClinicalState) => personaScore(s, "predictorHabit", "studyFramework", "predictor"),
  },
  {
    id: "guideline_first", title: "“先查指南”型医学生",
    verdict: "你不把记忆里的半句话当结论。遇到不确定的事先查依据、问老师、确认边界，是你最不戏剧化也最可靠的习惯。",
    tags: ["指南优先", "边界明确", "谨慎可靠"],
    shareText: "我的医学生人格：先查指南型。不会不是事故，把不确定说成确定才是。",
    score: guidelinePersonaScore,
  },
  {
    id: "idealist_survivor", title: "白大褂理想主义幸存者",
    verdict: "滤镜碎过，夜也熬过，你仍愿意认真对待重要的事。热血不再负责照明，边界和长期行动开始接班。",
    tags: ["滤镜重建", "理想未退订", "长期主义"],
    shareText: "我的医学生人格：白大褂理想主义幸存者。滤镜没了，理想居然还在。",
    score: (s: MutableClinicalState) => personaScore(s, "idealDrive", "responsibility", "idealist"),
  },
  {
    id: "emotion_buffer", title: "人形情绪缓冲垫",
    verdict: "患者、家属和组员都觉得你比较会说话，于是所有难开口的话最后都排到你这里。你正在学习，共情不等于无限续杯。",
    tags: ["沟通接锅", "情绪翻译", "边界补课"],
    shareText: "我的医学生人格：人形情绪缓冲垫。全组都不会开口时，我就自动获得了沟通权限。",
    score: (s: MutableClinicalState) => personaScore(s, "emotionalLabor", "expression", "buffer"),
  },
  {
    id: "calendar_player", title: "考研日历成精型选手",
    verdict: "你的计划表经历过轮转、临时任务和精神电量的反复攻击，仍能长出下一版。你真正擅长的不是按表完美执行，而是偏离以后还能回来。",
    tags: ["计划迭代", "主线保活", "允许偏离"],
    shareText: "我的医学生人格：考研日历成精型。计划改到第十二版，主线居然还活着。",
    score: (s: MutableClinicalState) => personaScore(s, "examPlanning", "realityPlanning", "planner"),
  },
] as const;

const CORE_IDS = [
  "clinical_core_01_entry", "clinical_core_02_study", "clinical_core_03_mechanism",
  "clinical_core_04_skill", "clinical_core_05_history", "clinical_core_06_routes",
  "clinical_core_07_rounds", "clinical_core_08_rotation", "clinical_core_09_boss",
  "clinical_core_10_future",
];

export function createClinicalRunState(state: MutableClinicalState, runNumber: number) {
  state.routeScores = Object.fromEntries(CLINICAL_ROUTE_DEFINITIONS.map((route) => [route.id, route.id === "survival" ? 1 : 0]));
  state.specialExperiences = [];
  state.stats.energy = 78;
  state.stats.medicalAccumulation = 20;
  state.stats.clinicalOpportunity = 15;
  for (const key of [
    "idealDrive", "realityPlanning", "stressTolerance", "ambiguityTolerance", "responsibility",
    "expression", "timelineSense", "clinicalCaution", "studyFramework", "predictorHabit",
    "operationPractice", "researchPatience", "examPlanning", "emotionalLabor", "boundarySense",
    "lowCostSurvival", "teamBackup", "scienceCommunication", "guidelineHabit",
  ]) state.hiddenStats[key] ??= 50;
  const seed = Math.max(1, runNumber);
  state.hiddenStats.clinicalRunSeed = seed;
  state.hiddenStats.clinicalChoiceCount = 0;
  const trait = CLINICAL_START_TRAITS[(seed * 5 + 1) % CLINICAL_START_TRAITS.length];
  state.initialTrait = trait.id;
  applyStartTrait(state, trait.id);
}

export function applyClinicalChoiceLayer(state: MutableClinicalState, event: any, choice: any) {
  const impact = choice.clinical ?? {};
  state.routeScores ??= {};
  state.specialExperiences ??= [];
  state.stats.medicalAccumulation = clamp(Number(state.stats.medicalAccumulation ?? 20) + Number(impact.medical ?? 0));
  state.stats.clinicalOpportunity = clamp(Number(state.stats.clinicalOpportunity ?? 15) + Number(impact.opportunity ?? 0));
  for (const [key, value] of Object.entries(impact.traits ?? {})) add(state.hiddenStats, key, Number(value));
  for (const [key, value] of Object.entries(impact.routes ?? {})) add(state.routeScores, key, Number(value));
  for (const flag of impact.flags ?? []) pushUnique(state.flags, flag);
  for (const route of impact.closes ?? []) pushUnique(state.flags, `clinical_closed_${route}`);
  for (const title of impact.experiences ?? []) pushUnique(state.specialExperiences, title);
  if (impact.proof) add(state.hiddenStats, `clinicalProof_${impact.proof}`, 1);
  state.hiddenStats.clinicalChoiceCount = Number(state.hiddenStats.clinicalChoiceCount ?? 0) + 1;
  state.pendingTrend = state.hiddenStats.clinicalChoiceCount % 3 === 0 ? deriveTrend(state) : null;
}

export function pickClinicalCoreEvent(state: MutableClinicalState & { semesterIdx: number }) {
  const id = CORE_IDS[state.semesterIdx];
  return id && !state.seenEvents.includes(id) ? id : null;
}

export function shouldDrawClinicalOptional(state: MutableClinicalState & { semesterIdx: number }) {
  if (state.semesterIdx >= 9) return false;
  const seed = Number(state.hiddenStats.clinicalRunSeed ?? 1);
  const skips = new Set<number>();
  for (let salt = 0; skips.size < 3; salt += 1) skips.add(stableIndex(seed * 29 + salt * 17 + 7, 9));
  return !skips.has(state.semesterIdx);
}

export function pickClinicalOptionalEvent(
  state: MutableClinicalState & { semesterIdx: number },
  events: any[],
) {
  const currentSemester = semesterKey(state.semesterIdx);
  const committedRoute =
    state.flags.includes("clinical_research_entry") ? "research"
      : state.flags.includes("clinical_plan_entry") ? "planning"
        : state.flags.includes("clinical_clinical_entry")
          ? (dim(state, "operationPractice") >= dim(state, "timelineSense") ? "surgery" : "diagnosis")
          : state.flags.includes("clinical_interview_listen") ? "humanities"
            : state.flags.includes("clinical_boundary_choice") ? "survival"
              : null;
  const committedEvent = committedRoute
    ? events.find((event) =>
        event.type === "route"
        && event.semester === currentSemester
        && event.routeIds?.includes(committedRoute)
        && !state.seenEvents.includes(event.id)
        && !state.flags.includes(`clinical_closed_${committedRoute}`))
    : null;
  if (committedEvent) return committedEvent.id;

  const candidates = events
    .filter((event) => ["route", "major_random"].includes(event.type))
    .filter((event) => !state.seenEvents.includes(event.id))
    .filter((event) => !event.semester || event.semester === currentSemester)
    .filter((event) => !(event.routeIds ?? []).some((route: string) => state.flags.includes(`clinical_closed_${route}`)))
    .map((event) => {
      const affinity = (event.routeIds ?? []).reduce((sum: number, route: string) => sum + Number(state.routeScores?.[route] ?? 0), 0);
      const branchBoost = (event.routeIds ?? []).reduce((sum: number, route: ClinicalRouteKey) => {
        if (state.seenEvents.some((id) => new RegExp(`^clinical_route_${route}_0[234]$`).test(id))) return sum + 120;
        if (route === "research" && state.flags.includes("clinical_research_entry")) return sum + 70;
        if (route === "planning" && state.flags.includes("clinical_plan_entry")) return sum + 70;
        if (route === "surgery" && state.flags.includes("clinical_clinical_entry")) return sum + 45 + dim(state, "operationPractice") * 0.5;
        if (route === "diagnosis" && state.flags.includes("clinical_clinical_entry")) return sum + 35 + dim(state, "timelineSense") * 0.35;
        if (route === "humanities" && state.flags.includes("clinical_interview_listen")) return sum + 55;
        if (route === "survival" && state.flags.includes("clinical_boundary_choice")) return sum + 65;
        return sum;
      }, 0);
      const branch = stableHash(`${state.hiddenStats.clinicalRunSeed}|${state.seenEvents.join("|")}|${event.id}`) % 23;
      const humorPenalty = humorTypeRepeatPenalty(events, state.seenEvents, event);
      return { event, score: (Number(event.weight ?? 10) + affinity * 1.35 + branchBoost + branch) * humorPenalty };
    })
    .sort((a, b) => b.score - a.score);
  return candidates[0]?.event.id ?? null;
}

export function pickClinicalCallbackEvent(state: MutableClinicalState & { semesterIdx: number }) {
  const hiddenSeen = state.seenEvents.filter((id) => id.startsWith("clinical_hidden_")).length;
  if (hiddenSeen >= 2) return null;
  const candidates: Array<[boolean, string]> = [
    [state.semesterIdx >= 8 && hasAny(state, ["clinical_research_entry", "clinical_research_audit", "clinical_research_report"]), "clinical_hidden_research_callback"],
    [state.semesterIdx >= 8 && hasAny(state, ["clinical_plan_entry", "clinical_plan_six_weeks"]), "clinical_hidden_plan_callback"],
    [state.semesterIdx >= 8 && hasAny(state, ["clinical_skill_repeat", "clinical_skill_help", "clinical_skill_record"]), "clinical_hidden_skill_callback"],
    [state.semesterIdx >= 8 && hasAny(state, ["clinical_interview_listen", "clinical_family_boundary", "clinical_family_explain"]), "clinical_hidden_emotion_callback"],
    [state.semesterIdx >= 9 && hasAny(state, ["clinical_respect_first", "clinical_honest_entry", "clinical_rotation_open"]), "clinical_hidden_filter_callback"],
    [state.semesterIdx >= 7 && dim(state, "clinicalCaution") >= 64 && hasAny(state, ["clinical_rounds_honest", "clinical_rounds_framework"]), "clinical_hidden_teacher_name"],
    [state.semesterIdx >= 9 && dim(state, "lowCostSurvival") >= 64 && dim(state, "boundarySense") >= 60, "clinical_hidden_lowcost"],
    [state.semesterIdx >= 6 && hasAny(state, ["clinical_study_framework", "clinical_study_memory", "clinical_study_team", "clinical_study_cram"]), "clinical_hidden_study_callback"],
  ];
  return candidates.find(([hit, id]) => hit && !state.seenEvents.includes(id))?.[1] ?? null;
}

export function shouldFollowClinicalEvent(state: MutableClinicalState & { semesterEventCount?: number }, next: any) {
  return Boolean(next && next.type === "hidden" && Number(state.semesterEventCount ?? 0) < 3);
}

export function deriveClinicalResult(game: ClinicalGameLike) {
  const route = deriveRoute(game);
  const persona = [...CLINICAL_PERSONAS].sort((a, b) => b.score(game) - a.score(game))[0];
  const experiences = deriveExperiences(game);
  return {
    route,
    persona,
    experiences,
    reasons: deriveReasons(game, route.id, persona.id),
    viralStats: [
      { label: "查指南再开口指数", value: clamp(dim(game, "clinicalCaution")) },
      { label: "查房前脑内预演时长", value: clamp((dim(game, "predictorHabit") + dim(game, "studyFramework")) / 2) },
      { label: "替全组接沟通概率", value: clamp((dim(game, "emotionalLabor") + dim(game, "expression")) / 2) },
    ],
    story: buildStory(game),
    lockedHint: deriveLockedHint(game, route.id),
    replayChallenge: deriveReplayChallenge(route.id),
    fit: deriveFit(game, route.id),
  };
}

function deriveRoute(state: MutableClinicalState) {
  const ranked = CLINICAL_ROUTE_DEFINITIONS
    .filter((route) => !state.flags.includes(`clinical_closed_${route.id}`))
    .map((route) => ({ route, score: Number(state.routeScores?.[route.id] ?? 0) }))
    .sort((a, b) => b.score - a.score);
  return ranked[0]?.route ?? CLINICAL_ROUTE_DEFINITIONS[6];
}

function deriveExperiences(game: ClinicalGameLike) {
  const items = (game.specialExperiences ?? []).map((title) => ({ id: `clinical_${simpleHash(title)}`, title }));
  const candidates: Array<[boolean, string, string]> = [
    [game.flags.includes("clinical_rounds_honest"), "honest", "第一次在查房时如实说不知道"],
    [game.flags.includes("clinical_teacher_remembered"), "teacher", "老师不用看胸牌也记住了你"],
    [game.flags.includes("clinical_callback_research_done"), "research", "返工数据终于能写进材料"],
    [game.flags.includes("clinical_callback_emotion_done"), "emotion", "把沟通责任交回了团队"],
    [game.flags.includes("clinical_lowcost_recognized"), "lowcost", "低耗生存仍被评价为可靠"],
    [dim(game, "operationPractice") >= 68, "skill", "技能中心把失败动作练了回来"],
    [dim(game, "examPlanning") >= 68, "plan", "考研计划活过了临时排班"],
    [dim(game, "timelineSense") >= 68, "timeline", "从病历里捞出一条完整时间线"],
  ];
  for (const [hit, id, title] of candidates) if (hit && !items.some((item) => item.id === id)) items.push({ id, title });
  return items.slice(0, 7);
}

function deriveReasons(game: ClinicalGameLike, routeId: string, personaId: string) {
  const route = CLINICAL_ROUTE_DEFINITIONS.find((item) => item.id === routeId)!;
  const persona = CLINICAL_PERSONAS.find((item) => item.id === personaId)!;
  const reasons = [
    `你的“${route.title}”路线权重在本局选择中最高。`,
    `“${persona.title}”对应的行为倾向被连续选择，而不是由最后一题决定。`,
  ];
  const proofLabels: Record<string, string> = {
    timeline: "你多次先核对病历事实和时间线，再给判断。",
    predictor: "你习惯在考试或查房前预判追问并搭框架。",
    guideline: "你在不确定时更常查依据、求助并说明边界。",
    idealist: "你看见了培养代价，仍保留了可持续的医学理想。",
    buffer: "你多次接住沟通任务，也开始练习把责任交回团队。",
    planner: "你不断改写计划，却一直保住了最重要的主线。",
  };
  const strongest = Object.entries(proofLabels).sort((a, b) => dim(game, `clinicalProof_${b[0]}`) - dim(game, `clinicalProof_${a[0]}`))[0];
  if (strongest) reasons.push(strongest[1]);
  return reasons;
}

function buildStory(game: ClinicalGameLike) {
  const years = ["大一", "大二", "大三", "大四", "大五"];
  return years.map((year, index) => {
    const rows = [...game.history].reverse().filter((item) => String(item.semester ?? "").startsWith(year));
    return { year, text: rows[0] ? `${rows[0].title}：你选择了“${rows[0].choice}”。` : "这一年没有留下完整记录。" };
  });
}

function deriveLockedHint(state: MutableClinicalState, routeId: string) {
  const next = CLINICAL_ROUTE_DEFINITIONS
    .filter((route) => route.id !== routeId && !state.flags.includes(`clinical_closed_${route.id}`))
    .sort((a, b) => Number(state.routeScores?.[b.id] ?? 0) - Number(state.routeScores?.[a.id] ?? 0))[0];
  return next ? `你也曾接近“${next.title}”。下一局在大三路线分岔时换一种资源投入，它会更早出现。` : "你在本局主动关闭了多数路线。下一局少接一个任务，入口会重新出现。";
}

function deriveReplayChallenge(routeId: string) {
  const copy: Record<string, string> = {
    diagnosis: "下一局少赌一次答案，多把一次机会投给操作或沟通。",
    surgery: "下一局先保留科研入口，看看一次数据返工会怎样回到大五。",
    research: "下一局不接挂名项目，把机会留给真实轮转。",
    planning: "下一局允许日历被打乱一次，看看陌生科室会不会改写路线。",
    humanities: "下一局别自动当沟通代表，练一次明确边界。",
    detour: "下一局保留临床入口直到最后，再判断理想是否还在。",
    survival: "下一局只额外承诺一件事，并把它做成特殊经历。",
  };
  return copy[routeId] ?? "换一种资源分配，再读一次这五年。";
}

function deriveFit(state: MutableClinicalState, routeId: string) {
  return {
    strengths: [
      dim(state, "clinicalCaution") >= 62 ? "你能把不确定与安全边界说清。" : "你愿意在真实体验后修正判断。",
      dim(state, "responsibility") >= 62 ? "你对承诺和交付有稳定责任感。" : "你开始知道精力也是有限资源。",
    ],
    risks: dim(state, "emotionalLabor") > dim(state, "boundarySense") + 10
      ? "你容易成为默认沟通和接锅对象，需要更早划定边界。"
      : "你可能为了维持计划而错过探索，或为了探索让主线反复重启。",
    direction: `${CLINICAL_ROUTE_DEFINITIONS.find((item) => item.id === routeId)?.title ?? "临床训练"}是本局最强倾向，但本科结局不是执业能力证明，也不替代真实升学和职业咨询。`,
  };
}

function deriveTrend(state: MutableClinicalState) {
  const ranked = CLINICAL_ROUTE_DEFINITIONS
    .map((route) => ({ route, score: Number(state.routeScores?.[route.id] ?? 0) }))
    .sort((a, b) => b.score - a.score);
  return `本局倾向正在向「${ranked[0].route.title}」靠近，但下一次资源选择仍可能改写路线。`;
}

function applyStartTrait(state: MutableClinicalState, id: string) {
  if (id === "senior_notes") { add(state.hiddenStats, "studyFramework", 8); add(state.routeScores!, "planning", 3); }
  if (id === "skill_slot") { state.stats.clinicalOpportunity += 6; add(state.hiddenStats, "operationPractice", 8); add(state.routeScores!, "surgery", 3); }
  if (id === "family_filter") { state.stats.filter = clamp(Number(state.stats.filter ?? 0) + 8); add(state.hiddenStats, "idealDrive", 8); }
  if (id === "no_filter") { state.stats.filter = clamp(Number(state.stats.filter ?? 0) - 12); add(state.hiddenStats, "clinicalCaution", 7); add(state.routeScores!, "survival", 3); }
}

function personaScore(state: MutableClinicalState, first: string, second: string, proof: string) {
  return dim(state, first) * 0.55 + dim(state, second) * 0.35 + personaProofScore(state, proof);
}

function guidelinePersonaScore(state: MutableClinicalState) {
  return dim(state, "clinicalCaution") * 0.45
    + dim(state, "guidelineHabit") * 0.15
    + personaProofScore(state, "guideline") * 0.45;
}

function personaProofScore(state: MutableClinicalState, proof: string) {
  const count = dim(state, `clinicalProof_${proof}`);
  return Math.min(count, 3) * 10 + Math.max(0, count - 3) * 2;
}

function hasAny(state: MutableClinicalState, flags: string[]) {
  return flags.some((flag) => state.flags.includes(flag));
}

function semesterKey(index: number) {
  return ["y1s1", "y1s2", "y2s1", "y2s2", "y3s1", "y3s2", "y4s1", "y4s2", "y5s1", "y5s2"][index];
}

function dim(state: MutableClinicalState, key: string) { return Number(state.hiddenStats[key] ?? 0); }
function add(bag: Record<string, number>, key: string, value: number) { bag[key] = Number(bag[key] ?? 0) + value; }
function pushUnique<T>(list: T[], item: T) { if (!list.includes(item)) list.push(item); }
function clamp(value: number) { return Math.max(0, Math.min(100, Math.round(value))); }
function stableIndex(value: number, length: number) { return (stableHash(String(value)) >>> 0) % length; }
function stableHash(value: string) {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}
function simpleHash(value: string) { return stableHash(value).toString(36); }
