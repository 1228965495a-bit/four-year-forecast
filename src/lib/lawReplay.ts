import type {
  BehaviorVector,
  EmergingPortraitResult,
  LegacyExperienceSelection,
  NextLifeIntent,
  PreviousRunSummary,
  ReplayRunContext,
  ReplayTargetType,
} from "./replaySystem";
import { replayDistance } from "./replaySystem";

type LawReplayState = {
  majorId: string;
  semesterIdx: number;
  hiddenStats: Record<string, number>;
  routeScores?: Record<string, number>;
  flags: string[];
  seenEvents: string[];
  history: Array<{
    eventId?: string;
    choiceId?: string;
    title: string;
    choice: string;
    feedback: string;
  }>;
  specialExperiences?: string[];
  replayContext?: ReplayRunContext | null;
  shownPortraitIds?: string[];
};

export interface LawReplayRecommendation {
  targetType: ReplayTargetType;
  routeId: string;
  routeTitle: string;
  heading: string;
  explanation: string;
  actionLabel: string;
  targetBehaviorTags: string[];
  legacyExperience: LegacyExperienceSelection;
}

type PortraitConfig = {
  id: string;
  stage: "early" | "middle" | "late";
  title: string;
  description: string;
  evidenceText: string;
  tag: string;
  minCount: number;
  routeId?: string;
  priority: number;
  evolutionGroup?: string;
};

const PORTRAITS: PortraitConfig[] = [
  { id: "team_early", stage: "early", title: "习惯性补位", description: "没人接的任务，你通常会先伸手。", evidenceText: "你已经不止一次替别人把事情接到了自己手里。", tag: "responsibility", minCount: 1, priority: 8, evolutionGroup: "team_rescuer" },
  { id: "team_middle", stage: "middle", title: "群聊善后人", description: "大家开始默认，最后一版会由你整理。", evidenceText: "你连续两次接下了无人认领的收尾工作。", tag: "responsibility", minCount: 2, priority: 9, evolutionGroup: "team_rescuer" },
  { id: "team_late", stage: "late", title: "全组默认最终负责人", description: "任务还没分完，文件名里已经隐约出现了你的名字。", evidenceText: "你接过主辩、材料和最终版，队友已经学会只等交付。", tag: "responsibility", minCount: 3, priority: 10, evolutionGroup: "team_rescuer" },
  { id: "rule_early", stage: "early", title: "规则追问新手", description: "“大家一直这样”已经不能直接让你点头。", evidenceText: "你至少有一次先问规则和依据，再决定要不要照做。", tag: "rules", minCount: 1, priority: 8, evolutionGroup: "rule_questioner" },
  { id: "rule_middle", stage: "middle", title: "“依据呢”预备役", description: "结论还没说完，你已经在找它站在哪条规则上。", evidenceText: "课程讨论和现实任务里，你都要求过对方把依据补齐。", tag: "rules", minCount: 2, priority: 9, evolutionGroup: "rule_questioner" },
  { id: "rule_late", stage: "late", title: "惯例抗体携带者", description: "一句“以前都这么做”，现在只会触发你的下一轮追问。", evidenceText: "你反复核过规则、原始材料和时间线。", tag: "rules", minCount: 3, priority: 10, evolutionGroup: "rule_questioner" },
  { id: "escape_early", stage: "early", title: "逃生路线观察员", description: "课表还在更新，你保存的培养方案也没有删。", evidenceText: "你已经主动看过一次法学院之外的入口。", tag: "exploration", minCount: 1, priority: 8, evolutionGroup: "escape_mapper" },
  { id: "escape_middle", stage: "middle", title: "教务系统角落考古员", description: "别人看课程通知，你开始看转专业窗口几点关闭。", evidenceText: "你查过条件、材料或名额，不再只停留在一句想跑。", tag: "exploration", minCount: 2, priority: 9, evolutionGroup: "escape_mapper" },
  { id: "escape_late", stage: "late", title: "法学院逃生门测绘师", description: "走不走另说，哪扇门能推、几点开放，你已经画清楚了。", evidenceText: "你为转专业或跨行路线真正放弃过别的机会。", tag: "exploration", minCount: 3, priority: 10, evolutionGroup: "escape_mapper" },
  { id: "voice_early", stage: "early", title: "发言席试坐员", description: "被点名时还是会卡壳，但你开始把“分情况”说完整。", evidenceText: "你至少主动完成过一次课堂表达。", tag: "expression", minCount: 1, priority: 7, evolutionGroup: "public_voice" },
  { id: "voice_middle", stage: "middle", title: "临时主辩候补", description: "稿子出问题时，大家已经会先看你一眼。", evidenceText: "你在汇报或模拟法庭里救过一次场。", tag: "expression", minCount: 2, priority: 8, evolutionGroup: "public_voice" },
  { id: "voice_late", stage: "late", title: "全场默认你拿麦", description: "表达能力练出来了，麦也开始自动往你手里移动。", evidenceText: "你多次主动站到台前，也承担了公开表达的代价。", tag: "expression", minCount: 3, priority: 9, evolutionGroup: "public_voice" },
  { id: "academic", stage: "late", title: "“再深化一下”耐受者", description: "老师的一句“可以继续看看”，已经能让你自动新建第八版。", evidenceText: "你把有限时间反复投给论文、课题或老师推荐。", tag: "academic", minCount: 2, routeId: "academic", priority: 8 },
  { id: "firm", stage: "late", title: "律政剧删减片段亲历者", description: "检索、改稿和深夜消息没有劝退你，只把滤镜换成了工牌。", evidenceText: "你为真实实习入口放弃过比赛、课程或睡眠。", tag: "firm", minCount: 2, routeId: "firm", priority: 8 },
  { id: "civil", stage: "late", title: "焦虑表格化选手", description: "未来还没定，岗位条件和 Plan B 已经对齐。", evidenceText: "你把不确定拆成了报名日期、专业代码和备选方案。", tag: "planning", minCount: 2, routeId: "civil", priority: 8 },
  { id: "survival", stage: "middle", title: "低耗生存试验员", description: "你开始承认，有些机会可以不接，人也需要一起毕业。", evidenceText: "你主动放弃过一项成就，用来保住睡眠或精力。", tag: "boundary", minCount: 2, routeId: "survival", priority: 8 },
  { id: "detour", stage: "late", title: "跨行接口收藏家", description: "法律不一定做主业，但你正在把它装进另一种生活。", evidenceText: "你认真接触过一次法学之外的课程、岗位或机会。", tag: "detour", minCount: 2, routeId: "detour", priority: 8 },
];

