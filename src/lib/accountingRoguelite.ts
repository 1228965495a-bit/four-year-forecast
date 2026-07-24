import {
  ACCOUNTING_HIDDEN_EVENTS,
  ACCOUNTING_RANDOM_EVENTS,
  ACCOUNTING_ROUTE_EVENTS,
  type AccountingRouteKey,
} from "@/data/script/byMajor/accounting.roguelite.events";
import { annotateEventPool, humorTypeRepeatPenalty } from "./eventCopyQuality";

const ACCOUNTING_OPTIONAL_COPY_POOL = annotateEventPool(
  [...ACCOUNTING_ROUTE_EVENTS, ...ACCOUNTING_RANDOM_EVENTS],
  "accounting",
);

type AccountingState = {
  stats: Record<string, number>;
  hiddenStats: Record<string, number>;
  flags: string[];
  routeScores?: Record<string, number>;
  specialExperiences?: string[];
  seenEvents: string[];
  semesterIdx?: number;
  semesterEventCount?: number;
  pendingTrend?: string | null;
  initialTrait?: string | null;
};

type AccountingGame = AccountingState & {
  history: Array<{ semester: string; title: string; choice: string; feedback: string }>;
};

export const ACCOUNTING_MEMORIES = [
  { id: "accounting_saved_checklist", title: "带走一份会自己报错的检查表", description: "开局获得 6 点专业积累。" },
  { id: "accounting_saved_contact", title: "保留一个愿意补材料的联系人", description: "开局获得 8 点实务机会。" },
  { id: "accounting_route_sheet", title: "提前看过一次会计出口表", description: "开局知道证书、实习和岗位不能同时拉满。" },
] as const;

export const ACCOUNTING_START_TRAITS = [
  { id: "calculator", title: "你从小对数字比较敏感", description: "心算很快。开学后会计学会通知你，算得快和判断借贷是两回事。" },
  { id: "excel", title: "你提前学过一点Excel", description: "你会筛选和SUM，暂时还不知道公式少拖一行能让整张表非常自信地出错。" },
  { id: "stable", title: "家里说会计稳定又好就业", description: "稳定滤镜已经到账，月结、证书和岗位代码正在排队申请解释权。" },
  { id: "adjusted", title: "你是被调剂进会计学的", description: "别人讨论四大，你先查转专业要看绩点还是名额。第一节课还没上，退出条件先背熟了。" },
] as const;

export function getAccountingStartTrait(id?: string | null) {
  return ACCOUNTING_START_TRAITS.find((trait) => trait.id === id) ?? null;
}

export const ACCOUNTING_ROUTE_DEFINITIONS = [
  { id: "audit", title: "会计师事务所审计线", ending: "客户说资料齐了，文件夹没有同意", summary: "你追过凭证、补过索引，也在盘点差异前忍住了替所有人下结论。最后留下的不只是底稿，还有每个数字能回到哪里的路径。", shareText: "我的会计结局：客户说资料齐了，我的缺失清单说还差四份。" },
  { id: "enterprise", title: "企业财务实务线", ending: "月末关了，缺的签字还没到", summary: "你听过很多次“先帮我过，下午补签”。后来每张没签字的单都单独列着，谁也不能靠一句“之前都这样”让它凭空完整。", shareText: "我的会计结局：月末可以提前，缺的签字不能靠意念补齐。" },
  { id: "cpa", title: "CPA考证与深造线", ending: "计划改到第七版，终于有一科真的学完", summary: "第一版计划写着四科全过，第三版删到两科，第七版只剩一门。准考证打印出来时，至少这门网课的进度条终于到了 100%。", shareText: "我的会计结局：证书计划改到第七版，终于不再使用另一套二十四小时。" },
  { id: "tax", title: "税务与合规线", ending: "一句应该可以，被你补成半页前提", summary: "每次有人问“这样能不能做”，你先把合同、发票、付款截图摊开。缺一张就写缺一张，去年的表也老老实实标着去年。", shareText: "我的会计结局：业务问能不能，我先问资料到底齐没齐。" },
  { id: "analysis", title: "财务分析与管理会计线", ending: "图少了一张，终于有人知道问题在哪", summary: "你做过五色图表，也被问过“所以呢”。后来利润涨而现金没来时，你能指出两笔应收没回、一批货还压在仓库。", shareText: "我的会计结局：表做平只是开场，我还得解释钱到底卡在哪。" },
  { id: "civil", title: "考公考编稳定线", ending: "先看专业代码，再看岗位名字", summary: "你把上岸经验帖换成了专业目录、报名日期和备选岗位。稳定没有自动发放，只是每次系统关闭前，你都知道自己还差哪份材料。", shareText: "我的会计结局：别人先看岗位名，我先看专业代码认不认会计学。" },
  { id: "survival", title: "数字万金油生存线", ending: "没做财务卷王，合计行还是会先看", summary: "你的工牌上没写财务。可运营群一发新表，你还是先问取消订单算没算、合计行包没包含最后一行。四年会计以一种很难卸载的方式留了下来。", shareText: "我的会计结局：财务没做成主业，对账习惯成功跟了一辈子。" },
] as const;

