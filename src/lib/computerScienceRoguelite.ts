export type CSRouteKey = "algorithm" | "project" | "job" | "lab" | "product" | "opensource" | "survival";

export type CSArchive = {
  runs: number;
  routes: string[];
  personas: string[];
  experiences: string[];
};

type MutableCSState = {
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

type CSGameLike = MutableCSState & {
  history: Array<{ semester: string; title: string; choice: string; feedback: string }>;
  semesterIdx: number;
};

export const EMPTY_CS_ARCHIVE: CSArchive = { runs: 0, routes: [], personas: [], experiences: [] };

export const CS_MEMORIES = [
  { id: "cs_error_archive", title: "记得先看第一处报错", description: "开局获得 6 点技术积累。" },
  { id: "cs_saved_demo", title: "保留一份真的能跑的旧版本", description: "开局获得 8 点项目机会。" },
  { id: "cs_route_map", title: "提前看过技术路线分岔", description: "现实规划倾向小幅提高。" },
] as const;

export const CS_START_TRAITS = [
  {
    id: "senior_notes",
    title: "学长把祖传资料包发给了你",
    description: "里面有课件、往年题和一个叫“最终版2真的不改了”的项目。你少走一点弯路，也提前看见了技术债。",
  },
  {
    id: "old_laptop",
    title: "你的电脑开风扇比开 IDE 快",
    description: "第一次跑项目，室友以为你要起飞。配置不够，排错耐心倒是被迫提前点亮。",
  },
  {
    id: "project_invite",
    title: "开学就被拉进了项目群",
    description: "你还没学会 Git，群里已经有人问“这个需求今晚能给吗”。机会来得很早，觉也少得很早。",
  },
  {
    id: "contest_group",
    title: "误入算法竞赛群",
    description: "别人还在问教材买哪本，群里已经在讨论这题为什么又超时。你暂时听不懂，但胜负欲先上线了。",
  },
] as const;

export function getCSStartTrait(id?: string | null) {
  return CS_START_TRAITS.find((trait) => trait.id === id) ?? null;
}

export const CS_ROUTE_DEFINITIONS = [
  { id: "algorithm", title: "算法竞赛线", ending: "动态规划没规划你的人生", summary: "你从第一道 Wrong Answer 开始，学会画状态、拆边界，也学会接受有些题今天就是做不出来。比赛名次不是每次都好看，但你已经能把复杂问题切成一组可执行步骤。", shareText: "我的计算机本科路线：动态规划没有规划好人生，但我真的学会了和边界条件谈判。" },
  { id: "project", title: "项目开发线", ending: "功能上线了，技术债也上线了", summary: "你做过能跑的第一版、演示前夜的紧急修复，也见过需求在截止日期前突然长出新功能。代码不总优雅，但你知道怎样把模糊需求变成一个真的能交付的东西。", shareText: "我的计算机本科结局：项目成功上线，技术债作为共同开发者一起署名。" },
  { id: "job", title: "大厂实习就业线", ending: "八股背会了，工位也真的有了", summary: "简历、算法题、项目追问和实习任务轮番面试你。你没有靠一张薪资截图上岸，而是靠能解释的项目、做过的取舍和一次次真实交付拿到入口。", shareText: "我的计算机本科结局：生活未必解释得清，缓存穿透已经能讲三种方案。" },
  { id: "lab", title: "考研实验室线", ending: "环境终于配好，论文又换版本了", summary: "你读过看不懂的论文，复现过作者电脑上能跑的代码，也在实验结果和考试范围之间来回切换。最后留下来的不只是学历路线，还有面对陌生问题时慢慢啃下去的能力。", shareText: "我的计算机本科结局：论文代码没一次跑通，科研耐心倒是成功复现了。" },
  { id: "product", title: "产品技术混合线", ending: "代码写少了，需求终于说人话了", summary: "你开始在写代码之前追问用户到底要什么，也能把技术限制翻译给不写代码的人。你没有离开技术，只是从完成模块走向了协调、拆解和交付。", shareText: "我的计算机本科结局：不再只修 Bug，开始追问这个需求为什么会出生。" },
  { id: "opensource", title: "开源贡献隐藏线", ending: "PR 被改了六轮，最后真的合并了", summary: "你从 README、issue 和第一处小修复进入陌生项目。维护者没有因为你是学生就自动鼓掌，但愿意认真看你的提交、指出问题，并最终把你的名字留进贡献记录。", shareText: "我的计算机本科隐藏结局：PR 改了六轮终于合并，第一次有人在陌生仓库里认真看完我的代码。" },
  { id: "survival", title: "面向搜索引擎生存线", ending: "不是什么都会，但知道去哪找答案", summary: "你碰过很多语言和框架，没有把每一项都练到专家级。项目出问题时，你会读报错、查文档、缩小范围，必要时也会开口求助。不是大神模板，但确实具备解决问题的基本盘。", shareText: "我的计算机本科结局：不会的很多，但出问题以后已经知道先搜什么、看哪里、问谁。" },
] as const;

export const CS_PERSONAS = [
  {
    id: "shipper", title: "代码能跑就别动型工程师",
    verdict: "你知道这段代码不优雅，也知道现在重构它，今晚就别睡了。先交付、留注释、下个版本再还债，是你对现实最稳定的尊重。",
    tags: ["交付优先", "重构延期", "风险控制"],
    shareText: "我的计算机人格：代码能跑就别动。技术债我看见了，DDL 也看见我了。",
    score: (s: MutableCSState) => personaScore(s, "deliveryFirst", "realityPlanning", "shipper"),
  },
  {
    id: "debugger", title: "报错信息考古学家",
    verdict: "别人看到红字先重启，你先往上翻三百行找第一处异常。你不保证一次修好，但很少让同一个错误换件衣服再回来。",
    tags: ["日志上翻", "第一现场", "原因优先"],
    shareText: "我的计算机人格：报错信息考古学家。最后一行负责吓人，第一处异常才负责破案。",
    score: (s: MutableCSState) => personaScore(s, "debugPatience", "technicalCuriosity", "debugger") * 0.78,
  },
  {
    id: "deadline", title: "截止日前赛博施法者",
    verdict: "你的开发周期只有两个阶段：还早，以及今晚必须能跑。项目总能在最后一刻恢复呼吸，代价是你的作息长期停留在测试环境。",
    tags: ["DDL 爆发", "极限交付", "作息测试版"],
    shareText: "我的计算机人格：截止日前赛博施法者。平时项目加载中，最后一晚突然拥有管理员权限。",
    score: (s: MutableCSState) => personaScore(s, "ddlBurst", null, "deadline")
      + Math.max(0, 45 - Number(s.stats.energy ?? 0)) * 0.5,
  },
  {
    id: "merger", title: "Git 冲突善后专员",
    verdict: "大家都说自己的模块没有问题，最后只有你在凌晨两点解决合并冲突。你不是天生爱接锅，只是无法看着主分支当场分裂。",
    tags: ["团队补位", "主分支急救", "冲突收尾"],
    shareText: "我的计算机人格：Git 冲突善后专员。所有人的代码都没问题，只有合起来以后项目没了。",
    score: (s: MutableCSState) => personaScore(s, "teamRepair", "responsibility", "merger"),
  },
  {
    id: "interview", title: "八股文条件反射选手",
    verdict: "生活里未必能解释自己的情绪，但缓存穿透你可以讲三种解决方案。招聘要求一更新，你的复习清单也会自动重新排序。",
    tags: ["面试雷达", "标准回答", "就业规划"],
    shareText: "我的计算机人格：八股文条件反射选手。问我最近怎么样会卡住，问 Redis 可以连续回答十分钟。",
    score: (s: MutableCSState) => personaScore(s, "interviewReflex", "realityPlanning", "interview"),
  },
  {
    id: "stack_tourist", title: "技术栈旅游博主",
    verdict: "你没有固定技术栈，只有一串“最近在学”。项目文件夹从前端逛到模型部署，每个都留下 README，少数留下了第二次提交。",
    tags: ["最近在学", "框架打卡", "项目待续"],
    shareText: "我的计算机人格：技术栈旅游博主。没有主修框架，只有一长串“最近在学”。",
    score: (s: MutableCSState) => personaScore(s, "stackTourism", "technicalCuriosity", "stack_tourist"),
  },
] as const;

export const CS_CORE_POOLS: Record<number, string[]> = {
  0: ["computer_science_y1s1_main_001", "computer_science_y1s1_main_002", "computer_science_y1s1_main_003"],
  1: ["computer_science_y1s2_main_004", "computer_science_y1s2_main_006"],
  2: ["computer_science_y2s1_main_007", "computer_science_y2s1_main_008", "computer_science_y2s1_main_009"],
  3: ["computer_science_y2s2_main_010", "computer_science_y2s2_main_012"],
  4: ["computer_science_y3s1_main_013", "computer_science_y3s1_main_014", "computer_science_y3s1_route_015"],
  5: ["computer_science_y3s2_route_016", "computer_science_y3s2_route_017", "computer_science_y3s2_main_018"],
  6: ["computer_science_y4s1_main_019", "computer_science_y4s1_route_020", "computer_science_y4s1_gg_021"],
  7: ["computer_science_y4s2_main_022"],
};

const IMPACTS: Record<string, any> = {
  "computer_science_y1s1_main_002:a": { tech: 5, persona: { debugPatience: 8, documentation: 5 }, routes: { lab: 2 }, flags: ["cs_docs_reader"], proof: "debugger" },
  "computer_science_y1s1_main_002:b": { tech: 1, persona: { copyPaste: 7, deliveryFirst: 4 }, routes: { survival: 3 }, proof: "shipper" },
  "computer_science_y1s1_main_002:c": { tech: 6, persona: { searchReliance: 6, debugPatience: 7 }, routes: { survival: 3, opensource: 1 }, flags: ["cs_read_error"], proof: "debugger" },
  "computer_science_y1s2_main_004:a": { tech: 8, persona: { engineeringCleanliness: 7, realityPlanning: 5 }, routes: { project: 5 }, proof: "shipper" },
  "computer_science_y1s2_main_004:b": { tech: 5, persona: { ddlBurst: 6, debugPatience: 4 }, routes: { project: 4 }, proof: "deadline" },
  "computer_science_y1s2_main_004:c": { tech: 2, persona: { copyPaste: 8, stackTourism: 5 }, routes: { survival: 4 }, flags: ["cs_stack_tour"], proof: "stack_tourist" },
  "computer_science_y2s1_main_007:a": { tech: 9, persona: { technicalCuriosity: 7, debugPatience: 5 }, routes: { algorithm: 7, lab: 2 }, proof: "debugger" },
  "computer_science_y2s1_main_007:b": { tech: 5, persona: { interviewReflex: 6 }, routes: { algorithm: 4, job: 2 }, proof: "interview" },
  "computer_science_y2s1_main_008:a": { tech: 9, persona: { debugPatience: 8, technicalCuriosity: 6 }, routes: { algorithm: 8 }, proof: "debugger" },
  "computer_science_y2s1_main_008:b": { tech: 3, persona: { searchReliance: 7, ddlBurst: 3 }, routes: { survival: 4 }, proof: "stack_tourist" },
  "computer_science_y2s1_main_008:d": { tech: 6, opportunity: 4, persona: { activeHelp: 7, ambiguityTolerance: 4 }, routes: { algorithm: 4, product: 2 }, proof: "merger" },
  "computer_science_y2s1_main_009:a": { tech: 7, opportunity: 5, persona: { deliveryFirst: 6, technicalCuriosity: 4 }, routes: { project: 8 }, flags: ["cs_project_finished"], proof: "shipper" },
  "computer_science_y2s1_main_009:c": { tech: 1, persona: { stackTourism: 8, presentation: 4 }, routes: { product: 3 }, flags: ["cs_stack_tour"], proof: "stack_tourist" },
  "computer_science_y2s2_main_012:a": { tech: 7, opportunity: 4, persona: { responsibility: 9, teamRepair: 8 }, routes: { project: 7, product: 3 }, flags: ["cs_merge_owner"], proof: "merger" },
  "computer_science_y2s2_main_012:b": { tech: 5, persona: { deliveryFirst: 5, responsibility: -3 }, routes: { project: 4, survival: 2 }, proof: "shipper" },
  "computer_science_y2s2_main_012:d": { tech: 5, persona: { ddlBurst: 10, teamRepair: 5 }, routes: { project: 5 }, proof: "deadline" },
  "computer_science_y3s1_main_013:b": { tech: 8, opportunity: 6, persona: { deliveryFirst: 6 }, routes: { project: 6, job: 4 }, flags: ["cs_project_finished"], proof: "shipper" },
  "computer_science_y3s1_main_013:c": { tech: 6, persona: { interviewReflex: 6 }, routes: { algorithm: 4, job: 5 }, proof: "interview" },
  "computer_science_y3s1_main_014:a": { tech: 5, opportunity: 4, persona: { realityPlanning: 8, requirementSense: 4 }, routes: { job: 6 }, proof: "interview" },
  "computer_science_y3s1_main_014:c": { opportunity: 9, persona: { activeHelp: 6, realityPlanning: 5 }, routes: { job: 7 }, proof: "interview" },
  "computer_science_y3s1_route_015:a": { tech: 6, opportunity: 8, persona: { interviewReflex: 7, realityPlanning: 5 }, routes: { job: 8 }, proof: "interview" },
  "computer_science_y3s1_route_015:b": { tech: 8, persona: { engineeringCleanliness: 7, debugPatience: 5 }, routes: { project: 7 }, proof: "debugger" },
  "computer_science_y3s1_route_015:c": { tech: 5, persona: { realityPlanning: 8 }, routes: { lab: 9 }, proof: "interview" },
  "computer_science_y3s1_route_015:d": { opportunity: 5, persona: { requirementSense: 8, expression: 7 }, routes: { product: 9 }, proof: "merger" },
  "computer_science_y3s2_route_016:a": { tech: 6, opportunity: 6, persona: { interviewReflex: 9 }, routes: { job: 10, algorithm: 4 }, proof: "interview" },
  "computer_science_y3s2_route_016:b": { tech: 7, persona: { documentation: 6, technicalCuriosity: 5 }, routes: { lab: 11 }, proof: "debugger" },
  "computer_science_y3s2_route_016:d": { tech: 4, opportunity: 6, persona: { requirementSense: 10, expression: 7 }, routes: { product: 11 }, proof: "merger" },
  "computer_science_y3s2_route_017:job": { tech: 5, opportunity: 7, persona: { interviewReflex: 9, realityPlanning: 6 }, routes: { job: 13 }, proof: "interview" },
  "computer_science_y3s2_route_017:postgrad": { tech: 7, persona: { documentation: 6, technicalCuriosity: 6 }, routes: { lab: 13 }, proof: "debugger" },
  "computer_science_y3s2_route_017:stable": { opportunity: 5, persona: { realityPlanning: 9 }, routes: { survival: 11 }, proof: "shipper" },
  "computer_science_y3s2_route_017:product": { tech: 4, opportunity: 6, persona: { requirementSense: 9, expression: 7 }, routes: { product: 13 }, proof: "merger" },
  "computer_science_y3s2_main_018:a": { tech: 5, persona: { ddlBurst: 9 }, routes: { project: 3 }, proof: "deadline" },
  "computer_science_y3s2_main_018:b": { persona: { deliveryFirst: 7, realityPlanning: 8 }, routes: { survival: 8 }, proof: "shipper" },
  "computer_science_y3s2_main_018:c": { persona: { requirementSense: 6, stackTourism: 4 }, routes: { product: 7, survival: 3 }, proof: "stack_tourist" },
  "computer_science_y4s1_main_019:a": { tech: 7, persona: { requirementSense: 7, deliveryFirst: 4 }, routes: { project: 7 }, proof: "shipper" },
  "computer_science_y4s1_main_019:b": { tech: 4, persona: { realityPlanning: 8, deliveryFirst: 7 }, routes: { survival: 5 }, proof: "shipper" },
  "computer_science_y4s1_main_019:d": { tech: 6, persona: { engineeringCleanliness: 9, ddlBurst: 5 }, routes: { project: 5 }, proof: "deadline" },
  "computer_science_random_001:a": { tech: 5, persona: { debugPatience: 6 }, routes: { project: 3 }, flags: ["cs_read_error"], proof: "debugger" },
  "computer_science_random_002:a": { tech: 4, persona: { documentation: 6, debugPatience: 4 }, routes: { project: 3 }, flags: ["cs_docs_reader"], proof: "debugger" },
  "computer_science_random_003:a": { tech: 4, persona: { responsibility: 7, teamRepair: 8 }, routes: { project: 4 }, flags: ["cs_merge_owner"], proof: "merger" },
  "computer_science_random_004:a": { tech: 6, persona: { technicalCuriosity: 6 }, routes: { algorithm: 5 }, proof: "debugger" },
  "computer_science_random_006:b": { tech: 3, persona: { ddlBurst: 9 }, routes: { project: 4 }, proof: "deadline" },
  "computer_science_random_008:a": { tech: 5, opportunity: 6, persona: { documentation: 8, technicalCuriosity: 7 }, routes: { opensource: 7 }, flags: ["cs_docs_reader", "cs_open_source_entry"], proof: "debugger" },
  "computer_science_random_009:a": { tech: 6, persona: { debugPatience: 6, documentation: 4 }, routes: { project: 3 }, flags: ["cs_read_error"], proof: "debugger" },
  "computer_science_hidden_001:a": { tech: 7, persona: { debugPatience: 8 }, routes: { project: 4 }, experiences: ["部署事故里找到了第一处真报错"], proof: "debugger" },
  "computer_science_hidden_002:a": { tech: 5, persona: { teamRepair: 9, responsibility: 8 }, routes: { project: 4, product: 3 }, experiences: ["第二次成为主分支急救员"], proof: "merger" },
  "computer_science_hidden_003:a": { opportunity: 4, persona: { stackTourism: 10 }, routes: { survival: 3 }, experiences: ["被面试官抽中了只学三天的框架"], proof: "stack_tourist" },
  "computer_science_hidden_004:a": { tech: 8, opportunity: 8, persona: { documentation: 8, technicalCuriosity: 7 }, routes: { opensource: 12 }, experiences: ["第一条开源 PR 收到认真回复"], flags: ["cs_pr_reviewed"], proof: "debugger" },
  "computer_science_hidden_005:a": { tech: 8, opportunity: 5, persona: { technicalCuriosity: 9 }, routes: { opensource: 10 }, experiences: ["陌生用户真的用上了你的小工具"], proof: "shipper" },
};

export function createCSRunState(state: MutableCSState, archive: CSArchive) {
  state.routeScores = { algorithm: 0, project: 0, job: 0, lab: 0, product: 0, opensource: 0, survival: 1 };
  state.specialExperiences = [];
  state.stats.technicalAccumulation = 22;
  state.stats.projectOpportunity = 16;
  for (const key of ["idealDrive", "realityPlanning", "stressTolerance", "ambiguityTolerance", "responsibility", "expression", "technicalCuriosity", "debugPatience", "deliveryFirst", "ddlBurst", "teamRepair", "interviewReflex", "stackTourism", "requirementSense", "documentation"]) {
    state.hiddenStats[key] ??= 50;
  }
  const runSeed = archive.runs || 1;
  state.hiddenStats.csRunSeed = runSeed;
  state.hiddenStats.csChoiceCount = 0;
  const trait = CS_START_TRAITS[(runSeed * 3 + 1) % CS_START_TRAITS.length];
  state.initialTrait = trait.id;
  applyCSStartTrait(state, trait.id);
}

export function applyCSChoiceLayer(state: MutableCSState, event: any, choice: any) {
  const effects = choice.effects ?? {};
  const impact = IMPACTS[`${event.id}:${choice.id ?? choice.choiceId}`] ?? {};
  state.routeScores ??= {};
  state.specialExperiences ??= [];

  const generatedTech = Math.max(0, Number(effects.majorStats?.projectExperience ?? 0)) + Math.max(0, -Number(effects.majorStats?.bugDebt ?? 0)) * 0.35;
  state.stats.technicalAccumulation = clamp(Number(state.stats.technicalAccumulation ?? 22) + generatedTech + Number(impact.tech ?? 0));
  state.stats.projectOpportunity = clamp(Number(state.stats.projectOpportunity ?? 16) + Number(impact.opportunity ?? 0));
  for (const [key, value] of Object.entries(impact.persona ?? {})) add(state.hiddenStats, key, Number(value));
  for (const [key, value] of Object.entries(impact.routes ?? {})) add(state.routeScores, key, Number(value));
  for (const flag of impact.flags ?? []) pushUnique(state.flags, flag);
  for (const experience of impact.experiences ?? []) pushUnique(state.specialExperiences, experience);
  if (impact.proof) add(state.hiddenStats, `csProof_${impact.proof}`, 1);

  for (const route of effects.routeAdd ?? []) {
    if (/job/.test(route)) add(state.routeScores, "job", 5);
    else if (/postgrad|stable/.test(route)) add(state.routeScores, "lab", 4);
    else if (/product|cross/.test(route)) add(state.routeScores, "product", 5);
    else if (/layflat/.test(route)) add(state.routeScores, "survival", 6);
  }
  if (typeof effects.transfer?.successRateDelta === "number") {
    add(state.hiddenStats, "transferChance", Number(effects.transfer.successRateDelta));
  }
  if (Number(effects.stats?.energy ?? 0) <= -10) add(state.hiddenStats, "ddlBurst", 2);
  if (Number(effects.majorStats?.bugDebt ?? 0) <= -3) add(state.hiddenStats, "debugPatience", 2);
  if (/文档|README|日志|报错/.test(`${event.title}${choice.text}`)) add(state.hiddenStats, "documentation", 2);
  if (/学长|学姐|老师|内推|实习|社区/.test(`${event.title}${choice.text}`)) state.stats.projectOpportunity = clamp(state.stats.projectOpportunity + 3);
  if (/最后|通宵|极限|延期|明天的自己|满线程/.test(choice.text)) {
    add(state.hiddenStats, "ddlBurst", 8);
    add(state.hiddenStats, "csProof_deadline", 1);
  }
  if (/搜索|题解|GitHub|框架|技术栈|跨考/.test(choice.text)) {
    add(state.hiddenStats, "stackTourism", 7);
    add(state.hiddenStats, "csProof_stack_tourist", 1);
  }
  if (/最小可交付|确保能交付|只修关键|功能范围/.test(choice.text)) {
    add(state.hiddenStats, "deliveryFirst", 7);
    add(state.hiddenStats, "csProof_shipper", 1);
  }

  state.hiddenStats.csChoiceCount = Number(state.hiddenStats.csChoiceCount ?? 0) + 1;
  state.pendingTrend = state.hiddenStats.csChoiceCount % 3 === 0 ? deriveTrend(state) : null;
}

export function pickCSCoreEvent(state: MutableCSState & { semesterIdx: number }) {
  const pool = CS_CORE_POOLS[state.semesterIdx] ?? [];
  const unseen = pool.filter((id) => !state.seenEvents.includes(id));
  if (!unseen.length) return null;
  const seed = Number(state.hiddenStats.csRunSeed ?? 1) * 17 + state.semesterIdx * 11 + state.seenEvents.length;
  return unseen[seed % unseen.length];
}

export function pickCSCallbackEvent(state: MutableCSState & { semesterIdx: number }) {
  const candidates: string[] = [];
  if (state.semesterIdx >= 3 && state.flags.includes("cs_read_error")) candidates.push("computer_science_hidden_001");
  if (state.semesterIdx >= 4 && state.flags.includes("cs_merge_owner")) candidates.push("computer_science_hidden_002");
  if (state.semesterIdx >= 6 && state.flags.includes("cs_stack_tour")) candidates.push("computer_science_hidden_003");
  if (
    state.semesterIdx >= 5
    && state.flags.includes("cs_docs_reader")
    && (state.flags.includes("cs_project_finished") || state.flags.includes("cs_open_source_entry"))
  ) candidates.push("computer_science_hidden_004");
  if (
    state.semesterIdx >= 5
    && Number(state.stats.technicalAccumulation ?? 0) >= 55
    && Number(state.hiddenStats.technicalCuriosity ?? 0) >= 65
  ) candidates.push("computer_science_hidden_005");
  return candidates.find((id) => !state.seenEvents.includes(id)) ?? null;
}

export function shouldDrawCSOptional(state: MutableCSState & { semesterIdx: number }) {
  if (state.semesterIdx >= 7) return false;
  const runSeed = Number(state.hiddenStats.csRunSeed ?? 1);
  const firstSkip = stableIndex(runSeed * 17 + 3, 7);
  let secondSkip = stableIndex(runSeed * 31 + 5, 7);
  if (secondSkip === firstSkip) secondSkip = (secondSkip + 3) % 7;
  return state.semesterIdx !== firstSkip && state.semesterIdx !== secondSkip;
}

export function shouldFollowCSEvent(state: MutableCSState & { semesterEventCount?: number }, next: any) {
  if (!next) return false;
  if (next.id === "computer_science_y4s2_final_023") return true;
  if (
    next.type === "transfer"
    && (
      next.id === "computer_science_y2s2_transfer_011"
      || next.id.startsWith("computer_science_transfer_apply")
    )
  ) return true;
  return (state.semesterEventCount ?? 0) < 2 && next.type === "hidden";
}

export function resolveCSEvent(state: MutableCSState, event: any) {
  if (event?.id !== "computer_science_transfer_apply_003") return event;
  const score = Number(state.hiddenStats.transferChance ?? 35)
    + Number(state.stats.gpaWill ?? 0) * 0.16
    + Number(state.stats.technicalAccumulation ?? 0) * 0.1
    + Number(state.stats.projectOpportunity ?? 0) * 0.08
    + Number(state.hiddenStats.realityPlanning ?? 0) * 0.08;
  const success = score >= 66;
  const source = (event.choices ?? event.options ?? []).find((choice: any) => choice.id === (success ? "success" : "fail"));
  if (!source) return event;
  const resolved = {
    ...source,
    text: "打开转专业结果通知",
    feedback: success
      ? "申请通过。你不是被一次报错劝退，而是查过规则、补过材料，也算清了离开的成本。第二条时间线正式开始加载。"
      : "名单里没有你的名字。名额、绩点和准备程度一起返回了失败，但这次不是口头跑路，你真的把申请推到了结果页。",
  };
  return { ...event, options: [resolved], choices: [resolved] };
}

export function deriveCSResult(game: CSGameLike) {
  const route = deriveRoute(game);
  const persona = [...CS_PERSONAS].sort((a, b) => b.score(game) - a.score(game))[0];
  const experiences = deriveExperiences(game);
  const reasons = deriveReasons(game, route.id, persona.id);
  return {
    route,
    persona,
    experiences,
    reasons,
    viralStats: [
      { label: "看到红字后的冷静时间", value: clamp(dim(game, "debugPatience")) },
      { label: "DDL 前爆发系数", value: clamp(dim(game, "ddlBurst")) },
      { label: "替队友修 Bug 概率", value: clamp((dim(game, "teamRepair") + dim(game, "responsibility")) / 2) },
    ],
    story: buildStory(game, route, persona),
    lockedHint: deriveLockedHint(game, route.id),
    replayChallenge: deriveReplayChallenge(game, route.id),
    fit: deriveFit(game, route.id),
  };
}

export function archiveCSResult(archive: CSArchive, result: ReturnType<typeof deriveCSResult>): CSArchive {
  return {
    runs: archive.runs,
    routes: unique([...archive.routes, result.route.id]),
    personas: unique([...archive.personas, result.persona.id]),
    experiences: unique([...archive.experiences, ...result.experiences.map((item) => item.title)]),
  };
}

function deriveRoute(state: MutableCSState) {
  const ranked = CS_ROUTE_DEFINITIONS
    .map((route) => ({ route, score: routeScore(state, route.id) }))
    .filter(({ route }) => route.id !== "opensource" || state.flags.includes("cs_pr_reviewed"))
    .sort((a, b) => b.score - a.score);
  return ranked[0]?.score > 0 ? ranked[0].route : CS_ROUTE_DEFINITIONS.find((route) => route.id === "survival")!;
}

function deriveExperiences(game: CSGameLike) {
  const items = (game.specialExperiences ?? []).map((title) => ({ id: `cs_${simpleHash(title)}`, title }));
  const candidates = [
    [game.flags.includes("cs_project_finished"), "first_project", "第一个项目真的跑出了 localhost"],
    [game.flags.includes("cs_merge_owner"), "merge_owner", "主分支凌晨急救员"],
    [game.flags.includes("cs_pr_reviewed"), "pr_review", "第一条开源 PR 收到回复"],
    [game.routes.some((route) => /job/.test(route)), "internship", "简历第一次离开草稿箱"],
    [Number(game.stats.energy ?? 0) <= 30, "low_battery", "低电量完成最终交付"],
  ] as const;
  for (const [hit, id, title] of candidates) if (hit && !items.some((item) => item.id === id)) items.push({ id, title });
  return items.slice(0, 6);
}

function deriveReasons(game: CSGameLike, routeId: string, personaId: string) {
  const reasons: string[] = [];
  const proofLabels: Record<string, string> = {
    shipper: "你多次先保可运行版本，再决定技术债什么时候偿还。",
    debugger: "面对报错时，你更常查看日志、缩小范围，而不是只靠重启碰运气。",
    deadline: "你多次在高压和低电量下完成最后交付，DDL 爆发倾向明显。",
    merger: "团队出问题时，你经常接下整合、沟通或最后合并工作。",
    interview: "你持续把项目和学习转成简历、面试与现实入口。",
    stack_tourist: "你接触过多套技术和工具，也留下了数次没有继续深挖的记录。",
  };
  reasons.push(proofLabels[personaId]);
  const decisive = game.history.filter((item) => /报错|项目|算法|实习|路线|Git|毕设/.test(item.title));
  for (const item of decisive.slice(-2)) reasons.push(`在“${item.title}”里，你选择了“${item.choice}”。`);
  const routeName = CS_ROUTE_DEFINITIONS.find((route) => route.id === routeId)?.title;
  reasons.push(`四年里，你给“${routeName}”投入的技术积累、机会和关键选择最多。`);
  reasons.push(`结算时保有 ${Math.round(game.stats.technicalAccumulation ?? 0)} 点技术积累、${Math.round(game.stats.projectOpportunity ?? 0)} 点项目机会。`);
  return reasons.filter(Boolean).slice(0, 4);
}

function buildStory(game: CSGameLike, route: (typeof CS_ROUTE_DEFINITIONS)[number], persona: (typeof CS_PERSONAS)[number]) {
  const byYear = [0, 1, 2, 3].map((year) => game.history.filter((_, index) => {
    const semesterText = game.history[index]?.semester ?? "";
    return semesterText.includes(`大${["一", "二", "三", "四"][year]}`);
  }));
  return [
    { year: "大一", text: `${byYear[0][0]?.title ?? "第一行代码没有顺利运行"}。你没有立刻成为工程师，先形成了“${persona.title}”的早期习惯。` },
    { year: "大二", text: `数据结构、项目协作和方向选择开始同时出现。你把技术积累推进到 ${Math.round(game.stats.technicalAccumulation ?? 0)}。` },
    { year: "大三", text: `比赛、实验室、项目和实习开始争夺同一份时间，你逐渐把资源押向“${route.title}”。` },
    { year: "大四", text: `${route.summary}` },
  ];
}

function deriveLockedHint(game: CSGameLike, routeId: string) {
  if (routeId !== "opensource" && !game.flags.includes("cs_pr_reviewed")) return "有一条开源支线还没合并：它需要读文档、完成可运行项目，并在社区事件里留下真实修复。";
  if (routeId !== "algorithm" && routeScore(game, "algorithm") < 8) return "动态规划训练营还留着一个位置。下一局可以更早亲手拆边界，而不是只收藏题解。";
  if (routeId !== "product" && dim(game, "requirementSense") < 65) return "有一次需求沟通被你当成了纯技术问题。下一局先问清楚为什么做，再决定怎么写。";
  return "还有一些事故只会在特定构筑下出现：同一个报错习惯，可能把你送进完全不同的路线。";
}

function deriveReplayChallenge(game: CSGameLike, routeId: string) {
  if (dim(game, "responsibility") >= 68) return "上一局你又成了整合负责人。这次不要替失联队友完成最后合并。";
  if (routeId === "job") return "上一局走了就业线。这次不背八股，试着靠一个真正完成的项目打开路线。";
  if (routeId === "project") return "上一局功能优先。这次认真读文档、找根因，尝试打开开源隐藏线。";
  if (routeId === "opensource") return "上一局 PR 已合并。这次完全不碰社区，看看本地项目会把你送到哪里。";
  return "下一局使用与你本局相反的排错习惯，至少完成一个没见过的特殊经历。";
}

function deriveFit(game: CSGameLike, routeId: string) {
  const debug = dim(game, "debugPatience");
  const curiosity = dim(game, "technicalCuriosity");
  const planning = dim(game, "realityPlanning");
  const strengths = [
    debug >= 62 ? "你能在报错和反复失败里维持排查顺序。" : "你更擅长借助搜索、同伴和现成工具快速推进。",
    curiosity >= 62 ? "面对陌生系统，你愿意继续追问它为什么这样运行。" : "你对技术本身未必上头，但能围绕具体目标完成交付。",
  ];
  const risks = dim(game, "ddlBurst") >= 65
    ? "你太依赖最后阶段爆发，复杂项目会把这种侥幸放大成真实风险。"
    : "需要警惕路线过多、项目过散，最后每项都只能写在技能栏第一行。";
  const direction = CS_ROUTE_DEFINITIONS.find((route) => route.id === routeId)?.title ?? "继续探索";
  return { strengths, risks, direction: `${direction}；现实规划值 ${Math.round(planning)}，适合继续用真实项目验证。` };
}

function deriveTrend(state: MutableCSState) {
  const ranked = [
    ["项目开始能交付", routeScore(state, "project")],
    ["算法训练正在加深", routeScore(state, "algorithm")],
    ["就业准备明显升温", routeScore(state, "job")],
    ["实验室路线逐渐清晰", routeScore(state, "lab")],
    ["沟通与产品倾向上升", routeScore(state, "product")],
    ["搜索引擎生存能力稳定", routeScore(state, "survival")],
  ].sort((a, b) => Number(b[1]) - Number(a[1]));
  return String(ranked[0][0]);
}

function proof(state: MutableCSState, id: string) {
  return Number(state.hiddenStats[`csProof_${id}`] ?? 0);
}

function personaScore(
  state: MutableCSState,
  primary: string,
  secondary: string | null,
  proofId: string,
) {
  const primaryGrowth = Math.max(0, dim(state, primary) - 50);
  const secondaryGrowth = secondary ? Math.max(0, dim(state, secondary) - 50) : 0;
  const evidence = Math.min(3, proof(state, proofId));
  return primaryGrowth * 1.1 + secondaryGrowth * 0.65 + evidence * 14;
}

function dim(state: MutableCSState, key: string) {
  return Number(state.hiddenStats[key] ?? 50);
}

function routeScore(state: MutableCSState, key: string) {
  return Number(state.routeScores?.[key] ?? 0);
}

function applyCSStartTrait(state: MutableCSState, traitId: string) {
  state.routeScores ??= {};
  if (traitId === "senior_notes") {
    state.stats.technicalAccumulation = clamp(Number(state.stats.technicalAccumulation ?? 22) + 4);
    add(state.hiddenStats, "documentation", 7);
    add(state.routeScores, "survival", 3);
    pushUnique(state.flags, "cs_docs_reader");
  } else if (traitId === "old_laptop") {
    state.stats.energy = clamp(Number(state.stats.energy ?? 70) - 4);
    add(state.hiddenStats, "debugPatience", 8);
    add(state.routeScores, "survival", 4);
  } else if (traitId === "project_invite") {
    state.stats.projectOpportunity = clamp(Number(state.stats.projectOpportunity ?? 16) + 8);
    state.stats.energy = clamp(Number(state.stats.energy ?? 70) - 5);
    add(state.hiddenStats, "deliveryFirst", 6);
    add(state.routeScores, "project", 5);
  } else if (traitId === "contest_group") {
    state.stats.technicalAccumulation = clamp(Number(state.stats.technicalAccumulation ?? 22) + 5);
    add(state.hiddenStats, "technicalCuriosity", 7);
    add(state.routeScores, "algorithm", 6);
  }
}

function stableIndex(seed: number, size: number) {
  const mixed = Math.imul(seed ^ (seed >>> 16), 2246822519) >>> 0;
  return mixed % size;
}

function add(bag: Record<string, number>, key: string, value: number) {
  bag[key] = Number(bag[key] ?? 0) + value;
}

function pushUnique<T>(items: T[], value: T) {
  if (!items.includes(value)) items.push(value);
}

function unique<T>(items: T[]) {
  return [...new Set(items)];
}

function clamp(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function simpleHash(value: string) {
  let hash = 0;
  for (const character of value) hash = (hash * 31 + character.charCodeAt(0)) >>> 0;
  return hash.toString(36);
}