const ROUTES = [
  { id: "academic", title: "学术牛马预服役线", vector: v(25, 75, 25, 55, 35, 55, 95, 45), tags: ["academic", "rules"], action: "下一把，真把这篇改完" },
  { id: "firm", title: "律所实习就业线", vector: v(60, 65, 55, 70, 45, 45, 55, 45), tags: ["firm", "planning"], action: "下一把，去看律政剧删掉的活" },
  { id: "civil", title: "考公考编线", vector: v(35, 95, 20, 55, 20, 95, 60, 55), tags: ["planning", "stability"], action: "下一把，把焦虑做成岗位表" },
  { id: "advocacy", title: "全场默认你主辩线", vector: v(95, 40, 65, 65, 55, 30, 55, 40), tags: ["expression", "responsibility"], action: "下一把，自己拿麦" },
  { id: "transfer", title: "法学院成功出逃线", vector: v(40, 75, 70, 30, 100, 20, 25, 80), tags: ["exploration", "boundary"], action: "下一把，把申请交上去" },
  { id: "survival", title: "法学院低空通关线", vector: v(25, 55, 20, 20, 40, 65, 25, 100), tags: ["boundary", "stability"], action: "下一把，不再全都要" },
  { id: "detour", title: "非典型跨行线", vector: v(55, 60, 75, 35, 95, 25, 35, 75), tags: ["detour", "exploration"], action: "下一把，看看法学之外" },
] as const;

const LEGACIES = [
  { id: "firm_reality", title: "见过律所真实版本", description: "再看到“深度参与业务”时，你会多问一句具体参与什么。", routeIds: ["firm"], tags: ["firm"] },
  { id: "team_warning", title: "认得出接锅前兆", description: "群聊沉默到第十五秒时，你已经知道接下来通常会发生什么。", routeIds: ["advocacy", "survival"], tags: ["responsibility", "boundary"] },
  { id: "door_map", title: "知道门在哪里", description: "你上次没走出去，但记住了申请时间、材料入口和教务处几点下班。", routeIds: ["transfer", "detour"], tags: ["exploration"] },
  { id: "revision_scale", title: "听得懂“再看看”", description: "老师说“再深化一下”时，你已经知道这是补两段，还是重写半篇。", routeIds: ["academic"], tags: ["academic", "rules"] },
  { id: "job_table", title: "见过岗位表的另一面", description: "岗位名称往后排，专业代码、应届限制和备注栏会先进入视线。", routeIds: ["civil"], tags: ["planning", "stability"] },
  { id: "voice_not_all", title: "知道表达不是全包", description: "麦可以接，另外三个人的任务不一定也要一起接。", routeIds: ["advocacy"], tags: ["expression", "boundary"] },
] as const;