export const ACCOUNTING_PERSONAS = [
  {
    id: "balance", title: "借贷平衡强迫症患者",
    verdict: "别人看到差一分钱会说算了，你会先怀疑公式、格式、舍入和整张表的人生。",
    tags: ["合计行报警", "差额拒绝失踪", "借贷必须见面"],
    shareText: "我的会计人格是借贷平衡强迫症患者：事情可以没结果，合计行不能对不上。",
    score: (s: AccountingState) => personaScore(s, "reviewPatience", "formulaReview", "balance"),
  },
  {
    id: "timeline", title: "凭证时间线侦探",
    verdict: "大家都说这笔没问题，你已经开始追问合同、发票、付款和入账分别是哪一天。",
    tags: ["原件先到场", "日期逐项对质", "聊天记录考古"],
    shareText: "我的会计人格是凭证时间线侦探：总数可以晚点看，原始材料必须先到场。",
    score: (s: AccountingState) => personaScore(s, "sourceTracing", "riskSensitivity", "timeline"),
  },
  {
    id: "excel", title: "Excel回魂术士",
    verdict: "表格到了你手里通常还能抢救，只是救回来以后，没人记得它最开始是谁做坏的。",
    tags: ["公式急救", "版本辨认", "透视表召回"],
    shareText: "我的会计人格是Excel回魂术士：表能救回来，做表的人未必还能开机。",
    score: (s: AccountingState) => personaScore(s, "excelSkill", "formulaReview", "excel"),
  },
  {
    id: "closer", title: "截止日前关账人",
    verdict: "你的工作周期只有两个阶段：还没到月末，以及今晚必须把账关掉。",
    tags: ["截止日前爆发", "最终版增殖", "睡眠待摊"],
    shareText: "我的会计人格是截止日前关账人：白天相信计划，晚上相信筛选、公式和奇迹。",
    score: (s: AccountingState) => personaScore(s, "deliveryFirst", "stressTolerance", "closer"),
  },
  {
    id: "note", title: "风险备注型选手",
    verdict: "别人问能不能做，你先回答：在资料完整、口径确认且没有其他情况的前提下。",
    tags: ["前提条件加长", "缺失资料标黄", "口头承诺过敏"],
    shareText: "我的会计人格是风险备注型选手：一句应该可以，能被我补成半页前提。",
    score: (s: AccountingState) => personaScore(s, "riskSensitivity", "riskNote", "note"),
  },
  {
    id: "team", title: "财务群聊善后专员",
    verdict: "每个人都说自己的表没问题，最后只有你在问：那总表为什么差三百二十七块六？",
    tags: ["失联组员追踪", "格式统一执法", "总表最后接盘"],
    shareText: "我的会计人格是财务群聊善后专员：大家完成自己的部分，我证明它们不是不同世界。",
    score: (s: AccountingState) => personaScore(s, "teamBackup", "communication", "team"),
  },
] as const;

const CORE_IDS = [
  "accounting_core_01_entry", "accounting_core_02_difference", "accounting_core_03_judgment", "accounting_core_04_fork",
  "accounting_core_05_route", "accounting_core_06_materials", "accounting_core_07_conflict", "accounting_core_08_finish",
];

export function createAccountingRunState(state: AccountingState, runNumber: number) {
  state.routeScores = Object.fromEntries(ACCOUNTING_ROUTE_DEFINITIONS.map((route) => [route.id, route.id === "survival" ? 1 : 0]));
  state.specialExperiences = [];
  state.stats.energy = 78;
  state.stats.accountingKnowledge = 20;
  state.stats.practicalOpportunity = 15;
  for (const key of [
    "idealDrive", "realityPlanning", "stressTolerance", "ambiguityTolerance", "responsibility", "communication",
    "reviewPatience", "riskSensitivity", "sourceTracing", "excelSkill", "formulaReview", "businessSense",
    "deliveryFirst", "riskNote", "activeHelp", "teamBackup", "examPlanning", "civilPlanning",
    "stablePreference", "boundarySense", "overResponsibility", "lowCostSurvival", "ruleResearch",
  ]) state.hiddenStats[key] ??= 50;
  const seed = Math.max(1, runNumber);
  state.hiddenStats.accountingRunSeed = seed;
  state.hiddenStats.accountingChoiceCount = 0;
  const trait = ACCOUNTING_START_TRAITS[(seed * 5 + 1) % ACCOUNTING_START_TRAITS.length];
  state.initialTrait = trait.id;
  applyStartTrait(state, trait.id);
}

export function applyAccountingChoiceLayer(state: AccountingState, _event: any, choice: any) {
  const impact = choice.accounting ?? {};
  state.routeScores ??= {};
  state.specialExperiences ??= [];
  state.stats.accountingKnowledge = clamp(Number(state.stats.accountingKnowledge ?? 20) + Number(impact.knowledge ?? 0));
  state.stats.practicalOpportunity = clamp(Number(state.stats.practicalOpportunity ?? 15) + Number(impact.opportunity ?? 0));
  for (const [key, value] of Object.entries(impact.traits ?? {})) add(state.hiddenStats, key, Number(value));
  for (const [key, value] of Object.entries(impact.routes ?? {})) add(state.routeScores, key, Number(value));
  for (const flag of impact.flags ?? []) pushUnique(state.flags, flag);
  for (const route of impact.closes ?? []) pushUnique(state.flags, `accounting_closed_${route}`);
  for (const title of impact.experiences ?? []) pushUnique(state.specialExperiences, title);
  if (impact.proof) add(state.hiddenStats, `accountingProof_${impact.proof}`, 1);
  state.hiddenStats.accountingChoiceCount = Number(state.hiddenStats.accountingChoiceCount ?? 0) + 1;
  state.pendingTrend = state.hiddenStats.accountingChoiceCount % 3 === 0 ? deriveTrend(state) : null;
}

export function pickAccountingCoreEvent(state: AccountingState) {
  const id = CORE_IDS[Number(state.semesterIdx ?? 0)];
  return id && !state.seenEvents.includes(id) ? id : null;
}

export function shouldDrawAccountingOptional(state: AccountingState) {
  if (Number(state.semesterIdx ?? 0) >= 7) return false;
  const seed = Number(state.hiddenStats.accountingRunSeed ?? 1);
  const skips = new Set<number>();
  for (let salt = 0; skips.size < 2; salt += 1) skips.add(stableIndex(seed * 37 + salt * 23, 7));
  return !skips.has(Number(state.semesterIdx ?? 0));
}

export function pickAccountingOptionalEvent(state: AccountingState) {
  const semester = semesterKey(Number(state.semesterIdx ?? 0));
  const committed = committedRoute(state);
  const candidates = ACCOUNTING_OPTIONAL_COPY_POOL
    .filter((event) => !state.seenEvents.includes(event.id))
    .filter((event) => event.semester === null || event.semester === semester)
    .filter((event) => event.routeIds.every((route) => !state.flags.includes(`accounting_closed_${route}`)))
    .filter((event) => event.routeIds.length === 0 || event.routeIds.some((route) => Number(state.routeScores?.[route] ?? 0) >= 4));
  if (!candidates.length) return null;
  const seed = Number(state.hiddenStats.accountingRunSeed ?? 1);
  return candidates.map((event) => ({
    event,
    score: (event.weight
      + Math.max(0, ...event.routeIds.map((route) => Number(state.routeScores?.[route] ?? 0))) * 1.7
      + (committed && event.routeIds.includes(committed) ? 30 : 0)
      + stableIndex(seed * 101 + Number(state.semesterIdx ?? 0) * 41 + stableHash(event.id), 17))
      * humorTypeRepeatPenalty(ACCOUNTING_OPTIONAL_COPY_POOL, state.seenEvents, event),
  })).sort((a, b) => b.score - a.score)[0].event.id;
}