const INTENT_OPTIONS: Record<string, Record<string, any>> = {
  law_y1s1_main_001: {
    transfer: replayOption("replay_transfer", "这次先查培养方案，再接亲戚的免费咨询", "二舅还在等答案，你先找到了转专业通知。亲情没有结束，默认路线先被你暂停。", ["exploration"], { transfer: 5 }),
    advocacy: replayOption("replay_voice", "先说明我还不会，再把能确认的事实讲清楚", "你没有装成律师，也没有直接退群。家庭群第一次听见一段有边界的完整发言。", ["expression", "boundary"], { advocacy: 4 }),
  },
  law_y1s2_main_004: {
    academic: replayOption("replay_academic", "把一个没听懂的问题记下来，课后真去问老师", "老师没有给标准答案，反而问你愿不愿意沿这个问题再读两篇。", ["academic", "rules"], { academic: 5 }),
    survival: replayOption("replay_survival", "先承认今天只听懂一半，不连夜补完整本书", "笔记少了六页，人没有少一晚睡眠。期末仍会来，但不是今晚。", ["boundary"], { survival: 5 }),
  },
  law_y2s1_main_007: {
    advocacy: replayOption("replay_explain", "把箭头讲给同桌听，哪里卡住就现场重画", "你讲到第三个箭头时自己先发现了漏洞。表达没有替你全包，反而逼你把关系理清。", ["expression", "rules"], { advocacy: 4, academic: 2 }),
  },
  law_y2s2_main_010: {
    transfer: replayOption("replay_exit", "听完课去查：别的专业到底在学什么", "刑法仍然上头，隔壁培养方案也第一次从网页变成了可比较的生活。", ["exploration"], { transfer: 5, detour: 2 }),
  },
  law_y3s1_main_013: {
    civil: replayOption("replay_plan", "不先买全套课，先把考试、岗位和时间冲突列出来", "纸箱没有立刻变小，但你终于知道哪几本今年根本不该拆封。", ["planning"], { civil: 5 }),
    survival: replayOption("replay_boundary", "只留这一阶段真会用的资料，其余先退", "门卫少搬两箱，你也第一次没有用购买重量证明决心。", ["boundary"], { survival: 5 }),
  },
  law_y3s2_route_016: {
    detour: replayOption("replay_detour", "先去看一场法学之外的招聘会", "四条标准路线还在，你先看见了第五种工牌。它不保证更轻松，只证明出口不止这张表。", ["detour", "exploration"], { detour: 8 }),
    survival: replayOption("replay_none", "不把四条路同时装进这一学期", "你划掉两项，只保留一个主方向和一个备选。少了一点气势，多了几晚睡眠。", ["boundary", "planning"], { survival: 7 }),
  },
  law_y4s1_main_019: {
    academic: replayOption("replay_finish", "先把一个小问题做完，不再给宇宙立法", "题目小到能被一篇本科论文装下。宏大感少了，第一版正文终于出现。", ["academic", "planning"], { academic: 7 }),
  },
  law_y4s2_main_022: {
    survival: replayOption("replay_scope", "先问清八个“为什么”里哪三个必须今晚回答", "导师圈了三个。剩下五个没有消失，但你终于不用在同一晚接受八次审判。", ["boundary", "expression"], { survival: 6 }),
  },
  law_resource_y1s2_002: {
    survival: replayOption("replay_assign", "这次不说“算了我来”，直接按人重新分工", "群里安静了二十秒。你没替大家结束沉默，代价是有人觉得你不够好说话。", ["boundary"], { survival: 7 }),
    advocacy: replayOption("replay_mic", "稿我来讲，但内容必须大家一起补齐", "你接下了麦，没有顺手接下另外三个人的工作。主辩和全包第一次被拆成两个岗位。", ["expression", "boundary"], { advocacy: 7 }),
  },
  law_resource_y2s2_001: {
    transfer: replayOption("replay_submit", "先把申请材料交进系统，再决定今晚练不练", "文件名终于不叫“再想想”。模拟法庭少了一晚训练，申请状态变成了已提交。", ["exploration", "planning"], { transfer: 9 }),
  },
  law_resource_y3s1_001: {
    firm: replayOption("replay_ask_work", "去面试，但先问实习每天具体做什么", "对方说完检索、改稿和装订，你还是投了简历。滤镜少了一层，决定反而更像自己的。", ["firm", "planning"], { firm: 8 }),
  },
};