export function pickAccountingCallbackEvent(state: AccountingState) {
  if (state.seenEvents.filter((id) => id.startsWith("accounting_hidden_")).length >= 2) return null;
  const semester = Number(state.semesterIdx ?? 0);
  const candidates: Array<[boolean, string]> = [
    [semester >= 5 && (state.flags.includes("accounting_entry_understand") || state.flags.includes("accounting_exam_continued")), "accounting_hidden_entry_callback"],
    [semester >= 6 && state.flags.includes("accounting_diff_formula") && state.flags.includes("accounting_real_excel"), "accounting_hidden_difference_callback"],
    [semester >= 6 && state.flags.includes("accounting_audit_anomaly"), "accounting_hidden_audit_anomaly"],
    [semester >= 6 && state.flags.includes("accounting_diff_formula") && dim(state, "excelSkill") >= 64, "accounting_hidden_excel_template"],
    [semester >= 6 && state.flags.includes("accounting_analysis_reason") && state.flags.includes("accounting_analysis_business"), "accounting_hidden_analysis_turn"],
    [semester >= 6 && state.flags.includes("accounting_tax_materials") && state.flags.includes("accounting_tax_timeline"), "accounting_hidden_tax_entry"],
    [semester >= 7 && state.flags.includes("accounting_cross_skill"), "accounting_hidden_cross_skill"],
    [semester >= 7 && dim(state, "boundarySense") >= 63 && dim(state, "lowCostSurvival") >= 58, "accounting_hidden_lowcost"],
  ];
  return candidates.find(([hit, id]) => hit && ACCOUNTING_HIDDEN_EVENTS.some((event) => event.id === id) && !state.seenEvents.includes(id))?.[1] ?? null;
}

export function shouldFollowAccountingEvent(state: AccountingState, next: any) {
  return Boolean(next && next.type === "hidden" && Number(state.semesterEventCount ?? 0) < 3);
}

export function resolveAccountingEvent(state: AccountingState, event: any) {
  if (!event) return event;
  if (event.id === "accounting_core_06_materials") {
    const description = state.flags.includes("accounting_entry_understand")
      ? "大一你画过谁拿货、谁欠钱。现在合同在文件夹A，发票在群聊，付款截图藏在语音后面，箭头又得画一次。"
      : state.flags.includes("accounting_entry_memorize")
        ? "大一背熟的科目方向还在，这次经办人却只发了一段语音，连“现购”还是“赊购”都没说。"
        : state.flags.includes("accounting_entry_pair")
          ? "大一你和同桌争了十分钟谁欠谁。现在合同、发票和付款截图互不相邻，又得先把这件事讲成人话。"
          : "大一找一道长得像的例题还能交作业。现在六个文件夹里没有一份叫“标准答案”，只有三个“最终版”。";
    return { ...event, description };
  }
  if (event.id === "accounting_core_07_conflict") {
    const memory = state.flags.includes("accounting_diff_formula")
      ? "大一下那张表少算最后一行，只差两块。如今秋招、备考、实习和论文一起挤进日历，少掉的是整晚睡眠。"
      : state.flags.includes("accounting_diff_trace")
        ? "大一下你为两块钱翻完十七张凭证、错过晚饭。如今四件大事一起截止，食堂都不够你错过四次。"
        : state.flags.includes("accounting_diff_team")
          ? "大一下你让组员各查明细，第四个人直接失联。如今四个群同时催命，至少先决定退出哪个群。"
          : "大一下你准时交了表，把两块差额写进备注。如今四件事同时截止，备注栏已经不够装。";
    return { ...event, description: memory };
  }
  if (event.id === "accounting_hidden_entry_callback" && state.flags.includes("accounting_exam_continued") && !state.flags.includes("accounting_entry_understand")) {
    const choice = event.options[0];
    const nextChoice = {
      ...choice,
      text: "保留一门主科，把延期写进下一版",
      feedback: "准考证打印出来时，其他三科还躺在计划表里。你没实现一年全过，但这门终于不是收藏夹里的网课。",
      accounting: {
        ...choice.accounting,
        flags: ["accounting_callback_exam"],
        routes: { cpa: 10 },
        experiences: ["连续两学期执行证书计划"],
        proof: "closer",
      },
    };
    return {
      ...event,
      title: "证书计划第五版终于走到考试日",
      description: "大二你删过科目，大三又为期末停过网课。这次计划表上不是“今年全过”，而是一门真的复习到最后的主科。",
      options: [nextChoice],
      choices: [nextChoice],
    };
  }
  return event;
}

export function deriveAccountingResult(game: AccountingGame) {
  const route = deriveRoute(game);
  const persona = [...ACCOUNTING_PERSONAS].sort((a, b) => b.score(game) - a.score(game))[0];
  const experiences = deriveExperiences(game);
  return {
    route,
    persona,
    experiences,
    reasons: [
      `四年里，你在“${route.title}”相关的事上花掉了最多电量。`,
      `“${persona.title}”不是最后一题抽中的，前面的表格和群聊早就暴露了你。`,
      proofLine(persona.id),
    ],
    viralStats: [
      { label: "看到差额后的放弃速度", value: clamp(100 - dim(game, "reviewPatience")) },
      { label: "主动检查合计行概率", value: clamp((dim(game, "formulaReview") + dim(game, "riskSensitivity")) / 2) },
      { label: "替小组收总表概率", value: clamp((dim(game, "teamBackup") + dim(game, "overResponsibility")) / 2) },
    ],
    story: ["大一", "大二", "大三", "大四"].map((year) => {
      const row = [...game.history].reverse().find((item) => String(item.semester ?? "").startsWith(year));
      return { year, text: row ? `${row.title}：你选择了“${row.choice}”。` : "这一年没有留下完整记录。" };
    }),
    lockedHint: lockedHint(game, route.id),
    replayChallenge: replayChallenge(route.id),
    fit: {
      strengths: [
        dim(game, "riskSensitivity") >= 64 ? "合同、发票和付款日期对不上时，你不会靠一句“应该没事”跳过去。" : "别人发来三个最终版时，你通常能找出该用哪一个。",
        dim(game, "businessSense") >= 64 ? "你愿意继续追问数字为什么变化。" : "你对公式、差额和原始记录保持稳定警觉。",
      ],
      risks: dim(game, "overResponsibility") > dim(game, "boundarySense") + 8
        ? "你太容易变成默认收总表的人。下次合并前，先让每个人对自己的明细和公式签收。"
        : "去年的模板可能在今年过期，长得一样的业务也可能少一张关键单据。",
      direction: `${route.title}是本局最强倾向，但结果不替代真实培养方案、考试要求和职业咨询。`,
    },
  };
}

function deriveRoute(state: AccountingState) {
  return ACCOUNTING_ROUTE_DEFINITIONS
    .filter((route) => !state.flags.includes(`accounting_closed_${route.id}`))
    .map((route) => ({ route, score: Number(state.routeScores?.[route.id] ?? 0) }))
    .sort((a, b) => b.score - a.score)[0]?.route ?? ACCOUNTING_ROUTE_DEFINITIONS[6];
}

function deriveExperiences(game: AccountingGame) {
  const items = (game.specialExperiences ?? []).map((title) => ({ id: stableHash(title).toString(36), title }));
  const candidates: Array<[boolean, string]> = [
    [game.flags.includes("accounting_callback_entry"), "预付款没有关键词，分录还是写对了"],
    [game.flags.includes("accounting_callback_difference"), "Excel公式拖错四百行后成功救回"],
    [game.flags.includes("accounting_callback_anomaly"), "早一个月的记录牵出另外两笔"],
    [game.flags.includes("accounting_callback_template"), "Excel模板被整个小组继续使用"],
    [game.flags.includes("accounting_callback_analysis"), "从核算转向财务分析"],
    [game.flags.includes("accounting_callback_tax"), "税务与合规隐藏入口"],
    [game.flags.includes("accounting_callback_cross"), "运营面试先发现取消订单没剔除"],
    [game.flags.includes("accounting_callback_lowcost"), "唯一一个不用翻聊天记录的最终版"],
  ];
  for (const [hit, title] of candidates) if (hit && !items.some((item) => item.title === title)) items.push({ id: stableHash(title).toString(36), title });
  return items.slice(0, 10);
}

function proofLine(id: string) {
  return ({
    balance: "表差一分钱时，你查过 SUM 范围、舍入位数，也真的翻过原始记录。",
    timeline: "你不满足于最终数字，多次把合同、发票、付款和入账排回时间线。",
    excel: "你救过公式、版本和引用范围，还把修法留给了下一位。",
    closer: "截止时间一来，你会先把能关的账关掉，黄色格子留给明天继续追。",
    note: "别人说资料齐了，你通常还会数一遍合同、发票、付款截图到底各有几份。",
    team: "小组文件打架时，你经常负责合并、追问和最后一次检查。",
  } as Record<string, string>)[id];
}