const LEGACY_HINTS: Record<string, Record<string, string>> = {
  firm_reality: {
    law_resource_y3s1_001: "“参与核心业务”可能包括检索、改稿、装订和随时回复。你已经知道该问每天具体做什么。",
    law_y3s2_route_016: "律所入口不只看名字。带教方式、工作内容和反馈频率，上次已经让你交过学费。",
  },
  team_warning: {
    law_resource_y1s2_002: "群聊已经沉默到第十五秒。上一次，就是从这里开始，最终版变成了你的名字。",
    law_crisis_y2s2_moot_court: "“谁能先顶一下”后面，通常还跟着主辩、材料和打印。你认得这套开场。",
  },
  door_map: {
    law_y2s2_transfer_011: "你记得申请入口、材料清单和关窗时间。知道门在哪里，不代表这次一定推得开。",
    law_resource_y2s2_001: "转专业窗口只有七天。上一次真正耽误你的，不是想法，是材料开始得太晚。",
  },
  revision_scale: {
    law_y4s1_main_019: "题目太大时，后面的每一句“再缩小”都会重写目录。你已经见过这种返工规模。",
    law_y4s2_main_022: "八个“为什么”不一定同样紧急。先确认必须回应哪几个，和逃避修改不是一回事。",
  },
  job_table: {
    law_y3s2_route_016: "岗位名字写得再好看，也要先看专业代码、应届限制和备注栏。",
    law_resource_y3s2_003: "三个截止日期不能靠热血合并。你已经知道该先核条件，再精修材料。",
  },
  voice_not_all: {
    law_resource_y1s2_002: "拿麦和接下全组工作不是同一个动作。上一次你把它们一起做了。",
    law_y3s1_main_014: "主辩可以由你承担，证据目录、打印和队友的稿不必自动随麦附赠。",
  },
};

const OPENING_VARIANTS = [
  {
    id: "law_replay_opening_transfer",
    targetRouteIds: ["transfer", "detour"],
    majorId: "law",
    semester: "y1s1",
    type: "main",
    title: "报到第一天，你先在教务处门口停了一下",
    description: "上一局你很晚才知道培养方案还能比较。这一次，校园地图还没认全，你先看见了转专业咨询时间。新生群正在催你去领教材。",
    tags: ["二周目开局", "出口信息"],
    options: [
      replayOption("a", "先拍下时间和材料入口，再去领书", "你没有立刻逃跑，只是把门的位置保存了。新生教材照样很重。", ["exploration", "planning"], { transfer: 6 }),
      replayOption("b", "先去领书，晚上再认真比较培养方案", "通知没有被你划走。晚上十点，你第一次同时打开两张课表。", ["exploration"], { detour: 4 }),
      replayOption("c", "今天只报到，不替四年提前宣判", "窗口从眼前经过，你没有冲进去，也没有假装没看见。", ["boundary"], { survival: 3 }),
    ],
  },
  {
    id: "law_replay_opening_voice",
    targetRouteIds: ["advocacy"],
    majorId: "law",
    semester: "y1s1",
    type: "main",
    title: "新生破冰要求每人用三十秒说清为什么学法",
    description: "上一局你总把完整观点留到稿子里。这一次麦克风从第一排往后传，三十秒不够安全，也足够让人记住你。",
    tags: ["二周目开局", "表达"],
    options: [
      replayOption("a", "接过麦，讲一个真的想弄明白的问题", "没有宏大口号，只有一个具体问题。老师记住了问题，也记住了你的名字。", ["expression", "academic"], { advocacy: 6 }),
      replayOption("b", "讲完三十秒就停，不顺便承担主持", "你完成了发言，也把麦递给下一位。表达和全包第一次没有绑定出现。", ["expression", "boundary"], { advocacy: 4, survival: 2 }),
      replayOption("c", "先听别人说，最后只补一句", "你没有抢开场，但那句补充让前面三段发言突然连了起来。", ["rules"], { academic: 3 }),
    ],
  },
  {
    id: "law_replay_opening_academic",
    targetRouteIds: ["academic"],
    majorId: "law",
    semester: "y1s1",
    type: "main",
    title: "开学讲座结束，老师问有没有人愿意多留十分钟",
    description: "上一局那句“可以再深化一下”来得很晚。这一次老师手里已经有一份新生阅读清单，礼堂出口也已经打开。",
    tags: ["二周目开局", "学术入口"],
    options: [
      replayOption("a", "留下，先问清这十分钟会变成多少页", "老师笑了一下，递来三篇文章，不是三百篇。你第一次在答应前知道任务有多大。", ["academic", "boundary"], { academic: 7 }),
      replayOption("b", "留下听，但不当场承诺参加课题", "你拿到阅读清单，没有顺手签下一整个学期。", ["academic", "planning"], { academic: 4 }),
      replayOption("c", "今天先走，等真正有问题时再回来", "机会没有立刻变成成果，你也没有用一次留堂证明学术热情。", ["boundary"], { survival: 3 }),
    ],
  },
  {
    id: "law_replay_opening_plan",
    targetRouteIds: ["civil", "firm"],
    majorId: "law",
    semester: "y1s1",
    type: "main",
    title: "学院发来四年规划表，最后一栏写着就业去向",
    description: "上一局你到大三才把焦虑拆成表格。这一次，大一的空白单元格先摆在面前，班群已经有人写下律所和考公。",
    tags: ["二周目开局", "现实规划"],
    options: [
      replayOption("a", "不填梦想岗位，先写需要确认的三个条件", "表格看起来不够励志，却第一次能在下周继续使用。", ["planning", "rules"], { civil: 5 }),
      replayOption("b", "约学长聊一次真实实习，再回来填", "岗位名称暂时空着，检索、改稿和装订先进入了备注栏。", ["firm", "planning"], { firm: 6 }),
      replayOption("c", "只写本学期，不让十八岁替四年签字", "规划表少了远方豪言，多了一条能执行的本周安排。", ["boundary"], { survival: 4 }),
    ],
  },
  {
    id: "law_replay_opening_survival",
    targetRouteIds: ["survival"],
    majorId: "law",
    semester: "y1s1",
    type: "main",
    title: "开学第一周，五个学生组织同时欢迎你燃烧青春",
    description: "上一局你很晚才学会放弃。这一次，招新摊位把辩论、志愿、科研、宣传和模拟法庭一次摆齐，每个都说不会占太多时间。",
    tags: ["二周目开局", "边界"],
    options: [
      replayOption("a", "只留一个，其余当场说这学期不去", "你错过四次被学长学姐记住的机会，也保住了四个还没被预支的周末。", ["boundary"], { survival: 7 }),
      replayOption("b", "先问每周工时，再决定留哪一个", "三个摊位开始含糊，两个摊位给出了具体时间。选择突然容易了一点。", ["boundary", "rules"], { survival: 5 }),
      replayOption("c", "先全加群，三天后再退", "群聊数量迅速上涨。你仍有反悔权，只是通知栏已经开始收费。", ["exploration"], { detour: 3 }),
    ],
  },
] as const;

export const LAW_REPLAY_OPENING_EVENTS = OPENING_VARIANTS;
export const LAW_PORTRAIT_CHECKPOINTS = [2, 4, 6];

export function createLawReplayContext(
  intent: NextLifeIntent,
  previousRun: PreviousRunSummary,
  legacyExperience: LegacyExperienceSelection,
): ReplayRunContext {
  return {
    intent,
    previousRun,
    legacyExperience,
    shownPortraitIds: [],
    pendingPortraits: [],
    behaviorCounts: {},
    recentBehaviorTags: [],
    openingNovelCount: 0,
    completedEventCount: 0,
  };
}

export function pickLawReplayOpening(context: ReplayRunContext | null | undefined) {
  if (!context) return null;
  const eligible = OPENING_VARIANTS.filter((item) => item.targetRouteIds.includes(context.intent.targetRouteId as never));
  const candidates = eligible.length ? eligible : OPENING_VARIANTS;
  return candidates.find((item) => !context.previousRun.openingEventIds.includes(item.id))?.id ?? candidates[0].id;
}

export function recordLawReplayChoice(context: ReplayRunContext | null | undefined, choice: any) {
  if (!context) return;
  const tags = Array.isArray(choice?.replayTags) ? choice.replayTags : inferTags(choice);
  for (const tag of tags) context.behaviorCounts[tag] = Number(context.behaviorCounts[tag] ?? 0) + 1;
  context.recentBehaviorTags = [...context.recentBehaviorTags, ...tags].slice(-8);
  context.completedEventCount += 1;
}