function lockedHint(state: AccountingState, routeId: string) {
  const next = ACCOUNTING_ROUTE_DEFINITIONS
    .filter((route) => route.id !== routeId && !state.flags.includes(`accounting_closed_${route.id}`))
    .sort((a, b) => Number(state.routeScores?.[b.id] ?? 0) - Number(state.routeScores?.[a.id] ?? 0))[0];
  return next
    ? `你差一点走到“${next.title}”。下一局在大二课程项目或大三实习时换一个答案，那边会继续来找你。`
    : "这一局你关掉了不少高耗选项。下一局多追一次原始材料，或者别默认接下总表。";
}

function replayChallenge(routeId: string) {
  const copy: Record<string, string> = {
    audit: "下一局别从凭证追到底，试着把一张成本表讲给业务听。",
    enterprise: "下一局拒绝一次“先帮我过”，看看那张缺签字的单会不会自己回来。",
    cpa: "下一局暂停证书计划，去事务所或企业经历一次真实截止日。",
    tax: "下一局照去年的模板直接交，看看省下的四十分钟会以几小时返工回来。",
    analysis: "下一局只把账做平，不追问原因，体验另一种企业财务。",
    civil: "下一局先不打开岗位表，把两学期机会投给实习或证书。",
    survival: "下一局别把表退回组员，亲自收一次四个人的最终版。",
  };
  return copy[routeId] ?? "换几个答案，再把这四年对一遍。";
}

function deriveTrend(state: AccountingState) {
  const route = ACCOUNTING_ROUTE_DEFINITIONS
    .map((item) => ({ item, score: Number(state.routeScores?.[item.id] ?? 0) }))
    .sort((a, b) => b.score - a.score)[0].item;
  return `最近找上你的，多半是「${route.title}」那类事。下一张表还可能换个方向。`;
}

function committedRoute(state: AccountingState): AccountingRouteKey | null {
  if (state.flags.includes("accounting_analysis_entry")) return "analysis";
  if (state.flags.includes("accounting_tax_entry")) return "tax";
  if (state.flags.includes("accounting_survival_entry")) return "survival";
  for (const [flag, route] of [
    ["accounting_route_audit", "audit"], ["accounting_route_enterprise", "enterprise"],
    ["accounting_route_cpa", "cpa"], ["accounting_route_civil", "civil"],
  ] as const) if (state.flags.includes(flag)) return route;
  return null;
}

function applyStartTrait(state: AccountingState, id: string) {
  if (id === "calculator") { add(state.hiddenStats, "reviewPatience", 6); add(state.routeScores!, "audit", 2); }
  if (id === "excel") { add(state.hiddenStats, "excelSkill", 9); add(state.routeScores!, "analysis", 3); }
  if (id === "stable") { add(state.hiddenStats, "stablePreference", 9); add(state.routeScores!, "civil", 3); }
  if (id === "adjusted") { state.stats.energy = clamp(state.stats.energy + 5); add(state.hiddenStats, "boundarySense", 7); add(state.routeScores!, "survival", 4); }
}

function personaScore(state: AccountingState, first: string, second: string, proof: string) {
  const count = dim(state, `accountingProof_${proof}`);
  return dim(state, first) * 0.55 + dim(state, second) * 0.35 + Math.min(count, 3) * 10 + Math.max(0, count - 3) * 2;
}

function semesterKey(index: number) { return ["y1s1", "y1s2", "y2s1", "y2s2", "y3s1", "y3s2", "y4s1", "y4s2"][index]; }
function dim(state: AccountingState, key: string) { return Number(state.hiddenStats[key] ?? 0); }
function add(bag: Record<string, number>, key: string, value: number) { bag[key] = Number(bag[key] ?? 0) + value; }
function pushUnique<T>(list: T[], item: T) { if (!list.includes(item)) list.push(item); }
function clamp(value: number) { return Math.max(0, Math.min(100, Math.round(value))); }
function stableIndex(value: number, length: number) { return stableHash(String(value)) % length; }
function stableHash(value: string) {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}