export function decorateLawReplayEvent(state: LawReplayState, event: any) {
  const context = state.replayContext;
  if (!context || !event) return event;
  const previous = context.previousRun.choicesByEvent[event.id];
  const targetOptions = INTENT_OPTIONS[event.id] ?? {};
  const variant = targetOptions[context.intent.targetRouteId]
    ?? context.intent.targetBehaviorTags.map((tag) => targetOptions[tag]).find(Boolean);
  const options = [...(event.options ?? event.choices ?? [])];
  if (variant && !options.some((option) => option.id === variant.id)) options.push(variant);
  return {
    ...event,
    previousChoiceHint: previous
      ? { previousOptionText: previous.optionText, previousOutcomeSummary: previous.outcome }
      : null,
    legacyExperienceHint: LEGACY_HINTS[context.legacyExperience.id]?.[event.id] ?? null,
    isNewVariant: Boolean(variant),
    hasNewIntentOption: Boolean(variant),
    options,
    choices: options,
  };
}

export function deriveLawPortraits(state: LawReplayState, checkpoint: number): EmergingPortraitResult[] {
  const stage = checkpoint <= 2 ? "early" : checkpoint <= 4 ? "middle" : "late";
  const context = state.replayContext;
  const counts: Record<string, number> = context?.behaviorCounts ?? behaviorCountsFromState(state);
  const shown = new Set([...(state.shownPortraitIds ?? []), ...(context?.shownPortraitIds ?? [])]);
  const candidates = PORTRAITS
    .filter((item) => item.stage === stage && !shown.has(item.id))
    .map((item) => ({
      item,
      score: Number(counts[item.tag] ?? 0) * 10
        + Number(state.routeScores?.[item.routeId ?? ""] ?? 0)
        + item.priority,
    }))
    .filter(({ item }) => Number(counts[item.tag] ?? 0) >= item.minCount || Number(state.routeScores?.[item.routeId ?? ""] ?? 0) >= 8)
    .sort((a, b) => b.score - a.score);
  if (!candidates.length) {
    const latest = state.history[0];
    return latest ? [{
      id: `observed_${checkpoint}`,
      title: "选择开始留下形状",
      description: `这一年，你在“${latest.title}”里选择了“${latest.choice}”。`,
      evidenceText: "它还不是最终人格，但已经不是一次孤立的决定。",
    }] : [];
  }
  return candidates.slice(0, 2).map(({ item }) => ({
    id: item.id,
    title: item.title,
    description: item.description,
    evidenceText: item.evidenceText,
  }));
}

export function deriveLawReplayRecommendations(
  state: LawReplayState,
  currentRouteId: string,
  currentPersonaId: string,
  priorRuns: PreviousRunSummary[],
): [LawReplayRecommendation, LawReplayRecommendation] {
  const player = behaviorVectorFromState(state);
  const priorTargets = new Set(priorRuns.slice(-2).map((run) => run.routeId));
  const alternatives = ROUTES.filter((route) => route.id !== currentRouteId);
  const near = [...alternatives].sort((a, b) =>
    nearMissScore(state, b.id, priorTargets) - nearMissScore(state, a.id, priorTargets))[0];
  const opposite = [...alternatives].sort((a, b) => {
    const aScore = replayDistance(player, a.vector) + (priorTargets.has(a.id) ? -35 : 20);
    const bScore = replayDistance(player, b.vector) + (priorTargets.has(b.id) ? -35 : 20);
    return bScore - aScore;
  }).find((route) => route.id !== near.id) ?? alternatives[1];
  const latestChoice = [...state.history].find((item) => relevantToRoute(item, near.id))
    ?? state.history[0];
  const oppositeGap = describeOppositeGap(player, opposite.id);
  return [
    recommendation("near_miss", near, latestChoice
      ? `在“${latestChoice.title}”里，你选择了“${latestChoice.choice}”。那次分叉之后，你把更多时间投向了现在这条路。`
      : "这局没有留下足够完整的选择记录，因此这里只保留一个不带具体经历的复玩方向。"),
    recommendation("opposite", opposite, oppositeGap),
  ];

  function recommendation(
    targetType: ReplayTargetType,
    route: (typeof ROUTES)[number],
    explanation: string,
  ): LawReplayRecommendation {
    return {
      targetType,
      routeId: route.id,
      routeTitle: route.title,
      heading: targetType === "near_miss" ? "你差点活成的那个人" : "和你完全相反的那个人",
      explanation,
      actionLabel: route.action,
      targetBehaviorTags: [...route.tags],
      legacyExperience: chooseLegacy(route.id, route.tags, currentRouteId, currentPersonaId),
    };
  }
}

export function createNextLifeIntent(
  recommendation: LawReplayRecommendation,
  sourceRun: PreviousRunSummary,
): NextLifeIntent {
  return {
    majorId: "law",
    sourceRunId: sourceRun.runId,
    targetType: recommendation.targetType,
    targetRouteId: recommendation.routeId,
    targetBehaviorTags: recommendation.targetBehaviorTags,
    sourceMemoryIds: sourceRun.keyMemoryIds,
    selectedAt: Date.now(),
  };
}

export function buildLawPreviousRunSummary(
  state: LawReplayState,
  routeId: string,
  personaId: string,
): PreviousRunSummary {
  const chronological = [...state.history].reverse();
  const choicesByEvent: PreviousRunSummary["choicesByEvent"] = {};
  for (const item of chronological) {
    if (!item.eventId) continue;
    choicesByEvent[item.eventId] = {
      optionId: item.choiceId ?? "",
      optionText: item.choice,
      outcome: item.feedback,
    };
  }
  return {
    runId: `law-${Number(state.hiddenStats.lawRunSeed ?? 1)}-${simpleHash(
      chronological.map((item) => `${item.eventId}:${item.choiceId}`).join("|"),
    )}`,
    majorId: "law",
    openingEventIds: chronological.map((item) => item.eventId).filter(Boolean).slice(0, 3) as string[],
    seenEventIds: [...state.seenEvents],
    selectedOptionIds: chronological.map((item) => `${item.eventId}:${item.choiceId}`),
    choicesByEvent,
    routeId,
    personaId,
    keyMemoryIds: [...new Set([...state.flags, ...(state.specialExperiences ?? [])])].slice(-20),
    routeScores: { ...(state.routeScores ?? {}) },
    behaviorVector: behaviorVectorFromState(state),
    completedAt: Date.now(),
  };
}

export function behaviorVectorFromState(state: LawReplayState): BehaviorVector {
  const dim = (key: string) => clamp(Number(state.hiddenStats[key] ?? 50));
  const route = (key: string) => clamp(Number(state.routeScores?.[key] ?? 0) * 6);
  return {
    expression: dim("expression"),
    planning: dim("realityPlanning"),
    riskTaking: clamp(100 - dim("ambiguityTolerance") * 0.45 + route("detour") * 0.45),
    responsibility: dim("responsibility"),
    exploration: clamp(Number(state.hiddenStats.escape ?? 0) * 22 + route("detour") * 0.45),
    stability: clamp(route("civil") + dim("realityPlanning") * 0.35),
    academicDrive: clamp(dim("idealDrive") * 0.6 + route("academic") * 0.55),
    boundarySetting: clamp(100 - dim("responsibility") * 0.45 + route("survival") * 0.55),
  };
}

function behaviorCountsFromState(state: LawReplayState) {
  return {
    responsibility: Math.max(0, Math.round((Number(state.hiddenStats.responsibility ?? 50) - 50) / 6)),
    rules: Math.max(0, Math.round((Number(state.hiddenStats.ruleSensitivity ?? 50) - 50) / 6)),
    exploration: Math.max(0, Number(state.hiddenStats.escape ?? 0)),
    expression: Math.max(0, Math.round((Number(state.hiddenStats.expression ?? 50) - 50) / 6)),
    academic: Math.max(0, Math.round(Number(state.routeScores?.academic ?? 0) / 5)),
    firm: Math.max(0, Math.round(Number(state.routeScores?.firm ?? 0) / 5)),
    planning: Math.max(0, Math.round((Number(state.hiddenStats.realityPlanning ?? 50) - 50) / 6)),
    boundary: Math.max(0, Math.round(Number(state.routeScores?.survival ?? 0) / 4)),
    detour: Math.max(0, Math.round(Number(state.routeScores?.detour ?? 0) / 4)),
  };
}

function inferTags(choice: any) {
  const tags: string[] = [];
  const persona = choice?.effects?.lawPersona ?? {};
  const routes = choice?.effects?.lawRoutes ?? {};
  if (Number(persona.expression ?? 0) > 0) tags.push("expression");
  if (Number(persona.responsibility ?? 0) > 0) tags.push("responsibility");
  if (Number(persona.ruleSensitivity ?? 0) > 0 || Number(persona.evidence ?? 0) > 0) tags.push("rules");
  if (Number(persona.realityPlanning ?? 0) > 0) tags.push("planning");
  if (Number(persona.escape ?? 0) > 0 || Number(routes.transfer ?? 0) > 0) tags.push("exploration");
  if (Number(routes.academic ?? 0) > 0) tags.push("academic");
  if (Number(routes.firm ?? 0) > 0) tags.push("firm");
  if (Number(routes.survival ?? 0) > 0) tags.push("boundary");
  if (Number(routes.detour ?? 0) > 0) tags.push("detour");
  return [...new Set(tags)];
}

function replayOption(id: string, text: string, feedback: string, replayTags: string[], routes: Record<string, number>) {
  const persona: Record<string, number> = {};
  if (replayTags.includes("expression")) persona.expression = 7;
  if (replayTags.includes("responsibility")) persona.responsibility = 6;
  if (replayTags.includes("rules")) persona.ruleSensitivity = 7;
  if (replayTags.includes("planning")) persona.realityPlanning = 7;
  if (replayTags.includes("exploration")) persona.escape = 2;
  if (replayTags.includes("boundary")) persona.responsibility = -5;
  return {
    id,
    text,
    feedback,
    replayTags,
    isIntentOption: true,
    effects: {
      stats: { energy: replayTags.includes("boundary") ? 2 : -6 },
      lawResources: { professionalAccumulation: 2, opportunity: 0 },
      lawPersona: persona,
      lawRoutes: routes,
      flagsAdd: [`law_replay_choice_${id}`],
    },
  };
}

function chooseLegacy(routeId: string, tags: readonly string[], currentRouteId: string, currentPersonaId: string) {
  return LEGACIES.find((legacy) => legacy.routeIds.includes(routeId as never))
    ?? LEGACIES.find((legacy) => legacy.routeIds.includes(currentRouteId as never))
    ?? LEGACIES.find((legacy) => legacy.tags.some((tag) => tags.includes(tag)))
    ?? (currentPersonaId === "mediator" ? LEGACIES[1] : LEGACIES[3]);
}

function nearMissScore(state: LawReplayState, routeId: string, priorTargets: Set<string>) {
  const routeScore = Number(state.routeScores?.[routeId] ?? 0);
  const relevantChoices = state.history.filter((item) => relevantToRoute(item, routeId)).length;
  const reached = routeId === "transfer"
    ? Number(state.hiddenStats.escape ?? 0) * 8
    : routeId === "advocacy"
    ? Math.max(0, Number(state.hiddenStats.expression ?? 50) - 50)
    : 0;
  return routeScore * 10 + relevantChoices * 18 + reached - (priorTargets.has(routeId) ? 35 : 0);
}

function relevantToRoute(item: LawReplayState["history"][number], routeId: string) {
  const text = `${item.title}${item.choice}`;
  const patterns: Record<string, RegExp> = {
    academic: /论文|老师|课题|研究|考研|文献/,
    firm: /律所|实习|带教|合同|检索/,
    civil: /考公|岗位|职位表|稳定|法考/,
    advocacy: /主辩|模拟法庭|汇报|发言|辩论/,
    transfer: /转专业|培养方案|申请|教务/,
    survival: /睡眠|拒绝|最低|放弃|保住自己/,
    detour: /跨行|交换|别的专业|招聘会/,
  };
  return patterns[routeId]?.test(text) ?? false;
}

function describeOppositeGap(player: BehaviorVector, routeId: string) {
  if (routeId === "advocacy") return "这一局，你很少主动抢麦。课堂、汇报和模拟法庭里，你更习惯把内容准备好，再交给别人说。";
  if (routeId === "survival") return "这一局，你把论文、比赛、实习和小组工作接得太满。还有一种法学院人生，会主动放弃一部分成就，把人也一起带到毕业。";
  if (routeId === "transfer" || routeId === "detour") return "这一局，你几乎一直沿着法学院默认课表前进，很少认真看另一份培养方案或另一种工牌。";
  if (routeId === "academic") return "这一局，你很少为了一个问题反复改稿。老师的“可以再看看”，大多没有等到下一版。";
  if (routeId === "civil") return "这一局，你很少把不确定拆成岗位条件和时间表。很多决定留到了截止日前再说。";
  if (routeId === "firm") return "这一局，你很少主动走进真实工作现场。律所的检索、改稿和凌晨消息，还停留在别人的描述里。";
  return player.boundarySetting < 45 ? "这一局，你更习惯把事情接满。下一次可以试试只保住真正想要的部分。" : "这一局，你很少沿这条路持续投入。";
}

function v(
  expression: number, planning: number, riskTaking: number, responsibility: number,
  exploration: number, stability: number, academicDrive: number, boundarySetting: number,
): BehaviorVector {
  return { expression, planning, riskTaking, responsibility, exploration, stability, academicDrive, boundarySetting };
}

function clamp(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function simpleHash(value: string) {
  let hash = 2166136261;
  for (const char of value) {
    hash ^= char.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(36);
}
